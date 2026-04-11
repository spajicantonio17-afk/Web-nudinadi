import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { rateLimit, rateLimitResponse, getIp, RATE_LIMITS } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const SCRAPER_URL = process.env.SCRAPER_URL;
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

const MAX_PAGES = 10; // safety cap — max pages to crawl per profile
const MAX_LISTINGS = 200; // safety cap — max listings per profile

// ── Detect platform from URL ─────────────────────────────
type Platform = 'olx' | 'njuskalo' | 'unknown';

function detectPlatform(url: string): Platform {
  if (/olx\.(ba|rs|hr)/i.test(url)) return 'olx';
  if (/njuskalo\.hr/i.test(url)) return 'njuskalo';
  return 'unknown';
}

// ── Validate that URL looks like a profile page ──────────
function isProfileUrl(url: string, platform: Platform): boolean {
  if (platform === 'olx') return /\/profil\//i.test(url) || /\/shops?\//i.test(url);
  if (platform === 'njuskalo') return /\/korisnik\//i.test(url);
  return false;
}

// ── Normalize profile URL to first page ─────────────────
function normalizeProfileUrl(url: string): string {
  let u = url.trim();
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  // Remove existing page param
  u = u.replace(/[?&]page=\d+/i, '').replace(/[?&]$/, '');
  // Ensure trailing slash
  if (!/\/$/.test(new URL(u).pathname)) {
    const parsed = new URL(u);
    parsed.pathname = parsed.pathname + '/';
    u = parsed.toString();
  }
  return u;
}

// ── Build URL for page N ─────────────────────────────────
function buildPageUrl(baseUrl: string, page: number, platform: Platform): string {
  if (page === 1) return baseUrl;
  const u = new URL(baseUrl);
  if (platform === 'olx') {
    u.searchParams.set('page', String(page));
  } else if (platform === 'njuskalo') {
    u.searchParams.set('page', String(page));
  }
  return u.toString();
}

