'use client';

import MainLayout from '@/components/layout/MainLayout';

const PRESS_RELEASES = [
  { date: '15. Jan 2025', title: 'NudiNađi pokreće AI-powered marketplace u BiH', desc: 'Nova platforma koristi naprednu AI tehnologiju za revolucioniranje online trgovine u regiji.', tag: 'Lansiranje' },
  { date: '28. Feb 2025', title: 'AI pretraga prirodnim jezikom — novi standard', desc: 'NudiNađi uvodi pretragu koja razumije bosanski jezik, greške u pisanju i kontekst.', tag: 'Proizvod' },
  { date: '10. Mar 2025', title: 'Partnerstvo sa lokalnim trgovcima', desc: 'Preko 500 verificiranih prodavaca se pridružilo platformi u prvom kvartalu.', tag: 'Rast' },
  { date: '05. Apr 2025', title: 'Anti-Scam AI sistem — 99% preciznost', desc: 'AI zaštita detektuje i blokira prevare u realnom vremenu, štiteći korisnike 24/7.', tag: 'Sigurnost' },
];

export default function PressPage() {
  return (
    <MainLayout title="Press">
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <i className="fa-solid fa-newspaper text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-blue-400 uppercase tracking-[0.2em]">Press Centar</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            VIJESTI &amp;<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">MEDIJSKI CENTAR.</span>
          </h1>
          <div className="w-10 h-[3px] bg-blue-500 mb-4"></div>
          <p className="text-[13px] text-[var(--c-text2)] leading-relaxed max-w-[560px]">
            Sve najnovije vijesti o NudiNađi platformi. Za medijske upite kontaktirajte nas na press@nudinadi.com.
          </p>
        </div>

        {/* MEDIA KIT */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-blue-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Medijski Kit</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 flex items-center gap-4 hover:border-blue-500/40 transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-images text-blue-400 text-lg"></i>
              </div>
              <div>
                <h3 className="text-[11px] font-black text-[var(--c-text)] group-hover:text-blue-500 transition-colors">Logo Paket</h3>
                <p className="text-[9px] text-[var(--c-text3)]">SVG, PNG, svi formati</p>
              </div>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 flex items-center gap-4 hover:border-blue-500/40 transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-[4px] bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-palette text-purple-400 text-lg"></i>
              </div>
              <div>
                <h3 className="text-[11px] font-black text-[var(--c-text)] group-hover:text-purple-500 transition-colors">Brand Smjernice</h3>
                <p className="text-[9px] text-[var(--c-text3)]">Boje, fontovi, tonalitet</p>
              </div>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 flex items-center gap-4 hover:border-blue-500/40 transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-[4px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-chart-bar text-emerald-400 text-lg"></i>
              </div>
              <div>
                <h3 className="text-[11px] font-black text-[var(--c-text)] group-hover:text-emerald-500 transition-colors">Statistike</h3>
                <p className="text-[9px] text-[var(--c-text3)]">Korisnici, rast, kategorije</p>
              </div>
            </div>
          </div>
        </div>

        {/* PRESS RELEASES */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-blue-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Priopćenja za javnost</p>
          </div>
          <div className="space-y-3">
            {PRESS_RELEASES.map((pr) => (
              <div key={pr.title} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 hover:border-blue-500/40 transition-colors cursor-pointer group">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] text-[var(--c-text3)]">{pr.date}</span>
                      <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-[4px] text-[8px] font-bold text-blue-500 uppercase">{pr.tag}</span>
                    </div>
                    <h3 className="text-[13px] font-black text-[var(--c-text)] group-hover:text-blue-500 transition-colors mb-1">{pr.title}</h3>
                    <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">{pr.desc}</p>
                  </div>
                  <i className="fa-solid fa-arrow-right text-[var(--c-text3)] text-xs mt-2 group-hover:text-blue-500 transition-colors shrink-0"></i>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONTACT */}
        <div className="text-center py-8 border-t border-[var(--c-border)]">
          <p className="text-lg font-black text-[var(--c-text)] uppercase tracking-tight mb-2">
            Medijski Upiti
          </p>
          <p className="text-[10px] text-[var(--c-text3)] mb-1">press@nudinadi.com</p>
          <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-[0.3em]">Odgovaramo u roku od 24 sata</p>
        </div>
      </div>
    </MainLayout>
  );
}
