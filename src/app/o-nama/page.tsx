'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useI18n } from '@/lib/i18n';

export default function AboutPage() {
  const { t } = useI18n();

  return (
    <MainLayout title={t('about.title')}>
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] blue-gradient flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="font-black text-white italic text-base">N</span>
            </div>
            <div>
              <p className="text-[8px] font-bold text-blue-400 uppercase tracking-[0.2em]">{t('about.eyebrow')}</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            {t('about.heading1')}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">{t('about.heading2')}</span>
          </h1>
          <div className="w-10 h-[3px] bg-blue-500 mb-4"></div>
          <p className="text-[13px] text-[var(--c-text2)] leading-relaxed max-w-[560px]">
            {t('about.desc')}
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { value: '2024', label: t('about.stat.year'), icon: 'fa-calendar' },
            { value: t('about.stat.region'), label: t('about.stat.availability'), icon: 'fa-globe' },
            { value: 'AI', label: 'Powered', icon: 'fa-brain' },
            { value: '24/7', label: t('about.stat.support'), icon: 'fa-clock' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5">
              <i className={`fa-solid ${stat.icon} text-[var(--c-text3)] text-lg mb-3 block`}></i>
              <p className="text-2xl font-black text-[var(--c-text)] leading-none mb-1">{stat.value}</p>
              <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* SECTION: MISIJA */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-blue-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">{t('about.mission')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6 relative overflow-hidden hover:border-blue-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-blue-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-bullseye text-blue-400 text-sm"></i>
              </div>
              <h3 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">{t('about.vision')}</h3>
              <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
                {t('about.visionDesc')}
              </p>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6 relative overflow-hidden hover:border-purple-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-purple-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-heart text-purple-400 text-sm"></i>
              </div>
              <h3 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">{t('about.values')}</h3>
              <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
                {t('about.valuesDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION: ŠTA NAS RAZLIKUJE */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-blue-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">{t('about.whatSetsUs')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-blue-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-blue-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-wand-magic-sparkles text-blue-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">{t('about.aiSearch')}</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">{t('about.aiSearchDesc')}</p>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-emerald-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-emerald-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-shield-halved text-emerald-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">{t('about.aiProtection')}</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">{t('about.aiProtectionDesc')}</p>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-orange-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-orange-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-file-import text-orange-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">{t('about.aiImport')}</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">{t('about.aiImportDesc')}</p>
            </div>
          </div>
        </div>

        {/* BOTTOM QUOTE */}
        <div className="text-center py-8 border-t border-[var(--c-border)]">
          <p className="text-lg font-black text-[var(--c-text)] uppercase tracking-tight mb-1">
            {t('about.quote')}
          </p>
          <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-[0.3em]">{t('about.quoteSource')}</p>
        </div>
      </div>
    </MainLayout>
  );
}