// ── Fetch HTML via Hetzner Puppeteer scraper ─────────────
async function fetchViaScraper(url: string): Promise<{ html: string; finalUrl: string }> {
  if (!SCRAPER_URL || !SCRAPER_API_KEY) throw new Error('Scraper not configured');

  const response = await fetch(`${SCRAPER_URL}/render`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': SCRAPER_API_KEY,
    },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(45000),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(err.error || `Scraper HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!data.success || !data.html) throw new Error(data.error || 'Empty response from scraper');
  return { html: data.html, finalUrl: data.finalUrl || url };
}

// ── Direct fetch fallback ────────────────────────────────
async function fetchDirect(url: string): Promise<{ html: string; finalUrl: string }> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'hr,bs;q=0.9,en;q=0.8',
    },
    signal: AbortSignal.timeout(20000),
    redirect: 'follow',
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const html = await response.text();
  return { html, finalUrl: response.url || url };
}

async function fetchHtml(url: string): Promise<{ html: string; finalUrl: string }> {
  if (SCRAPER_URL && SCRAPER_API_KEY) {
    try {
      return await fetchViaScraper(url);
    } catch (err) {
      logger.warn('[scrape-profile] Scraper failed, trying direct fetch:', err instanceof Error ? err.message : err);
    }
  }
  return fetchDirect(url);
}

// ── Extract listing URLs from a profile page ─────────────
function extractListingUrls(html: string, platform: Platform, baseOrigin: string): string[] {
  const urls = new Set<string>();

  if (platform === 'olx') {
    // 1) Plain href: /oglas/SLUG/ID/
    for (const m of html.matchAll(/href=["']((?:https?:\/\/(?:www\.)?olx\.(?:ba|rs|hr))?\/oglas\/[^"'?#]+)["']/gi)) {
      const href = m[1].startsWith('http') ? m[1] : baseOrigin + m[1];
      if (/\/oglas\//i.test(href)) urls.add(href.split('?')[0].replace(/\/$/, '') + '/');
    }

    // 2) JSON/JS inline: "url":"/oglas/..." or "link":"/oglas/..."
    for (const m of html.matchAll(/"(?:url|link|href)"\s*:\s*"((?:https?:\/\/(?:www\.)?olx\.(?:ba|rs|hr))?\/oglas\/[^"?#]+)"/gi)) {
      const href = m[1].startsWith('http') ? m[1] : baseOrigin + m[1];
      urls.add(href.split('?')[0].replace(/\/$/, '') + '/');
    }

    // 3) OLX Next.js __NEXT_DATA__: extract all /oglas/ paths from JSON blob
    const nextData = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
    if (nextData) {
      for (const m of nextData[1].matchAll(/\/oglas\/[^"\\?#]{5,150}/g)) {
        const path = m[0].replace(/\/$/, '') + '/';
        urls.add(baseOrigin + path);
      }
    }

    // 4) OLX listing IDs in JSON: "id":12345678 near "slug":"some-title" → build URL
    // Pattern: {"id":ID,"slug":"SLUG"} or similar
    for (const m of html.matchAll(/"slug"\s*:\s*"([^"]{3,80})"\s*,\s*"id"\s*:\s*(\d{6,12})/gi)) {
      urls.add(`${baseOrigin}/oglas/${m[1]}-${m[2]}/`);
    }
    for (const m of html.matchAll(/"id"\s*:\s*(\d{6,12})\s*,\s*"slug"\s*:\s*"([^"]{3,80})"/gi)) {
      urls.add(`${baseOrigin}/oglas/${m[2]}-${m[1]}/`);
    }

  } else if (platform === 'njuskalo') {
    // Njuskalo listing links: /oglas/SLUG-ID.htm
    for (const m of html.matchAll(/href=["']((?:https?:\/\/(?:www\.)?njuskalo\.hr)?\/oglas\/[^"'?#]+\.htm)["']/gi)) {
      const href = m[1].startsWith('http') ? m[1] : baseOrigin + m[1];
      urls.add(href.split('?')[0]);
    }
    // JSON fallback
    for (const m of html.matchAll(/"(?:url|link|href)"\s*:\s*"((?:https?:\/\/(?:www\.)?njuskalo\.hr)?\/oglas\/[^"?#]+\.htm)"/gi)) {
      const href = m[1].startsWith('http') ? m[1] : baseOrigin + m[1];
      urls.add(href.split('?')[0]);
    }
  }

  return [...urls];
}

// ── Detect if there is a next page ──────────────────────
function hasNextPage(html: string, currentPage: number): boolean {
  // OLX: aria-label="Next" or rel="next" or page=(currentPage+1)
  const nextPageNum = currentPage + 1;
  return (
    /rel=["']next["']/i.test(html) ||
    new RegExp(`page=${nextPageNum}`, 'i').test(html) ||
    /aria-label=["'](?:Next|Sljedeća|Sledeća|Dalje)["']/i.test(html)
  );
}

// ── Extract seller name from profile HTML ────────────────
function extractSellerName(html: string, platform: Platform): string | null {
  if (platform === 'olx') {
    // OLX: <h1 class="...">USERNAME</h1> or og:title
    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    if (ogTitle) return ogTitle[1].replace(/\s*[-|].*$/, '').trim();
    const h1 = html.match(/<h1[^>]*>([^<]{2,60})<\/h1>/i);
    if (h1) return h1[1].trim();
  } else if (platform === 'njuskalo') {
    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    if (ogTitle) return ogTitle[1].replace(/\s*[-|].*$/, '').trim();
  }
  return null;
}

// ── Main handler ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  const rl = rateLimit(`admin:${getIp(req)}`, RATE_LIMITS.admin);
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Neautorizovano' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { profileUrl } = body;

  if (!profileUrl || typeof profileUrl !== 'string') {
    return NextResponse.json({ error: 'profileUrl je obavezan' }, { status: 400 });
  }

  const platform = detectPlatform(profileUrl);
  if (platform === 'unknown') {
    return NextResponse.json(
      { error: 'Nepoznata platforma — podržano: OLX (olx.ba/rs/hr) i Njuskalo (njuskalo.hr)' },
      { status: 400 }
    );
  }

  let normalizedUrl: string;
  try {
    normalizedUrl = normalizeProfileUrl(profileUrl);
  } catch {
    return NextResponse.json({ error: 'Nevažeći URL' }, { status: 400 });
  }

  if (!isProfileUrl(normalizedUrl, platform)) {
    return NextResponse.json(
      { error: platform === 'olx'
        ? 'URL mora biti OLX profil (olx.ba/profil/... ili olx.ba/shop/...)'
        : 'URL mora biti Njuskalo profil (njuskalo.hr/korisnik/...)' },
      { status: 400 }
    );
  }

  const baseOrigin = new URL(normalizedUrl).origin;
  const allListingUrls: string[] = [];
  let sellerName: string | null = null;
  let pagesScraped = 0;

  logger.info(`[scrape-profile] Starting — ${platform} — ${normalizedUrl}`);

  for (let page = 1; page <= MAX_PAGES; page++) {
    const pageUrl = buildPageUrl(normalizedUrl, page, platform);

    let html: string;
    try {
      const result = await fetchHtml(pageUrl);
      html = result.html;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn(`[scrape-profile] Failed to fetch page ${page}:`, msg);
      // If first page fails, return error. Otherwise stop pagination gracefully.
      if (page === 1) {
        return NextResponse.json(
          { error: `Nije moguće dohvatiti profil stranicu: ${msg}` },
          { status: 400 }
        );
      }
      break;
    }

    pagesScraped++;

    if (page === 1) {
      sellerName = extractSellerName(html, platform);
    }

    const pageUrls = extractListingUrls(html, platform, baseOrigin);
    for (const u of pageUrls) {
      if (!allListingUrls.includes(u)) allListingUrls.push(u);
    }

    logger.info(`[scrape-profile] Page ${page}: HTML length=${html.length}, oglas mentions=${(html.match(/\/oglas\//g) || []).length}, found ${pageUrls.length} listings (total: ${allListingUrls.length})`);
    if (page === 1 && pageUrls.length === 0) {
      // Log a snippet to diagnose
      logger.info(`[scrape-profile] HTML snippet (2000 chars): ${html.slice(0, 2000)}`);
    }

    if (allListingUrls.length >= MAX_LISTINGS) {
      logger.warn(`[scrape-profile] Hit MAX_LISTINGS cap (${MAX_LISTINGS}), stopping`);
      break;
    }

    if (!hasNextPage(html, page)) break;

    // Small delay between pages to avoid rate limiting
    await new Promise(r => setTimeout(r, 800));
  }

  if (allListingUrls.length === 0) {
    return NextResponse.json(
      { error: 'Nisu pronađeni oglasi na ovom profilu. Profil je možda prazan ili privatan.' },
      { status: 400 }
    );
  }

  logger.info(`[scrape-profile] Done — ${allListingUrls.length} listings across ${pagesScraped} pages`);

  return NextResponse.json({
    success: true,
    platform,
    profileUrl: normalizedUrl,
    sellerName,
    pagesScraped,
    listingCount: allListingUrls.length,
    listingUrls: allListingUrls,
  });
}
