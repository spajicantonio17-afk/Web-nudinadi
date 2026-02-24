import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
  try {
    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error — missing SUPABASE_SERVICE_ROLE_KEY' },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      console.error('[auto-confirm] Missing userId in request body');
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    console.log('[auto-confirm] Confirming user:', userId);

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (error) {
      console.error('[auto-confirm] Admin API error:', error.message, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[auto-confirm] Success — user confirmed:', data.user?.id, 'email_confirmed_at:', data.user?.email_confirmed_at);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[auto-confirm] Unexpected error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
