import { getSupabase } from '@/lib/supabase'
import type { Favorite, FavoriteWithProduct } from '@/lib/database.types'

const supabase = getSupabase()

// ─── Get User's Favorites ─────────────────────────────

export async function getFavorites(userId: string): Promise<FavoriteWithProduct[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('*, product:products!product_id(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as unknown as FavoriteWithProduct[]
}

// ─── Add Favorite ─────────────────────────────────────

export async function addFavorite(userId: string, productId: string): Promise<Favorite> {
  const { data, error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, product_id: productId })
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Remove Favorite ──────────────────────────────────

export async function removeFavorite(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)

  if (error) throw error
}

// ─── Toggle Favorite ──────────────────────────────────

export async function toggleFavorite(userId: string, productId: string): Promise<boolean> {
  const isFav = await isFavorite(userId, productId)

  if (isFav) {
    await removeFavorite(userId, productId)
    return false
  } else {
    await addFavorite(userId, productId)
    return true
  }
}

// ─── Check if Favorited ───────────────────────────────

export async function isFavorite(userId: string, productId: string): Promise<boolean> {
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle()

  return !!data
}

// ─── Get Favorite Count for Product ───────────────────

export async function getFavoriteCount(productId: string): Promise<number> {
  const { count, error } = await supabase
    .from('favorites')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', productId)

  if (error) throw error
  return count ?? 0
}
