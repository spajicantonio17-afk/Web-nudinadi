import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server';
import { getStripe } from '@/lib/stripe';
import { CREDIT_PACKAGES, type CreditPackageId } from '@/lib/plans';
import { rateLimit, rateLimitResponse, getIp, RATE_LIMITS } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const rl = rateLimit(`buy-credits:${getIp(req)}`, RATE_LIMITS.profile_update);
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Nisi prijavljen.' }, { status: 401 });
    }

    const { packageId } = await req.json() as { packageId: CreditPackageId };
    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
    if (!pkg) {
      return NextResponse.json({ error: 'Nevažeći paket.' }, { status: 400 });
    }

    const stripe = getStripe();
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nudinadi.com';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: pkg.priceEur * 100,
            product_data: {
              name: `NudiNađi Credits — ${pkg.label} (${pkg.credits} kredita)`,
              description: `${pkg.credits} kredita za slike i istaknute oglase`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/krediti?success=1&pkg=${packageId}`,
      cancel_url: `${appUrl}/krediti?cancelled=1`,
      metadata: {
        supabase_user_id: user.id,
        type: 'credit_purchase',
        package_id: packageId,
        credits: String(pkg.credits),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    logger.error('[payments/buy-credits]', err);
    return NextResponse.json({ error: 'Greška pri kreiranju plaćanja.' }, { status: 500 });
  }
}
