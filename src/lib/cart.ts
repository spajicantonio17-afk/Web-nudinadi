// ── Cart System ──────────────────────────────────────────────
// localStorage-based cart with React hook

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabase } from '@/lib/supabase';

export interface CartItem {
  productId: string;
  addedAt: number;
}

const STORAGE_KEY = 'nudinadi_cart';

function getStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function storeCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * React hook for managing cart with localStorage persistence.
 */
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const validated = useRef(false);

  useEffect(() => {
    const stored = getStoredCart();
    setItems(stored);

    // Validate cart items are still active products (remove sold/deleted)
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
            storeCart(validItems);
            setItems(validItems);
          }
        });
    }
  }, []);

  const addToCart = useCallback((productId: string) => {
    setItems(prev => {
      if (prev.some(item => item.productId === productId)) return prev;
      const next = [...prev, { productId, addedAt: Date.now() }];
      storeCart(next);
      return next;
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => {
      const next = prev.filter(item => item.productId !== productId);
      storeCart(next);
      return next;
    });
  }, []);

  const isInCart = useCallback((productId: string) => {
    return items.some(item => item.productId === productId);
  }, [items]);

  const clearCart = useCallback(() => {
    setItems([]);
    storeCart([]);
  }, []);

  const cartCount = items.length;

  return { items, addToCart, removeFromCart, isInCart, clearCart, cartCount };
}
