'use client';

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

export default function PrivacyPage() {
  return (
    <MainLayout title="Privatnost">
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <i className="fa-solid fa-lock text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Pravni dokumenti</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            POLITIKA<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">PRIVATNOSTI.</span>
          </h1>
          <div className="w-10 h-[3px] bg-emerald-500 mb-4"></div>
        </div>

        {/* CONTENT */}
        <div className="space-y-8">

          {/* 1. Koji podaci se prikupljaju */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">1. Koji podaci se prikupljaju</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">Prikupljamo: (a) podatke koje sami pružite — ime, email, broj telefona, lokaciju prilikom registracije; (b) podatke o korištenju — pretrage, klikovi, vrijeme na stranici; (c) tehničke podatke — IP adresa, tip uređaja, verzija pretraživača. Prikupljamo samo minimum podataka neophodnih za rad platforme.</p>
          </div>

          {/* 2. Kako koristimo vaše podatke */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">2. Kako koristimo vaše podatke</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">Vaše podatke koristimo za: pružanje usluga platforme, personalizaciju pretrage i preporuka (AI sistemi), poboljšanje korisničkog iskustva, sigurnosne provjere i prevenciju prevara, komunikaciju o vašem računu i slanje obavijesti (uz vašu saglasnost).</p>
          </div>

          {/* 3. AI obrada podataka */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">3. AI obrada podataka</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">Naši AI sistemi analiziraju obrasce korištenja za: pametnu pretragu (NLP obrada upita), automatsku kategorizaciju oglasa, detekciju prevara i sumnjivih aktivnosti, Trust Score izračunavanje. AI obrada se vrši na anonimiziranim podacima gdje god je to moguće.</p>
          </div>

          {/* 4. Dijeljenje podataka */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">4. Dijeljenje podataka</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">Ne prodajemo vaše osobne podatke trećim stranama. Podatke dijelimo samo sa: pružaocima usluga koji nam pomažu u radu (hosting, analitika), nadležnim organima kada je to zakonski obavezno, drugim korisnicima samo u mjeri u kojoj je neophodno za transakcije (npr. kontakt za oglas).</p>
          </div>

          {/* 5. Vaša prava */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">5. Vaša prava</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">Imate pravo na: pristup vašim podacima, ispravku netačnih podataka, brisanje podataka (&ldquo;pravo na zaborav&rdquo;), ograničenje obrade, prenosivost podataka, prigovor na obradu. Za ostvarivanje ovih prava kontaktirajte nas putem <Link href="/kontakt" className="text-emerald-400 font-bold hover:underline">kontakt forme</Link>.</p>
          </div>

          {/* 6. Sigurnost podataka */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">6. Sigurnost podataka</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">Koristimo industrijske standarde zaštite: 256-bit SSL enkripciju, redovne sigurnosne audite, ograničen pristup podacima. Podaci se čuvaju na sigurnim serverima unutar EU.</p>
          </div>

          {/* 7. Kolačići */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">7. Kolačići</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">Koristimo kolačiće za funkcionisanje platforme, analitiku i personalizaciju. Detaljne informacije dostupne su na našoj stranici <Link href="/kolacici" className="text-emerald-400 font-bold hover:underline">Kolačići</Link>. Možete upravljati kolačićima kroz postavke pretraživača.</p>
          </div>

          {/* 8. Kontakt za privatnost */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">8. Kontakt za privatnost</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">Za sva pitanja o privatnosti i zaštiti podataka, kontaktirajte nas putem <Link href="/kontakt" className="text-emerald-400 font-bold hover:underline">kontakt forme</Link>. Odgovaramo u roku od 30 dana.</p>
          </div>

          {/* 9. Čuvanje podataka */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">9. Čuvanje podataka</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">Osobni podaci računa čuvaju se dok je račun aktivan. Nakon brisanja računa, podaci se trajno brišu u roku od 30 dana. Oglasi se čuvaju 6 mjeseci nakon deaktivacije. Chat poruke se anonimiziraju nakon brisanja računa. Logovi aktivnosti čuvaju se 12 mjeseci u svrhu sigurnosti.</p>
          </div>

          {/* 10. Maloljetnici */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">10. Maloljetnici</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">NudiNađi platforma nije namijenjena osobama mlađim od 18 godina. Ne prikupljamo svjesno osobne podatke od maloljetnika. Ako saznamo da smo prikupili podatke maloljetnika, odmah ćemo ih obrisati. Roditelji ili zakonski zastupnici mogu nas kontaktirati putem <Link href="/kontakt" className="text-emerald-400 font-bold hover:underline">kontakt forme</Link>.</p>
          </div>

          {/* 11. Primjenjivo pravo */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">11. Primjenjivo pravo</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">Za korisnike iz BiH primjenjuje se Zakon o zaštiti osobnih podataka BiH. Za korisnike iz Hrvatske primjenjuju se zakoni RH i propisi Europske unije (GDPR). Korisnici iz EU imaju dodatna prava prema GDPR-u uključujući pravo na prenosivost podataka i pravo na prigovor nadzornom tijelu.</p>
          </div>

          {/* 12. Promjene politike privatnosti */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-3">12. Promjene politike privatnosti</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">NudiNađi zadržava pravo izmjene ove politike. O značajnim promjenama korisnici će biti obaviješteni putem e-maila ili obavijesti na platformi. Nastavak korištenja platforme nakon izmjena smatra se prihvatanjem novih uvjeta.</p>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="text-center py-8 mt-8 border-t border-[var(--c-border)]">
          <p className="text-[10px] text-[var(--c-text3)]">Pitanja o privatnosti: <Link href="/kontakt" className="text-emerald-400 font-bold hover:underline">Kontaktiraj nas</Link></p>
          <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-[0.3em] mt-2">NudiNađi platforma</p>
        </div>
      </div>
    </MainLayout>
  );
}