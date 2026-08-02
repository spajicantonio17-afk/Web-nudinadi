// ── Post-Registration Coachmark Tour ────────────────────────
// Gates the on-page spotlight tour that starts after a new user
// registers (profile → level → settings → appearance/market/theme).

const JUST_REGISTERED_KEY = 'nudinadi_just_registered'
const TOUR_SEEN_KEY = 'nudinadi_tour_seen'
const TOUR_PROGRESS_KEY = 'nudinadi_tour_progress'

export const TOUR_START_EVENT = 'nudinadi:start-tour'

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

// Manual restart (e.g. "Pogledaj vodič ponovo" in settings) — works even
// after the tour was seen. The globally mounted CoachmarkTour listens.
export function requestTourStart(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(TOUR_START_EVENT))
}

// Mid-tour progress survives a page reload via sessionStorage (expires
// with the tab, so an abandoned tour can't resurrect days later). The
// just-registered flag is consumed at tour start, so without this a
// reload mid-tour would silently lose the tour forever.
export function saveTourProgress(stepIndex: number): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(TOUR_PROGRESS_KEY, String(stepIndex))
}

export function loadTourProgress(): number | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(TOUR_PROGRESS_KEY)
  if (raw === null) return null
  const n = parseInt(raw, 10)
  return Number.isInteger(n) && n >= 0 ? n : null
}

export function clearTourProgress(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(TOUR_PROGRESS_KEY)
}
