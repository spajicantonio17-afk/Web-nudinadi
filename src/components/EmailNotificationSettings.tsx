'use client';

import React, { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import { isBusiness } from '@/lib/plans';
import type { AuthUser } from '@/lib/auth';

interface Props {
  user: AuthUser;
}

interface Prefs {
  email_notif_messages: boolean;
  email_notif_sold: boolean;
  email_notif_follower: boolean;
  email_notif_favorite: boolean;
}

export default function EmailNotificationSettings({ user }: Props) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({
    email_notif_messages: true,
    email_notif_sold: true,
    email_notif_follower: true,
    email_notif_favorite: true,
  });

  useEffect(() => {
    const supabase = getSupabase();
    supabase
      .from('profiles')
      .select('email_notif_messages, email_notif_sold, email_notif_follower, email_notif_favorite')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setPrefs({
            email_notif_messages: data.email_notif_messages ?? true,
            email_notif_sold: data.email_notif_sold ?? true,
            email_notif_follower: data.email_notif_follower ?? true,
            email_notif_favorite: data.email_notif_favorite ?? true,
          });
        }
      });
  }, [user.id]);

  const toggle = async (key: keyof Prefs) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    setSaving(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('profiles')
        .update({ [key]: newPrefs[key] })
        .eq('id', user.id);
      if (error) throw error;
    } catch {
      setPrefs(prefs); // revert on error
      showToast('Greška pri snimanju', 'error');
    } finally {
      setSaving(false);
    }
  };

  const items: { key: keyof Prefs; label: string; desc: string; businessOnly?: boolean }[] = [
    { key: 'email_notif_messages', label: 'Nove poruke', desc: 'Email kada dobijete novu poruku' },
    { key: 'email_notif_sold', label: 'Artikal prodan', desc: 'Email kada se vaš artikal proda' },
    { key: 'email_notif_favorite', label: 'Novi lajk', desc: 'Email kada neko lajka vaš oglas' },
    { key: 'email_notif_follower', label: 'Novi pratilac', desc: 'Email kada vas neko počne pratiti', businessOnly: true },
  ];

  const visibleItems = items.filter(i => !i.businessOnly || isBusiness(user.accountType));

  return (
    <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[14px] p-5 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <i className="fa-solid fa-envelope text-blue-400 text-sm"></i>
        <h3 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide">Email obavještenja</h3>
        {saving && <i className="fa-solid fa-spinner animate-spin text-[10px] text-[var(--c-text3)] ml-auto"></i>}
      </div>

      {visibleItems.map(item => (
        <div key={item.key} className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold text-[var(--c-text)]">{item.label}</p>
            <p className="text-[10px] text-[var(--c-text3)]">{item.desc}</p>
          </div>
          <button
            onClick={() => toggle(item.key)}
            disabled={saving}
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 ${
              prefs[item.key] ? 'bg-blue-500' : 'bg-[var(--c-border)]'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                prefs[item.key] ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      ))}

      <p className="text-[10px] text-[var(--c-text3)] pt-1">
        Emailovi se šalju na: <span className="font-semibold text-[var(--c-text2)]">{user.email}</span>
      </p>
    </div>
  );
}