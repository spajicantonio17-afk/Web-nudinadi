'use client';

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { useI18n } from '@/lib/i18n';

export default function PartnersPage() {
  const { t } = useI18n();

  const BENEFITS = [
    { icon: 'fa-users',        label: t('partners.benefit1Label'), desc: t('partners.benefit1Desc') },
    { icon: 'fa-location-dot', label: t('partners.benefit2Label'), desc: t('partners.benefit2Desc') },
    { icon: 'fa-chart-line',   label: t('partners.benefit3Label'), desc: t('partners.benefit3Desc') },
    { icon: 'fa-sliders',      label: t('partners.benefit4Label'), desc: t('partners.benefit4Desc') },
  ];

  const WHO_CAN = [
    { icon: 'fa-store',              label: t('partners.who1') },
    { icon: 'fa-car',                label: t('partners.who2') },
    { icon: 'fa-building',           label: t('partners.who3') },
    { icon: 'fa-screwdriver-wrench', label: t('partners.who4') },
    { icon: 'fa-utensils',           label: t('partners.who5') },
    { icon: 'fa-briefcase',          label: t('partners.who6') },
  ];

  return (
    <MainLayout title={t('partners.title')}>
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <i className="fa-solid fa-bullhorn text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-[0.2em]">{t('partners.eyebrow')}</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            {t('partners.heading1')}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">{t('partners.heading2')}</span>
          </h1>
          <div className="w-10 h-[3px] bg-emerald-500 mb-4"></div>
          <p className="text-[13px] text-[var(--c-text2)] leading-relaxed max-w-[560px]">
            {t('partners.desc')}
          </p>
        </div>

        {/* AD FORMATS */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-emerald-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">{t('partners.formatsSection')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-emerald-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-emerald-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-arrow-up-right-dots text-emerald-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">{t('partners.format1Title')}</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">{t('partners.format1Desc')}</p>
            </div>

            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-blue-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-blue-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-rectangle-ad text-blue-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">{t('partners.format2Title')}</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">{t('partners.format2Desc')}</p>
            </div>

            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-purple-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-purple-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-star text-purple-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">{t('partners.format3Title')}</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">{t('partners.format3Desc')}</p>
            </div>

          </div>
        </div>

        {/* WHY NUDINAĐI */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-emerald-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">{t('partners.whySection')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BENEFITS.map((b) => (
              <div key={b.label} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-4 text-center">
                <i className={`fa-solid ${b.icon} text-emerald-400 text-lg mb-2 block`}></i>
                <p className="text-[10px] font-black text-[var(--c-text)] uppercase">{b.label}</p>
                <p className="text-[9px] text-[var(--c-text3)] mt-0.5">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* WHO CAN ADVERTISE */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-emerald-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">{t('partners.whoSection')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {WHO_CAN.map((item) => (
              <div key={item.label} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-4 flex items-center gap-3">
                <i className={`fa-solid ${item.icon} text-[var(--c-text3)] text-sm`}></i>
                <p className="text-[10px] font-bold text-[var(--c-text)]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-8 border-t border-[var(--c-border)]">
          <p className="text-lg font-black text-[var(--c-text)] uppercase tracking-tight mb-2">
            {t('partners.ctaTitle')}
          </p>
          <p className="text-[10px] text-[var(--c-text3)] mb-4 max-w-[400px] mx-auto">{t('partners.ctaDesc')}</p>
          <Link href="/kontakt" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-[6px] text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all">
            <i className="fa-solid fa-paper-plane text-xs"></i>
            {t('partners.ctaButton')}
          </Link>
          <p className="text-[10px] text-[var(--c-text3)] mt-3">
            {t('partners.ctaOr')} <a href="mailto:info@nudinadi.com" className="text-emerald-400 font-bold hover:underline">info@nudinadi.com</a>
          </p>
          <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-[0.3em] mt-2">{t('partners.ctaResponse')}</p>
        </div>

      </div>
    </MainLayout>
  );
}
