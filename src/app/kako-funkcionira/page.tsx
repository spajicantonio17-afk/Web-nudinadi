'use client';

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

export default function HowItWorksPage() {
  return (
    <MainLayout title="Kako funkcionira">
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] blue-gradient flex items-center justify-center shadow-lg shadow-blue-500/30">
              <i className="fa-solid fa-circle-play text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-blue-400 uppercase tracking-[0.2em]">Kako funkcionira</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            JEDNOSTAVNO.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">BRZO. PAMETNO.</span>
          </h1>
          <div className="w-10 h-[3px] bg-blue-500 mb-4"></div>
          <p className="text-[13px] text-[var(--c-text2)] leading-relaxed max-w-[560px]">
            NudiNađi koristi AI tehnologiju da kupovinu i prodaju učini lakšom nego ikad. Bez komplikovanih filtera, bez gubljenja vremena — sve radi za tebe.
          </p>
        </div>

        {/* ZA KUPCE */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-blue-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Za Kupce</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { step: '01', icon: 'fa-magnifying-glass', title: 'Pretraži', desc: 'Napiši šta tražiš svojim riječima. AI razumije kontekst, greške i namjeru.' },
              { step: '02', icon: 'fa-wand-magic-sparkles', title: 'AI Nađe', desc: 'Pametni rezultati sortirani po relevantnosti. Bez klikanja kroz filtere.' },
              { step: '03', icon: 'fa-comment-dots', title: 'Kontaktiraj', desc: 'Direktni chat sa prodavcem. Pitaj, dogovori se, brzo i jednostavno.' },
              { step: '04', icon: 'fa-circle-check', title: 'Kupi', desc: 'Sigurna transakcija. Trust Score ti pokazuje koliko je prodavac pouzdan.' },
            ].map((item) => (
              <div key={item.step} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-blue-500/40 transition-colors">
                <span className="absolute top-3 right-3 text-[28px] font-black text-[var(--c-border)] leading-none">{item.step}</span>
                <div className="w-10 h-10 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                  <i className={`fa-solid ${item.icon} text-blue-400 text-sm`}></i>
                </div>
                <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">{item.title}</h3>
                <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ZA PRODAVCE */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-emerald-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Za Prodavce</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { step: '01', icon: 'fa-camera', title: 'Uslikaj', desc: 'Fotografiraj predmet. AI ga prepoznaje — marka, model, stanje, sve automatski.' },
              { step: '02', icon: 'fa-robot', title: 'AI Piše Oglas', desc: 'Naslov, opis, cijena, kategorija — AI generiše sve za tebe. Ti samo potvrdi.' },
              { step: '03', icon: 'fa-rocket', title: 'Objavi', desc: 'Oglas online za 30 sekundi. Bez komplikacija, bez čekanja.' },
              { step: '04', icon: 'fa-hand-holding-dollar', title: 'Prodaj', desc: 'Kupci te nalaze odmah. Poruke, dogovor, prodaja — sve na jednom mjestu.' },
            ].map((item) => (
              <div key={item.step} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-emerald-500/40 transition-colors">
                <span className="absolute top-3 right-3 text-[28px] font-black text-[var(--c-border)] leading-none">{item.step}</span>
                <div className="w-10 h-10 rounded-[4px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                  <i className={`fa-solid ${item.icon} text-emerald-400 text-sm`}></i>
                </div>
                <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">{item.title}</h3>
                <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI FUNKCIJE */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-purple-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">AI Funkcije</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6 relative overflow-hidden hover:border-purple-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-purple-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-magnifying-glass text-purple-400 text-sm"></i>
              </div>
              <h3 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">AI Pretraga</h3>
              <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
                Piši prirodno: &ldquo;crveni bicikl do 200 KM u Sarajevu&rdquo; — AI razumije kategoriju, cijenu, lokaciju i stanje. Bez filtera, bez komplikacija.
              </p>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6 relative overflow-hidden hover:border-blue-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-blue-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-camera text-blue-400 text-sm"></i>
              </div>
              <h3 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">AI Oglas</h3>
              <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
                Uslikaj predmet — AI prepoznaje šta je, piše naslov i opis, predlaže cijenu i bira kategoriju. Gotov oglas za 30 sekundi.
              </p>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6 relative overflow-hidden hover:border-emerald-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-emerald-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-shield-halved text-emerald-400 text-sm"></i>
              </div>
              <h3 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">AI Zaštita</h3>
              <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
                Anti-scam detekcija u realnom vremenu. AI analizira oglase, poruke i ponašanje — sumnjive aktivnosti se blokiraju automatski, 24/7.
              </p>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6 relative overflow-hidden hover:border-orange-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-14 h-14 bg-orange-500/20 rounded-bl-[35px]"></div>
              <div className="w-10 h-10 rounded-[4px] bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mb-4">
                <i className="fa-solid fa-star text-orange-400 text-sm"></i>
              </div>
              <h3 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">AI Preporuke</h3>
              <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
                Platforma uči šta te zanima i predlaže oglase koji ti odgovaraju. Što više koristiš, to su rezultati bolji.
              </p>
            </div>
          </div>
        </div>

        {/* SIGURNOST & POVJERENJE */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-emerald-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Sigurnost & Povjerenje</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: 'fa-user-check', label: 'Verifikacija', desc: 'Email, telefon, identitet' },
              { icon: 'fa-medal', label: 'Trust Score', desc: 'Ocjena pouzdanosti korisnika' },
              { icon: 'fa-eye', label: 'AI Monitoring', desc: '24/7 nadzor aktivnosti' },
              { icon: 'fa-lock', label: 'Sigurne Poruke', desc: 'Enkripcija komunikacije' },
            ].map((item) => (
              <div key={item.label} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-4 text-center">
                <i className={`fa-solid ${item.icon} text-emerald-400 text-lg mb-2 block`}></i>
                <p className="text-[10px] font-black text-[var(--c-text)] uppercase">{item.label}</p>
                <p className="text-[9px] text-[var(--c-text3)] mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FEEDBACK SEKTION */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-blue-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Tvoj glas je bitan</p>
          </div>
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6 relative overflow-hidden hover:border-blue-500/40 transition-colors">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-[50px]"></div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-comments text-blue-400 text-lg"></i>
              </div>
              <div>
                <h3 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">Gradimo NudiNađi zajedno</h3>
                <p className="text-[11px] text-[var(--c-text3)] leading-relaxed mb-3">
                  Svaki prijedlog čitamo, svaki feedback cijenimo. NudiNađi se stalno poboljšava zahvaljujući vama — našim korisnicima. Ako imaš ideju, prijedlog ili primjedbu, javi nam se. Zajedno pravimo bolju platformu.
                </p>
                <Link href="/kontakt" className="inline-flex items-center gap-2 text-[11px] text-blue-500 font-bold hover:underline">
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                  Pošalji prijedlog
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM QUOTE */}
        <div className="text-center py-8 border-t border-[var(--c-border)]">
          <p className="text-lg font-black text-[var(--c-text)] uppercase tracking-tight mb-1">
            &ldquo;Tehnologija koja radi za tebe.&rdquo;
          </p>
          <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-[0.3em]">NudiNađi platforma</p>
        </div>

      </div>
    </MainLayout>
  );
}