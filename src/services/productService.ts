import { getSupabase } from '@/lib/supabase'
import type {
  Product, ProductInsert, ProductUpdate,
  ProductWithSeller, ProductFull, ProductStatus, ListingType,
} from '@/lib/database.types'
import type { CountryPreference } from '@/lib/country'
import { getPlanLimits } from '@/lib/plans'
import { logger } from '@/lib/logger'

const supabase = getSupabase()

// ─── Product query cache (30s TTL, max 20 entries) ───
const _queryCache = new Map<string, { data: ProductFull[]; count: number; ts: number }>()
const QUERY_CACHE_TTL = 30_000

function _cacheKey(filters: ProductFilters): string {
  return JSON.stringify(Object.fromEntries(Object.entries(filters).sort()))
}

function _getCached(filters: ProductFilters) {
  // Only cache plain browse queries — search & seller pages always fetch fresh
  if (filters.search || filters.searchKeywords?.length || filters.seller_id) return null
  const entry = _queryCache.get(_cacheKey(filters))
  return entry && Date.now() - entry.ts < QUERY_CACHE_TTL ? entry : null
}

function _setCached(filters: ProductFilters, data: ProductFull[], count: number) {
  if (filters.search || filters.searchKeywords?.length || filters.seller_id) return
  if (_queryCache.size >= 20) _queryCache.delete(_queryCache.keys().next().value!)
  _queryCache.set(_cacheKey(filters), { data, count, ts: Date.now() })
}

export function clearProductCache() { _queryCache.clear() }

// ─── City→Country lookup for filtering ───────────────

// ─── Filter Options ───────────────────────────────────

export interface ProductFilters {
  category_id?: string
  category_ids?: string[]  // Multiple category IDs (parent + subcategories)
  status?: ProductStatus
  seller_id?: string
  condition?: string
  listing_type?: ListingType
  minPrice?: number
  maxPrice?: number
  location?: string
  country?: CountryPreference  // Country filter: 'ba' | 'hr' | 'all'
  search?: string
  /** Extra keywords/synonyms from AI to broaden search (OR'd with search) */
  searchKeywords?: string[]
  sortBy?: 'created_at' | 'price' | 'views_count' | 'favorites_count'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
  /** Category-specific attribute filters (JSONB) */
  attributes?: Record<string, string | number | boolean | [number, number]>
}

// List views: NO PostgREST embeds — seller/category fetched separately.
// PostgREST embeds silently filter products in list queries (works fine with .single()).
const LIST_SELECT = 'id,title,description,price,currency,country,condition,listing_type,location,images,status,views_count,favorites_count,promoted_until,created_at,updated_at,tags,attributes,seller_id,category_id'

// ─── Enrich products with seller + category (batch) ──

async function enrichProducts(products: Record<string, unknown>[]): Promise<ProductFull[]> {
  if (!products.length) return []

  const sellerIds = [...new Set(products.map(p => p.seller_id as string).filter(Boolean))]
  const categoryIds = [...new Set(products.map(p => p.category_id as string).filter(Boolean))]

  const [sellersRes, categoriesRes] = await Promise.all([
    sellerIds.length > 0
      ? supabase.from('profiles').select('*').in('id', sellerIds)
      : { data: [], error: null },
    categoryIds.length > 0
      ? supabase.from('categories').select('*').in('id', categoryIds)
      : { data: [], error: null },
  ])

  if (sellersRes.error) logger.warn('enrichProducts profiles fetch failed:', sellersRes.error.message)
  if (categoriesRes.error) logger.warn('enrichProducts categories fetch failed:', categoriesRes.error.message)

  const sellerMap = new Map((sellersRes.data ?? []).map((s: { id: string }) => [s.id, s]))
  const categoryMap = new Map((categoriesRes.data ?? []).map((c: { id: string }) => [c.id, c]))

  return products.map(p => ({
    ...p,
    seller: sellerMap.get(p.seller_id as string) ?? null,
    category: categoryMap.get(p.category_id as string) ?? null,
  })) as unknown as ProductFull[]
}

// ─── Get All Products (with filters) ──────────────────

