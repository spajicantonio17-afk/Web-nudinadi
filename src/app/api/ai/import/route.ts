import { NextRequest, NextResponse } from 'next/server';
import { textWithGemini, parseJsonResponse, sanitizeForPrompt } from '@/lib/gemini';

// ── Fix D: URL normalization ──────────────────────────────
function normalizeUrl(raw: string): string {
  let url = raw.trim();
  // Strip tracking params
  url = url.replace(/[?&](utm_\w+|fbclid|gclid|ref|source|mc_cid|mc_eid)=[^&]*/gi, '');
  // Clean up leftover ? or &
  url = url.replace(/[?&]$/, '');
  // Ensure protocol
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  return url;
}

/** Validate that the URL is a proper https URL */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

// ── Fix A: Multiple header sets for retry ─────────────────
const HEADER_SETS: Record<string, string>[] = [
  {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'hr,bs;q=0.9,sr;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
  },
  {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'bs-BA,bs;q=0.9,hr;q=0.8,en-US;q=0.7',
    'Cache-Control': 'no-cache',
  },
  {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  },
];

/** Extract image URLs from HTML before stripping tags */
function extractImages(html: string): string[] {
  const seen = new Set<string>();
  const images: string[] = [];

  const add = (src: string) => {
    try {
      const clean = src.split('?')[0]; // strip query params for dedup
      if (!seen.has(clean) && src.startsWith('http') && src.length < 500) {
        seen.add(clean);
        images.push(src);
      }
    } catch { /* skip invalid */ }
  };

  // og:image (most reliable — usually the main product photo)
  for (const m of html.matchAll(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi)) add(m[1]);
  for (const m of html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/gi)) add(m[1]);

  // twitter:image
  for (const m of html.matchAll(/<meta[^>]+(?:name|property)=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi)) add(m[1]);

  // img src / data-src (product images are usually large JPEGs)
  for (const m of html.matchAll(/<img[^>]+(?:src|data-src|data-lazy-src)=["']([^"']+)["'][^>]*>/gi)) {
    const src = m[1];
    if (
      src.startsWith('http') &&
      /\.(jpg|jpeg|png|webp)/i.test(src) &&
      !/(?:icon|logo|pixel|tracking|banner|sprite|avatar|thumb\.(?:gif|png)$|\/assets\/|\/medals\/|\/badges\/|\/ui\/|\/static\/img)/i.test(src)
    ) add(src);
  }

  // srcset (take first URL from each srcset)
  for (const m of html.matchAll(/srcset=["']([^"']+)["']/gi)) {
    const first = m[1].split(',')[0].trim().split(' ')[0];
    if (first.startsWith('http')) add(first);
  }

  return images.slice(0, 12);
}

/** Extract OG and other meta tags as key→value map */
function extractMeta(html: string): Record<string, string> {
  const meta: Record<string, string> = {};

  // <title>
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) meta.title = titleMatch[1].trim();

  // og: / article: meta
  for (const m of html.matchAll(/<meta[^>]+property=["'](og:[^"']+|article:[^"']+)["'][^>]+content=["']([^"']+)["'][^>]*>/gi)) {
    meta[m[1]] = m[2].trim();
  }
  // reverse attribute order
  for (const m of html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["'](og:[^"']+|article:[^"']+)["'][^>]*>/gi)) {
    meta[m[2]] = m[1].trim();
  }

  // name= meta (description, keywords)
  for (const m of html.matchAll(/<meta[^>]+name=["'](description|keywords|price|product:price:amount|product:price:currency)["'][^>]+content=["']([^"']+)["'][^>]*>/gi)) {
    meta[m[1]] = m[2].trim();
  }

  return meta;
}

/** Extract JSON-LD structured data blocks (schema.org Product/Offer) */
function extractJsonLd(html: string): string {
  const blocks: string[] = [];
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const obj = JSON.parse(m[1]);
      const type = obj['@type'] || '';
      if (/Product|Offer|ItemPage|BreadcrumbList/i.test(type) || obj.name || obj.price) {
        blocks.push(JSON.stringify(obj));
      }
    } catch { /* skip invalid JSON */ }
  }
  return blocks.slice(0, 3).join('\n');
}

