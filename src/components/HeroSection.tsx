'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

const HERO_SEEN_KEY = 'nudinadi_hero_seen';

export default function HeroSection() {
  const { user, isLoading } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // Logged-in known user → never show
    if (user) {
      const seen = localStorage.getItem(HERO_SEEN_KEY);
      if (seen) return;
    }

    // Show once, then remember
    const seen = localStorage.getItem(HERO_SEEN_KEY);
    if (!seen) {
      setVisible(true);
      localStorage.setItem(HERO_SEEN_KEY, '1');
    }
  }, [user, isLoading]);

  if (!visible) return null;

  const scrollToSearch = () => {
    const el = document.getElementById('search');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="bg-[var(--c-card)] border-b border-[var(--c-border)] px-4 py-6 md:py-8">
      <div className="max-w-2xl mx-auto">

        {/* Headline + Subtext */}
        <h1 className="text-2xl md:text-3xl font-black text-[var(--c-text)] leading-tight mb-2">
          Kupi i prodaj.{' '}
          <span className="text-[var(--c-accent)]">Bez komplikacija.</span>
        </h1>
        <p className="text-[13px] md:text-[14px] text-[var(--c-text2)] mb-5 leading-relaxed">
          NudiNađi je platforma s AI asistentom koji piše oglas za tebe.{' '}
          <span className="font-semibold text-[var(--c-text)]">Besplatno. Za 30 sekundi.</span>
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--c-accent-light)] text-[var(--c-accent)] text-[11px] font-bold">
            <span className="text-[13px]">0€</span>
            Besplatno
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--c-accent-light)] text-[var(--c-accent)] text-[11px] font-bold">
            <span>⚡</span>
            30 sekundi
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--c-accent-light)] text-[var(--c-accent)] text-[11px] font-bold">
            <span>🛡️</span>
            Sigurno
          </span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/upload"
            className="blue-gradient btn-plus-shadow text-white text-[13px] font-bold px-5 py-2.5 rounded-[6px] text-center hover:brightness-110 transition-all duration-150"
          >
            Objavi oglas →
          </Link>
          <button
            onClick={scrollToSearch}
            className="border border-[var(--c-border)] text-[var(--c-text2)] text-[13px] font-semibold px-5 py-2.5 rounded-[6px] hover:border-[var(--c-accent)] hover:text-[var(--c-accent)] transition-all duration-150 bg-transparent"
          >
            Istraži
          </button>
        </div>
      </div>
    </div>
  );
}
