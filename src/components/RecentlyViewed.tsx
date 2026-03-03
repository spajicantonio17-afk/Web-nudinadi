'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRecentlyViewed } from '@/lib/recently-viewed';
import { getProductsByIds } from '@/services/productService';
import { removeFromRecentlyViewed } from '@/lib/recently-viewed';
import { getCurrencyMode, eurToKm } from '@/lib/currency';
import { useI18n } from '@/lib/i18n';
import type { ProductFull } from '@/lib/database.types';

export default function RecentlyViewed() {
  const router = useRouter();
  const { t } = useI18n();
  const { productIds, hasItems, clearAll } = useRecentlyViewed();
  const [products, setProducts] = useState<ProductFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currency = getCurrencyMode();

  useEffect(() => {
    if (!hasItems) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getProductsByIds(productIds)
      .then(data => {
        setProducts(data);
        // Clean up IDs for products that no longer exist
        const validIds = new Set(data.map(p => p.id));
        productIds.forEach(id => {
          if (!validIds.has(id)) removeFromRecentlyViewed(id);
        });
      })
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, [productIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!hasItems || (products.length === 0 && !isLoading)) return null;

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-black text-[var(--c-text)]">
          <i className="fa-solid fa-clock-rotate-left mr-2 text-blue-500"></i>
          {t('recentlyViewed.title')}
        </h3>
        <button
          onClick={clearAll}
          className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest hover:text-red-400 transition-colors"
        >
          {t('recentlyViewed.clear')}
        </button>
      </div>

      {/* Scrollable Row */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {isLoading ? (
          // Skeleton loaders
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[120px] animate-pulse">
              <div className="w-full aspect-square rounded-[14px] bg-[var(--c-hover)]"></div>
              <div className="mt-2 h-3 bg-[var(--c-hover)] rounded w-3/4"></div>
              <div className="mt-1 h-3 bg-[var(--c-hover)] rounded w-1/2"></div>
            </div>
          ))
        ) : (
          products.map(product => {
            const img = product.images?.[0] || `https://picsum.photos/seed/${product.id}/200`;
            const priceDisplay = currency === 'km-only'
              ? `${eurToKm(product.price).toFixed(2)} KM`
              : currency === 'dual'
              ? `${product.price.toFixed(2)} € / ${eurToKm(product.price).toFixed(2)} KM`
              : `${product.price.toFixed(2)} €`;

            return (
              <div
                key={product.id}
                className="shrink-0 w-[120px] cursor-pointer group"
                onClick={() => router.push(`/product/${product.id}`)}
              >
                <div className="relative w-full aspect-square rounded-[14px] overflow-hidden bg-[var(--c-hover)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.status === 'sold' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-[9px] font-black uppercase tracking-widest">Prodano</span>
                    </div>
                  )}
                </div>
                <p className="mt-1.5 text-[10px] font-bold text-[var(--c-text)] line-clamp-2 leading-tight">
                  {product.title}
                </p>
                <p className="text-[10px] font-black text-blue-500 mt-0.5">
                  {priceDisplay}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
