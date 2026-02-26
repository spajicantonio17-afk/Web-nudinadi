// ── Auth System (Supabase) ──────────────────────────────────
// Real auth with Supabase - same useAuth() interface as before

'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import React from 'react';
import { getSupabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/lib/database.types';
import { logDailyLogin } from '@/services/levelService';

// Translate Supabase auth error messages to Bosnian
function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('user already registered') || m.includes('already been registered'))
    return 'Račun sa ovim emailom već postoji. Prijavi se ili resetuj lozinku.';
  if (m.includes('invalid login credentials'))
    return 'Pogrešan email ili lozinka.';
  if (m.includes('email not confirmed'))
    return 'Email nije potvrđen. Provjeri inbox za link za potvrdu.';
  if (m.includes('password') && m.includes('at least'))
    return 'Lozinka mora imati najmanje 6 znakova.';
  if (m.includes('rate limit') || m.includes('too many requests'))
    return 'Previše pokušaja. Sačekajte malo pa pokušajte ponovo.';
  if (m.includes('network') || m.includes('fetch'))
    return 'Greška u vezi. Provjerite internet konekciju.';
  if (m.includes('invalid email'))
    return 'Neispravan email format.';
  return message;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  bio?: string | null;
  phone?: string | null;
  emailVerified: boolean;
  location?: string;
  level: number;
  xp: number;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  isAdmin: boolean;
  createdAt?: string;
  totalSales?: number;
  totalPurchases?: number;
}

export type RegisterResult = 'success' | 'needs_confirmation' | 'error';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  lastError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string, phone?: string) => Promise<RegisterResult>;
  loginWithOAuth: (provider: 'google' | 'facebook') => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  resendVerificationEmail: () => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

