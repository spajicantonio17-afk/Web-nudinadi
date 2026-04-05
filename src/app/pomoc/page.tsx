'use client';

import { useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { useI18n } from '@/lib/i18n';

export default function HelpPage() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const FAQ_ITEMS = [
    { q: t('help.q1'),  a: t('help.a1'),  cat: 'Kupovina' },
    { q: t('help.q2'),  a: t('help.a2'),  cat: 'Kupovina' },
    { q: t('help.q3'),  a: t('help.a3'),  cat: 'Kupovina' },
    { q: t('help.q4'),  a: t('help.a4'),  cat: 'Kupovina' },
    { q: t('help.q5'),  a: t('help.a5'),  cat: 'Prodaja' },
    { q: t('help.q6'),  a: t('help.a6'),  cat: 'Prodaja' },
    { q: t('help.q7'),  a: t('help.a7'),  cat: 'Prodaja' },
    { q: t('help.q8'),  a: t('help.a8'),  cat: 'Prodaja' },
    { q: t('help.q9'),  a: t('help.a9'),  cat: 'Pretraga' },
    { q: t('help.q10'), a: t('help.a10'), cat: 'Pretraga' },
    { q: t('help.q11'), a: t('help.a11'), cat: 'Sigurnost' },
    { q: t('help.q12'), a: t('help.a12'), cat: 'Sigurnost' },
    { q: t('help.q13'), a: t('help.a13'), cat: 'Sigurnost' },
    { q: t('help.q14'), a: t('help.a14'), cat: 'Sigurnost' },
    { q: t('help.q15'), a: t('help.a15'), cat: 'Općenito' },
    { q: t('help.q16'), a: t('help.a16'), cat: 'Općenito' },
    { q: t('help.q17'), a: t('help.a17'), cat: 'Općenito' },
    { q: t('help.q18'), a: t('help.a18'), cat: 'Općenito' },
    { q: t('help.q19'), a: t('help.a19'), cat: 'Dostava' },
    { q: t('help.q20'), a: t('help.a20'), cat: 'Dostava' },
  ];

  const CAT_KEYS = ['Kupovina', 'Prodaja', 'Pretraga', 'Sigurnost', 'Općenito', 'Dostava'] as const;

  const filtered = activeFilter === 'all' ? FAQ_ITEMS : FAQ_ITEMS.filter(f => f.cat === activeFilter);

  return (
    <MainLayout title={t('help.title')}>
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <i className="fa-solid fa-circle-question text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-blue-400 uppercase tracking-[0.2em]">{t('help.eyebrow')}</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            {t('help.heading1')}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">{t('help.heading2')}</span>
          </h1>
          <div className="w-10 h-[3px] bg-blue-500 mb-4"></div>
          <p className="text-[13px] text-[var(--c-text2)] leading-relaxed max-w-[560px]">
            {t('help.desc')}
          </p>
        </div>

        {/* QUICK HELP CARDS */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-blue-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">{t('help.quickHelp')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {([
              { icon: 'fa-plus-circle', label: t('help.card.listing'), desc: t('help.card.listingDesc'), filterCat: 'Prodaja' },
              { icon: 'fa-magnifying-glass', label: t('help.card.search'), desc: t('help.card.searchDesc'), filterCat: 'Pretraga' },
              { icon: 'fa-shield-halved', label: t('help.card.security'), desc: t('help.card.securityDesc'), filterCat: 'Sigurnost' },
              { icon: 'fa-user', label: t('help.card.profile'), desc: t('help.card.profileDesc'), filterCat: 'Općenito' },
            ] as const).map((h) => (
              <div
                key={h.filterCat}
                onClick={() => {
                  setActiveFilter(h.filterCat);
                  document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-4 text-center hover:border-blue-500/40 transition-colors cursor-pointer group"
              >
                <i className={`fa-solid ${h.icon} text-blue-400 text-lg mb-2 block group-hover:scale-110 transition-transform`}></i>
                <p className="text-[10px] font-black text-[var(--c-text)] uppercase">{h.label}</p>
                <p className="text-[9px] text-[var(--c-text3)] mt-0.5">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div id="faq-section" className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-blue-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">{t('help.faqSection')}</p>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-[4px] text-[10px] font-bold border transition-all ${
                activeFilter === 'all'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-[var(--c-hover)] text-[var(--c-text3)] border-[var(--c-border)] hover:border-blue-500/40'
              }`}
            >
              {t('help.filterAll')}
            </button>
            {CAT_KEYS.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3 py-1.5 rounded-[4px] text-[10px] font-bold border transition-all ${
                  activeFilter === cat
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-[var(--c-hover)] text-[var(--c-text3)] border-[var(--c-border)] hover:border-blue-500/40'
                }`}
              >
                {t(`help.cat.${cat}` as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>

          {/* Accordion */}
          <div className="space-y-2">
            {filtered.map((faq, i) => (
              <div key={i} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] overflow-hidden hover:border-blue-500/40 transition-colors">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-[4px] text-[8px] font-bold text-blue-500 uppercase shrink-0">
                      {t(`help.cat.${faq.cat}` as Parameters<typeof t>[0])}
                    </span>
                    <span className="text-[12px] font-bold text-[var(--c-text)]">{faq.q}</span>
                  </div>
                  <i className={`fa-solid fa-chevron-down text-[var(--c-text3)] text-[10px] transition-transform ${openIndex === i ? 'rotate-180' : ''}`}></i>
                </button>
                {openIndex === i && (
                  <div className="px-4 pb-4 pt-0 border-t border-[var(--c-border)]">
                    <p className="text-[11px] text-[var(--c-text3)] leading-relaxed pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CONTACT CTA */}
        <div className="text-center py-8 border-t border-[var(--c-border)]">
          <p className="text-lg font-black text-[var(--c-text)] uppercase tracking-tight mb-2">
            {t('help.notFound')}
          </p>
          <p className="text-[10px] text-[var(--c-text3)] mb-4">{t('help.notFoundDesc')}</p>
          <Link href="/kontakt" className="inline-flex items-center gap-2 px-6 py-3 blue-gradient text-white rounded-[6px] text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transition-all">
            <i className="fa-solid fa-paper-plane text-xs"></i>
            {t('help.clickHere')}
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
