'use client';

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { useI18n } from '@/lib/i18n';

export default function ImpressumPage() {
  const { t } = useI18n();

  return (
    <MainLayout title={t('imprint.title')}>
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center shadow-lg shadow-gray-500/30">
              <i className="fa-solid fa-building-columns text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-[var(--c-text-muted)] uppercase tracking-[0.2em]">{t('imprint.eyebrow')}</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            {t('imprint.heading')}
          </h1>
          <div className="w-10 h-[3px] bg-[var(--c-text-muted)] mb-4"></div>
        </div>

        {/* CONTENT */}
        <div className="space-y-8">

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-4">{t('imprint.operatorTitle')}</h2>
            <div className="space-y-3 text-[11px] text-[var(--c-text3)] leading-relaxed">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-building text-[var(--c-text3)] text-xs mt-0.5 w-4 text-center"></i>
                <div>
                  <p className="font-bold text-[var(--c-text)]">NudiNađi</p>
                  <p className="text-[10px] text-[var(--c-text3)] italic">{t('imprint.companyStatus')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-envelope text-[var(--c-text3)] text-xs mt-0.5 w-4 text-center"></i>
                <div>
                  <p className="font-bold text-[var(--c-text)]">info@nudinadi.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-globe text-[var(--c-text3)] text-xs mt-0.5 w-4 text-center"></i>
                <div>
                  <p className="font-bold text-[var(--c-text)]">nudinadi.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-4">{t('imprint.responsibleTitle')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{t('imprint.responsibleBody')}</p>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-4">{t('imprint.contactTitle')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed mb-3">{t('imprint.contactBody')}</p>
            <div className="space-y-2 text-[11px] text-[var(--c-text3)]">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-envelope text-[var(--c-text3)] text-xs w-4 text-center"></i>
                <a href="mailto:info@nudinadi.com" className="text-blue-500 font-bold hover:underline">info@nudinadi.com</a>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-paper-plane text-[var(--c-text3)] text-xs w-4 text-center"></i>
                <Link href="/kontakt" className="text-blue-500 font-bold hover:underline">{t('imprint.contactFormLabel')}</Link>
              </div>
            </div>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-4">{t('imprint.disclaimerTitle')}</h2>
            <div className="space-y-3 text-[11px] text-[var(--c-text3)] leading-relaxed">
              <p>{t('imprint.disclaimerP1')}</p>
              <p>{t('imprint.disclaimerP2')}</p>
            </div>
          </div>

          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-4">{t('imprint.copyrightTitle')}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{t('imprint.copyrightBody')}</p>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="text-center py-8 border-t border-[var(--c-border)] mt-10">
          <p className="text-[10px] text-[var(--c-text3)] mb-3">{t('imprint.lastUpdated')}</p>
          <Link href="/kontakt" className="inline-flex items-center gap-2 text-[11px] text-blue-500 font-bold hover:underline">
            <i className="fa-solid fa-paper-plane text-xs"></i>
            {t('imprint.contactLink')}
          </Link>
        </div>

      </div>
    </MainLayout>
  );
}
