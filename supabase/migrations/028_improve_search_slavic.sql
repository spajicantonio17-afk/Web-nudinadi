-- ============================================================
-- Migration 028: Improved search for Slavic languages
-- Replaces search_suggestions() with stem-aware prefix matching
-- "automobili" now finds "automobil", "stanovi" finds "stan"
-- ============================================================

-- Drop and recreate with Slavic stem-trimming
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
  ts_query_stem tsquery;
  words TEXT[];
  query_parts TEXT[];
  stem_parts TEXT[];
  word TEXT;
  trimmed TEXT;
BEGIN
  -- Clean input and split into words
  words := string_to_array(trim(regexp_replace(p_query, '\s+', ' ', 'g')), ' ');

  -- Build prefix-match for each word + stemmed variant
  query_parts := '{}';
  stem_parts := '{}';
  FOREACH word IN ARRAY words LOOP
    IF length(word) >= 1 THEN
      query_parts := array_append(query_parts, word || ':*');

      -- Slavic stem trimming: remove common bs/hr/sr endings
      -- This helps match: automobili→automobil, stanovi→stan, telefona→telefon
      trimmed := word;
      IF length(word) > 4 THEN
        -- Try removing common suffixes (longest first)
        IF word ~ '(ovima|acije|acija|iranje)$' THEN
          trimmed := regexp_replace(word, '(ovima|acije|acija|iranje)$', '');
        ELSIF word ~ '(ima|ovi|ova|ove|ama|iju|ici|ici|nja|nje|ski|sku|ske|nog|nom|nih)$' THEN
          trimmed := regexp_replace(word, '(ima|ovi|ova|ove|ama|iju|ici|nja|nje|ski|sku|ske|nog|nom|nih)$', '');
        ELSIF word ~ '(om|im|em|ih|ah|an|en|in|on|un|je|ja|ju|ci|ka|ke|ki|ku|ni|na|ne|nu|ti|li|le|la)$' THEN
          trimmed := regexp_replace(word, '(om|im|em|ih|ah|an|en|in|on|un|je|ja|ju|ci|ka|ke|ki|ku|ni|na|ne|nu|ti|li|le|la)$', '');
        ELSIF word ~ '(i|a|e|o|u)$' THEN
          trimmed := regexp_replace(word, '(i|a|e|o|u)$', '');
        END IF;
      END IF;

      -- Only add stem variant if it differs and is long enough
      IF trimmed != word AND length(trimmed) >= 2 THEN
        stem_parts := array_append(stem_parts, trimmed || ':*');
      END IF;
    END IF;
  END LOOP;

  IF array_length(query_parts, 1) IS NULL THEN
    RETURN;
  END IF;

  -- Try exact prefix match first
  BEGIN
    ts_query := to_tsquery('simple', array_to_string(query_parts, ' & '));
  EXCEPTION WHEN OTHERS THEN
    RETURN;
  END;

  -- Build stemmed query (for fallback)
  IF array_length(stem_parts, 1) > 0 THEN
    BEGIN
      -- Combine: (original OR stemmed) for broader matching
      ts_query_stem := to_tsquery('simple',
        array_to_string(query_parts, ' & ') || ' | ' || array_to_string(stem_parts, ' & ')
      );
    EXCEPTION WHEN OTHERS THEN
      ts_query_stem := ts_query; -- Fallback to exact
    END;
  ELSE
    ts_query_stem := ts_query;
  END IF;

  RETURN QUERY
  SELECT
    p.id, p.title, p.price, p.images,
    p.condition, p.location, p.category_id,
    ts_rank(p.search_vector, ts_query_stem) AS rank
  FROM products p
  WHERE p.status = 'active'
    AND p.search_vector @@ ts_query_stem
  ORDER BY rank DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
