import { getSupabase } from '@/lib/supabase'
import type { ActivityType, UserActivity } from '@/lib/database.types'
import { XP_REWARDS, calculateLevel, xpForNextLevel } from '@/lib/database.types'

const supabase = getSupabase()

// ─── Log Activity & Earn XP ──────────────────────────

export async function logActivity(
  userId: string,
  activityType: ActivityType,
  metadata?: { rating?: number }
): Promise<UserActivity> {
  const xpAmount = getXpForActivity(activityType, metadata)

  const { data, error } = await supabase
    .from('user_activities')
    .insert({
      user_id: userId,
      activity_type: activityType,
      xp_earned: xpAmount,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Get XP Amount for Activity Type ──────────────────

function getXpForActivity(type: ActivityType, metadata?: { rating?: number }): number {
  switch (type) {
    case 'upload': return XP_REWARDS.upload
    case 'sale': return XP_REWARDS.sale
    case 'review': {
      const stars = metadata?.rating || 5
      return XP_REWARDS.review_by_stars[stars] ?? 15
    }
    case 'login': return XP_REWARDS.daily_login
    case 'verification': return XP_REWARDS.verification
    default: return 0
  }
}

// ─── Log Verification XP (one-time) ──────────────────

export async function logVerificationXp(userId: string): Promise<boolean> {
  // Check if already awarded
  const { data } = await supabase
    .from('user_activities')
    .select('id')
    .eq('user_id', userId)
    .eq('activity_type', 'verification')
    .maybeSingle()

  if (data) return false // Already awarded

  await logActivity(userId, 'verification')
  return true
}

// ─── Get User Level Info ──────────────────────────────

export async function getUserLevelInfo(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('xp, level')
    .eq('id', userId)
    .single()

  if (error) throw error

  const progress = xpForNextLevel(data.xp)

  return {
    level: data.level,
    xp: data.xp,
    calculatedLevel: calculateLevel(data.xp),
    ...progress,
  }
}

// ─── Get Activity History ─────────────────────────────

export async function getActivityHistory(userId: string, limit = 20): Promise<UserActivity[]> {
  const { data, error } = await supabase
    .from('user_activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

// ─── Check Daily Login (prevent duplicate XP) ─────────

export async function logDailyLogin(userId: string): Promise<boolean> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Check if already logged in today
  const { data } = await supabase
    .from('user_activities')
    .select('id')
    .eq('user_id', userId)
    .eq('activity_type', 'login')
    .gte('created_at', today.toISOString())
    .maybeSingle()

  if (data) return false // Already logged in today

  await logActivity(userId, 'login')
  return true
}

// Re-export helpers for use in components
export { calculateLevel, xpForNextLevel, XP_REWARDS, LEVEL_THRESHOLDS } from '@/lib/database.types'
