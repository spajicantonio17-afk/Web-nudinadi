import { getSupabase } from '@/lib/supabase'
import type {
  Product, ProductInsert, ProductUpdate,
  ProductWithSeller, ProductFull, ProductStatus,
} from '@/lib/database.types'

const supabase = getSupabase()

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
  search?: string
  sortBy?: 'created_at' | 'price' | 'views_count' | 'favorites_count'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

// Lightweight select for list views (avoids fetching all profile/category columns)
const LIST_SELECT = 'id,title,price,images,condition,location,views_count,favorites_count,created_at,status,seller_id,category_id,attributes,seller:profiles!seller_id(id,username,avatar_url,rating_average),category:categories!category_id(id,name,slug,icon)'

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
  if (filters.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)

  // Sorting
  const sortBy = filters.sortBy || 'created_at'
  const sortOrder = filters.sortOrder || 'desc'
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
