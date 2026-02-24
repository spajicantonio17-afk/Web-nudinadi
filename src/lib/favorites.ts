// ── Favorites System ──────────────────────────────────────────────
// Auth-aware: Supabase when logged in, localStorage fallback for guests

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import {
  getFavorites,
  addFavorite,
  removeFavorite as removeFavoriteDB,
} from '@/services/favoriteService';

const STORAGE_KEY = 'nudinadi_favorites';

function getLocalFavoriteIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalFavoriteIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();

    // Load favorites based on current auth state
    const loadFavorites = (uid: string | null) => {
      if (uid) {
        getFavorites(uid)
          .then(favs => setFavoriteIds(favs.map(f => f.product_id)))
          .catch(() => setFavoriteIds(getLocalFavoriteIds()));
      } else {
        setFavoriteIds(getLocalFavoriteIds());
      }
    };

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
      loadFavorites(user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);

      // Migrate guest favorites to DB on login
      if (event === 'SIGNED_IN' && uid) {
        const localIds = getLocalFavoriteIds();
        if (localIds.length > 0) {
          await Promise.allSettled(localIds.map(pid => addFavorite(uid, pid)));
          saveLocalFavoriteIds([]);
        }
      }

      loadFavorites(uid);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleFavorite = useCallback(async (productId: string) => {
    if (userId) {
      const isFav = favoriteIds.includes(productId);
      // Optimistic update
      setFavoriteIds(prev =>
        isFav ? prev.filter(id => id !== productId) : [...prev, productId]
      );
      try {
        if (isFav) {
          await removeFavoriteDB(userId, productId);
        } else {
          await addFavorite(userId, productId);
        }
      } catch (err) {
        // Rollback on error
        setFavoriteIds(prev =>
          isFav ? [...prev, productId] : prev.filter(id => id !== productId)
        );
        console.error('Favorite toggle failed:', err);
      }
    } else {
      setFavoriteIds(prev => {
        const next = prev.includes(productId)
          ? prev.filter(id => id !== productId)
          : [...prev, productId];
        saveLocalFavoriteIds(next);
        return next;
      });
    }
  }, [userId, favoriteIds]);

  const isFavorite = useCallback((productId: string) => {
    return favoriteIds.includes(productId);
  }, [favoriteIds]);

  const removeFavorite = useCallback(async (productId: string) => {
    setFavoriteIds(prev => {
      const next = prev.filter(id => id !== productId);
      if (!userId) saveLocalFavoriteIds(next);
      return next;
    });
    if (userId) {
      await removeFavoriteDB(userId, productId).catch(console.error);
    }
  }, [userId]);

  return { favoriteIds, toggleFavorite, isFavorite, removeFavorite, userId };
}
