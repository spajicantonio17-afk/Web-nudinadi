'use client';

import MainLayout from '@/components/layout/MainLayout';

export default function ContactPage() {
  return (
    <MainLayout title="Kontakt">
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <i className="fa-solid fa-envelope text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-blue-400 uppercase tracking-[0.2em]">Kontakt</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            JAVITE<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">NAM SE.</span>
          </h1>
          <div className="w-10 h-[3px] bg-blue-500 mb-4"></div>
          <p className="text-[13px] text-[var(--c-text2)] leading-relaxed max-w-[560px]">
            Imate pitanje, prijedlog ili trebate pomoć? Naš tim je tu za vas. Odgovaramo u roku od 24 sata.
          </p>
        </div>

        {/* CONTACT CARDS */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-blue-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Kanali komunikacije</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6 relative overflow-hidden hover:border-blue-500/40 transition-colors text-center">
              <div className="absolute top-0 right-0 w-14 h-14 bg-blue-500/20 rounded-bl-[35px]"></div>
              <div className="w-12 h-12 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4 mx-auto">
                <i className="fa-solid fa-envelope text-blue-400 text-lg"></i>
              </div>
              <h3 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-1">E-Mail</h3>
              <p className="text-[11px] text-blue-500 font-bold">podrska@nudinadi.com</p>
              <p className="text-[9px] text-[var(--c-text3)] mt-1">Odgovor u roku 24h</p>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6 relative overflow-hidden hover:border-emerald-500/40 transition-colors text-center">
              <div className="absolute top-0 right-0 w-14 h-14 bg-emerald-500/20 rounded-bl-[35px]"></div>
              <div className="w-12 h-12 rounded-[4px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 mx-auto">
                <i className="fa-solid fa-phone text-emerald-400 text-lg"></i>
              </div>
              <h3 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-1">Telefon</h3>
              <p className="text-[11px] text-emerald-500 font-bold">+387 33 123 456</p>
              <p className="text-[9px] text-[var(--c-text3)] mt-1">Pon – Pet, 09:00 – 17:00</p>
            </div>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6 relative overflow-hidden hover:border-purple-500/40 transition-colors text-center">
              <div className="absolute top-0 right-0 w-14 h-14 bg-purple-500/20 rounded-bl-[35px]"></div>
              <div className="w-12 h-12 rounded-[4px] bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4 mx-auto">
                <i className="fa-solid fa-location-dot text-purple-400 text-lg"></i>
              </div>
              <h3 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-1">Adresa</h3>
              <p className="text-[11px] text-purple-500 font-bold">Sarajevo, BiH</p>
              <p className="text-[9px] text-[var(--c-text3)] mt-1">NudiNađi d.o.o.</p>
            </div>
          </div>
        </div>

        {/* SPECIFIC DEPARTMENTS */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-blue-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Specifični odjeli</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { dept: 'Korisnička podrška', email: 'podrska@nudinadi.com', icon: 'fa-headset', desc: 'Pomoć sa korištenjem platforme' },
              { dept: 'Medijski upiti', email: 'press@nudinadi.com', icon: 'fa-newspaper', desc: 'Press, intervjui, medijski kit' },
              { dept: 'Partnerstva', email: 'partneri@nudinadi.com', icon: 'fa-handshake', desc: 'Poslovne prilike i saradnja' },
              { dept: 'Karijere', email: 'karijere@nudinadi.com', icon: 'fa-rocket', desc: 'Otvorene pozicije i prijave' },
            ].map((d) => (
              <div key={d.dept} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-4 flex items-center gap-4 hover:border-blue-500/40 transition-colors group">
                <div className="w-10 h-10 rounded-[4px] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <i className={`fa-solid ${d.icon} text-blue-400 text-sm`}></i>
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-[var(--c-text)]">{d.dept}</h4>
                  <p className="text-[10px] text-blue-500 font-bold">{d.email}</p>
                  <p className="text-[9px] text-[var(--c-text3)]">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SOCIAL */}
        <div className="text-center py-8 border-t border-[var(--c-border)]">
          <p className="text-lg font-black text-[var(--c-text)] uppercase tracking-tight mb-3">
            Prati Nas
          </p>
          <div className="flex gap-3 justify-center">
            {[
              { icon: 'fa-brands fa-instagram', label: 'Instagram' },
              { icon: 'fa-brands fa-facebook-f', label: 'Facebook' },
              { icon: 'fa-brands fa-tiktok', label: 'TikTok' },
              { icon: 'fa-brands fa-twitter', label: 'Twitter' },
            ].map((s) => (
              <span key={s.label} className="w-10 h-10 rounded-[4px] bg-[var(--c-hover)] border border-[var(--c-border)] flex items-center justify-center text-[var(--c-text3)] hover:text-blue-500 hover:border-blue-500/40 transition-all cursor-pointer">
                <i className={`${s.icon} text-sm`}></i>
              </span>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
