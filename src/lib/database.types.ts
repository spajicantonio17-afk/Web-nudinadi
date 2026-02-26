// ===========================================
// NudiNađi - Supabase Database Types
// ===========================================
// Auto-generated types for all database tables.
// Keep in sync with Supabase schema (supabase/migrations/).

// ─── Enums ────────────────────────────────────────────

export type ProductStatus = 'active' | 'sold' | 'draft'

export type ProductCondition = 'new' | 'like_new' | 'used'

export type ActivityType = 'upload' | 'sale' | 'purchase' | 'review' | 'login'

export type ModerationStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'escalated'

export type ReportReason = 'spam' | 'scam' | 'prohibited_content' | 'duplicate' | 'inappropriate' | 'fake_listing' | 'personal_info' | 'other'

export type ModerationActionType = 'approve' | 'reject' | 'warn' | 'ban' | 'unban' | 'escalate' | 'dismiss'

// ─── Table Row Types ──────────────────────────────────

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  phone: string | null
  email_verified: boolean
  level: number
  xp: number
  total_sales: number
  total_purchases: number
  rating_average: number | null
  location: string | null
  instagram_url: string | null
  facebook_url: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  seller_id: string
  title: string
  description: string | null
  price: number
  category_id: string | null
  condition: ProductCondition
  images: string[]
  status: ProductStatus
  location: string | null
  views_count: number
  favorites_count: number
  created_at: string
  updated_at: string
  attributes?: Record<string, string | number | boolean | string[]> | null
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  icon_url: string | null
  parent_category_id: string | null
  product_count: number
  created_at: string
}

export interface Review {
  id: string
  reviewer_id: string
  reviewed_user_id: string
  product_id: string | null
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
}

export interface UserActivity {
  id: string
  user_id: string
  activity_type: ActivityType
  xp_earned: number
  created_at: string
}

export interface Conversation {
  id: string
  user1_id: string
  user2_id: string
  product_id: string | null
  last_message_at: string | null
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  product_id: string
  created_at: string
}

// ─── Insert Types (for creating new rows) ─────────────

export interface ProfileInsert {
  id: string
  username: string
  full_name?: string | null
  avatar_url?: string | null
  bio?: string | null
  phone?: string | null
  email_verified?: boolean
  level?: number
  xp?: number
  total_sales?: number
  total_purchases?: number
  rating_average?: number | null
  location?: string | null
}

export interface ProductInsert {
  id?: string
  seller_id: string
  title: string
  description?: string | null
  price: number
  category_id?: string | null
  condition?: ProductCondition
  images?: string[]
  status?: ProductStatus
  location?: string | null
  attributes?: Record<string, string | number | boolean | string[]> | null
}

export interface CategoryInsert {
  id?: string
  name: string
  slug: string
  icon?: string | null
  icon_url?: string | null
  parent_category_id?: string | null
  product_count?: number
}

export interface ReviewInsert {
  id?: string
  reviewer_id: string
  reviewed_user_id: string
  product_id?: string | null
  rating: number
  comment?: string | null
}

export interface UserActivityInsert {
  id?: string
  user_id: string
  activity_type: ActivityType
  xp_earned: number
}

export interface ConversationInsert {
  id?: string
  user1_id: string
  user2_id: string
  product_id?: string | null
}

export interface MessageInsert {
  id?: string
  conversation_id: string
  sender_id: string
  content: string
  is_read?: boolean
}

export interface FavoriteInsert {
  id?: string
  user_id: string
  product_id: string
}

// ─── Update Types (partial for updates) ───────────────

export interface ProfileUpdate {
  username?: string
  full_name?: string | null
  avatar_url?: string | null
  bio?: string | null
  phone?: string | null
  email_verified?: boolean
  location?: string | null
  instagram_url?: string | null
  facebook_url?: string | null
}

