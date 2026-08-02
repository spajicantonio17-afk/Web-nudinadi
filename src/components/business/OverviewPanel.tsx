'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { getPlanLimits, isBusiness } from '@/lib/plans';
import { getBusinessStats } from '@/services/businessService';
import ProBadge from '@/components/ProBadge';

export default function OverviewPanel() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [stats, setStats] = useState<{ totalViews30d: number; totalFavorites30d: number; activeListings: number; soldItems30d: number } | null>(null);

  useEffect(() => {
    if (!user?.id || !isBusiness(user?.accountType)) return;
    getBusinessStats(user.id).then(setStats).catch(() => {});
  }, [user?.id, user?.accountType]);

  if (!user) return null;

  const limits = getPlanLimits(user.accountType);

  const statCards = [
    { icon: 'fa-eye', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', value: stats?.totalViews30d, label: t('analytics.totalViews') },
    { icon: 'fa-heart', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', value: stats?.totalFavorites30d, label: t('analytics.totalFavorites') },
    { icon: 'fa-box-open', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', value: stats?.activeListings, label: t('analytics.activeListings') },
    { icon: 'fa-check-circle', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', value: stats?.soldItems30d, label: t('analytics.sold30d') },
  ];

  return (
    <div className="space-y-4">

      {/* Company Identity Card */}
      <div className="bg-[var(--c-card)] border border-purple-500/20 rounded-[14px] p-5">
        <div className="flex items-center gap-4">
          {user.companyLogo ? (
            <div className="w-16 h-16 rounded-[12px] border-2 border-[var(--c-border)] overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.companyLogo} alt={user.companyName || user.username} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-[12px] bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-building text-purple-400 text-xl"></i>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h2 className="text-[16px] font-black text-[var(--c-text)] truncate max-w-full">{user.companyName || user.username}</h2>
              <ProBadge accountType={user.accountType} />
              {user.businessVerified && (
                <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-[3px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                  <i className="fa-solid fa-circle-check text-[7px]"></i> {t('business.verified')}
                </span>
              )}
            </div>
            <p className="text-[10px] text-[var(--c-text-muted)] mt-0.5">@{user.username}</p>
            {user.businessCategory && (
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[9px] font-bold text-purple-500">
                {user.businessCategory}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(card => (
          <div key={card.label} className={`${card.bg} border rounded-[4px] p-4 flex flex-col items-center gap-1 text-center`}>
            <i className={`fa-solid ${card.icon} ${card.color} text-sm`}></i>
            <span className="text-2xl font-black text-[var(--c-text)] leading-none">
              {stats ? (card.value ?? 0).toLocaleString() : '–'}
            </span>
            <span className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-wider">{card.label}</span>
          </div>
        ))}
      </div>

      {/* Promoted Credits */}
      <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[14px] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-[var(--c-text3)]">
          <i className="fa-solid fa-rocket text-amber-400 text-xs"></i>
          <span>{t('business.credits')}: <span className="font-bold text-[var(--c-text)]">{user.promotedCredits ?? 0} / {limits.promotedCreditsPerMonth}</span></span>
        </div>
        <Link href="/krediti" className="text-[10px] font-bold text-purple-500 hover:text-purple-600 transition-colors">
          <i className="fa-solid fa-plus text-[8px] mr-1"></i>{t('credits.buyCredits')}
        </Link>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/profile" className="flex items-center gap-2 bg-[var(--c-card)] border border-[var(--c-border)] rounded-[10px] px-4 py-3 text-[11px] font-bold text-[var(--c-text)] hover:border-purple-500/40 transition-colors">
          <i className="fa-solid fa-user text-purple-400 text-xs"></i> {t('business.personalProfile')}
        </Link>
        <Link href="/planovi" className="flex items-center gap-2 bg-[var(--c-card)] border border-[var(--c-border)] rounded-[10px] px-4 py-3 text-[11px] font-bold text-[var(--c-text)] hover:border-purple-500/40 transition-colors">
          <i className="fa-solid fa-gem text-purple-400 text-xs"></i> {t('business.plans')}
        </Link>
      </div>
    </div>
  );
}
