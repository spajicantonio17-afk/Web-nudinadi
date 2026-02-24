'use client';

import { useState, useMemo, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/ProductCard';
import CategoryButton from '@/components/CategoryButton';
import LocationPicker from '@/components/LocationPicker';
import FilterModal, { DEFAULT_FILTERS, type FilterState } from '@/components/FilterModal';
import { CATEGORIES, CATEGORY_IMAGES, BAM_RATE } from '@/lib/constants';
import { parseAiQuery } from '@/lib/utils';
import { getProducts, type ProductFilters } from '@/services/productService';
import { getAllCategories } from '@/services/categoryService';
import type { ProductFull } from '@/lib/database.types';
import type { Product } from '@/lib/types';
import { getSelectedLocation, detectGPSLocation, findNearestCity, setSelectedLocation as saveLocation, distanceToCity, searchCities, type City } from '@/lib/location';
import { useFavorites } from '@/lib/favorites';
import { useToast } from '@/components/Toast';

const PRIMARY_IDS = ['vozila', 'nekretnine', 'servisi', 'poslovi', 'tehnika', 'dom'];

// Map AI Bosnian condition labels → filter key values
const AI_CONDITION_MAP: Record<string, string> = {
  'Novo': 'new',
  'Kao novo': 'like_new',
  'Korišteno': 'used',
  'Koristeno': 'used',
};

function formatTimeLabel(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1) return 'Upravo sada';
  if (h < 24) return `Prije ${h}h`;
  if (d === 1) return 'Jučer';
  if (d < 7) return `Prije ${d} dana`;
  return `Prije ${Math.floor(d / 7)} sedmica`;
}

function dbToDisplayProduct(p: ProductFull): Product {
  const condMap: Record<string, Product['condition']> = {
    new: 'New', like_new: 'Like New', used: 'Used',
  };
  return {
    id: p.id,
    name: p.title,
    price: Number(p.price),
    secondaryPriceLabel: `${(Number(p.price) * BAM_RATE).toFixed(0)} KM`,
    location: p.location || 'Nepoznato',
    timeLabel: formatTimeLabel(p.created_at),
    description: p.description || '',
    imageUrl: p.images?.[0] || `https://picsum.photos/seed/${p.id}/400/300`,
    category: p.category?.name || 'Ostalo',
    seller: p.seller?.username || 'korisnik',
    condition: condMap[p.condition] ?? 'Used',
    views: p.views_count,
  };
}

