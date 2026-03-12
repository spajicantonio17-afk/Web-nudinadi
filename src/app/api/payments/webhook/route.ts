import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';

// Disable body parsing — Stripe needs the raw body for signature verification
export const dynamic = 'force-dynamic';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): Date {
  // In Stripe API 2025+, current_period_end is on SubscriptionItem, not Subscription
  const item = subscription.items.data[0];
  return new Date(item.current_period_end * 1000);
}

async function updateUserPlan(userId: string, plan: string, expiresAt: Date | null) {
  const supabase = getAdminClient();

  const updates: Record<string, unknown> = {
    account_type: plan,
    plan_expires_at: expiresAt?.toISOString() || null,
  };

  // Reset promoted credits on plan change
  if (plan === 'pro') updates.promoted_credits = 3;
  if (plan === 'business') updates.promoted_credits = 10;
  if (plan === 'free') updates.promoted_credits = 0;

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('[webhook] Failed to update user plan:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const plan = session.metadata?.plan;
        if (!userId || !plan) break;

        // Subscription is now active
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          const periodEnd = getSubscriptionPeriodEnd(subscription);
          await updateUserPlan(userId, plan, periodEnd);
        }
        break;
      }

      case 'invoice.paid': {
        // Recurring payment succeeded — extend plan
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as unknown as Record<string, unknown>).subscription as string | null;
        if (!subId) break;

        const subscription = await stripe.subscriptions.retrieve(subId);
        const userId = subscription.metadata?.supabase_user_id;
        const plan = subscription.metadata?.plan;
        if (!userId || !plan) break;

        const periodEnd = getSubscriptionPeriodEnd(subscription);
        await updateUserPlan(userId, plan, periodEnd);
        break;
      }

      case 'customer.subscription.deleted': {
        // Subscription cancelled or expired — downgrade to free
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;
        if (!userId) break;

        await updateUserPlan(userId, 'free', null);
        break;
      }

      case 'customer.subscription.updated': {
        // Plan changed (upgrade/downgrade)
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;
        const plan = subscription.metadata?.plan;
        if (!userId || !plan) break;

        if (subscription.status === 'active') {
          const periodEnd = getSubscriptionPeriodEnd(subscription);
          await updateUserPlan(userId, plan, periodEnd);
        } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          await updateUserPlan(userId, 'free', null);
        }
        break;
      }
    }
  } catch (err) {
    console.error('[webhook] Error processing event:', event.type, err);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
