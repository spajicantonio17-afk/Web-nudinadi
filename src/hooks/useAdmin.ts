'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';

export function useAdmin(redirectTo = '/') {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      setChecking(false);
      router.replace(redirectTo);
      return;
    }

    // Verify admin server-side (bypasses RLS, uses service role)
    async function check() {
      setChecking(true);
      try {
        const supabase = getSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          router.replace(redirectTo);
          return;
        }
        const res = await fetch('/api/admin/verify', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          setIsAdmin(true);
        } else {
          router.replace(redirectTo);
        }
      } catch {
        router.replace(redirectTo);
      } finally {
        setChecking(false);
      }
    }

    check();
  }, [isLoading, isAuthenticated, router, redirectTo]);

  return { user, isAdmin, isLoading: isLoading || checking };
}