/** Check if product timeLabel matches time filter */
function matchesTimeFilter(timeLabel: string, filter: string): boolean {
  if (filter === 'all') return true;
  const t = timeLabel.toLowerCase();
  if (filter === 'today') return t.includes('danas') || (t.includes('prije') && !t.includes('dan') && !t.includes('jučer'));
  if (filter === 'week') return t.includes('danas') || t.includes('prije') || t.includes('jučer');
  if (filter === 'month') return true; // all mock data is within a month
  return true;
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'Sve';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [showAiInfo, setShowAiInfo] = useState(false);
  const [showLocalSecurity, setShowLocalSecurity] = useState(false);
  const [showSecondaryCats, setShowSecondaryCats] = useState(false);
  const [showAllCatsPopup, setShowAllCatsPopup] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(CATEGORIES[0].id);
  const [selectedSubGroup, setSelectedSubGroup] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchHints, setShowSearchHints] = useState(false);
  const [aiPriceMin, setAiPriceMin] = useState<number | undefined>(undefined);
  const [aiPriceMax, setAiPriceMax] = useState<number | undefined>(undefined);
  const [aiCategory, setAiCategory] = useState<string | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchSuggestions, setAiSearchSuggestions] = useState<string[]>([]);
  const [aiCorrectedQuery, setAiCorrectedQuery] = useState<string | null>(null);
  const [aiCondition, setAiCondition] = useState<string | null>(null); // Bosnian label: "Korišteno" etc.
  const [selectedLocation, setSelectedLocation] = useState<City | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const PRODUCTS_PER_PAGE = 24;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useFavorites(); // keeps Supabase session in sync (used by ProductCard internally)
  const { showToast } = useToast();

  // Load saved location on mount
  useEffect(() => {
    setSelectedLocation(getSelectedLocation());
  }, []);

  // Build server-side filter params from current state
  const buildServerFilters = useCallback(async (offset = 0): Promise<ProductFilters> => {
    const serverFilters: ProductFilters = {
      status: 'active',
      limit: PRODUCTS_PER_PAGE,
      offset,
    };

    // Category filter — resolve name to ID(s) including subcategories
    if (activeCategory !== 'Sve') {
      try {
        const allCats = await getAllCategories();
        const parent = allCats.find(c => c.name === activeCategory);
        if (parent) {
          const subs = allCats.filter(c => c.parent_category_id === parent.id);
          if (subs.length > 0) {
            serverFilters.category_ids = [parent.id, ...subs.map(s => s.id)];
          } else {
            serverFilters.category_id = parent.id;
          }
        }
      } catch { /* fallback: no category filter */ }
    }

    // Price filters (from filter modal or AI-parsed)
    const effectiveMin = aiPriceMin ?? (filters.priceMin ? Number(filters.priceMin) : undefined);
    const effectiveMax = aiPriceMax ?? (filters.priceMax ? Number(filters.priceMax) : undefined);
    if (effectiveMin && !isNaN(effectiveMin)) serverFilters.minPrice = effectiveMin;
    if (effectiveMax && !isNaN(effectiveMax)) serverFilters.maxPrice = effectiveMax;

    // Condition filter
    if (filters.condition && filters.condition !== 'all') {
      serverFilters.condition = filters.condition;
    }

    // Search
    if (searchQuery.trim()) {
      const parsed = parseAiQuery(searchQuery);
      serverFilters.search = parsed.cleanQuery || searchQuery.trim();
    }

    // Location (exact match)
    if (selectedLocation && filters.radiusKm === 0) {
      serverFilters.location = selectedLocation.name;
    }

    // Sort
    if (filters.sortBy === 'price_asc') { serverFilters.sortBy = 'price'; serverFilters.sortOrder = 'asc'; }
    else if (filters.sortBy === 'price_desc') { serverFilters.sortBy = 'price'; serverFilters.sortOrder = 'desc'; }
    else if (filters.sortBy === 'popular') { serverFilters.sortBy = 'views_count'; serverFilters.sortOrder = 'desc'; }
    else { serverFilters.sortBy = 'created_at'; serverFilters.sortOrder = 'desc'; }

    return serverFilters;
  }, [activeCategory, filters, searchQuery, selectedLocation, aiPriceMin, aiPriceMax]);

  // Load products from Supabase (re-fetches when filters change)
  const filterVersion = useRef(0);
  useEffect(() => {
    const version = ++filterVersion.current;
    setIsLoadingProducts(true);
    setHasMore(true);
    buildServerFilters(0)
      .then(sf => getProducts(sf))
      .then(({ data, count }) => {
        if (version !== filterVersion.current) return; // stale request
        setDbProducts(data.map(dbToDisplayProduct));
        setTotalCount(count);
        setHasMore(data.length >= PRODUCTS_PER_PAGE && data.length < count);
      })
      .catch(err => {
        if (version === filterVersion.current) console.error('Failed to load products:', err);
      })
      .finally(() => {
        if (version === filterVersion.current) setIsLoadingProducts(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, filters, searchQuery, selectedLocation, aiPriceMin, aiPriceMax]);

  // Load more products (infinite scroll — uses same server-side filters)
  const loadMoreProducts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const sf = await buildServerFilters(dbProducts.length);
      const { data, count } = await getProducts(sf);
      const newProducts = data.map(dbToDisplayProduct);
      setDbProducts(prev => [...prev, ...newProducts]);
      setTotalCount(count);
      setHasMore(dbProducts.length + newProducts.length < count);
    } catch (err) {
      console.error('Failed to load more products:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, dbProducts.length, buildServerFilters]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMoreProducts(); },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMoreProducts]);

  // Sync category to URL
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    const url = cat === 'Sve' ? '/' : `/?category=${encodeURIComponent(cat)}`;
    window.history.replaceState(null, '', url);
  };

  // Product click handler
  const handleProductClick = (productId: string) => {
    const baseId = productId.split('-')[0];
    router.push(`/product/${baseId}`);
  };


  // GPS detection handler
  const handleDetectGPS = async () => {
    setIsDetectingGPS(true);
    try {
      const coords = await detectGPSLocation();
      const nearest = findNearestCity(coords.lat, coords.lng);
      saveLocation(nearest);
      setSelectedLocation(nearest);
      showToast(`Lokacija: ${nearest.name}, ${nearest.country}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'GPS greška', 'error');
    } finally {
      setIsDetectingGPS(false);
    }
  };

  // AI search handler — parses natural language query
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setAiCorrectedQuery(null); // clear correction banner on manual edit
    if (!value.trim()) {
      setAiPriceMin(undefined);
      setAiPriceMax(undefined);
      setAiCategory(null);
      setAiCondition(null);
      return;
    }
    const result = parseAiQuery(value);
    setAiPriceMin(result.priceMin);
    setAiPriceMax(result.priceMax);
    if (result.detectedCategory) {
      setAiCategory(result.detectedCategory);
      handleCategoryChange(result.detectedCategory);
    } else {
      setAiCategory(null);
    }
  };

  // Smart AI Search — called on Enter/submit
  const handleSmartSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsAiSearching(true);
    const originalQuery = query.trim();
    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        // Corrected query — show "Prikazujemo rezultate za" banner if AI fixed a typo
        if (d.cleanQuery) {
          setSearchQuery(d.cleanQuery);
          if (d.cleanQuery.toLowerCase() !== originalQuery.toLowerCase()) {
            setAiCorrectedQuery(originalQuery);
          }
        }
        if (d.filters?.priceMin) setAiPriceMin(d.filters.priceMin);
        if (d.filters?.priceMax) setAiPriceMax(d.filters.priceMax);
        if (d.filters?.category) {
          setAiCategory(d.filters.category);
          handleCategoryChange(d.filters.category);
        }
        // Apply AI condition filter
        if (d.filters?.condition && AI_CONDITION_MAP[d.filters.condition]) {
          setFilters(prev => ({ ...prev, condition: AI_CONDITION_MAP[d.filters.condition] }));
          setAiCondition(d.filters.condition);
        }
        // Apply AI location filter
        if (d.filters?.location) {
          const cityResults = searchCities(d.filters.location);
          if (cityResults.length > 0) {
            saveLocation(cityResults[0]);
            setSelectedLocation(cityResults[0]);
          }
        }
        if (d.suggestions?.length) setAiSearchSuggestions(d.suggestions);
      }
    } catch { /* fallback: keep existing local parse */ }
    setIsAiSearching(false);
    setShowSearchHints(false);
  };

  // Filter apply handler
  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    const count = Object.entries(newFilters).filter(([key, val]) => {
      if (key === 'radiusKm') return val > 0;
      if (typeof val === 'string') return val !== '' && val !== 'all' && val !== 'newest';
      return false;
    }).length;
    if (count > 0) showToast(`${count} filter${count > 1 ? 'a' : ''} primijenjeno`);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priceMin) count++;
    if (filters.priceMax) count++;
    if (filters.condition !== 'all') count++;
    if (filters.sortBy !== 'newest') count++;
    if (filters.timePosted !== 'all') count++;
    if (filters.delivery !== 'all') count++;
    if (filters.sellerType !== 'all') count++;
    if (filters.radiusKm > 0) count++;
    return count;
  }, [filters]);

  const primaryCategories = CATEGORIES.filter(c => PRIMARY_IDS.includes(c.id));
  const secondaryCategories = CATEGORIES.filter(c => !PRIMARY_IDS.includes(c.id) && c.id !== 'antikviteti' && c.id !== 'hrana');

  // Most filtering is now server-side. Only radius-based location filter remains client-side.
  const displayedProducts = useMemo(() => {
    let base: Product[] = dbProducts;

    // Radius filter (client-side only — needs GPS distance calculation)
    if (filters.radiusKm > 0 && selectedLocation) {
      base = base.filter((p: Product) => {
        const dist = distanceToCity(p.location, selectedLocation.lat, selectedLocation.lng);
        return dist !== null && dist <= filters.radiusKm;
      });
    }

    // Time filter (client-side — server doesn't have this filter)
    if (filters.timePosted !== 'all') {
      base = base.filter((p: Product) => matchesTimeFilter(p.timeLabel, filters.timePosted));
    }

    return base;
  }, [dbProducts, selectedLocation, filters]);

  const vehicleProducts = useMemo(() => {
    if (activeCategory === 'Sve' && activeFilterCount === 0) {
      return displayedProducts.filter(p => p.category === 'Vozila');
    }
    return [];
  }, [displayedProducts, activeCategory, activeFilterCount]);

  return (
    <MainLayout>
      <div className="relative">

        {/* AI INFO MODAL */}
        {showAiInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6 lg:p-10" role="dialog" aria-modal="true" aria-labelledby="ai-modal-title">
            <div className="absolute inset-0 bg-[var(--c-overlay)] backdrop-blur-sm" onClick={() => setShowAiInfo(false)} onKeyDown={(e) => e.key === 'Escape' && setShowAiInfo(false)} role="presentation"></div>
            <div className="relative w-full max-w-4xl bg-[var(--c-card)] border border-[var(--c-border)] rounded-[6px] shadow-2xl animate-fadeIn flex flex-col" style={{ height: 'min(90vh, 700px)' }}>

              {/* HEADER */}
              <div className="shrink-0 flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-[var(--c-border)]">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-[4px] bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <i className="fa-solid fa-wand-magic-sparkles text-white text-xs md:text-sm"></i>
                  </div>
                  <div>
                    <p className="text-[12px] md:text-[13px] font-black text-[var(--c-text)] tracking-tight leading-none">AI PRETRAGA</p>
                    <p className="text-[7px] md:text-[8px] font-bold text-purple-400 uppercase tracking-[0.2em] mt-0.5">NudiNađi Smart Engine</p>
                  </div>
                </div>
                <button onClick={() => setShowAiInfo(false)} aria-label="Zatvori" className="w-8 h-8 rounded-[4px] bg-[var(--c-hover)] hover:bg-[var(--c-active)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] transition-all">
                  <i className="fa-solid fa-xmark text-sm" aria-hidden="true"></i>
                </button>
              </div>

              {/* BODY */}
              <div className="flex-1 flex flex-col px-4 md:px-6 py-4 md:py-5 gap-4 md:gap-5 min-h-0 overflow-y-auto">

                {/* TOP ROW: Hero + Stats */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 shrink-0">
                  <div className="flex-1">
                    <h2 id="ai-modal-title" className="text-2xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-2 md:mb-3">
                      PRETRAGA<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-600">BEZ LIMITA.</span>
                    </h2>
                    <div className="w-10 h-[3px] bg-purple-500 mb-3"></div>
                    <p className="text-[12px] text-[var(--c-text2)] leading-relaxed max-w-[380px]">
                      Napiši prirodno šta tražiš — AI automatski razumije kategoriju, cijenu, lokaciju i stanje. Nema filtera, nema klikanja.
                    </p>
                  </div>
                  <div className="hidden md:flex gap-3 shrink-0">
                    <div className="w-36 bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-4">
                      <i className="fa-solid fa-brain text-[var(--c-text3)] text-xl mb-3 block"></i>
                      <p className="text-3xl font-black text-[var(--c-text)] leading-none mb-1">NLP</p>
                      <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-widest">Prirodni Jezik</p>
                    </div>
                    <div className="w-36 bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-4">
                      <i className="fa-solid fa-spell-check text-[var(--c-text3)] text-xl mb-3 block"></i>
                      <p className="text-3xl font-black text-[var(--c-text)] leading-none mb-1">Auto</p>
                      <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-widest">Ispravka Grešaka</p>
                    </div>
                  </div>
                </div>

                {/* SECTION LABEL */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-8 h-[2px] bg-purple-500"></div>
                  <p className="text-[11px] font-bold text-[var(--c-text3)] uppercase tracking-wider">Šta AI pretraga razumije?</p>
                </div>

                {/* FEATURE CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
                  <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-blue-500/40 transition-colors flex flex-col">
                    <div className="absolute top-0 right-0 w-14 h-14 bg-blue-500/20 rounded-bl-[35px]"></div>
                    <div className="w-10 h-10 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4 shrink-0">
                      <i className="fa-solid fa-tags text-blue-400 text-sm"></i>
                    </div>
                    <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">Automatska<br />Kategorija</h3>
                    <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">
                      Napiši <span className="text-[var(--c-text)] font-bold">&ldquo;laptop&rdquo;</span> ili <span className="text-[var(--c-text)] font-bold">&ldquo;mercedes&rdquo;</span> — AI automatski prebaci na pravu kategoriju bez ručnog biranja.
                    </p>
                  </div>

                  <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-green-500/40 transition-colors flex flex-col">
                    <div className="absolute top-0 right-0 w-14 h-14 bg-green-500/20 rounded-bl-[35px]"></div>
                    <div className="w-10 h-10 rounded-[4px] bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-4 shrink-0">
                      <i className="fa-solid fa-euro-sign text-green-400 text-sm"></i>
                    </div>
                    <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">Prirodni<br />Raspon Cijena</h3>
                    <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">
                      Piši <span className="text-[var(--c-text)] font-bold">&ldquo;10.000 do 20.000&rdquo;</span>, <span className="text-[var(--c-text)] font-bold">&ldquo;ispod 5000&rdquo;</span> ili kratko <span className="text-[var(--c-text)] font-bold">&ldquo;10k do 20k&rdquo;</span> — sve radi automatski.
                    </p>
                  </div>

                  <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-orange-500/40 transition-colors flex flex-col">
                    <div className="absolute top-0 right-0 w-14 h-14 bg-orange-500/20 rounded-bl-[35px]"></div>
                    <div className="w-10 h-10 rounded-[4px] bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mb-4 shrink-0">
                      <i className="fa-solid fa-spell-check text-orange-400 text-sm"></i>
                    </div>
                    <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">Greške &amp;<br />Dijakritika</h3>
                    <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">
                      Ne moraš pisati savršeno. <span className="text-[var(--c-text)] font-bold">&ldquo;iphone&rdquo;</span>, <span className="text-[var(--c-text)] font-bold">&ldquo;bmv 3&rdquo;</span>, <span className="text-[var(--c-text)] font-bold">&ldquo;racunar&rdquo;</span> — AI to ispravlja i nalazi tačne rezultate.
                    </p>
                  </div>

                  <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-purple-500/40 transition-colors flex flex-col">
                    <div className="absolute top-0 right-0 w-14 h-14 bg-purple-500/20 rounded-bl-[35px]"></div>
                    <div className="w-10 h-10 rounded-[4px] bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4 shrink-0">
                      <i className="fa-solid fa-layer-group text-purple-400 text-sm"></i>
                    </div>
                    <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">Kombinovana<br />Pretraga</h3>
                    <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">
                      Sve odjednom: <span className="text-[var(--c-text)] font-bold">&ldquo;BMW 320 Karavan 2020 do 18.000&rdquo;</span> → model + vrsta + godina + max cijena u jednom koraku.
                    </p>
                  </div>
                </div>

                {/* EXAMPLE SEARCHES */}
                <div className="shrink-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-[2px] bg-purple-500"></div>
                    <p className="text-[11px] font-bold text-[var(--c-text3)] uppercase tracking-wider">Probaj odmah — klikni primjer</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'BMW 320 Limousine',
                      'od 10.000 do 25.000',
                      'iPhone 15 Pro ispod 1200',
                      'Stan Sarajevo 3 sobe',
                      'Laptop ispod 800',
                      'Sofa kao nova',
                    ].map((ex) => (
                      <button
                        key={ex}
                        onClick={() => { handleSearchChange(ex); setShowAiInfo(false); }}
                        className="px-3 py-2 bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] text-[11px] font-bold text-[var(--c-text2)] hover:border-purple-500/40 hover:text-purple-500 transition-all"
                      >
                        &bdquo;{ex}&ldquo;
                      </button>
                    ))}
                  </div>
                </div>

                {/* BOTTOM QUOTE */}
                <div className="shrink-0 text-center pt-4 border-t border-[var(--c-border)]">
                  <p className="text-lg font-black text-[var(--c-text)] uppercase tracking-tight mb-1">
                    &ldquo;Piši prirodno. AI razumije.&rdquo;
                  </p>
                  <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-[0.3em]">Powered by NudiNađi AI Core</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY MODAL */}
        {showLocalSecurity && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6 lg:p-10" role="dialog" aria-modal="true" aria-labelledby="security-modal-title">
            <div className="absolute inset-0 bg-[var(--c-overlay)] backdrop-blur-sm" onClick={() => setShowLocalSecurity(false)} onKeyDown={(e) => e.key === 'Escape' && setShowLocalSecurity(false)} role="presentation"></div>
            <div className="relative w-full max-w-4xl bg-[var(--c-card)] border border-[var(--c-border)] rounded-[6px] shadow-2xl animate-fadeIn flex flex-col overflow-hidden" style={{ height: 'min(90vh, 700px)' }}>

              {/* HEADER */}
              <div className="shrink-0 flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-[var(--c-border)]">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-[4px] bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <i className="fa-solid fa-shield-halved text-white text-xs md:text-sm"></i>
                  </div>
                  <div>
                    <p className="text-[12px] md:text-[13px] font-black text-[var(--c-text)] tracking-tight leading-none">AI ZAŠTITA</p>
                    <p className="text-[10px] md:text-[11px] font-semibold text-blue-400 uppercase tracking-wider mt-0.5">Sigurnost na prvom mjestu</p>
                  </div>
                </div>
                <button onClick={() => setShowLocalSecurity(false)} aria-label="Zatvori" className="w-8 h-8 rounded-[4px] bg-[var(--c-hover)] hover:bg-[var(--c-active)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] transition-all">
                  <i className="fa-solid fa-xmark text-sm" aria-hidden="true"></i>
                </button>
              </div>

              {/* BODY */}
              <div className="flex-1 flex flex-col px-4 md:px-6 py-4 md:py-5 gap-4 md:gap-5 min-h-0 overflow-y-auto">

                {/* TOP ROW: Hero + Stats */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 shrink-0">
                  <div className="flex-1">
                    <h2 id="security-modal-title" className="text-2xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-2 md:mb-3">
                      SIGURNO<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-500">KUPUJ &amp; PRODAJ.</span>
                    </h2>
                    <div className="w-10 h-[3px] bg-emerald-500 mb-3"></div>
                    <p className="text-[12px] text-[var(--c-text2)] leading-relaxed max-w-[380px]">
                      Naš AI sistem štiti svaku transakciju. Prepoznajemo prevare, lažne oglase i sumnjive korisnike — prije nego što ti moraš.
                    </p>
                  </div>
                  <div className="hidden md:flex gap-3 shrink-0">
                    <div className="w-36 bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-4">
                      <i className="fa-solid fa-shield-halved text-[var(--c-text3)] text-xl mb-3 block"></i>
                      <p className="text-3xl font-black text-[var(--c-text)] leading-none mb-1">24/7</p>
                      <p className="text-[11px] font-semibold text-[var(--c-text3)] uppercase tracking-wider">AI Monitoring</p>
                    </div>
                    <div className="w-36 bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-4">
                      <i className="fa-solid fa-lock text-[var(--c-text3)] text-xl mb-3 block"></i>
                      <p className="text-3xl font-black text-[var(--c-text)] leading-none mb-1">256</p>
                      <p className="text-[11px] font-semibold text-[var(--c-text3)] uppercase tracking-wider">Bit Enkripcija</p>
                    </div>
                  </div>
                </div>

                {/* SECTION LABEL */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-8 h-[2px] bg-emerald-500"></div>
                  <p className="text-[11px] font-bold text-[var(--c-text3)] uppercase tracking-wider">Kako te štitimo?</p>
                </div>

                {/* FEATURE CARDS — responsive grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 flex-1 min-h-0">
                  <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-4 md:p-5 relative overflow-hidden hover:border-blue-500/40 transition-colors flex flex-col">
                    <div className="absolute top-0 right-0 w-14 h-14 bg-blue-500/20 rounded-bl-[35px]"></div>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-3 md:mb-4 shrink-0">
                      <i className="fa-solid fa-user-shield text-blue-400 text-xs md:text-sm"></i>
                    </div>
                    <h3 className="text-[10px] md:text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-1.5 md:mb-2">Anti-Scam Detekcija</h3>
                    <p className="text-[9px] md:text-[10px] text-[var(--c-text3)] leading-relaxed">
                      AI skenira svaki oglas i poruku u realnom vremenu. <span className="text-[var(--c-text)] font-bold">Sumnjive aktivnosti</span> se automatski označavaju i blokiraju.
                    </p>
                  </div>

                  <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-4 md:p-5 relative overflow-hidden hover:border-emerald-500/40 transition-colors flex flex-col">
                    <div className="absolute top-0 right-0 w-14 h-14 bg-emerald-500/20 rounded-bl-[35px]"></div>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-[4px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-3 md:mb-4 shrink-0">
                      <i className="fa-solid fa-fingerprint text-emerald-400 text-xs md:text-sm"></i>
                    </div>
                    <h3 className="text-[10px] md:text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-1.5 md:mb-2">Verifikacija Identiteta</h3>
                    <p className="text-[9px] md:text-[10px] text-[var(--c-text3)] leading-relaxed">
                      Sistem verificira korisnike kroz više nivoa provjere. <span className="text-[var(--c-text)] font-bold">Trust Score</span> ocjenjuje pouzdanost svakog prodavca.
                    </p>
                  </div>

                  <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-4 md:p-5 relative overflow-hidden hover:border-purple-500/40 transition-colors flex flex-col">
                    <div className="absolute top-0 right-0 w-14 h-14 bg-purple-500/20 rounded-bl-[35px]"></div>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-[4px] bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-3 md:mb-4 shrink-0">
                      <i className="fa-solid fa-comment-slash text-purple-400 text-xs md:text-sm"></i>
                    </div>
                    <h3 className="text-[10px] md:text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-1.5 md:mb-2">Smart Chat Filter</h3>
                    <p className="text-[9px] md:text-[10px] text-[var(--c-text3)] leading-relaxed">
                      AI analizira poruke i detektuje <span className="text-[var(--c-text)] font-bold">phishing linkove</span>, lažne ponude i pokušaje preusmjeravanja van platforme.
                    </p>
                  </div>
                </div>

                {/* BOTTOM QUOTE */}
                <div className="shrink-0 text-center pt-3 md:pt-4 border-t border-[var(--c-border)]">
                  <p className="text-sm md:text-lg font-black text-[var(--c-text)] uppercase tracking-tight mb-1">
                    &ldquo;Tvoja sigurnost je naš prioritet.&rdquo;
                  </p>
                  <p className="text-[10px] md:text-[11px] font-semibold text-[var(--c-text3)] uppercase tracking-wider">Powered by NudiNađi AI Security</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STICKY HEADER SECTION */}
        <div className="sticky top-14 md:top-16 z-30 bg-[var(--c-glass)] backdrop-blur-[12px] -mx-4 px-4 pt-2 md:pt-3 pb-0 border-b border-[var(--c-border)] shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-all">

          {/* TOP ROW: Security right */}
          <div className="flex items-center justify-end mb-2 px-1">
            <button
              onClick={() => setShowLocalSecurity(true)}
              aria-label="Otvori informacije o AI sigurnosti"
              aria-expanded={showLocalSecurity}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--c-text3)] hover:text-[var(--c-accent)] transition-all duration-150"
            >
              <i className="fa-solid fa-shield-halved text-[11px]" aria-hidden="true"></i>
              <span className="hidden sm:inline">Sigurnost</span>
            </button>
          </div>

          {/* SEARCH BAR with Hamburger Menu */}
          <div className="flex justify-center mb-3">
            <div className="flex gap-2 w-full max-w-[480px]">
              {/* Hamburger Menu → Opens All Categories */}
              <button
                onClick={() => setShowAllCatsPopup(true)}
                aria-label="Otvori sve kategorije"
                aria-expanded={showAllCatsPopup}
                aria-haspopup="dialog"
                className="relative z-10 bg-white border border-[var(--c-border)] w-[44px] rounded-[14px] flex items-center justify-center hover:bg-[var(--c-hover)] transition-all duration-150 active:scale-95 group shadow-subtle shrink-0"
              >
                <i className="fa-solid fa-bars text-[var(--c-text3)] text-[16px] group-hover:text-[var(--c-accent)] transition-colors" aria-hidden="true"></i>
              </button>
              <div className="relative flex-1 group">
                {isAiSearching
                  ? <i className="fa-solid fa-spinner animate-spin absolute left-4 top-1/2 -translate-y-1/2 text-[var(--c-accent)] text-[13px] z-10"></i>
                  : <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[var(--c-text3)] text-[13px] group-focus-within:text-[var(--c-accent)] transition-colors z-10"></i>
                }
                <input
                  type="text"
                  role="combobox"
                  aria-label="Pretraži oglase"
                  aria-expanded={showSearchHints}
                  aria-autocomplete="list"
                  placeholder="Pretraži oglase..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSmartSearch(searchQuery); }}
                  onFocus={() => setShowSearchHints(true)}
                  onBlur={() => setTimeout(() => setShowSearchHints(false), 150)}
                  className="relative z-10 w-full bg-white border border-[var(--c-border)] rounded-[14px] py-3 pl-11 pr-4 text-[14px] focus:ring-2 focus:ring-[var(--c-accent)] focus:border-[var(--c-accent)] outline-none text-[var(--c-text)] placeholder:text-[var(--c-text3)] transition-all duration-150 shadow-subtle"
                />

                {/* AI SUGGESTIONS DROPDOWN — shown after Enter */}
                {showSearchHints && searchQuery && aiSearchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-[200] bg-white border border-[var(--c-border)] rounded-[14px] shadow-strong overflow-hidden animate-fadeIn">
                    <div className="px-4 pt-3 pb-2 flex items-center gap-2 border-b border-[var(--c-border)]">
                      <i className="fa-solid fa-wand-magic-sparkles text-purple-500 text-[11px]"></i>
                      <p className="text-[12px] font-bold text-[var(--c-text2)] uppercase tracking-wider">AI prijedlozi</p>
                    </div>
                    <div className="p-3 flex flex-col gap-1">
                      {aiSearchSuggestions.map((s) => (
                        <button
                          key={s}
                          onMouseDown={() => { handleSearchChange(s); handleSmartSearch(s); }}
                          className="text-left px-3 py-2 rounded-[6px] text-[13px] font-medium text-[var(--c-text2)] hover:bg-[var(--c-accent-light)] hover:text-[var(--c-accent)] transition-all duration-150"
                        >
                          <i className="fa-solid fa-arrow-trend-up text-[10px] mr-2 text-[var(--c-text-muted)]"></i>{s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI SEARCH HINTS DROPDOWN */}
                {showSearchHints && !searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-[200] bg-white border border-[var(--c-border)] rounded-[14px] shadow-strong overflow-hidden animate-fadeIn">
                    {/* Header */}
                    <div className="px-4 pt-4 pb-2 flex items-center gap-2 border-b border-[var(--c-border)]">
                      <div className="w-7 h-7 rounded-[4px] bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-wand-magic-sparkles text-purple-500 text-[11px]"></i>
                      </div>
                      <div>
                        <p className="text-[13px] font-extrabold text-[var(--c-text)] uppercase tracking-wide">NudiNađi AI Pretraga</p>
                        <p className="text-[11px] text-purple-500 font-semibold uppercase tracking-wider">Napiši prirodno — AI razumije</p>
                      </div>
                    </div>

                    {/* Example chips */}
                    <div className="px-4 py-3 border-b border-[var(--c-border)]">
                      <p className="text-[11px] font-semibold text-[var(--c-text3)] uppercase tracking-wider mb-2">Probaj ovako →</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'BMW 320 Limousine',
                          'Stan Sarajevo 80m²',
                          'iPhone 15 Pro Max',
                          'Laptop ispod 800',
                          'od 10.000 do 25.000',
                          'Sofa kao nova',
                        ].map((ex) => (
                          <button
                            key={ex}
                            onMouseDown={() => { handleSearchChange(ex); setShowSearchHints(false); }}
                            className="px-2.5 py-1 bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-[4px] text-[12px] font-semibold text-[var(--c-text2)] hover:bg-[var(--c-accent-light)] hover:border-[var(--c-accent)]/20 hover:text-[var(--c-accent)] transition-all duration-150"
                          >
                            {ex}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* AI capabilities */}
                    <div className="px-4 py-3 space-y-2.5">
                      {[
                        { icon: 'fa-tags', color: 'text-blue-500', bg: 'bg-blue-50', label: 'Auto-kategorija', desc: '"bmw 320" → automatski na Vozila' },
                        { icon: 'fa-euro-sign', color: 'text-green-500', bg: 'bg-green-50', label: 'Raspon cijena', desc: '"10.000 do 25.000" ili "ispod 5000"' },
                        { icon: 'fa-spell-check', color: 'text-orange-500', bg: 'bg-orange-50', label: 'Greške OK', desc: '"iphone" = "iPhone", "bmv" ≈ "BMW"' },
                        { icon: 'fa-location-dot', color: 'text-red-500', bg: 'bg-red-50', label: 'Lokacija', desc: '"stan Sarajevo" → grad automatski' },
                      ].map((feat) => (
                        <div key={feat.label} className="flex items-start gap-2.5">
                          <div className={`w-6 h-6 rounded-[4px] ${feat.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                            <i className={`fa-solid ${feat.icon} ${feat.color} text-[10px]`}></i>
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-[var(--c-text)]">{feat.label}</p>
                            <p className="text-[11px] text-[var(--c-text3)]">{feat.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
              <button
                onClick={() => setShowAiInfo(true)}
                aria-label="Otvori informacije o AI pretrazi"
                aria-expanded={showAiInfo}
                aria-haspopup="dialog"
                className="relative z-10 bg-white border border-[var(--c-border)] w-[44px] rounded-[14px] flex items-center justify-center hover:bg-[var(--c-hover)] transition-all duration-150 active:scale-95 group shadow-subtle shrink-0"
              >
                <i className="fa-solid fa-wand-magic-sparkles text-[var(--c-accent)] text-[14px]" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          {/* AI-parsed indicators — shown between search bar and location bar */}
          {searchQuery && (aiPriceMin || aiPriceMax || aiCategory || aiCondition || aiCorrectedQuery) && (
            <div className="flex flex-col items-center gap-1 mb-1.5">
              {/* Typo correction banner */}
              {aiCorrectedQuery && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200 rounded-[10px] max-w-[480px] w-fit">
                  <i className="fa-solid fa-wand-magic-sparkles text-purple-500 text-[10px]"></i>
                  <span className="text-[11px] text-purple-500">Tražili ste: </span>
                  <span className="text-[11px] font-bold text-purple-400 line-through">{aiCorrectedQuery}</span>
                  <i className="fa-solid fa-arrow-right text-purple-400 text-[9px]"></i>
                  <span className="text-[11px] font-bold text-purple-700">{searchQuery}</span>
                </div>
              )}
              {/* Filter chips */}
              <div className="flex flex-wrap gap-1.5 px-1 max-w-[480px] w-full">
                {aiCategory && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-[10px]">
                    <i className="fa-solid fa-tags text-blue-500 text-[10px]"></i>
                    <span className="text-[11px] font-bold text-blue-600">{aiCategory}</span>
                  </div>
                )}
                {(aiPriceMin || aiPriceMax) && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-green-50 border border-green-200 rounded-[10px]">
                    <i className="fa-solid fa-euro-sign text-green-500 text-[10px]"></i>
                    <span className="text-[11px] font-bold text-green-600">
                      {aiPriceMin && aiPriceMax ? `${aiPriceMin.toLocaleString()} – ${aiPriceMax.toLocaleString()}` :
                       aiPriceMax ? `do ${aiPriceMax.toLocaleString()}` :
                       `od ${aiPriceMin?.toLocaleString()}`}
                    </span>
                  </div>
                )}
                {aiCondition && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-[10px]">
                    <i className="fa-solid fa-circle-check text-orange-500 text-[10px]"></i>
                    <span className="text-[11px] font-bold text-orange-600">{aiCondition}</span>
                  </div>
                )}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setAiPriceMin(undefined);
                    setAiPriceMax(undefined);
                    setAiCategory(null);
                    setAiCondition(null);
                    setAiCorrectedQuery(null);
                    setFilters(prev => ({ ...prev, condition: 'all' }));
                    handleCategoryChange('Sve');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-[10px] hover:bg-red-50 hover:border-red-200 transition-all duration-150"
                >
                  <i className="fa-solid fa-xmark text-[var(--c-text3)] text-[10px]"></i>
                  <span className="text-[11px] text-[var(--c-text3)]">Reset AI</span>
                </button>
              </div>
            </div>
          )}

          {/* LOCATION BAR */}
          <div className="flex justify-center mb-2">
            <button
              onClick={() => setShowLocationPicker(true)}
              className="flex items-center gap-2 px-4 py-1.5 bg-white border border-[var(--c-border)] rounded-[12px] text-[12px] font-semibold text-[var(--c-text2)] hover:text-[var(--c-text)] hover:bg-[var(--c-hover)] transition-all duration-150 active:scale-95 shadow-subtle"
            >
              <i className="fa-solid fa-location-dot text-[var(--c-accent)] text-[11px]"></i>
              <span>{selectedLocation ? selectedLocation.name : 'Sve Lokacije'}</span>
              {selectedLocation && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); setSelectedLocation(null); if (typeof window !== 'undefined') localStorage.removeItem('nudinadi_location'); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); setSelectedLocation(null); if (typeof window !== 'undefined') localStorage.removeItem('nudinadi_location'); }}}
                  aria-label="Ukloni odabranu lokaciju"
                  className="ml-1 w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 cursor-pointer"
                >
                  <i className="fa-solid fa-xmark text-[7px]" aria-hidden="true"></i>
                </span>
              )}
              {!selectedLocation && <i className="fa-solid fa-chevron-down text-[8px] text-gray-300"></i>}
            </button>
          </div>

          {/* PRIMARY CATEGORIES */}
          <div className="flex justify-center w-full">
            <div className="overflow-x-auto no-scrollbar w-full max-w-5xl touch-pan-x pb-2 pr-6">
              <div className="flex gap-2.5 px-1 md:justify-center min-w-max">

                {/* "Sve Kategorije" Reset */}
                <button
                  onClick={() => handleCategoryChange('Sve')}
                  className={`min-w-[80px] h-[80px] rounded-[6px] border relative overflow-hidden group transition-all duration-150 shrink-0 shadow-subtle ${
                    activeCategory === 'Sve'
                      ? 'border-[var(--c-text)] ring-1 ring-[var(--c-text)]/20 z-10 shadow-medium'
                      : 'border-[var(--c-border)] hover:border-[var(--c-active)] hover:shadow-medium'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={CATEGORY_IMAGES['kategorije']} alt="Categories" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                    <div className="w-7 h-7 rounded-[4px] bg-black/30 flex items-center justify-center">
                      <i className="fa-solid fa-layer-group text-white text-sm"></i>
                    </div>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-2 text-center">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">Sve</span>
                  </div>
                </button>

                {primaryCategories.map((cat) => (
                  <CategoryButton key={cat.id} cat={cat} isActive={activeCategory === cat.name} onClick={() => handleCategoryChange(cat.name)} />
                ))}
              </div>
            </div>
          </div>

          {/* "VIŠE" Button */}
          <div className="flex justify-center pb-2">
            <button
              onClick={() => setShowSecondaryCats(!showSecondaryCats)}
              aria-expanded={showSecondaryCats}
              aria-label={showSecondaryCats ? 'Sakrij dodatne kategorije' : 'Prikaži više kategorija'}
              className="flex items-center gap-2 px-6 py-1.5 bg-white border border-[var(--c-border)] rounded-[12px] text-[12px] font-semibold text-[var(--c-text2)] hover:text-[var(--c-text)] hover:bg-[var(--c-hover)] transition-all duration-150 active:scale-95 shadow-subtle"
            >
              <span>{showSecondaryCats ? 'Manje' : 'Više kategorija'}</span>
              <i className={`fa-solid fa-chevron-down transition-transform ${showSecondaryCats ? 'rotate-180' : ''}`} aria-hidden="true"></i>
            </button>
          </div>

          {/* SECONDARY CATEGORIES */}
          {showSecondaryCats && (
            <div className="animate-fadeIn border-t border-gray-100 pt-2 pb-2">
              <div className="overflow-x-auto no-scrollbar touch-pan-x">
                <div className="flex gap-2 px-1 justify-center flex-wrap">
                  {secondaryCategories.map((cat) => (
                    <CategoryButton key={cat.id} cat={cat} isActive={activeCategory === cat.name} onClick={() => handleCategoryChange(cat.name)} flexible />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ALL CATEGORIES POPUP (3-Level Split-Pane Modal) */}
        {showAllCatsPopup && (() => {
          const selectedCategory = CATEGORIES.find(c => c.id === selectedCatId) || CATEGORIES[0];
          const selectedSubGroupData = selectedCategory.subCategories.find(s => s.name === selectedSubGroup);
          const showThirdLevel = !!(selectedSubGroup && selectedSubGroupData?.items?.length);

          return (
            <div role="dialog" aria-modal="true" aria-label="Sve kategorije" className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6">
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowAllCatsPopup(false); setSelectedSubGroup(null); }} onKeyDown={(e) => { if (e.key === 'Escape') { setShowAllCatsPopup(false); setSelectedSubGroup(null); }}} role="presentation"></div>

              {/* Modal Container */}
              <div className="relative w-full h-full md:h-[85vh] md:max-w-5xl bg-white md:rounded-[10px] md:border md:border-[var(--c-border)] overflow-hidden flex flex-col animate-scaleIn shadow-strong">

                {/* Header */}
                <div className="shrink-0 px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    {showThirdLevel && (
                      <button
                        onClick={() => setSelectedSubGroup(null)}
                        aria-label="Nazad na potkategorije"
                        className="w-8 h-8 rounded-[4px] bg-[var(--c-card-alt)] flex items-center justify-center text-[var(--c-text2)] hover:bg-[var(--c-active)] transition-all duration-150"
                      >
                        <i className="fa-solid fa-arrow-left text-xs" aria-hidden="true"></i>
                      </button>
                    )}
                    <div>
                      <h3 className="text-lg font-black text-gray-900 leading-none">
                        {showThirdLevel ? selectedSubGroup : 'Kategorije'}
                      </h3>
                      <p className="text-[11px] text-[var(--c-text3)] uppercase tracking-wider mt-0.5">
                        {showThirdLevel
                          ? `${selectedCategory.name} › ${selectedSubGroup}`
                          : `${CATEGORIES.length} kategorija`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowAllCatsPopup(false); setSelectedSubGroup(null); }}
                    aria-label="Zatvori kategorije"
                    className="w-10 h-10 rounded-[6px] bg-[var(--c-card-alt)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-active)] transition-all duration-150"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>

                {/* Split Content */}
                <div className="flex flex-1 overflow-hidden border-t border-gray-100">

                  {/* LEFT SIDEBAR — hidden on mobile when 3rd level is shown */}
                  <div className={`${showThirdLevel ? 'hidden md:flex' : 'flex'} flex-col w-[85px] md:w-[260px] bg-gray-50 border-r border-gray-100 overflow-y-auto no-scrollbar pb-24`}>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCatId(cat.id); setSelectedSubGroup(null); }}
                        className={`w-full p-4 md:px-5 md:py-4 flex flex-col md:flex-row items-center md:gap-3 border-b border-gray-100 transition-all relative group ${
                          selectedCatId === cat.id
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-[var(--c-text3)] hover:bg-[var(--c-hover)] hover:text-[var(--c-text2)]'
                        }`}
                      >
                        {selectedCatId === cat.id && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                        )}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${selectedCatId === cat.id ? 'bg-blue-50' : 'bg-transparent'}`}>
                          <i className={`fa-solid ${cat.icon} text-sm`}></i>
                        </div>
                        <span className="text-[9px] md:text-[12px] font-bold uppercase md:capitalize text-center md:text-left mt-1 md:mt-0 leading-tight">
                          {cat.name}
                        </span>
                        <i className={`hidden md:block fa-solid fa-chevron-right ml-auto text-[10px] ${selectedCatId === cat.id ? 'text-blue-500' : 'text-gray-300 opacity-0 group-hover:opacity-100'}`}></i>
                      </button>
                    ))}
                  </div>

                  {/* MIDDLE CONTENT — Sub-category groups */}
                  {!showThirdLevel && (
                    <div className="flex-1 bg-white overflow-y-auto p-4 md:p-6 pb-24 relative">

                      {/* Selected Category Header */}
                      <div className="mb-6 flex items-center gap-3 relative z-10">
                        <div className="w-12 h-12 rounded-[6px] blue-gradient flex items-center justify-center text-white shadow-accent">
                          <i className={`fa-solid ${selectedCategory.icon} text-lg`}></i>
                        </div>
                        <div>
                          <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none mb-0.5">{selectedCategory.name}</h1>
                          <p className="text-[12px] text-[var(--c-accent)] font-semibold uppercase tracking-wider">{selectedCategory.subCategories.length} Potkategorija</p>
                        </div>
                      </div>

                      {/* Subcategories Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 animate-[fadeIn_0.2s_ease-out]">
                        {/* "Show All" Option */}
                        <button
                          onClick={() => { handleCategoryChange(selectedCategory.name); setShowAllCatsPopup(false); setSelectedSubGroup(null); }}
                          className="col-span-full text-left blue-gradient text-white p-3.5 rounded-[6px] flex justify-between items-center shadow-accent mb-1 hover:brightness-110 active:scale-[0.99] transition-all duration-150 group"
                        >
                          <span className="text-[12px] font-bold uppercase tracking-wider">Prikaži sve u {selectedCategory.name}</span>
                          <div className="w-6 h-6 bg-white/20 rounded-[4px] flex items-center justify-center">
                            <i className="fa-solid fa-arrow-right text-[10px]"></i>
                          </div>
                        </button>

                        {selectedCategory.subCategories.map((sub, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              if (sub.items?.length) {
                                setSelectedSubGroup(sub.name);
                              } else {
                                handleCategoryChange(selectedCategory.name);
                                setShowAllCatsPopup(false);
                                setSelectedSubGroup(null);
                              }
                            }}
                            className="text-left bg-[var(--c-card-alt)] border border-[var(--c-border)] p-3.5 rounded-[6px] flex justify-between items-center hover:bg-white hover:border-[var(--c-active)] hover:shadow-subtle transition-all duration-150 group active:scale-[0.99]"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[12px] font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{sub.name}</span>
                              {sub.items?.length && (
                                <span className="text-[11px] text-[var(--c-text3)]">{sub.items.length} stavki</span>
                              )}
                            </div>
                            <i className={`fa-solid ${sub.items?.length ? 'fa-chevron-right' : 'fa-arrow-right'} text-[10px] text-gray-300 group-hover:text-blue-500 transition-colors`}></i>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* THIRD LEVEL — Detailed items within sub-group */}
                  {showThirdLevel && selectedSubGroupData && (
                    <div className="flex-1 bg-white overflow-y-auto p-4 md:p-6 pb-24 relative animate-fadeIn">

                      {/* Sub-group header */}
                      <div className="mb-5 relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-semibold text-[var(--c-text3)] uppercase tracking-wider">{selectedCategory.name}</span>
                          <i className="fa-solid fa-chevron-right text-[9px] text-[var(--c-text-muted)]"></i>
                          <span className="text-[11px] font-semibold text-[var(--c-accent)] uppercase tracking-wider">{selectedSubGroup}</span>
                        </div>
                        <h2 className="text-xl font-black text-gray-900">{selectedSubGroup}</h2>
                        <p className="text-[12px] text-[var(--c-text3)] mt-0.5">{selectedSubGroupData.items!.length} kategorija</p>
                      </div>

                      {/* "Show all in sub-group" button */}
                      <button
                        onClick={() => { handleCategoryChange(selectedCategory.name); setShowAllCatsPopup(false); setSelectedSubGroup(null); }}
                        className="w-full text-left blue-gradient text-white p-3.5 rounded-[6px] flex justify-between items-center shadow-accent mb-3 hover:brightness-110 active:scale-[0.99] transition-all duration-150 group"
                      >
                        <span className="text-[12px] font-bold uppercase tracking-wider">Prikaži sve u {selectedSubGroup}</span>
                        <div className="w-6 h-6 bg-white/20 rounded-[4px] flex items-center justify-center">
                          <i className="fa-solid fa-arrow-right text-[10px]"></i>
                        </div>
                      </button>

                      {/* Detailed items grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedSubGroupData.items!.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => { handleCategoryChange(selectedCategory.name); setShowAllCatsPopup(false); setSelectedSubGroup(null); }}
                            className="text-left bg-[var(--c-card-alt)] border border-[var(--c-border)] px-4 py-3 rounded-[6px] flex justify-between items-center hover:bg-white hover:border-[var(--c-accent)]/30 hover:shadow-subtle transition-all duration-150 group active:scale-[0.99]"
                          >
                            <span className="text-[12px] font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">{item}</span>
                            <i className="fa-solid fa-arrow-right text-[9px] text-gray-200 group-hover:text-blue-500 transition-colors"></i>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* VEHICLES CAROUSEL */}
        {vehicleProducts.length > 0 && (
          <div className="pt-6 pl-1 md:pl-0">
            <div className="flex justify-between items-end mb-3 pr-2">
              <div>
                <h2 className="text-lg font-extrabold text-[var(--c-text)] leading-none tracking-tight">Vozila</h2>
                <p className="text-[12px] text-[var(--c-text3)] mt-1 font-medium">Izdvojeno iz ponude</p>
              </div>
              <button
                onClick={() => handleCategoryChange('Vozila')}
                className="text-[12px] font-semibold text-[var(--c-accent)] hover:text-[var(--c-accent-hover)] transition-colors duration-150"
              >
                Vidi sve
              </button>
            </div>
            <div className="flex overflow-x-auto no-scrollbar gap-3 pb-4 pr-4">
              {vehicleProducts.slice(0, 10).map((p) => (
                <div key={`vozila-${p.id}`} className="min-w-[180px] w-[180px] shrink-0 cursor-pointer" onClick={() => handleProductClick(p.id)}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCT GRID */}
        <div className="pt-2">
          <div className="flex justify-between items-end mb-4 px-1">
            <div>
              <h2 className="text-lg font-extrabold text-[var(--c-text)] leading-none tracking-tight">Istraži</h2>
              <p className="text-[12px] text-[var(--c-text3)] mt-1 font-medium">
                {totalCount > 0 ? `${displayedProducts.length} od ${totalCount} oglasa` : 'Najnovije iz ponude'}
              </p>
            </div>
            <button
              onClick={() => setShowFilterModal(true)}
              className="relative text-[12px] font-semibold text-[var(--c-accent)] hover:text-[var(--c-accent-hover)] transition-all duration-150 bg-[var(--c-accent-light)] px-3 py-1 rounded-[12px] border border-[var(--c-accent)]/20 flex items-center gap-1.5"
            >
              <i className="fa-solid fa-sliders text-[11px]"></i>
              Filteri
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[var(--c-accent)] text-white text-[9px] font-bold flex items-center justify-center -mr-0.5">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {isLoadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-[var(--c-card-alt)] rounded-[14px] h-[220px] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-4">
              {displayedProducts.map((p) => (
                <div key={p.id} className="cursor-pointer" onClick={() => handleProductClick(p.id)}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}

          {/* Infinite Scroll Trigger */}
          {!isLoadingProducts && hasMore && displayedProducts.length > 0 && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {isLoadingMore && (
                <div className="flex items-center gap-2 text-[var(--c-text3)]">
                  <i className="fa-solid fa-spinner animate-spin text-blue-500"></i>
                  <span className="text-[12px] font-semibold uppercase tracking-wider">Učitavanje...</span>
                </div>
              )}
            </div>
          )}

          {!isLoadingProducts && !hasMore && displayedProducts.length > PRODUCTS_PER_PAGE && (
            <div className="flex justify-center py-6">
              <p className="text-[12px] text-[var(--c-text3)] font-semibold uppercase tracking-wider">Prikazani svi oglasi</p>
            </div>
          )}

          {!isLoadingProducts && displayedProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-[14px] bg-[var(--c-card-alt)] border border-[var(--c-border)] flex items-center justify-center mb-4">
                <i className="fa-solid fa-ghost text-2xl text-[var(--c-text-muted)]"></i>
              </div>
              <h3 className="text-sm font-bold text-[var(--c-text)] mb-1">Nema rezultata</h3>
              <p className="text-[12px] text-[var(--c-text3)] max-w-[200px]">Pokušaj promijeniti filtere ili kategoriju.</p>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="mt-4 px-4 py-2 bg-[var(--c-accent-light)] border border-[var(--c-accent)]/20 rounded-[6px] text-[12px] font-semibold text-[var(--c-accent)] hover:bg-[var(--c-accent)]/10 transition-all duration-150"
                >
                  <i className="fa-solid fa-rotate-left mr-1.5"></i> Resetuj filtere
                </button>
              )}
            </div>
          )}
        </div>

        {/* LOCATION PICKER MODAL */}
        <LocationPicker
          isOpen={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onSelect={setSelectedLocation}
          currentCity={selectedLocation}
        />

        {/* FILTER MODAL */}
        <FilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApply={handleApplyFilters}
          currentFilters={filters}
          locationName={selectedLocation?.name || null}
          onLocationClick={() => { setShowFilterModal(false); setTimeout(() => setShowLocationPicker(true), 200); }}
          onDetectGPS={handleDetectGPS}
          isDetectingGPS={isDetectingGPS}
        />
      </div>
    </MainLayout>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
