'use client';

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

const FEATURES = [
  { name: 'Objavljivanje oglasa', free: '10 aktivnih', pro: '30 aktivnih', business: 'Neograničeno' },
  { name: 'Slike po oglasu', free: 'Do 7', pro: 'Do 20', business: 'Neograničeno' },
  { name: 'Pretraga i filteri', free: true, pro: true, business: true },
  { name: 'AI Pretraga / Kategorija', free: true, pro: true, business: true },
  { name: 'Chat s kupcima i prodavačima', free: true, pro: true, business: true },
  { name: 'Favoriti', free: true, pro: true, business: true },
  { name: 'AI Link-Import', free: true, pro: true, business: true },
  { name: 'AI Opis (generisanje teksta)', free: false, pro: true, business: true },
  { name: 'AI VIN Dekoder', free: false, pro: true, business: true },
  { name: 'Statistike (pregledi, klikovi)', free: false, pro: true, business: true },
  { name: 'Pro značka na profilu', free: false, pro: true, business: true },
  { name: 'Prioritet u rezultatima pretrage', free: false, pro: true, business: true },
  { name: 'AI Foto → Oglas (samo u aplikaciji)', free: false, pro: false, business: true },
  { name: 'AI OCR (skeniranje auto dijelova)', free: false, pro: false, business: true },
  { name: 'Bulk Upload (višestruko objavljivanje)', free: false, pro: false, business: true },
  { name: 'Verificirani poslovni profil', free: false, pro: false, business: true },
  { name: 'Analitički dashboard', free: false, pro: false, business: true },
  { name: 'Timski računi', free: false, pro: false, business: true },
  { name: 'Prioritetna podrška', free: false, pro: false, business: true },
];

const FAQ = [
  { q: 'Mogu li nadograditi plan kasnije?', a: 'Da! Možete nadograditi sa Besplatnog na Pro ili Business u bilo kojem trenutku. Promjena se aktivira odmah.' },
  { q: 'Kako funkcionira plaćanje?', a: 'Prihvatamo kartice i bankarski prijenos. Plaćanje je mjesečno, bez ugovora — možete otkazati kad god želite.' },
  { q: 'Šta se dešava s mojim oglasima ako promijenim plan?', a: 'Vaši oglasi ostaju aktivni. Ako pređete na niži plan, nećete moći objaviti nove dok ne budete ispod limita.' },
  { q: 'Da li je AI Foto Oglas dostupan na webu?', a: 'AI Foto Oglas je ekskluzivno dostupan u NudiNađi mobilnoj aplikaciji — jedan od razloga zašto se isplati instalirati.' },
];

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === 'string') return <span className="text-[10px] font-bold text-[var(--c-text)]">{value}</span>;
  return value
    ? <i className="fa-solid fa-check text-emerald-400 text-sm"></i>
    : <i className="fa-solid fa-xmark text-red-400/60 text-sm"></i>;
}

