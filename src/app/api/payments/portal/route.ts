import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server';
import { getStripe } from '@/lib/stripe';
import { rateLimit, rateLimitResponse, getIp, RATE_LIMITS } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const rl = rateLimit(`profile:${getIp(req)}`, RATE_LIMITS.profile_update);
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Nisi prijavljen.' }, { status: 401 });
    }

    const admin = await createAdminSupabase();
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'Nemaš aktivno pretplatu.' }, { status: 400 });
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nudinadi.com';

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/planovi`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    logger.error('[payments/portal]', err);
    return NextResponse.json(
      { error: 'Greška pri otvaranju portala.' },
      { status: 500 }
    );
  }
}
