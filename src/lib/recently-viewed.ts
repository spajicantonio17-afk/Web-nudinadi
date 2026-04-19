'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_PREFIX = 'nudinadi_recently_viewed'
const MAX_ITEMS = 20

function storageKey(userId?: string | null): string {
  return `${STORAGE_PREFIX}_${userId || 'guest'}`
}

interface RecentlyViewedItem {
  productId: string
  timestamp: number
}

function getStored(userId?: string | null): RecentlyViewedItem[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(storageKey(userId))
    if (!stored) return []
    return JSON.parse(stored)
  } catch {
    return []
  }
}

function setStored(items: RecentlyViewedItem[], userId?: string | null): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(storageKey(userId), JSON.stringify(items.slice(0, MAX_ITEMS)))
}

export function addRecentlyViewed(productId: string, userId?: string | null): void {
  const items = getStored(userId)
  // Remove existing entry if present (will be re-added at top)
  const filtered = items.filter(item => item.productId !== productId)
  const updated = [{ productId, timestamp: Date.now() }, ...filtered].slice(0, MAX_ITEMS)
  setStored(updated, userId)
}

export function getRecentlyViewedIds(userId?: string | null): string[] {
  return getStored(userId).map(item => item.productId)
}

export function clearRecentlyViewed(userId?: string | null): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(storageKey(userId))
}

export function removeFromRecentlyViewed(productId: string, userId?: string | null): void {
  const items = getStored(userId).filter(item => item.productId !== productId)
  setStored(items, userId)
}

// ─── Hook ────────────────────────────────────────────────

export function useRecentlyViewed(userId?: string | null) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([])

  useEffect(() => {
    setItems(getStored(userId))
  }, [userId])

  const addItem = useCallback((productId: string) => {
    addRecentlyViewed(productId, userId)
    setItems(getStored(userId))
  }, [userId])

  const clearAll = useCallback(() => {
    clearRecentlyViewed(userId)
    setItems([])
  }, [userId])

  const removeItem = useCallback((productId: string) => {
    removeFromRecentlyViewed(productId, userId)
    setItems(getStored(userId))
  }, [userId])

  return {
    items,
    productIds: items.map(i => i.productId),
    addItem,
    clearAll,
    removeItem,
    hasItems: items.length > 0,
  }
}
