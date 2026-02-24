'use client'

import { useEffect, useRef } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

type PostgresEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface UseRealtimeOptions<T> {
  table: string
  event?: PostgresEvent
  filter?: string
  onInsert?: (payload: T) => void
  onUpdate?: (payload: { old: T; new: T }) => void
  onDelete?: (payload: T) => void
  onChange?: (payload: { eventType: PostgresEvent; new: T; old: T }) => void
  enabled?: boolean
}

// Generic hook for subscribing to Supabase Realtime changes
export function useRealtime<T = Record<string, unknown>>({
  table,
  event = '*',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
  enabled = true,
}: UseRealtimeOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!enabled) return

    const supabase = getSupabase()
    const channelName = `realtime:${table}:${filter || 'all'}`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let channelBuilder = supabase.channel(channelName) as any

    const config: Record<string, string> = {
      event,
      schema: 'public',
      table,
    }
    if (filter) config.filter = filter

    channelBuilder = channelBuilder.on(
      'postgres_changes',
      config,
      (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => {
        const eventType = payload.eventType as PostgresEvent
        const newRecord = payload.new as T
        const oldRecord = payload.old as T

        onChange?.({ eventType, new: newRecord, old: oldRecord })

        if (eventType === 'INSERT') onInsert?.(newRecord)
        if (eventType === 'UPDATE') onUpdate?.({ old: oldRecord, new: newRecord })
        if (eventType === 'DELETE') onDelete?.(oldRecord)
      }
    )

    const channel = channelBuilder.subscribe() as RealtimeChannel

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [table, event, filter, enabled, onInsert, onUpdate, onDelete, onChange])

  return channelRef
}

// ─── Convenience Hooks ────────────────────────────────

// Subscribe to new messages in a conversation
export function useRealtimeMessages(
  conversationId: string | null,
  onNewMessage: (message: Record<string, unknown>) => void
) {
  return useRealtime({
    table: 'messages',
    event: 'INSERT',
    filter: conversationId ? `conversation_id=eq.${conversationId}` : undefined,
    onInsert: onNewMessage,
    enabled: !!conversationId,
  })
}

// Subscribe to product updates (new listings, status changes)
export function useRealtimeProducts(
  onProductChange: (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => void
) {
  return useRealtime({
    table: 'products',
    event: '*',
    onChange: onProductChange,
  })
}

// Subscribe to new conversations for a user
export function useRealtimeConversations(
  userId: string | null,
  onNewConversation: (conversation: Record<string, unknown>) => void
) {
  // Subscribe to conversations where user is either user1 or user2
  // Note: Supabase filter supports only one filter, so we listen to all
  // and filter client-side
  return useRealtime({
    table: 'conversations',
    event: 'INSERT',
    onInsert: (conv: Record<string, unknown>) => {
      if (conv.user1_id === userId || conv.user2_id === userId) {
        onNewConversation(conv)
      }
    },
    enabled: !!userId,
  })
}
