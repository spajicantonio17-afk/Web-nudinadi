import { describe, it, expect } from 'vitest';
import { PLAN_LIMITS, getPlanLimits, isPro, isBusiness } from '@/lib/plans';

describe('PLAN_LIMITS', () => {
  it('free plan has correct limits', () => {
    expect(PLAN_LIMITS.free.maxActiveListings).toBe(10);
    expect(PLAN_LIMITS.free.maxImagesPerListing).toBe(7);
    expect(PLAN_LIMITS.free.aiDescription).toBe(false);
    expect(PLAN_LIMITS.free.promotedCreditsPerMonth).toBe(0);
  });

  it('pro plan has correct limits', () => {
    expect(PLAN_LIMITS.pro.maxActiveListings).toBe(30);
    expect(PLAN_LIMITS.pro.maxImagesPerListing).toBe(20);
    expect(PLAN_LIMITS.pro.aiDescription).toBe(true);
    expect(PLAN_LIMITS.pro.promotedCreditsPerMonth).toBe(3);
  });

  it('business plan has unlimited listings', () => {
    expect(PLAN_LIMITS.business.maxActiveListings).toBe(Infinity);
    expect(PLAN_LIMITS.business.maxImagesPerListing).toBe(Infinity);
    expect(PLAN_LIMITS.business.promotedCreditsPerMonth).toBe(10);
  });
});

describe('getPlanLimits', () => {
  it('returns correct limits for each plan', () => {
    expect(getPlanLimits('free').maxActiveListings).toBe(10);
    expect(getPlanLimits('pro').maxActiveListings).toBe(30);
    expect(getPlanLimits('business').maxActiveListings).toBe(Infinity);
  });

  it('defaults to free for undefined', () => {
    expect(getPlanLimits(undefined).maxActiveListings).toBe(10);
  });

  it('defaults to free for unknown plan', () => {
    expect(getPlanLimits('unknown').maxActiveListings).toBe(10);
  });
});

describe('isPro', () => {
  it('returns true for pro', () => expect(isPro('pro')).toBe(true));
  it('returns true for business', () => expect(isPro('business')).toBe(true));
  it('returns false for free', () => expect(isPro('free')).toBe(false));
  it('returns false for undefined', () => expect(isPro(undefined)).toBe(false));
});

describe('isBusiness', () => {
  it('returns true for business', () => expect(isBusiness('business')).toBe(true));
  it('returns false for pro', () => expect(isBusiness('pro')).toBe(false));
  it('returns false for free', () => expect(isBusiness('free')).toBe(false));
});
