-- 022: Business Profile Fixes
-- RPC function to look up user ID by email (SECURITY DEFINER — auth.users is not client-readable)

CREATE OR REPLACE FUNCTION get_user_id_by_email(p_email TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id FROM auth.users WHERE email = p_email LIMIT 1;
$$;
