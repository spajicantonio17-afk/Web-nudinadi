'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';

const CATEGORIES = [
  { value: 'bug', label: 'Prijava greške', icon: 'fa-bug' },
  { value: 'account', label: 'Problem s računom', icon: 'fa-user-shield' },
  { value: 'listing', label: 'Problem s oglasom', icon: 'fa-rectangle-list' },
  { value: 'payment', label: 'Plaćanje / Transakcije', icon: 'fa-credit-card' },
  { value: 'suggestion', label: 'Prijedlog / Feedback', icon: 'fa-lightbulb' },
  { value: 'other', label: 'Ostalo', icon: 'fa-ellipsis' },
] as const;

type FormStatus = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [category, setCategory] = useState('');
  const [name, setName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const canSubmit = category && name.trim().length >= 2 && email.includes('@') && subject.trim().length >= 3 && message.trim().length >= 10;

  const handleSubmit = async () => {
    if (!canSubmit || status === 'sending') return;

    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/support/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() }),
      });

      const json = await res.json();

      if (json.success) {
        setStatus('sent');
        showToast('Zahtjev uspješno poslan!');
      } else {
        setStatus('error');
        setErrorMsg(json.error || 'Greška pri slanju.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Greška mreže. Provjeri internet konekciju.');
    }
  };

  const handleReset = () => {
    setCategory('');
    setSubject('');
    setMessage('');
    setStatus('idle');
    setErrorMsg('');
  };

  return (
    <MainLayout title="Kontakt">
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-8">
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
            Imate pitanje, prijedlog ili trebate pomoć? Popunite formu ispod i odgovorićemo vam u roku od 24 sata.
          </p>
        </div>

        {/* ── FORM ── */}
        {status === 'sent' ? (
          <div className="bg-[var(--c-card)] border border-emerald-300 rounded-[18px] p-8 text-center space-y-4 mb-10 animate-[fadeIn_0.3s_ease-out]">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto">
              <i className="fa-solid fa-check text-emerald-600 text-2xl"></i>
            </div>
            <h2 className="text-lg font-black text-[var(--c-text)]">Zahtjev poslan!</h2>
            <p className="text-[13px] text-[var(--c-text2)] max-w-sm mx-auto">
              Vaš zahtjev je uspješno primljen. Odgovorićemo vam na <strong>{email}</strong> u najkraćem mogućem roku.
            </p>
            <button
              onClick={handleReset}
              className="mt-2 px-6 py-3 bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-[14px] text-[11px] font-black text-[var(--c-text2)] uppercase tracking-widest hover:bg-[var(--c-active)] transition-colors"
            >
              <i className="fa-solid fa-plus mr-2"></i>Novi zahtjev
            </button>
          </div>
        ) : (
          <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] p-5 md:p-7 mb-10 space-y-5">

            {/* Category Selector */}
            <div>
              <label className="text-[10px] font-black text-[var(--c-text3)] uppercase tracking-widest mb-2.5 block">
                Kategorija zahtjeva <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-[12px] border text-left transition-all ${
                      category === cat.value
                        ? 'bg-blue-500/10 border-blue-400 text-blue-600'
                        : 'bg-[var(--c-card-alt)] border-[var(--c-border)] text-[var(--c-text2)] hover:border-[var(--c-text3)]'
                    }`}
                  >
                    <i className={`fa-solid ${cat.icon} text-xs ${category === cat.value ? 'text-blue-500' : 'text-[var(--c-text3)]'}`}></i>
                    <span className="text-[11px] font-bold">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name + Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="text-[10px] font-black text-[var(--c-text3)] uppercase tracking-widest mb-1.5 block">
                  Ime i prezime <span className="text-red-400">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vaše ime"
                  className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-[12px] px-4 py-3 text-sm text-[var(--c-text)] placeholder:text-[var(--c-placeholder)] outline-none focus:border-blue-400/60 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="text-[10px] font-black text-[var(--c-text3)] uppercase tracking-widest mb-1.5 block">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas@email.com"
                  className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-[12px] px-4 py-3 text-sm text-[var(--c-text)] placeholder:text-[var(--c-placeholder)] outline-none focus:border-blue-400/60 transition-colors"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="contact-subject" className="text-[10px] font-black text-[var(--c-text3)] uppercase tracking-widest mb-1.5 block">
                Predmet <span className="text-red-400">*</span>
              </label>
              <input
                id="contact-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ukratko opišite problem ili pitanje"
                className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-[12px] px-4 py-3 text-sm text-[var(--c-text)] placeholder:text-[var(--c-placeholder)] outline-none focus:border-blue-400/60 transition-colors"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="contact-message" className="text-[10px] font-black text-[var(--c-text3)] uppercase tracking-widest mb-1.5 block">
                Poruka <span className="text-red-400">*</span>
              </label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Detaljno opišite vaš zahtjev, problem ili prijedlog..."
                rows={5}
                className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-[12px] px-4 py-3 text-sm text-[var(--c-text)] placeholder:text-[var(--c-placeholder)] outline-none focus:border-blue-400/60 transition-colors resize-none"
              />
              <p className="text-[9px] text-[var(--c-text-muted)] mt-1">Minimalno 10 znakova</p>
            </div>

            {/* Error */}
            {status === 'error' && errorMsg && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-[14px] px-4 py-3">
                <i className="fa-solid fa-circle-exclamation text-red-500 text-sm mt-0.5 shrink-0"></i>
                <p className="text-[11px] text-red-600 font-medium leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || status === 'sending'}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-black py-4 rounded-[14px] flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed"
            >
              {status === 'sending' ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin"></i>
                  <span className="text-sm uppercase tracking-widest">Šaljem...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i>
                  <span className="text-sm uppercase tracking-widest">Pošalji zahtjev</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ── DIREKTNI KONTAKT CARDS ── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-blue-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Direktni kontakt</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6 relative overflow-hidden hover:border-blue-500/40 transition-colors text-center">
              <div className="absolute top-0 right-0 w-14 h-14 bg-blue-500/20 rounded-bl-[35px]"></div>
              <div className="w-12 h-12 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4 mx-auto">
                <i className="fa-solid fa-envelope text-blue-400 text-lg"></i>
              </div>
              <h3 className="text-[12px] font-black text-[var(--c-text)] uppercase tracking-wide mb-1">E-Mail</h3>
              <p className="text-[11px] text-blue-500 font-bold">info@nudinadi.ba</p>
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
