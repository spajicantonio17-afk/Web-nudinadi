'use client';

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

const OPEN_POSITIONS = [
  { title: 'Senior Frontend Developer', team: 'Engineering', type: 'Full-time', location: 'Remote / Sarajevo', tags: ['React', 'Next.js', 'TypeScript'] },
  { title: 'AI/ML Engineer', team: 'AI Core', type: 'Full-time', location: 'Remote', tags: ['Python', 'TensorFlow', 'NLP'] },
  { title: 'Product Designer (UI/UX)', team: 'Design', type: 'Full-time', location: 'Remote / Sarajevo', tags: ['Figma', 'Prototyping', 'User Research'] },
  { title: 'Backend Developer', team: 'Engineering', type: 'Full-time', location: 'Remote', tags: ['Node.js', 'PostgreSQL', 'Supabase'] },
  { title: 'Community Manager', team: 'Marketing', type: 'Part-time', location: 'BiH', tags: ['Social Media', 'Content', 'Engagement'] },
  { title: 'QA Engineer', team: 'Engineering', type: 'Full-time', location: 'Remote', tags: ['Testing', 'Automation', 'CI/CD'] },
];

export default function CareersPage() {
  return (
    <MainLayout title="Karijere">
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <i className="fa-solid fa-rocket text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-purple-400 uppercase tracking-[0.2em]">Karijere</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            GRADI BUDUĆNOST<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">ZAJEDNO S NAMA.</span>
          </h1>
          <div className="w-10 h-[3px] bg-purple-500 mb-4"></div>
          <p className="text-[13px] text-[var(--c-text2)] leading-relaxed max-w-[560px]">
            Tražimo ambiciozne ljude koji žele mijenjati način kupovine i prodaje u regiji. Remote-first kultura, moderni stack, pravi impact.
          </p>
        </div>

        {/* WHY JOIN US */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-purple-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Zašto NudiNađi?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-purple-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-purple-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-house-laptop text-purple-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">Remote-First</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">
                Radi odakle želiš. Naš tim je distribuiran, a rezultati su jedino što broji. Fleksibilno radno vrijeme.
              </p>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-blue-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-blue-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-microchip text-blue-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">Moderni Stack</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">
                Next.js, TypeScript, Supabase, AI/ML — radimo sa najnovijim tehnologijama. Učiš i rastiješ svaki dan.
              </p>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-emerald-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-emerald-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-chart-line text-emerald-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">Pravi Impact</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">
                Tvoj rad direktno utiče na hiljade korisnika. Nismo korporacija — svaki doprinos je vidljiv i bitan.
              </p>
            </div>
          </div>
        </div>

        {/* OPEN POSITIONS */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-purple-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Otvorene pozicije ({OPEN_POSITIONS.length})</p>
          </div>
          <div className="space-y-3">
            {OPEN_POSITIONS.map((pos) => (
              <div key={pos.title} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 hover:border-purple-500/40 transition-colors group cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="text-[13px] font-black text-[var(--c-text)] group-hover:text-purple-500 transition-colors">{pos.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-[var(--c-text3)]"><i className="fa-solid fa-building text-[8px] mr-1"></i>{pos.team}</span>
                      <span className="text-[10px] text-[var(--c-text3)]"><i className="fa-solid fa-clock text-[8px] mr-1"></i>{pos.type}</span>
                      <span className="text-[10px] text-[var(--c-text3)]"><i className="fa-solid fa-location-dot text-[8px] mr-1"></i>{pos.location}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {pos.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-[4px] text-[9px] font-bold text-purple-500">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-8 border-t border-[var(--c-border)]">
          <p className="text-lg font-black text-[var(--c-text)] uppercase tracking-tight mb-2">
            &ldquo;Budi dio revolucije.&rdquo;
          </p>
          <p className="text-[10px] text-[var(--c-text3)] mb-4">Pošalji svoju prijavu putem kontakt forme</p>
          <Link href="/kontakt" className="inline-flex items-center gap-2 px-6 py-3 blue-gradient text-white rounded-[6px] text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transition-all">
            <i className="fa-solid fa-paper-plane text-xs"></i>
            Apliciraj Sada
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
