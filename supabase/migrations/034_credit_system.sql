-- =============================================
-- Migration 034: Credit System
-- =============================================

-- ─── 1. Add credit_balance to profiles ──────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credit_balance INTEGER NOT NULL DEFAULT 0;

-- Ensure balance never goes negative
ALTER TABLE profiles ADD CONSTRAINT credit_balance_non_negative
  CHECK (credit_balance >= 0);

-- ─── 2. Add extra_images_unlocked to products ───────────────
-- Tracks how many extra photo slots were purchased for this listing
ALTER TABLE products ADD COLUMN IF NOT EXISTS extra_images_unlocked INTEGER NOT NULL DEFAULT 0;

ALTER TABLE products ADD CONSTRAINT extra_images_non_negative
  CHECK (extra_images_unlocked >= 0);

-- ─── 3. credit_transactions log ─────────────────────────────
CREATE TABLE IF NOT EXISTS credit_transactions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount       INTEGER NOT NULL,                          -- positive = topup, negative = spend
  type         TEXT NOT NULL,                             -- 'purchase' | 'extra_photos' | 'istaknuti'
  reference_id UUID,                                      -- product_id for spend transactions
  stripe_pi_id TEXT,                                      -- payment_intent id for purchases
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_tx_user ON credit_transactions(user_id);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- ─── 4. RPC: spend_credits ──────────────────────────────────
-- Atomically deducts credits and logs the transaction
CREATE OR REPLACE FUNCTION spend_credits(
  p_user_id    UUID,
  p_amount     INTEGER,
  p_type       TEXT,
  p_reference  UUID DEFAULT NULL,
  p_desc       TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Deduct balance (constraint will reject if insufficient)
  UPDATE profiles
  SET credit_balance = credit_balance - p_amount
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Log transaction
  INSERT INTO credit_transactions(user_id, amount, type, reference_id, description)
  VALUES (p_user_id, -p_amount, p_type, p_reference, p_desc);
END;
$$;

-- ─── 5. RPC: add_credits ────────────────────────────────────
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id    UUID,
  p_amount     INTEGER,
  p_stripe_pi  TEXT DEFAULT NULL,
  p_desc       TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET credit_balance = credit_balance + p_amount
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  INSERT INTO credit_transactions(user_id, amount, type, stripe_pi_id, description)
  VALUES (p_user_id, p_amount, 'purchase', p_stripe_pi, p_desc);
END;
$$;
