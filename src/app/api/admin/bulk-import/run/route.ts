import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { rateLimit, rateLimitResponse, getIp, RATE_LIMITS } from '@/lib/rate-limit';
import { importSingleListing, type ImportedListing } from '@/lib/import-listing';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { randomUUID } from 'crypto';

const DELAY_BETWEEN_LISTINGS_MS = 600; // avoid hammering scrapers/Gemini
const MAX_LISTINGS_PER_RUN = 10;       // hard cap per request — the client batches in 5s
const CLAIM_TTL_DAYS = 30;

// Vercel Hobby maximum. A full batch is ~5 listings x ~6s worst case.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const rl = rateLimit(`admin:${getIp(req)}`, RATE_LIMITS.admin);
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Neautorizovano' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { profileUrl, sellerName, platform, listingUrls, claimId: existingClaimId, isFinalBatch } = body;

  if (!profileUrl || typeof profileUrl !== 'string') {
    return NextResponse.json({ error: 'profileUrl je obavezan' }, { status: 400 });
  }
  // An empty list is only valid as a "close out this claim" call on an
  // existing run — used when the last batch failed and the record would
  // otherwise be stuck on 'processing'.
  const isFinalizeOnly = Array.isArray(listingUrls) && listingUrls.length === 0 && !!existingClaimId && !!isFinalBatch;

  if (!Array.isArray(listingUrls) || (listingUrls.length === 0 && !isFinalizeOnly)) {
    return NextResponse.json({ error: 'listingUrls je obavezan i ne smije biti prazan' }, { status: 400 });
  }
  // Never silently truncate — the client is responsible for batching.
  if (listingUrls.length > MAX_LISTINGS_PER_RUN) {
    return NextResponse.json(
      { error: `Maksimalno ${MAX_LISTINGS_PER_RUN} linkova po zahtjevu.` },
      { status: 400 }
    );
  }

  const urlsToProcess: string[] = listingUrls;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // ── Resolve claim: create on first batch, reuse on follow-ups ──
  let claimId: string;
  let token: string;
  let priorImported: ImportedListing[] = [];
  let priorUrls: string[] = [];

  if (existingClaimId) {
    const { data: existing, error: loadError } = await supabase
      .from('pending_claims')
      .select('id, token, imported_data, listing_urls, created_by')
      .eq('id', existingClaimId)
      .single();

    if (loadError || !existing) {
      logger.error('[bulk-import/run] Claim not found:', existingClaimId, loadError);
      return NextResponse.json({ error: 'Zapis nije pronađen' }, { status: 404 });
    }
    // An admin may only extend their own import run.
    if (existing.created_by !== admin.id) {
      return NextResponse.json({ error: 'Neautorizovano' }, { status: 403 });
    }

    claimId = existing.id;
    token = existing.token;
    priorImported = Array.isArray(existing.imported_data) ? existing.imported_data as ImportedListing[] : [];
    priorUrls = Array.isArray(existing.listing_urls) ? existing.listing_urls as string[] : [];
  } else {
    token = randomUUID().replace(/-/g, '');
    const expiresAt = new Date(Date.now() + CLAIM_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

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
    claimId = claim.id;
    priorUrls = urlsToProcess;
  }

  logger.info(`[bulk-import/run] Claim ${claimId} — processing ${urlsToProcess.length} listings (final=${!!isFinalBatch})`);

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

  // ── Update claim with accumulated results ──────────────
  // Read-modify-write is safe here: batches run strictly sequentially.
  const allImported = [...priorImported, ...imported];
  const allUrls = existingClaimId ? [...priorUrls, ...urlsToProcess] : priorUrls;

  // Stay 'processing' until the client marks the last batch.
  const newStatus = !isFinalBatch
    ? 'processing'
    : allImported.length > 0 ? 'ready' : 'failed';

  const { error: updateError } = await supabase
    .from('pending_claims')
    .update({
      imported_data: allImported,
      listing_urls: allUrls,
      status: newStatus,
    })
    .eq('id', claimId);

  if (updateError) {
    logger.error(`[bulk-import/run] Failed to update claim ${claimId}:`, updateError);
    return NextResponse.json({ error: 'Import završen ali nije moguće sačuvati rezultate' }, { status: 500 });
  }

  // Only a fully empty import fails the run — a single bad batch must not abort it.
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

  logger.info(`[bulk-import/run] Batch done — ${imported.length} imported, ${failed.length} failed (total: ${allImported.length}) — token: ${token}`);

  return NextResponse.json({
    success: true,
    claimId,
    token,
    claimUrl,
    importedCount: imported.length,
    failedCount: failed.length,
    totalImported: allImported.length,
    failed: failed.length > 0 ? failed : undefined,
  });
}
