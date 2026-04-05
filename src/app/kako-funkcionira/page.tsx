'use client';

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { useI18n } from '@/lib/i18n';

export default function HowItWorksPage() {
  const { t } = useI18n();

  return (
    <MainLayout title={t('how.title')}>
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] blue-gradient flex items-center justify-center shadow-lg shadow-blue-500/30">
              <i className="fa-solid fa-circle-play text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-blue-400 uppercase tracking-[0.2em]">{t('how.eyebrow')}</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            {t('how.heading1')}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">{t('how.heading2')}</span>
          </h1>
          <div className="w-10 h-[3px] bg-blue-500 mb-4"></div>
          <p className="text-[13px] text-[var(--c-text2)] leading-relaxed max-w-[560px]">
            {t('how.desc')}
          </p>
        </div>

        {/* ZA KUPCE */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-blue-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">{t('how.forBuyers')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {([
              { step: '01', icon: 'fa-magnifying-glass', title: t('how.buyer1Title'), desc: t('how.buyer1Desc') },
              { step: '02', icon: 'fa-wand-magic-sparkles', title: t('how.buyer2Title'), desc: t('how.buyer2Desc') },
              { step: '03', icon: 'fa-comment-dots', title: t('how.buyer3Title'), desc: t('how.buyer3Desc') },
              { step: '04', icon: 'fa-circle-check', title: t('how.buyer4Title'), desc: t('how.buyer4Desc') },
            ] as const).map((item) => (
              <div key={item.step} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-blue-500/40 transition-colors">
                <span className="absolute top-3 right-3 text-[28px] font-black text-[var(--c-border)] leading-none">{item.step}</span>
                <div className="w-10 h-10 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                  <i className={`fa-solid ${item.icon} text-blue-400 text-sm`}></i>
                </div>
                <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">{item.title}</h3>
                <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ZA PRODAVCE */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-emerald-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">{t('how.forSellers')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {([
              { step: '01', icon: 'fa-camera', title: t('how.seller1Title'), desc: t('how.seller1Desc') },
              { step: '02', icon: 'fa-robot', title: t('how.seller2Title'), desc: t('how.seller2Desc') },
              { step: '03', icon: 'fa-rocket', title: t('how.seller3Title'), desc: t('how.seller3Desc') },
              { step: '04', icon: 'fa-hand-holding-dollar', title: t('how.seller4Title'), desc: t('how.seller4Desc') },
            ] as const).map((item) => (
              <div key={item.step} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-emerald-500/40 transition-colors">
                <span className="absolute top-3 right-3 text-[28px] font-black text-[var(--c-border)] leading-none">{item.step}</span>
                <div className="w-10 h-10 rounded-[4px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                  <i className={`fa-solid ${item.icon} text-emerald-400 text-sm`}></i>
                </div>
                <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">{item.title}</h3>
                <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI FUNKCIJE */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-purple-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">{t('how.aiFunctions')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6 relative overflow-hidden hover:border-purple-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-purple-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-magnifying-glass text-purple-400 text-sm"></i>
              </div>
              <h3 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">{t('how.aiSearch')}</h3>
              <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{t('how.aiSearchDesc')}</p>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6 relative overflow-hidden hover:border-blue-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-blue-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-camera text-blue-400 text-sm"></i>
              </div>
              <h3 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">{t('how.aiListing')}</h3>
              <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{t('how.aiListingDesc')}</p>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6 relative overflow-hidden hover:border-emerald-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-emerald-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-shield-halved text-emerald-400 text-sm"></i>
              </div>
              <h3 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">{t('how.aiProtection')}</h3>
              <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{t('how.aiProtectionDesc')}</p>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6 relative overflow-hidden hover:border-orange-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-orange-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-star text-orange-400 text-sm"></i>
              </div>
              <h3 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">{t('how.aiRecommendations')}</h3>
              <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{t('how.aiRecommendationsDesc')}</p>
            </div>
          </div>
        </div>

        {/* SIGURNOST & POVJERENJE */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-emerald-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">{t('how.security')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {([
              { icon: 'fa-user-check', label: t('how.sec1Label'), desc: t('how.sec1Desc') },
              { icon: 'fa-medal',      label: t('how.sec2Label'), desc: t('how.sec2Desc') },
              { icon: 'fa-eye',        label: t('how.sec3Label'), desc: t('how.sec3Desc') },
              { icon: 'fa-lock',       label: t('how.sec4Label'), desc: t('how.sec4Desc') },
            ] as const).map((item) => (
              <div key={item.label} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-4 text-center">
                <i className={`fa-solid ${item.icon} text-emerald-400 text-lg mb-2 block`}></i>
                <p className="text-[10px] font-black text-[var(--c-text)] uppercase">{item.label}</p>
                <p className="text-[9px] text-[var(--c-text3)] mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FEEDBACK SEKTION */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-blue-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">{t('how.yourVoice')}</p>
          </div>
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6 relative overflow-hidden hover:border-blue-500/40 transition-colors">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-[50px]"></div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-comments text-blue-400 text-lg"></i>
              </div>
              <div>
                <h3 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">{t('how.buildTogether')}</h3>
                <p className="text-[11px] text-[var(--c-text3)] leading-relaxed mb-3">
                  {t('how.buildTogetherDesc')}
                </p>
                <Link href="/kontakt" className="inline-flex items-center gap-2 text-[11px] text-blue-500 font-bold hover:underline">
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                  {t('how.sendSuggestion')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM QUOTE */}
        <div className="text-center py-8 border-t border-[var(--c-border)]">
          <p className="text-lg font-black text-[var(--c-text)] uppercase tracking-tight mb-1">
            {t('how.quote')}
          </p>
          <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-[0.3em]">{t('how.quoteSource')}</p>
        </div>

      </div>
    </MainLayout>
  );
}
