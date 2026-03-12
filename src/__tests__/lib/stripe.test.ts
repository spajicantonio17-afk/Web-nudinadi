import { describe, it, expect } from 'vitest';
import { getPriceId, STRIPE_PRICES, type PlanId } from '@/lib/stripe';

describe('STRIPE_PRICES', () => {
  it('has pro and business price configs', () => {
    expect(STRIPE_PRICES).toHaveProperty('pro_monthly');
    expect(STRIPE_PRICES).toHaveProperty('business_monthly');
  });
});

describe('getPriceId', () => {
  it('throws when price ID is not configured', () => {
    // Without env vars set, price IDs are empty strings
    expect(() => getPriceId('pro' as PlanId)).toThrow('Stripe Price ID for pro is not configured');
    expect(() => getPriceId('business' as PlanId)).toThrow('Stripe Price ID for business is not configured');
  });
});
