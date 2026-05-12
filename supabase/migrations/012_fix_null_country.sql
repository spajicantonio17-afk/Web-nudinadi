-- ── Migration 012: Backfill NULL country values + enforce NOT NULL ──
-- Run in Supabase SQL editor.
--
-- Problem: products with locations not in the original backfill list (or no location)
-- have country = NULL. They appear in "Sva tržišta" but disappear when filtering by
-- a specific country, causing inconsistent UX.
--
-- Fix: backfill all NULL → 'ba' (default market), then enforce NOT NULL with default.

-- 1. Backfill remaining NULLs to 'ba'
UPDATE products SET country = 'ba' WHERE country IS NULL;

-- 2. Set default + NOT NULL constraint to prevent future NULLs
ALTER TABLE products ALTER COLUMN country SET DEFAULT 'ba';
ALTER TABLE products ALTER COLUMN country SET NOT NULL;

-- Verification:
-- SELECT country, count(*) FROM products GROUP BY country ORDER BY country;
-- Expected: rows for ba/hr/rs (and possibly de/at), no NULL row.
