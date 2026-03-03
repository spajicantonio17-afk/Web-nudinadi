'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'nudinadi_recently_viewed'
const MAX_ITEMS = 20

interface RecentlyViewedItem {
  productId: string
  timestamp: number
}

function getStored(): RecentlyViewedItem[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch {
    return []
  }
}

function setStored(items: RecentlyViewedItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
}

export function addRecentlyViewed(productId: string): void {
  const items = getStored()
  // Remove existing entry if present (will be re-added at top)
  const filtered = items.filter(item => item.productId !== productId)
  const updated = [{ productId, timestamp: Date.now() }, ...filtered].slice(0, MAX_ITEMS)
  setStored(updated)
}

export function getRecentlyViewedIds(): string[] {
  return getStored().map(item => item.productId)
}

export function clearRecentlyViewed(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function removeFromRecentlyViewed(productId: string): void {
  const items = getStored().filter(item => item.productId !== productId)
  setStored(items)
}

// ─── Hook ────────────────────────────────────────────────

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([])

  useEffect(() => {
    setItems(getStored())
  }, [])

  const addItem = useCallback((productId: string) => {
    addRecentlyViewed(productId)
    setItems(getStored())
  }, [])

  const clearAll = useCallback(() => {
    clearRecentlyViewed()
    setItems([])
  }, [])

  const removeItem = useCallback((productId: string) => {
    removeFromRecentlyViewed(productId)
    setItems(getStored())
  }, [])

  return {
    items,
    productIds: items.map(i => i.productId),
    addItem,
    clearAll,
    removeItem,
    hasItems: items.length > 0,
  }
}