export async function getProducts(filters: ProductFilters = {}): Promise<{ data: ProductFull[]; count: number }> {
  const cached = _getCached(filters)
  if (cached) return { data: cached.data, count: cached.count }

  let query = supabase
    .from('products')
    .select(LIST_SELECT, { count: 'exact' })

  // Apply filters
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.category_ids && filters.category_ids.length > 0) {
    query = query.in('category_id', filters.category_ids)
  } else if (filters.category_id) {
    query = query.eq('category_id', filters.category_id)
  }
  if (filters.seller_id) query = query.eq('seller_id', filters.seller_id)
  if (filters.condition) query = query.eq('condition', filters.condition)
  if (filters.listing_type) query = query.eq('listing_type', filters.listing_type)
  if (filters.minPrice !== undefined) query = query.gte('price', filters.minPrice)
  if (filters.maxPrice !== undefined) query = query.lte('price', filters.maxPrice)
  if (filters.location) query = query.ilike('location', `%${filters.location}%`)
  if (filters.country === 'ba') {
    query = query.eq('country', 'ba')
  }
  if (filters.country === 'hr') {
    query = query.eq('country', 'hr')
  }
  if (filters.country === 'rs') {
    query = query.eq('country', 'rs')
  }
  if (filters.search) {
    // Use flexible_search RPC for AND→OR fallback with synonym support
    const hasExtraKeywords = filters.searchKeywords && filters.searchKeywords.length > 0
    if (hasExtraKeywords || filters.search.split(/\s+/).length > 1) {
      // Multi-word or keyword-expanded search: use flexible_search for OR fallback
      const { data: searchIds } = await supabase.rpc('flexible_search', {
        p_query: filters.search,
        p_extra_keywords: filters.searchKeywords ?? [],
        p_limit: (filters.limit || 20) + (filters.offset || 0) + 10, // fetch enough for pagination
        p_offset: 0,
      })
      if (searchIds && searchIds.length > 0) {
        const ids = searchIds.map((r: { product_id: string }) => r.product_id)
        query = query.in('id', ids)
      } else {
        // No results from flexible search — force empty result
        query = query.in('id', ['00000000-0000-0000-0000-000000000000'])
      }
    } else {
      // Single word: simple prefix search is fine
      query = query.textSearch('search_vector', filters.search, { config: 'simple', type: 'plain' })
    }
  }

  // JSONB attribute filters (category-specific)
  if (filters.attributes) {
    for (const [key, value] of Object.entries(filters.attributes)) {
      if (value === undefined || value === null) continue
      if (typeof value === 'boolean') {
        query = query.eq(`attributes->>${key}`, String(value))
      } else if (Array.isArray(value)) {
        const [min, max] = value
        if (min) query = query.gte(`attributes->>${key}`, min)
        if (max) query = query.lte(`attributes->>${key}`, max)
      } else {
        query = query.eq(`attributes->>${key}`, String(value))
      }
    }
  }

  // Sorting — promoted products appear first for default sort
  const sortBy = filters.sortBy || 'created_at'
  const sortOrder = filters.sortOrder || 'desc'
  if (sortBy === 'created_at') {
    query = query.order('promoted_until', { ascending: false, nullsFirst: false })
  }
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // Pagination
  const limit = filters.limit || 20
  const offset = filters.offset || 0
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) throw error

  const enriched = await enrichProducts((data ?? []) as Record<string, unknown>[])

  // Apply search boost: Pro/Business sellers' products rank higher in default sort
  if (!filters.sortBy || filters.sortBy === 'created_at') {
    const now = new Date()
    enriched.sort((a, b) => {
      const aPromoted = a.promoted_until && new Date(a.promoted_until) > now ? 1 : 0
      const bPromoted = b.promoted_until && new Date(b.promoted_until) > now ? 1 : 0
      if (aPromoted !== bPromoted) return bPromoted - aPromoted

      const aType = (a.seller as unknown as Record<string, unknown> | null)?.account_type as string | undefined
      const bType = (b.seller as unknown as Record<string, unknown> | null)?.account_type as string | undefined
      const boostMap: Record<string, number> = { business: 2, pro: 1 }
      const aBoost = boostMap[aType || ''] || 0
      const bBoost = boostMap[bType || ''] || 0
      return bBoost - aBoost
    })
  }

  _setCached(filters, enriched, count ?? 0)
  return { data: enriched, count: count ?? 0 }
}

// ─── Get Single Product ───────────────────────────────

export async function getProductById(id: string): Promise<ProductFull> {
  const { data, error } = await supabase
    .from('products')
    .select('*, seller:profiles!seller_id(*), category:categories!category_id(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as unknown as ProductFull
}

// ─── Create Product ───────────────────────────────────

export async function createProduct(product: ProductInsert): Promise<Product> {
  // Enforce plan limits before inserting
  const { data: profile } = await supabase
    .from('profiles')
    .select('account_type')
    .eq('id', product.seller_id)
    .single()

  const limits = getPlanLimits(profile?.account_type)

  // Check active listing count
  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('seller_id', product.seller_id)
    .eq('status', 'active')

  if ((count ?? 0) >= limits.maxActiveListings) {
    throw new Error('LIMIT_REACHED')
  }

  // Check image count
  if (product.images && product.images.length > limits.maxImagesPerListing) {
    throw new Error('IMAGE_LIMIT_REACHED')
  }

  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()

  if (error) throw error
  clearProductCache()
  return data
}

// ─── Update Product ───────────────────────────────────

export async function updateProduct(id: string, updates: ProductUpdate): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  clearProductCache()
  return data
}

// ─── Delete Product ───────────────────────────────────

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ─── Mark as Sold ─────────────────────────────────────

