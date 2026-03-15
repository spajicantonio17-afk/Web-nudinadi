-- ============================================================
-- Migration 029: Flexible Search (AND → OR fallback with ranking)
-- Solves: "BMW 320 Limousine" now finds "BMW 3er Sedan" etc.
--
-- Strategy:
--   1. AND match (all words) → highest relevance (×3)
--   2. OR match (any word) → medium relevance (×1)
--   3. ILIKE on title → lowest relevance (0.01 per match)
-- ============================================================

CREATE OR REPLACE FUNCTION flexible_search(
  p_query TEXT,
  p_extra_keywords TEXT[] DEFAULT '{}',
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  product_id UUID,
  relevance REAL
) AS $$
DECLARE
  ts_and tsquery;
  ts_or tsquery;
  words TEXT[];
  all_words TEXT[];
  and_parts TEXT[];
  or_parts TEXT[];
  word TEXT;
  trimmed TEXT;
BEGIN
  -- Clean and split into words
  words := string_to_array(
    lower(trim(regexp_replace(p_query, '\s+', ' ', 'g'))),
    ' '
  );

  -- Merge extra keywords (from AI synonyms/variants)
  IF array_length(p_extra_keywords, 1) > 0 THEN
    all_words := words || p_extra_keywords;
  ELSE
    all_words := words;
  END IF;

  -- Deduplicate
  all_words := ARRAY(SELECT DISTINCT unnest(all_words));

  -- Build AND parts (only original query words)
  and_parts := '{}';
  FOREACH word IN ARRAY words LOOP
    IF length(word) >= 2 THEN
      and_parts := array_append(and_parts, word || ':*');
    END IF;
  END LOOP;

  -- Build OR parts (original + extra keywords)
  or_parts := '{}';
  FOREACH word IN ARRAY all_words LOOP
    IF length(word) >= 2 THEN
      or_parts := array_append(or_parts, word || ':*');

      -- Also add Slavic stem variants for OR
      trimmed := word;
      IF length(word) > 4 THEN
        IF word ~ '(ovima|acije|acija|iranje)$' THEN
          trimmed := regexp_replace(word, '(ovima|acije|acija|iranje)$', '');
        ELSIF word ~ '(ima|ovi|ova|ove|ama|iju|ici|nja|nje|ski|sku|ske|nog|nom|nih)$' THEN
          trimmed := regexp_replace(word, '(ima|ovi|ova|ove|ama|iju|ici|nja|nje|ski|sku|ske|nog|nom|nih)$', '');
        ELSIF word ~ '(om|im|em|ih|ah|an|en|in|on|un|je|ja|ju|ci|ka|ke|ki|ku|ni|na|ne|nu|ti|li|le|la)$' THEN
          trimmed := regexp_replace(word, '(om|im|em|ih|ah|an|en|in|on|un|je|ja|ju|ci|ka|ke|ki|ku|ni|na|ne|nu|ti|li|le|la)$', '');
        ELSIF word ~ '(i|a|e|o|u)$' THEN
          trimmed := regexp_replace(word, '(i|a|e|o|u)$', '');
        END IF;
      END IF;
      IF trimmed != word AND length(trimmed) >= 2 THEN
        or_parts := array_append(or_parts, trimmed || ':*');
      END IF;
    END IF;
  END LOOP;

  -- If no valid words, return empty
  IF array_length(or_parts, 1) IS NULL THEN
    RETURN;
  END IF;

  -- Build tsquery objects
  BEGIN
    IF array_length(and_parts, 1) > 0 THEN
      ts_and := to_tsquery('simple', array_to_string(and_parts, ' & '));
    END IF;
    ts_or := to_tsquery('simple', array_to_string(or_parts, ' | '));
  EXCEPTION WHEN OTHERS THEN
    RETURN;
  END;

  RETURN QUERY
  SELECT
    p.id AS product_id,
    (
      -- AND match gets 3× boost
      CASE WHEN ts_and IS NOT NULL AND p.search_vector @@ ts_and
        THEN ts_rank(p.search_vector, ts_and) * 3.0
        ELSE 0.0
      END
      +
      -- OR match base relevance
      CASE WHEN p.search_vector @@ ts_or
        THEN ts_rank(p.search_vector, ts_or)
        ELSE 0.0
      END
      +
      -- ILIKE title bonus (catches partial matches not in tsvector)
      CASE WHEN p.title ILIKE '%' || p_query || '%'
        THEN 0.5
        ELSE 0.0
      END
    )::REAL AS relevance
  FROM products p
  WHERE p.status = 'active'
    AND (
      -- tsvector OR match
      p.search_vector @@ ts_or
      -- OR direct title substring match
      OR p.title ILIKE '%' || p_query || '%'
    )
  ORDER BY relevance DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Also update search_suggestions to use OR fallback when AND returns nothing
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
  ts_and tsquery;
  ts_or tsquery;
  words TEXT[];
  and_parts TEXT[];
  or_parts TEXT[];
  stem_parts TEXT[];
  word TEXT;
  trimmed TEXT;
  and_count INT;
