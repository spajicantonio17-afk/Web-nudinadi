import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

/**
 * Server-side admin verification for API routes.
 * Returns the user object if admin, null otherwise.
 */
export async function verifyAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[admin-auth] Missing SUPABASE_URL or SERVICE_ROLE_KEY');
    return null;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) return null;

  return user;
}
