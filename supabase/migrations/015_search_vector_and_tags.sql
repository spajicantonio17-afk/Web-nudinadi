-- ============================================================
-- Migration 015: Full-Text Search mit Tags
-- Adds: tags TEXT[], search_vector tsvector, GIN indexes,
--        trigger, RPC functions for similar products + autocomplete
-- ============================================================

-- 1. Neue Spalten
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2. GIN-Indexe für schnelle Suche
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_products_search_vector ON products USING GIN (search_vector);

-- 3. Trigger-Funktion: baut search_vector automatisch bei INSERT/UPDATE
--    Gewichtung: Titel (A) > Tags (B) > Beschreibung (C)
--    Config 'simple' = kein Stemming, funktioniert multilingual (bs/hr/sr/de/en)
CREATE OR REPLACE FUNCTION products_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger auf products-Tabelle
DROP TRIGGER IF EXISTS trg_products_search_vector ON products;
CREATE TRIGGER trg_products_search_vector
  BEFORE INSERT OR UPDATE OF title, description, tags
  ON products
  FOR EACH ROW
  EXECUTE FUNCTION products_search_vector_update();

-- 5. Backfill: search_vector für existierende Produkte berechnen
UPDATE products SET search_vector =
  setweight(to_tsvector('simple', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('simple', COALESCE(array_to_string(tags, ' '), '')), 'B') ||
  setweight(to_tsvector('simple', COALESCE(description, '')), 'C');

-- 6. RPC: Ähnliche Produkte (Tag-Overlap + gleiche Kategorie + Preisspanne)
CREATE OR REPLACE FUNCTION get_similar_products(
  p_product_id UUID,
  p_category_id UUID DEFAULT NULL,
  p_tags TEXT[] DEFAULT '{}',
  p_price NUMERIC DEFAULT 0,
  p_limit INT DEFAULT 6
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  price NUMERIC,
  images TEXT[],
  condition product_condition,
  location TEXT,
  created_at TIMESTAMPTZ,
  seller_id UUID,
  category_id UUID,
  tag_overlap INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.title, p.price, p.images,
    p.condition, p.location, p.created_at,
    p.seller_id, p.category_id,
    COALESCE(array_length(ARRAY(
      SELECT unnest(p.tags) INTERSECT SELECT unnest(p_tags)
    ), 1), 0) AS tag_overlap
  FROM products p
  WHERE p.id != p_product_id
    AND p.status = 'active'
    AND (
      -- Gleiche Kategorie ODER mindestens 1 Tag überschneidung
      (p_category_id IS NOT NULL AND p.category_id = p_category_id)
      OR (array_length(p_tags, 1) > 0 AND p.tags && p_tags)
    )
    AND (
      -- Preisspanne: ±100% (sehr breit um genug Ergebnisse zu bekommen)
      p_price = 0
      OR p.price BETWEEN p_price * 0.3 AND p_price * 3.0
    )
  ORDER BY
    -- Gleiche Kategorie bevorzugen
    (CASE WHEN p_category_id IS NOT NULL AND p.category_id = p_category_id THEN 1 ELSE 0 END) DESC,
    -- Mehr Tag-Überschneidungen = relevanter
    tag_overlap DESC,
    -- Neueste zuerst
    p.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 7. RPC: Autocomplete-Vorschläge (schnell, prefix-match, kein Gemini nötig)
CREATE OR REPLACE FUNCTION search_suggestions(
  p_query TEXT,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  price NUMERIC,
  images TEXT[],
  condition product_condition,
  location TEXT,
  category_id UUID,
  rank REAL
) AS $$
DECLARE
  ts_query tsquery;
  words TEXT[];
  query_parts TEXT[];
  word TEXT;
BEGIN
  -- Säubere Input und teile in Wörter
  words := string_to_array(trim(regexp_replace(p_query, '\s+', ' ', 'g')), ' ');

  -- Baue Prefix-Match: jedes Wort wird zu "wort:*" (z.B. "ip" → "ip:*")
  query_parts := '{}';
  FOREACH word IN ARRAY words LOOP
    IF length(word) >= 1 THEN
      query_parts := array_append(query_parts, word || ':*');
    END IF;
  END LOOP;

  -- Wenn keine gültigen Wörter, return leer
  IF array_length(query_parts, 1) IS NULL THEN
    RETURN;
  END IF;

  -- Verbinde mit & (AND) — alle Wörter müssen matchen
  BEGIN
    ts_query := to_tsquery('simple', array_to_string(query_parts, ' & '));
  EXCEPTION WHEN OTHERS THEN
    -- Falls tsquery-Parsing fehlschlägt (z.B. Sonderzeichen), return leer
    RETURN;
  END;

  RETURN QUERY
  SELECT
    p.id, p.title, p.price, p.images,
    p.condition, p.location, p.category_id,
    ts_rank(p.search_vector, ts_query) AS rank
  FROM products p
  WHERE p.status = 'active'
    AND p.search_vector @@ ts_query
  ORDER BY rank DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
