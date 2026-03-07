interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitConfig {
  /** Max requests in the window */
  limit: number
  /** Window duration in seconds */
  windowSeconds: number
}

const store = new Map<string, RateLimitEntry>()

// Periodic cleanup every 5 minutes to prevent memory leak
if (typeof globalThis !== 'undefined') {
  const cleanup = () => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (entry.resetAt < now) store.delete(key)
    }
  }
  setInterval(cleanup, 5 * 60 * 1000).unref?.()
}

export function rateLimit(
  key: string,
  config: RateLimitConfig
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.windowSeconds * 1000
    store.set(key, { count: 1, resetAt })
    return { success: true, remaining: config.limit - 1, resetAt }
  }

  if (entry.count >= config.limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { success: true, remaining: config.limit - entry.count, resetAt: entry.resetAt }
}

export function rateLimitResponse(resetAt: number) {
  return Response.json(
    { error: 'Previše zahtjeva. Pokušajte ponovo kasnije.' },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) },
    }
  )
}

export function getIp(req: Request): string {
  return (req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()) || 'unknown'
}

export const RATE_LIMITS = {
  ai:      { limit: 10, windowSeconds: 60 },
  auth:    { limit: 5,  windowSeconds: 300 },
  verify:  { limit: 3,  windowSeconds: 3600 },
  support: { limit: 3,  windowSeconds: 3600 },
} as const
