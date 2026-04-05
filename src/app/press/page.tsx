'use client';

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { useI18n } from '@/lib/i18n';

export default function PressPage() {
  const { t } = useI18n();

  const PRESS_RELEASES = [
    { date: t('press.pr1Date'), title: t('press.pr1Title'), desc: t('press.pr1Desc'), tag: t('press.pr1Tag') },
    { date: t('press.pr2Date'), title: t('press.pr2Title'), desc: t('press.pr2Desc'), tag: t('press.pr2Tag') },
    { date: t('press.pr3Date'), title: t('press.pr3Title'), desc: t('press.pr3Desc'), tag: t('press.pr3Tag') },
    { date: t('press.pr4Date'), title: t('press.pr4Title'), desc: t('press.pr4Desc'), tag: t('press.pr4Tag') },
  ];

  return (
    <MainLayout title={t('press.title')}>
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <i className="fa-solid fa-newspaper text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-blue-400 uppercase tracking-[0.2em]">{t('press.eyebrow')}</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            {t('press.heading1')}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">{t('press.heading2')}</span>
          </h1>
          <div className="w-10 h-[3px] bg-blue-500 mb-4"></div>
          <p className="text-[13px] text-[var(--c-text2)] leading-relaxed max-w-[560px]">
            {t('press.desc')}
          </p>
        </div>

        {/* MEDIA KIT */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-blue-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">{t('press.mediaKitSection')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 flex items-center gap-4 hover:border-blue-500/40 transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-images text-blue-400 text-lg"></i>
              </div>
              <div>
                <h3 className="text-[11px] font-black text-[var(--c-text)] group-hover:text-blue-500 transition-colors">{t('press.kit1Title')}</h3>
                <p className="text-[9px] text-[var(--c-text3)]">{t('press.kit1Desc')}</p>
              </div>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 flex items-center gap-4 hover:border-blue-500/40 transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-[4px] bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-palette text-purple-400 text-lg"></i>
              </div>
              <div>
                <h3 className="text-[11px] font-black text-[var(--c-text)] group-hover:text-purple-500 transition-colors">{t('press.kit2Title')}</h3>
                <p className="text-[9px] text-[var(--c-text3)]">{t('press.kit2Desc')}</p>
              </div>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 flex items-center gap-4 hover:border-blue-500/40 transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-[4px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-chart-bar text-emerald-400 text-lg"></i>
              </div>
              <div>
                <h3 className="text-[11px] font-black text-[var(--c-text)] group-hover:text-emerald-500 transition-colors">{t('press.kit3Title')}</h3>
                <p className="text-[9px] text-[var(--c-text3)]">{t('press.kit3Desc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* PRESS RELEASES */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-blue-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">{t('press.releasesSection')}</p>
          </div>
          <div className="space-y-3">
            {PRESS_RELEASES.map((pr) => (
              <div key={pr.title} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 hover:border-blue-500/40 transition-colors cursor-pointer group">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] text-[var(--c-text3)]">{pr.date}</span>
                      <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-[4px] text-[8px] font-bold text-blue-500 uppercase">{pr.tag}</span>
                    </div>
                    <h3 className="text-[13px] font-black text-[var(--c-text)] group-hover:text-blue-500 transition-colors mb-1">{pr.title}</h3>
                    <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">{pr.desc}</p>
                  </div>
                  <i className="fa-solid fa-arrow-right text-[var(--c-text3)] text-xs mt-2 group-hover:text-blue-500 transition-colors shrink-0"></i>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONTACT CTA */}
        <div className="text-center py-8 border-t border-[var(--c-border)]">
          <p className="text-lg font-black text-[var(--c-text)] uppercase tracking-tight mb-2">
            {t('press.ctaTitle')}
          </p>
          <Link href="/kontakt" className="inline-flex items-center gap-2 text-[11px] text-blue-500 font-bold hover:underline mb-1">
            <i className="fa-solid fa-paper-plane text-xs"></i>
            {t('press.ctaContact')}
          </Link>
          <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-[0.3em]">{t('press.ctaResponse')}</p>
        </div>
      </div>
    </MainLayout>
  );
}
