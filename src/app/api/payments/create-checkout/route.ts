import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server';
import { getStripe, getPriceId, type PlanId } from '@/lib/stripe';
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

    const body = await req.json();
    const { plan } = body as { plan: PlanId };

    if (plan !== 'pro' && plan !== 'business') {
      return NextResponse.json({ error: 'Nevažeći plan.' }, { status: 400 });
    }

    const stripe = getStripe();
    const priceId = getPriceId(plan);
    const admin = await createAdminSupabase();

    // Get or create Stripe customer
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id, email, username')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || profile?.email,
        metadata: { supabase_user_id: user.id, username: profile?.username || '' },
      });
      customerId = customer.id;

      await admin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create Checkout Session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nudinadi.com';
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/planovi?success=1&plan=${plan}`,
      cancel_url: `${appUrl}/planovi?cancelled=1`,
      metadata: { supabase_user_id: user.id, plan },
      subscription_data: {
        metadata: { supabase_user_id: user.id, plan },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    logger.error('[payments/create-checkout]', err);
    return NextResponse.json(
      { error: 'Greška pri kreiranju plaćanja.' },
      { status: 500 }
    );
  }
}
