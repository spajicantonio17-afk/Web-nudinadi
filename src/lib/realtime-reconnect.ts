import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabase } from '@/lib/supabase'

/**
 * Auto-reconnect wrapper for Supabase Realtime channels.
 *
 * Why: when a tab is backgrounded for a while (~30min), the browser throttles
 * timers, the realtime websocket heartbeat stops and the channel silently dies.
 * Without handling, chat/notifications never receive events again until a full
 * page reload — the app looks "frozen".
 *
 * Design notes (each guards against a specific failure mode):
 * - `buildChannel` is a FACTORY: supabase-js expects a FRESH channel object
 *   after a close — resubscribing a closed channel instance is unsupported.
 * - Capped exponential backoff with a max attempt count — no unbounded retry
 *   loops hammering a server that is down.
 * - A single `document`-level visibilitychange listener (the event does not
 *   fire on `window` in all browsers) revives any dead channel as soon as the
 *   user returns to the tab, resetting the backoff.
 * - `closed` flag is set BEFORE teardown on manual unsubscribe, and every
 *   status callback checks it plus `entry.current === channel`, so callbacks
 *   from torn-down channels can never schedule retries (stale-closure guard).
 */

interface Entry {
  buildChannel: () => RealtimeChannel
  current: RealtimeChannel | null
  status: 'pending' | 'subscribed' | 'dead'
  attempts: number
  retryTimer: ReturnType<typeof setTimeout> | null
  closed: boolean
}

const registry = new Map<string, Entry>()
let visibilityHookInstalled = false

const MAX_ATTEMPTS = 6
const BASE_DELAY_MS = 1000
const MAX_DELAY_MS = 30000

function installVisibilityHook() {
  if (visibilityHookInstalled || typeof document === 'undefined') return
  visibilityHookInstalled = true
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return
    for (const [key, entry] of registry) {
      if (!entry.closed && entry.status !== 'subscribed') {
        entry.attempts = 0
        resubscribe(key, entry)
      }
    }
  })
}

function teardownChannel(entry: Entry) {
  if (entry.retryTimer) {
    clearTimeout(entry.retryTimer)
    entry.retryTimer = null
  }
  if (entry.current) {
    const old = entry.current
    entry.current = null
    try {
      getSupabase().removeChannel(old)
    } catch {
      // channel already gone — nothing to clean up
    }
  }
}

function resubscribe(key: string, entry: Entry) {
  if (entry.closed) return
  teardownChannel(entry)
  entry.status = 'pending'

  const channel = entry.buildChannel()
  entry.current = channel

  channel.subscribe((status) => {
    // Ignore callbacks from channels we already tore down / replaced
    if (entry.closed || entry.current !== channel) return

    if (status === 'SUBSCRIBED') {
      entry.status = 'subscribed'
      entry.attempts = 0
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
      entry.status = 'dead'
      if (entry.attempts >= MAX_ATTEMPTS) return // give up; visibilitychange revives later
      const delay = Math.min(BASE_DELAY_MS * 2 ** entry.attempts, MAX_DELAY_MS)
      entry.attempts++
      if (entry.retryTimer) clearTimeout(entry.retryTimer)
      entry.retryTimer = setTimeout(() => {
        entry.retryTimer = null
        resubscribe(key, entry)
      }, delay)
    }
  })
}

export interface ReconnectHandle {
  unsubscribe: () => void
}

/**
 * Subscribe a realtime channel with automatic reconnect.
 *
 * @param key unique key per logical subscription (usually the channel topic)
 * @param buildChannel factory returning a FRESH, not-yet-subscribed channel
 *        with all `.on(...)` handlers attached. Called again on every retry.
 */
export function subscribeWithReconnect(
  key: string,
  buildChannel: () => RealtimeChannel
): ReconnectHandle {
  installVisibilityHook()

  // Replace an existing subscription under the same key
  const existing = registry.get(key)
  if (existing) {
    existing.closed = true
    teardownChannel(existing)
    registry.delete(key)
  }

  const entry: Entry = {
    buildChannel,
    current: null,
    status: 'pending',
    attempts: 0,
    retryTimer: null,
    closed: false,
  }
  registry.set(key, entry)
  resubscribe(key, entry)

  return {
    unsubscribe() {
      entry.closed = true
      teardownChannel(entry)
      if (registry.get(key) === entry) registry.delete(key)
    },
  }
}