export async function markProductAsSold(id: string): Promise<Product> {
  const supabase = getSupabase()

  // Fetch product owner before updating (needed for email notification)
  const { data: product } = await supabase
    .from('products')
    .select('user_id')
    .eq('id', id)
    .single()

  const result = await updateProduct(id, { status: 'sold' })

  // Fire & forget email notification to seller
  if (product?.user_id) {
    fetch('/api/notifications/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'product_sold', recipientId: product.user_id, productId: id }),
    }).catch(() => {/* non-critical */})
  }

  return result
}

// ─── Archive / Unarchive ──────────────────────────────

export async function archiveProduct(id: string): Promise<Product> {
  return updateProduct(id, { status: 'archived' })
}

export async function unarchiveProduct(id: string): Promise<Product> {
  return updateProduct(id, { status: 'active' })
}

// ─── Increment View Count ─────────────────────────────

export async function incrementViews(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_views', { p_product_id: id })
  if (error) {
    logger.warn('increment_views RPC failed:', error.message)
  }
}

// ─── Get Products by Category ─────────────────────────

export async function getProductsByCategory(categoryId: string, limit = 20): Promise<ProductFull[]> {
  const { data } = await getProducts({ category_id: categoryId, status: 'active', limit })
  return data
}

// ─── Search Products ──────────────────────────────────

export async function searchProducts(query: string, filters: Omit<ProductFilters, 'search'> = {}): Promise<{ data: ProductFull[]; count: number }> {
  return getProducts({ ...filters, search: query, status: 'active' })
}

// ─── Get User's Products ──────────────────────────────

export async function getUserProducts(userId: string): Promise<ProductFull[]> {
  const { data } = await getProducts({ seller_id: userId })
  return data
}

// ─── Autocomplete Suggestions (fast, no AI) ──────────

export interface SearchSuggestion {
  id: string
  title: string
  price: number
  images: string[]
  condition: string
  location: string | null
  category_id: string | null
  rank: number
}

export async function getSearchSuggestions(query: string, limit = 5): Promise<SearchSuggestion[]> {
  if (!query || query.trim().length < 2) return []

  const { data, error } = await supabase.rpc('search_suggestions', {
    p_query: query.trim(),
    p_limit: limit,
  })

  if (error) {
    logger.warn('search_suggestions RPC failed:', error.message)
    return []
  }

  return (data ?? []) as SearchSuggestion[]
}

// ─── Get Products by IDs (batch fetch) ───────────────

export async function getProductsByIds(ids: string[]): Promise<ProductFull[]> {
  if (!ids.length) return []

  const { data, error } = await supabase
    .from('products')
    .select(LIST_SELECT)
    .in('id', ids)

  if (error) throw error

  const enriched = await enrichProducts((data ?? []) as Record<string, unknown>[])

  // Return in same order as input IDs
  const map = new Map(enriched.map(p => [(p as unknown as { id: string }).id, p]))
  return ids.map(id => map.get(id)).filter(Boolean) as ProductFull[]
}

// ─── Similar Products (tag overlap + category) ───────

export interface SimilarProduct {
  id: string
  title: string
  price: number
  images: string[]
  condition: string
  location: string | null
  created_at: string
  seller_id: string
  category_id: string | null
  tag_overlap: number
}

// ─── Promote Product ─────────────────────────────────
export async function promoteProduct(productId: string, userId: string, days: number = 3): Promise<void> {
  // Deduct a promoted credit from the user
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('promoted_credits')
    .eq('id', userId)
    .single()

  if (profileError || !profile || (profile.promoted_credits ?? 0) < 1) {
    throw new Error('NO_CREDITS')
  }

  const until = new Date()
  until.setDate(until.getDate() + days)

  const { error } = await supabase
    .from('products')
    .update({ promoted_until: until.toISOString() })
    .eq('id', productId)
    .eq('seller_id', userId)

  if (error) throw error

  // Deduct credit
  await supabase
    .from('profiles')
    .update({ promoted_credits: (profile.promoted_credits ?? 1) - 1 })
    .eq('id', userId)
}

export function isPromoted(product: { promoted_until?: string | null }): boolean {
  return !!product.promoted_until && new Date(product.promoted_until) > new Date()
}

// ─── Get Active Listing Count ────────────────────────
export async function getActiveListingCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('seller_id', userId)
    .eq('status', 'active')
  return count ?? 0
}

// ─── Similar Products (tag overlap + category) ───────

export async function getSimilarProducts(
  productId: string,
  categoryId: string | null,
  tags: string[],
  price: number,
  limit = 6
): Promise<SimilarProduct[]> {
  const { data, error } = await supabase.rpc('get_similar_products', {
    p_product_id: productId,
    p_category_id: categoryId,
    p_tags: tags ?? [],
    p_price: price,
    p_limit: limit,
  })

  if (error) {
    logger.warn('get_similar_products RPC failed:', error.message)
    return []
  }

  return (data ?? []) as SimilarProduct[]
}
