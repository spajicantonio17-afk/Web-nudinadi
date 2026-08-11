// ── Filter State Types ───────────────────────────────────────────
// Extracted from FilterModal.tsx so pages can import the (tiny) filter state
// without statically pulling FilterModal + category-filters (~110KB source)
// into their first-load bundle. FilterModal re-exports these for compatibility.

export interface FilterState {
  priceMin: string;
  priceMax: string;
  condition: string;
  sortBy: string;
  timePosted: string;
  delivery: string;
  sellerType: string;
  radiusKm: number;
}

export const DEFAULT_FILTERS: FilterState = {
  priceMin: '',
  priceMax: '',
  condition: 'all',
  sortBy: 'newest',
  timePosted: 'all',
  delivery: 'all',
  sellerType: 'all',
  radiusKm: 0,
};
