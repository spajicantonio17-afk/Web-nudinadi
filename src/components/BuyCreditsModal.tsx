'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CREDIT_PACKAGES } from '@/lib/plans';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Optional: show a specific reason why credits are needed */
  reason?: 'extra_photos' | 'istaknuti';
  currentBalance?: number;
}

export default function BuyCreditsModal({ isOpen, onClose, reason, currentBalance }: Props) {
  const router = useRouter();
  const [buying, setBuying] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleBuy(packageId: string) {
    setBuying(packageId);
    try {
      const res = await fetch('/api/payments/buy-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Greška pri kreiranju plaćanja.');
        setBuying(null);
      }
    } catch {
      alert('Greška pri povezivanju sa serverom.');
      setBuying(null);
    }
  }

  const reasonText = reason === 'extra_photos'
    ? 'Trebaš više kredita da dodaš extra slike na oglas.'
    : reason === 'istaknuti'
    ? 'Trebaš kredite da istakneš oglas.'
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-sm bg-[var(--c-bg)] rounded-t-[28px] sm:rounded-[28px] p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[17px] font-black text-[var(--c-text)]">Kupi kredite</h2>
            {currentBalance !== undefined && (
              <p className="text-[11px] text-[var(--c-text3)] mt-0.5">
                Trenutno: <span className="font-bold text-amber-400">{currentBalance} kredita</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--c-active)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors">
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Reason hint */}
        {reasonText && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-[14px] p-3 flex items-center gap-2">
            <i className="fa-solid fa-circle-info text-amber-400 text-xs flex-shrink-0"></i>
            <p className="text-[11px] text-[var(--c-text3)]">{reasonText}</p>
          </div>
        )}

        {/* What credits do */}
        <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[14px] p-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-image text-blue-400 text-xs w-4"></i>
            <p className="text-[11px] text-[var(--c-text3)]">1 kredit = 1 extra slika po oglasu</p>
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-star text-amber-400 text-xs w-4"></i>
            <p className="text-[11px] text-[var(--c-text3)]">1 / 3 / 8 kredita = 3 / 7 / 30 dana istaknut</p>
          </div>
        </div>

        {/* Packages */}
        <div className="space-y-2">
          {CREDIT_PACKAGES.map((pkg, i) => {
            const isPopular = i === 1;
            return (
              <button
                key={pkg.id}
                onClick={() => handleBuy(pkg.id)}
                disabled={buying !== null}
                className={`w-full flex items-center gap-3 p-3 rounded-[14px] border transition-all disabled:opacity-50 text-left ${
                  isPopular
                    ? 'border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10'
                    : 'border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-border2)]'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isPopular ? 'blue-gradient text-white' : 'bg-[var(--c-active)] text-[var(--c-text3)]'
                }`}>
                  {buying === pkg.id
                    ? <i className="fa-solid fa-spinner animate-spin text-xs"></i>
                    : <i className="fa-solid fa-coins text-sm"></i>
                  }
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-[var(--c-text)]">
                    {pkg.label}
                    {isPopular && <span className="ml-2 text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">Popular</span>}
                  </p>
                  <p className="text-[11px] text-[var(--c-text3)]">{pkg.credits} kredita</p>
                </div>
                <p className="text-[15px] font-black text-[var(--c-text)] flex-shrink-0">{pkg.priceEur}€</p>
              </button>
            );
          })}
        </div>

        {/* Link to full wallet */}
        <button
          onClick={() => { onClose(); router.push('/krediti'); }}
          className="w-full text-center text-[11px] text-[var(--c-text3)] hover:text-[var(--c-text2)] transition-colors"
        >
          Pogledaj historiju i sve opcije →
        </button>
      </div>
    </div>
  );
}
