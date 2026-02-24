'use client';

import MainLayout from '@/components/layout/MainLayout';

export default function PartnersPage() {
  return (
    <MainLayout title="Partneri">
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <i className="fa-solid fa-handshake text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Partneri</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            RASTIMO<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">ZAJEDNO.</span>
          </h1>
          <div className="w-10 h-[3px] bg-emerald-500 mb-4"></div>
          <p className="text-[13px] text-[var(--c-text2)] leading-relaxed max-w-[560px]">
            NudiNađi partnerski program omogućava firmama, trgovinama i agencijama da dosegnu više kupaca kroz našu AI platformu.
          </p>
        </div>

        {/* PARTNER TYPES */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-emerald-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Vrste partnerstava</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-emerald-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-emerald-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-store text-emerald-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">Trgovci</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">
                Verificirani poslovni profil, prioritetno prikazivanje oglasa, analitika prodaje i pristup AI alatima za opis.
              </p>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-blue-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-blue-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-building text-blue-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">Agencije</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">
                Nekretninske i auto agencije dobijaju dashboard za upravljanje višestrukim ograsima, bulk upload i statistiku.
              </p>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-purple-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-purple-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-code text-purple-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">Tech Partneri</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">
                API pristup, integracije i zajednički razvoj novih funkcionalnosti. Gradimo ekosistem zajedno.
              </p>
            </div>
          </div>
        </div>

        {/* BENEFITS */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-emerald-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Prednosti partnerstva</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: 'fa-eye', label: 'Veća vidljivost', desc: 'Prioritetno prikazivanje' },
              { icon: 'fa-chart-pie', label: 'Analitika', desc: 'Detaljni izvještaji' },
              { icon: 'fa-headset', label: 'Podrška', desc: 'Dedicated account manager' },
              { icon: 'fa-badge-check', label: 'Verifikacija', desc: 'Verificirani badge' },
            ].map((b) => (
              <div key={b.label} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-4 text-center">
                <i className={`fa-solid ${b.icon} text-emerald-400 text-lg mb-2 block`}></i>
                <p className="text-[10px] font-black text-[var(--c-text)] uppercase">{b.label}</p>
                <p className="text-[9px] text-[var(--c-text3)] mt-0.5">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-8 border-t border-[var(--c-border)]">
          <p className="text-lg font-black text-[var(--c-text)] uppercase tracking-tight mb-2">
            Postani Partner
          </p>
          <p className="text-[10px] text-[var(--c-text3)] mb-4">partneri@nudinadi.com</p>
          <a href="mailto:partneri@nudinadi.com" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-[6px] text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all">
            <i className="fa-solid fa-handshake text-xs"></i>
            Kontaktiraj Nas
          </a>
        </div>
      </div>
    </MainLayout>
  );
}
