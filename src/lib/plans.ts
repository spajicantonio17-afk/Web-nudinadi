// ─── Plan Configuration ─────────────────────────────────────
// Central place for all plan limits and helpers.
// Used across upload, product service, AI gating, and UI.

export const PLAN_LIMITS = {
  free: {
    maxActiveListings: 10,
    maxImagesPerListing: 7,
    aiDescription: false,
    statistics: false,
    searchBoost: 0,
    promotedCreditsPerMonth: 0,
    bulkUpload: false,
    analyticsDashboard: false,
    teamAccounts: false,
    prioritySupport: false,
  },
  pro: {
    maxActiveListings: 30,
    maxImagesPerListing: 20,
    aiDescription: true,
    statistics: true,
    searchBoost: 0.15,
    promotedCreditsPerMonth: 3,
    bulkUpload: false,
    analyticsDashboard: false,
    teamAccounts: false,
    prioritySupport: false,
  },
  business: {
    maxActiveListings: Infinity,
    maxImagesPerListing: Infinity,
    aiDescription: true,
    statistics: true,
    searchBoost: 0.25,
    promotedCreditsPerMonth: 10,
    bulkUpload: true,
    analyticsDashboard: true,
    teamAccounts: true,
    prioritySupport: true,
  },
} as const;

export type AccountType = keyof typeof PLAN_LIMITS;

export function getPlanLimits(accountType: AccountType | string | undefined) {
  const key = (accountType || 'free') as AccountType;
  return PLAN_LIMITS[key] || PLAN_LIMITS.free;
}

export function isPro(accountType: string | undefined): boolean {
  return accountType === 'pro' || accountType === 'business';
}

export function isBusiness(accountType: string | undefined): boolean {
  return accountType === 'business';
}
