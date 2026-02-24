'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { useFavorites } from '@/lib/favorites';
import { useToast } from '@/components/Toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { isFavorite: checkFavorite, toggleFavorite: toggle } = useFavorites();
  const { showToast } = useToast();
  const [imgError, setImgError] = useState(false);

  // Strip multiplied ID suffix (e.g. "5-12" → "5") for localStorage
  const baseId = product.id.includes('-') ? product.id.split('-')[0] : product.id;
  const isFavorite = checkFavorite(baseId);

  const handleCardClick = () => {
    router.push(`/product/${baseId}`);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle(baseId);
    showToast(isFavorite ? 'Uklonjeno iz favorita' : 'Dodano u favorite');
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-[14px] overflow-hidden flex flex-col border border-[var(--c-border)] relative group transition-all duration-150 h-[220px] w-full cursor-pointer shadow-subtle hover:shadow-medium hover:border-[var(--c-active)]"
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

        {/* Heart Icon */}
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={toggleFavorite}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 ${
              isFavorite ? 'bg-red-600 text-white' : 'bg-white/90 text-[var(--c-text3)] hover:bg-white hover:text-red-600'
            }`}
          >
            <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart text-[12px]`}></i>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-2.5 flex flex-col justify-center overflow-hidden bg-white">
        <h3 className="text-[13px] font-semibold text-[var(--c-text)] leading-snug line-clamp-1 mb-1">
          {product.name}
        </h3>

        <div className="flex justify-between items-end mt-auto">
          <div className="flex flex-col">
            <span className="text-[11px] text-[var(--c-text3)] font-medium truncate max-w-[90px]">{product.location}</span>
            <span className="text-[11px] text-[var(--c-text-muted)]">{product.timeLabel.split(' ').pop()}</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[14px] font-bold text-[var(--c-accent)] leading-none">&euro;{product.price.toLocaleString()}</span>
            <span className="text-[12px] font-semibold text-[var(--c-accent)]/60 leading-none">{product.secondaryPriceLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
