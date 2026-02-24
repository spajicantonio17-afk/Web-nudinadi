-- =============================================
-- NudiNađi - KOMPLETTES DB SETUP (Schritt 1/2)
-- Kopiere alles und füge es im SQL Editor ein
-- =============================================

-- ═══════════════════════════════════════════════
-- MIGRATION 001: Enums & Tables
-- ═══════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE product_status AS ENUM ('active', 'sold', 'draft');
CREATE TYPE product_condition AS ENUM ('new', 'like_new', 'used');
CREATE TYPE activity_type AS ENUM ('upload', 'sale', 'purchase', 'review', 'login');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  level INTEGER DEFAULT 1 NOT NULL,
  xp INTEGER DEFAULT 0 NOT NULL,
  total_sales INTEGER DEFAULT 0 NOT NULL,
  total_purchases INTEGER DEFAULT 0 NOT NULL,
  rating_average NUMERIC(2,1),
  location TEXT,
  is_admin BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  icon_url TEXT,
  parent_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  product_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  condition product_condition DEFAULT 'used' NOT NULL,
  images TEXT[] DEFAULT '{}' NOT NULL,
  status product_status DEFAULT 'active' NOT NULL,
  location TEXT,
  views_count INTEGER DEFAULT 0 NOT NULL,
  favorites_count INTEGER DEFAULT 0 NOT NULL,
  attributes JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(reviewer_id, reviewed_user_id, product_id)
);

CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  xp_earned INTEGER NOT NULL CHECK (xp_earned >= 0),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user1_id, user2_id, product_id),
  CHECK (user1_id <> user2_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, product_id)
);

CREATE TABLE product_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  answered_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created ON products(created_at DESC);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_reviews_reviewed_user ON reviews(reviewed_user_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_activities_user ON user_activities(user_id);
CREATE INDEX idx_activities_type ON user_activities(activity_type);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX idx_conversations_last_msg ON conversations(last_message_at DESC);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_product ON favorites(product_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_category_id);
CREATE INDEX idx_questions_product ON product_questions(product_id);
CREATE INDEX idx_questions_user ON product_questions(user_id);

-- ═══════════════════════════════════════════════
-- MIGRATION 002: Row Level Security
-- ═══════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_questions ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Products
CREATE POLICY "products_select_active" ON products FOR SELECT USING (status = 'active' OR seller_id = auth.uid());
CREATE POLICY "products_insert_auth" ON products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "products_update_own" ON products FOR UPDATE USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "products_delete_own" ON products FOR DELETE USING (auth.uid() = seller_id);

-- Categories
CREATE POLICY "categories_select_public" ON categories FOR SELECT USING (true);

-- Reviews
CREATE POLICY "reviews_select_public" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_auth" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id AND auth.uid() <> reviewed_user_id);
CREATE POLICY "reviews_update_own" ON reviews FOR UPDATE USING (auth.uid() = reviewer_id) WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "reviews_delete_own" ON reviews FOR DELETE USING (auth.uid() = reviewer_id);

-- User Activities
CREATE POLICY "activities_select_own" ON user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "activities_insert_own" ON user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Conversations
CREATE POLICY "conversations_select_participant" ON conversations FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "conversations_insert_auth" ON conversations FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "conversations_update_participant" ON conversations FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Messages
CREATE POLICY "messages_select_participant" ON messages FOR SELECT USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())));
CREATE POLICY "messages_insert_participant" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())));
CREATE POLICY "messages_update_read" ON messages FOR UPDATE USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())));

