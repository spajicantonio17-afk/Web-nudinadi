'use client';

import { useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { useI18n } from '@/lib/i18n';

export default function SecurityPage() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const SAFETY_TIPS = [
    { icon: 'fa-money-bill-wave', title: t('security.tip1Title'), text: t('security.tip1Text') },
    { icon: 'fa-comments',        title: t('security.tip2Title'), text: t('security.tip2Text') },
    { icon: 'fa-star',            title: t('security.tip3Title'), text: t('security.tip3Text') },
    { icon: 'fa-flag',            title: t('security.tip4Title'), text: t('security.tip4Text') },
    { icon: 'fa-map-pin',         title: t('security.tip5Title'), text: t('security.tip5Text') },
    { icon: 'fa-box-open',        title: t('security.tip6Title'), text: t('security.tip6Text') },
    { icon: 'fa-tag',             title: t('security.tip7Title'), text: t('security.tip7Text') },
    { icon: 'fa-ticket',          title: t('security.tip8Title'), text: t('security.tip8Text') },
  ];

  const REPORT_STEPS = [
    { icon: 'fa-flag',       title: t('security.step1Title'), text: t('security.step1Text') },
    { icon: 'fa-list-check', title: t('security.step2Title'), text: t('security.step2Text') },
    { icon: 'fa-clock',      title: t('security.step3Title'), text: t('security.step3Text') },
  ];

  return (
    <MainLayout title={t('security.title')}>
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <i className="fa-solid fa-shield-halved text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-blue-400 uppercase tracking-[0.2em]">{t('security.eyebrow')}</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            {t('security.heading1')}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-500">{t('security.heading2')}</span>
          </h1>
          <div className="w-10 h-[3px] bg-emerald-500 mb-4"></div>
          <p className="text-[13px] text-[var(--c-text2)] leading-relaxed max-w-[560px]">
            {t('security.desc')}
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { value: '24/7',     labelKey: 'security.stat1Label', icon: 'fa-eye' },
            { value: '3',        labelKey: 'security.stat2Label', icon: 'fa-layer-group' },
            { value: '256-bit',  labelKey: 'security.stat3Label', icon: 'fa-lock' },
            { value: t('common.off') === 'Off' ? 'Free' : 'Besplatno', labelKey: 'security.stat4Label', icon: 'fa-heart' },
          ].map((stat) => (
            <div key={stat.labelKey} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5">
              <i className={`fa-solid ${stat.icon} text-[var(--c-text3)] text-lg mb-3 block`}></i>
              <p className="text-2xl font-black text-[var(--c-text)] leading-none mb-1">{stat.value}</p>
              <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-widest">{t(stat.labelKey as Parameters<typeof t>[0])}</p>
            </div>
          ))}
        </div>

        {/* AI PROTECTION */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-emerald-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">{t('security.aiSection')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-blue-500/40 transition-colors flex flex-col">
              <div className="absolute top-0 right-0 w-14 h-14 bg-blue-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-user-shield text-blue-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">{t('security.ai1Title')}</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">{t('security.ai1Desc')}</p>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-emerald-500/40 transition-colors flex flex-col">
              <div className="absolute top-0 right-0 w-14 h-14 bg-emerald-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-fingerprint text-emerald-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">{t('security.ai2Title')}</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">{t('security.ai2Desc')}</p>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-purple-500/40 transition-colors flex flex-col">
              <div className="absolute top-0 right-0 w-14 h-14 bg-purple-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-comment-slash text-purple-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">{t('security.ai3Title')}</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">{t('security.ai3Desc')}</p>
            </div>
          </div>
        </div>

        {/* SAFETY TIPS — ACCORDION */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-emerald-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">{t('security.tipsSection')}</p>
          </div>
          <div className="space-y-2">
            {SAFETY_TIPS.map((tip, i) => (
              <div key={i} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] overflow-hidden hover:border-emerald-500/40 transition-colors">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[4px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <i className={`fa-solid ${tip.icon} text-emerald-400 text-[11px]`}></i>
                    </div>
                    <span className="text-[12px] font-bold text-[var(--c-text)]">{tip.title}</span>
                  </div>
                  <i className={`fa-solid fa-chevron-down text-[var(--c-text3)] text-[10px] transition-transform ${openIndex === i ? 'rotate-180' : ''}`}></i>
                </button>
                {openIndex === i && (
                  <div className="px-4 pb-4 pt-0 border-t border-[var(--c-border)]">
                    <p className="text-[11px] text-[var(--c-text3)] leading-relaxed pt-3">{tip.text}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* REPORT STEPS */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-emerald-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">{t('security.reportSection')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {REPORT_STEPS.map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 text-center h-full">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                    <span className="text-[13px] font-black text-emerald-400">{i + 1}</span>
                  </div>
                  <div className="w-9 h-9 rounded-[4px] bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                    <i className={`fa-solid ${step.icon} text-emerald-400 text-sm`}></i>
                  </div>
                  <h4 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">{step.title}</h4>
                  <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">{step.text}</p>
                </div>
                {i < REPORT_STEPS.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-[11px] -translate-y-1/2 z-10">
                    <i className="fa-solid fa-chevron-right text-emerald-500/50 text-[10px]"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PRIVACY HINT */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-[12px] px-4 py-3 mb-6 flex items-center gap-2.5">
          <i className="fa-solid fa-lock text-emerald-500 text-sm shrink-0"></i>
          <p className="text-[11px] text-[var(--c-text2)] leading-relaxed">
            {t('security.privacyHintPre')} <Link href="/privatnost" className="text-emerald-500 font-bold hover:underline">{t('security.privacyHintLink')}</Link> {t('security.privacyHintPost')}
          </p>
        </div>

        {/* REPORT CTA */}
        <div className="text-center py-8 border-t border-[var(--c-border)]">
          <p className="text-lg font-black text-[var(--c-text)] uppercase tracking-tight mb-2">
            {t('security.ctaTitle')}
          </p>
          <p className="text-[10px] text-[var(--c-text3)] mb-4">{t('security.ctaDesc')}</p>
          <Link href="/kontakt" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-[6px] text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transition-all">
            <i className="fa-solid fa-shield-halved text-xs"></i>
            {t('security.ctaButton')}
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
