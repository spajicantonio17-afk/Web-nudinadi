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

// ─── Credit Packages ─────────────────────────────────────────
export const CREDIT_PACKAGES = [
  { id: 'credits_10',  credits: 10, priceEur: 10, label: 'Starter' },
  { id: 'credits_25',  credits: 25, priceEur: 20, label: 'Standard' },
  { id: 'credits_60',  credits: 60, priceEur: 40, label: 'Pro' },
] as const;

export type CreditPackageId = typeof CREDIT_PACKAGES[number]['id'];

// ─── Istaknuti (Featured) Options ────────────────────────────
export const ISTAKNUTI_OPTIONS = [
  { id: 'istaknuti_3d',  days: 3,  credits: 1, label: 'Kratko',    desc: '3 dana' },
  { id: 'istaknuti_7d',  days: 7,  credits: 3, label: 'Sedmično',  desc: '7 dana' },
  { id: 'istaknuti_30d', days: 30, credits: 8, label: 'Mjesečno',  desc: '30 dana' },
] as const;

export type IstaknutiOptionId = typeof ISTAKNUTI_OPTIONS[number]['id'];
