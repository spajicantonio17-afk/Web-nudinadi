'use client';

import { useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

const SAFETY_TIPS = [
  {
    icon: 'fa-money-bill-wave',
    title: 'Nikad ne šalji novac unaprijed',
    text: 'Ne vrši bankovni transfer, Western Union ili slične uplate osobi koju ne poznaješ. Ako prodavac insistira na uplati prije nego što vidiš proizvod — to je najčešći znak prevare.',
  },
  {
    icon: 'fa-comments',
    title: 'Komuniciraj preko platforme',
    text: 'Koristi isključivo NudiNađi chat za dogovor. Ako nešto krene po zlu, chat služi kao dokaz. Prevarant će te uvijek pokušati prebaciti na WhatsApp, Viber ili SMS — ne pristaj.',
  },
  {
    icon: 'fa-star',
    title: 'Provjeri Trust Score prodavca',
    text: 'Prije kupovine pogledaj Trust Score i profil prodavca. Verificiran profil, pozitivne ocjene i duže članstvo su dobri znakovi. Novi profil bez ocjena zahtijeva dodatni oprez.',
  },
  {
    icon: 'fa-flag',
    title: 'Prijavi sumnjive oglase',
    text: 'Ako nešto izgleda sumnjivo — cijena, slike ili ponašanje prodavca — koristi \'Prijavi\' dugme na oglasu. Naš tim pregledava svaku prijavu u roku od 24 sata.',
  },
  {
    icon: 'fa-map-pin',
    title: 'Susreti na javnim mjestima',
    text: 'Kod ličnog preuzimanja odaberi prometno, javno mjesto (tržni centar, benzinska pumpa). Nemoj ići sam/sama i obavijesti nekoga gdje ideš i s kim se nalaziš.',
  },
  {
    icon: 'fa-box-open',
    title: 'Plaćanje pouzećem — otvori paket',
    text: 'Ako kupuješ poštom i plaćaš pouzećem, dogovori s prodavcem unaprijed pravo na pregled. Otvori paket pred dostavljačem i provjeri sadržaj prije nego što platiš.',
  },
  {
    icon: 'fa-tag',
    title: 'Cijena koja je previše dobra',
    text: 'Ako je cijena znatno ispod tržišne vrijednosti, budi na oprezu. iPhone za 100 EUR ili auto za 500 EUR je gotovo uvijek prevara. Usporedi cijene sa sličnim oglasima.',
  },
  {
    icon: 'fa-ticket',
    title: 'Ne šalji bonove i kupone',
    text: 'Nikad ne kupuj Paysafe, Google Play, Steam ili druge bonove/vaučere po zahtjevu prodavca ili kupca. Ovo je klasična prevara — kod bona je nepovratno iskorišten čim ga pošalješ.',
  },
];

const REPORT_STEPS = [
  {
    icon: 'fa-flag',
    title: 'Klikni zastavu',
    text: 'Na stranici oglasa klikni ikonu zastave u gornjem desnom uglu.',
  },
  {
    icon: 'fa-list-check',
    title: 'Odaberi razlog',
    text: 'Odaberi kategoriju prijave: lažni oglas, prevara, zabranjeni sadržaj ili drugo.',
  },
  {
    icon: 'fa-clock',
    title: 'Tim reaguje',
    text: 'Naš tim pregledava prijavu i poduzima mjere u roku od 24 sata. Bićeš obaviješten o ishodu.',
  },
];

export default function SecurityPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
            { value: '3', label: 'Sigurnosna Sistema', icon: 'fa-layer-group' },
            { value: '256-bit', label: 'Enkripcija', icon: 'fa-lock' },
            { value: 'Besplatno', label: 'Za sve korisnike', icon: 'fa-heart' },
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

        {/* SAFETY TIPS — ACCORDION */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-emerald-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Savjeti za sigurnu kupovinu</p>
          </div>
          <div className="space-y-2">
            {SAFETY_TIPS.map((tip, i) => (
              <div key={tip.title} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] overflow-hidden hover:border-emerald-500/40 transition-colors">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[4px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <i className={`fa-solid ${tip.icon} text-emerald-400 text-[11px]`}></i>
                    </div>
                    <span className="text-[12px] font-bold text-[var(--c-text)]">{tip.title}</span>
                  </div>
                  <i className={`fa-solid fa-chevron-down text-[var(--c-text3)] text-[10px] transition-transform ${openIndex === i ? 'rotate-180' : ''}`}></i>
                </button>
                {openIndex === i && (
                  <div className="px-4 pb-4 pt-0 border-t border-[var(--c-border)]">
                    <p className="text-[11px] text-[var(--c-text3)] leading-relaxed pt-3">{tip.text}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* KAKO PRIJAVITI OGLAS — STEP BY STEP */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-emerald-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Kako prijaviti oglas?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {REPORT_STEPS.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 text-center h-full">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                    <span className="text-[13px] font-black text-emerald-400">{i + 1}</span>
                  </div>
                  <div className="w-9 h-9 rounded-[4px] bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                    <i className={`fa-solid ${step.icon} text-emerald-400 text-sm`}></i>
                  </div>
                  <h4 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">{step.title}</h4>
                  <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">{step.text}</p>
                </div>
                {/* Connector arrow (hidden on last step and on mobile) */}
                {i < REPORT_STEPS.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-[11px] -translate-y-1/2 z-10">
                    <i className="fa-solid fa-chevron-right text-emerald-500/50 text-[10px]"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PRIVACY HINT */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-[12px] px-4 py-3 mb-6 flex items-center gap-2.5">
          <i className="fa-solid fa-lock text-emerald-500 text-sm shrink-0"></i>
          <p className="text-[11px] text-[var(--c-text2)] leading-relaxed">
            Tvoji podaci su sigurni. Pogledaj našu <Link href="/privatnost" className="text-emerald-500 font-bold hover:underline">Politiku privatnosti</Link> za detalje.
          </p>
        </div>

        {/* REPORT */}
        <div className="text-center py-8 border-t border-[var(--c-border)]">
          <p className="text-lg font-black text-[var(--c-text)] uppercase tracking-tight mb-2">
            Prijavi Problem
          </p>
          <p className="text-[10px] text-[var(--c-text3)] mb-4">Ako si žrtva prevare ili vidiš sumnjive aktivnosti, odmah nas kontaktiraj.</p>
          <Link href="/kontakt" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-[6px] text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transition-all">
            <i className="fa-solid fa-shield-halved text-xs"></i>
            Prijavi Odmah
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}