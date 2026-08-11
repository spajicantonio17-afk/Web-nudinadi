import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Mock supabase client ──────────────────────────────────────
const removeChannel = vi.fn()
vi.mock('@/lib/supabase', () => ({
  getSupabase: () => ({ removeChannel }),
}))

import { subscribeWithReconnect } from '@/lib/realtime-reconnect'

type StatusCb = (status: string) => void

/** Minimal fake RealtimeChannel: records the subscribe callback so tests can fire statuses */
function makeFakeChannel() {
  const channel = {
    subscribeCb: null as StatusCb | null,
    subscribe(cb: StatusCb) {
      channel.subscribeCb = cb
      return channel
    },
  }
  return channel
}

describe('subscribeWithReconnect', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    removeChannel.mockClear()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('builds and subscribes a channel immediately', () => {
    const factory = vi.fn(makeFakeChannel)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handle = subscribeWithReconnect('t1', factory as any)
    expect(factory).toHaveBeenCalledTimes(1)
    handle.unsubscribe()
  })

  it('rebuilds a FRESH channel after CLOSED (with backoff)', () => {
    const channels: ReturnType<typeof makeFakeChannel>[] = []
    const factory = vi.fn(() => {
      const c = makeFakeChannel()
      channels.push(c)
      return c
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handle = subscribeWithReconnect('t2', factory as any)

    channels[0].subscribeCb?.('CLOSED')
    expect(factory).toHaveBeenCalledTimes(1) // not yet — backoff pending
    vi.advanceTimersByTime(1000)
    expect(factory).toHaveBeenCalledTimes(2) // fresh channel built
    expect(channels[1]).not.toBe(channels[0])
    expect(removeChannel).toHaveBeenCalled() // old one removed
    handle.unsubscribe()
  })

  it('stops retrying after manual unsubscribe', () => {
    const channels: ReturnType<typeof makeFakeChannel>[] = []
    const factory = vi.fn(() => {
      const c = makeFakeChannel()
      channels.push(c)
      return c
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handle = subscribeWithReconnect('t3', factory as any)

    handle.unsubscribe()
    channels[0].subscribeCb?.('CLOSED') // stale callback after teardown
    vi.advanceTimersByTime(60000)
    expect(factory).toHaveBeenCalledTimes(1) // never rebuilt
  })

  it('gives up after max attempts (no unbounded retry loop)', () => {
    const channels: ReturnType<typeof makeFakeChannel>[] = []
    const factory = vi.fn(() => {
      const c = makeFakeChannel()
      channels.push(c)
      return c
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handle = subscribeWithReconnect('t4', factory as any)

    // Fail every attempt; drain each backoff fully
    for (let i = 0; i < 12; i++) {
      channels[channels.length - 1].subscribeCb?.('CHANNEL_ERROR')
      vi.advanceTimersByTime(31000)
    }
    // initial + max 6 retries = 7 builds, then it must stop
    expect(factory.mock.calls.length).toBeLessThanOrEqual(7)
    handle.unsubscribe()
  })

  it('resets backoff after a successful SUBSCRIBED', () => {
    const channels: ReturnType<typeof makeFakeChannel>[] = []
    const factory = vi.fn(() => {
      const c = makeFakeChannel()
      channels.push(c)
      return c
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handle = subscribeWithReconnect('t5', factory as any)

    channels[0].subscribeCb?.('SUBSCRIBED')
    channels[0].subscribeCb?.('CLOSED')
    vi.advanceTimersByTime(1000) // back at base delay after reset
    expect(factory).toHaveBeenCalledTimes(2)
    handle.unsubscribe()
  })

  it('replaces an existing subscription under the same key', () => {
    const factory1 = vi.fn(makeFakeChannel)
    const factory2 = vi.fn(makeFakeChannel)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subscribeWithReconnect('t6', factory1 as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const h2 = subscribeWithReconnect('t6', factory2 as any)
    expect(removeChannel).toHaveBeenCalledTimes(1) // first sub torn down
    h2.unsubscribe()
  })
})
