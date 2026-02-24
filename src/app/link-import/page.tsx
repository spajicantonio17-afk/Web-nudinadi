'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useToast } from '@/components/Toast';

// Domain list for auto-detection — names are only shown as detected domain labels, not as brand endorsements
const SUPPORTED_PLATFORMS = [
  { domain: 'olx.ba', color: 'bg-blue-500', icon: 'fa-globe', description: 'Oglasnik BiH' },
  { domain: 'njuskalo.hr', color: 'bg-orange-500', icon: 'fa-globe', description: 'Oglasnik HR' },
  { domain: 'oglasi.hr', color: 'bg-cyan-500', icon: 'fa-globe', description: 'Oglasnik HR' },
  { domain: 'mojauto.ba', color: 'bg-red-500', icon: 'fa-car', description: 'Vozila BiH' },
  { domain: 'index.hr', color: 'bg-emerald-500', icon: 'fa-newspaper', description: 'Portal HR' },
  { domain: 'kupujemprodajem.com', color: 'bg-yellow-500', icon: 'fa-tag', description: 'Oglasnik SRB' },
  { domain: 'halooglasi.com', color: 'bg-pink-500', icon: 'fa-globe', description: 'Oglasnik SRB' },
  { domain: 'polovniautomobili.com', color: 'bg-indigo-500', icon: 'fa-car', description: 'Vozila regija' },
  { domain: 'ebay.com', color: 'bg-yellow-400', icon: 'fa-store', description: 'Globalno' },
];

type ImportStatus = 'idle' | 'loading' | 'success' | 'error';

interface ImportedData {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  category?: string;
  condition?: string;
  location?: string;
  images?: string[];
  seller?: string;
  attributes?: Record<string, string>;
  originalUrl?: string;
}

