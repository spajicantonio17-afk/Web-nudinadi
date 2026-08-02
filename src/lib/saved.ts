// ── Sačuvaj (Saved Listings) ──────────────────────────────────
// localStorage-based temporary save list with React hook

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabase } from '@/lib/supabase';

export interface SavedItem {
  productId: string;
  addedAt: number;
}

const STORAGE_KEY = 'nudinadi_saved';

function getStoredItems(): SavedItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function storeItems(items: SavedItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useSaved() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const validated = useRef(false);

  useEffect(() => {
    const stored = getStoredItems();
    setItems(stored);

    if (stored.length > 0 && !validated.current) {
      validated.current = true;
      const supabase = getSupabase();
      supabase
        .from('products')
        .select('id')
        .in('id', stored.map(i => i.productId))
        .eq('status', 'active')
        .then(({ data }) => {
          if (!data) return;
          const validIds = new Set(data.map(p => p.id));
          const validItems = stored.filter(i => validIds.has(i.productId));
          if (validItems.length !== stored.length) {
            storeItems(validItems);
            setItems(validItems);
          }
        });
    }
  }, []);

  const saveItem = useCallback((productId: string) => {
    setItems(prev => {
      if (prev.some(item => item.productId === productId)) return prev;
      const next = [...prev, { productId, addedAt: Date.now() }];
      storeItems(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => {
      const next = prev.filter(item => item.productId !== productId);
      storeItems(next);
      return next;
    });
  }, []);

  const isItemSaved = useCallback((productId: string) => {
    return items.some(item => item.productId === productId);
  }, [items]);

  const clearSaved = useCallback(() => {
    setItems([]);
    storeItems([]);
  }, []);

  const savedCount = items.length;

  return { items, saveItem, removeItem, isItemSaved, clearSaved, savedCount };
}