export interface ProductUpdate {
  title?: string
  description?: string | null
  price?: number
  category_id?: string | null
  condition?: ProductCondition
  images?: string[]
  status?: ProductStatus
  location?: string | null
  attributes?: Record<string, unknown> | null
}

export interface ReviewUpdate {
  rating?: number
  comment?: string | null
}

// ─── Joined/Extended Types ────────────────────────────

export interface ProductWithSeller extends Product {
  seller: Profile
}

export interface ProductWithCategory extends Product {
  category: Category | null
}

export interface ProductFull extends Product {
  seller: Profile
  category: Category | null
}

export interface ReviewWithUsers extends Review {
  reviewer: Profile
  reviewed_user: Profile
}

export interface ConversationWithUsers extends Conversation {
  user1: Profile
  user2: Profile
  last_message?: Message | null
}

export interface MessageWithSender extends Message {
  sender: Profile
}

export interface FavoriteWithProduct extends Favorite {
  product: Product
}

// ─── Moderation Table Types ─────────────────────────

export interface ModerationReport {
  id: string
  product_id: string | null
  reported_user_id: string | null
  reporter_id: string | null
  reason: ReportReason
  description: string | null
  ai_moderation_result: Record<string, unknown> | null
  ai_score: number | null
  status: ModerationStatus
  priority: number
  assigned_admin_id: string | null
  resolved_at: string | null
  resolution_note: string | null
  created_at: string
  updated_at: string
}

export interface ModerationAction {
  id: string
  report_id: string | null
  admin_id: string
  action_type: ModerationActionType
  target_user_id: string | null
  target_product_id: string | null
  reason: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface UserWarning {
  id: string
  user_id: string
  admin_id: string
  report_id: string | null
  reason: string
  severity: number
  acknowledged: boolean
  created_at: string
}

export interface UserBan {
  id: string
  user_id: string
  admin_id: string
  reason: string
  banned_at: string
  expires_at: string | null
  is_active: boolean
  unbanned_at: string | null
  unbanned_by: string | null
  created_at: string
}

export interface AiModerationLog {
  id: string
  product_id: string | null
  user_id: string | null
  action: string
  input_data: Record<string, unknown>
  result_data: Record<string, unknown>
  score: number | null
  is_flagged: boolean
  processing_time_ms: number | null
  created_at: string
}

// ─── Moderation Insert Types ────────────────────────

export interface ModerationReportInsert {
  id?: string
  product_id?: string | null
  reported_user_id?: string | null
  reporter_id?: string | null
  reason: ReportReason
  description?: string | null
  ai_moderation_result?: Record<string, unknown> | null
  ai_score?: number | null
  status?: ModerationStatus
  priority?: number
  assigned_admin_id?: string | null
}

export interface ModerationActionInsert {
  id?: string
  report_id?: string | null
  admin_id: string
  action_type: ModerationActionType
  target_user_id?: string | null
  target_product_id?: string | null
  reason?: string | null
  metadata?: Record<string, unknown> | null
}

export interface UserWarningInsert {
  id?: string
  user_id: string
  admin_id: string
  report_id?: string | null
  reason: string
  severity?: number
}

export interface UserBanInsert {
  id?: string
  user_id: string
  admin_id: string
  reason: string
  expires_at?: string | null
}

export interface AiModerationLogInsert {
  id?: string
  product_id?: string | null
  user_id?: string | null
  action: string
  input_data: Record<string, unknown>
  result_data: Record<string, unknown>
  score?: number | null
  is_flagged?: boolean
  processing_time_ms?: number | null
}

// ─── Moderation Joined Types ────────────────────────

export interface ModerationReportFull extends ModerationReport {
  product?: Product | null
  reported_user?: Profile | null
  reporter?: Profile | null
  assigned_admin?: Profile | null
}

export interface UserWarningWithAdmin extends UserWarning {
  admin: Profile
}

export interface UserBanWithAdmin extends UserBan {
  admin: Profile
}

// ─── Supabase Database Type Map ───────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
        Relationships: []
      }
      products: {
        Row: Product
        Insert: ProductInsert
        Update: ProductUpdate
        Relationships: []
      }
      categories: {
        Row: Category
        Insert: CategoryInsert
        Update: Partial<CategoryInsert>
        Relationships: []
      }
      reviews: {
        Row: Review
        Insert: ReviewInsert
        Update: ReviewUpdate
        Relationships: []
      }
      user_activities: {
        Row: UserActivity
        Insert: UserActivityInsert
        Update: Partial<UserActivityInsert>
        Relationships: []
      }
      conversations: {
        Row: Conversation
        Insert: ConversationInsert
        Update: Partial<ConversationInsert>
        Relationships: []
      }
      messages: {
        Row: Message
        Insert: MessageInsert
        Update: Partial<MessageInsert>
        Relationships: []
      }
      favorites: {
        Row: Favorite
        Insert: FavoriteInsert
        Update: Partial<FavoriteInsert>
        Relationships: []
      }
      moderation_reports: {
        Row: ModerationReport
        Insert: ModerationReportInsert
        Update: Partial<ModerationReportInsert>
        Relationships: []
      }
      moderation_actions: {
        Row: ModerationAction
        Insert: ModerationActionInsert
        Update: Partial<ModerationActionInsert>
        Relationships: []
      }
      user_warnings: {
        Row: UserWarning
        Insert: UserWarningInsert
        Update: Partial<UserWarningInsert>
        Relationships: []
      }
      user_bans: {
        Row: UserBan
        Insert: UserBanInsert
        Update: Partial<UserBanInsert>
        Relationships: []
      }
      ai_moderation_logs: {
        Row: AiModerationLog
        Insert: AiModerationLogInsert
        Update: Partial<AiModerationLogInsert>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      product_status: ProductStatus
      product_condition: ProductCondition
      activity_type: ActivityType
      moderation_status: ModerationStatus
      report_reason: ReportReason
      moderation_action_type: ModerationActionType
    }
    CompositeTypes: Record<string, never>
  }
}

