'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import type { DbNotification } from '@/services/notificationService';
import {
  getObavijesti,
  getUnreadObavjestiCount,
  markObavijestAsRead,
  markAllObavjestiAsRead,
  subscribeToObavijesti,
  formatObavjestiTime,
  getObavjestiLink,
  OBAVIJESTI_ICON_MAP,
  OBAVIJESTI_COLOR_MAP,
} from '@/services/obavjestiService';
import { logger } from '@/lib/logger';
import { useI18n } from '@/lib/i18n';

interface ObavjestiChatProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export default function ObavjestiChat({ isOpen, onClose, onUnreadCountChange }: ObavjestiChatProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useI18n();
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const [data, count] = await Promise.all([
        getObavijesti(user.id),
        getUnreadObavjestiCount(user.id),
      ]);
      setNotifications(data);
      setUnreadCount(count);
      onUnreadCountChange?.(count);
    } catch (err) {
      logger.error('Failed to load obavijesti:', err);
    } finally {
      setLoading(false);
    }
  }, [user, onUnreadCountChange]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = subscribeToObavijesti(user.id, (newNotif) => {
      setNotifications(prev => {
        if (prev.some(n => n.id === newNotif.id)) return prev;
        return [newNotif, ...prev];
      });
      setUnreadCount(prev => {
        const next = prev + 1;
        onUnreadCountChange?.(next);
        return next;
      });
    });

    return () => {
      const { getSupabase } = require('@/lib/supabase');
      getSupabase().removeChannel(channel);
    };
  }, [user?.id, onUnreadCountChange]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle notification click
  const handleClick = async (notif: DbNotification) => {
    if (!notif.is_read) {
      await markObavijestAsRead(notif.id);
      setNotifications(prev =>
        prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => {
        const next = Math.max(0, prev - 1);
        onUnreadCountChange?.(next);
        return next;
      });
    }

    const link = getObavjestiLink(notif);
    if (link) {
      router.push(link);
      onClose();
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllObavjestiAsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    onUnreadCountChange?.(0);
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-[#060E14]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--c-border)]">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] flex items-center justify-center text-[var(--c-text2)] hover:text-[var(--c-text)] transition-colors"
          >
            <i className="fa-solid fa-arrow-left text-xs"></i>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center">
              <i className="fa-solid fa-bell text-red-400 text-sm"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--c-text)]">{t('notif.title')}</h3>
              <p className="text-[9px] text-[var(--c-text3)] uppercase tracking-widest">
                {unreadCount > 0 ? t('notif.unreadCount', { count: unreadCount }) : t('notif.allReadStatus')}
              </p>
            </div>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-[9px] text-blue-400 font-bold uppercase tracking-widest hover:text-[var(--c-text)] transition-colors"
          >
            {t('notif.markAllBtn')}
          </button>
        )}
      </div>

      {/* No input field indicator */}
      {/* Notification list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-2 py-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] flex items-center justify-center mb-4">
              <i className="fa-regular fa-bell text-2xl text-[var(--c-text3)]"></i>
            </div>
            <p className="text-xs font-bold text-[var(--c-text2)]">{t('notif.noNotifications')}</p>
            <p className="text-[10px] text-[var(--c-text3)] mt-1">{t('notif.notifWillAppear')}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notif) => {
              const icon = OBAVIJESTI_ICON_MAP[notif.type] || 'fa-bell';
              const colorClass = OBAVIJESTI_COLOR_MAP[notif.type] || 'text-purple-400 bg-purple-500/10';
              const link = getObavjestiLink(notif);

              return (
                <div
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`relative flex items-start gap-3 px-3 py-3 rounded-[14px] transition-colors cursor-pointer group ${
                    !notif.is_read
                      ? 'bg-blue-500/5 border border-blue-500/10'
                      : 'hover:bg-[var(--c-hover)] border border-transparent'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                    <i className={`fa-solid ${icon} text-sm`}></i>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className={`text-[11px] font-bold ${!notif.is_read ? 'text-[var(--c-text)]' : 'text-[var(--c-text2)]'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[9px] text-[var(--c-text3)] shrink-0 ml-2">
                        {formatObavjestiTime(notif.created_at)}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--c-text2)] leading-relaxed">{notif.body}</p>

                    {notif.data?.xp_earned ? (
                      <span className="inline-block mt-1 text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                        +{String(notif.data.xp_earned)} XP
                      </span>
                    ) : null}

                    {/* Navigation hint */}
                    {link && (
                      <div className="flex items-center gap-1 mt-1 text-[9px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <i className="fa-solid fa-arrow-right text-[8px]"></i>
                        <span>{t('notif.view')}</span>
                      </div>
                    )}
                  </div>

                  {/* Unread dot */}
                  {!notif.is_read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom: no input field (read-only) */}
      <div className="px-4 py-3 border-t border-[var(--c-border)] bg-[var(--c-card)]">
        <p className="text-[10px] text-[var(--c-text3)] text-center">
          <i className="fa-solid fa-lock text-[8px] mr-1"></i>
          {t('notif.readOnly')}
        </p>
      </div>
    </div>
  );
}
