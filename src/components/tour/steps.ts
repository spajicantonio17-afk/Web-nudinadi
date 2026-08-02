// ── Coachmark tour step configuration ───────────────────────
// Each step spotlights one real UI element. Targets resolve to the
// first VISIBLE match (offsetParent check) so responsive duplicates
// (desktop/mobile level block) pick the right one automatically.

export interface TourStepConfig {
  id: string;
  /** Pathname where the target lives. */
  route: string;
  /** Selector candidates in priority order; first visible match wins. */
  selectors?: string[];
  /** Custom resolver for targets on pages we can't tag with data-tour. */
  resolve?: () => HTMLElement | null;
  /**
   * How to reach this step's route/view:
   * - 'passive': never navigate — wait until the user is on `route`
   *   (step 0: the register flow's own "Nastavi →" leads to /profile).
   * - 'push': router.push(route) on step entry.
   * - 'click-appearance': on /menu's main list, programmatically click
   *   the "Izgled i tržište" row (the page keeps its step in internal
   *   state; ?step= is only read on mount, so push alone won't work).
   */
  enter: 'passive' | 'push' | 'click-appearance';
  /** Deep link used instead when this step starts on a fresh mount. */
  fallbackHref?: string;
  titleKey: string;
  descKey: string;
  spotlightPadding?: number;
}

function isVisible(el: HTMLElement): boolean {
  return el.offsetParent !== null && el.getBoundingClientRect().width > 0;
}

export function resolveTarget(step: TourStepConfig): HTMLElement | null {
  if (step.resolve) {
    const el = step.resolve();
    return el && isVisible(el) ? el : null;
  }
  for (const sel of step.selectors ?? []) {
    const el = document.querySelector<HTMLElement>(sel);
    if (el && isVisible(el)) return el;
  }
  return null;
}

// The POSTAVKE section on /menu's main list: the h2 whose parent div
// also contains the fa-palette menu row. Icon-anchored instead of
// text-anchored so it survives translation copy changes.
function resolveMenuSettingsSection(): HTMLElement | null {
  const headings = document.querySelectorAll<HTMLElement>('h2');
  for (const h2 of headings) {
    const parent = h2.parentElement;
    if (parent && parent.querySelector('i.fa-palette')) return parent;
  }
  return null;
}

export const TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'profile-edit',
    route: '/profile',
    selectors: ['[data-tour="profile-edit"]'],
    enter: 'passive',
    titleKey: 'tour.editTitle',
    descKey: 'tour.editDesc',
  },
  {
    id: 'profile-level',
    route: '/profile',
    selectors: ['[data-tour="profile-level-desktop"]', '[data-tour="profile-level-mobile"]'],
    enter: 'passive',
    titleKey: 'tour.levelTitle',
    descKey: 'tour.levelDesc',
  },
  {
    id: 'menu-sections',
    route: '/menu',
    resolve: resolveMenuSettingsSection,
    enter: 'push',
    titleKey: 'tour.menuTitle',
    descKey: 'tour.menuDesc',
  },
  {
    id: 'settings-market',
    route: '/menu',
    selectors: ['[data-tour="settings-market"]'],
    enter: 'click-appearance',
    fallbackHref: '/menu?step=appearance',
    titleKey: 'tour.marketTitle',
    descKey: 'tour.marketDesc',
  },
  {
    id: 'settings-theme',
    route: '/menu',
    selectors: ['[data-tour="settings-theme"]'],
    enter: 'click-appearance',
    fallbackHref: '/menu?step=appearance',
    titleKey: 'tour.themeTitle',
    descKey: 'tour.themeDesc',
  },
];
