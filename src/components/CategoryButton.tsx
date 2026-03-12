'use client';

import { memo } from 'react';
import { Category } from '@/lib/types';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/components/icons/CategoryIcons';

interface CategoryButtonProps {
  cat: Category;
  isActive: boolean;
  onClick: () => void;
  flexible?: boolean;
}

function CategoryButton({ cat, isActive, onClick, flexible }: CategoryButtonProps) {
  const IconComponent = CATEGORY_ICONS[cat.id];
  const colors = CATEGORY_COLORS[cat.id] || CATEGORY_COLORS['ostalo'];

  const sizeClass = flexible
    ? 'w-[100px] min-w-[100px] h-[72px] rounded-[12px] shrink-0'
    : 'min-w-[80px] h-[80px] rounded-[12px] shrink-0';

  const iconSize = flexible ? 'w-6 h-6' : 'w-7 h-7';

  return (
    <button
      onClick={onClick}
      className={`${sizeClass} flex flex-col items-center justify-center gap-1.5 group cursor-pointer
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-hidden
        bg-[var(--c-card)] border
        ${isActive
          ? 'border-[var(--c-accent)] ring-1 ring-[var(--c-accent)]/20 z-10'
          : 'border-[var(--c-border)] hover:border-[var(--c-active)]'
        }
      `}
      style={{
        boxShadow: isActive
          ? `0 6px 20px ${colors.glow}`
          : '0 1px 4px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.boxShadow = `0 8px 32px ${colors.glow}`;
          e.currentTarget.style.transform = 'translateY(-3px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {/* SVG Icon */}
      <div
        className={`${iconSize} transition-transform duration-300 group-hover:scale-[1.08]`}
        style={{ color: colors.light }}
      >
        {IconComponent ? <IconComponent /> : (
          <i className={`fa-solid ${cat.icon} ${flexible ? 'text-base' : 'text-lg'}`}></i>
        )}
      </div>

      {/* Label */}
      <span
        className={`text-center font-semibold uppercase leading-[1.1] px-1
          ${cat.name.length > 20
            ? (flexible ? 'text-[8px] tracking-[0.1px]' : 'text-[9px] tracking-[0.2px]')
            : (flexible ? 'text-[10px] tracking-[0.2px]' : 'text-[11px] tracking-[0.3px]')
          }
          ${isActive
            ? 'text-[var(--c-accent)]'
            : 'text-[var(--c-text2)]'
          }
        `}
      >
        {cat.name}
      </span>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[var(--c-accent)] rounded-full"></div>
      )}
    </button>
  );
}

export default memo(CategoryButton);