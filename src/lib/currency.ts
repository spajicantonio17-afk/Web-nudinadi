// ── Currency Display Logic ──────────────────────────────────
// Each product stores its native price + currency (BAM, EUR, RSD).
// Display is always in the product's own currency — no conversion.
// CurrencyMode is used for filtering context, not price display.

import { BAM_RATE, RSD_RATE } from './constants';
import { getCountryPreference, type CountryPreference } from './country';

export type CurrencyMode = 'km-only' | 'eur-only' | 'rsd-only' | 'dual';

export function getCurrencyMode(country?: CountryPreference): CurrencyMode {
  const pref = country ?? getCountryPreference();
  if (pref === 'ba') return 'km-only';
  if (pref === 'hr') return 'eur-only';
  if (pref === 'rs') return 'rsd-only';
  return 'dual';
}

/** Format a native price for display based on its currency */
export function formatNativePrice(price: number, currency: 'EUR' | 'BAM' | 'RSD'): string {
  if (price < 0) return 'Po dogovoru';
  if (currency === 'BAM') return `${price.toLocaleString()} KM`;
  if (currency === 'RSD') return `${price.toLocaleString()} RSD`;
  return `${price.toLocaleString()} €`;
}

/** Format price from raw DB product (handles Po dogovoru via attributes or price=0) */
export function formatProductPrice(
  price: number | string,
  currency: string | null,
  attributes?: Record<string, unknown> | null,
): string {
  const numPrice = Number(price);
  const priceType = attributes?.price_type as string | undefined;
  if (priceType === 'Po dogovoru' || (numPrice === 0 && !priceType)) return 'Po dogovoru';
  return formatNativePrice(numPrice, (currency ?? 'EUR') as 'EUR' | 'BAM' | 'RSD');
}

/** Convert EUR price to KM */
export function eurToKm(priceEur: number): number {
  return Math.round(priceEur * BAM_RATE);
}

/** Convert KM price to EUR */
export function kmToEur(priceKm: number): number {
  return Math.round(priceKm / BAM_RATE);
}

/** Convert EUR price to RSD */
export function eurToRsd(priceEur: number): number {
  return Math.round(priceEur * RSD_RATE);
}

/** Convert RSD price to EUR */
export function rsdToEur(priceRsd: number): number {
  return Math.round(priceRsd / RSD_RATE);
}

/**
 * Format price for display based on currency mode and product location.
 * Legacy function — kept for places that still use EUR-based price.
 * Prefer formatNativePrice() for new products with currency field.
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
    case 'rsd-only':
      return { primary: `${eurToRsd(priceEur).toLocaleString()} RSD`, secondary: null };
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
