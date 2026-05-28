-- ============================================================
-- Migration 014: Add 'archived' to product status
-- ============================================================

-- Prerequisite: extend the product_status enum with 'archived' if missing.
-- (The original 001 enum only had 'active','sold','draft'.)
DO $$ BEGIN
  ALTER TYPE product_status ADD VALUE IF NOT EXISTS 'archived';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Drop the old CHECK constraint and add a new one with 'archived'
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE products ADD CONSTRAINT products_status_check
  CHECK (status::text IN ('active', 'sold', 'draft', 'archived'));
