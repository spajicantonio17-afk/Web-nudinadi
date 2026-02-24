import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Neautorizovano' }, { status: 403 });

  const body = await req.json();
  const { report_id, action_type, target_user_id, target_product_id, reason, metadata } = body;

  if (!action_type) {
    return NextResponse.json({ error: 'action_type je obavezan' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('moderation_actions')
    .insert({
      report_id: report_id || null,
      admin_id: admin.id,
      action_type,
      target_user_id: target_user_id || null,
      target_product_id: target_product_id || null,
      reason: reason || null,
      metadata: metadata || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
