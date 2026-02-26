'use client';

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
          <p className="text-[11px] text-[var(--c-text3)]">Posljednje ažuriranje: 01. januar 2025.</p>
        </div>

        {/* CONTENT */}
        <div className="space-y-8">
          {[
            {
              title: '1. Koji podaci se prikupljaju',
              content: 'Prikupljamo: (a) podatke koje sami pružite — ime, email, broj telefona, lokaciju prilikom registracije; (b) podatke o korištenju — pretrage, klikovi, vrijeme na stranici; (c) tehničke podatke — IP adresa, tip uređaja, verzija pretraživača. Prikupljamo samo minimum podataka neophodnih za rad platforme.',
            },
            {
              title: '2. Kako koristimo vaše podatke',
              content: 'Vaše podatke koristimo za: pružanje usluga platforme, personalizaciju pretrage i preporuka (AI sistemi), poboljšanje korisničkog iskustva, sigurnosne provjere i prevenciju prevara, komunikaciju o vašem računu i slanje obavijesti (uz vašu saglasnost).',
            },
            {
              title: '3. AI obrada podataka',
              content: 'Naši AI sistemi analiziraju obrasce korištenja za: pametnu pretragu (NLP obrada upita), automatsku kategorizaciju oglasa, detekciju prevara i sumnjivih aktivnosti, Trust Score izračunavanje. AI obrada se vrši na anonimiziranim podacima gdje god je to moguće.',
            },
            {
              title: '4. Dijeljenje podataka',
              content: 'Ne prodajemo vaše osobne podatke trećim stranama. Podatke dijelimo samo sa: pružaocima usluga koji nam pomažu u radu (hosting, analitika), nadležnim organima kada je to zakonski obavezno, drugim korisnicima samo u mjeri u kojoj je neophodno za transakcije (npr. kontakt za oglas).',
            },
            {
              title: '5. Vaša prava',
              content: 'Imate pravo na: pristup vašim podacima, ispravku netačnih podataka, brisanje podataka ("pravo na zaborav"), ograničenje obrade, prenosivost podataka, prigovor na obradu. Za ostvarivanje prava kontaktirajte: privatnost@nudinadi.com.',
            },
            {
              title: '6. Sigurnost podataka',
              content: 'Koristimo industijske standarde zaštite: 256-bit SSL enkripciju, dvofaktorsku autentifikaciju, redovne sigurnosne audite, ograničen pristup podacima. Podaci se čuvaju na sigurnim serverima unutar EU.',
            },
            {
              title: '7. Kolačići',
              content: 'Koristimo kolačiće za funkcionisanje platforme, analitiku i personalizaciju. Detaljne informacije o kolačićima dostupne su u našoj Politici kolačića. Možete upravljati kolačićima kroz postavke pretraživača.',
            },
            {
              title: '8. Kontakt za privatnost',
              content: 'Za sva pitanja o privatnosti i zaštiti podataka, kontaktirajte našeg službenika za zaštitu podataka na: privatnost@nudinadi.com. Odgovaramo u roku od 30 dana.',
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
          <p className="text-[10px] text-[var(--c-text3)]">Službenik za zaštitu podataka: privatnost@nudinadi.com</p>
          <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-[0.3em] mt-2">NudiNađi d.o.o. — Sarajevo, BiH</p>
        </div>
      </div>
    </MainLayout>
  );
}
