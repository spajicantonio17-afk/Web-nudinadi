-- =============================================
-- NudiNađi - Migration 032: listing_type + Category Cleanup
-- =============================================
-- Adds listing_type field to products (prodaja/najam/najam_kratkorocni)
-- Removes Prodaja/Najam items from Nekretnine subcategories
-- Replaces Novi/Polovni/Električni items in Vozila with body types
-- =============================================

-- ─── 1. Add listing_type column ────────────────────────

ALTER TABLE products ADD COLUMN IF NOT EXISTS listing_type VARCHAR(30) DEFAULT 'prodaja';

-- Index for filtering
CREATE INDEX IF NOT EXISTS idx_products_listing_type ON products (listing_type);

-- ─── 2. NEKRETNINE: Migrate products from Prodaja/Najam categories ──

-- Set listing_type based on current category BEFORE reassigning
UPDATE products SET listing_type = 'prodaja'
WHERE category_id IN (SELECT id FROM categories WHERE slug IN (
  'nekr-stan-prodaja', 'nekr-kuca-prodaja', 'nekr-posl-prodaja', 'nekr-gar-prodaja'
));

UPDATE products SET listing_type = 'najam'
WHERE category_id IN (SELECT id FROM categories WHERE slug IN (
  'nekr-stan-najam', 'nekr-kuca-najam', 'nekr-posl-najam', 'nekr-gar-najam'
));

UPDATE products SET listing_type = 'najam_kratkorocni'
WHERE category_id IN (SELECT id FROM categories WHERE slug = 'nekr-stan-dan');

-- Move products to parent category (Stanovi, Kuće, Poslovni, Garaže)
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'nekr-stanovi')
WHERE category_id IN (SELECT id FROM categories WHERE slug IN (
  'nekr-stan-prodaja', 'nekr-stan-najam', 'nekr-stan-dan'
));

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'nekr-kuce')
WHERE category_id IN (SELECT id FROM categories WHERE slug IN (
  'nekr-kuca-prodaja', 'nekr-kuca-najam'
));

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'nekr-poslovni')
WHERE category_id IN (SELECT id FROM categories WHERE slug IN (
  'nekr-posl-prodaja', 'nekr-posl-najam'
));

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'nekr-garaze')
WHERE category_id IN (SELECT id FROM categories WHERE slug IN (
  'nekr-gar-prodaja', 'nekr-gar-najam'
));

-- Delete old Prodaja/Najam categories (no products reference them anymore)
DELETE FROM categories WHERE slug IN (
  'nekr-stan-prodaja', 'nekr-stan-najam', 'nekr-stan-dan',
  'nekr-kuca-prodaja', 'nekr-kuca-najam',
  'nekr-posl-prodaja', 'nekr-posl-najam',
  'nekr-gar-prodaja', 'nekr-gar-najam'
);

-- Add new type-based categories for Nekretnine
INSERT INTO categories (slug, name, parent_category_id, icon)
SELECT 'nekr-stan-garsonjere', 'Garsonjere', id, NULL
FROM categories WHERE slug = 'nekr-stanovi'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (slug, name, parent_category_id, icon)
SELECT 'nekr-kuca-vile', 'Vile', id, NULL
FROM categories WHERE slug = 'nekr-kuce'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (slug, name, parent_category_id, icon)
SELECT 'nekr-gar-garaze', 'Garaže', id, NULL
FROM categories WHERE slug = 'nekr-garaze'
ON CONFLICT (slug) DO NOTHING;

-- ─── 3. VOZILA: Replace condition/powertrain items with body types ──

-- Move products from old items to parent category (Osobni automobili)
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'vozila-osobni-automobili')
WHERE category_id IN (SELECT id FROM categories WHERE slug IN (
  'vozila-osobni-novi', 'vozila-osobni-rabljeni', 'vozila-osobni-s-jamstvom',
  'vozila-osobni-karambolirani', 'vozila-osobni-elektricni', 'vozila-osobni-hibridni'
));
-- Note: 'vozila-osobni-oldtimeri' stays as-is

-- Delete old condition/powertrain categories
DELETE FROM categories WHERE slug IN (
  'vozila-osobni-novi', 'vozila-osobni-rabljeni', 'vozila-osobni-s-jamstvom',
  'vozila-osobni-karambolirani', 'vozila-osobni-elektricni', 'vozila-osobni-hibridni'
);

-- Add new body-type categories
INSERT INTO categories (slug, name, parent_category_id, icon)
SELECT slug, name, parent_id, NULL
FROM (
  VALUES
    ('vozila-osobni-sedan', 'Sedan'),
    ('vozila-osobni-karavan', 'Karavan'),
    ('vozila-osobni-hatchback', 'Hatchback'),
    ('vozila-osobni-suv', 'SUV / Crossover'),
    ('vozila-osobni-coupe', 'Coupe / Cabrio'),
    ('vozila-osobni-pickup', 'Pickup'),
    ('vozila-osobni-van', 'Van / Minivan')
) AS v(slug, name)
CROSS JOIN (SELECT id AS parent_id FROM categories WHERE slug = 'vozila-osobni-automobili') p
ON CONFLICT (slug) DO NOTHING;
