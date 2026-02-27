'use client';

import Link from 'next/link';
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
        </div>

        {/* CONTENT */}
        <div className="space-y-8">

          {/* 1. Opći uvjeti */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">1. Opći uvjeti</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
              Korištenjem NudiNađi platforme (web stranica i mobilna aplikacija) prihvatate ove Uvjete korištenja u cijelosti. NudiNađi zadržava pravo izmjene ovih uvjeta u bilo kojem trenutku. O značajnim promjenama ćete biti obaviješteni putem e-maila ili obavijesti na platformi.
            </p>
          </div>

          {/* 2. Korisnički račun */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">2. Korisnički račun</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
              Za korištenje određenih funkcija platforme potrebno je kreirati korisnički račun. Minimalni uzrast za registraciju i korištenje platforme je 18 godina — korisnici mlađi od 18 godina ne smiju koristiti NudiNađi platformu. Korisnik je odgovoran za tačnost podataka, sigurnost lozinke i sve aktivnosti koje se odvijaju pod njihovim računom. NudiNađi zadržava pravo suspendovanja ili brisanja računa koji krše ove uvjete.
            </p>
          </div>

          {/* 3. Pravila objavljivanja oglasa */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">3. Pravila objavljivanja oglasa</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed mb-3">
              Korisnici se obavezuju da će objavljivati samo istinite i tačne oglase. NudiNađi koristi AI sisteme za automatsku detekciju nedozvoljenog sadržaja. Strogo je zabranjeno objavljivanje sljedećih kategorija:
            </p>
            <ul className="text-[11px] text-[var(--c-text3)] leading-relaxed list-disc list-inside space-y-1">
              <li>Oružje i municija</li>
              <li>Droge i narkotici</li>
              <li>Ukradena roba</li>
              <li>Krivotvoreni proizvodi</li>
              <li>Lažni dokumenti i identifikacije</li>
              <li>Lijekovi i medicinski preparati bez odobrenja</li>
              <li>Živa bića (životinje koje se prodaju ilegalno)</li>
              <li>Duhanski proizvodi i e-cigarete</li>
              <li>Pornografski ili seksualno eksplicitan sadržaj</li>
              <li>Sve što krši zakone Bosne i Hercegovine i Republike Hrvatske</li>
            </ul>
          </div>

          {/* 4. Transakcije */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">4. Transakcije</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
              NudiNađi je platforma koja povezuje kupce i prodavce. Ne učestvujemo direktno u transakcijama i ne garantujemo kvalitet, sigurnost ili zakonitost oglašenih predmeta. Preporučujemo korištenje sigurnih metoda plaćanja i preuzimanje na javnim mjestima.
            </p>
          </div>

          {/* 5. Intelektualno vlasništvo */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">5. Intelektualno vlasništvo</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
              Sav sadržaj na platformi (dizajn, logotipi, tekstovi, softver, AI algoritmi) je vlasništvo NudiNađi ili licencirano. Korisnički sadržaj (slike, opisi oglasa) ostaje vlasništvo korisnika, ali korištenjem platforme dajete NudiNađi neekskluzivnu licencu za prikazivanje tog sadržaja.
            </p>
          </div>

          {/* 6. Privatnost i zaštita podataka */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">6. Privatnost i zaštita podataka</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
              Obradu osobnih podataka reguliše naša Politika privatnosti. Prikupljamo samo podatke neophodne za funkcionisanje platforme. Detaljne informacije dostupne su u našoj <Link href="/privatnost" className="text-blue-500 font-bold hover:underline">Politici privatnosti</Link>.
            </p>
          </div>

          {/* 7. Ograničenje odgovornosti */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">7. Ograničenje odgovornosti</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
              NudiNađi ne snosi odgovornost za: (a) kvalitet ili stanje oglašenih predmeta, (b) ponašanje korisnika, (c) gubitak nastao korištenjem platforme, (d) privremenu nedostupnost servisa. Platforma se pruža &quot;kao što jeste&quot; bez ikakvih garancija.
            </p>
          </div>

          {/* 8. Rješavanje sporova */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">8. Rješavanje sporova</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
              Za korisnike iz Bosne i Hercegovine primjenjuje se pravo Bosne i Hercegovine. Za korisnike iz Hrvatske primjenjuju se zakoni Republike Hrvatske, uključujući propise Europske unije. Sporovi koji se ne mogu riješiti mirnim putem rješavaju se prema nadležnosti korisnikovog prebivališta.
            </p>
          </div>

          {/* 9. Pravila komunikacije */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">9. Pravila komunikacije</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed mb-3">
              Sva komunikacija između korisnika treba se odvijati putem NudiNađi chat sistema. Zabranjeno je sljedeće ponašanje:
            </p>
            <ul className="text-[11px] text-[var(--c-text3)] leading-relaxed list-disc list-inside space-y-1">
              <li>Uznemiravanje, prijetnje ili govor mržnje</li>
              <li>Slanje spam poruka</li>
              <li>Slanje phishing linkova</li>
              <li>Pokušaji preusmjeravanja na vanjske platforme radi prevare</li>
            </ul>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed mt-3">
              NudiNađi AI sistemi automatski skeniraju poruke radi zaštite korisnika.
            </p>
          </div>

          {/* 10. Kršenje uvjeta i sankcije */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">10. Kršenje uvjeta i sankcije</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed mb-3">
              U slučaju kršenja ovih uvjeta, NudiNađi primjenjuje sljedeći sistem sankcija:
            </p>
            <ul className="text-[11px] text-[var(--c-text3)] leading-relaxed list-disc list-inside space-y-1">
              <li><strong>Prvo kršenje:</strong> Upozorenje putem e-maila</li>
              <li><strong>Ponovljeno kršenje:</strong> Privremena suspenzija računa (7–30 dana)</li>
              <li><strong>Teško ili ponovljeno kršenje:</strong> Trajno brisanje računa bez prava na povrat</li>
            </ul>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed mt-3">
              NudiNađi zadržava pravo da bez prethodne najave ukloni sadržaj koji krši pravila.
            </p>
          </div>

          {/* 11. Brisanje korisničkog računa */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">11. Brisanje korisničkog računa</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
              Korisnik može u svakom trenutku zatražiti brisanje računa putem Postavke → Profil. Nakon zahtjeva, svi osobni podaci bit će trajno uklonjeni u roku od 30 dana. Aktivni oglasi se odmah deaktiviraju, a poruke i chat historija se anonimiziraju. Za pomoć pri brisanju računa možete kontaktirati našu <Link href="/kontakt" className="text-blue-500 font-bold hover:underline">podršku</Link>.
            </p>
          </div>

          {/* 12. Završne odredbe */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">12. Završne odredbe</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
              Ovi uvjeti stupaju na snagu korištenjem platforme. NudiNađi zadržava pravo izmjene uvjeta uz prethodnu obavijest korisnicima. Nevaljanost pojedine odredbe ne utječe na valjanost ostalih odredbi ovih Uvjeta korištenja.
            </p>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="text-center py-8 mt-8 border-t border-[var(--c-border)]">
          <p className="text-[10px] text-[var(--c-text3)]">Za pitanja o uvjetima korištenja: <Link href="/kontakt" className="text-blue-500 font-bold hover:underline">Kontaktiraj nas</Link></p>
          <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-[0.3em] mt-2">NudiNađi platforma</p>
        </div>
      </div>
    </MainLayout>
  );
}