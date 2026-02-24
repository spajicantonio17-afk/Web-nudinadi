import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Neautorizovano' }, { status: 403 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

  const [pending, total, resolved, bans, aiFlags] = await Promise.all([
    supabase.from('moderation_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('moderation_reports').select('*', { count: 'exact', head: true }),
    supabase.from('moderation_reports').select('*', { count: 'exact', head: true }).gte('resolved_at', todayStart),
    supabase.from('user_bans').select('id').eq('is_active', true),
    supabase.from('ai_moderation_logs').select('id').eq('is_flagged', true).gte('created_at', todayStart),
  ]);

  return NextResponse.json({
    pendingReports: pending.count ?? 0,
    resolvedToday: resolved.count ?? 0,
    activeBans: bans.data?.length ?? 0,
    aiFlagsToday: aiFlags.data?.length ?? 0,
    totalReports: total.count ?? 0,
  });
}
