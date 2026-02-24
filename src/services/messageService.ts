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
    .select('*, user1:profiles!user1_id(*), user2:profiles!user2_id(*)')
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
  return data
}

// ─── Mark Messages as Read ────────────────────────────

export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
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

// ─── Subscribe to New Messages (Realtime) ─────────────

export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: Message) => void
) {
  return supabase
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
    .subscribe()
}

// ─── Unsubscribe from Messages ────────────────────────

export function unsubscribeFromMessages(conversationId: string) {
  supabase.channel(`messages:${conversationId}`).unsubscribe()
}
