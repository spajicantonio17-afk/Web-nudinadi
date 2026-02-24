'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAdmin(redirectTo = '/') {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const isAdmin = user?.isAdmin ?? false;

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, isAdmin, router, redirectTo]);

  return { user, isAdmin, isLoading };
}
