'use client';

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { useI18n } from '@/lib/i18n';

export default function PrivacyPage() {
  const { t } = useI18n();

  return (
    <MainLayout title={t('privacy.title')}>
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <i className="fa-solid fa-lock text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-[0.2em]">{t('privacy.eyebrow')}</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            {t('privacy.heading1')}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">{t('privacy.heading2')}</span>
          </h1>
          <div className="w-10 h-[3px] bg-emerald-500 mb-4"></div>
        </div>

        {/* CONTENT */}
        <div className="space-y-8">

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('privacy.s1Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{t('privacy.s1Body')}</p>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('privacy.s2Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{t('privacy.s2Body')}</p>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('privacy.s3Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{t('privacy.s3Body')}</p>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('privacy.s4Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{t('privacy.s4Body')}</p>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('privacy.s5Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
              {t('privacy.s5Pre')} <Link href="/kontakt" className="text-emerald-400 font-bold hover:underline">{t('privacy.s5LinkText')}</Link>{t('privacy.s5Post')}
            </p>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('privacy.s6Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{t('privacy.s6Body')}</p>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('privacy.s7Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
              {t('privacy.s7Pre')} <Link href="/kolacici" className="text-emerald-400 font-bold hover:underline">{t('privacy.s7LinkText')}</Link> {t('privacy.s7Post')}
            </p>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('privacy.s8Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
              {t('privacy.s8Pre')} <Link href="/kontakt" className="text-emerald-400 font-bold hover:underline">{t('privacy.s8LinkText')}</Link>{t('privacy.s8Post')}
            </p>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('privacy.s9Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{t('privacy.s9Body')}</p>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('privacy.s10Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
              {t('privacy.s10Pre')} <Link href="/kontakt" className="text-emerald-400 font-bold hover:underline">{t('privacy.s10LinkText')}</Link>{t('privacy.s10Post')}
            </p>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('privacy.s11Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{t('privacy.s11Body')}</p>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('privacy.s12Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{t('privacy.s12Body')}</p>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="text-center py-8 mt-8 border-t border-[var(--c-border)]">
          <p className="text-[10px] text-[var(--c-text3)]">{t('privacy.bottomContact')} <Link href="/kontakt" className="text-emerald-400 font-bold hover:underline">{t('privacy.bottomContactLink')}</Link></p>
          <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-[0.3em] mt-2">{t('privacy.bottomPlatform')}</p>
        </div>
      </div>
    </MainLayout>
  );
}
