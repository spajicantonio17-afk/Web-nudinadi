'use client';

// ── Onboarding gate ─────────────────────────────────────────
// Renders nothing. Redirects signed-in users who never picked their own
// username to /postavi-profil. Mounted globally in Providers.tsx.
//
// Not middleware on purpose: that runs on nearly every request, would cost
// a Supabase query per navigation, and has no admin client on the Edge
// runtime. The flag already rides along on the profile we fetch anyway.

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export const ONBOARDING_ROUTE = '/postavi-profil';

// Never interrupt the auth flow itself, the step, or the legal pages a
// user might open from it.
const EXEMPT_PREFIXES = [
  ONBOARDING_ROUTE,
  '/login',
  '/register',
  '/auth',
  '/onboarding', // signed-out marketing splash
  '/uvjeti',
  '/privatnost',
  '/api',
];

export default function OnboardingGate() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (isLoading) return;                  // auth not resolved yet
    if (!user) {
      redirectedRef.current = false;        // re-arm for the next account
      return;
    }
    // Strict !== false: `undefined` means the profile fetch timed out, and
    // we must fail open rather than trap an existing user in onboarding.
    if (user.usernameChosen !== false) return;
    if (EXEMPT_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))) return;
    if (redirectedRef.current) return;      // one push per session state

    redirectedRef.current = true;
    router.replace(ONBOARDING_ROUTE);
  }, [user, isLoading, pathname, router]);

  return null;
}
