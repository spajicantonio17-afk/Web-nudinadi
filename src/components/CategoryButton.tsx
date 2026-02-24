'use client';

import React, { useState, memo } from 'react';
import { Category } from '@/lib/types';
import { CATEGORY_IMAGES } from '@/lib/constants';

interface CategoryButtonProps {
  cat: Category;
  isActive: boolean;
  onClick: () => void;
  flexible?: boolean;
}

function CategoryButton({ cat, isActive, onClick, flexible }: CategoryButtonProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClass = flexible
    ? 'w-[90px] min-w-[90px] h-[72px] rounded-[12px] shrink-0'
    : 'min-w-[80px] h-[80px] rounded-[12px] shrink-0';

  return (
    <button
      onClick={onClick}
      className={`${sizeClass} border relative overflow-hidden group transition-all duration-150 ${
        isActive
          ? 'border-[var(--c-accent)] ring-1 ring-[var(--c-accent)]/20 z-10 shadow-medium'
          : 'border-[var(--c-border)] hover:border-[var(--c-active)] shadow-subtle hover:shadow-medium'
      }`}
    >
      {/* Background Image or Gradient Fallback */}
      {!imgError && CATEGORY_IMAGES[cat.id] ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={CATEGORY_IMAGES[cat.id]}
            alt={cat.name}
            onError={() => setImgError(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 ${
              isActive ? 'scale-105' : 'group-hover:scale-[1.03] grayscale-[20%] group-hover:grayscale-0'
            }`}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-[var(--c-card-alt)]" />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

      {/* Icon (always visible when no image, hover-only when image present) */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${
        imgError ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <div className={`${flexible ? 'w-6 h-6' : 'w-7 h-7'} rounded-[4px] bg-black/30 flex items-center justify-center`}>
          <i className={`fa-solid ${cat.icon} text-white ${flexible ? 'text-[10px]' : 'text-sm'}`}></i>
        </div>
      </div>

      {/* Label */}
      <div className={`absolute bottom-0 inset-x-0 ${flexible ? 'p-1.5' : 'p-2'} flex flex-col items-center justify-end h-full text-center`}>
        <span className={`${flexible ? 'text-[10px]' : 'text-[11px]'} font-bold uppercase leading-tight transition-colors ${isActive ? 'text-[var(--c-accent-light)]' : 'text-white'}`}>
          {cat.name}
        </span>
        {isActive && (
          <div className="w-4 h-[2px] bg-[var(--c-accent)] mt-0.5"></div>
        )}
      </div>
    </button>
  );
}

export default memo(CategoryButton);
