-- Add Stripe customer ID to profiles for subscription management
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Index for quick lookup by Stripe customer ID (webhook processing)
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
