'use client';

import MainLayout from '@/components/layout/MainLayout';

export default function TermsPage() {
  return (
    <MainLayout title="Uvjeti korištenja">
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center shadow-lg shadow-gray-500/30">
              <i className="fa-solid fa-file-contract text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-[var(--c-text-muted)] uppercase tracking-[0.2em]">Pravni dokumenti</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            UVJETI<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600">KORIŠTENJA.</span>
          </h1>
          <div className="w-10 h-[3px] bg-[var(--c-text-muted)] mb-4"></div>
          <p className="text-[11px] text-[var(--c-text3)]">Posljednje ažuriranje: 01. januar 2025.</p>
        </div>

        {/* CONTENT */}
        <div className="space-y-8">
          {[
            {
              title: '1. Opći uvjeti',
              content: 'Korištenjem NudiNađi platforme (web stranica i mobilna aplikacija) prihvatate ove Uvjete korištenja u cijelosti. NudiNađi d.o.o. zadržava pravo izmjene ovih uvjeta u bilo kojem trenutku. O značajnim promjenama ćete biti obaviješteni putem e-maila ili obavijesti na platformi.',
            },
            {
              title: '2. Korisnički račun',
              content: 'Za korištenje određenih funkcija platforme potrebno je kreirati korisnički račun. Korisnik je odgovoran za tačnost podataka, sigurnost lozinke i sve aktivnosti koje se odvijaju pod njihovim računom. NudiNađi zadržava pravo suspendovanja ili brisanja računa koji krše ove uvjete.',
            },
            {
              title: '3. Pravila objavljivanja oglasa',
              content: 'Korisnici se obavezuju da će objavljivati samo istinite i tačne oglase. Zabranjeno je objavljivanje ilegalnih proizvoda, krivotvorina, ukradene robe, oružja, droga ili bilo čega što krši zakone Bosne i Hercegovine. NudiNađi koristi AI sisteme za automatsku detekciju nedozvoljenog sadržaja.',
            },
            {
              title: '4. Transakcije',
              content: 'NudiNađi je platforma koja povezuje kupce i prodavce. Ne učestvujemo direktno u transakcijama i ne garantujemo kvalitet, sigurnost ili zakonitost oglašenih predmeta. Preporučujemo korištenje sigurnih metoda plaćanja i preuzimanje na javnim mjestima.',
            },
            {
              title: '5. Intelektualno vlasništvo',
              content: 'Sav sadržaj na platformi (dizajn, logotipi, tekstovi, softver, AI algoritmi) je vlasništvo NudiNađi d.o.o. ili licencirano. Korisnički sadržaj (slike, opisi oglasa) ostaje vlasništvo korisnika, ali korištenjem platforme dajete NudiNađi neekskluzivnu licencu za prikazivanje tog sadržaja.',
            },
            {
              title: '6. Privatnost i zaštita podataka',
              content: 'Obradu osobnih podataka reguliše naša Politika privatnosti. Prikupljamo samo podatke neophodne za funkcionisanje platforme. Detaljne informacije o obradi podataka dostupne su u našoj Politici privatnosti.',
            },
            {
              title: '7. Ograničenje odgovornosti',
              content: 'NudiNađi ne snosi odgovornost za: (a) kvalitet ili stanje oglašenih predmeta, (b) ponašanje korisnika, (c) gubitak nastao korištenjem platforme, (d) privremenu nedostupnost servisa. Platforma se pruža "kao što jeste" bez ikakvih garancija.',
            },
            {
              title: '8. Rješavanje sporova',
              content: 'Na ove uvjete primjenjuje se pravo Bosne i Hercegovine. Za sporove koji se ne mogu riješiti mirnim putem nadležan je sud u Sarajevu.',
            },
          ].map((section) => (
            <div key={section.title} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
              <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">{section.title}</h2>
              <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* BOTTOM */}
        <div className="text-center py-8 mt-8 border-t border-[var(--c-border)]">
          <p className="text-[10px] text-[var(--c-text3)]">Za pitanja o uvjetima korištenja kontaktirajte: pravno@nudinadi.com</p>
          <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-[0.3em] mt-2">NudiNađi d.o.o. — Sarajevo, BiH</p>
        </div>
      </div>
    </MainLayout>
  );
}
