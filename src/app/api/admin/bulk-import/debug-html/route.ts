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
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(45000),
  });

  const data = await res.json();
  const html: string = data.html || '';

  // Extract all href patterns containing /oglas/
  const oglasHrefs = [...html.matchAll(/href=["']([^"']*\/oglas\/[^"']+)["']/gi)].map(m => m[1]).slice(0, 20);
  const oglasJson = [...html.matchAll(/"(?:url|link|href)"\s*:\s*"([^"]*\/oglas\/[^"]+)"/gi)].map(m => m[1]).slice(0, 20);
  const nextData = html.match(/"\/oglas\/[^"]{5,100}"/g)?.slice(0, 20) || [];

  return NextResponse.json({
    htmlLength: html.length,
    oglasMentions: (html.match(/\/oglas\//g) || []).length,
    oglasHrefs,
    oglasJson,
    nextDataMatches: nextData,
    snippet: html.slice(0, 3000),
  });
}