-- Favorites
CREATE POLICY "favorites_select_own" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites_insert_own" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_delete_own" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Product Questions
CREATE POLICY "questions_select_public" ON product_questions FOR SELECT USING (true);
CREATE POLICY "questions_insert_auth" ON product_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "questions_update_seller" ON product_questions FOR UPDATE USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_questions.product_id AND p.seller_id = auth.uid()));
CREATE POLICY "questions_delete_own" ON product_questions FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- MIGRATION 003: Auto Profile Creation Trigger
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || LEFT(NEW.id::text, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════
-- MIGRATION 004: Storage Buckets
-- ═══════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('profile-avatars', 'profile-avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('product-videos', 'product-videos', true, 52428800, ARRAY['video/mp4', 'video/webm', 'video/quicktime']);

-- Storage Policies
CREATE POLICY "product_images_select_public" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "product_images_insert_auth" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "product_images_update_own" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "product_images_delete_own" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_select_public" ON storage.objects FOR SELECT USING (bucket_id = 'profile-avatars');
CREATE POLICY "avatars_insert_auth" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-avatars' AND auth.role() = 'authenticated');
CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars_delete_own" ON storage.objects FOR DELETE USING (bucket_id = 'profile-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "product_videos_select_public" ON storage.objects FOR SELECT USING (bucket_id = 'product-videos');
CREATE POLICY "product_videos_insert_auth" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-videos' AND auth.role() = 'authenticated');
CREATE POLICY "product_videos_update_own" ON storage.objects FOR UPDATE USING (bucket_id = 'product-videos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "product_videos_delete_own" ON storage.objects FOR DELETE USING (bucket_id = 'product-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ═══════════════════════════════════════════════
-- MIGRATION 005: Functions & Triggers
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_products BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_reviews BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- XP System
CREATE OR REPLACE FUNCTION calculate_user_level(user_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE
    WHEN user_xp >= 32000 THEN 10
    WHEN user_xp >= 16000 THEN 9
    WHEN user_xp >= 8000  THEN 8
    WHEN user_xp >= 4000  THEN 7
    WHEN user_xp >= 2000  THEN 6
    WHEN user_xp >= 1000  THEN 5
    WHEN user_xp >= 500   THEN 4
    WHEN user_xp >= 250   THEN 3
    WHEN user_xp >= 100   THEN 2
    ELSE 1
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION add_xp(p_user_id UUID, p_xp_amount INTEGER)
RETURNS TABLE(new_xp INTEGER, new_level INTEGER, leveled_up BOOLEAN) AS $$
DECLARE
  old_level INTEGER;
  current_xp INTEGER;
  computed_level INTEGER;
BEGIN
  SELECT xp, level INTO current_xp, old_level FROM profiles WHERE id = p_user_id;
  current_xp := current_xp + p_xp_amount;
  computed_level := calculate_user_level(current_xp);
  UPDATE profiles SET xp = current_xp, level = computed_level WHERE id = p_user_id;
  new_xp := current_xp;
  new_level := computed_level;
  leveled_up := computed_level > old_level;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION on_activity_inserted()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM add_xp(NEW.user_id, NEW.xp_earned);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_activity_xp AFTER INSERT ON user_activities FOR EACH ROW EXECUTE FUNCTION on_activity_inserted();

-- Category product count
CREATE OR REPLACE FUNCTION on_product_inserted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.category_id IS NOT NULL AND NEW.status = 'active' THEN
    UPDATE categories SET product_count = product_count + 1 WHERE id = NEW.category_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION on_product_updated()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.category_id IS DISTINCT FROM NEW.category_id OR OLD.status IS DISTINCT FROM NEW.status THEN
    IF OLD.category_id IS NOT NULL AND OLD.status = 'active' THEN
      UPDATE categories SET product_count = GREATEST(product_count - 1, 0) WHERE id = OLD.category_id;
    END IF;
    IF NEW.category_id IS NOT NULL AND NEW.status = 'active' THEN
      UPDATE categories SET product_count = product_count + 1 WHERE id = NEW.category_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION on_product_deleted()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.category_id IS NOT NULL AND OLD.status = 'active' THEN
    UPDATE categories SET product_count = GREATEST(product_count - 1, 0) WHERE id = OLD.category_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_product_count_insert AFTER INSERT ON products FOR EACH ROW EXECUTE FUNCTION on_product_inserted();
CREATE TRIGGER trigger_product_count_update AFTER UPDATE ON products FOR EACH ROW EXECUTE FUNCTION on_product_updated();
CREATE TRIGGER trigger_product_count_delete AFTER DELETE ON products FOR EACH ROW EXECUTE FUNCTION on_product_deleted();

-- Rating average
CREATE OR REPLACE FUNCTION update_rating_average()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
  avg_rating NUMERIC(2,1);
BEGIN
  IF TG_OP = 'DELETE' THEN target_user_id := OLD.reviewed_user_id;
  ELSE target_user_id := NEW.reviewed_user_id; END IF;
  SELECT ROUND(AVG(rating)::numeric, 1) INTO avg_rating FROM reviews WHERE reviewed_user_id = target_user_id;
  UPDATE profiles SET rating_average = avg_rating WHERE id = target_user_id;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_rating_avg_insert AFTER INSERT ON reviews FOR EACH ROW EXECUTE FUNCTION update_rating_average();
CREATE TRIGGER trigger_rating_avg_update AFTER UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_rating_average();
CREATE TRIGGER trigger_rating_avg_delete AFTER DELETE ON reviews FOR EACH ROW EXECUTE FUNCTION update_rating_average();

-- Favorites count
CREATE OR REPLACE FUNCTION update_favorites_count()
RETURNS TRIGGER AS $$
DECLARE target_product_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN target_product_id := OLD.product_id;
  ELSE target_product_id := NEW.product_id; END IF;
  UPDATE products SET favorites_count = (SELECT COUNT(*) FROM favorites WHERE product_id = target_product_id) WHERE id = target_product_id;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_favorites_count_insert AFTER INSERT ON favorites FOR EACH ROW EXECUTE FUNCTION update_favorites_count();
CREATE TRIGGER trigger_favorites_count_delete AFTER DELETE ON favorites FOR EACH ROW EXECUTE FUNCTION update_favorites_count();

-- Conversation last message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_conversation_last_msg AFTER INSERT ON messages FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Product sold counter
CREATE OR REPLACE FUNCTION on_product_sold()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status <> 'sold' AND NEW.status = 'sold' THEN
    UPDATE profiles SET total_sales = total_sales + 1 WHERE id = NEW.seller_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_product_sold AFTER UPDATE ON products FOR EACH ROW EXECUTE FUNCTION on_product_sold();

-- Increment views RPC
CREATE OR REPLACE FUNCTION increment_views(p_product_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE products SET views_count = views_count + 1 WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════
-- MIGRATION 006: Enable Realtime
-- ═══════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE favorites;

-- ═══════════════════════════════════════════════
-- MIGRATION 010: Moderation Tables
-- ═══════════════════════════════════════════════

DO $$ BEGIN CREATE TYPE moderation_status AS ENUM ('pending', 'reviewing', 'approved', 'rejected', 'escalated'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE report_reason AS ENUM ('spam', 'scam', 'prohibited_content', 'duplicate', 'inappropriate', 'fake_listing', 'personal_info', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE moderation_action_type AS ENUM ('approve', 'reject', 'warn', 'ban', 'unban', 'escalate', 'dismiss'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS moderation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason report_reason NOT NULL,
  description TEXT,
  ai_moderation_result JSONB,
  ai_score NUMERIC,
  status moderation_status NOT NULL DEFAULT 'pending',
  priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  assigned_admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolution_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES moderation_reports(id) ON DELETE SET NULL,
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type moderation_action_type NOT NULL,
  target_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_id UUID REFERENCES moderation_reports(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  severity INTEGER NOT NULL DEFAULT 1 CHECK (severity >= 1 AND severity <= 5),
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  banned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  unbanned_at TIMESTAMPTZ,
  unbanned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  input_data JSONB NOT NULL DEFAULT '{}',
  result_data JSONB NOT NULL DEFAULT '{}',
  score NUMERIC,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Moderation Indexes
CREATE INDEX IF NOT EXISTS idx_moderation_reports_status ON moderation_reports(status);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_priority ON moderation_reports(priority DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_created ON moderation_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_product ON moderation_reports(product_id);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_user ON moderation_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_report ON moderation_actions(report_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_admin ON moderation_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_created ON moderation_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_warnings_user ON user_warnings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_warnings_created ON user_warnings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_bans_user ON user_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_active ON user_bans(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ai_logs_flagged ON ai_moderation_logs(is_flagged) WHERE is_flagged = true;
CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON ai_moderation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_product ON ai_moderation_logs(product_id);

-- Moderation RLS
ALTER TABLE moderation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_moderation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all reports" ON moderation_reports FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Service role can insert reports" ON moderation_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update reports" ON moderation_reports FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can view actions" ON moderation_actions FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Service role can insert actions" ON moderation_actions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view warnings" ON user_warnings FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) OR user_id = auth.uid());
CREATE POLICY "Service role can insert warnings" ON user_warnings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view bans" ON user_bans FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) OR user_id = auth.uid());
CREATE POLICY "Service role can manage bans" ON user_bans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can view AI logs" ON ai_moderation_logs FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Service role can insert AI logs" ON ai_moderation_logs FOR INSERT WITH CHECK (true);

CREATE TRIGGER set_updated_at_moderation_reports BEFORE UPDATE ON moderation_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════
-- FERTIG! Jetzt Schritt 2 (Kategorien) ausführen
-- ═══════════════════════════════════════════════
