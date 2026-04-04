import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server';
import { ISTAKNUTI_OPTIONS } from '@/lib/plans';
import { rateLimit, rateLimitResponse, getIp, RATE_LIMITS } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const rl = rateLimit(`spend-credits:${getIp(req)}`, RATE_LIMITS.profile_update);
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Nisi prijavljen.' }, { status: 401 });
    }

    const body = await req.json() as {
      action: 'extra_photos' | 'istaknuti';
      productId: string;
      quantity?: number;       // for extra_photos: how many to unlock
      optionId?: string;       // for istaknuti: which ISTAKNUTI_OPTIONS id
    };

    const { action, productId, quantity, optionId } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Nedostaje productId.' }, { status: 400 });
    }

    const admin = await createAdminSupabase();

    // Verify product belongs to user
    const { data: product } = await admin
      .from('products')
      .select('id, seller_id, extra_images_unlocked, promoted_until')
      .eq('id', productId)
      .single();

    if (!product || product.seller_id !== user.id) {
      return NextResponse.json({ error: 'Oglas nije pronađen.' }, { status: 404 });
    }

    if (action === 'extra_photos') {
      const qty = Math.max(1, Math.min(quantity || 1, 20));

      // Spend credits
      const { error: spendErr } = await admin.rpc('spend_credits', {
        p_user_id: user.id,
        p_amount: qty,
        p_type: 'extra_photos',
        p_reference: productId,
        p_desc: `+${qty} extra slik(e) za oglas`,
      });

      if (spendErr) {
        logger.error('[credits/spend extra_photos]', spendErr);
        if (spendErr.message?.includes('non_negative')) {
          return NextResponse.json({ error: 'Nedovoljno kredita.' }, { status: 402 });
        }
        throw spendErr;
      }

      // Unlock extra image slots on product
      const { error: productErr } = await admin
        .from('products')
        .update({ extra_images_unlocked: product.extra_images_unlocked + qty })
        .eq('id', productId);

      if (productErr) throw productErr;

      return NextResponse.json({ success: true, unlockedTotal: product.extra_images_unlocked + qty });
    }

    if (action === 'istaknuti') {
      const option = ISTAKNUTI_OPTIONS.find(o => o.id === optionId);
      if (!option) {
        return NextResponse.json({ error: 'Nevažeća opcija.' }, { status: 400 });
      }

      // Spend credits
      const { error: spendErr } = await admin.rpc('spend_credits', {
        p_user_id: user.id,
        p_amount: option.credits,
        p_type: 'istaknuti',
        p_reference: productId,
        p_desc: `Istaknuti oglas — ${option.desc}`,
      });

      if (spendErr) {
        logger.error('[credits/spend istaknuti]', spendErr);
        if (spendErr.message?.includes('non_negative')) {
          return NextResponse.json({ error: 'Nedovoljno kredita.' }, { status: 402 });
        }
        throw spendErr;
      }

      // Set/extend promoted_until
      const currentUntil = product.promoted_until ? new Date(product.promoted_until) : new Date();
      const base = currentUntil > new Date() ? currentUntil : new Date();
      base.setDate(base.getDate() + option.days);

      const { error: productErr } = await admin
        .from('products')
        .update({ promoted_until: base.toISOString() })
        .eq('id', productId);

      if (productErr) throw productErr;

      return NextResponse.json({ success: true, promotedUntil: base.toISOString() });
    }

    return NextResponse.json({ error: 'Nevažeća akcija.' }, { status: 400 });
  } catch (err) {
    logger.error('[credits/spend]', err);
    return NextResponse.json({ error: 'Greška na serveru.' }, { status: 500 });
  }
}
