// ── In-App Notification System ──────────────────────────────────
// Context-based — shared state across all consumers (bell badge + panel)

'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import React from 'react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface AppNotification {
  id: string;
  type: 'message' | 'price_drop' | 'promotion' | 'system';
  title: string;
  body: string;
  icon: string;
  timestamp: number;
  read: boolean;
  link?: string;
}

const STORAGE_KEY = 'nudinadi_notifications';
const MAX_NOTIFICATIONS = 50;

// ── Storage helpers (per-user) ────────────────────────────────

function getStoredNotifications(userId: string): AppNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch { return []; }
}

function storeNotifications(userId: string, items: AppNotification[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(items.slice(0, MAX_NOTIFICATIONS)));
}

// ── Context ───────────────────────────────────────────────────

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Load per-user notifications + welcome notification on first login
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const stored = getStoredNotifications(user.id);

    // Welcome notification — shown only once per user
    const welcomeKey = `nudinadi_welcomed_${user.id}`;
    if (!localStorage.getItem(welcomeKey)) {
      localStorage.setItem(welcomeKey, '1');
      const welcome: AppNotification = {
        id: `welcome_${user.id}`,
        type: 'system',
        title: 'Dobrodošli na NudiNađi!',
        body: 'Vaš profil je spreman. Počnite objavljivati oglase ili istražujte ponudu.',
        icon: 'fa-circle-check',
        timestamp: Date.now(),
        read: false,
      };
      const next = [welcome, ...stored].slice(0, MAX_NOTIFICATIONS);
      storeNotifications(user.id, next);
      setNotifications(next);
    } else {
      setNotifications(stored);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Supabase Realtime: listen for new messages addressed to current user
  useEffect(() => {
    if (!user) return;

    const supabase = getSupabase();

    const channel = supabase
      .channel(`notif_messages_${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const msg = payload.new as {
            id: string;
            conversation_id: string;
            sender_id: string;
            content: string;
          };

          // Ignore own messages
          if (msg.sender_id === user.id) return;

          // Verify this conversation involves the current user
          const { data: conv } = await supabase
            .from('conversations')
            .select('user1_id, user2_id')
            .eq('id', msg.conversation_id)
            .single();

          if (!conv) return;
          if (conv.user1_id !== user.id && conv.user2_id !== user.id) return;

          // Fetch sender name
          const { data: sender } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', msg.sender_id)
            .single();

          const senderName = sender?.full_name || sender?.username || 'Korisnik';
          const preview = msg.content.length > 60
            ? msg.content.slice(0, 60) + '…'
            : msg.content;

          const notif: AppNotification = {
            id: `msg_${msg.id}`,
            type: 'message',
            title: 'Nova poruka',
            body: `${senderName}: "${preview}"`,
            icon: 'fa-comment-dots',
            timestamp: Date.now(),
            read: false,
            link: '/messages',
          };

          setNotifications(prev => {
            // Deduplicate
            if (prev.some(n => n.id === notif.id)) return prev;
            const next = [notif, ...prev].slice(0, MAX_NOTIFICATIONS);
            storeNotifications(user.id, next);
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ─────────────────────────────────────────────────

  const markAsRead = useCallback((id: string) => {
    if (!user) return;
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
      storeNotifications(user.id, next);
      return next;
    });
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const markAllAsRead = useCallback(() => {
    if (!user) return;
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      storeNotifications(user.id, next);
      return next;
    });
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const removeNotification = useCallback((id: string) => {
    if (!user) return;
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id);
      storeNotifications(user.id, next);
      return next;
    });
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearAll = useCallback(() => {
    if (!user) return;
    storeNotifications(user.id, []);
    setNotifications([]);
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    if (!user) return;
    setNotifications(prev => {
      const newNotif: AppNotification = {
        ...notif,
        id: `n_${Date.now()}`,
        timestamp: Date.now(),
        read: false,
      };
      const next = [newNotif, ...prev].slice(0, MAX_NOTIFICATIONS);
      storeNotifications(user.id, next);
      return next;
    });
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const unreadCount = notifications.filter(n => !n.read).length;

  return React.createElement(
    NotificationContext.Provider,
    {
      value: {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        addNotification,
      },
    },
    children
  );
}

// ── Hook ──────────────────────────────────────────────────────

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
