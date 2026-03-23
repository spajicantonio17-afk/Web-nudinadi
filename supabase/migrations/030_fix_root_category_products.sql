-- Fix products that were incorrectly saved with a root-level category_id
-- instead of the correct leaf/subcategory.
--
-- Root cause: resolveCategoryId() had a bug with 3-level category paths
-- (e.g. "Nekretnine - Stanovi - Prodaja stanova") — it fell back to the
-- root parent "Nekretnine" instead of resolving to the leaf "Prodaja stanova".
--
-- This migration reassigns affected products to the correct subcategory
-- based on keyword matching in the product title.

-- Step 1: Fix Nekretnine → Stanovi children
-- Products with "stan" in title → Prodaja stanova (default for apartments)
UPDATE products
SET category_id = (SELECT id FROM categories WHERE name = 'Prodaja stanova' LIMIT 1),
    updated_at = now()
WHERE category_id = (SELECT id FROM categories WHERE name = 'Nekretnine' AND parent_category_id IS NULL LIMIT 1)
  AND (title ILIKE '%stan%' OR title ILIKE '%apartman%' OR title ILIKE '%garsonjera%');

-- Products with "kuć" in title → Prodaja kuća
UPDATE products
SET category_id = (SELECT id FROM categories WHERE name = 'Prodaja kuća' LIMIT 1),
    updated_at = now()
WHERE category_id = (SELECT id FROM categories WHERE name = 'Nekretnine' AND parent_category_id IS NULL LIMIT 1)
  AND (title ILIKE '%kuć%' OR title ILIKE '%vila%');

-- Products with "zemljišt" in title → Građevinsko zemljište
UPDATE products
SET category_id = (SELECT id FROM categories WHERE name = 'Građevinsko zemljište' LIMIT 1),
    updated_at = now()
WHERE category_id = (SELECT id FROM categories WHERE name = 'Nekretnine' AND parent_category_id IS NULL LIMIT 1)
  AND (title ILIKE '%zemljišt%' OR title ILIKE '%parcela%' OR title ILIKE '%plac%');

-- Products with "poslovni" or "ured" → Poslovni prostori
UPDATE products
SET category_id = (SELECT id FROM categories WHERE name = 'Poslovni prostori' LIMIT 1),
    updated_at = now()
WHERE category_id = (SELECT id FROM categories WHERE name = 'Nekretnine' AND parent_category_id IS NULL LIMIT 1)
  AND (title ILIKE '%poslovni%' OR title ILIKE '%ured%' OR title ILIKE '%lokal%' OR title ILIKE '%kancelarij%');

-- Products with "garaž" → Garaže i parking mjesta
UPDATE products
SET category_id = (SELECT id FROM categories WHERE name = 'Garaže i parking mjesta' LIMIT 1),
    updated_at = now()
WHERE category_id = (SELECT id FROM categories WHERE name = 'Nekretnine' AND parent_category_id IS NULL LIMIT 1)
  AND (title ILIKE '%garaž%' OR title ILIKE '%parking%');

-- Remaining Nekretnine products without keyword match → default to Stanovi parent
UPDATE products
SET category_id = (SELECT id FROM categories WHERE name = 'Stanovi' AND parent_category_id IS NOT NULL LIMIT 1),
    updated_at = now()
WHERE category_id = (SELECT id FROM categories WHERE name = 'Nekretnine' AND parent_category_id IS NULL LIMIT 1);


-- Step 2: Fix other root categories (Vozila, Tehnika, etc.)
-- Products stuck at root "Vozila" → Polovni automobili (most common)
UPDATE products
SET category_id = (SELECT id FROM categories WHERE name = 'Polovni automobili' LIMIT 1),
    updated_at = now()
WHERE category_id = (SELECT id FROM categories WHERE name = 'Vozila' AND parent_category_id IS NULL LIMIT 1)
  AND (title ILIKE '%auto%' OR title ILIKE '%golf%' OR title ILIKE '%audi%' OR title ILIKE '%bmw%'
       OR title ILIKE '%mercedes%' OR title ILIKE '%volkswagen%' OR title ILIKE '%opel%' OR title ILIKE '%fiat%');
