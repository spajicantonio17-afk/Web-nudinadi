import { getSupabase } from '@/lib/supabase'
import type { Profile, BusinessTeamMember, BusinessTeamMemberWithProfile, ProductInsert, Product } from '@/lib/database.types'

const supabase = getSupabase()

// ─── Business Profile ────────────────────────────────────

export async function updateBusinessProfile(userId: string, data: {
  company_name?: string | null;
  company_logo?: string | null;
  banner_image?: string | null;
  business_address?: string | null;
  business_hours?: Record<string, string> | null;
  business_category?: string | null;
  website_url?: string | null;
}): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', userId)

  if (error) throw error
}

// ─── Team Management ─────────────────────────────────────

export async function getTeamMembers(businessUserId: string): Promise<BusinessTeamMemberWithProfile[]> {
  const { data, error } = await supabase
    .from('business_team_members')
    .select('*, member:profiles!member_user_id(*)')
    .eq('business_user_id', businessUserId)
    .order('role', { ascending: true })

  if (error) throw error
  return (data ?? []) as unknown as BusinessTeamMemberWithProfile[]
}

export async function inviteTeamMember(
  businessUserId: string,
  memberUserId: string,
  role: 'admin' | 'member' = 'member'
): Promise<BusinessTeamMember> {
  const { data, error } = await supabase
    .from('business_team_members')
    .insert({
      business_user_id: businessUserId,
      member_user_id: memberUserId,
      role,
    })
    .select()
    .single()

  if (error) throw error
  return data as BusinessTeamMember
}

export async function removeTeamMember(businessUserId: string, memberId: string): Promise<void> {
  const { error } = await supabase
    .from('business_team_members')
    .delete()
    .eq('business_user_id', businessUserId)
    .eq('id', memberId)

  if (error) throw error
}

export async function updateTeamMemberRole(
  businessUserId: string,
  memberId: string,
  role: 'admin' | 'member'
): Promise<void> {
  const { error } = await supabase
    .from('business_team_members')
    .update({ role })
    .eq('business_user_id', businessUserId)
    .eq('id', memberId)

  if (error) throw error
}

export async function findUserByEmail(emailOrUsername: string): Promise<Profile | null> {
  // Versuch 1: Per Email via RPC
  if (emailOrUsername.includes('@')) {
    const { data: userId } = await supabase.rpc('get_user_id_by_email', { p_email: emailOrUsername });
    if (userId) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (data) return data as Profile;
    }
  }

  // Versuch 2: Per Username (exakter Match, case-insensitive)
  const { data: byUsername } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', emailOrUsername)
    .maybeSingle();

  return (byUsername as Profile) ?? null;
}

// ─── My Invitations (for invited users) ─────────────────

export async function getMyInvitations(userId: string): Promise<Array<BusinessTeamMemberWithProfile & { business?: Profile }>> {
  const { data, error } = await supabase
    .from('business_team_members')
    .select('*, business:profiles!business_user_id(*)')
    .eq('member_user_id', userId)
    .is('accepted_at', null)
    .order('invited_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as Array<BusinessTeamMemberWithProfile & { business?: Profile }>
}

export async function acceptInvitation(invitationId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('business_team_members')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invitationId)
    .eq('member_user_id', userId)

  if (error) throw error
}

export async function rejectInvitation(invitationId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('business_team_members')
    .delete()
    .eq('id', invitationId)
    .eq('member_user_id', userId)

  if (error) throw error
}

// ─── Analytics ───────────────────────────────────────────

export async function getBusinessStats(userId: string): Promise<{
  totalViews30d: number;
  totalFavorites30d: number;
  activeListings: number;
  soldItems30d: number;
}> {
  // Get active products with views/favorites
  const { data: activeProducts, count: activeCount } = await supabase
    .from('products')
    .select('views_count, favorites_count', { count: 'exact' })
    .eq('seller_id', userId)
    .eq('status', 'active')

  const totalViews = (activeProducts ?? []).reduce((s, p) => s + (p.views_count || 0), 0)
  const totalFavorites = (activeProducts ?? []).reduce((s, p) => s + (p.favorites_count || 0), 0)

  // Get sold items in last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { count: soldCount } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('seller_id', userId)
    .eq('status', 'sold')
    .gte('updated_at', thirtyDaysAgo.toISOString())

  return {
    totalViews30d: totalViews,
    totalFavorites30d: totalFavorites,
    activeListings: activeCount ?? 0,
    soldItems30d: soldCount ?? 0,
  }
}

export async function getTopProducts(userId: string, limit = 5): Promise<Array<{
  id: string; title: string; images: string[]; views_count: number; favorites_count: number; status: string;
}>> {
  const { data, error } = await supabase
    .from('products')
    .select('id, title, images, views_count, favorites_count, status')
    .eq('seller_id', userId)
    .eq('status', 'active')
    .order('views_count', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as Array<{
    id: string; title: string; images: string[]; views_count: number; favorites_count: number; status: string;
  }>
}

export function exportProductsCsv(products: Array<{
  title: string; price: number; category?: string; condition: string; status: string;
  views_count: number; favorites_count: number; created_at: string;
}>): string {
  const header = 'Naslov,Cijena (€),Kategorija,Stanje,Status,Pregledi,Favoriti,Datum objave'
  const rows = products.map(p =>
    `"${p.title.replace(/"/g, '""')}",${p.price},"${p.category || ''}","${p.condition}","${p.status}",${p.views_count},${p.favorites_count},"${new Date(p.created_at).toLocaleDateString('bs-BA')}"`
  )
  return [header, ...rows].join('\n')
}

// ─── Bulk Create ─────────────────────────────────────────

export async function bulkCreateProducts(userId: string, products: ProductInsert[]): Promise<Product[]> {
  const results: Product[] = []

  // Create products sequentially to respect rate limits and triggers
  for (const product of products) {
    const { data, error } = await supabase
      .from('products')
      .insert({ ...product, seller_id: userId })
      .select()
      .single()

    if (error) throw error
    results.push(data as Product)
  }

  return results
}
