-- Fix: categories table had RLS enabled but NO SELECT policy.
-- This caused PostgREST to filter out any product with a non-NULL category_id,
-- because the embedded JOIN on categories was blocked by RLS.
-- Products with category_id = NULL (e.g. BMW) were unaffected.
--
-- Categories are public reference data — everyone should be able to read them.

DROP POLICY IF EXISTS "categories_select_public" ON categories;
CREATE POLICY "categories_select_public"
  ON categories FOR SELECT
  USING (true);
