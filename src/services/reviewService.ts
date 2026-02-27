import { getSupabase } from '@/lib/supabase'
import type { Review, ReviewInsert, ReviewUpdate, ReviewWithUsers } from '@/lib/database.types'
import { logActivity } from '@/services/levelService'

const supabase = getSupabase()

// ─── Get Reviews for a User ───────────────────────────

export async function getUserReviews(userId: string): Promise<ReviewWithUsers[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviewer_id(*), reviewed_user:profiles!reviewed_user_id(*)')
    .eq('reviewed_user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as unknown as ReviewWithUsers[]
}

// ─── Get Reviews by a User (reviews they wrote) ──────

export async function getReviewsByUser(userId: string): Promise<ReviewWithUsers[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviewer_id(*), reviewed_user:profiles!reviewed_user_id(*)')
    .eq('reviewer_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as unknown as ReviewWithUsers[]
}

// ─── Create Review ────────────────────────────────────

export async function createReview(review: ReviewInsert): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single()

  if (error) throw error

  // Award XP based on rating (non-critical — don't fail the review)
  try {
    await logActivity(review.reviewer_id, 'review', { rating: review.rating })
  } catch {
    // XP award failed silently
  }

  return data
}

// ─── Update Review ────────────────────────────────────

export async function updateReview(id: string, updates: ReviewUpdate): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Delete Review ────────────────────────────────────

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ─── Check if User Already Reviewed ───────────────────

export async function hasUserReviewed(reviewerId: string, reviewedUserId: string, productId?: string): Promise<boolean> {
  let query = supabase
    .from('reviews')
    .select('id')
    .eq('reviewer_id', reviewerId)
    .eq('reviewed_user_id', reviewedUserId)

  if (productId) query = query.eq('product_id', productId)

  const { data } = await query.maybeSingle()
  return !!data
}
