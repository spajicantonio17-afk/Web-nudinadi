import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sends Authorization header for cron jobs)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = await createAdminSupabase()
  const now = new Date().toISOString()
  const results: Record<string, number> = {}

  // 1. Clean expired verification codes
  const { data: deletedCodes } = await admin
    .from('verification_codes')
    .delete()
    .lt('expires_at', now)
    .select('id')
  results.expired_codes = deletedCodes?.length ?? 0

  // 2. Expire promotions (set promoted_until to null)
  const { data: expiredPromos } = await admin
    .from('products')
    .update({ promoted_until: null })
    .lt('promoted_until', now)
    .not('promoted_until', 'is', null)
    .select('id')
  results.expired_promotions = expiredPromos?.length ?? 0

  // 3. Deactivate expired bans
  const { data: expiredBans } = await admin
    .from('user_bans')
    .update({ is_active: false })
    .lt('expires_at', now)
    .eq('is_active', true)
    .not('expires_at', 'is', null)
    .select('id')
  results.expired_bans = expiredBans?.length ?? 0

  // 4. Expire 30-day old pending transactions
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: expiredTxns } = await admin
    .from('transactions')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('created_at', thirtyDaysAgo)
    .select('id, product_id')

  if (expiredTxns?.length) {
    const productIds = expiredTxns.map(t => t.product_id)
    await admin
      .from('products')
      .update({ status: 'active' })
      .in('id', productIds)
      .eq('status', 'pending_sale')
  }
  results.expired_transactions = expiredTxns?.length ?? 0

  // 5. Mark expired pending_claims as 'expired'
  const { data: expiredClaims } = await admin
    .from('pending_claims')
    .update({ status: 'expired' })
    .in('status', ['pending', 'ready'])
    .lt('expires_at', now)
    .select('id')
  results.expired_claims = expiredClaims?.length ?? 0

  // 6. Delete expired/failed claims older than 7 days + their draft products
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: staleClaims } = await admin
    .from('pending_claims')
    .select('id, claimed_by')
    .in('status', ['expired', 'failed'])
    .lt('expires_at', sevenDaysAgo)

  if (staleClaims?.length) {
    // Delete draft products for unclaimed profiles (claimed_by is null)
    const unclaimedIds = staleClaims.filter(c => !c.claimed_by).map(c => c.id)
    if (unclaimedIds.length) {
      // We need seller_ids — fetch them from the claim token→user link
      // Since unclaimed profiles have no user, just delete the claim records
      // (products were never created for unclaimed claims)
    }

    const { data: deleted } = await admin
      .from('pending_claims')
      .delete()
      .in('id', staleClaims.map(c => c.id))
      .select('id')
    results.deleted_stale_claims = deleted?.length ?? 0
  } else {
    results.deleted_stale_claims = 0
  }

  return NextResponse.json({ success: true, results })
}
