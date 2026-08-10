import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'
import { rateLimit, rateLimitResponse, getIp, RATE_LIMITS } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

/**
 * Live availability check for the username field on /postavi-profil.
 *
 * Exists instead of the client-side isUsernameAvailable() because that one
 * has no self-exclusion: it reports the caller's own current username as
 * taken. Here the caller's row is excluded, so re-typing your own name is
 * never flagged.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(`check-username:${getIp(req)}`, RATE_LIMITS.check_username)
  if (!rl.success) return rateLimitResponse(rl.resetAt)

  try {
    const { username } = await req.json()

    if (typeof username !== 'string' || username.length < 3 || username.length > 30) {
      return NextResponse.json({ available: false, reason: 'length' })
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ available: false, reason: 'chars' })
    }

    // Own id, if signed in — anonymous checks are still allowed.
    let userId: string | null = null
    try {
      const supabase = await createServerSupabase()
      const { data } = await supabase.auth.getUser()
      userId = data?.user?.id ?? null
    } catch {
      // not signed in / session unreadable — fall through to a plain check
    }

    const admin = await createAdminSupabase()
    let query = admin.from('profiles').select('id').eq('username', username)
    if (userId) query = query.neq('id', userId)

    const { data: existing, error } = await query.maybeSingle()

    if (error) {
      logger.error('Check username DB error:', error)
      return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
    }

    return NextResponse.json({ available: !existing })
  } catch (err) {
    logger.error('Check username route error:', err)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
