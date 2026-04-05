'use client';

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { useI18n } from '@/lib/i18n';

export default function TermsPage() {
  const { t } = useI18n();

  return (
    <MainLayout title={t('terms.title')}>
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center shadow-lg shadow-gray-500/30">
              <i className="fa-solid fa-file-contract text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-[var(--c-text-muted)] uppercase tracking-[0.2em]">{t('terms.eyebrow')}</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            {t('terms.heading1')}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600">{t('terms.heading2')}</span>
          </h1>
          <div className="w-10 h-[3px] bg-[var(--c-text-muted)] mb-4"></div>
        </div>

        {/* CONTENT */}
        <div className="space-y-8">

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('terms.s1Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{t('terms.s1Body')}</p>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('terms.s2Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{t('terms.s2Body')}</p>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('terms.s3Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed mb-3">{t('terms.s3Intro')}</p>
            <ul className="text-[11px] text-[var(--c-text3)] leading-relaxed list-disc list-inside space-y-1">
              {([1,2,3,4,5,6,7,8,9,10] as const).map((n) => (
                <li key={n}>{t(`terms.s3Item${n}` as Parameters<typeof t>[0])}</li>
              ))}
            </ul>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('terms.s4Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{t('terms.s4Body')}</p>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('terms.s5Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{t('terms.s5Body')}</p>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('terms.s6Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
              {t('terms.s6Pre')} <Link href="/privatnost" className="text-blue-500 font-bold hover:underline">{t('terms.s6LinkText')}</Link>{t('terms.s6Post')}
            </p>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('terms.s7Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{t('terms.s7Body')}</p>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('terms.s8Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{t('terms.s8Body')}</p>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('terms.s9Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed mb-3">{t('terms.s9Intro')}</p>
            <ul className="text-[11px] text-[var(--c-text3)] leading-relaxed list-disc list-inside space-y-1">
              {([1,2,3,4] as const).map((n) => (
                <li key={n}>{t(`terms.s9Item${n}` as Parameters<typeof t>[0])}</li>
              ))}
            </ul>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed mt-3">{t('terms.s9Post')}</p>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('terms.s10Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed mb-3">{t('terms.s10Intro')}</p>
            <ul className="text-[11px] text-[var(--c-text3)] leading-relaxed list-disc list-inside space-y-1">
              <li><strong>{t('terms.s10Item1Pre')}</strong> {t('terms.s10Item1Post')}</li>
              <li><strong>{t('terms.s10Item2Pre')}</strong> {t('terms.s10Item2Post')}</li>
              <li><strong>{t('terms.s10Item3Pre')}</strong> {t('terms.s10Item3Post')}</li>
            </ul>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed mt-3">{t('terms.s10Post')}</p>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('terms.s11Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
              {t('terms.s11Pre')} <Link href="/kontakt" className="text-blue-500 font-bold hover:underline">{t('terms.s11LinkText')}</Link>{t('terms.s11Post')}
            </p>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{t('terms.s12Title')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{t('terms.s12Body')}</p>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="text-center py-8 mt-8 border-t border-[var(--c-border)]">
          <p className="text-[10px] text-[var(--c-text3)]">{t('terms.bottomContact')} <Link href="/kontakt" className="text-blue-500 font-bold hover:underline">{t('terms.bottomContactLink')}</Link></p>
          <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-[0.3em] mt-2">{t('terms.bottomPlatform')}</p>
        </div>
      </div>
    </MainLayout>
  );
}