export default function PlansPage() {
  return (
    <MainLayout title="Planovi">
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <i className="fa-solid fa-gem text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-blue-400 uppercase tracking-[0.2em]">Planovi</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            ODABERI SVOJ<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">PLAN.</span>
          </h1>
          <div className="w-10 h-[3px] bg-blue-500 mb-4"></div>
          <p className="text-[13px] text-[var(--c-text2)] leading-relaxed max-w-[560px]">
            Počni besplatno, nadogradi kad budeš spreman. Svaki plan uključuje AI tehnologiju koja ti pomaže da kupuješ i prodaješ brže i pametnije.
          </p>
        </div>

        {/* 3 PRICING CARDS */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-blue-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Paketi</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* BESPLATNO */}
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6 relative overflow-hidden">
              <div className="mb-4">
                <div className="w-10 h-10 rounded-[4px] bg-[var(--c-border)] flex items-center justify-center mb-3">
                  <i className="fa-solid fa-user text-[var(--c-text3)] text-sm"></i>
                </div>
                <h3 className="text-[14px] font-black text-[var(--c-text)] uppercase">Besplatno</h3>
                <p className="text-[10px] text-[var(--c-text3)] mt-1">Za svakoga tko želi kupovati i prodavati</p>
              </div>
              <div className="mb-4">
                <p className="text-2xl font-black text-[var(--c-text)]">0 €</p>
                <p className="text-[9px] text-[var(--c-text3)]">zauvijek besplatno</p>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-[10px] text-[var(--c-text3)]"><i className="fa-solid fa-check text-emerald-400 text-[9px]"></i>Do 10 aktivnih oglasa</li>
                <li className="flex items-center gap-2 text-[10px] text-[var(--c-text3)]"><i className="fa-solid fa-check text-emerald-400 text-[9px]"></i>Do 7 slika po oglasu</li>
                <li className="flex items-center gap-2 text-[10px] text-[var(--c-text3)]"><i className="fa-solid fa-check text-emerald-400 text-[9px]"></i>AI Pretraga</li>
                <li className="flex items-center gap-2 text-[10px] text-[var(--c-text3)]"><i className="fa-solid fa-check text-emerald-400 text-[9px]"></i>Chat</li>
                <li className="flex items-center gap-2 text-[10px] text-[var(--c-text3)]"><i className="fa-solid fa-check text-emerald-400 text-[9px]"></i>Favoriti</li>
                <li className="flex items-center gap-2 text-[10px] text-[var(--c-text3)]"><i className="fa-solid fa-check text-emerald-400 text-[9px]"></i>AI Link-Import</li>
              </ul>
              <div className="block text-center py-2.5 border border-[var(--c-border)] rounded-[4px] text-[10px] font-black text-[var(--c-text3)] uppercase tracking-wider">
                Aktivan plan
              </div>
            </div>

            {/* PRO — NAJPOPULARNIJI */}
            <div className="bg-[var(--c-hover)] border-2 border-blue-500 rounded-[4px] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-blue-500 rounded-bl-[8px]">
                <span className="text-[8px] font-black text-white uppercase tracking-wider">Najpopularniji</span>
              </div>
              <div className="mb-4">
                <div className="w-10 h-10 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-3">
                  <i className="fa-solid fa-bolt text-blue-400 text-sm"></i>
                </div>
                <h3 className="text-[14px] font-black text-[var(--c-text)] uppercase">Pro</h3>
                <p className="text-[10px] text-[var(--c-text3)] mt-1">Za aktivne prodavače i kupce</p>
              </div>
              <div className="mb-4">
                <p className="text-2xl font-black text-blue-400">Uskoro</p>
                <p className="text-[9px] text-[var(--c-text3)]">mjesečno, bez ugovora</p>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-[10px] text-[var(--c-text3)]"><i className="fa-solid fa-check text-emerald-400 text-[9px]"></i>Do 30 aktivnih oglasa</li>
                <li className="flex items-center gap-2 text-[10px] text-[var(--c-text3)]"><i className="fa-solid fa-check text-emerald-400 text-[9px]"></i>Do 20 slika po oglasu</li>
                <li className="flex items-center gap-2 text-[10px] text-[var(--c-text3)]"><i className="fa-solid fa-check text-emerald-400 text-[9px]"></i>AI Opis (generisanje teksta)</li>
                <li className="flex items-center gap-2 text-[10px] text-[var(--c-text3)]"><i className="fa-solid fa-check text-emerald-400 text-[9px]"></i>AI VIN Dekoder</li>
                <li className="flex items-center gap-2 text-[10px] text-[var(--c-text3)]"><i className="fa-solid fa-check text-emerald-400 text-[9px]"></i>Statistike i analitika</li>
                <li className="flex items-center gap-2 text-[10px] text-[var(--c-text3)]"><i className="fa-solid fa-check text-emerald-400 text-[9px]"></i>Pro značka + prioritet u pretrazi</li>
              </ul>
              <div className="block text-center py-2.5 bg-blue-500 rounded-[4px] text-[10px] font-black text-white uppercase tracking-wider cursor-default">
                Uskoro dostupno
              </div>
            </div>

            {/* BUSINESS */}
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6 relative overflow-hidden">
              <div className="mb-4">
                <div className="w-10 h-10 rounded-[4px] bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-3">
                  <i className="fa-solid fa-building text-purple-400 text-sm"></i>
                </div>
                <h3 className="text-[14px] font-black text-[var(--c-text)] uppercase">Business</h3>
                <p className="text-[10px] text-[var(--c-text3)] mt-1">Za firme, agencije i profesionalne prodavače</p>
              </div>
              <div className="mb-4">
                <p className="text-2xl font-black text-purple-400">Uskoro</p>
                <p className="text-[9px] text-[var(--c-text3)]">mjesečno, bez ugovora</p>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-[10px] text-[var(--c-text3)]"><i className="fa-solid fa-check text-emerald-400 text-[9px]"></i>Neograničeno oglasa</li>
                <li className="flex items-center gap-2 text-[10px] text-[var(--c-text3)]"><i className="fa-solid fa-check text-emerald-400 text-[9px]"></i>AI Foto → Oglas (samo aplikacija)</li>
                <li className="flex items-center gap-2 text-[10px] text-[var(--c-text3)]"><i className="fa-solid fa-check text-emerald-400 text-[9px]"></i>Verificirani poslovni profil</li>
                <li className="flex items-center gap-2 text-[10px] text-[var(--c-text3)]"><i className="fa-solid fa-check text-emerald-400 text-[9px]"></i>Bulk Upload + Dashboard</li>
                <li className="flex items-center gap-2 text-[10px] text-[var(--c-text3)]"><i className="fa-solid fa-check text-emerald-400 text-[9px]"></i>Timski računi + prioritetna podrška</li>
              </ul>
              <div className="block text-center py-2.5 border border-purple-500/40 rounded-[4px] text-[10px] font-black text-purple-400 uppercase tracking-wider cursor-default">
                Uskoro dostupno
              </div>
            </div>

          </div>
        </div>

        {/* VERGLEICHSTABELLE */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-blue-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Usporedba planova</p>
          </div>
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--c-border)]">
                  <th className="text-left text-[10px] font-black text-[var(--c-text)] uppercase tracking-wide p-3 w-[40%]">Funkcija</th>
                  <th className="text-center text-[10px] font-black text-[var(--c-text)] uppercase tracking-wide p-3 w-[20%]">Besplatno</th>
                  <th className="text-center text-[10px] font-black text-blue-400 uppercase tracking-wide p-3 w-[20%]">Pro</th>
                  <th className="text-center text-[10px] font-black text-purple-400 uppercase tracking-wide p-3 w-[20%]">Business</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f, i) => (
                  <tr key={f.name} className={i % 2 === 0 ? '' : 'bg-[var(--c-bg)]'}>
                    <td className="text-[10px] text-[var(--c-text3)] p-3 font-semibold">{f.name}</td>
                    <td className="text-center p-3"><Cell value={f.free} /></td>
                    <td className="text-center p-3"><Cell value={f.pro} /></td>
                    <td className="text-center p-3"><Cell value={f.business} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-blue-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Česta pitanja</p>
          </div>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <div key={item.q} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5">
                <h3 className="text-[12px] font-black text-[var(--c-text)] mb-2">{item.q}</h3>
                <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="text-center py-8 border-t border-[var(--c-border)]">
          <p className="text-lg font-black text-[var(--c-text)] uppercase tracking-tight mb-2">
            Počni besplatno, nadogradi kad želiš.
          </p>
          <p className="text-[10px] text-[var(--c-text3)] mb-4">Imaš pitanja? Kontaktiraj nas.</p>
          <Link href="/kontakt" className="inline-flex items-center gap-2 text-[11px] text-blue-500 font-bold hover:underline">
            <i className="fa-solid fa-paper-plane text-xs"></i>
            Kontaktiraj nas
          </Link>
          <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-[0.3em] mt-3">NudiNađi platforma</p>
        </div>

      </div>
    </MainLayout>
  );
}