/**
 * GET /api/admin/bulk-import/claim-info?token=xxx
 *
 * Public endpoint — returns minimal info about a pending claim so the
 * /claim/[token] page can show the seller name and listing count.
 * Does NOT expose imported data or internal IDs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, rateLimitResponse, getIp, RATE_LIMITS } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const rl = rateLimit(`auth:${getIp(req)}`, RATE_LIMITS.auth);
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ success: false, error: 'Token je obavezan' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: claim } = await supabase
    .from('pending_claims')
    .select('status, seller_name, platform, imported_data, expires_at')
    .eq('token', token)
    .maybeSingle();

  if (!claim) {
    return NextResponse.json({ success: false, error: 'Link je nevažeći ili je istekao.' }, { status: 404 });
  }
  if (claim.status === 'claimed') {
    return NextResponse.json({ success: false, error: 'Ovaj link je već iskorišten.' }, { status: 409 });
  }
  if (claim.status === 'expired' || new Date(claim.expires_at) < new Date()) {
    return NextResponse.json({ success: false, error: 'Link je istekao.' }, { status: 410 });
  }
  if (claim.status === 'processing') {
    return NextResponse.json({ success: false, error: 'Profil se još obrađuje. Pokušaj za koji minut.' }, { status: 202 });
  }
  if (claim.status !== 'ready') {
    return NextResponse.json({ success: false, error: 'Link nije važeći.' }, { status: 400 });
  }

  const listingCount = Array.isArray(claim.imported_data) ? claim.imported_data.length : 0;

  return NextResponse.json({
    success: true,
    sellerName: claim.seller_name,
    platform: claim.platform,
    listingCount,
  });
}
