'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { isOnboarded, setOnboarded, setCountryPreference, type CountryPreference } from '@/lib/country';
import { useTheme } from '@/lib/theme';

export default function WelcomePopup() {
  const [show, setShow] = useState(false);
  const [country, setCountry] = useState<CountryPreference | null>(null);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isOnboarded()) {
      setShow(true);
      document.body.style.overflow = 'hidden';
    }
    setLocalTheme(theme === 'system' ? resolvedTheme : (theme as 'light' | 'dark'));
  }, [theme, resolvedTheme]);

  const handleThemeToggle = useCallback((t: 'light' | 'dark') => {
    setLocalTheme(t);
    setTheme(t);
  }, [setTheme]);

  const handleFinish = useCallback(() => {
    if (!country) return;
    setCountryPreference(country);
    setOnboarded();
    document.body.style.overflow = '';
    setShow(false);
  }, [country]);

  if (!mounted || !show) return null;

  const isDark = localTheme === 'dark';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Overlay */}
      <div className={`absolute inset-0 ${isDark ? 'bg-black/80' : 'bg-black/40'} backdrop-blur-md`} />

      {/* Desktop: Modal / Mobile: Fullscreen */}
      <div
        className={`
          relative z-10 w-full
          md:max-w-[440px] md:mx-4 md:rounded-[24px]
          max-md:h-full max-md:overflow-y-auto
          ${isDark
            ? 'bg-[#0d1321]/95 md:border md:border-white/[0.08] md:shadow-[0_32px_64px_rgba(0,0,0,0.6)]'
            : 'bg-white/95 md:border md:border-gray-200/60 md:shadow-[0_32px_64px_rgba(0,0,0,0.12)]'
          }
          backdrop-blur-2xl transition-colors duration-300
        `}
        style={{ animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="p-5 md:p-6 max-md:pb-28">

          {/* ── Brand Header (compact) ── */}
          <div className={`
            relative rounded-[16px] px-4 py-4 mb-5 overflow-hidden
            ${isDark
              ? 'bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-transparent border border-white/[0.06]'
              : 'bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white border border-blue-100/60'
            }
          `}>
            <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-[30px] ${isDark ? 'bg-blue-500/20' : 'bg-blue-400/15'}`} />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] flex items-center justify-center blue-gradient shadow-lg shadow-blue-500/25 flex-shrink-0">
                <i className="fa-solid fa-cube text-white text-base"></i>
              </div>
              <div>
                <h1 className={`text-[15px] font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Dobrodošli na NudiNađi
                </h1>
                <p className={`text-[10px] ${isDark ? 'text-blue-300/60' : 'text-blue-600/50'}`}>
                  Postavi preference za najbolje iskustvo
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">

            {/* ── Section 1: Country Selection ── */}
            <section>
              <h2 className={`text-[10px] font-black uppercase tracking-[2px] mb-2 px-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                Gdje želiš da ti radi NudiNađi?
              </h2>
              <div className={`
                rounded-[14px] overflow-hidden border
                ${isDark ? 'border-white/[0.06] bg-white/[0.03]' : 'border-gray-100 bg-gray-50/50'}
              `}>
                <CountryRow flag="🇧🇦" label="Bosna i Hercegovina" sub="Samo KM cijene"
                  selected={country === 'ba'} onClick={() => setCountry('ba')} isDark={isDark} />
                <CountryRow flag="🇭🇷" label="Hrvatska" sub="Samo EUR cijene"
                  selected={country === 'hr'} onClick={() => setCountry('hr')} isDark={isDark} />
                <CountryRow flag="🌍" label="Sva tržišta" sub="Obje valute · KM i EUR"
                  selected={country === 'all'} onClick={() => setCountry('all')} isDark={isDark} last />
              </div>
            </section>

            {/* ── Section 3: Theme Selection ── */}
            <section>
              <h2 className={`text-[10px] font-black uppercase tracking-[2px] mb-2 px-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                Izaberi temu
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                <ThemePreviewCard mode="light" label="Svijetla"
                  selected={localTheme === 'light'} onClick={() => handleThemeToggle('light')} isDark={isDark} />
                <ThemePreviewCard mode="dark" label="Tamna"
                  selected={localTheme === 'dark'} onClick={() => handleThemeToggle('dark')} isDark={isDark} />
              </div>
            </section>

          </div>

          {/* ── Settings hint ── */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            <i className={`fa-solid fa-gear text-[8px] ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
            <p className={`text-[9px] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
              Sve možeš promijeniti u <span className={`font-bold ${isDark ? 'text-white/30' : 'text-gray-500'}`}>Postavke</span>
            </p>
          </div>

          {/* ── Confirm Button ── */}
          <button
            onClick={handleFinish}
            disabled={!country}
            className={`
              w-full mt-5 py-3 rounded-[12px] font-bold text-[13px] uppercase tracking-wider
              transition-all duration-200
              ${country
                ? 'blue-gradient text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 active:scale-[0.98]'
                : isDark
                  ? 'bg-white/[0.04] text-white/15 border border-white/[0.06] cursor-not-allowed'
                  : 'bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed'
              }
            `}
          >
            {country ? 'Započni' : 'Izaberi državu za nastavak'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-Components ──────────────────────────────────────────

function CountryRow({ flag, label, sub, selected, onClick, isDark, last }: {
  flag: string; label: string; sub: string;
  selected: boolean; onClick: () => void; isDark: boolean; last?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3.5 py-2.5 transition-all text-left
        ${!last ? (isDark ? 'border-b border-white/[0.04]' : 'border-b border-gray-100') : ''}
        ${selected
          ? isDark ? 'bg-blue-500/10' : 'bg-blue-50/80'
          : isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-white/60'
        }
      `}
    >
      <span className="text-xl w-7 text-center flex-shrink-0">{flag}</span>
      <div className="flex-1 min-w-0">
        <h4 className={`text-[12px] font-bold ${selected ? 'text-blue-500' : isDark ? 'text-white/90' : 'text-gray-800'}`}>
          {label}
        </h4>
        <p className={`text-[9px] ${selected ? (isDark ? 'text-blue-400/50' : 'text-blue-500/50') : isDark ? 'text-white/25' : 'text-gray-400'}`}>
          {sub}
        </p>
      </div>
      <div className={`
        w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
        ${selected ? 'border-blue-500 bg-blue-500' : isDark ? 'border-white/15' : 'border-gray-300'}
      `}>
        {selected && <i className="fa-solid fa-check text-[7px] text-white" />}
      </div>
    </button>
  );
}

function ThemePreviewCard({ mode, label, selected, onClick, isDark }: {
  mode: 'light' | 'dark'; label: string;
  selected: boolean; onClick: () => void; isDark: boolean;
}) {
  const isLightPreview = mode === 'light';
  return (
    <button
      onClick={onClick}
      className={`
        rounded-[12px] overflow-hidden border-2 transition-all duration-200
        ${selected
          ? 'border-blue-500 ring-2 ring-blue-500/20 scale-[1.02]'
          : isDark ? 'border-white/[0.06] hover:border-white/[0.12]' : 'border-gray-200 hover:border-gray-300'
        }
        active:scale-[0.97]
      `}
    >
      {/* Mini UI Preview */}
      <div className={`p-2.5 pb-1.5 ${isLightPreview ? 'bg-[#F5F5F7]' : 'bg-[#0a0c18]'}`}>
        <div className={`h-1.5 rounded-full mb-1.5 w-12 ${isLightPreview ? 'bg-gray-200' : 'bg-white/10'}`} />
        <div className="flex gap-1">
          <div className={`h-5 flex-1 rounded ${isLightPreview ? 'bg-white shadow-sm' : 'bg-white/[0.06]'}`} />
          <div className={`h-5 flex-1 rounded ${isLightPreview ? 'bg-white shadow-sm' : 'bg-white/[0.06]'}`} />
        </div>
      </div>
      {/* Label */}
      <div className={`px-2.5 py-2 text-center border-t ${isDark ? 'bg-white/[0.02] border-white/[0.04]' : 'bg-white border-gray-100'}`}>
        <span className={`text-[10px] font-bold ${selected ? 'text-blue-500' : isDark ? 'text-white/70' : 'text-gray-600'}`}>
          {isLightPreview ? '☀️' : '🌙'} {label}
        </span>
      </div>
    </button>
  );
}

