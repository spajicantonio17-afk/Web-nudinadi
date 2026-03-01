// ── Currency Display Logic ──────────────────────────────────
// Determines what currency to show based on user's country preference
// - BiH only → show KM only
// - Croatia only → show EUR only
// - All markets → show dual pricing (primary based on product location)

import { BAM_RATE } from './constants';
import { getCountryPreference, type CountryPreference } from './country';

export type CurrencyMode = 'km-only' | 'eur-only' | 'dual';

export function getCurrencyMode(country?: CountryPreference): CurrencyMode {
  const pref = country ?? getCountryPreference();
  if (pref === 'ba') return 'km-only';
  if (pref === 'hr') return 'eur-only';
  return 'dual';
}

/** Convert EUR price to KM */
export function eurToKm(priceEur: number): number {
  return Math.round(priceEur * BAM_RATE);
}

/** Convert KM price to EUR */
export function kmToEur(priceKm: number): number {
  return Math.round(priceKm / BAM_RATE);
}

/**
 * Format price for display based on currency mode and product location.
 * Returns { primary, secondary } where secondary is null for single-currency modes.
 */
export function formatPriceDisplay(
  priceEur: number,
  isBiH: boolean,
  mode: CurrencyMode,
): { primary: string; secondary: string | null } {
  const km = eurToKm(priceEur);

  switch (mode) {
    case 'km-only':
      return { primary: `${km.toLocaleString()} KM`, secondary: null };
    case 'eur-only':
      return { primary: `${priceEur.toLocaleString()} €`, secondary: null };
    case 'dual':
      if (isBiH) {
        return {
          primary: `${km.toLocaleString()} KM`,
          secondary: `${priceEur.toLocaleString()} €`,
        };
      }
      return {
        primary: `${priceEur.toLocaleString()} €`,
        secondary: `${km.toLocaleString()} KM`,
      };
  }
}
