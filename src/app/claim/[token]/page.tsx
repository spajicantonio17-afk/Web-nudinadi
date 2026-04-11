'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

type Step = 'loading' | 'form' | 'submitting' | 'success' | 'error';

interface ClaimInfo {
  sellerName: string | null;
  listingCount: number;
  platform: string;
}

export default function ClaimPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [step, setStep] = useState<Step>('loading');
  const [claimInfo, setClaimInfo] = useState<ClaimInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ── Load claim info ──────────────────────────────────
  useEffect(() => {
    if (!token) { setStep('error'); setErrorMsg('Nevažeći link.'); return; }

    fetch(`/api/admin/bulk-import/claim-info?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(data => {
        if (!data.success) {
          setErrorMsg(data.error || 'Link je nevažeći ili je istekao.');
          setStep('error');
        } else {
          setClaimInfo(data);
          setStep('form');
        }
      })
      .catch(() => {
        setErrorMsg('Greška pri učitavanju. Pokušaj ponovo.');
        setStep('error');
      });
  }, [token]);

  // ── Validation ───────────────────────────────────────
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = 'Unesite važeći email.';
    if (!password || password.length < 6) e.password = 'Lozinka mora imati najmanje 6 znakova.';
    if (!username.trim() || username.length < 3) e.username = 'Korisničko ime mora imati najmanje 3 znaka.';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) e.username = 'Samo slova, brojevi i underscore (_).';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ───────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStep('submitting');
    setFormErrors({});

    try {
      const res = await fetch('/api/admin/bulk-import/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password, username }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Greška pri registraciji. Pokušaj ponovo.');
        setStep('form');
        return;
      }

      // Auto-login after successful claim
      const supabase = getSupabase();
      await supabase.auth.signInWithPassword({ email, password });

      setStep('success');

      // Redirect to profile after 3s
      setTimeout(() => router.push('/profile'), 3000);
    } catch {
      setErrorMsg('Greška u vezi. Provjeri internet i pokušaj ponovo.');
      setStep('form');
    }
  }

  // ── UI ───────────────────────────────────────────────

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-[#FAFBFD] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-[#FAFBFD] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-link-slash text-red-500 text-xl" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link nije važeći</h1>
          <p className="text-gray-500 text-sm">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#FAFBFD] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-check text-green-500 text-2xl" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Profil je tvoj!</h1>
          <p className="text-gray-500 text-sm mb-1">
            Oglasi su preneseni i čekaju te na profilu.
          </p>
          <p className="text-gray-400 text-xs">Preusmjeravamo te na profil...</p>
        </div>
      </div>
    );
  }

  const platformLabel = claimInfo?.platform === 'olx' ? 'OLX' : claimInfo?.platform === 'njuskalo' ? 'Njuskalo' : '';

  return (
    <div className="min-h-screen bg-[#FAFBFD] flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
            <i className="fa-solid fa-store text-blue-500 text-xl" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {claimInfo?.sellerName
              ? `Preuzmi profil: ${claimInfo.sellerName}`
              : 'Preuzmi svoj profil'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {claimInfo?.listingCount
              ? `${claimInfo.listingCount} ${claimInfo.listingCount === 1 ? 'oglas je spreman' : 'oglasa je spremno'} za preuzimanje`
              : 'Oglasi su preneseni i čekaju te'}
            {platformLabel ? ` s ${platformLabel}` : ''}.
          </p>
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Korisničko ime
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="npr. zlatarna_tuzla"
              disabled={step === 'submitting'}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            {formErrors.username && <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email adresa
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tvoj@email.com"
              disabled={step === 'submitting'}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lozinka
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="najmanje 6 znakova"
              disabled={step === 'submitting'}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={step === 'submitting'}
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {step === 'submitting' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Kreiranje profila...
              </>
            ) : 'Preuzmi profil i oglase'}
          </button>
        </form>

        <p className="text-gray-400 text-xs text-center mt-4">
          Registracijom prihvataš{' '}
          <a href="/uvjeti" className="underline hover:text-gray-600">uvjete korištenja</a>.
        </p>
      </div>
    </div>
  );
}
