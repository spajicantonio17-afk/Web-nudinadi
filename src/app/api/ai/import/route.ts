import { NextRequest, NextResponse } from 'next/server';
import { textWithGemini, parseJsonResponse, sanitizeForPrompt } from '@/lib/gemini';

/** Validate that the URL is a proper https URL */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'URL je obavezan' }, { status: 400 });
    }

    if (!isValidUrl(url)) {
      return NextResponse.json({ success: false, error: 'Nevažeći URL — mora počinjati sa http:// ili https://' }, { status: 400 });
    }

    // Fetch the page server-side
    let html: string;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'hr,bs;q=0.9,sr;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
        },
        signal: AbortSignal.timeout(12000),
        redirect: 'follow',
      });

      if (!response.ok) {
        return NextResponse.json(
          { success: false, error: `Stranica nije dostupna (HTTP ${response.status}). Moguće da stranica blokira automatski pristup.` },
          { status: 400 }
        );
      }
      html = await response.text();
    } catch (fetchErr) {
      const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      const isTimeout = msg.includes('timeout') || msg.includes('AbortError');
      return NextResponse.json(
        { success: false, error: isTimeout ? 'Stranica se nije učitala na vrijeme (timeout). Pokušaj ponovo.' : 'Nije moguće dohvatiti stranicu.' },
        { status: 400 }
      );
    }

    // Pre-extract structured data BEFORE stripping HTML
    const images = extractImages(html);
    const meta = extractMeta(html);
    const jsonLd = extractJsonLd(html);

    // Clean text for Gemini (cut to 10k chars, focusing on body content)
    const bodyMatch = html.match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i);
    const bodyHtml = bodyMatch ? bodyMatch[1] : html;
    const pageText = htmlToText(bodyHtml).slice(0, 10000);

    const prompt = `Izvuci podatke oglasa sa sljedeće stranice. Koristi SVE dostupne izvore podataka.

URL: ${url}

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
  "originalUrl": "${url}"
}

Polje "images" je već popunjeno gore izvučenim slikama — samo ih zadrži ili dopuni ako pronađeš bolje URL-ove u tekstu.
Ako podatak nije pronađen, postavi null.`;

    const raw = await textWithGemini(prompt);
    const data = parseJsonResponse(raw) as Record<string, unknown>;

    // Ensure images are always included (fallback to pre-extracted)
    if (!data.images || !Array.isArray(data.images) || (data.images as string[]).length === 0) {
      data.images = images.slice(0, 6);
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[/api/ai/import]', err);
    return NextResponse.json(
      { success: false, error: 'Greška pri importu oglasa', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
