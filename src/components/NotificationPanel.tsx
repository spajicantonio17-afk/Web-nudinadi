'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications, type AppNotification } from '@/lib/notifications';
import { useI18n } from '@/lib/i18n';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_COLORS: Record<string, string> = {
  message: 'text-blue-400 bg-blue-500/10',
  price_drop: 'text-emerald-400 bg-emerald-500/10',
  promotion: 'text-amber-400 bg-amber-500/10',
  system: 'text-purple-400 bg-purple-500/10',
};

function timeAgo(ts: number, t: (key: string, params?: Record<string, string | number>) => string): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return t('notif.ago.minutes', { count: mins });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t('notif.ago.hours', { count: hrs });
  return t('notif.ago.days', { count: Math.floor(hrs / 24) });
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead, removeNotification, clearAll, unreadCount } = useNotifications();
  const { t } = useI18n();

  if (!isOpen) return null;

  const handleClick = (notif: AppNotification) => {
    markAsRead(notif.id);
    if (notif.link) {
      router.push(notif.link);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[140]" onClick={onClose}></div>

      {/* Panel */}
      <div className="fixed top-20 right-4 z-[150] w-[340px] max-w-[calc(100vw-32px)] max-h-[70vh] bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">

        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--c-border)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-[var(--c-text)]">{t('notif.title')}</h3>
            <p className="text-[9px] text-[var(--c-text2)] uppercase tracking-widest mt-0.5">
              {unreadCount > 0 ? t('notif.unread', { count: unreadCount }) : t('notif.allRead')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[9px] text-blue-400 font-bold uppercase tracking-widest hover:text-[var(--c-text)] transition-colors"
              >
                {t('notif.markAll')}
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-[9px] text-red-400 font-bold uppercase tracking-widest hover:text-red-500 transition-colors"
              >
                {t('notif.clearAll')}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text2)] hover:text-[var(--c-text)] transition-colors"
            >
              <i className="fa-solid fa-xmark text-[10px]"></i>
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="overflow-y-auto max-h-[calc(70vh-70px)] no-scrollbar">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`relative px-5 py-4 flex gap-3 border-b border-[var(--c-border)] transition-colors hover:bg-[var(--c-hover)] group ${!notif.read ? 'bg-blue-500/5' : ''}`}
              >
                {/* Icon */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer ${ICON_COLORS[notif.type] || ICON_COLORS.system}`}
                  onClick={() => handleClick(notif)}
                >
                  <i className={`fa-solid ${notif.icon} text-sm`}></i>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleClick(notif)}>
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className={`text-[11px] font-bold ${!notif.read ? 'text-[var(--c-text)]' : 'text-[var(--c-text2)]'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[9px] text-[var(--c-text3)] shrink-0 ml-2">{timeAgo(notif.timestamp, t)}</span>
                  </div>
                  <p className="text-[10px] text-[var(--c-text2)] line-clamp-2 leading-relaxed">{notif.body}</p>
                </div>

                {/* Unread dot */}
                {!notif.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5 group-hover:opacity-0 transition-opacity"></div>
                )}

                {/* Dismiss button — visible on hover */}
                <button
                  onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--c-hover)] border border-[var(--c-border)] items-center justify-center text-[var(--c-text3)] hover:text-red-400 hover:border-red-400/30 transition-all opacity-0 group-hover:opacity-100 hidden group-hover:flex"
                  title="Ukloni"
                >
                  <i className="fa-solid fa-xmark text-[9px]"></i>
                </button>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <i className="fa-regular fa-bell-slash text-2xl text-[var(--c-text3)] mb-3 block"></i>
              <p className="text-[11px] text-[var(--c-text2)] font-bold">{t('notif.empty')}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
