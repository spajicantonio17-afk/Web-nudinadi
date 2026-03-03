import { getSupabase } from '@/lib/supabase'
import type { Profile } from '@/lib/database.types'

const supabase = getSupabase()

// ─── Block a User ────────────────────────────────────

export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await supabase
    .from('user_blocks')
    .insert({ blocker_id: blockerId, blocked_id: blockedId })

  if (error) throw error
}

// ─── Unblock a User ──────────────────────────────────

export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await supabase
    .from('user_blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId)

  if (error) throw error
}

// ─── Check if blocker has blocked blockedId ──────────

export async function isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_blocks')
    .select('id')
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId)
    .maybeSingle()

  return !!data
}

// ─── Check if either user blocked the other ──────────

export async function isBlockedByEither(userId1: string, userId2: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_blocks')
    .select('id')
    .or(
      `and(blocker_id.eq.${userId1},blocked_id.eq.${userId2}),` +
      `and(blocker_id.eq.${userId2},blocked_id.eq.${userId1})`
    )
    .limit(1)

  return (data?.length ?? 0) > 0
}

// ─── Get all blocked user profiles ───────────────────

export async function getBlockedUsers(blockerId: string): Promise<(Profile & { blockedAt: string })[]> {
  const { data, error } = await supabase
    .from('user_blocks')
    .select('blocked_id, created_at, blocked:profiles!blocked_id(*)')
    .eq('blocker_id', blockerId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map((row: Record<string, unknown>) => ({
    ...(row.blocked as Profile),
    blockedAt: row.created_at as string,
  }))
}

// ─── Get blocked user IDs (fast for filtering) ──────

export async function getBlockedUserIds(blockerId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_blocks')
    .select('blocked_id')
    .eq('blocker_id', blockerId)

  if (error) throw error
  return (data || []).map((row: { blocked_id: string }) => row.blocked_id)
}
