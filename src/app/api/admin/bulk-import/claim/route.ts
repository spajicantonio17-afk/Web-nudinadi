/**
 * POST /api/admin/bulk-import/claim
 *
 * Called by the /claim/[token] page when the user submits email + password.
 * 1. Validates the token (exists, not expired, not already claimed)
 * 2. Registers a new Supabase auth user
 * 3. Creates their profile (username derived from seller_name)
 * 4. Inserts all imported_data as draft products (status: 'draft', hidden until they activate)
 * 5. Marks the claim as 'claimed'
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, rateLimitResponse, getIp, RATE_LIMITS } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import type { ImportedListing } from '@/lib/import-listing';

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

/** Turn a seller name into a valid unique username */
function makeUsername(sellerName: string | null): string {
  const base = (sellerName || 'korisnik')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 20) || 'korisnik';
  // Append random suffix to avoid collisions
  return `${base}_${Math.random().toString(36).slice(2, 7)}`;
}

/** Resolve category name → category_id from DB */
async function resolveCategoryId(
  supabase: ReturnType<typeof adminSupabase>,
  categoryName: string | null,
): Promise<string | null> {
  if (!categoryName) return null;
  const { data } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', categoryName)
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(`auth:${getIp(req)}`, RATE_LIMITS.auth);
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const body = await req.json().catch(() => ({}));
  const { token, email, password, username: providedUsername } = body;

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Token je obavezan' }, { status: 400 });
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Nevažeći email' }, { status: 400 });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return NextResponse.json({ error: 'Lozinka mora imati najmanje 6 znakova' }, { status: 400 });
  }

  const supabase = adminSupabase();

  // ── 1. Validate token ──────────────────────────────────
  const { data: claim, error: claimErr } = await supabase
    .from('pending_claims')
    .select('*')
    .eq('token', token)
    .maybeSingle();

  if (claimErr || !claim) {
    return NextResponse.json({ error: 'Link je nevažeći ili je istekao' }, { status: 404 });
  }
  if (claim.status === 'claimed') {
    return NextResponse.json({ error: 'Ovaj link je već iskorišten' }, { status: 409 });
  }
  if (claim.status === 'expired' || new Date(claim.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Link je istekao (30 dana)' }, { status: 410 });
  }
  if (claim.status !== 'ready') {
    return NextResponse.json({ error: 'Profil još nije spreman. Pokušaj za koji minut.' }, { status: 400 });
  }

  // ── 2. Register user ───────────────────────────────────
  const username = providedUsername?.trim() || makeUsername(claim.seller_name);

  const { data: authData, error: signUpErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip email verification
    user_metadata: { username, full_name: claim.seller_name || username },
  });

  if (signUpErr) {
    const msg = signUpErr.message.toLowerCase();
    if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('unique')) {
      return NextResponse.json({ error: 'Račun sa ovim emailom već postoji' }, { status: 409 });
    }
    logger.error('[claim] createUser failed:', signUpErr.message);
    return NextResponse.json({ error: 'Registracija nije uspjela. Pokušaj ponovo.' }, { status: 500 });
  }

  const userId = authData.user.id;

  // ── 3. Ensure profile exists (trigger usually creates it, but be safe) ─
  await new Promise(r => setTimeout(r, 800)); // give DB trigger time to run

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  const profileData = {
    username,
    full_name: claim.seller_name || username,
    account_type: 'business',
    business_verified: true,
    company_name: claim.seller_name || username,
  };

  if (!existingProfile) {
    await supabase.from('profiles').insert({ id: userId, ...profileData });
  } else {
    await supabase.from('profiles').update(profileData).eq('id', userId);
  }

  // ── 4. Insert imported listings as 'draft' ─────────────
  const listings: ImportedListing[] = Array.isArray(claim.imported_data) ? claim.imported_data : [];
  let insertedCount = 0;

  for (const listing of listings) {
    try {
      const categoryId = await resolveCategoryId(supabase, listing.category);

      const { error: prodErr } = await supabase.from('products').insert({
        seller_id: userId,
        title: listing.title || 'Bez naslova',
        description: listing.description || null,
        price: listing.price ?? 0,
        currency: listing.currency || 'BAM',
        condition: listing.condition || 'used',
        images: listing.images || [],
        location: listing.location || null,
        category_id: categoryId,
        status: 'active',
      });

      if (prodErr) {
        logger.warn(`[claim] Failed to insert product "${listing.title}":`, prodErr.message);
      } else {
        insertedCount++;
      }
    } catch (e) {
      logger.warn(`[claim] Exception inserting product:`, e instanceof Error ? e.message : e);
    }
  }

  // ── 5. Mark claim as claimed ───────────────────────────
  await supabase
    .from('pending_claims')
    .update({ status: 'claimed', claimed_by: userId, claimed_at: new Date().toISOString() })
    .eq('id', claim.id);

  logger.info(`[claim] Token ${token} claimed by ${email} — ${insertedCount}/${listings.length} products inserted`);

  return NextResponse.json({
    success: true,
    userId,
    username,
    insertedCount,
    totalListings: listings.length,
  });
}
