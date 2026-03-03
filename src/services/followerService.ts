import { getSupabase } from '@/lib/supabase'
import type { Profile } from '@/lib/database.types'

const supabase = getSupabase()

// ─── Follow a User ───────────────────────────────────────

export async function followUser(followerId: string, followedId: string): Promise<void> {
  const { error } = await supabase
    .from('user_followers')
    .insert({ follower_id: followerId, followed_id: followedId })

  if (error) throw error
}

// ─── Unfollow a User ─────────────────────────────────────

export async function unfollowUser(followerId: string, followedId: string): Promise<void> {
  const { error } = await supabase
    .from('user_followers')
    .delete()
    .eq('follower_id', followerId)
    .eq('followed_id', followedId)

  if (error) throw error
}

// ─── Check if Following ──────────────────────────────────

export async function isFollowing(followerId: string, followedId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_followers')
    .select('id')
    .eq('follower_id', followerId)
    .eq('followed_id', followedId)
    .maybeSingle()

  return !!data
}

// ─── Get Followers of a User ─────────────────────────────

export async function getFollowers(userId: string, limit = 20, offset = 0): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('user_followers')
    .select('follower:profiles!follower_id(*)')
    .eq('followed_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return (data ?? []).map((d: Record<string, unknown>) => d.follower) as unknown as Profile[]
}

// ─── Get Users that a User Follows ───────────────────────

export async function getFollowing(userId: string, limit = 20, offset = 0): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('user_followers')
    .select('followed:profiles!followed_id(*)')
    .eq('follower_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return (data ?? []).map((d: Record<string, unknown>) => d.followed) as unknown as Profile[]
}

// ─── Get Follower Count ──────────────────────────────────

export async function getFollowerCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('user_followers')
    .select('id', { count: 'exact', head: true })
    .eq('followed_id', userId)

  if (error) throw error
  return count ?? 0
}

// ─── Get Following Count ─────────────────────────────────

export async function getFollowingCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('user_followers')
    .select('id', { count: 'exact', head: true })
    .eq('follower_id', userId)

  if (error) throw error
  return count ?? 0
}
