import { getSupabase } from '@/lib/supabase'
import type { Category } from '@/lib/database.types'

const supabase = getSupabase()

// Cache with 5-minute TTL to avoid stale data
let allCategoryCache: Category[] | null = null
let categoryCacheTime = 0
const CACHE_TTL = 5 * 60 * 1000

// ─── Get All Categories (inkl. Unterkategorien, gecacht) ─

export async function getAllCategories(): Promise<Category[]> {
  if (allCategoryCache && Date.now() - categoryCacheTime < CACHE_TTL) return allCategoryCache

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) throw error
  allCategoryCache = data ?? []
  categoryCacheTime = Date.now()
  return allCategoryCache
}

// ─── Get Top-Level Categories ─────────────────────────

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .is('parent_category_id', null)
    .order('name')

  if (error) throw error
  return data
}

// ─── Alias map: upload page names → DB names ───────────
const CATEGORY_ALIASES: Record<string, string> = {
  'dijelovi za vozila': 'Dijelovi za automobile',
  'mobilni uređaji': 'Mobiteli i oprema',
  'elektronika': 'Tehnika i elektronika',
  'moda': 'Odjeća i obuća',
}

// ─── Resolve Display Name → Category UUID ─────────────

/**
 * Resolves a display category name to a Supabase category UUID.
 * Handles composite names like "Nekretnine - Stanovi", alias names
 * (e.g. "Dijelovi za vozila" → "Dijelovi za automobile"), and fuzzy matching.
 */
export async function resolveCategoryId(displayName: string): Promise<string | null> {
  if (!displayName) return null

  const categories = await getAllCategories()

  // 1. Exact match
  const exact = categories.find(c => c.name === displayName)
  if (exact) return exact.id

  // 2. Alias resolution (upload page uses different names than DB)
  const aliasTarget = CATEGORY_ALIASES[displayName.toLowerCase()]
  if (aliasTarget) {
    const aliased = categories.find(c => c.name === aliasTarget)
    if (aliased) return aliased.id
  }

  // 3. Composite names like "Nekretnine - Stanovi" or "Elektronika - Laptopi"
  if (displayName.includes(' - ')) {
    const parts = displayName.split(' - ')
    const subName = parts.slice(1).join(' - ').trim()
    const sub = categories.find(c => c.name === subName)
    if (sub) return sub.id

    // Try alias for parent part
    const parentName = parts[0].trim()
    const parentAlias = CATEGORY_ALIASES[parentName.toLowerCase()]
    if (parentAlias) {
      const aliasedParent = categories.find(c => c.name === parentAlias)
      if (aliasedParent) return aliasedParent.id
    }

    // Fallback: parent category direct match
    const parent = categories.find(c => c.name === parentName)
    if (parent) return parent.id
  }

  // 4. Fuzzy: case-insensitive includes matching
  const lower = displayName.toLowerCase()
  const fuzzy = categories.find(c =>
    c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase())
  )
  if (fuzzy) return fuzzy.id

  return null
}

// ─── Get Category by Slug ─────────────────────────────

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data
}

// ─── Get Category by ID ──────────────────────────────

export async function getCategoryById(id: string): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// ─── Get Sub-Categories ───────────────────────────────

export async function getSubCategories(parentId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_category_id', parentId)
    .order('name')

  if (error) throw error
  return data
}

// ─── Get Categories with Product Count ────────────────

export async function getCategoriesWithCount(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .is('parent_category_id', null)
    .order('product_count', { ascending: false })

  if (error) throw error
  return data
}
