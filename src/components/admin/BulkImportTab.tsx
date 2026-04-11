'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

// ── Types ────────────────────────────────────────────────

interface PendingClaim {
  id: string;
  token: string;
  platform: string;
  profile_url: string;
  seller_name: string | null;
  listing_urls: string[];
  imported_data: unknown[];
  status: 'processing' | 'ready' | 'claimed' | 'expired' | 'failed';
  created_at: string;
  expires_at: string;
  claimed_at: string | null;
}

type ImportStep = 'idle' | 'scraping' | 'importing' | 'done' | 'error';

// ── Helpers ──────────────────────────────────────────────

function statusBadge(status: PendingClaim['status']) {
  const map: Record<string, { label: string; cls: string }> = {
    processing: { label: 'Obrađuje se', cls: 'bg-yellow-100 text-yellow-700' },
    ready:      { label: 'Spreman',     cls: 'bg-blue-100 text-blue-700' },
    claimed:    { label: 'Preuzeto',    cls: 'bg-green-100 text-green-700' },
    expired:    { label: 'Isteklo',     cls: 'bg-gray-100 text-gray-500' },
    failed:     { label: 'Greška',      cls: 'bg-red-100 text-red-600' },
  };
  const s = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}

function platformIcon(platform: string) {
  return platform === 'olx' ? 'OLX' : platform === 'njuskalo' ? 'NJU' : platform.toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('bs-BA', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// ── Main Component ───────────────────────────────────────

export default function BulkImportTab() {
  const { user } = useAuth();

  // ── Form state ───────────────────────────────────────
  const [profileUrl, setProfileUrl] = useState('');
  const [step, setStep] = useState<ImportStep>('idle');
  const [stepMsg, setStepMsg] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [resultCount, setResultCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Claims list ──────────────────────────────────────
  const [claims, setClaims] = useState<PendingClaim[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // ── Load claims ──────────────────────────────────────
  const loadClaims = useCallback(async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('pending_claims')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setClaims(data as PendingClaim[]);
    setLoadingClaims(false);
  }, []);

  useEffect(() => { loadClaims(); }, [loadClaims]);

  // ── Get auth token ───────────────────────────────────
  async function getToken() {
    const supabase = getSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? '';
  }

  // ── Run full import ──────────────────────────────────
  async function handleImport() {
    if (!profileUrl.trim()) return;
    setStep('scraping');
    setStepMsg('Dohvaćanje profila i oglasa...');
    setErrorMsg('');
    setResultUrl('');

    const authToken = await getToken();

    // Step 1: Scrape profile
    let scrapeData: { platform: string; sellerName: string; listingUrls: string[]; listingCount: number };
    try {
      const res = await fetch('/api/admin/bulk-import/scrape-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ profileUrl: profileUrl.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error || 'Greška pri dohvaćanju profila.');
        setStep('error');
        return;
      }
      scrapeData = json;
    } catch {
      setErrorMsg('Greška u mreži. Provjeri internet.');
      setStep('error');
      return;
    }

    setStep('importing');
    setStepMsg(`Pronađeno ${scrapeData.listingCount} oglasa — uvoz u toku (može potrajati par minuta)...`);

    // Step 2: Run import
    try {
      const res = await fetch('/api/admin/bulk-import/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          profileUrl: profileUrl.trim(),
          sellerName: scrapeData.sellerName,
          platform: scrapeData.platform,
          listingUrls: scrapeData.listingUrls,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error || 'Greška pri uvozu oglasa.');
        setStep('error');
        return;
      }
      setResultUrl(json.claimUrl);
      setResultCount(json.importedCount);
      setStep('done');
      setProfileUrl('');
      loadClaims();
    } catch {
      setErrorMsg('Greška u mreži tokom uvoza.');
      setStep('error');
    }
  }

  // ── Copy claim link ──────────────────────────────────
  function copyClaimLink(token: string) {
    const url = `${window.location.origin}/claim/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    });
  }

  // ── Delete expired/failed claim ──────────────────────
  async function deleteClaim(id: string) {
    const supabase = getSupabase();
    await supabase.from('pending_claims').delete().eq('id', id);
    setClaims(prev => prev.filter(c => c.id !== id));
  }

  const isRunning = step === 'scraping' || step === 'importing';

  return (
    <div className="space-y-6">

      {/* ── Import Form ── */}
      <div className="bg-[var(--c-card)] rounded-xl border border-[var(--c-border)] p-5">
        <h2 className="text-sm font-semibold text-[var(--c-text)] mb-1 flex items-center gap-2">
          <i className="fa-solid fa-arrow-down-to-bracket text-blue-500" />
          Novi bulk import
        </h2>
        <p className="text-xs text-[var(--c-text2)] mb-4">
          Unesi OLX ili Njuskalo profil URL. Sistem uvozi sve oglase i generira claim link.
        </p>

        <div className="flex gap-2">
          <input
            type="url"
            value={profileUrl}
            onChange={e => setProfileUrl(e.target.value)}
            placeholder="https://www.olx.ba/profil/korisnik/"
            disabled={isRunning}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg)] text-sm text-[var(--c-text)] placeholder:text-[var(--c-text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={handleImport}
            disabled={isRunning || !profileUrl.trim()}
            className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            {isRunning ? (
              <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uvoz...</>
            ) : (
              <><i className="fa-solid fa-play text-xs" /> Pokreni uvoz</>
            )}
          </button>
        </div>

        {/* Progress / Result */}
        {isRunning && (
          <div className="mt-3 flex items-center gap-2 text-xs text-[var(--c-text2)]">
            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            {stepMsg}
          </div>
        )}

        {step === 'done' && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm font-medium text-green-800 mb-2">
              <i className="fa-solid fa-check mr-1" />
              Uvezeno {resultCount} oglasa!
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={resultUrl}
                className="flex-1 px-3 py-1.5 rounded-lg border border-green-300 bg-white text-xs font-mono text-green-900 focus:outline-none"
              />
              <button
                onClick={() => { navigator.clipboard.writeText(resultUrl); }}
                className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors"
              >
                Kopiraj
              </button>
            </div>
            <p className="text-xs text-green-600 mt-1">Pošalji ovaj link osobi via WhatsApp.</p>
          </div>
        )}

        {step === 'error' && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
            <i className="fa-solid fa-triangle-exclamation mr-1" />
            {errorMsg}
            <button onClick={() => setStep('idle')} className="ml-2 underline">Pokušaj ponovo</button>
          </div>
        )}
      </div>

      {/* ── Claims List ── */}
      <div className="bg-[var(--c-card)] rounded-xl border border-[var(--c-border)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--c-border)]">
          <h2 className="text-sm font-semibold text-[var(--c-text)] flex items-center gap-2">
            <i className="fa-solid fa-list-check text-blue-500" />
            Svi importi
          </h2>
          <button
            onClick={loadClaims}
            className="text-xs text-[var(--c-text2)] hover:text-[var(--c-text)] flex items-center gap-1"
          >
            <i className="fa-solid fa-arrows-rotate text-xs" />
            Osvježi
          </button>
        </div>

        {loadingClaims ? (
          <div className="p-8 text-center text-[var(--c-text-muted)] text-sm">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Učitavanje...
          </div>
        ) : claims.length === 0 ? (
          <div className="p-8 text-center text-[var(--c-text-muted)] text-sm">
            <i className="fa-solid fa-inbox text-2xl mb-2 block opacity-40" />
            Nema importa još.
          </div>
        ) : (
          <div className="divide-y divide-[var(--c-border)]">
            {claims.map(claim => (
              <div key={claim.id} className="px-5 py-4 flex items-center gap-4">

                {/* Platform badge */}
                <div className="w-10 h-10 rounded-lg bg-[var(--c-card-alt)] flex items-center justify-center text-xs font-bold text-[var(--c-text2)] shrink-0">
                  {platformIcon(claim.platform)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-[var(--c-text)] truncate">
                      {claim.seller_name || 'Nepoznat prodavač'}
                    </span>
                    {statusBadge(claim.status)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--c-text2)]">
                    <span>
                      <i className="fa-solid fa-box-open mr-1 opacity-60" />
                      {claim.imported_data?.length ?? 0} oglasa
                    </span>
                    <span>
                      <i className="fa-regular fa-clock mr-1 opacity-60" />
                      {formatDate(claim.created_at)}
                    </span>
                    {claim.claimed_at && (
                      <span className="text-green-600">
                        <i className="fa-solid fa-check mr-1" />
                        Preuzeto {formatDate(claim.claimed_at)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {claim.status === 'ready' && (
                    <button
                      onClick={() => copyClaimLink(claim.token)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        copiedToken === claim.token
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                      }`}
                    >
                      <i className={`fa-solid ${copiedToken === claim.token ? 'fa-check' : 'fa-copy'} text-xs`} />
                      {copiedToken === claim.token ? 'Kopirano' : 'Kopiraj link'}
                    </button>
                  )}
                  {(claim.status === 'expired' || claim.status === 'failed') && (
                    <button
                      onClick={() => deleteClaim(claim.id)}
                      className="p-1.5 rounded-lg text-[var(--c-text-muted)] hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Obriši"
                    >
                      <i className="fa-solid fa-trash-can text-xs" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
