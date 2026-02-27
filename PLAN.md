# Plan: AI Suche + Tags + Ähnliche Artikel

## Übersicht
Tags-System zum Leben erwecken, Suche auf Full-Text umstellen, Echtzeit-Vorschläge beim Tippen, ähnliche Artikel auf Produktseite. Gleiche Kosten, 10x bessere Suche.

---

## Phase 1: Datenbank — tags + search_vector (Migration 015)

**Datei:** `supabase/migrations/015_search_vector_and_tags.sql`

```sql
-- 1. Neue Spalten
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2. GIN-Indexe (schnelle Suche)
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

-- 6. RPC-Funktion für Ähnliche Produkte (Tag-Overlap + gleiche Kategorie + Preis)
CREATE OR REPLACE FUNCTION get_similar_products(
  p_product_id UUID,
  p_category_id UUID,
  p_tags TEXT[],
  p_price NUMERIC,
  p_limit INT DEFAULT 6
)
RETURNS TABLE (
  id UUID, title TEXT, price NUMERIC, images TEXT[],
  condition product_condition, location TEXT, created_at TIMESTAMPTZ,
  seller_id UUID, category_id UUID, tag_overlap INT
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
      p.category_id = p_category_id
      OR p.tags && p_tags  -- mindestens 1 Tag überschneidung
    )
    AND p.price BETWEEN p_price * 0.5 AND p_price * 2.0  -- ±50% Preisspanne
  ORDER BY
    (CASE WHEN p.category_id = p_category_id THEN 1 ELSE 0 END) DESC,
    tag_overlap DESC,
    p.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 7. RPC für Autocomplete-Vorschläge (schnell, kein Gemini)
CREATE OR REPLACE FUNCTION search_suggestions(
  p_query TEXT,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  id UUID, title TEXT, price NUMERIC, images TEXT[],
  condition product_condition, location TEXT, category_id UUID, rank REAL
) AS $$
DECLARE
  ts_query tsquery;
BEGIN
  -- Konvertiere jeden Suchbegriff zu prefix-match (ip → ip:*)
  ts_query := to_tsquery('simple',
    array_to_string(
      ARRAY(SELECT word || ':*' FROM unnest(string_to_array(trim(p_query), ' ')) AS word WHERE word != ''),
      ' & '
    )
  );

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
```

**Fehlerprävention:**
- `IF NOT EXISTS` verhindert doppelte Spalten/Indexe
- `DROP TRIGGER IF EXISTS` vermeidet Fehler bei Re-Run
- `'simple'` Config statt `'english'` → bosnische Zeichen (č,ć,š,ž,đ) funktionieren
- `COALESCE` überall → keine NULL-Crashes
- `BEFORE` Trigger → search_vector immer aktuell VOR dem Speichern
- Trigger feuert nur bei `UPDATE OF title, description, tags` → kein unnötiges Update bei Preis-/Status-Änderung
- Prefix-Match (`ip:*`) in suggestions → findet "iPhone" schon bei "ip"
- Backfill-UPDATE läuft NACH Trigger-Erstellung → trigger-basierte Logik wird validiert

---

## Phase 2: TypeScript Types updaten

**Datei:** `src/lib/database.types.ts`

Änderungen:
- `Product` Interface: `tags: string[]` hinzufügen (nach `attributes`)
- `ProductInsert`: `tags?: string[]` hinzufügen
- `ProductUpdate`: `tags?: string[]` hinzufügen
- `search_vector` wird NICHT in Types aufgenommen (DB-internes Feld, Trigger verwaltet es)

---

## Phase 3: AI — Kategorisierung + Tags in einem Call

**Datei:** `src/app/api/ai/enhance/route.ts`

Den `categorize` Action-Prompt erweitern um Tags-Generierung:

```
Bestehender Prompt + Zusatz:

"Generiere auch 10-15 versteckte Such-Tags.
Tag-Regeln:
- Sinonyme in bs/hr/sr (mobitel = telefon = handy)
- Marke, Modell, Typ
- Farbe, Größe, Zustand (wenn erkennbar)
- Umgangssprachliche Begriffe (laptop = leptop = prijenosnik)
- Max 3 Wörter pro Tag, alles lowercase

Vrati JSON:
{
  "category": "...",
  "subcategory": "...",
  "correctedTitle": "...",
  "confidence": 0-100,
  "vehicleType": "...",
  "tags": ["tag1", "tag2", ...]
}"
```

