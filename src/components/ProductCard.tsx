'use client';

import React, { useState, memo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { useFavorites } from '@/lib/favorites';
import { useToast } from '@/components/Toast';
import { CITIES } from '@/lib/location';
import { getCurrencyMode, eurToKm } from '@/lib/currency';

const bihCities = new Set(CITIES.filter(c => c.country === 'BiH').map(c => c.name.toLowerCase()));

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { isFavorite: checkFavorite, toggleFavorite: toggle } = useFavorites();
  const { showToast } = useToast();
  const [imgError, setImgError] = useState(false);

  // Use the product ID directly — Supabase UUIDs contain hyphens
  const isFavorite = checkFavorite(product.id);
  const isBiH = bihCities.has(product.location.toLowerCase().trim());
  const currencyMode = getCurrencyMode();
  const promoted = !!product.promoted_until && new Date(product.promoted_until) > new Date();

  const handleCardClick = () => {
    router.push(`/product/${product.id}`);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle(product.id);
    showToast(isFavorite ? 'Uklonjeno iz favorita' : 'Dodano u favorite');
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-[var(--c-card)] rounded-[14px] overflow-hidden flex flex-col border relative group transition-all duration-150 h-[240px] w-full cursor-pointer shadow-subtle hover:shadow-medium ${promoted ? 'border-amber-500/40 hover:border-amber-500/60' : 'border-[var(--c-border)] hover:border-[var(--c-active)]'}`}
    >
      {/* Image Area */}
      <div className="relative h-[150px] w-full shrink-0 overflow-hidden">
        {imgError ? (
          <div className="w-full h-full bg-[var(--c-card-alt)] flex items-center justify-center">
            <i className="fa-solid fa-image text-[var(--c-text-muted)] text-2xl"></i>
          </div>
        ) : (
          <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-300" onError={() => setImgError(true)} />
        )}

        {/* Promoted Badge */}
        {promoted && (
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-sm shadow-sm">
              <i className="fa-solid fa-star text-[7px]"></i>
              Istaknuto
            </span>
          </div>
        )}

        {/* Heart Icon */}
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={toggleFavorite}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 ${
              isFavorite ? 'bg-red-600 text-white' : 'bg-[var(--c-card)]/90 text-[var(--c-text3)] hover:bg-[var(--c-card)] hover:text-red-600'
            }`}
          >
            <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart text-[12px]`}></i>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-2.5 flex flex-col justify-center min-w-0 overflow-hidden bg-[var(--c-card)]">
        <h3 className="text-[13px] font-semibold text-[var(--c-text)] leading-snug mb-1 line-clamp-1 sm:line-clamp-2 min-w-0 w-full">
          {product.name}
        </h3>

        <div className="flex justify-between items-end mt-auto gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-[var(--c-text3)] font-medium truncate">{product.location}</span>
            <span className="text-[11px] text-[var(--c-text-muted)] truncate">{product.timeLabel}</span>
          </div>
          <div className="flex flex-col items-end gap-0.5 shrink-0">
            {currencyMode === 'km-only' ? (
              <span className="text-[14px] font-bold text-[var(--c-accent)] leading-none whitespace-nowrap">
                {eurToKm(product.price).toLocaleString()}&nbsp;KM
              </span>
            ) : currencyMode === 'eur-only' ? (
              <span className="text-[14px] font-bold text-[var(--c-accent)] leading-none whitespace-nowrap">
                {product.price.toLocaleString()}&nbsp;&euro;
              </span>
            ) : (
              <>
                <span className="text-[14px] font-bold text-[var(--c-accent)] leading-none whitespace-nowrap">
                  {isBiH ? product.secondaryPriceLabel : <>{product.price.toLocaleString()}&nbsp;&euro;</>}
                </span>
                <span className="text-[12px] font-semibold text-[var(--c-accent)]/60 leading-none whitespace-nowrap">
                  {isBiH ? <>{product.price.toLocaleString()}&nbsp;&euro;</> : product.secondaryPriceLabel}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);
