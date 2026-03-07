import { getSupabase } from '@/lib/supabase'
import type { DbNotification } from '@/services/notificationService'

const supabase = getSupabase()

// ─── Obavijesti Types (all notification types for the channel) ────

export type ObavjestiType =
  | 'oglas_published'
  | 'review_received'
  | 'sale_completed'
  | 'level_up'
  | 'new_message'
  | 'public_question'
  | 'verification_step'
  | 'fully_verified'
  | 'like_received'
  | 'price_drop_liked'
  | 'system'

// All types that appear in the Obavijesti channel
export const OBAVIJESTI_TYPES: string[] = [
  'oglas_published',
  'review_received',
  'sale_completed',
  'level_up',
  'new_message',
  'public_question',
  'verification_step',
  'fully_verified',
  'like_received',
  'price_drop_liked',
  'system',
]

// ─── Icon & Color Mapping ─────────────────────────────────────

export const OBAVIJESTI_ICON_MAP: Record<string, string> = {
  oglas_published: 'fa-plus-circle',
  review_received: 'fa-star',
  sale_completed: 'fa-handshake',
  level_up: 'fa-arrow-up',
  new_message: 'fa-comment-dots',
  public_question: 'fa-circle-question',
  verification_step: 'fa-shield-halved',
  fully_verified: 'fa-circle-check',
  like_received: 'fa-heart',
  price_drop_liked: 'fa-tag',
  system: 'fa-bell',
}

export const OBAVIJESTI_COLOR_MAP: Record<string, string> = {
  oglas_published: 'text-blue-400 bg-blue-500/10',
  review_received: 'text-yellow-400 bg-yellow-500/10',
  sale_completed: 'text-emerald-400 bg-emerald-500/10',
  level_up: 'text-amber-400 bg-amber-500/10',
  new_message: 'text-blue-400 bg-blue-500/10',
  public_question: 'text-purple-400 bg-purple-500/10',
  verification_step: 'text-cyan-400 bg-cyan-500/10',
  fully_verified: 'text-emerald-400 bg-emerald-500/10',
  like_received: 'text-pink-400 bg-pink-500/10',
  price_drop_liked: 'text-emerald-400 bg-emerald-500/10',
  system: 'text-purple-400 bg-purple-500/10',
}

// ─── Navigation Link Builder ──────────────────────────────────

export function getObavjestiLink(notification: DbNotification): string | undefined {
  const data = notification.data || {}
  const type = notification.type

  switch (type) {
    case 'oglas_published':
    case 'public_question':
    case 'like_received':
    case 'price_drop_liked':
      return data.product_id ? `/product/${data.product_id}` : undefined

    case 'review_received':
      return data.reviewer_username ? `/user/${data.reviewer_username}` : '/profile'

    case 'sale_completed':
      return data.product_id ? `/product/${data.product_id}` : undefined

    case 'level_up':
      return '/profile/level'

    case 'new_message':
      return '/messages'

    case 'verification_step':
    case 'fully_verified':
      return '/profile'

    default:
      return undefined
  }
}

// ─── Fetch Obavijesti Notifications ───────────────────────────

export async function getObavijesti(
  userId: string,
  limit = 50,
  offset = 0
): Promise<DbNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .in('type', OBAVIJESTI_TYPES)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return (data ?? []) as DbNotification[]
}

// ─── Get Unread Obavijesti Count ──────────────────────────────

export async function getUnreadObavjestiCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)
    .in('type', OBAVIJESTI_TYPES)

  if (error) throw error
  return count ?? 0
}

// ─── Mark Obavijest as Read ───────────────────────────────────

export async function markObavijestAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) throw error
}

// ─── Mark All Obavijesti as Read ──────────────────────────────

export async function markAllObavjestiAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
    .in('type', OBAVIJESTI_TYPES)

  if (error) throw error
}

// ─── Subscribe to Realtime Obavijesti ─────────────────────────

export function subscribeToObavijesti(
  userId: string,
  onNew: (notification: DbNotification) => void
) {
  const channel = supabase
    .channel(`obavijesti_${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const notif = payload.new as DbNotification
        if (OBAVIJESTI_TYPES.includes(notif.type)) {
          onNew(notif)
        }
      }
    )
    .subscribe()

  return channel
}

// ─── Unsubscribe from Obavijesti ──────────────────────────────

export function unsubscribeFromObavijesti(userId: string) {
  const sb = getSupabase()
  sb.removeChannel(sb.channel(`obavijesti_${userId}`))
}

// ─── Time Formatting (Bosnian) ────────────────────────────────

export function formatObavjestiTime(createdAt: string): string {
  const now = new Date()
  const date = new Date(createdAt)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Upravo sada'
  if (diffMins < 60) return `Prije ${diffMins} min`
  if (diffHours < 24) return `Prije ${diffHours} ${diffHours === 1 ? 'sat' : diffHours < 5 ? 'sata' : 'sati'}`

  // Same day
  if (date.toDateString() === now.toDateString()) {
    return `Danas, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  // Yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `Jucer, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  if (diffDays < 7) return `Prije ${diffDays} dana`
  if (diffDays < 30) return `Prije ${Math.floor(diffDays / 7)} sedmica`
  return `Prije ${Math.floor(diffDays / 30)} mjeseci`
}
