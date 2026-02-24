'use client';

import MainLayout from '@/components/layout/MainLayout';

export default function AboutPage() {
  return (
    <MainLayout title="O Nama">
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] blue-gradient flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="font-black text-white italic text-base">N</span>
            </div>
            <div>
              <p className="text-[8px] font-bold text-blue-400 uppercase tracking-[0.2em]">O Nama</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            MIJENJAMO NAČIN<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">KAKO KUPUJEŠ I PRODAJEŠ.</span>
          </h1>
          <div className="w-10 h-[3px] bg-blue-500 mb-4"></div>
          <p className="text-[13px] text-[var(--c-text2)] leading-relaxed max-w-[560px]">
            NudiNađi je moderna marketplace platforma iz Bosne i Hercegovine. Koristimo AI tehnologiju da kupovinu i prodaju učinimo bržom, sigurnijom i pametnijom nego ikad.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { value: '2024', label: 'Godina Osnivanja', icon: 'fa-calendar' },
            { value: 'BiH', label: 'Sjedište', icon: 'fa-location-dot' },
            { value: 'AI', label: 'Powered', icon: 'fa-brain' },
            { value: '24/7', label: 'Dostupnost', icon: 'fa-clock' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5">
              <i className={`fa-solid ${stat.icon} text-[var(--c-text3)] text-lg mb-3 block`}></i>
              <p className="text-2xl font-black text-[var(--c-text)] leading-none mb-1">{stat.value}</p>
              <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* SECTION: MISIJA */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-blue-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Naša misija</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6 relative overflow-hidden hover:border-blue-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-blue-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-bullseye text-blue-400 text-sm"></i>
              </div>
              <h3 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">Vizija</h3>
              <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
                Stvoriti najinteligentniju marketplace platformu u regiji — gdje AI radi za tebe, ne obrnuto. Svaka pretraga, svaki oglas, svaka transakcija — pametnije.
              </p>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6 relative overflow-hidden hover:border-purple-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-purple-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-heart text-purple-400 text-sm"></i>
              </div>
              <h3 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">Vrijednosti</h3>
              <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
                Transparentnost, sigurnost i korisničko iskustvo su naši temelji. Vjerujemo da svaki korisnik zaslužuje platformu koja je brza, fer i pouzdana.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION: ŠTA NAS RAZLIKUJE */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-blue-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Šta nas razlikuje?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-blue-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-blue-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-wand-magic-sparkles text-blue-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">AI Pretraga</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">
                Napiši prirodno šta tražiš. AI razumije kategoriju, cijenu, lokaciju — sve automatski, bez filtera.
              </p>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-emerald-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-emerald-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-shield-halved text-emerald-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">AI Zaštita</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">
                Anti-scam detekcija, verifikacija identiteta i Trust Score — 24/7 monitoring za sigurne transakcije.
              </p>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-orange-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-orange-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-camera text-orange-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">Vizualna Prodaja</h3>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">
                Uslikaj predmet — AI ga prepoznaje, kategorizira i piše opis. Oglas online za 30 sekundi.
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM QUOTE */}
        <div className="text-center py-8 border-t border-[var(--c-border)]">
          <p className="text-lg font-black text-[var(--c-text)] uppercase tracking-tight mb-1">
            &ldquo;Budućnost trgovine počinje ovdje.&rdquo;
          </p>
          <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-[0.3em]">NudiNađi d.o.o. — Bosna i Hercegovina</p>
        </div>
      </div>
    </MainLayout>
  );
}