/** Strip HTML to plain readable text */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Fix A: Fetch with retry (up to 3 attempts with different headers) ──
async function fetchWithRetry(url: string): Promise<{ html: string; finalUrl: string }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < HEADER_SETS.length; attempt++) {
    try {
      const response = await fetch(url, {
        headers: HEADER_SETS[attempt],
        signal: AbortSignal.timeout(20000), // 20s timeout (up from 12s)
        redirect: 'follow',
      });

      if (response.ok) {
        const html = await response.text();
        return { html, finalUrl: response.url || url };
      }

      // 403/429 → try next header set
      if (response.status === 403 || response.status === 429) {
        lastError = new Error(`HTTP ${response.status}`);
        continue;
      }

      // Other HTTP errors → don't retry
      throw new Error(`HTTP_${response.status}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isTimeout = msg.includes('timeout') || msg.includes('AbortError');
      const isRetryable = msg.includes('403') || msg.includes('429') || isTimeout;

      lastError = err instanceof Error ? err : new Error(msg);

      if (!isRetryable || attempt === HEADER_SETS.length - 1) {
        throw lastError;
      }
      // Small delay before retry
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  throw lastError || new Error('Fetch failed');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'URL je obavezan' }, { status: 400 });
    }

    // Fix D: Normalize URL
    url = normalizeUrl(url);

    if (!isValidUrl(url)) {
      return NextResponse.json({ success: false, error: 'Nevažeći URL — mora počinjati sa http:// ili https://' }, { status: 400 });
    }

    // Fix A: Fetch with retry and multiple header sets
    let html: string;
    let finalUrl: string = url;
    try {
      const result = await fetchWithRetry(url);
      html = result.html;
      finalUrl = result.finalUrl;
    } catch (fetchErr) {
      const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      const isTimeout = msg.includes('timeout') || msg.includes('AbortError');
      const isBlocked = msg.includes('403');
      const isRateLimited = msg.includes('429');

      let errorMessage: string;
      let hint: string | undefined;

      if (isTimeout) {
        errorMessage = 'Stranica se nije učitala na vrijeme (timeout).';
        hint = 'Pokušaj ponovo za minutu — stranica je možda spora.';
      } else if (isBlocked) {
        errorMessage = 'Stranica blokira automatski pristup (403 Forbidden).';
        hint = 'Neki portali blokiraju servere. Probaj kopirati tekst oglasa ručno.';
      } else if (isRateLimited) {
        errorMessage = 'Previše zahtjeva — portal ograničava pristup (429).';
        hint = 'Sačekaj 1-2 minute pa pokušaj ponovo.';
      } else {
        errorMessage = 'Nije moguće dohvatiti stranicu.';
        hint = 'Provjeri da je link ispravan i da stranica postoji.';
      }

      return NextResponse.json(
        { success: false, error: errorMessage, hint },
        { status: 400 }
      );
    }

    // Fix E: Content validation — check that we got meaningful HTML
    if (html.length < 500) {
      return NextResponse.json(
        { success: false, error: 'Stranica je prazna ili nema dovoljno sadržaja za analizu.', hint: 'Provjeri da link vodi na konkretni oglas, a ne na naslovnu stranicu.' },
        { status: 400 }
      );
    }

    // Check for bot/captcha blocks (common on OLX, njuskalo)
    const lowerHtml = html.toLowerCase();
    if (
      (lowerHtml.includes('captcha') || lowerHtml.includes('cloudflare') || lowerHtml.includes('just a moment')) &&
      !lowerHtml.includes('product') && !lowerHtml.includes('oglas') && !lowerHtml.includes('cijena')
    ) {
      return NextResponse.json(
        { success: false, error: 'Stranica prikazuje CAPTCHA ili zaštitu od botova.', hint: 'Pokušaj ponovo za minutu. Ako se ponavlja, kopiraj tekst oglasa ručno.' },
        { status: 400 }
      );
    }

    // Pre-extract structured data BEFORE stripping HTML
    const images = extractImages(html);
    const meta = extractMeta(html);
    const jsonLd = extractJsonLd(html);

    // Fix B: Meta-tag fallback — if Gemini fails, we can still build basic data
    const metaFallback = {
      title: meta['og:title'] || meta.title || null,
      description: meta['og:description'] || meta.description || null,
      price: null as number | null,
      images: images.slice(0, 6),
      location: null as string | null,
      originalUrl: finalUrl,
    };

    // Try to extract price from meta/JSON-LD
    const priceStr = meta['product:price:amount'] || meta['price'];
    if (priceStr) {
      const parsed = parseFloat(priceStr.replace(/[^0-9.,]/g, '').replace(',', '.'));
      if (!isNaN(parsed)) metaFallback.price = parsed;
    }

    // Clean text for Gemini (cut to 10k chars, focusing on body content)
    const bodyMatch = html.match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i);
    const bodyHtml = bodyMatch ? bodyMatch[1] : html;
    const pageText = htmlToText(bodyHtml).slice(0, 10000);

    const prompt = `Izvuci podatke oglasa sa sljedeće stranice. Koristi SVE dostupne izvore podataka.

URL: ${finalUrl}

OG META TAGOVI (pouzdani):
${Object.entries(meta).map(([k, v]) => `${k}: ${sanitizeForPrompt(v, 500)}`).join('\n') || '(nema)'}

JSON-LD STRUKTURIRANI PODACI (veoma pouzdan):
${jsonLd || '(nema)'}

SLIKE IZVUČENE IZ HTML-A:
${images.length > 0 ? images.join('\n') : '(nema)'}

TEKST STRANICE:
"""
${sanitizeForPrompt(pageText, 8000)}
"""

Zadatak: Izvuci podatke za second-hand oglas. Prioritet izvora: JSON-LD > OG meta > tekst stranice.
Odgovori ISKLJUCIVO na bosanskom/hrvatskom jeziku.

Vrati SAMO validan JSON:
{
  "title": "naslov oglasa (max 80 znakova)",
  "description": "opis oglasa",
  "price": broj_ili_null,
  "currency": "KM | EUR | HRK | USD | null",
  "category": "kategorija na bosanskom",
  "subcategory": "potkategorija ili null",
  "condition": "Novo | Kao novo | Korišteno | Za dijelove | null",
  "location": "grad/lokacija ili null",
  "images": ${JSON.stringify(images.slice(0, 6))},
  "seller": "ime prodavača ili null",
  "phone": "telefon ili null",
  "attributes": {"ključ": "vrijednost"},
  "originalUrl": "${finalUrl}"
}

Polje "images" je već popunjeno gore izvučenim slikama — samo ih zadrži ili dopuni ako pronađeš bolje URL-ove u tekstu.
Ako podatak nije pronađen, postavi null.`;

    // Fix B: Robust Gemini parsing with fallback
    let data: Record<string, unknown>;
    try {
      const raw = await textWithGemini(prompt);
      data = parseJsonResponse(raw) as Record<string, unknown>;
    } catch (geminiErr) {
      console.warn('[/api/ai/import] Gemini failed, using meta-tag fallback:', geminiErr);
      // Fallback to meta-extracted data
      if (metaFallback.title) {
        data = {
          title: metaFallback.title,
          description: metaFallback.description,
          price: metaFallback.price,
          currency: null,
          category: null,
          subcategory: null,
          condition: null,
          location: metaFallback.location,
          images: metaFallback.images,
          seller: null,
          phone: null,
          attributes: {},
          originalUrl: metaFallback.originalUrl,
          _fallback: true,
        };
      } else {
        return NextResponse.json(
          { success: false, error: 'AI nije mogao analizirati stranicu.', hint: 'Probaj ponovo ili kopiraj podatke ručno.' },
          { status: 500 }
        );
      }
    }

    // Ensure images are always included (fallback to pre-extracted)
    if (!data.images || !Array.isArray(data.images) || (data.images as string[]).length === 0) {
      data.images = images.slice(0, 6);
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[/api/ai/import]', err);
    return NextResponse.json(
      { success: false, error: 'Greška pri importu oglasa.', hint: 'Pokušaj ponovo. Ako se problem ponavlja, kopiraj oglas ručno.', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
