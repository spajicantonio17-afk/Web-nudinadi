'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { getCurrencyMode, formatPriceDisplay } from '@/lib/currency';
import type { Product } from '@/lib/database.types';

type BannerProduct = Pick<Product, 'id' | 'title' | 'price' | 'images' | 'status'>;

interface ChatProductBannerProps {
  product: BannerProduct | null;
  productId: string | null;
}

export default function ChatProductBanner({ product, productId }: ChatProductBannerProps) {
  const router = useRouter();
  const { t } = useI18n();

  // No product_id = general chat, no banner
  if (!productId) return null;

  const isUnavailable = !product || product.status === 'sold' || product.status === 'archived';
  const imageUrl = product?.images?.[0];
  const title = product?.title || t('messages.articleUnavailable');

  const mode = getCurrencyMode();
  const priceDisplay = product ? formatPriceDisplay(product.price, true, mode) : null;

  const handleClick = () => {
    if (product && !isUnavailable) {
      router.push(`/product/${product.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-center gap-3 px-4 py-2.5 border-b border-[var(--c-border)] bg-[var(--c-card)]/60 backdrop-blur-sm shrink-0 transition-colors ${
        isUnavailable
          ? 'opacity-60 cursor-default'
          : 'cursor-pointer hover:bg-[var(--c-hover)]'
      }`}
    >
      {/* Product Thumbnail */}
      <div className={`w-10 h-10 rounded-[8px] overflow-hidden shrink-0 border border-[var(--c-border)] ${isUnavailable ? 'grayscale' : ''}`}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[var(--c-card-alt)] flex items-center justify-center">
            <i className={`fa-solid ${isUnavailable ? 'fa-ban text-red-400' : 'fa-image text-[var(--c-text3)]'} text-xs`}></i>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-[12px] font-semibold truncate ${isUnavailable ? 'text-[var(--c-text3)] line-through' : 'text-[var(--c-text)]'}`}>
          {title}
        </p>
        {isUnavailable ? (
          <p className="text-[10px] text-red-400/80 font-medium">
            {product?.status === 'sold' ? t('messages.articleSold') : t('messages.articleUnavailable')}
          </p>
        ) : priceDisplay ? (
          <p className="text-[11px] font-bold text-[var(--c-accent)]">
            {priceDisplay.primary}
          </p>
        ) : null}
      </div>

      {/* Arrow indicator (only for available products) */}
      {!isUnavailable && (
        <i className="fa-solid fa-chevron-right text-[10px] text-[var(--c-text3)] shrink-0"></i>
      )}
    </div>
  );
}
