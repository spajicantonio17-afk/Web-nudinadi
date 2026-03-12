import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, rateLimitResponse, getIp, RATE_LIMITS } from '@/lib/rate-limit';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('[auto-confirm] Missing env vars:', {
      hasUrl: !!url,
      hasServiceKey: !!key,
    });
    return null;
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: Request) {
  const rl = rateLimit(`auth:${getIp(request)}`, RATE_LIMITS.auth);
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  try {
    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Interna greška servera.' },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      console.error('[auto-confirm] Missing userId in request body');
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (error) {
      console.error('[auto-confirm] Admin API error:', error.message, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[auto-confirm] Unexpected error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