// ─── XP & Level Constants ─────────────────────────────

export const XP_REWARDS = {
  upload: 10,
  sale: 50,
  purchase: 20,
  review_5_stars: 20,
  review_4_stars: 15,
  review_3_stars: 10,
  daily_login: 5,
} as const

export const LEVEL_THRESHOLDS = [
  { level: 1, minXp: 0, maxXp: 99 },
  { level: 2, minXp: 100, maxXp: 249 },
  { level: 3, minXp: 250, maxXp: 499 },
  { level: 4, minXp: 500, maxXp: 999 },
  { level: 5, minXp: 1000, maxXp: 1999 },
  { level: 6, minXp: 2000, maxXp: 3999 },
  { level: 7, minXp: 4000, maxXp: 7999 },
  { level: 8, minXp: 8000, maxXp: 15999 },
  { level: 9, minXp: 16000, maxXp: 31999 },
  { level: 10, minXp: 32000, maxXp: Infinity },
] as const

export function calculateLevel(xp: number): number {
  const entry = LEVEL_THRESHOLDS.find(t => xp >= t.minXp && xp <= t.maxXp)
  return entry?.level ?? 1
}

export function xpForNextLevel(xp: number): { current: number; needed: number; progress: number } {
  const currentLevel = LEVEL_THRESHOLDS.find(t => xp >= t.minXp && xp <= t.maxXp)
  if (!currentLevel || currentLevel.maxXp === Infinity) {
    return { current: xp, needed: 0, progress: 100 }
  }
  const rangeSize = currentLevel.maxXp - currentLevel.minXp + 1
  const progressInRange = xp - currentLevel.minXp
  return {
    current: progressInRange,
    needed: rangeSize,
    progress: Math.round((progressInRange / rangeSize) * 100),
  }
}
