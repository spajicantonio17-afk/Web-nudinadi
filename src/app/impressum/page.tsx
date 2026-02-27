'use client';

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

export default function ImpressumPage() {
  return (
    <MainLayout title="Impressum">
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center shadow-lg shadow-gray-500/30">
              <i className="fa-solid fa-building-columns text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-[var(--c-text-muted)] uppercase tracking-[0.2em]">Pravni dokumenti</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            IMPRESSUM.
          </h1>
          <div className="w-10 h-[3px] bg-[var(--c-text-muted)] mb-4"></div>
        </div>

        {/* CONTENT */}
        <div className="space-y-8">

          {/* Betreiber */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-4">Operater platforme</h2>
            <div className="space-y-3 text-[11px] text-[var(--c-text3)] leading-relaxed">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-building text-[var(--c-text3)] text-xs mt-0.5 w-4 text-center"></i>
                <div>
                  <p className="font-bold text-[var(--c-text)]">NudiNađi</p>
                  <p className="text-[10px] text-[var(--c-text3)] italic">Registracija firme u toku</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-envelope text-[var(--c-text3)] text-xs mt-0.5 w-4 text-center"></i>
                <div>
                  <p className="font-bold text-[var(--c-text)]">info@nudinadi.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-globe text-[var(--c-text3)] text-xs mt-0.5 w-4 text-center"></i>
                <div>
                  <p className="font-bold text-[var(--c-text)]">nudinadi.ba</p>
                </div>
              </div>
            </div>
          </div>

          {/* Odgovorna osoba */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-4">Odgovorna osoba</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
              Podaci o odgovornoj osobi bit će objavljeni nakon registracije firme.
            </p>
          </div>

          {/* Kontakt */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-4">Kontakt</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed mb-3">
              Za sva pitanja, prijedloge ili pravne upite možete nas kontaktirati putem:
            </p>
            <div className="space-y-2 text-[11px] text-[var(--c-text3)]">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-envelope text-[var(--c-text3)] text-xs w-4 text-center"></i>
                <a href="mailto:info@nudinadi.com" className="text-blue-500 font-bold hover:underline">info@nudinadi.com</a>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-paper-plane text-[var(--c-text3)] text-xs w-4 text-center"></i>
                <Link href="/kontakt" className="text-blue-500 font-bold hover:underline">Kontakt forma</Link>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-4">Odricanje od odgovornosti</h2>
            <div className="space-y-3 text-[11px] text-[var(--c-text3)] leading-relaxed">
              <p>
                NudiNađi je platforma koja omogućava korisnicima objavljivanje i pretraživanje oglasa. NudiNađi nije strana u transakcijama između korisnika i ne preuzima odgovornost za sadržaj oglasa, kvalitetu ponuđenih proizvoda ili usluga, niti za ponašanje korisnika.
              </p>
              <p>
                Sadržaj na ovoj platformi može sadržavati linkove na eksterne web stranice. Za sadržaj tih stranica odgovorni su isključivo njihovi operateri.
              </p>
            </div>
          </div>

          {/* Autorska prava */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6">
            <h2 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-4">Autorska prava</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
              Sav sadržaj platforme NudiNađi (tekstovi, grafike, logotipi, ikone, softver) zaštićen je autorskim pravima. Reprodukcija, distribucija ili bilo kakva upotreba bez izričitog pisanog odobrenja nije dozvoljena.
            </p>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="text-center py-8 border-t border-[var(--c-border)] mt-10">
          <p className="text-[10px] text-[var(--c-text3)] mb-3">Zadnje ažuriranje: Februar 2026</p>
          <Link href="/kontakt" className="inline-flex items-center gap-2 text-[11px] text-blue-500 font-bold hover:underline">
            <i className="fa-solid fa-paper-plane text-xs"></i>
            Kontaktiraj nas
          </Link>
        </div>

      </div>
    </MainLayout>
  );
}
