'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

// Guest-only hero on the homepage. Always visible for guests (marketing
// surface + login nudge); logged-in users never see it.
export default function HeroSection() {
  const { user, isLoading } = useAuth();
  const { t } = useI18n();

  if (isLoading || user) return null;

  const scrollToSearch = () => {
    const el = document.getElementById('search');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="relative overflow-hidden bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] shadow-subtle mt-3 mb-1 p-5 md:p-8">
      {/* Component-local keyframes — globals.css is design-frozen */}
      <style>{`
        @keyframes heroNudgeFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>

      {/* Decorative blur orbs */}
      <div className="absolute -top-16 -left-16 w-56 h-56 bg-blue-600/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute -bottom-12 -right-8 w-40 h-40 bg-indigo-500/[0.08] rounded-full blur-[40px] pointer-events-none" />

      {/* Login nudge — arrow pointing up-right toward the header's Gost button.
          Desktop only: on mobile it collided with the headline and the header
          has no Gost button at that position. */}
      <Link
        href="/login"
        className="hidden sm:flex absolute top-3 right-[28px] md:top-4 md:right-[40px] z-10 items-start gap-1.5 group"
        style={{ animation: 'heroNudgeFloat 2.5s ease-in-out infinite' }}
      >
        <div className="text-right leading-tight pt-1.5">
          <p className="hidden sm:block text-[13px] text-[var(--c-text3)]">{t('hero.loginNudge')}</p>
          <p className="text-[14px] font-bold text-[var(--c-accent)] group-hover:text-[var(--c-accent-hover,#1D4ED8)] transition-colors">
            {t('hero.loginNudgeAction')}
          </p>
        </div>
        {/* Hand-drawn style curved arrow, pointing up-right */}
        <svg
          width="30" height="34" viewBox="0 0 30 34" fill="none"
          className="text-[var(--c-accent)] shrink-0"
          aria-hidden="true"
        >
          <path
            d="M4 30 C 10 26, 20 22, 24 8"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"
          />
          <path
            d="M17 10 L 24 6 L 26 14"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
          />
        </svg>
      </Link>

      <div className="relative z-[1] max-w-2xl">
        {/* Eyebrow */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-[3px] blue-gradient rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[2px] text-[var(--c-text3)]">
            {t('hero.eyebrow')}
          </span>
        </div>

        {/* Headline — brand word-play, accent words in gradient */}
        <h1 className="text-3xl md:text-4xl font-black leading-tight text-[var(--c-text)] mb-3 sm:pr-24">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
            {t('hero.title1Accent')}
          </span>{' '}
          {t('hero.title1Rest')}
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
            {t('hero.title2Accent')}
          </span>{' '}
          {t('hero.title2Rest')}
        </h1>

        {/* Subline */}
        <p className="text-[13px] md:text-[14px] text-[var(--c-text2)] leading-relaxed max-w-xl mb-5">
          {t('hero.subtitle')}
        </p>

        {/* Feature chips */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--c-border)] bg-[var(--c-bg)] text-[11px] font-semibold text-[var(--c-text2)]">
            <i className="fa-solid fa-bolt text-[10px] text-[var(--c-accent)]" />
            {t('hero.chipImport')}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--c-border)] bg-[var(--c-bg)] text-[11px] font-semibold text-[var(--c-text2)]">
            <i className="fa-solid fa-shield-halved text-[10px] text-[var(--c-accent)]" />
            {t('hero.chipSafe')}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--c-border)] bg-[var(--c-bg)] text-[11px] font-semibold text-[var(--c-text2)]">
            <i className="fa-solid fa-tag text-[10px] text-[var(--c-accent)]" />
            {t('hero.chipFree')}
          </span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/register"
            className="blue-gradient btn-plus-shadow text-white text-[13px] font-bold px-6 py-3 rounded-[10px] text-center hover:brightness-110 active:scale-[0.98] transition-all duration-150"
          >
            {t('hero.ctaRegister')}
          </Link>
          <button
            onClick={scrollToSearch}
            className="border border-[var(--c-border)] text-[var(--c-text2)] text-[13px] font-semibold px-6 py-3 rounded-[10px] hover:border-[var(--c-accent)] hover:text-[var(--c-accent)] transition-all duration-150 bg-transparent"
          >
            {t('hero.ctaExplore')}
          </button>
        </div>
      </div>
    </div>
  );
}
