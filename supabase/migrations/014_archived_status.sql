-- ============================================================
-- Migration 014: Add 'archived' to product status
-- ============================================================

-- Drop the old CHECK constraint and add a new one with 'archived'
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE products ADD CONSTRAINT products_status_check
  CHECK (status IN ('active', 'sold', 'draft', 'archived'));
