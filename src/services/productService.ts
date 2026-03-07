import { getSupabase } from '@/lib/supabase'
import type {
  Product, ProductInsert, ProductUpdate,
  ProductWithSeller, ProductFull, ProductStatus,
} from '@/lib/database.types'
import { CITIES } from '@/lib/location'
import type { CountryPreference } from '@/lib/country'
import { getPlanLimits } from '@/lib/plans'

const supabase = getSupabase()

// ─── City→Country lookup for filtering ───────────────
const BIH_CITIES = CITIES.filter(c => c.country === 'BiH').map(c => c.name)
const HR_CITIES = CITIES.filter(c => c.country === 'HR').map(c => c.name)

// ─── Filter Options ───────────────────────────────────

export interface ProductFilters {
  category_id?: string
  category_ids?: string[]  // Multiple category IDs (parent + subcategories)
  status?: ProductStatus
  seller_id?: string
  condition?: string
  minPrice?: number
  maxPrice?: number
  location?: string
  country?: CountryPreference  // Country filter: 'ba' | 'hr' | 'all'
  search?: string
  sortBy?: 'created_at' | 'price' | 'views_count' | 'favorites_count'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
  /** Category-specific attribute filters (JSONB) */
  attributes?: Record<string, string | number | boolean | [number, number]>
}

// Lightweight select for list views (avoids fetching all profile/category columns)
const LIST_SELECT = 'id,title,price,images,condition,location,views_count,favorites_count,created_at,status,seller_id,category_id,attributes,promoted_until,seller:profiles!seller_id(id,username,avatar_url,rating_average,account_type),category:categories!category_id(id,name,slug,icon)'

// ─── Get All Products (with filters) ──────────────────

export async function getProducts(filters: ProductFilters = {}): Promise<{ data: ProductFull[]; count: number }> {
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
  if (filters.minPrice !== undefined) query = query.gte('price', filters.minPrice)
  if (filters.maxPrice !== undefined) query = query.lte('price', filters.maxPrice)
  if (filters.location) query = query.ilike('location', `%${filters.location}%`)
  if (filters.country === 'ba') query = query.in('location', BIH_CITIES)
  if (filters.country === 'hr') query = query.in('location', HR_CITIES)
  if (filters.search) {
    // Full-text search via tsvector (search_vector column, powered by title+tags+description)
    query = query.textSearch('search_vector', filters.search, { config: 'simple', type: 'plain' })
  }

  // JSONB attribute filters (category-specific)
  if (filters.attributes) {
    for (const [key, value] of Object.entries(filters.attributes)) {
      if (value === undefined || value === null) continue
      if (typeof value === 'boolean') {
        // Boolean: (attributes->>'key')::boolean = true
        query = query.eq(`attributes->>${key}`, String(value))
      } else if (Array.isArray(value)) {
        // Range: [min, max]
        const [min, max] = value
        if (min) query = query.gte(`attributes->>${key}`, min)
        if (max) query = query.lte(`attributes->>${key}`, max)
      } else {
        // String or number exact match
        query = query.eq(`attributes->>${key}`, String(value))
      }
    }
  }

  // Sorting — promoted products appear first for default sort
  const sortBy = filters.sortBy || 'created_at'
  const sortOrder = filters.sortOrder || 'desc'
  if (sortBy === 'created_at') {
    // Promoted first, then by date
    query = query.order('promoted_until', { ascending: false, nullsFirst: false })
  }
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // Pagination
  const limit = filters.limit || 20
  const offset = filters.offset || 0
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) throw error
  return { data: (data ?? []) as unknown as ProductFull[], count: count ?? 0 }
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
  return updateProduct(id, { status: 'sold' })
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
    console.warn('increment_views RPC failed:', error.message)
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
    console.warn('search_suggestions RPC failed:', error.message)
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

  // Return in same order as input IDs
  const map = new Map((data ?? []).map((p: { id: string }) => [p.id, p]))
  return ids.map(id => map.get(id)).filter(Boolean) as unknown as ProductFull[]
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
    console.warn('get_similar_products RPC failed:', error.message)
    return []
  }

  return (data ?? []) as SimilarProduct[]
}
