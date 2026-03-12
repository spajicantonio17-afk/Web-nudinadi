import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    stripeInstance = new Stripe(key, { apiVersion: '2026-02-25.clover' });
  }
  return stripeInstance;
}

// Stripe Price IDs — set these in your Stripe Dashboard
export const STRIPE_PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
  business_monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || '',
} as const;

export type PlanId = 'pro' | 'business';

export function getPriceId(plan: PlanId): string {
  const priceId = plan === 'pro' ? STRIPE_PRICES.pro_monthly : STRIPE_PRICES.business_monthly;
  if (!priceId) throw new Error(`Stripe Price ID for ${plan} is not configured`);
  return priceId;
}
