'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { isBusiness } from '@/lib/plans';

interface Props {
  icon: string;
  title: string;
  children: React.ReactNode;
}

export default function BusinessGate({ icon, title, children }: Props) {
  const { user, isLoading } = useAuth();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <i className="fa-solid fa-spinner animate-spin text-[var(--c-text-muted)] text-lg"></i>
      </div>
    );
  }

  if (!isBusiness(user?.accountType)) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="w-14 h-14 rounded-[14px] bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
          <i className={`fa-solid ${icon} text-purple-400 text-xl`}></i>
        </div>
        <h2 className="text-lg font-black text-[var(--c-text)] mb-2">{title}</h2>
        <p className="text-[11px] text-[var(--c-text3)] mb-6">{t('business.onlyBusiness')}</p>
        <Link href="/planovi" className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500 text-white rounded-[8px] text-[11px] font-bold hover:bg-purple-600 transition-colors">
          <i className="fa-solid fa-gem text-xs"></i> {t('business.upgradeHint')}
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
