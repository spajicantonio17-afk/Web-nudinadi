-- ===========================================
-- Migration 017: Followers, Notifications & Verification
-- Features: Follow-System, Notification System, Phone Verification
-- ===========================================

-- ─── 1. User Followers Table ──────────────────────────────────

CREATE TABLE IF NOT EXISTS user_followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(follower_id, followed_id),
  CHECK (follower_id <> followed_id)
);

CREATE INDEX IF NOT EXISTS idx_followers_follower ON user_followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_followed ON user_followers(followed_id);

-- RLS
ALTER TABLE user_followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read followers" ON user_followers
  FOR SELECT USING (true);

CREATE POLICY "Users manage own follows" ON user_followers
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users delete own follows" ON user_followers
  FOR DELETE USING (auth.uid() = follower_id);

-- ─── 2. Follower/Following Count on Profiles ─────────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Auto-update follow counts
CREATE OR REPLACE FUNCTION update_follow_counts() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET followers_count = COALESCE(followers_count, 0) + 1 WHERE id = NEW.followed_id;
    UPDATE profiles SET following_count = COALESCE(following_count, 0) + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0) WHERE id = OLD.followed_id;
    UPDATE profiles SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0) WHERE id = OLD.follower_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_follow_counts
  AFTER INSERT OR DELETE ON user_followers
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- ─── 3. Notifications Table ──────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Enable Realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ─── 4. Price Drop Notification Trigger ──────────────────────

CREATE OR REPLACE FUNCTION notify_price_drop() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.price < OLD.price THEN
    INSERT INTO notifications (user_id, type, title, body, data)
    SELECT
      f.user_id,
      'price_drop',
      'Snižena cijena!',
      NEW.title || ' je snižen/a sa ' || OLD.price || '€ na ' || NEW.price || '€',
      jsonb_build_object(
        'product_id', NEW.id,
        'product_title', NEW.title,
        'product_image', CASE WHEN array_length(NEW.images, 1) > 0 THEN NEW.images[1] ELSE NULL END,
        'old_price', OLD.price,
        'new_price', NEW.price
      )
    FROM favorites f
    WHERE f.product_id = NEW.id AND f.user_id != NEW.seller_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_price_drop_notification
  AFTER UPDATE OF price ON products
  FOR EACH ROW EXECUTE FUNCTION notify_price_drop();

-- ─── 5. New Listing by Followed Seller Trigger ──────────────

CREATE OR REPLACE FUNCTION notify_new_listing_followers() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' THEN
    INSERT INTO notifications (user_id, type, title, body, data)
    SELECT
      uf.follower_id,
      'new_listing_by_followed',
      'Novi artikal!',
      (SELECT username FROM profiles WHERE id = NEW.seller_id) || ' je objavio/la novi artikal: ' || NEW.title,
      jsonb_build_object(
        'product_id', NEW.id,
        'product_title', NEW.title,
        'product_image', CASE WHEN array_length(NEW.images, 1) > 0 THEN NEW.images[1] ELSE NULL END,
        'product_price', NEW.price,
        'seller_id', NEW.seller_id
      )
    FROM user_followers uf
    WHERE uf.followed_id = NEW.seller_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_new_listing_followers
  AFTER INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION notify_new_listing_followers();

-- ─── 6. Phone Verified Column ────────────────────────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- ─── 7. Verification Codes Table ─────────────────────────────

CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'phone')),
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verification_user ON verification_codes(user_id, type);

-- RLS
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own codes" ON verification_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own codes" ON verification_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own codes" ON verification_codes
  FOR UPDATE USING (auth.uid() = user_id);

-- ─── 8. New Follower Notification Trigger ────────────────────

CREATE OR REPLACE FUNCTION notify_new_follower() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (
    NEW.followed_id,
    'new_follower',
    'Novi pratitelj!',
    (SELECT username FROM profiles WHERE id = NEW.follower_id) || ' te sada prati',
    jsonb_build_object(
      'follower_id', NEW.follower_id,
      'follower_username', (SELECT username FROM profiles WHERE id = NEW.follower_id)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_new_follower_notification
  AFTER INSERT ON user_followers
  FOR EACH ROW EXECUTE FUNCTION notify_new_follower();
