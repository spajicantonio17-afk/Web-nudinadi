-- ============================================================
-- Migration 016: Transactions table, XP fixes, is_admin
-- ============================================================
-- Adds buyer-confirmation flow for sales, is_admin column,
-- pending_sale status, and verification activity type.

-- ─── 1. Add is_admin to profiles ────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- ─── 2. Add missing values to product_status enum ───────
-- product_status is a PostgreSQL ENUM, not TEXT — must use ALTER TYPE
ALTER TYPE product_status ADD VALUE IF NOT EXISTS 'archived';
ALTER TYPE product_status ADD VALUE IF NOT EXISTS 'pending_sale';
-- Drop stale CHECK constraint from migration 014 (doesn't apply to enum columns)
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check;

-- ─── 3. Add 'verification' to activity_type enum ────────
-- PostgreSQL enum values can be added but not removed
ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'verification';

-- ─── 4. Create transactions table ──────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'denied', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '48 hours') NOT NULL,
  -- Buyer and seller must be different
  CHECK (seller_id <> buyer_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_product ON transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Auto-update updated_at
CREATE TRIGGER set_updated_at_transactions
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 5. Transaction confirmed → award XP + mark sold ────
CREATE OR REPLACE FUNCTION on_transaction_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  -- Only when status changes TO 'confirmed'
  IF OLD.status <> 'confirmed' AND NEW.status = 'confirmed' THEN
    -- Mark product as sold
    UPDATE products SET status = 'sold' WHERE id = NEW.product_id;

    -- Award sale XP to seller (50 XP)
    INSERT INTO user_activities (user_id, activity_type, xp_earned)
    VALUES (NEW.seller_id, 'sale', 50);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_transaction_confirmed
  AFTER UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION on_transaction_confirmed();

-- ─── 6. Transaction denied → revert product to active ────
CREATE OR REPLACE FUNCTION on_transaction_denied()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status <> 'denied' AND NEW.status = 'denied' THEN
    -- Only revert if still pending_sale (not sold by another transaction)
    UPDATE products SET status = 'active'
    WHERE id = NEW.product_id AND status = 'pending_sale';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_transaction_denied
  AFTER UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION on_transaction_denied();

-- ─── 7. Auto-expire old transactions (cron or manual) ────
CREATE OR REPLACE FUNCTION expire_stale_transactions()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE transactions
  SET status = 'expired', updated_at = now()
  WHERE status = 'pending' AND expires_at < now();

  GET DIAGNOSTICS expired_count = ROW_COUNT;

  -- Revert products back to active
  UPDATE products p
  SET status = 'active'
  WHERE p.status = 'pending_sale'
    AND NOT EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.product_id = p.id AND t.status = 'pending'
    );

  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 8. RLS Policies for transactions ────────────────────
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Anyone can read their own transactions (as seller or buyer)
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- Sellers can create transactions
CREATE POLICY "Sellers can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Buyers can confirm/deny (update) their transactions
CREATE POLICY "Buyers can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = buyer_id AND status = 'pending');

-- Enable realtime for transactions
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