// Convert Supabase user + profile to our AuthUser format
function toAuthUser(user: User, profile?: Profile | null): AuthUser {
  return {
    id: user.id,
    email: user.email || '',
    username: profile?.username || user.user_metadata?.username || user.email?.split('@')[0] || '',
    fullName: profile?.full_name || user.user_metadata?.full_name || '',
    avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || '',
    bio: profile?.bio ?? null,
    phone: profile?.phone ?? null,
    emailVerified: profile?.email_verified || false,
    location: profile?.location || undefined,
    level: profile?.level || 1,
    xp: profile?.xp || 0,
    instagramUrl: profile?.instagram_url ?? null,
    facebookUrl: profile?.facebook_url ?? null,
    isAdmin: profile?.is_admin || false,
    createdAt: profile?.created_at || user.created_at,
    totalSales: profile?.total_sales || 0,
    totalPurchases: profile?.total_purchases || 0,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);

  const supabase = getSupabase();

  // Fetch profile data for a user
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return data as Profile | null;
  }, [supabase]);

  // Set user from Supabase session — resilient: always resolves even on profile fetch error
  const setUserFromSession = useCallback(async (session: Session | null, isInitial = false) => {
    if (!session?.user) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    // Only show loading on initial session check — not on token refresh,
    // which would cause the whole page to flash a spinner
    if (isInitial) {
      setIsLoading(true);
    }
    try {
      // Timeout after 8s — prevents hanging if DB is slow or RLS blocks the query
      const profile = await Promise.race([
        fetchProfile(session.user.id),
        new Promise<null>(resolve => setTimeout(() => resolve(null), 8000)),
      ]);
      setUser(toAuthUser(session.user, profile));
    } catch {
      // Profile fetch failed — still set user with basic session data
      setUser(toAuthUser(session.user, null));
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  // Initialize: check current session + listen for subsequent auth changes
  useEffect(() => {
    // Primary init: explicit session check (reliable across localStorage and cookie storage)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await setUserFromSession(session, true);
    }).catch(() => {
      // Session restore failed (corrupt cookie, network error, etc.)
      // Clear loading state so the app doesn't hang forever
      setUser(null);
      setIsLoading(false);
    });

    // Listen for auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED)
    // Skip INITIAL_SESSION — handled by getSession() above to avoid race condition
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') return;
        await setUserFromSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, setUserFromSession]);

  // ─── Login with Email/Password ────────────────────────

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLastError(null);
    // Timeout after 15s — prevents hanging if Supabase auth API is unreachable
    const { data, error } = await Promise.race([
      supabase.auth.signInWithPassword({ email, password }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Veza je istekla. Provjerite internet vezu i pokušajte ponovo.')), 15000)
      ),
    ]);

    if (error) {
      setLastError(translateAuthError(error.message));
      return false;
    }

    if (data.session) {
      await setUserFromSession(data.session);
      // Award daily login XP (5 XP, once per day)
      if (data.session.user?.id) {
        logDailyLogin(data.session.user.id).catch(() => {/* non-critical */});
      }
      return true;
    }

    return false;
  }, [supabase, setUserFromSession]);

  // ─── Register ─────────────────────────────────────────

  const register = useCallback(async (email: string, password: string, username: string, phone?: string): Promise<RegisterResult> => {
  setLastError(null);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: '',
        phone: phone || null,
      },
    },
  });

  if (error) {
    console.error('[register] signUp error:', error.message, error);
    const msg = translateAuthError(error.message);
    setLastError(msg);
    return 'error';
  }

  // Duplicate email detection: Supabase returns a user with empty identities
  // instead of an error (security measure to prevent email enumeration)
  if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
    console.warn('[register] Duplicate email detected — user has no identities');
    setLastError('Račun sa ovim emailom već postoji. Prijavi se ili resetuj lozinku.');
    return 'error';
  }

  // Case 1: Session received directly (autoconfirm enabled in Supabase dashboard)
  if (data.session) {
    await setUserFromSession(data.session);
    if (data.session.user?.id) {
      logDailyLogin(data.session.user.id).catch(() => {});
    }
    return 'success';
  }

  // Case 2: User created but no session → auto-confirm server-side + login
  if (data.user) {
    let autoConfirmOk = false;
    try {
      console.log('[register] Calling auto-confirm for user:', data.user.id);
      const res = await fetch('/api/auth/auto-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id }),
      });
      console.log('[register] Auto-confirm response status:', res.status);
      if (res.ok) {
        const json = await res.json();
        autoConfirmOk = !!json.success;
        console.log('[register] Auto-confirm result:', json);
      } else {
        const errorBody = await res.text();
        console.error('[register] Auto-confirm failed:', res.status, errorBody);
      }
    } catch (err) {
      console.error('[register] Auto-confirm network error:', err);
    }

    if (autoConfirmOk) {
      // Wait for Supabase to propagate the confirmation
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Attempt login (works if auto-confirm succeeded or autoconfirm is on)
    console.log('[register] Attempting login after auto-confirm...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!loginError && loginData.session) {
      console.log('[register] Login successful after auto-confirm');
      await setUserFromSession(loginData.session);
      return 'success';
    }

    if (loginError) {
      console.error('[register] Login attempt 1 failed:', loginError.message);
    }

    // If auto-confirm reported success but login failed, retry with longer delay
    if (autoConfirmOk && loginError) {
      console.log('[register] Retrying login after 2s delay...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!retryError && retryData.session) {
        console.log('[register] Login successful on retry');
        await setUserFromSession(retryData.session);
        return 'success';
      }
      if (retryError) {
        console.error('[register] Login attempt 2 failed:', retryError.message);
      }
    }

    // Login failed — email confirmation required
    // Newer Supabase versions return "Invalid login credentials" instead of
    // "Email not confirmed" for unconfirmed users (security: prevents enumeration)
    if (loginError) {
      const msg = loginError.message || '';
      if (msg.includes('Email not confirmed') || msg.includes('Invalid login credentials')) {
        console.log('[register] User needs email confirmation (auto-confirm failed or propagation delayed)');
        return 'needs_confirmation';
      }
    }

    setLastError('Registracija nije uspjela. Pokušajte ponovo.');
    return 'error';
  }

  return 'needs_confirmation';
}, [supabase, setUserFromSession]);

  // ─── OAuth Login (Google, Facebook) ───────────────────

  const loginWithOAuth = useCallback(async (provider: 'google' | 'facebook') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error('OAuth error:', error.message);
    }
  }, [supabase]);

  // ─── Logout ───────────────────────────────────────────

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  // ─── Password Reset ──────────────────────────────────

  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      console.error('Reset password error:', error.message);
      return false;
    }

    return true;
  }, [supabase]);

  // ─── Resend Verification Email ──────────────────────

  const resendVerificationEmail = useCallback(async (): Promise<boolean> => {
    if (!user?.email || !user?.id) return false;
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }, [user]);

  // ─── Refresh Profile (re-fetch from DB) ────────────

  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    try {
      const profile = await Promise.race([
        fetchProfile(session.user.id),
        new Promise<null>(resolve => setTimeout(() => resolve(null), 6000)),
      ]);
      if (profile) {
        setUser(toAuthUser(session.user, profile));
      }
    } catch {
      // silent — keep existing user data
    }
  }, [supabase, fetchProfile]);

  return React.createElement(AuthContext.Provider, {
    value: {
      user,
      isLoading,
      isAuthenticated: !!user,
      lastError,
      login,
      register,
      loginWithOAuth,
      logout,
      resetPassword,
      resendVerificationEmail,
      refreshProfile,
    }
  }, children);
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
