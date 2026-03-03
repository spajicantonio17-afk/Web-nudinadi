import { getSupabase } from '@/lib/supabase'

const supabase = getSupabase()

export interface DbNotification {
  id: string
  user_id: string
  type: string
  title: string
  body: string | null
  data: Record<string, unknown>
  is_read: boolean
  created_at: string
}

// ─── Get User Notifications ──────────────────────────────

export async function getNotifications(userId: string, limit = 30, offset = 0): Promise<DbNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return (data ?? []) as DbNotification[]
}

// ─── Get Unread Count ────────────────────────────────────

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) throw error
  return count ?? 0
}

// ─── Mark as Read ────────────────────────────────────────

export async function markAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) throw error
}

// ─── Mark All as Read ────────────────────────────────────

export async function markAllAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) throw error
}

// ─── Delete Notification ─────────────────────────────────

export async function deleteNotification(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  if (error) throw error
}

// ─── Subscribe to Realtime Notifications ─────────────────

export function subscribeToNotifications(
  userId: string,
  onNew: (notification: DbNotification) => void
) {
  const channel = supabase
    .channel(`notifications_${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNew(payload.new as DbNotification)
      }
    )
    .subscribe()

  return channel
}

// ─── Unsubscribe ─────────────────────────────────────────

export function unsubscribeFromNotifications(userId: string) {
  const supabase2 = getSupabase()
  supabase2.removeChannel(
    supabase2.channel(`notifications_${userId}`)
  )
}
