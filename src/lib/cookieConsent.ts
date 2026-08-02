// ── Cookie Consent (granular) ───────────────────────────────
// Central read/write helper for the user's cookie preferences.
// Replaces the old single-string 'all' | 'essential' format with a
// per-category object so users can pick exactly what they allow.

const STORAGE_KEY = 'nudinadi_cookie_consent'
export const COOKIE_CONSENT_EVENT = 'cookie-consent-changed'

export interface CookieConsent {
  necessary: true
  functional: boolean
  analytics: boolean
  marketing: boolean
}

const DEFAULT_CONSENT: CookieConsent = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
}

// Recognizes the legacy string format written by the old banner
// ('all' | 'essential') and migrates it to the new object shape.
function migrateLegacyValue(raw: string): CookieConsent | null {
  if (raw === 'all') {
    return { necessary: true, functional: true, analytics: true, marketing: true }
  }
  if (raw === 'essential') {
    return { ...DEFAULT_CONSENT }
  }
  return null
}

export function getConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  const legacy = migrateLegacyValue(raw)
  if (legacy) return legacy

  try {
    const parsed = JSON.parse(raw)
    return {
      necessary: true,
      functional: !!parsed.functional,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
    }
  } catch {
    return null
  }
}

export function hasConsented(): boolean {
  return getConsent() !== null
}

export function setConsent(consent: Omit<CookieConsent, 'necessary'>): void {
  if (typeof window === 'undefined') return
  const full: CookieConsent = { necessary: true, ...consent }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(full))
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT))
}

export function acceptAll(): void {
  setConsent({ functional: true, analytics: true, marketing: true })
}

export function acceptEssentialOnly(): void {
  setConsent({ functional: false, analytics: false, marketing: false })
}
