'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { getUnreadObavjestiCount } from '@/services/obavjestiService';

interface ObavjestiContactRowProps {
  isSelected: boolean;
  onClick: () => void;
  unreadCount?: number;
}

export default function ObavjestiContactRow({ isSelected, onClick, unreadCount: externalCount }: ObavjestiContactRowProps) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(externalCount ?? 0);

  useEffect(() => {
    if (externalCount !== undefined) {
      setUnreadCount(externalCount);
      return;
    }
    if (!user) return;
    getUnreadObavjestiCount(user.id).then(setUnreadCount).catch(() => {});
  }, [user?.id, externalCount]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      onClick={onClick}
      className={`
        group relative flex items-center justify-center sm:justify-start gap-0 sm:gap-3 p-1 sm:p-2.5 md:p-3 rounded-[12px] sm:rounded-[16px] cursor-pointer transition-all duration-200 border overflow-hidden mb-1
        ${isSelected
          ? 'bg-blue-600/10 border-blue-500/50 shadow-[inset_0_0_20px_rgba(37,99,235,0.1)]'
          : 'bg-transparent border-transparent hover:bg-[var(--c-hover)] hover:border-[var(--c-border)]'
        }
      `}
    >
      {/* Bell icon (always visible) */}
      <div className="relative shrink-0">
        <div className={`w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-[10px] sm:rounded-[14px] p-[2px] ${isSelected ? 'bg-red-500' : 'bg-red-500/20 group-hover:bg-red-500/30'} transition-colors flex items-center justify-center`}>
          <div className="w-full h-full rounded-[12px] bg-red-500/10 flex items-center justify-center">
            <i className="fa-solid fa-bell text-red-400 text-sm sm:text-base"></i>
          </div>
        </div>
        {/* Unread badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-[8px] font-black text-white leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </div>
        )}
      </div>

      {/* Text (hidden on mobile, visible on md+) */}
      <div className="flex-1 min-w-0 hidden md:block">
        <div className="flex justify-between items-baseline mb-0.5">
          <h4 className={`text-[13px] font-bold truncate ${isSelected ? 'text-[var(--c-text)]' : 'text-[var(--c-text2)]'}`}>
            Obavijesti
          </h4>
          {unreadCount > 0 && (
            <span className="min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <p className={`text-[11px] truncate ${isSelected ? 'text-blue-400 font-medium' : 'text-[var(--c-text3)]'}`}>
          {unreadCount > 0
            ? `${unreadCount} ${unreadCount === 1 ? 'nova obavijest' : unreadCount < 5 ? 'nove obavijesti' : 'novih obavijesti'}`
            : 'Tvoje obavijesti i XP nagrade'
          }
        </p>
      </div>
    </div>
  );
}
