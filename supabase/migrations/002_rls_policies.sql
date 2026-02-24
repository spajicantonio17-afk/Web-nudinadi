-- =============================================
-- NudiNađi - Migration 002: Row Level Security
-- =============================================
-- Run this AFTER 001_enums_and_tables.sql

-- ─── Enable RLS on all tables ─────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- ─── PROFILES ─────────────────────────────────────────

-- Anyone can view profiles
CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profile is auto-created via trigger (see migration 003)
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ─── PRODUCTS ─────────────────────────────────────────

-- Anyone can view active products
CREATE POLICY "products_select_active"
  ON products FOR SELECT
  USING (status = 'active' OR seller_id = auth.uid());

-- Authenticated users can create products
CREATE POLICY "products_insert_auth"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Only the seller can update their products
CREATE POLICY "products_update_own"
  ON products FOR UPDATE
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Only the seller can delete their products
CREATE POLICY "products_delete_own"
  ON products FOR DELETE
  USING (auth.uid() = seller_id);

-- ─── CATEGORIES ───────────────────────────────────────

-- Anyone can read categories (public data)
CREATE POLICY "categories_select_public"
  ON categories FOR SELECT
  USING (true);

-- ─── REVIEWS ──────────────────────────────────────────

-- Anyone can read reviews
CREATE POLICY "reviews_select_public"
  ON reviews FOR SELECT
  USING (true);

-- Authenticated users can create reviews (not for themselves)
CREATE POLICY "reviews_insert_auth"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND auth.uid() <> reviewed_user_id
  );

-- Only the reviewer can update their review
CREATE POLICY "reviews_update_own"
  ON reviews FOR UPDATE
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

-- Only the reviewer can delete their review
CREATE POLICY "reviews_delete_own"
  ON reviews FOR DELETE
  USING (auth.uid() = reviewer_id);

-- ─── USER ACTIVITIES ──────────────────────────────────

-- Users can only see their own activities
CREATE POLICY "activities_select_own"
  ON user_activities FOR SELECT
  USING (auth.uid() = user_id);

-- Activities are inserted by the system (via service role) or by the user
CREATE POLICY "activities_insert_own"
  ON user_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─── CONVERSATIONS ───────────────────────────────────

-- Users can only see conversations they're part of
CREATE POLICY "conversations_select_participant"
  ON conversations FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Authenticated users can create conversations
CREATE POLICY "conversations_insert_auth"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Participants can update (e.g. last_message_at)
CREATE POLICY "conversations_update_participant"
  ON conversations FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ─── MESSAGES ─────────────────────────────────────────

-- Users can only see messages in their conversations
CREATE POLICY "messages_select_participant"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

-- Only conversation participants can send messages
CREATE POLICY "messages_insert_participant"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

-- Recipients can mark messages as read
CREATE POLICY "messages_update_read"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

-- ─── FAVORITES ────────────────────────────────────────

-- Users can only see their own favorites
CREATE POLICY "favorites_select_own"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Authenticated users can add favorites
CREATE POLICY "favorites_insert_own"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only remove their own favorites
CREATE POLICY "favorites_delete_own"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