BEGIN
  -- Clean input and split into words
  words := string_to_array(trim(regexp_replace(lower(p_query), '\s+', ' ', 'g')), ' ');

  and_parts := '{}';
  or_parts := '{}';
  stem_parts := '{}';
  FOREACH word IN ARRAY words LOOP
    IF length(word) >= 1 THEN
      and_parts := array_append(and_parts, word || ':*');
      or_parts := array_append(or_parts, word || ':*');

      -- Slavic stem trimming
      trimmed := word;
      IF length(word) > 4 THEN
        IF word ~ '(ovima|acije|acija|iranje)$' THEN
          trimmed := regexp_replace(word, '(ovima|acije|acija|iranje)$', '');
        ELSIF word ~ '(ima|ovi|ova|ove|ama|iju|ici|nja|nje|ski|sku|ske|nog|nom|nih)$' THEN
          trimmed := regexp_replace(word, '(ima|ovi|ova|ove|ama|iju|ici|nja|nje|ski|sku|ske|nog|nom|nih)$', '');
        ELSIF word ~ '(om|im|em|ih|ah|an|en|in|on|un|je|ja|ju|ci|ka|ke|ki|ku|ni|na|ne|nu|ti|li|le|la)$' THEN
          trimmed := regexp_replace(word, '(om|im|em|ih|ah|an|en|in|on|un|je|ja|ju|ci|ka|ke|ki|ku|ni|na|ne|nu|ti|li|le|la)$', '');
        ELSIF word ~ '(i|a|e|o|u)$' THEN
          trimmed := regexp_replace(word, '(i|a|e|o|u)$', '');
        END IF;
      END IF;
      IF trimmed != word AND length(trimmed) >= 2 THEN
        or_parts := array_append(or_parts, trimmed || ':*');
        stem_parts := array_append(stem_parts, trimmed || ':*');
      END IF;
    END IF;
  END LOOP;

  IF array_length(and_parts, 1) IS NULL THEN
    RETURN;
  END IF;

  -- Build queries
  BEGIN
    ts_and := to_tsquery('simple', array_to_string(and_parts, ' & '));
    ts_or := to_tsquery('simple', array_to_string(or_parts, ' | '));
  EXCEPTION WHEN OTHERS THEN
    RETURN;
  END;

  -- Try AND first
  SELECT COUNT(*) INTO and_count
  FROM products p
  WHERE p.status = 'active' AND p.search_vector @@ ts_and;

  -- If AND has results, use AND (but also add OR results below)
  IF and_count > 0 THEN
    RETURN QUERY
    SELECT
      p.id, p.title, p.price, p.images,
      p.condition, p.location, p.category_id,
      ts_rank(p.search_vector, ts_and) AS rank
    FROM products p
    WHERE p.status = 'active'
      AND p.search_vector @@ ts_and
    ORDER BY rank DESC
    LIMIT p_limit;
  ELSE
    -- Fallback to OR (any word matches)
    RETURN QUERY
    SELECT
      p.id, p.title, p.price, p.images,
      p.condition, p.location, p.category_id,
      ts_rank(p.search_vector, ts_or) AS rank
    FROM products p
    WHERE p.status = 'active'
      AND (p.search_vector @@ ts_or OR p.title ILIKE '%' || p_query || '%')
    ORDER BY rank DESC
    LIMIT p_limit;
  END IF;
END;
$$ LANGUAGE plpgsql;
