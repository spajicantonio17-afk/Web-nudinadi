-- ── Migration 012: Backfill NULL country values + enforce NOT NULL ──
-- Run in Supabase SQL editor.
--
-- Problem: products with locations not in the original backfill list (or no location)
-- have country = NULL. They appear in "Sva tržišta" but disappear when filtering by
-- a specific country, causing inconsistent UX.
--
-- Fix: backfill all NULL → 'ba' (default market), then enforce NOT NULL with default.

-- 0. Prerequisite: currency + country columns (also added by add_currency_country_to_products.sql,
--    which the Supabase CLI skips because its filename has no numeric prefix). Idempotent.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'EUR'
  CHECK (currency IN ('EUR', 'BAM', 'RSD'));
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS country TEXT
  CHECK (country IN ('ba', 'hr', 'rs', 'de', 'at'));

-- 1. Backfill remaining NULLs to 'ba'
UPDATE products SET country = 'ba' WHERE country IS NULL;

-- 2. Set default + NOT NULL constraint to prevent future NULLs
ALTER TABLE products ALTER COLUMN country SET DEFAULT 'ba';
ALTER TABLE products ALTER COLUMN country SET NOT NULL;

-- Verification:
-- SELECT country, count(*) FROM products GROUP BY country ORDER BY country;
-- Expected: rows for ba/hr/rs (and possibly de/at), no NULL row.
