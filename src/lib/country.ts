// ── Country & Location Preferences ──────────────────────────
// Manages user's country selection, GPS location, and radius preferences

export type CountryPreference = 'ba' | 'hr' | 'all';

const COUNTRY_KEY = 'nudinadi_country';
const ONBOARDED_KEY = 'nudinadi_onboarded';
const GPS_KEY = 'nudinadi_gps';
const RADIUS_KEY = 'nudinadi_radius';

// ── Onboarding ──────────────────────────────────────────────

export function isOnboarded(): boolean {
  if (typeof window === 'undefined') return true; // SSR: assume onboarded
  return localStorage.getItem(ONBOARDED_KEY) === 'true';
}

export function setOnboarded(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ONBOARDED_KEY, 'true');
}

// ── Country ─────────────────────────────────────────────────

export function getCountryPreference(): CountryPreference {
  if (typeof window === 'undefined') return 'all';
  const stored = localStorage.getItem(COUNTRY_KEY);
  if (stored === 'ba' || stored === 'hr' || stored === 'all') return stored;
  return 'all';
}

export function setCountryPreference(country: CountryPreference): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COUNTRY_KEY, country);
}

// ── GPS Position ────────────────────────────────────────────

export interface GPSPosition {
  lat: number;
  lng: number;
}

export function getGPSPosition(): GPSPosition | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(GPS_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function setGPSPosition(pos: GPSPosition): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GPS_KEY, JSON.stringify(pos));
}

export function clearGPSPosition(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GPS_KEY);
}

// ── Radius ──────────────────────────────────────────────────

export const RADIUS_OPTIONS = [10, 25, 50, 100, 200] as const;
export type RadiusKm = typeof RADIUS_OPTIONS[number];

export function getRadius(): RadiusKm {
  if (typeof window === 'undefined') return 50;
  const stored = parseInt(localStorage.getItem(RADIUS_KEY) || '', 10);
  if (RADIUS_OPTIONS.includes(stored as RadiusKm)) return stored as RadiusKm;
  return 50;
}

export function setRadius(radius: RadiusKm): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RADIUS_KEY, String(radius));
}