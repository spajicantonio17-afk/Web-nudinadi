'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAdmin(redirectTo = '/') {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const isAdmin = user?.isAdmin ?? false;

  useEffect(() => {
    if (isLoading) return;
    // Not logged in at all → redirect
    if (!isAuthenticated) { router.replace(redirectTo); return; }
    // Logged in but profile loaded and not admin → redirect
    if (isAuthenticated && user && !isAdmin) { router.replace(redirectTo); return; }
    // isAuthenticated but user is null means profile is still loading → wait
  }, [isLoading, isAuthenticated, isAdmin, user, router, redirectTo]);

  return { user, isAdmin, isLoading: isLoading || (isAuthenticated && !user) };
}
