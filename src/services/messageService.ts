import { getSupabase } from '@/lib/supabase'
import type {
  Conversation, ConversationWithUsers,
  Message, MessageInsert, MessageWithSender,
} from '@/lib/database.types'

const supabase = getSupabase()

// ─── Get User's Conversations ─────────────────────────

export async function getConversations(userId: string): Promise<ConversationWithUsers[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*, user1:profiles!user1_id(*), user2:profiles!user2_id(*), product:products!product_id(id, title, price, images, status)')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  if (error) throw error
  return data as unknown as ConversationWithUsers[]
}

// ─── Get or Create Conversation ───────────────────────

export async function getOrCreateConversation(
  currentUserId: string,
  otherUserId: string,
  productId?: string
): Promise<Conversation> {
  // Check if conversation already exists
  let query = supabase
    .from('conversations')
    .select('*')
    .or(
      `and(user1_id.eq.${currentUserId},user2_id.eq.${otherUserId}),` +
      `and(user1_id.eq.${otherUserId},user2_id.eq.${currentUserId})`
    )

  if (productId) {
    query = query.eq('product_id', productId)
  }

  const { data: existing } = await query.maybeSingle()

  if (existing) return existing

  // Create new conversation
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user1_id: currentUserId,
      user2_id: otherUserId,
      product_id: productId || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Get Messages for Conversation ────────────────────

export async function getMessages(conversationId: string, limit = 50, offset = 0): Promise<MessageWithSender[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:profiles!sender_id(*)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data as unknown as MessageWithSender[]
}

// ─── Send Message ─────────────────────────────────────

export async function sendMessage(message: MessageInsert): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single()

  if (error) throw error

  // Fire & forget email notification — look up receiver from conversation
  Promise.resolve(
    supabase
      .from('conversations')
      .select('user1_id, user2_id, product_id')
      .eq('id', message.conversation_id)
      .single()
  ).then(({ data: conv }) => {
    if (!conv) return
    const receiverId = conv.user1_id === message.sender_id ? conv.user2_id : conv.user1_id
    fetch('/api/notifications/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'new_message', recipientId: receiverId, productId: conv.product_id }),
    }).catch(() => {/* non-critical */})
  }).catch(() => {/* non-critical */})

  return data
}

// ─── Mark Messages as Read ────────────────────────────

export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('is_read', false)

  if (error) throw error
}

// ─── Get Unread Count ─────────────────────────────────

export async function getUnreadCount(userId: string): Promise<number> {
  // Get all conversation IDs where user is a participant
  const { data: convos } = await supabase
    .from('conversations')
    .select('id')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)

  if (!convos || convos.length === 0) return 0

  const convoIds = convos.map(c => c.id)

  const { count, error } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .in('conversation_id', convoIds)
    .neq('sender_id', userId)
    .eq('is_read', false)

  if (error) throw error
  return count ?? 0
}

// ─── Get Unread Counts per Conversation ──────────────

export async function getUnreadCounts(
  userId: string,
  conversationIds: string[]
): Promise<Record<string, number>> {
  if (conversationIds.length === 0) return {}

  const { data, error } = await supabase
    .from('messages')
    .select('conversation_id')
    .in('conversation_id', conversationIds)
    .neq('sender_id', userId)
    .eq('is_read', false)

  if (error) throw error

  const counts: Record<string, number> = {}
  for (const row of data || []) {
    counts[row.conversation_id] = (counts[row.conversation_id] || 0) + 1
  }
  return counts
}

// ─── Subscribe to New Messages (Realtime) ─────────────

export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: Message) => void,
  onMessageUpdated?: (message: Message) => void
) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onNewMessage(payload.new as Message)
      }
    )

  if (onMessageUpdated) {
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessageUpdated(payload.new as Message)
      }
    )
  }

  return channel.subscribe()
}

// ─── Unsubscribe from Messages ────────────────────────

export function unsubscribeFromMessages(conversationId: string) {
  supabase.channel(`messages:${conversationId}`).unsubscribe()
}

// ─── Typing Presence ──────────────────────────────────

export function subscribeToTyping(
  conversationId: string,
  myUserId: string,
  onTypingChange: (typingUserIds: string[]) => void
) {
  const channel = supabase.channel(`typing:${conversationId}`)
  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const typingUserIds = Object.values(state)
        .flat()
        .filter((p: Record<string, unknown>) => p.user_id !== myUserId && p.typing)
        .map((p: Record<string, unknown>) => p.user_id as string)
      onTypingChange(typingUserIds)
    })
    .subscribe()
  return channel
}

export function sendTypingStatus(conversationId: string, userId: string) {
  const channel = supabase.channel(`typing:${conversationId}`)
  channel.track({ user_id: userId, typing: true })
}

export function clearTypingStatus(conversationId: string) {
  const channel = supabase.channel(`typing:${conversationId}`)
  channel.untrack()
}

export function unsubscribeFromTyping(conversationId: string) {
  supabase.channel(`typing:${conversationId}`).unsubscribe()
}
