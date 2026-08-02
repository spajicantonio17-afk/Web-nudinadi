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
    <div className="bg-gradient-to-b from-[var(--c-accent-light)] to-[var(--c-card)] border-b border-[var(--c-border)] px-4 py-7 md:py-10">
      <div className="max-w-2xl mx-auto">

        {/* Headline + Subtext */}
        <h1 className="text-3xl md:text-4xl font-black text-[var(--c-text)] leading-tight mb-2">
          Već imaš oglas?{' '}
          <span className="text-[var(--c-accent)]">Importuj ga.</span>
        </h1>
        <p className="text-[13px] md:text-[14px] text-[var(--c-text2)] mb-5 leading-relaxed">
          Jedan link — sve informacije se preuzimaju.{' '}
          <span className="font-semibold text-[var(--c-text)]">Za sekund si tu.</span>
        </p>

        {/* 3-Way Strip */}
        <div className="flex items-center gap-3 mb-6 text-[12px] text-[var(--c-text3)] font-medium">
          <span className="flex items-center gap-1.5">
            <i className="fa-solid fa-camera text-[var(--c-accent)] text-[11px]" />
            Foto
          </span>
          <span className="text-[var(--c-border)]">·</span>
          <span className="flex items-center gap-1.5">
            <i className="fa-solid fa-link text-[var(--c-accent)] text-[11px]" />
            Link
          </span>
          <span className="text-[var(--c-border)]">·</span>
          <span className="flex items-center gap-1.5">
            <i className="fa-solid fa-pen text-[var(--c-accent)] text-[11px]" />
            Ručno
          </span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/upload"
            className="blue-gradient btn-plus-shadow text-white text-[13px] font-bold px-5 py-2.5 rounded-[6px] text-center hover:brightness-110 transition-all duration-150"
          >
            Dodaj oglas →
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
