/**
 * Shared listing import logic used by both the single-import API
 * and the admin bulk-import pipeline.
 *
 * Intentionally lean — extracts the minimum needed for bulk imports:
 * title, description, price, condition, images, location, category.
 */

import { textWithGemini, parseJsonResponse } from '@/lib/gemini';
import { logger } from '@/lib/logger';

const SCRAPER_URL = process.env.SCRAPER_URL;
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

// ── Types ────────────────────────────────────────────────

export interface ImportedListing {
  title: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  condition: 'new' | 'like_new' | 'used' | null;
  images: string[];
  location: string | null;
  category: string | null;
  subcategory: string | null;
  originalUrl: string;
  priceType?: 'fixed' | 'negotiable';
}

// ── Fetch helpers ────────────────────────────────────────

async function fetchViaScraper(url: string): Promise<{ html: string; finalUrl: string }> {
  if (!SCRAPER_URL || !SCRAPER_API_KEY) throw new Error('Scraper not configured');
  const res = await fetch(`${SCRAPER_URL}/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': SCRAPER_API_KEY },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `Scraper HTTP ${res.status}`);
  }
  const data = await res.json();
  if (!data.success || !data.html) throw new Error(data.error || 'Empty scraper response');
  return { html: data.html, finalUrl: data.finalUrl || url };
}

async function fetchDirect(url: string): Promise<{ html: string; finalUrl: string }> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
      'Accept-Language': 'hr,bs;q=0.9,en;q=0.7',
    },
    signal: AbortSignal.timeout(20000),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { html: await res.text(), finalUrl: res.url || url };
}

export async function fetchListingHtml(url: string): Promise<{ html: string; finalUrl: string }> {
  if (SCRAPER_URL && SCRAPER_API_KEY) {
    try { return await fetchViaScraper(url); } catch (e) {
      logger.warn('[import-listing] Scraper failed, trying direct:', e instanceof Error ? e.message : e);
    }
  }
  return fetchDirect(url);
}

// ── HTML extraction helpers ──────────────────────────────

function extractImages(html: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const add = (src: string) => {
    const clean = src.split('?')[0];
    if (!seen.has(clean) && src.startsWith('http') && src.length < 500) {
      seen.add(clean); out.push(src);
    }
  };
  for (const m of html.matchAll(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi)) add(m[1]);
  for (const m of html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/gi)) add(m[1]);
  for (const m of html.matchAll(/<img[^>]+(?:src|data-src)=["'](https?[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi)) {
    if (!/(?:icon|logo|pixel|tracking|banner|sprite|avatar)/i.test(m[1])) add(m[1]);
  }
  for (const m of html.matchAll(/"(?:photos|images|media)"\s*:\s*\[([\s\S]*?)\]/g)) {
    for (const u of m[1].matchAll(/"(?:url|src)"\s*:\s*"(https?:[^"]+)"/g)) add(u[1]);
  }
  return out.slice(0, 10);
}

function extractMeta(html: string): Record<string, string> {
  const meta: Record<string, string> = {};
  const t = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (t) meta.title = t[1].trim();
  for (const m of html.matchAll(/<meta[^>]+property=["'](og:[^"']+)["'][^>]+content=["']([^"']+)["']/gi)) meta[m[1]] = m[2].trim();
  for (const m of html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["'](og:[^"']+)["']/gi)) meta[m[2]] = m[1].trim();
  for (const m of html.matchAll(/<meta[^>]+name=["'](description|product:price:amount|product:price:currency)["'][^>]+content=["']([^"']+)["']/gi)) meta[m[1]] = m[2].trim();
  return meta;
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|h[1-6]|li)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/[^\S\n]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

// ── Gemini prompt ────────────────────────────────────────

function buildBulkPrompt(url: string, title: string, description: string, price: string, pageText: string, images: string[]): string {
  return `You are a marketplace listing parser. Extract structured data from this classified ad.

URL: ${url}
OG Title: ${title}
OG Description: ${description}
Meta Price: ${price}
Images found: ${images.slice(0, 3).join(', ')}

Page text (truncated):
${pageText.slice(0, 4000)}

Return ONLY valid JSON with these exact fields:
{
  "title": "product title in original language",
  "description": "full description, preserve line breaks as \\n",
  "price": number or null (numeric only, no currency),
  "currency": "BAM" | "EUR" | "USD" | "HRK" | "RSD" | null,
  "condition": "new" | "like_new" | "used" | null,
  "location": "city name" | null,
  "category": "one of: Vozila, Nekretnine, Mobiteli i oprema, Računala i IT, Tehnika i elektronika, Dom i vrtne garniture, Odjeća i obuća, Sport i rekreacija, Strojevi i alati, Ostalo",
  "subcategory": "subcategory name" | null,
  "priceType": "fixed" | "negotiable"
}`;
}

// ── Main export: import a single listing URL ─────────────

export async function importSingleListing(url: string): Promise<ImportedListing> {
  const { html, finalUrl } = await fetchListingHtml(url);

  if (html.length < 300) throw new Error('Page too short or empty');

  const images = extractImages(html);
  const meta = extractMeta(html);
  const body = html.match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i)?.[1] ?? html;
  const pageText = htmlToText(body);

  const isNegotiable = /Na upit|Po dogovoru|Auf Anfrage/i.test(meta['og:title'] || pageText.slice(0, 500));

  let data: Record<string, unknown>;
  try {
    const raw = await textWithGemini(buildBulkPrompt(
      finalUrl,
      meta['og:title'] || meta.title || '',
      meta['og:description'] || meta.description || '',
      meta['product:price:amount'] || '',
      pageText,
      images,
    ));
    data = parseJsonResponse(raw) as Record<string, unknown>;
  } catch (e) {
    logger.warn('[import-listing] Gemini failed, using meta fallback:', e instanceof Error ? e.message : e);
    // Minimal fallback from meta tags
    if (!meta['og:title'] && !meta.title) throw new Error('Could not parse listing and no meta title available');
    const rawPrice = meta['product:price:amount'];
    const parsedPrice = rawPrice ? parseFloat(rawPrice.replace(/[^0-9.,]/g, '').replace(',', '.')) : null;
    data = {
      title: meta['og:title'] || meta.title || '',
      description: meta['og:description'] || meta.description || null,
      price: isNegotiable ? 0 : (parsedPrice && !isNaN(parsedPrice) ? parsedPrice : null),
      currency: meta['product:price:currency'] || null,
      condition: 'used',
      location: null,
      category: 'Ostalo',
      subcategory: null,
      priceType: isNegotiable ? 'negotiable' : 'fixed',
    };
  }

  return {
    title: (data.title as string) || '',
    description: (data.description as string) || null,
    price: isNegotiable ? 0 : (typeof data.price === 'number' ? data.price : null),
    currency: (data.currency as string) || 'BAM',
    condition: (['new', 'like_new', 'used'].includes(data.condition as string) ? data.condition : 'used') as ImportedListing['condition'],
    images: images.length > 0 ? images : ((data.images as string[]) || []),
    location: (data.location as string) || null,
    category: (data.category as string) || 'Ostalo',
    subcategory: (data.subcategory as string) || null,
    originalUrl: finalUrl,
    priceType: isNegotiable ? 'negotiable' : ((data.priceType as string) === 'negotiable' ? 'negotiable' : 'fixed'),
  };
}
