import { getSupabase } from '@/lib/supabase'
import type { Profile, ProfileUpdate } from '@/lib/database.types'

const supabase = getSupabase()

// ─── Get Profile ──────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

// ─── Get Profile by Username ──────────────────────────

export async function getProfileByUsername(username: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error) throw error
  return data
}

// ─── Update Profile ───────────────────────────────────

export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
  const result = await Promise.race([
    supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout: Profil-Update dauert zu lange.')), 10000)
    ),
  ])

  if (result.error) throw result.error
  if (!result.data) throw new Error('Keine Daten zurückgegeben. Profil konnte nicht aktualisiert werden.')
  return result.data
}

// ─── Check Username Availability ──────────────────────

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle()

  return !data
}

// ─── Get User Stats ───────────────────────────────────

export async function getUserStats(userId: string) {
  const [profile, productCount, reviewCount] = await Promise.all([
    getProfile(userId),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('seller_id', userId).eq('status', 'active'),
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('reviewed_user_id', userId),
  ])

  return {
    ...profile,
    activeListings: productCount.count ?? 0,
    totalReviews: reviewCount.count ?? 0,
  }
}

// ─── Search Users ─────────────────────────────────────

export async function searchUsers(query: string, limit = 10): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(limit)

  if (error) throw error
  return data
}
