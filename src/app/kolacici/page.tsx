'use client';

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { useI18n } from '@/lib/i18n';

export default function CookiesPage() {
  const { t } = useI18n();

  const COOKIE_TYPES = [
    {
      nameKey: 'cookies.type1Name' as const,
      required: true,
      icon: 'fa-shield-halved',
      color: 'emerald',
      descKey: 'cookies.type1Desc' as const,
      examplesKey: 'cookies.type1Examples' as const,
    },
    {
      nameKey: 'cookies.type2Name' as const,
      required: false,
      icon: 'fa-chart-line',
      color: 'blue',
      descKey: 'cookies.type2Desc' as const,
      examplesKey: 'cookies.type2Examples' as const,
    },
    {
      nameKey: 'cookies.type3Name' as const,
      required: false,
      icon: 'fa-sliders',
      color: 'purple',
      descKey: 'cookies.type3Desc' as const,
      examplesKey: 'cookies.type3Examples' as const,
    },
    {
      nameKey: 'cookies.type4Name' as const,
      required: false,
      icon: 'fa-bullhorn',
      color: 'orange',
      descKey: 'cookies.type4Desc' as const,
      examplesKey: 'cookies.type4Examples' as const,
    },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; accent: string }> = {
    emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400', accent: 'border-emerald-500/40' },
    blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400', accent: 'border-blue-500/40' },
    purple: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400', accent: 'border-purple-500/40' },
    orange: { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400', accent: 'border-orange-500/40' },
  };

  const MANAGE_ITEMS = [
    t('cookies.manageItem1'),
    t('cookies.manageItem2'),
    t('cookies.manageItem3'),
  ];

  return (
    <MainLayout title={t('cookies.title')}>
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <i className="fa-solid fa-cookie-bite text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-orange-400 uppercase tracking-[0.2em]">{t('cookies.eyebrow')}</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            {t('cookies.heading1')}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">{t('cookies.heading2')}</span>
          </h1>
          <div className="w-10 h-[3px] bg-orange-500 mb-4"></div>
          <p className="text-[11px] text-[var(--c-text3)]">{t('cookies.lastUpdated')}</p>
        </div>

        {/* WHAT ARE COOKIES */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-orange-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">{t('cookies.whatSection')}</p>
          </div>
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{t('cookies.whatBody')}</p>
          </div>
        </div>

        {/* COOKIE TYPES */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-orange-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">{t('cookies.typesSection')}</p>
          </div>
          <div className="space-y-3">
            {COOKIE_TYPES.map((cookie) => {
              const c = colorMap[cookie.color];
              return (
                <div key={cookie.nameKey} className={`bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 hover:${c.accent} transition-colors relative overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-14 h-14 ${c.bg} rounded-bl-[35px]`}></div>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-[4px] ${c.bg} ${c.border} border flex items-center justify-center shrink-0`}>
                      <i className={`fa-solid ${cookie.icon} ${c.text} text-sm`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[12px] font-black text-[var(--c-text)]">{t(cookie.nameKey)}</h3>
                        {cookie.required && (
                          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-[4px] text-[8px] font-bold text-emerald-500 uppercase">{t('cookies.type1Required')}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-[var(--c-text3)] leading-relaxed mb-2">{t(cookie.descKey)}</p>
                      <p className="text-[9px] text-[var(--c-text3)]"><span className="font-bold text-[var(--c-text)]">{t('cookies.examplesLabel')}</span> {t(cookie.examplesKey)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* HOW TO MANAGE */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-orange-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">{t('cookies.manageSection')}</p>
          </div>
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed mb-3">{t('cookies.manageIntro')}</p>
            <ul className="space-y-2">
              {MANAGE_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[10px] text-[var(--c-text3)]">
                  <i className="fa-solid fa-check text-orange-400 text-[8px] mt-1 shrink-0"></i>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="text-center py-8 border-t border-[var(--c-border)]">
          <p className="text-[10px] text-[var(--c-text3)]">{t('cookies.bottomContact')} <Link href="/kontakt" className="text-orange-400 font-bold hover:underline">{t('cookies.bottomContactLink')}</Link></p>
          <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-[0.3em] mt-2">{t('cookies.bottomPlatform')}</p>
        </div>
      </div>
    </MainLayout>
  );
}