export default function LinkImportPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [importedData, setImportedData] = useState<ImportedData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Detect which platform from URL
  const detectPlatform = (u: string) => {
    try {
      const host = new URL(u).hostname.replace('www.', '');
      const match = SUPPORTED_PLATFORMS.find(p => host === p.domain || host.endsWith('.' + p.domain));
      return match ? { ...match, host } : null;
    } catch {
      return null;
    }
  };

  const detectedPlatform = url ? detectPlatform(url) : null;

  const handleImport = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      showToast('Unesite URL oglasa', 'error');
      inputRef.current?.focus();
      return;
    }
    // Basic URL validation only
    try { new URL(trimmed); } catch {
      setStatus('error');
      setErrorMsg('Nevažeći URL. Kopiraj kompletan link koji počinje sa https://');
      return;
    }

    setStatus('loading');
    setErrorMsg('');
    setImportedData(null);

    try {
      const res = await fetch('/api/ai/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      const json = await res.json();

      if (json.success && json.data) {
        setImportedData(json.data);
        setStatus('success');
        showToast('Oglas uspješno importiran!');
      } else {
        setStatus('error');
        setErrorMsg(json.error || 'Import nije uspio. Provjeri URL i pokušaj ponovo.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Greška mreže. Provjeri internet konekciju.');
    }
  };

  const handleCreateListing = () => {
    if (!importedData) return;
    // Store import data for the upload page to pick up
    sessionStorage.setItem('nudinadi_import', JSON.stringify(importedData));
    router.push('/upload');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {
      inputRef.current?.focus();
    }
  };

  const handleReset = () => {
    setUrl('');
    setStatus('idle');
    setImportedData(null);
    setErrorMsg('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <MainLayout title="Link Import" headerRight={
      <button
        onClick={() => router.push('/upload')}
        aria-label="Zatvori i idi na novi oglas"
        className="w-10 h-10 rounded-full bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors"
      >
        <i className="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
    }>
      <div className="max-w-2xl mx-auto pb-24 pt-2 space-y-6 animate-[fadeIn_0.3s_ease-out]">

        {/* ── HERO HEADER ── */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-gradient-to-br from-orange-500 to-amber-400 shadow-xl shadow-orange-500/25 mb-2">
            <i className="fa-solid fa-file-import text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-black text-[var(--c-text)] leading-tight tracking-tight">
            Importuj oglas<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">jednim klikom</span>
          </h1>
          <p className="text-sm text-[var(--c-text2)] max-w-sm mx-auto leading-relaxed">
            Kopiraj link oglasa s bilo kojeg portala — AI automatski preuzima sve podatke.
          </p>
        </div>

        {/* ── URL INPUT CARD ── */}
        <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[28px] p-5 shadow-sm space-y-4">

          {/* Platform badge — shown when URL is valid */}
          {url && (() => {
            try {
              const host = new URL(url).hostname.replace('www.', '');
              const known = detectedPlatform;
              return (
                <div className="flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
                  <div className={`w-2 h-2 rounded-full ${known ? known.color : 'bg-[var(--c-text-muted)]'}`}></div>
                  <span className="text-[10px] font-black text-[var(--c-text2)] uppercase tracking-widest">
                    {known ? `${known.description} · Prepoznat portal` : host}
                  </span>
                  {!known && (
                    <span className="text-[9px] text-[var(--c-text3)] normal-case font-normal tracking-normal">· AI će pokušati ekstrahirati podatke</span>
                  )}
                </div>
              );
            } catch { return null; }
          })()}

          {/* Input Row */}
          <div className="relative flex items-center gap-2">
            <div className={`flex-1 flex items-center gap-3 bg-[var(--c-card-alt)] rounded-[18px] border px-4 py-3.5 transition-colors ${
              status === 'error' ? 'border-red-400' :
              url ? 'border-orange-300' :
              'border-[var(--c-border)] focus-within:border-orange-400/60'
            }`}>
              <i className={`fa-solid ${url ? 'fa-check-circle text-orange-500' : 'fa-link text-[var(--c-text3)]'} text-sm shrink-0`}></i>
              <input
                ref={inputRef}
                id="import-url"
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); if (status === 'error') setStatus('idle'); }}
                onKeyDown={(e) => e.key === 'Enter' && handleImport()}
                placeholder="https://www.primjer-oglasnika.ba/oglas/..."
                aria-label="URL oglasa za import"
                aria-describedby={status === 'error' ? 'import-error' : undefined}
                autoFocus
                className="flex-1 bg-transparent text-sm font-medium text-[var(--c-text)] placeholder:text-[var(--c-placeholder)] outline-none min-w-0"
              />
              {url && (
                <button
                  onClick={handleReset}
                  type="button"
                  aria-label="Obriši URL"
                  className="text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors shrink-0"
                >
                  <i className="fa-solid fa-xmark text-xs" aria-hidden="true"></i>
                </button>
              )}
            </div>

            {/* Paste Button */}
            {!url && (
              <button
                onClick={handlePaste}
                type="button"
                aria-label="Zalijepi URL iz međuspremnika"
                className="shrink-0 h-12 px-4 bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-[18px] text-[10px] font-black text-[var(--c-text2)] uppercase tracking-widest hover:bg-[var(--c-active)] hover:text-[var(--c-text)] transition-all whitespace-nowrap"
              >
                <i className="fa-solid fa-clipboard mr-1.5" aria-hidden="true"></i>Zalijepi
              </button>
            )}
          </div>

          {/* Error message */}
          {status === 'error' && errorMsg && (
            <div id="import-error" role="alert" className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-[14px] px-4 py-3 animate-[fadeIn_0.2s_ease-out]">
              <i className="fa-solid fa-circle-exclamation text-red-500 text-sm mt-0.5 shrink-0" aria-hidden="true"></i>
              <p className="text-[11px] text-red-600 font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Import CTA */}
          <button
            onClick={handleImport}
            type="button"
            disabled={status === 'loading' || !url.trim()}
            aria-busy={status === 'loading'}
            aria-label={status === 'loading' ? 'AI analizira oglas, sačekaj...' : 'Importuj oglas'}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-4 rounded-[18px] flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed"
          >
            {status === 'loading' ? (
              <>
                <i className="fa-solid fa-spinner animate-spin"></i>
                <span className="text-sm uppercase tracking-widest">AI analizira oglas...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                <span className="text-sm uppercase tracking-widest">Importuj oglas</span>
              </>
            )}
          </button>
        </div>

        {/* ── IMPORT RESULT PREVIEW ── */}
        {status === 'success' && importedData && (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">

            {/* Success Banner */}
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-[18px] px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-check text-emerald-600 text-sm"></i>
              </div>
              <div>
                <p className="text-[12px] font-black text-emerald-700 uppercase tracking-wide">Oglas importiran!</p>
                <p className="text-[10px] text-emerald-600">Provjeri podatke i klikni "Kreiraj oglas"</p>
              </div>
            </div>

            {/* Imported images */}
            {importedData.images && importedData.images.length > 0 && (
              <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[24px] p-4">
                <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-widest mb-3">
                  <i className="fa-solid fa-images mr-1.5"></i>Slike ({importedData.images.length})
                </p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {importedData.images.slice(0, 6).map((img, i) => (
                    <div key={i} className="w-20 h-20 rounded-[12px] overflow-hidden bg-[var(--c-card-alt)] shrink-0 border border-[var(--c-border)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  ))}
                  {importedData.images.length > 6 && (
                    <div className="w-20 h-20 rounded-[12px] bg-[var(--c-card-alt)] border border-[var(--c-border)] flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-bold text-[var(--c-text3)]">+{importedData.images.length - 6}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Data fields */}
            <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[24px] overflow-hidden divide-y divide-[var(--c-border)]">

              {/* Title */}
              {importedData.title && (
                <div className="px-5 py-4">
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Naslov</p>
                  <p className="text-[14px] font-bold text-[var(--c-text)] leading-snug">{importedData.title}</p>
                </div>
              )}

              {/* Price + Condition Row */}
              <div className="grid grid-cols-2 divide-x divide-[var(--c-border)]">
                {importedData.price != null && (
                  <div className="px-5 py-4">
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Cijena</p>
                    <p className="text-[15px] font-black text-[var(--c-text)]">
                      {importedData.price.toLocaleString()} {importedData.currency || 'KM'}
                    </p>
                  </div>
                )}
                {importedData.condition && (
                  <div className="px-5 py-4">
                    <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest mb-1">Stanje</p>
                    <p className="text-[13px] font-bold text-[var(--c-text)]">{importedData.condition}</p>
                  </div>
                )}
              </div>

              {/* Category + Location Row */}
              <div className="grid grid-cols-2 divide-x divide-[var(--c-border)]">
                {importedData.category && (
                  <div className="px-5 py-4">
                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1">Kategorija</p>
                    <p className="text-[12px] font-semibold text-[var(--c-text2)]">{importedData.category}</p>
                  </div>
                )}
                {importedData.location && (
                  <div className="px-5 py-4">
                    <p className="text-[9px] font-black text-cyan-500 uppercase tracking-widest mb-1">Lokacija</p>
                    <p className="text-[12px] font-semibold text-[var(--c-text2)]">
                      <i className="fa-solid fa-location-dot text-cyan-400 mr-1 text-[10px]"></i>
                      {importedData.location}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              {importedData.description && (
                <div className="px-5 py-4">
                  <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-widest mb-2">Opis</p>
                  <p className="text-[12px] text-[var(--c-text2)] leading-relaxed line-clamp-4">{importedData.description}</p>
                </div>
              )}

              {/* Attributes */}
              {importedData.attributes && Object.keys(importedData.attributes).length > 0 && (
                <div className="px-5 py-4">
                  <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-widest mb-2.5">Detalji</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(importedData.attributes).slice(0, 8).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-full">
                        <span className="text-[9px] font-bold text-[var(--c-text3)] uppercase">{key}:</span>
                        <span className="text-[9px] font-semibold text-[var(--c-text2)]">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Source URL */}
              {importedData.originalUrl && (
                <div className="px-5 py-3 bg-[var(--c-card-alt)] flex items-center gap-2">
                  <i className="fa-solid fa-link text-[var(--c-text-muted)] text-[9px] shrink-0"></i>
                  <p className="text-[9px] text-[var(--c-text3)] truncate">{importedData.originalUrl}</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-4 rounded-[18px] bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text2)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--c-active)] transition-colors"
              >
                <i className="fa-solid fa-rotate-left mr-2"></i>Novi import
              </button>
              <button
                onClick={handleCreateListing}
                className="flex-2 flex-1 py-4 rounded-[18px] blue-gradient text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all hover:shadow-blue-500/30"
              >
                <i className="fa-solid fa-paper-plane mr-2"></i>Kreiraj oglas
              </button>
            </div>
          </div>
        )}

        {/* ── SUPPORTED FEATURES ── */}
        {status === 'idle' && (
          <div className="space-y-3 animate-[fadeIn_0.4s_ease-out]">
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-widest px-1">
              Šta AI prepoznaje
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: 'fa-heading', color: 'bg-blue-500/10 text-blue-500', label: 'Naslov oglasa' },
                { icon: 'fa-tag', color: 'bg-emerald-500/10 text-emerald-500', label: 'Cijena' },
                { icon: 'fa-align-left', color: 'bg-purple-500/10 text-purple-500', label: 'Opis' },
                { icon: 'fa-images', color: 'bg-orange-500/10 text-orange-500', label: 'Slike' },
                { icon: 'fa-location-dot', color: 'bg-cyan-500/10 text-cyan-500', label: 'Lokacija' },
                { icon: 'fa-list-check', color: 'bg-pink-500/10 text-pink-500', label: 'Kategorija i detalji' },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-3 bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] px-4 py-3"
                >
                  <div className={`w-8 h-8 rounded-[10px] ${f.color} flex items-center justify-center shrink-0`}>
                    <i className={`fa-solid ${f.icon} text-xs`}></i>
                  </div>
                  <span className="text-[11px] font-bold text-[var(--c-text)]">{f.label}</span>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-[var(--c-text3)] text-center px-4 leading-relaxed">
              Podržava oglasne portale iz BiH, Hrvatske, Srbije i šire. Zalijepi bilo koji link — AI izvlači podatke automatski.
            </p>
          </div>
        )}

        {/* ── HOW IT WORKS (idle only) ── */}
        {status === 'idle' && (
          <div className="space-y-3">
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-widest px-1">
              Kako radi?
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { step: '1', icon: 'fa-copy', color: 'bg-blue-500/10 text-blue-500', label: 'Kopiraj link', desc: 'Kopiraj URL oglasa koji želiš importovati' },
                { step: '2', icon: 'fa-wand-magic-sparkles', color: 'bg-purple-500/10 text-purple-500', label: 'AI analizira', desc: 'Naš AI preuzima sve podatke automatski' },
                { step: '3', icon: 'fa-paper-plane', color: 'bg-emerald-500/10 text-emerald-500', label: 'Objavi', desc: 'Provjeri podatke i objavi oglas na NudiNađi' },
              ].map((s) => (
                <div key={s.step} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] p-4 text-center">
                  <div className={`w-10 h-10 rounded-[12px] ${s.color} flex items-center justify-center mx-auto mb-2.5 border border-current/20`}>
                    <i className={`fa-solid ${s.icon} text-sm`}></i>
                  </div>
                  <p className="text-[11px] font-black text-[var(--c-text)] mb-1">{s.label}</p>
                  <p className="text-[9px] text-[var(--c-text3)] leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}