**Bestehende `tags` Action bleibt erhalten** (für manuellen Aufruf, z.B. Edit-Modus).

**Fehlerprävention:**
- Wenn Gemini `tags` nicht zurückgibt → Default `[]`
- Tags werden im Code dedupliziert + lowercased + auf max 20 begrenzt
- Bestehender Code der `categorize` aufruft bekommt tags als Bonus — bricht nichts

---

## Phase 4: Upload-Flow — Tags automatisch speichern

**Datei:** `src/app/upload/page.tsx` (PROTECTED — minimale Änderung)

Änderungen im `handlePublish`:

1. **VOR createProduct**: Tags generieren (leise im Hintergrund)
   - Wenn AI-Kategorisierung schon gelaufen ist UND tags dabei waren → nutze diese
   - Wenn NICHT → schneller Call an `/api/ai/enhance` mit `action: 'tags'`
   - Wenn Call fehlschlägt → leeres Array `[]` (Publish wird NICHT blockiert)

2. **Bei createProduct/updateProduct**: `tags` Feld mitgeben

```typescript
// CREATE
const newProduct = await createProduct({
  ...existingFields,
  tags: generatedTags,  // ← NEU
});

// UPDATE
await updateProduct(editProductId, {
  ...existingFields,
  tags: generatedTags,  // ← NEU
});
```

**Fehlerprävention:**
- Tags-Generierung ist non-blocking (try/catch, leeres Array als Fallback)
- Publish-Button bleibt sofort klickbar — Tags werden NICHT gewartet wenn sie fehlen
- Bei Edit: nur neue Tags generieren wenn Titel/Beschreibung sich geändert hat

---

## Phase 5: productService — Suche auf tsvector umstellen

**Datei:** `src/services/productService.ts`

Änderungen in `getProducts()`:

```typescript
// ALT (Zeile 49):
if (filters.search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)

// NEU:
if (filters.search) {
  query = query.textSearch('search_vector', filters.search, {
    config: 'simple',
    type: 'plain',  // plainto_tsquery — keine Operator-Syntax nötig
  })
}
```

Neue Funktionen hinzufügen:

```typescript
// Autocomplete-Vorschläge (schnelle DB-Query, kein Gemini)
export async function getSearchSuggestions(query: string, limit = 5)

// Ähnliche Produkte (Tag-Overlap + Kategorie + Preis)
export async function getSimilarProducts(productId: string, tags: string[], categoryId: string, price: number, limit = 6)
```

**Fehlerprävention:**
- `textSearch` mit `type: 'plain'` → User kann keine SQL-Injection über Suchoperatoren machen
- Wenn textSearch 0 Ergebnisse → KEIN Fallback auf ILIKE (vermeidet langsame Queries)
- `getSearchSuggestions` hat minimum 2 Zeichen Pflicht
- Leere Tags-Arrays in getSimilarProducts → nur Kategorie-Match

---

## Phase 6: Autocomplete-Dropdown Komponente

**Neue Datei:** `src/components/SearchSuggestions.tsx`

Features:
- Dropdown unter dem Suchfeld
- 3 Sektionen: Produkte (max 5), Kategorien (max 3)
- Debounce 300ms (kein API-Spam)
- AbortController (stale Requests canceln)
- Minimum 2 Zeichen bevor Query startet
- Keyboard-Navigation (Pfeiltasten + Enter)
- Click auf Produkt → navigiert zur Produktseite
- Click auf Kategorie → setzt Kategorie-Filter
- ESC oder Blur → schließt Dropdown

**Fehlerprävention:**
- AbortController verhindert Race Conditions
- Debounce verhindert API-Spam
- Loading-Skeleton während Query läuft (kein leeres Dropdown)
- Leere Ergebnisse → "Keine Vorschläge" Text, kein leeres Dropdown

---

## Phase 7: Home Page — Minimale Integration (PROTECTED)

**Datei:** `src/app/page.tsx` (PROTECTED — nur Imports + Wiring)

Minimale Änderungen:
1. Import `SearchSuggestions` Komponente
2. Suchfeld-`onChange` connected zu SearchSuggestions
3. AI-Search Prompt: Radius-Extraktion (`"radius": 30`)
4. `handleSmartSearch`: Radius aus AI-Antwort setzen + Subcategory nutzen

