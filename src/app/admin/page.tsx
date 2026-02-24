'use client';

import React, { useState, Suspense } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAdmin } from '@/hooks/useAdmin';
import StatsOverview from '@/components/admin/StatsOverview';
import ReportQueue from '@/components/admin/ReportQueue';
import UserManagement from '@/components/admin/UserManagement';
import AiModerationTab from '@/components/admin/AiModerationTab';

const TABS = [
  { key: 'stats', label: 'Pregled', icon: 'fa-chart-line' },
  { key: 'queue', label: 'Red za pregled', icon: 'fa-shield-halved' },
  { key: 'users', label: 'Korisnici', icon: 'fa-users' },
  { key: 'ai', label: 'AI Moderacija', icon: 'fa-robot' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

function AdminDashboardContent() {
  const { user, isAdmin, isLoading } = useAdmin();
  const [activeTab, setActiveTab] = useState<TabKey>('stats');

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <i className="fa-solid fa-spinner fa-spin text-3xl text-blue-500 mb-3 block" />
            <p className="text-[var(--c-text2)] text-sm">Provjera pristupa...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin || !user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <i className="fa-solid fa-lock text-4xl text-[var(--c-text-muted)] mb-3 block" />
            <p className="text-[var(--c-text2)]">Nemate pristup ovoj stranici.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto pb-32">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--c-text)]">
            <i className="fa-solid fa-shield-halved text-blue-500 mr-2" />
            Moderacija
          </h1>
          <p className="text-sm text-[var(--c-text2)] mt-1">Upravljanje prijavama, korisnicima i AI moderacijom</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-[var(--c-card-alt)] rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-[var(--c-card)] text-[var(--c-text)] shadow-sm'
                  : 'text-[var(--c-text2)] hover:text-[var(--c-text)]'
              }`}
            >
              <i className={`fa-solid ${tab.icon} text-xs`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'stats' && <StatsOverview />}
        {activeTab === 'queue' && <ReportQueue />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'ai' && <AiModerationTab />}
      </div>
    </MainLayout>
  );
}

export default function AdminPage() {
  return (
    <Suspense>
      <AdminDashboardContent />
    </Suspense>
  );
}
