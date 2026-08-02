// ── Post-Registration Onboarding Tour ───────────────────────
// Gates the multi-step tutorial popup shown right after a new user
// registers (country + theme, then a short tour of upload/messages/settings).

const JUST_REGISTERED_KEY = 'nudinadi_just_registered'
const TOUR_SEEN_KEY = 'nudinadi_tour_seen'

export function markJustRegistered(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(JUST_REGISTERED_KEY, 'true')
}

// Reads the just-registered flag and clears it in the same call, so the
// tour fires exactly once even if the popup's host component remounts.
export function consumeJustRegistered(): boolean {
  if (typeof window === 'undefined') return false
  const flag = localStorage.getItem(JUST_REGISTERED_KEY) === 'true'
  if (flag) localStorage.removeItem(JUST_REGISTERED_KEY)
  return flag
}

export function hasSeenTour(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(TOUR_SEEN_KEY) === 'true'
}

export function markTourSeen(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOUR_SEEN_KEY, 'true')
}
