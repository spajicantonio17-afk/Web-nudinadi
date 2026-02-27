'use client';

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

export default function PartnersPage() {
  return (
    <MainLayout title="Partneri">
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <i className="fa-solid fa-bullhorn text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Partneri</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            REKLAMIRAJ SE<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">NA NUDINAĐI.</span>
          </h1>
          <div className="w-10 h-[3px] bg-emerald-500 mb-4"></div>
          <p className="text-[13px] text-[var(--c-text2)] leading-relaxed max-w-[560px]">
            Dosegni hiljade aktivnih kupaca i prodavaca u regiji. Ponudi svoj biznis tamo gdje ljudi već traže i kupuju.
          </p>
        </div>

        {/* WERBEFORMATE — 3 Cards */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-emerald-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Formati oglašavanja</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Sponzorisani Oglasi */}
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-emerald-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-emerald-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-arrow-up-right-dots text-emerald-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">Sponzorisani Oglasi</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">
                Tvoj oglas se prikazuje na vrhu rezultata pretrage. Više pregleda, više kupaca, brža prodaja.
              </p>
            </div>

            {/* Banner Reklame */}
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-blue-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-blue-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-rectangle-ad text-blue-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">Banner Reklame</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">
                Vizualni baneri na ključnim mjestima platforme. Idealno za brendove, kampanje i posebne ponude.
              </p>
            </div>

            {/* Istaknute Pozicije */}
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-purple-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-purple-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-star text-purple-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">Istaknute Pozicije</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">
                Tvoja firma istaknuta na naslovnoj stranici. Premium vidljivost za tvoj biznis, ispred konkurencije.
              </p>
            </div>

          </div>
        </div>

        {/* PREDNOSTI — 4 kleine Cards */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-emerald-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Zašto NudiNađi?</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: 'fa-users', label: 'Aktivna publika', desc: 'Kupci koji aktivno traže' },
              { icon: 'fa-location-dot', label: 'BiH & Hrvatska', desc: 'Lokalna ciljna grupa' },
              { icon: 'fa-chart-line', label: 'Mjerljivi rezultati', desc: 'Pregledi, klikovi, konverzije' },
              { icon: 'fa-sliders', label: 'Prilagođeno tebi', desc: 'Individualni paketi' },
            ].map((b) => (
              <div key={b.label} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-4 text-center">
                <i className={`fa-solid ${b.icon} text-emerald-400 text-lg mb-2 block`}></i>
                <p className="text-[10px] font-black text-[var(--c-text)] uppercase">{b.label}</p>
                <p className="text-[9px] text-[var(--c-text3)] mt-0.5">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* KO MOŽE OGLAŠAVATI */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-emerald-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Ko može oglašavati?</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: 'fa-store', label: 'Trgovine & Shopovi' },
              { icon: 'fa-car', label: 'Auto kuće & Saloni' },
              { icon: 'fa-building', label: 'Nekretninske agencije' },
              { icon: 'fa-screwdriver-wrench', label: 'Servisi & Zanatlije' },
              { icon: 'fa-utensils', label: 'Restorani & Kafići' },
              { icon: 'fa-briefcase', label: 'Svi biznisi' },
            ].map((item) => (
              <div key={item.label} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-4 flex items-center gap-3">
                <i className={`fa-solid ${item.icon} text-[var(--c-text3)] text-sm`}></i>
                <p className="text-[10px] font-bold text-[var(--c-text)]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-8 border-t border-[var(--c-border)]">
          <p className="text-lg font-black text-[var(--c-text)] uppercase tracking-tight mb-2">
            Zainteresovan/a?
          </p>
          <p className="text-[10px] text-[var(--c-text3)] mb-4 max-w-[400px] mx-auto">Kontaktiraj nas za individualni prijedlog. Svaki paket prilagođavamo tvojim potrebama i budžetu.</p>
          <Link href="/kontakt" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-[6px] text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all">
            <i className="fa-solid fa-paper-plane text-xs"></i>
            Pošalji Upit
          </Link>
          <p className="text-[10px] text-[var(--c-text3)] mt-3">
            ili direktno: <a href="mailto:info@nudinadi.com" className="text-emerald-400 font-bold hover:underline">info@nudinadi.com</a>
          </p>
          <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-[0.3em] mt-2">Odgovaramo u roku od 24 sata</p>
        </div>

      </div>
    </MainLayout>
  );
}