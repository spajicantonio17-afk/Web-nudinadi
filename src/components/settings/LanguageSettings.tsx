'use client';

import React from 'react';
import { useI18n, type Locale } from '@/lib/i18n';
import { LANGUAGES, setLanguagePreference, type LanguageCode } from '@/lib/language';

// Only show Bosanski and English in settings
const AVAILABLE_LANGUAGES = LANGUAGES.filter(l => l.code !== 'de');

export default function LanguageSettings() {
  const { locale, setLocale } = useI18n();

  const handleLanguageChange = (code: LanguageCode) => {
    setLocale(code as Locale);
    setLanguagePreference(code);
  };

  const currentLang = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];

  return (
    <div className="space-y-6">

      {/* ── Hero Header ── */}
      <div className="bg-blue-500/5 border border-blue-500/15 rounded-[22px] p-6 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-blue-500/8 rounded-full blur-[30px]" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-indigo-500/5 rounded-full blur-[25px]" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-[14px] blue-gradient flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <i className="fa-solid fa-globe text-lg"></i>
          </div>
          <div>
            <h3 className="text-lg font-black text-[var(--c-text)]">Jezik aplikacije</h3>
            <p className="text-[11px] text-[var(--c-text3)]">Odaberi na kojem jeziku želiš koristiti NudiNađi</p>
          </div>
        </div>
      </div>

      {/* ── Language Options ── */}
      <section>
        <h2 className="text-[11px] font-black uppercase tracking-[2px] text-[var(--c-text3)] mb-3 px-2">
          Dostupni jezici
        </h2>
        <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] p-1 overflow-hidden">
          {AVAILABLE_LANGUAGES.map((lang, idx) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`
                w-full flex items-center gap-3.5 px-4 py-3.5 transition-all text-left
                ${idx < AVAILABLE_LANGUAGES.length - 1 ? 'border-b border-[var(--c-border)]' : ''}
                ${locale === lang.code ? 'bg-blue-500/8' : 'hover:bg-[var(--c-hover)]'}
              `}
            >
              <span className="text-2xl w-8 text-center flex-shrink-0">{lang.flag}</span>
              <div className="flex-1 min-w-0">
                <h4 className={`text-[14px] font-bold ${locale === lang.code ? 'text-blue-500' : 'text-[var(--c-text)]'}`}>
                  {lang.nativeLabel}
                </h4>
                {lang.label !== lang.nativeLabel && (
                  <p className="text-[10px] text-[var(--c-text3)]">{lang.label}</p>
                )}
              </div>
              {locale === lang.code && (
                <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/15">
                  Aktivno
                </span>
              )}
              <div className={`
                w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                ${locale === lang.code ? 'border-blue-500 bg-blue-500' : 'border-[var(--c-border2)]'}
              `}>
                {locale === lang.code && <i className="fa-solid fa-check text-[7px] text-white" />}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Info Box ── */}
      <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] p-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-[10px] bg-amber-500/10 border border-amber-500/15 flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-circle-info text-xs text-amber-500"></i>
          </div>
          <div>
            <h4 className="text-[12px] font-bold text-[var(--c-text)] mb-1">Kako funkcioniše?</h4>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
              Ova postavka mijenja jezik svih menija, dugmadi i obavijesti u aplikaciji.
              Sadržaj oglasa ostaje na jeziku na kojem je napisan.
            </p>
          </div>
        </div>
      </div>

      {/* ── Current Selection Summary ── */}
      <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] p-4">
        <div className="flex items-center gap-3 text-[11px]">
          <i className="fa-solid fa-check-circle text-blue-500 text-xs" />
          <span className="text-[var(--c-text2)] font-medium">Trenutni jezik:</span>
          <span className="bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded-lg font-bold border border-blue-500/15">
            {currentLang.flag} {currentLang.nativeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}