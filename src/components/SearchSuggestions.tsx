'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getSearchSuggestions, type SearchSuggestion } from '@/services/productService'
import { getAllCategories } from '@/services/categoryService'
import { lookupChassis, chassisLabel } from '@/lib/vehicle-chassis-codes'

interface SearchSuggestionsProps {
  query: string
  visible: boolean
  onSelectProduct: (id: string) => void
  onSelectCategory: (categoryName: string) => void
  onSelectSuggestion: (text: string) => void
}

export default function SearchSuggestions({
  query,
  visible,
  onSelectProduct,
  onSelectCategory,
  onSelectSuggestion,
}: SearchSuggestionsProps) {
  const [products, setProducts] = useState<SearchSuggestion[]>([])
  const [matchingCategories, setMatchingCategories] = useState<{ id: string; name: string; icon: string | null }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  // Chassis code lookup (instant, no debounce needed)
  const chassisMatches = useMemo(
    () => (visible && query.trim().length >= 2 ? lookupChassis(query) : []),
    [query, visible]
  )

  const doSearch = useCallback(async (q: string) => {
    // Cancel any previous in-flight request
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    if (q.trim().length < 2) {
      setProducts([])
      setMatchingCategories([])
      return
    }

    setIsLoading(true)
    try {
      // Parallel: product suggestions + category matching
      const [suggestions, allCats] = await Promise.all([
        getSearchSuggestions(q, 5),
        getAllCategories(),
      ])

      if (controller.signal.aborted) return

      setProducts(suggestions)

      // Match categories by name (case-insensitive)
      const lowerQ = q.toLowerCase()
      const cats = allCats
        .filter(c => !c.parent_category_id && c.name.toLowerCase().includes(lowerQ))
        .slice(0, 3)
      setMatchingCategories(cats)
    } catch {
      if (!controller.signal.aborted) {
        setProducts([])
        setMatchingCategories([])
      }
    } finally {
      if (!controller.signal.aborted) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!visible) return

    // Debounce 300ms
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(query), 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, visible, doSearch])

  // Cleanup abort on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  if (!visible || query.trim().length < 2) return null

  const hasResults = products.length > 0 || matchingCategories.length > 0 || chassisMatches.length > 0

  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-[200] bg-[var(--c-card)] border border-[var(--c-border)] rounded-[14px] shadow-strong overflow-hidden animate-fadeIn">
      {isLoading && chassisMatches.length === 0 && (
        <div className="px-4 py-3 flex items-center gap-2">
          <i className="fa-solid fa-spinner animate-spin text-[var(--c-accent)] text-[12px]"></i>
          <span className="text-[12px] text-[var(--c-text3)]">Tražim...</span>
        </div>
      )}

      {!isLoading && !hasResults && (
        <div className="px-4 py-3 text-[12px] text-[var(--c-text3)]">
          Nema rezultata za &quot;{query}&quot; — pritisni Enter za AI pretragu
        </div>
      )}

      {/* Vehicle chassis code matches (instant, shown first) */}
      {chassisMatches.length > 0 && (
        <div>
          <div className="px-4 pt-3 pb-1.5">
            <p className="text-[11px] font-bold text-[var(--c-text3)] uppercase tracking-wider">Vozila</p>
          </div>
          <div className="px-3 pb-2 flex flex-col gap-0.5">
            {chassisMatches.slice(0, 3).map((match, idx) => (
              <button
                key={idx}
                onMouseDown={() => {
                  // Search for this vehicle in the Vozila category
                  const searchText = `${match.brand} ${match.model}${match.variant ? ' ' + match.variant : ''}`
                  onSelectCategory('Vozila')
                  onSelectSuggestion(searchText)
                }}
                className="text-left px-3 py-2 rounded-[8px] text-[13px] font-medium text-[var(--c-text2)] hover:bg-blue-500/10 hover:text-blue-500 transition-all duration-150 flex items-center gap-2.5"
              >
                <i className="fa-solid fa-car text-[12px] text-blue-400" aria-hidden="true"></i>
                <span className="truncate">{chassisLabel(match)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category matches */}
      {matchingCategories.length > 0 && (
        <div>
          {chassisMatches.length > 0 && <div className="border-t border-[var(--c-border)]"></div>}
          <div className="px-4 pt-3 pb-1.5">
            <p className="text-[11px] font-bold text-[var(--c-text3)] uppercase tracking-wider">Kategorije</p>
          </div>
          <div className="px-3 pb-2 flex flex-col gap-0.5">
            {matchingCategories.map(cat => (
              <button
                key={cat.id}
                onMouseDown={() => onSelectCategory(cat.name)}
                className="text-left px-3 py-2 rounded-[8px] text-[13px] font-medium text-[var(--c-text2)] hover:bg-[var(--c-accent-light)] hover:text-[var(--c-accent)] transition-all duration-150 flex items-center gap-2.5"
              >
                {cat.icon && <i className={`${cat.icon} text-[12px] text-[var(--c-text3)]`} aria-hidden="true"></i>}
                <span>Traži u: <strong>{cat.name}</strong></span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Product matches */}
      {products.length > 0 && (
        <div>
          {(matchingCategories.length > 0 || chassisMatches.length > 0) && <div className="border-t border-[var(--c-border)]"></div>}
          <div className="px-4 pt-3 pb-1.5">
            <p className="text-[11px] font-bold text-[var(--c-text3)] uppercase tracking-wider">Proizvodi</p>
          </div>
          <div className="px-3 pb-2 flex flex-col gap-0.5">
            {products.map(p => (
              <button
                key={p.id}
                onMouseDown={() => {
                  onSelectProduct(p.id)
                  router.push(`/product/${p.id}`)
                }}
                className="text-left px-2 py-2 rounded-[8px] hover:bg-[var(--c-accent-light)] transition-all duration-150 flex items-center gap-3"
              >
                {/* Product thumbnail */}
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt=""
                    className="w-10 h-10 rounded-[6px] object-cover bg-[var(--c-card-alt)] shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-[6px] bg-[var(--c-card-alt)] flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-image text-[var(--c-text3)] text-[12px]"></i>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-[var(--c-text)] truncate">{p.title}</p>
                  <p className="text-[12px] font-bold text-[var(--c-accent)]">{p.price.toLocaleString('de-DE')} €</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Enter hint */}
      {hasResults && (
        <div className="border-t border-[var(--c-border)] px-4 py-2 flex items-center gap-2">
          <i className="fa-solid fa-wand-magic-sparkles text-purple-500 text-[10px]"></i>
          <span className="text-[11px] text-[var(--c-text3)]">Pritisni <strong>Enter</strong> za AI pametnu pretragu</span>
        </div>
      )}
    </div>
  )
}
