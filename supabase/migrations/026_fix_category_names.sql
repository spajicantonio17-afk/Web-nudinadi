-- =============================================
-- NudiNađi - Migration 026: Fix Category Names
-- Syncs DB category names with frontend constants.ts
-- =============================================

-- 1. "Dijelovi za vozila" → "Dijelovi za automobile"
UPDATE categories SET name = 'Dijelovi za automobile' WHERE slug = 'dijelovi' AND parent_category_id IS NULL;

-- 2. "Dom i vrtni" → "Dom i vrtne garniture"
UPDATE categories SET name = 'Dom i vrtne garniture' WHERE slug = 'dom' AND parent_category_id IS NULL;

-- 3. "Djeca i bebe" → "Odjeća za djecu"
UPDATE categories SET name = 'Odjeća za djecu' WHERE slug = 'djeca' AND parent_category_id IS NULL;

-- 4. "Glazba i instrumenti" → "Glazba i glazbeni instrumenti"
UPDATE categories SET name = 'Glazba i glazbeni instrumenti' WHERE slug = 'glazba' AND parent_category_id IS NULL;

-- 5. "Video igre" → "Videoigre"
UPDATE categories SET name = 'Videoigre' WHERE slug = 'videoigre' AND parent_category_id IS NULL;
