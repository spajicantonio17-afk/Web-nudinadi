import { getSupabase } from '@/lib/supabase'
import type { Category } from '@/lib/database.types'

const supabase = getSupabase()

// Cache um wiederholte Lookups zu vermeiden
let allCategoryCache: Category[] | null = null

// ─── Get All Categories (inkl. Unterkategorien, gecacht) ─

export async function getAllCategories(): Promise<Category[]> {
  if (allCategoryCache) return allCategoryCache

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) throw error
  allCategoryCache = data ?? []
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

// ─── Resolve Display Name → Category UUID ─────────────

/**
 * Löst einen Anzeige-Kategorienamen in eine Supabase-Kategorie-UUID auf.
 * Verarbeitet zusammengesetzte Namen wie "Nekretnine - Stanovi i Apartmani"
 * indem zuerst nach der Unterkategorie gesucht wird, dann Fallback auf Elternkategorie.
 */
export async function resolveCategoryId(displayName: string): Promise<string | null> {
  if (!displayName) return null

  const categories = await getAllCategories()

  // 1. Exakte Übereinstimmung mit Name
  const exact = categories.find(c => c.name === displayName)
  if (exact) return exact.id

  // 2. Zusammengesetzte Namen wie "Nekretnine - Stanovi i Apartmani"
  if (displayName.includes(' - ')) {
    const parts = displayName.split(' - ')
    const subName = parts.slice(1).join(' - ').trim()
    const sub = categories.find(c => c.name === subName)
    if (sub) return sub.id

    // Fallback: Elternkategorie
    const parentName = parts[0].trim()
    const parent = categories.find(c => c.name === parentName)
    if (parent) return parent.id
  }

  // 3. Fuzzy: Groß-/Kleinschreibung ignorierend
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
