import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { rateLimit, rateLimitResponse, getIp, RATE_LIMITS } from '@/lib/rate-limit';
import { importSingleListing, type ImportedListing } from '@/lib/import-listing';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { randomUUID } from 'crypto';

const DELAY_BETWEEN_LISTINGS_MS = 600; // avoid hammering scrapers/Gemini
const MAX_LISTINGS_PER_RUN = 50;       // safety cap per run
const CLAIM_TTL_DAYS = 30;

export async function POST(req: NextRequest) {
  const rl = rateLimit(`admin:${getIp(req)}`, RATE_LIMITS.admin);
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Neautorizovano' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { profileUrl, sellerName, platform, listingUrls } = body;

  if (!profileUrl || typeof profileUrl !== 'string') {
    return NextResponse.json({ error: 'profileUrl je obavezan' }, { status: 400 });
  }
  if (!Array.isArray(listingUrls) || listingUrls.length === 0) {
    return NextResponse.json({ error: 'listingUrls je obavezan i ne smije biti prazan' }, { status: 400 });
  }

  const urlsToProcess: string[] = listingUrls.slice(0, MAX_LISTINGS_PER_RUN);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Generate claim token
  const token = randomUUID().replace(/-/g, '');
  const expiresAt = new Date(Date.now() + CLAIM_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Insert pending_claim record immediately (status: processing)
  const { data: claim, error: insertError } = await supabase
    .from('pending_claims')
    .insert({
      token,
      platform: platform ?? 'unknown',
      profile_url: profileUrl,
      seller_name: sellerName ?? null,
      listing_urls: urlsToProcess,
      imported_data: [],
      status: 'processing',
      created_by: admin.id,
      expires_at: expiresAt,
    })
    .select('id')
    .single();

  if (insertError || !claim) {
    logger.error('[bulk-import/run] Failed to create pending_claim:', insertError);
    return NextResponse.json({ error: 'Greška pri kreiranju zapisa' }, { status: 500 });
  }

  const claimId = claim.id;
  logger.info(`[bulk-import/run] Created claim ${claimId} — processing ${urlsToProcess.length} listings`);

  // ── Process listings sequentially ─────────────────────
  const imported: ImportedListing[] = [];
  const failed: { url: string; reason: string }[] = [];

  for (let i = 0; i < urlsToProcess.length; i++) {
    const url = urlsToProcess[i];
    try {
      const listing = await importSingleListing(url);
      imported.push(listing);
      logger.info(`[bulk-import/run] [${i + 1}/${urlsToProcess.length}] OK — ${listing.title}`);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      failed.push({ url, reason });
      logger.warn(`[bulk-import/run] [${i + 1}/${urlsToProcess.length}] FAILED — ${url} — ${reason}`);
    }

    // Delay between requests (skip after last)
    if (i < urlsToProcess.length - 1) {
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_LISTINGS_MS));
    }
  }

  // ── Update claim with results ──────────────────────────
  const newStatus = imported.length > 0 ? 'ready' : 'failed';

  const { error: updateError } = await supabase
    .from('pending_claims')
    .update({
      imported_data: imported,
      status: newStatus,
    })
    .eq('id', claimId);

  if (updateError) {
    logger.error(`[bulk-import/run] Failed to update claim ${claimId}:`, updateError);
    return NextResponse.json({ error: 'Import završen ali nije moguće sačuvati rezultate' }, { status: 500 });
  }

  if (newStatus === 'failed') {
    return NextResponse.json(
      { error: 'Svi oglasi su završili s greškom. Nijedan nije uvezen.', failed },
      { status: 400 }
    );
  }

  // Build claim URL (host from request headers)
  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = host.startsWith('localhost') ? 'http' : 'https';
  const claimUrl = `${protocol}://${host}/claim/${token}`;

  logger.info(`[bulk-import/run] Done — ${imported.length} imported, ${failed.length} failed — token: ${token}`);

  return NextResponse.json({
    success: true,
    token,
    claimUrl,
    importedCount: imported.length,
    failedCount: failed.length,
    failed: failed.length > 0 ? failed : undefined,
  });
}
