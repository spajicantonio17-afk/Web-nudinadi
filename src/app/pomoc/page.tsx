'use client';

import { useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

const FAQ_ITEMS = [
  // Kupovina (4)
  { q: 'Kako kontaktirati prodavca?', a: 'Na stranici oglasa klikni "Pošalji poruku" da otvorite chat. Sva komunikacija ostaje na platformi radi sigurnosti.', cat: 'Kupovina' },
  { q: 'Kako kupiti proizvod?', a: 'Pronađi oglas, kontaktiraj prodavca putem chata, dogovorite detalje i način preuzimanja. NudiNađi ne vrši direktnu kupovinu — platforma povezuje kupce i prodavce.', cat: 'Kupovina' },
  { q: 'Mogu li rezervirati proizvod?', a: 'Trenutno ne postoji opcija rezervacije. Preporučujemo brzu komunikaciju s prodavcem da dogovorite preuzimanje.', cat: 'Kupovina' },
  { q: 'Postoji li zaštita za kupce?', a: 'NudiNađi pruža Trust Score sistem, verifikaciju profila i AI moderaciju oglasa. Uvijek komuniciraj putem platforme i nikad ne šalji novac unaprijed.', cat: 'Kupovina' },
  // Prodaja (4)
  { q: 'Kako postaviti oglas?', a: 'Klikni na "+" dugme, uslikaj predmet ili odaberi slike, ispuni detalje i klikni "Objavi". AI automatski prepoznaje kategoriju i predlaže opis — oglas je online za manje od 30 sekundi.', cat: 'Prodaja' },
  { q: 'Mogu li uređivati objavljen oglas?', a: 'Da. Idi na svoj profil → Moji oglasi, klikni na oglas i odaberi "Uredi". Možeš promijeniti cijenu, opis, slike i sve ostale detalje.', cat: 'Prodaja' },
  { q: 'Kako izbrisati oglas?', a: 'Idi na Profil → Moji oglasi, klikni na oglas i odaberi "Obriši". Oglas se trajno uklanja sa platforme.', cat: 'Prodaja' },
  { q: 'Koliko oglasa mogu imati?', a: 'Osnovno korištenje je besplatno i nema ograničenja na broj aktivnih oglasa. Premium opcije za isticanje oglasa dolaze uskoro.', cat: 'Prodaja' },
  // Pretraga (2)
  { q: 'Kako funkcioniše AI pretraga?', a: 'Napiši prirodno šta tražiš — npr. "BMW 320 do 15.000" ili "stan Sarajevo 3 sobe". AI razumije kategoriju, cijenu, lokaciju i stanje automatski, bez ručnog filtriranja.', cat: 'Pretraga' },
  { q: 'Mogu li sačuvati pretragu?', a: 'Da! Koristi opciju "Sačuvaj pretragu" i dobijaj obavještenja kad se pojavi novi oglas koji odgovara tvojim kriterijima.', cat: 'Pretraga' },
  // Sigurnost (4)
  { q: 'Kako se zaštititi od prevara?', a: 'Naš AI sistem skenira oglase 24/7 i detektuje sumnjive aktivnosti. Dodatno, provjeri Trust Score prodavca, nikad ne šalji novac unaprijed i koristi naš chat za komunikaciju.', cat: 'Sigurnost' },
  { q: 'Šta je Trust Score?', a: 'Trust Score je AI-generirani rezultat pouzdanosti korisnika. Bazira se na verifikaciji profila, historiji transakcija i ocjenama drugih korisnika.', cat: 'Sigurnost' },
  { q: 'Kako prijaviti sumnjiv oglas?', a: 'Na stranici oglasa klikni ikonu zastave i odaberi razlog prijave. Naš tim pregledava sve prijave u roku od 24 sata.', cat: 'Sigurnost' },
  { q: 'Kako verificirati svoj profil?', a: 'Idi na Postavke → Verifikacija. Možeš verificirati email adresu i broj telefona za veći Trust Score i povjerenje kupaca.', cat: 'Sigurnost' },
  // Općenito (4)
  { q: 'Je li NudiNađi besplatan?', a: 'Da! Osnovno korištenje je potpuno besplatno — postavljanje oglasa, pretraga i kontaktiranje prodavaca. Premium opcije (isticanje oglasa, verificirani profil) dolaze uskoro.', cat: 'Općenito' },
  { q: 'Kako obrisati korisnički račun?', a: 'Idi na Postavke → Profil → "Obriši račun". Svi tvoji podaci i oglasi bit će trajno uklonjeni u roku od 30 dana.', cat: 'Općenito' },
  { q: 'Na kojim lokacijama radi NudiNađi?', a: 'NudiNađi je dostupan u cijeloj Bosni i Hercegovini i Hrvatskoj. Planirano je širenje na cijeli region.', cat: 'Općenito' },
  { q: 'Kako promijeniti jezik aplikacije?', a: 'Idi na Postavke → Jezik. Dostupni jezici: Hrvatski/Bosanski i Engleski.', cat: 'Općenito' },
  // Dostava (2)
  { q: 'Kako funkcioniše dostava?', a: 'NudiNađi ne organizira dostavu — kupac i prodavac sami dogovaraju način preuzimanja (lično preuzimanje, pošta, kurirska služba).', cat: 'Dostava' },
  { q: 'Ko plaća dostavu?', a: 'To dogovaraju kupac i prodavac međusobno. Preporučujemo da se detalji dostave dogovore prije finalizacije kupovine.', cat: 'Dostava' },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState('Sve');

  const categories = ['Sve', ...Array.from(new Set(FAQ_ITEMS.map(f => f.cat)))];
  const filtered = activeFilter === 'Sve' ? FAQ_ITEMS : FAQ_ITEMS.filter(f => f.cat === activeFilter);

  return (
    <MainLayout title="Pomoć">
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <i className="fa-solid fa-circle-question text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-blue-400 uppercase tracking-[0.2em]">Pomoć &amp; FAQ</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            KAKO TI<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">MOŽEMO POMOĆI?</span>
          </h1>
          <div className="w-10 h-[3px] bg-blue-500 mb-4"></div>
          <p className="text-[13px] text-[var(--c-text2)] leading-relaxed max-w-[560px]">
            Pronađi odgovore na najčešća pitanja. Ako ne nađeš odgovor, kontaktiraj nas direktno.
          </p>
        </div>

        {/* QUICK HELP CARDS */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-blue-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Brza pomoć</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: 'fa-plus-circle', label: 'Postavi oglas', desc: 'Kako objaviti', filterCat: 'Prodaja' },
              { icon: 'fa-magnifying-glass', label: 'Pretraga', desc: 'AI pretraga', filterCat: 'Pretraga' },
              { icon: 'fa-shield-halved', label: 'Sigurnost', desc: 'Zaštiti se', filterCat: 'Sigurnost' },
              { icon: 'fa-user', label: 'Profil', desc: 'Postavke računa', filterCat: 'Općenito' },
            ].map((h) => (
              <div
                key={h.label}
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
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Česta pitanja</p>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3 py-1.5 rounded-[4px] text-[10px] font-bold border transition-all ${
                  activeFilter === cat
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-[var(--c-hover)] text-[var(--c-text3)] border-[var(--c-border)] hover:border-blue-500/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Accordion */}
          <div className="space-y-2">
            {filtered.map((faq, i) => (
              <div key={faq.q} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] overflow-hidden hover:border-blue-500/40 transition-colors">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-[4px] text-[8px] font-bold text-blue-500 uppercase shrink-0">{faq.cat}</span>
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
            Nisi našao odgovor?
          </p>
          <p className="text-[10px] text-[var(--c-text3)] mb-4">Kontaktiraj nas direktno — odgovaramo brzo.</p>
          <Link href="/kontakt" className="inline-flex items-center gap-2 px-6 py-3 blue-gradient text-white rounded-[6px] text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transition-all">
            <i className="fa-solid fa-paper-plane text-xs"></i>
            Klikni ovdje
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
