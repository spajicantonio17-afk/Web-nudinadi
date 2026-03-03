-- ===========================================
-- Migration 020: Pro Plans & Promoted Listings
-- Features: Account types, plan limits, promoted products
-- ===========================================

-- ─── 1. Account Type on Profiles ─────────────────────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'free'
  CHECK (account_type IN ('free', 'pro', 'business'));

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS promoted_credits INTEGER DEFAULT 0;

-- ─── 2. Promoted Field on Products ──────────────────────────

ALTER TABLE products ADD COLUMN IF NOT EXISTS promoted_until TIMESTAMPTZ;

-- Index for promoted sorting (DESC so promoted products come first)
CREATE INDEX IF NOT EXISTS idx_products_promoted ON products(promoted_until DESC NULLS LAST);
