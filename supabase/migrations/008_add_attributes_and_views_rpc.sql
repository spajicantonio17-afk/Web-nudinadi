-- =============================================
-- NudiNađi - Migration 008: Attributes-Spalte + increment_views RPC
-- =============================================
-- Run this AFTER 007_categories_seed.sql

-- JSONB-Attributes-Spalte zu products hinzufügen (für kategorie-spezifische Felder)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT NULL;

-- increment_views RPC-Funktion erstellen
CREATE OR REPLACE FUNCTION increment_views(p_product_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET views_count = views_count + 1
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
