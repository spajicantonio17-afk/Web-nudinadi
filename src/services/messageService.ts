import { getSupabase } from '@/lib/supabase'
import { subscribeWithReconnect, type ReconnectHandle } from '@/lib/realtime-reconnect'
import type { RealtimeChannel } from '@supabase/supabase-js'
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
  const res = await fetch('/api/messages/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversation_id: message.conversation_id,
      content: message.content,
      image_url: message.image_url,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Greška pri slanju poruke.')
  }

  const data: Message = await res.json()

  // Fire & forget email notification
  void supabase
    .from('conversations')
    .select('user1_id, user2_id, product_id')
    .eq('id', message.conversation_id)
    .single()
    .then(({ data: conv }) => {
      if (!conv) return
      const receiverId = conv.user1_id === message.sender_id ? conv.user2_id : conv.user1_id
      void fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'new_message', recipientId: receiverId, productId: conv.product_id }),
      })
    })

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
//
// Channel instances are retained in module-level maps so that
// unsubscribe/track/untrack operate on the LIVE channel.
// (`supabase.channel(name)` always CREATES a new channel — calling it in an
// unsubscribe path leaks the real subscription and detaches typing presence.)
// All subscriptions go through subscribeWithReconnect so a dead websocket
// (backgrounded tab, network drop) resubscribes automatically.

const messageSubs = new Map<string, ReconnectHandle>()
const typingSubs = new Map<string, ReconnectHandle>()
const typingChannels = new Map<string, RealtimeChannel>()

export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: Message) => void,
  onMessageUpdated?: (message: Message) => void
) {
  // Replace any previous subscription for this conversation
  messageSubs.get(conversationId)?.unsubscribe()

  const handle = subscribeWithReconnect(`messages:${conversationId}`, () => {
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

    return channel
  })

  const wrapped: ReconnectHandle = {
    unsubscribe() {
      handle.unsubscribe()
      if (messageSubs.get(conversationId) === wrapped) messageSubs.delete(conversationId)
    },
  }
  messageSubs.set(conversationId, wrapped)
  return wrapped
}

// ─── Unsubscribe from Messages ────────────────────────

export function unsubscribeFromMessages(conversationId: string) {
  messageSubs.get(conversationId)?.unsubscribe()
}

// ─── Typing Presence ──────────────────────────────────

export function subscribeToTyping(
  conversationId: string,
  myUserId: string,
  onTypingChange: (typingUserIds: string[]) => void
) {
  typingSubs.get(conversationId)?.unsubscribe()

  const handle = subscribeWithReconnect(`typing:${conversationId}`, () => {
    const channel = supabase.channel(`typing:${conversationId}`)
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const typingUserIds = Object.values(state)
        .flat()
        .filter((p: Record<string, unknown>) => p.user_id !== myUserId && p.typing)
        .map((p: Record<string, unknown>) => p.user_id as string)
      onTypingChange(typingUserIds)
    })
    // Keep the map pointed at the LIVE channel (factory re-runs on reconnect)
    typingChannels.set(conversationId, channel)
    return channel
  })

  const wrapped: ReconnectHandle = {
    unsubscribe() {
      handle.unsubscribe()
      typingChannels.delete(conversationId)
      if (typingSubs.get(conversationId) === wrapped) typingSubs.delete(conversationId)
    },
  }
  typingSubs.set(conversationId, wrapped)
  return wrapped
}

export function sendTypingStatus(conversationId: string, userId: string) {
  const channel = typingChannels.get(conversationId)
  if (!channel) return
  channel.track({ user_id: userId, typing: true }).catch(() => {
    // presence push failed (channel mid-reconnect) — typing is transient, ignore
  })
}

export function clearTypingStatus(conversationId: string) {
  const channel = typingChannels.get(conversationId)
  if (!channel) return
  channel.untrack().catch(() => {
    // presence push failed — ignore
  })
}

export function unsubscribeFromTyping(conversationId: string) {
  typingSubs.get(conversationId)?.unsubscribe()
}
