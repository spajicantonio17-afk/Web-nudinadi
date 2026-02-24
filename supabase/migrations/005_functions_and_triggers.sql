-- =============================================
-- NudiNađi - Migration 005: Functions & Triggers
-- =============================================
-- Run this AFTER 004_storage_buckets.sql

-- ─── 1. Auto-update updated_at timestamp ──────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_reviews
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 2. XP & Level System ────────────────────────────

-- Calculate level from XP (exponential thresholds)
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

-- Add XP to user and auto-recalculate level
CREATE OR REPLACE FUNCTION add_xp(p_user_id UUID, p_xp_amount INTEGER)
RETURNS TABLE(new_xp INTEGER, new_level INTEGER, leveled_up BOOLEAN) AS $$
DECLARE
  old_level INTEGER;
  current_xp INTEGER;
  computed_level INTEGER;
BEGIN
  -- Get current values
  SELECT xp, level INTO current_xp, old_level
  FROM profiles WHERE id = p_user_id;

  -- Calculate new values
  current_xp := current_xp + p_xp_amount;
  computed_level := calculate_user_level(current_xp);

  -- Update profile
  UPDATE profiles
  SET xp = current_xp, level = computed_level
  WHERE id = p_user_id;

  -- Return results
  new_xp := current_xp;
  new_level := computed_level;
  leveled_up := computed_level > old_level;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-add XP when activity is logged
CREATE OR REPLACE FUNCTION on_activity_inserted()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM add_xp(NEW.user_id, NEW.xp_earned);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_activity_xp
  AFTER INSERT ON user_activities
  FOR EACH ROW EXECUTE FUNCTION on_activity_inserted();

-- ─── 3. Category product_count ────────────────────────

-- Increment count when product is created
CREATE OR REPLACE FUNCTION on_product_inserted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.category_id IS NOT NULL AND NEW.status = 'active' THEN
    UPDATE categories
    SET product_count = product_count + 1
    WHERE id = NEW.category_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adjust count when product status or category changes
CREATE OR REPLACE FUNCTION on_product_updated()
RETURNS TRIGGER AS $$
BEGIN
  -- Category changed or status changed
  IF OLD.category_id IS DISTINCT FROM NEW.category_id
     OR OLD.status IS DISTINCT FROM NEW.status THEN

    -- Decrement old category (if was active)
    IF OLD.category_id IS NOT NULL AND OLD.status = 'active' THEN
      UPDATE categories
      SET product_count = GREATEST(product_count - 1, 0)
      WHERE id = OLD.category_id;
    END IF;

    -- Increment new category (if now active)
    IF NEW.category_id IS NOT NULL AND NEW.status = 'active' THEN
      UPDATE categories
      SET product_count = product_count + 1
      WHERE id = NEW.category_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement count when product is deleted
CREATE OR REPLACE FUNCTION on_product_deleted()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.category_id IS NOT NULL AND OLD.status = 'active' THEN
    UPDATE categories
    SET product_count = GREATEST(product_count - 1, 0)
    WHERE id = OLD.category_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_product_count_insert
  AFTER INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION on_product_inserted();

CREATE TRIGGER trigger_product_count_update
  AFTER UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION on_product_updated();

CREATE TRIGGER trigger_product_count_delete
  AFTER DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION on_product_deleted();

-- ─── 4. Rating average auto-update ───────────────────

CREATE OR REPLACE FUNCTION update_rating_average()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
  avg_rating NUMERIC(2,1);
BEGIN
  -- Determine which user to update
  IF TG_OP = 'DELETE' THEN
    target_user_id := OLD.reviewed_user_id;
  ELSE
    target_user_id := NEW.reviewed_user_id;
  END IF;

  -- Calculate new average
  SELECT ROUND(AVG(rating)::numeric, 1)
  INTO avg_rating
  FROM reviews
  WHERE reviewed_user_id = target_user_id;

  -- Update profile
  UPDATE profiles
  SET rating_average = avg_rating
  WHERE id = target_user_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_rating_avg_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_rating_average();

CREATE TRIGGER trigger_rating_avg_update
  AFTER UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_rating_average();

CREATE TRIGGER trigger_rating_avg_delete
  AFTER DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_rating_average();

-- ─── 5. Favorites count on products ──────────────────

CREATE OR REPLACE FUNCTION update_favorites_count()
RETURNS TRIGGER AS $$
DECLARE
  target_product_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_product_id := OLD.product_id;
  ELSE
    target_product_id := NEW.product_id;
  END IF;

  UPDATE products
  SET favorites_count = (
    SELECT COUNT(*) FROM favorites WHERE product_id = target_product_id
  )
  WHERE id = target_product_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_favorites_count_insert
  AFTER INSERT ON favorites
  FOR EACH ROW EXECUTE FUNCTION update_favorites_count();

CREATE TRIGGER trigger_favorites_count_delete
  AFTER DELETE ON favorites
  FOR EACH ROW EXECUTE FUNCTION update_favorites_count();

-- ─── 6. Auto-update conversation last_message_at ─────

CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_conversation_last_msg
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- ─── 7. Auto-increment total_sales / total_purchases ─

CREATE OR REPLACE FUNCTION on_product_sold()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when status changes to 'sold'
  IF OLD.status <> 'sold' AND NEW.status = 'sold' THEN
    UPDATE profiles
    SET total_sales = total_sales + 1
    WHERE id = NEW.seller_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_product_sold
  AFTER UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION on_product_sold();
