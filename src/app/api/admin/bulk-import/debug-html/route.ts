import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Neautorizovano' }, { status: 403 });

  const { url } = await req.json();

  const SCRAPER_URL = process.env.SCRAPER_URL;
  const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

  const res = await fetch(`${SCRAPER_URL}/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': SCRAPER_API_KEY! },
    body: JSON.stringify({ url, waitFor: 3000, scrollToBottom: true, waitUntil: 'networkidle0' }),
    signal: AbortSignal.timeout(45000),
  });

  const data = await res.json();
  const html: string = data.html || '';

  // All unique href paths (first 40)
  const allHrefs = [...new Set([...html.matchAll(/href=["']([^"']{5,200})["']/gi)].map(m => m[1]))].slice(0, 40);
  // API calls in JS
  const apiCalls = [...new Set([...html.matchAll(/["'](https?:\/\/[^"']*api[^"']{5,200})["']/gi)].map(m => m[1]))].slice(0, 20);
  // User ID patterns
  const userIds = [...html.matchAll(/"(?:user_id|userId|advertiser_id|seller_id|owner_id)"\s*:\s*["']?(\d+)["']?/gi)].map(m => ({ key: m[1] })).slice(0, 10);
  // Any numeric IDs that look like user IDs near "user" keyword
  const userPatterns = html.match(/"user"\s*:\s*\{[^}]{0,200}\}/gi)?.slice(0, 3) || [];
  // shop/profil slug
  const shopSlug = html.match(/["'](?:shop_slug|username|sellerSlug|profileSlug)["']\s*:\s*["']([^"']{2,60})["']/i)?.[1] || null;

  return NextResponse.json({
    htmlLength: html.length,
    oglasMentions: (html.match(/\/oglas\//g) || []).length,
    allHrefs,
    apiCalls,
    userIds,
    userPatterns,
    shopSlug,
    snippet: html.slice(0, 5000),
  });
}
