import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId and email required' }, { status: 400 });
    }

    // Step 1: Temporarily unconfirm so Supabase allows resending
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: false,
    });

    // Step 2: Resend the confirmation email (Supabase handles sending)
    const { error: resendError } = await supabaseAdmin.auth.resend({
      type: 'signup',
      email,
    });

    // Step 3: Re-confirm immediately so user can still login
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (resendError) {
      return NextResponse.json({ error: resendError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
