'use client';

import MainLayout from '@/components/layout/MainLayout';

export default function SecurityPage() {
  return (
    <MainLayout title="Sigurnost">
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <i className="fa-solid fa-shield-halved text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-blue-400 uppercase tracking-[0.2em]">Sigurnosni Centar</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            TVOJA SIGURNOST<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-500">JE NAŠ PRIORITET.</span>
          </h1>
          <div className="w-10 h-[3px] bg-emerald-500 mb-4"></div>
          <p className="text-[13px] text-[var(--c-text2)] leading-relaxed max-w-[560px]">
            NudiNađi koristi napredne AI sisteme za zaštitu korisnika. Evo kako te štitimo i šta ti možeš učiniti.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { value: '24/7', label: 'AI Monitoring', icon: 'fa-eye' },
            { value: '99%', label: 'Preciznost Detekcije', icon: 'fa-bullseye' },
            { value: '256', label: 'Bit Enkripcija', icon: 'fa-lock' },
            { value: '<1s', label: 'Vrijeme Reakcije', icon: 'fa-bolt' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5">
              <i className={`fa-solid ${stat.icon} text-[var(--c-text3)] text-lg mb-3 block`}></i>
              <p className="text-2xl font-black text-[var(--c-text)] leading-none mb-1">{stat.value}</p>
              <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* AI PROTECTION */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-emerald-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">AI sistemi zaštite</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-blue-500/40 transition-colors flex flex-col">
              <div className="absolute top-0 right-0 w-14 h-14 bg-blue-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-user-shield text-blue-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">Anti-Scam<br />Detekcija</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">
                AI skenira svaki oglas i poruku u realnom vremenu. Sumnjive aktivnosti se automatski označavaju i blokiraju.
              </p>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-emerald-500/40 transition-colors flex flex-col">
              <div className="absolute top-0 right-0 w-14 h-14 bg-emerald-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-fingerprint text-emerald-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">Trust Score<br />Sistem</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">
                AI algoritam ocjenjuje pouzdanost svakog korisnika na osnovu verifikacije, historije i ocjena.
              </p>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-purple-500/40 transition-colors flex flex-col">
              <div className="absolute top-0 right-0 w-14 h-14 bg-purple-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-comment-slash text-purple-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">Smart Chat<br />Filter</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">
                AI analizira poruke i detektuje phishing linkove, lažne ponude i pokušaje preusmjeravanja.
              </p>
            </div>
          </div>
        </div>

        {/* SAFETY TIPS */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-emerald-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Savjeti za sigurnu kupovinu</p>
          </div>
          <div className="space-y-2">
            {[
              { icon: 'fa-money-bill-wave', tip: 'Nikad ne šalji novac unaprijed', desc: 'Plaćaj tek kada vidiš i provjeriš predmet. Izbjegavaj transfer novca prije preuzimanja.' },
              { icon: 'fa-comments', tip: 'Komuniciraj preko platforme', desc: 'Koristi NudiNađi chat — nikad ne prelazi na vanjske aplikacije po zahtjevu prodavca.' },
              { icon: 'fa-star', tip: 'Provjeri Trust Score', desc: 'Prije kupovine pogledaj Trust Score prodavca. Viši score = pouzdaniji korisnik.' },
              { icon: 'fa-flag', tip: 'Prijavi sumnjive oglase', desc: 'Ako nešto izgleda sumnjivo, koristi "Prijavi" dugme. Naš tim reagira u roku od 1 sata.' },
              { icon: 'fa-map-pin', tip: 'Susreti na javnim mjestima', desc: 'Kod preuzimanja se nađi na javnom, prometnom mjestu. Informiši nekoga o susretu.' },
            ].map((tip) => (
              <div key={tip.tip} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-4 flex items-start gap-4 hover:border-emerald-500/40 transition-colors">
                <div className="w-8 h-8 rounded-[4px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <i className={`fa-solid ${tip.icon} text-emerald-400 text-[11px]`}></i>
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-[var(--c-text)]">{tip.tip}</h4>
                  <p className="text-[10px] text-[var(--c-text3)] leading-relaxed mt-0.5">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REPORT */}
        <div className="text-center py-8 border-t border-[var(--c-border)]">
          <p className="text-lg font-black text-[var(--c-text)] uppercase tracking-tight mb-2">
            Prijavi Problem
          </p>
          <p className="text-[10px] text-[var(--c-text3)] mb-4">Ako si žrtva prevare ili vidiš sumnjive aktivnosti, odmah nas kontaktiraj.</p>
          <a href="mailto:sigurnost@nudinadi.com" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-[6px] text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transition-all">
            <i className="fa-solid fa-shield-halved text-xs"></i>
            sigurnost@nudinadi.com
          </a>
        </div>
      </div>
    </MainLayout>
  );
}
