'use client';

import MainLayout from '@/components/layout/MainLayout';

export default function CookiesPage() {
  return (
    <MainLayout title="Kolačići">
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <i className="fa-solid fa-cookie-bite text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-orange-400 uppercase tracking-[0.2em]">Pravni dokumenti</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            POLITIKA<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">KOLAČIĆA.</span>
          </h1>
          <div className="w-10 h-[3px] bg-orange-500 mb-4"></div>
          <p className="text-[11px] text-[var(--c-text3)]">Posljednje ažuriranje: 01. januar 2025.</p>
        </div>

        {/* WHAT ARE COOKIES */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-orange-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Šta su kolačići?</p>
          </div>
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
              Kolačići (cookies) su male tekstualne datoteke koje se pohranjuju na vašem uređaju kada posjetite web stranicu. Pomažu stranici da zapamti vaše postavke, preferencije i poboljša korisničko iskustvo. NudiNađi koristi kolačiće u skladu sa zakonima Bosne i Hercegovine i EU regulativama.
            </p>
          </div>
        </div>

        {/* COOKIE TYPES */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-orange-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Vrste kolačića koje koristimo</p>
          </div>
          <div className="space-y-3">
            {[
              {
                type: 'Neophodni kolačići',
                required: true,
                icon: 'fa-shield-halved',
                color: 'emerald',
                desc: 'Ovi kolačići su neophodni za funkcionisanje platforme. Bez njih ne možete koristiti osnovne funkcije poput prijave, navigacije i sigurnosnih provjera.',
                examples: 'Sesija korisnika, CSRF zaštita, jezičke postavke',
              },
              {
                type: 'Analitički kolačići',
                required: false,
                icon: 'fa-chart-line',
                color: 'blue',
                desc: 'Pomažu nam da razumijemo kako korisnici koriste platformu. Prikupljamo anonimne podatke o posjetama, popularnim stranicama i načinu navigacije.',
                examples: 'Google Analytics, vlastita analitika pretrage',
              },
              {
                type: 'Funkcionalni kolačići',
                required: false,
                icon: 'fa-sliders',
                color: 'purple',
                desc: 'Pamte vaše postavke i preferencije — odabrana lokacija, preferirana kategorija, tema (svijetla/tamna) i historija pretrage.',
                examples: 'Lokacija, tema, posljednje pretrage, favoriti',
              },
              {
                type: 'Marketinški kolačići',
                required: false,
                icon: 'fa-bullhorn',
                color: 'orange',
                desc: 'Koristimo ih za prikazivanje relevantnih oglasa i mjerenje učinkovitosti kampanja. Možete ih u potpunosti isključiti bez uticaja na funkcionalnost.',
                examples: 'Facebook Pixel, Google Ads (planirano)',
              },
            ].map((cookie) => {
              const colorMap: Record<string, { bg: string; border: string; text: string; accent: string }> = {
                emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400', accent: 'border-emerald-500/40' },
                blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400', accent: 'border-blue-500/40' },
                purple: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400', accent: 'border-purple-500/40' },
                orange: { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400', accent: 'border-orange-500/40' },
              };
              const c = colorMap[cookie.color];
              return (
                <div key={cookie.type} className={`bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 hover:${c.accent} transition-colors relative overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-14 h-14 ${c.bg} rounded-bl-[35px]`}></div>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-[4px] ${c.bg} ${c.border} border flex items-center justify-center shrink-0`}>
                      <i className={`fa-solid ${cookie.icon} ${c.text} text-sm`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[12px] font-black text-[var(--c-text)]">{cookie.type}</h3>
                        {cookie.required && (
                          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-[4px] text-[8px] font-bold text-emerald-500 uppercase">Obavezni</span>
                        )}
                      </div>
                      <p className="text-[10px] text-[var(--c-text3)] leading-relaxed mb-2">{cookie.desc}</p>
                      <p className="text-[9px] text-[var(--c-text3)]"><span className="font-bold text-[var(--c-text)]">Primjeri:</span> {cookie.examples}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* HOW TO MANAGE */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-orange-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Upravljanje kolačićima</p>
          </div>
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed mb-3">
              Možete upravljati kolačićima na nekoliko načina:
            </p>
            <ul className="space-y-2">
              {[
                'Postavke pretraživača — većina pretraživača omogućava blokiranje ili brisanje kolačića',
                'Naše postavke — na dnu svake stranice možete prilagoditi kolačiće',
                'Brisanje — možete u svakom trenutku obrisati sve kolačiće iz svog pretraživača',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[10px] text-[var(--c-text3)]">
                  <i className="fa-solid fa-check text-orange-400 text-[8px] mt-1 shrink-0"></i>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="text-center py-8 border-t border-[var(--c-border)]">
          <p className="text-[10px] text-[var(--c-text3)]">Za pitanja o kolačićima: privatnost@nudinadi.com</p>
          <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-[0.3em] mt-2">NudiNađi d.o.o. — Sarajevo, BiH</p>
        </div>
      </div>
    </MainLayout>
  );
}