**Filter-Chips (optional, als eigene Komponente):**
- Zeigen was AI gesetzt hat: "Preis: bis 500€ ×", "Sarajevo ×", "Novo ×"
- Click auf × entfernt den jeweiligen Filter
- Neue Datei: `src/components/ActiveFilterChips.tsx`

---

## Phase 8: AI Search Prompt — Radius + Subcategory

**Datei:** `src/app/api/ai/search/route.ts`

Prompt erweitern:

```
Bestehender JSON + neue Felder:

"filters": {
  ...existing,
  "radius": number_oder_null,  ← NEU (z.B. 30 für "30km")
}
```

**Fehlerprävention:**
- Default radius `null` (kein Filter wenn nicht erwähnt)
- Validierung: radius muss 1-500 sein, sonst ignorieren

---

## Phase 9: Ähnliche Artikel — Produktdetailseite

**Neue Datei:** `src/components/SimilarProducts.tsx`

Features:
- Horizontal scrollbare Karte (gleicher Stil wie Home-Produkte)
- Nutzt `getSimilarProducts()` RPC
- Zeigt "Slični oglasi" Überschrift
- Max 6 Produkte
- Versteckt sich komplett wenn keine Ergebnisse

**Datei:** `src/app/product/[id]/page.tsx` (NICHT protected)

Änderung:
- Import + Render `<SimilarProducts>` nach Q&A-Sektion
- Props: `productId`, `tags`, `categoryId`, `price`

**Fehlerprävention:**
- Aktuelles Produkt wird aus Ergebnissen ausgeschlossen (via RPC)
- Kein Product → Section versteckt (nicht "0 Ergebnisse" zeigen)
- Loading-State mit Skeleton

---

## Phase 10: Tags-Backfill für existierende Produkte

**Neue Datei:** `src/app/api/admin/backfill-tags/route.ts`

Admin-only API Route die:
1. Alle Produkte OHNE Tags holt (`tags = '{}' OR tags IS NULL`)
2. Für jedes: `/api/ai/enhance` mit `action: 'tags'` aufruft
3. Tags speichert
4. search_vector wird automatisch durch Trigger aktualisiert
5. Rate-limited: max 5 pro Sekunde (Gemini Rate Limits)
6. Gibt Progress zurück (batch-weise, z.B. 10er Batches)

**Fehlerprävention:**
- Admin-Check (nur is_admin darf aufrufen)
- Batch-Processing mit Pausen (kein Gemini Rate Limit Hit)
- Einzelne Fehlschläge überspringen, nicht gesamten Batch abbrechen
- Idempotent: kann mehrfach aufgerufen werden

---

## Zusammenfassung Dateiänderungen

### NEUE Dateien (6):
1. `supabase/migrations/015_search_vector_and_tags.sql` — DB Migration
2. `src/components/SearchSuggestions.tsx` — Autocomplete Dropdown
3. `src/components/SimilarProducts.tsx` — Ähnliche Artikel
4. `src/components/ActiveFilterChips.tsx` — AI Filter Chips
5. `src/services/searchService.ts` — Such-Funktionen (Suggestions + Similar)
6. `src/app/api/admin/backfill-tags/route.ts` — Tags Backfill

### MODIFIZIERTE Dateien (6):
1. `src/lib/database.types.ts` — `tags` Feld hinzufügen
2. `src/app/api/ai/enhance/route.ts` — categorize Prompt + Tags
3. `src/app/api/ai/search/route.ts` — Radius Extraktion
4. `src/services/productService.ts` — textSearch + neue Funktionen
5. `src/app/upload/page.tsx` — Tags bei Publish speichern (PROTECTED, minimal)
6. `src/app/page.tsx` — SearchSuggestions einbinden (PROTECTED, minimal)

### MODIFIZIERTE Dateien (nicht protected):
7. `src/app/product/[id]/page.tsx` — SimilarProducts einbinden

---

## Reihenfolge der Umsetzung

1. Migration (DB muss zuerst stehen)
2. TypeScript Types (Code muss kompilieren)
3. AI Enhance Route (Kategorisierung + Tags)
4. Upload Flow (Tags speichern)
5. productService (textSearch)
6. searchService (Suggestions + Similar)
7. SearchSuggestions Komponente
8. SimilarProducts Komponente
9. ActiveFilterChips Komponente
10. AI Search Route (Radius)
11. Home Page Integration
12. Product Detail Integration
13. Backfill Script
14. Test alles end-to-end
