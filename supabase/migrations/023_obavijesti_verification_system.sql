-- ===========================================
-- Migration 023: Obavijesti-Chat & Verification System
-- Features: In-app notification channel, 5-step verification
-- ===========================================

-- ─── 1. Obavijesti Notification Types ─────────────────────────
-- The existing notifications table is reused.
-- New notification types added via triggers:
--   'oglas_published'       → Novi oglas objavljen
--   'review_received'       → Review/dojam primljen
--   'sale_completed'        → Uspjesna prodaja
--   'level_up'              → Level-up
--   'new_message'           → Nova poruka
--   'public_question'       → Javno pitanje na oglas
--   'verification_step'     → Verifikacioni korak
--   'fully_verified'        → Potpuno verificiran
--   'like_received'         → Like na oglas (Pro/Business only)
--   'price_drop_liked'      → Cijena snizena na lajkovanom artiklu (Pro/Business only)

-- ─── 2. Trigger: Oglas Published → Obavijest + XP ────────────

CREATE OR REPLACE FUNCTION notify_oglas_published() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'active')) THEN
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      NEW.seller_id,
      'oglas_published',
      'Oglas objavljen!',
      'Tvoj oglas ''' || NEW.title || ''' je objavljen! +10 XP',
      jsonb_build_object(
        'product_id', NEW.id,
        'product_title', NEW.title,
        'xp_earned', 10
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_oglas_published_notification ON products;
CREATE TRIGGER trigger_oglas_published_notification
  AFTER INSERT OR UPDATE OF status ON products
  FOR EACH ROW EXECUTE FUNCTION notify_oglas_published();

-- ─── 3. Trigger: Review Received → Obavijest ─────────────────

CREATE OR REPLACE FUNCTION notify_review_received() RETURNS TRIGGER AS $$
DECLARE
  reviewer_name TEXT;
  xp_amount INT;
BEGIN
  SELECT username INTO reviewer_name FROM profiles WHERE id = NEW.reviewer_id;

  -- XP based on rating: 1→5, 2→10, 3→15, 4→20, 5→25
  xp_amount := NEW.rating * 5;

  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (
    NEW.reviewed_user_id,
    'review_received',
    'Novi dojam!',
    'Korisnik ' || COALESCE(reviewer_name, 'Nepoznat') || ' ti je dao ocjenu ' || repeat('*', NEW.rating) || ' +' || xp_amount || ' XP',
    jsonb_build_object(
      'reviewer_id', NEW.reviewer_id,
      'reviewer_username', COALESCE(reviewer_name, 'Nepoznat'),
      'rating', NEW.rating,
      'xp_earned', xp_amount,
      'product_id', NEW.product_id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_review_received_notification ON reviews;
CREATE TRIGGER trigger_review_received_notification
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION notify_review_received();

-- ─── 4. Trigger: Sale Completed → Obavijest for Seller ───────

CREATE OR REPLACE FUNCTION notify_sale_completed() RETURNS TRIGGER AS $$
DECLARE
  product_title TEXT;
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    SELECT title INTO product_title FROM products WHERE id = NEW.product_id;

    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      NEW.seller_id,
      'sale_completed',
      'Uspjesna prodaja!',
      'Tvoj artikal ''' || COALESCE(product_title, 'Artikal') || ''' je prodan! +50 XP',
      jsonb_build_object(
        'product_id', NEW.product_id,
        'product_title', COALESCE(product_title, 'Artikal'),
        'buyer_id', NEW.buyer_id,
        'xp_earned', 50
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sale_completed_notification ON transactions;
CREATE TRIGGER trigger_sale_completed_notification
  AFTER UPDATE OF status ON transactions
  FOR EACH ROW EXECUTE FUNCTION notify_sale_completed();

-- ─── 5. Trigger: New Message → Obavijest ─────────────────────

CREATE OR REPLACE FUNCTION notify_new_message() RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
  other_user_id UUID;
  conv RECORD;
BEGIN
  SELECT user1_id, user2_id INTO conv FROM conversations WHERE id = NEW.conversation_id;
  IF conv IS NULL THEN RETURN NEW; END IF;

  -- Determine recipient
  IF conv.user1_id = NEW.sender_id THEN
    other_user_id := conv.user2_id;
  ELSE
    other_user_id := conv.user1_id;
  END IF;

  SELECT username INTO sender_name FROM profiles WHERE id = NEW.sender_id;

  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (
    other_user_id,
    'new_message',
    'Nova poruka',
    'Korisnik ' || COALESCE(sender_name, 'Nepoznat') || ' ti je poslao poruku',
    jsonb_build_object(
      'sender_id', NEW.sender_id,
      'sender_username', COALESCE(sender_name, 'Nepoznat'),
      'conversation_id', NEW.conversation_id,
      'preview', LEFT(COALESCE(NEW.content, ''), 60)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_new_message_notification ON messages;
CREATE TRIGGER trigger_new_message_notification
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_new_message();

-- ─── 6. Trigger: Public Question → Obavijest for Seller ──────

-- Assumes a product_questions table exists or will be created
-- If it doesn't exist yet, create it:
CREATE TABLE IF NOT EXISTS product_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_questions_product ON product_questions(product_id);

ALTER TABLE product_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read questions" ON product_questions
  FOR SELECT USING (true);

CREATE POLICY "Users ask questions" ON product_questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Seller answers questions" ON product_questions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM products WHERE products.id = product_questions.product_id AND products.seller_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION notify_public_question() RETURNS TRIGGER AS $$
DECLARE
  questioner_name TEXT;
  product_title TEXT;
  product_seller_id UUID;
BEGIN
  SELECT username INTO questioner_name FROM profiles WHERE id = NEW.user_id;
  SELECT title, seller_id INTO product_title, product_seller_id FROM products WHERE id = NEW.product_id;

  -- Don't notify if asking own product
  IF product_seller_id = NEW.user_id THEN RETURN NEW; END IF;

  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (
    product_seller_id,
    'public_question',
    'Novo pitanje!',
    'Korisnik ' || COALESCE(questioner_name, 'Nepoznat') || ' je postavio pitanje na tvoj oglas ''' || COALESCE(product_title, 'Oglas') || '''',
    jsonb_build_object(
      'product_id', NEW.product_id,
      'product_title', COALESCE(product_title, 'Oglas'),
      'questioner_id', NEW.user_id,
      'questioner_username', COALESCE(questioner_name, 'Nepoznat'),
      'question_id', NEW.id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_public_question_notification ON product_questions;
CREATE TRIGGER trigger_public_question_notification
  AFTER INSERT ON product_questions
  FOR EACH ROW EXECUTE FUNCTION notify_public_question();

-- ─── 7. Trigger: Like Received → Obavijest (Pro/Business only) ───

CREATE OR REPLACE FUNCTION notify_like_received() RETURNS TRIGGER AS $$
DECLARE
  liker_name TEXT;
  product_title TEXT;
  product_seller_id UUID;
  seller_type TEXT;
BEGIN
  SELECT title, seller_id INTO product_title, product_seller_id FROM products WHERE id = NEW.product_id;

  -- Only notify Pro/Business sellers
  SELECT account_type INTO seller_type FROM profiles WHERE id = product_seller_id;
  IF seller_type NOT IN ('pro', 'business') THEN RETURN NEW; END IF;

  -- Don't notify if liking own product
  IF product_seller_id = NEW.user_id THEN RETURN NEW; END IF;

  SELECT username INTO liker_name FROM profiles WHERE id = NEW.user_id;

  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (
    product_seller_id,
    'like_received',
    'Novi lajk!',
    'Korisnik ' || COALESCE(liker_name, 'Nepoznat') || ' je lajkao tvoj oglas ''' || COALESCE(product_title, 'Oglas') || '''',
    jsonb_build_object(
      'product_id', NEW.product_id,
      'product_title', COALESCE(product_title, 'Oglas'),
      'liker_id', NEW.user_id,
      'liker_username', COALESCE(liker_name, 'Nepoznat')
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_like_received_notification ON favorites;
CREATE TRIGGER trigger_like_received_notification
  AFTER INSERT ON favorites
  FOR EACH ROW EXECUTE FUNCTION notify_like_received();

-- ─── 8. Update Price Drop Trigger for Pro/Business ────────────
-- Replace existing trigger to only notify Pro/Business users who liked the item

CREATE OR REPLACE FUNCTION notify_price_drop() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.price < OLD.price THEN
    INSERT INTO notifications (user_id, type, title, body, data)
    SELECT
      f.user_id,
      'price_drop_liked',
      'Cijena snizena!',
      'Cijena oglasa ''' || NEW.title || ''' je snizena!',
      jsonb_build_object(
        'product_id', NEW.id,
        'product_title', NEW.title,
        'product_image', CASE WHEN array_length(NEW.images, 1) > 0 THEN NEW.images[1] ELSE NULL END,
        'old_price', OLD.price,
        'new_price', NEW.price
      )
    FROM favorites f
    JOIN profiles p ON p.id = f.user_id
    WHERE f.product_id = NEW.id
      AND f.user_id != NEW.seller_id
      AND p.account_type IN ('pro', 'business');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 9. Verification Step Notifications ───────────────────────
-- These are triggered from the application layer (not DB triggers)
-- because verification steps involve checking profile fields that
-- change through various update paths.

-- ─── 10. Level-Up Trigger ─────────────────────────────────────

CREATE OR REPLACE FUNCTION notify_level_up() RETURNS TRIGGER AS $$
DECLARE
  level_title TEXT;
BEGIN
  IF NEW.level > OLD.level THEN
    -- Determine level title
    IF NEW.level <= 2 THEN level_title := 'Pocetnik';
    ELSIF NEW.level <= 5 THEN level_title := 'Napredni Korisnik';
    ELSIF NEW.level <= 8 THEN level_title := 'Iskusni Prodavac';
    ELSE level_title := 'Ekspert';
    END IF;

    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      NEW.id,
      'level_up',
      'Level Up!',
      'Cestitamo! Dostigao si Level ' || NEW.level || ' — ' || level_title || '!',
      jsonb_build_object(
        'new_level', NEW.level,
        'level_title', level_title,
        'xp', NEW.xp
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_level_up_notification ON profiles;
CREATE TRIGGER trigger_level_up_notification
  AFTER UPDATE OF level ON profiles
  FOR EACH ROW EXECUTE FUNCTION notify_level_up();

-- ─── 11. Insert policy for notifications (system triggers) ────
-- Allow system triggers to insert notifications

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'System inserts notifications'
  ) THEN
    CREATE POLICY "System inserts notifications" ON notifications
      FOR INSERT WITH CHECK (true);
  END IF;
END;
$$;

-- ─── 12. Enable realtime for product_questions ────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE product_questions;
