import { NextResponse } from 'next/server';
import Mailchecker from 'mailchecker';
import { rateLimit, rateLimitResponse, getIp, RATE_LIMITS } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

// Server-side disposable-email check, called before signUp() during
// registration. A client-only check is trivially bypassed (DevTools),
// so this route is the actual gate — the client-side check in
// auth.schemas.ts only exists for fast inline feedback.
export async function POST(request: Request) {
  const rl = rateLimit(`check-email:${getIp(request)}`, RATE_LIMITS.auth);
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email : '';

    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 });
    }

    const allowed = Mailchecker.isValid(email);

    if (!allowed) {
      return NextResponse.json(
        { allowed: false, error: 'Ova email adresa nije dozvoljena. Koristi svoju stvarnu email adresu.' },
        { status: 200 },
      );
    }

    return NextResponse.json({ allowed: true });
  } catch (err) {
    logger.error('[check-email] Unexpected error:', err);
    // Fail open: a transient server error shouldn't block registration.
    return NextResponse.json({ allowed: true });
  }
}
