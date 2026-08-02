'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';
import { setCountryPreference, type CountryPreference } from '@/lib/country';
import { consumeJustRegistered, hasSeenTour, markTourSeen } from '@/lib/onboardingTour';

const TOTAL_STEPS = 4;

export default function OnboardingTour() {
  const { isAuthenticated } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useI18n();

  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [country, setCountry] = useState<CountryPreference | null>(null);
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLocalTheme(theme === 'system' ? resolvedTheme : (theme as 'light' | 'dark'));
  }, [theme, resolvedTheme]);

  // Poll briefly after auth resolves: markJustRegistered() runs in
  // register/page.tsx right after the register() call resolves, but
  // setUser()/isAuthenticated can flip true earlier in that same call
  // (autoconfirm path) — a single effect keyed on [isAuthenticated] can
  // fire before the flag is written and never re-run. Polling for ~2s
  // catches the flag whichever order the two events land in.
  useEffect(() => {
    if (!isAuthenticated || hasSeenTour()) return;

    if (consumeJustRegistered()) {
      setShow(true);
      document.body.style.overflow = 'hidden';
      return;
    }

    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      if (consumeJustRegistered()) {
        setShow(true);
        document.body.style.overflow = 'hidden';
        clearInterval(interval);
      } else if (attempts >= 20) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Fix 2: if the tour is dismounted (route change unmounts Providers'
  // tree in edge cases, or the tab closes) while still open, make sure
  // body scroll doesn't stay locked forever.
  useEffect(() => {
    if (!show) return;
    return () => {
      document.body.style.overflow = '';
    };
  }, [show]);

  const handleThemeToggle = useCallback((t: 'light' | 'dark') => {
    setLocalTheme(t);
    setTheme(t);
  }, [setTheme]);

  const finish = useCallback(() => {
    markTourSeen();
    document.body.style.overflow = '';
    setShow(false);
  }, []);

  const goNext = useCallback(() => {
    if (step === 0) {
      if (!country) return;
      setCountryPreference(country);
    }
    if (step >= TOTAL_STEPS - 1) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  }, [step, country, finish]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  if (!mounted || !show) return null;

  const isDark = localTheme === 'dark';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className={`absolute inset-0 ${isDark ? 'bg-black/80' : 'bg-black/40'} backdrop-blur-md`} />

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
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-blue-500' : `w-1.5 ${isDark ? 'bg-white/15' : 'bg-gray-200'}`
                }`}
              />
            ))}
          </div>

          {step === 0 && (
            <CountryThemeStep
              isDark={isDark}
              country={country}
              onSelectCountry={setCountry}
              localTheme={localTheme}
              onToggleTheme={handleThemeToggle}
              t={t}
            />
          )}
          {step === 1 && (
            <TourStep
              isDark={isDark}
              icon="fa-plus"
              title={t('tour.uploadTitle')}
              desc={t('tour.uploadDesc')}
            />
          )}
          {step === 2 && (
            <TourStep
              isDark={isDark}
              icon="fa-comment-dots"
              title={t('tour.messagesTitle')}
              desc={t('tour.messagesDesc')}
            />
          )}
          {step === 3 && (
            <TourStep
              isDark={isDark}
              icon="fa-user"
              title={t('tour.profileTitle')}
              desc={t('tour.profileDesc')}
              hint={t('tour.settingsHint')}
            />
          )}

          <div className="flex items-center gap-2 mt-5">
            {step > 0 && (
              <button
                onClick={goBack}
                className={`px-4 py-3 rounded-[12px] font-bold text-[13px] transition-colors ${
                  isDark
                    ? 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08]'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <i className="fa-solid fa-arrow-left" />
              </button>
            )}
            <button
              onClick={goNext}
              disabled={step === 0 && !country}
              className={`
                flex-1 py-3 rounded-[12px] font-bold text-[13px] uppercase tracking-wider
                transition-all duration-200
                ${step === 0 && !country
                  ? isDark
                    ? 'bg-white/[0.04] text-white/15 border border-white/[0.06] cursor-not-allowed'
                    : 'bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed'
                  : 'blue-gradient text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 active:scale-[0.98]'
                }
              `}
            >
              {step >= TOTAL_STEPS - 1 ? t('tour.finish') : t('tour.next')}
            </button>
          </div>

          {step > 0 && (
            <button
              onClick={finish}
              className={`w-full mt-3 text-center text-[10px] font-bold uppercase tracking-wider transition-colors ${
                isDark ? 'text-white/25 hover:text-white/40' : 'text-gray-300 hover:text-gray-400'
              }`}
            >
              {t('tour.skip')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step 1: Country + Theme (ported from the old WelcomePopup) ──

function CountryThemeStep({ isDark, country, onSelectCountry, localTheme, onToggleTheme, t }: {
  isDark: boolean;
  country: CountryPreference | null;
  onSelectCountry: (c: CountryPreference) => void;
  localTheme: 'light' | 'dark';
  onToggleTheme: (t: 'light' | 'dark') => void;
  t: (key: string) => string;
}) {
  return (
    <div>
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
              {t('tour.welcomeTitle')}
            </h1>
            <p className={`text-[10px] ${isDark ? 'text-blue-300/60' : 'text-blue-600/50'}`}>
              {t('tour.welcomeSubtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <section>
          <h2 className={`text-[10px] font-black uppercase tracking-[2px] mb-2 px-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
            {t('tour.countryQuestion')}
          </h2>
          <div className={`
            rounded-[14px] overflow-hidden border
            ${isDark ? 'border-white/[0.06] bg-white/[0.03]' : 'border-gray-100 bg-gray-50/50'}
          `}>
            <CountryRow flag="🇧🇦" label="Bosna i Hercegovina" sub="Samo KM cijene"
              selected={country === 'ba'} onClick={() => onSelectCountry('ba')} isDark={isDark} />
            <CountryRow flag="🇭🇷" label="Hrvatska" sub="Samo EUR cijene"
              selected={country === 'hr'} onClick={() => onSelectCountry('hr')} isDark={isDark} />
            <CountryRow flag="🇷🇸" label="Srbija" sub="Samo RSD cijene"
              selected={country === 'rs'} onClick={() => onSelectCountry('rs')} isDark={isDark} />
            <CountryRow flag="🌍" label="Sva tržišta" sub="Sve valute · KM, EUR i RSD"
              selected={country === 'all'} onClick={() => onSelectCountry('all')} isDark={isDark} last />
          </div>
        </section>

        <section>
          <h2 className={`text-[10px] font-black uppercase tracking-[2px] mb-2 px-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
            {t('tour.themeQuestion')}
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            <ThemePreviewCard mode="light" label="Svijetla"
              selected={localTheme === 'light'} onClick={() => onToggleTheme('light')} isDark={isDark} />
            <ThemePreviewCard mode="dark" label="Tamna"
              selected={localTheme === 'dark'} onClick={() => onToggleTheme('dark')} isDark={isDark} />
          </div>
        </section>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-4">
        <i className={`fa-solid fa-gear text-[8px] ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
        <p className={`text-[9px] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
          {t('tour.settingsHintShort')}
        </p>
      </div>
    </div>
  );
}

// ── Steps 2-4: simple icon + title + description tour cards ──

function TourStep({ isDark, icon, title, desc, hint }: {
  isDark: boolean;
  icon: string;
  title: string;
  desc: string;
  hint?: string;
}) {
  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 rounded-[20px] flex items-center justify-center blue-gradient shadow-lg shadow-blue-500/25 mx-auto mb-5">
        <i className={`fa-solid ${icon} text-white text-2xl`}></i>
      </div>
      <h2 className={`text-[16px] font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
      <p className={`text-[12px] leading-relaxed ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{desc}</p>

      {hint && (
        <div className={`
          mt-4 rounded-[12px] px-4 py-3 text-[11px] leading-relaxed
          ${isDark ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' : 'bg-blue-50 text-blue-700 border border-blue-100'}
        `}>
          <i className="fa-solid fa-circle-info mr-1.5" />
          {hint}
        </div>
      )}
    </div>
  );
}

// ── Sub-components (ported from the old WelcomePopup) ──

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
      <div className={`p-2.5 pb-1.5 ${isLightPreview ? 'bg-[#F5F5F7]' : 'bg-[#0a0c18]'}`}>
        <div className={`h-1.5 rounded-full mb-1.5 w-12 ${isLightPreview ? 'bg-gray-200' : 'bg-white/10'}`} />
        <div className="flex gap-1">
          <div className={`h-5 flex-1 rounded ${isLightPreview ? 'bg-white shadow-sm' : 'bg-white/[0.06]'}`} />
          <div className={`h-5 flex-1 rounded ${isLightPreview ? 'bg-white shadow-sm' : 'bg-white/[0.06]'}`} />
        </div>
      </div>
      <div className={`px-2.5 py-2 text-center border-t ${isDark ? 'bg-white/[0.02] border-white/[0.04]' : 'bg-white border-gray-100'}`}>
        <span className={`text-[10px] font-bold ${selected ? 'text-blue-500' : isDark ? 'text-white/70' : 'text-gray-600'}`}>
          {isLightPreview ? '☀️' : '🌙'} {label}
        </span>
      </div>
    </button>
  );
}
