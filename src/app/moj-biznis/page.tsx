'use client';

import React, { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import BusinessGate from '@/components/business/BusinessGate';
import OverviewPanel from '@/components/business/OverviewPanel';
import AnalyticsPanel from '@/components/business/AnalyticsPanel';
import BulkUploadPanel from '@/components/business/BulkUploadPanel';
import BusinessProfileEditor from '@/components/BusinessProfileEditor';
import TeamManager from '@/components/TeamManager';
import ProBadge from '@/components/ProBadge';

const TABS = [
  { id: 'pregled', icon: 'fa-gauge', labelKey: 'business.tab.overview' },
  { id: 'analitika', icon: 'fa-chart-line', labelKey: 'business.tab.analytics' },
  { id: 'objave', icon: 'fa-layer-group', labelKey: 'business.tab.listings' },
  { id: 'tim', icon: 'fa-users', labelKey: 'business.tab.team' },
  { id: 'postavke', icon: 'fa-gear', labelKey: 'business.tab.settings' },
] as const;

type TabId = typeof TABS[number]['id'];

function BusinessDashboardContent() {
  const { user, isLoading, refreshProfile } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL is the single source of truth for the active tab (deep links + back button work)
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = TABS.some(tb => tb.id === rawTab) ? (rawTab as TabId) : 'pregled';
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login?redirect=/moj-biznis');
    }
  }, [isLoading, user, router]);

  // The 5 tabs overflow a 375px viewport, so keep the active one visible
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activeTab]);

  const switchTab = (id: TabId) => {
    router.replace(id === 'pregled' ? '/moj-biznis' : `/moj-biznis?tab=${id}`, { scroll: false });
  };

  return (
    <MainLayout title={t('business.dashboard')}>
      <BusinessGate icon="fa-building" title={t('business.dashboard')}>
        {user && (
          <div className="max-w-2xl mx-auto py-6 space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {user.companyLogo ? (
                  <div className="w-10 h-10 rounded-[10px] border border-[var(--c-border)] overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={user.companyLogo} alt={user.companyName || user.username} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-[10px] bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-building text-purple-400 text-sm"></i>
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <h1 className="text-[15px] font-black text-[var(--c-text)] truncate">{user.companyName || user.username}</h1>
                    <ProBadge accountType={user.accountType} />
                  </div>
                  <p className="text-[10px] text-[var(--c-text-muted)] truncate">@{user.username}</p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/user/${user.username}`)}
                aria-label={t('business.viewPublic')}
                className="flex items-center justify-center gap-1.5 px-3 min-w-[44px] min-h-[44px] bg-[var(--c-card)] border border-purple-500/30 rounded-[8px] text-[10px] font-bold text-purple-500 hover:bg-purple-500/10 transition-colors shrink-0"
              >
                <i className="fa-solid fa-eye text-[9px]"></i>
                <span className="hidden sm:inline">{t('business.viewPublic')}</span>
              </button>
            </div>

            {/* Tab Bar — scrolls horizontally on narrow screens; the active tab is
                scrolled into view so deep links (?tab=postavke) don't land off-screen */}
            <div className="flex p-0.5 bg-[var(--c-card)] border border-[var(--c-border)] rounded-[14px] overflow-x-auto scrollbar-subtle">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  ref={activeTab === tab.id ? activeTabRef : undefined}
                  onClick={() => switchTab(tab.id)}
                  className={`flex-1 shrink-0 min-h-[44px] py-2 px-3 rounded-[10px] text-[10px] font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-purple-500/10 text-purple-600 shadow-sm'
                      : 'text-[var(--c-text3)] hover:text-[var(--c-text2)]'
                  }`}
                >
                  <i className={`fa-solid ${tab.icon} text-[9px]`}></i>
                  {t(tab.labelKey)}
                </button>
              ))}
            </div>

            {/* Active Panel */}
            {activeTab === 'pregled' && <OverviewPanel />}
            {activeTab === 'analitika' && <AnalyticsPanel />}
            {activeTab === 'objave' && <BulkUploadPanel />}
            {activeTab === 'tim' && <TeamManager userId={user.id} />}
            {activeTab === 'postavke' && <BusinessProfileEditor user={user} onUpdate={refreshProfile} />}
          </div>
        )}
      </BusinessGate>
    </MainLayout>
  );
}

export default function BusinessDashboardPage() {
  return (
    <Suspense>
      <BusinessDashboardContent />
    </Suspense>
  );
}
