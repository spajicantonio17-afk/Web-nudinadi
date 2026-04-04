'use client';

import { useState } from 'react';
import { ISTAKNUTI_OPTIONS } from '@/lib/plans';
import BuyCreditsModal from './BuyCreditsModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  creditBalance: number;
  /** Called after successful promotion so parent can refresh */
  onSuccess?: (promotedUntil: string) => void;
}

export default function IstaknutiModal({ isOpen, onClose, productId, creditBalance, onSuccess }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handlePromote() {
    if (!selected) return;
    const option = ISTAKNUTI_OPTIONS.find(o => o.id === selected)!;

    if (creditBalance < option.credits) {
      setShowBuyModal(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/credits/spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'istaknuti', productId, optionId: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) {
          setShowBuyModal(true);
        } else {
          setError(data.error || 'Greška na serveru.');
        }
      } else {
        onSuccess?.(data.promotedUntil);
        onClose();
      }
    } catch {
      setError('Greška pri povezivanju sa serverom.');
    } finally {
      setLoading(false);
    }
  }

  const selectedOption = ISTAKNUTI_OPTIONS.find(o => o.id === selected);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-full sm:max-w-sm bg-[var(--c-bg)] rounded-t-[28px] sm:rounded-[28px] p-6 space-y-5 shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[17px] font-black text-[var(--c-text)]">Istaknuti oglas</h2>
              <p className="text-[11px] text-[var(--c-text3)] mt-0.5">
                Stanje: <span className="font-bold text-amber-400">{creditBalance} kredita</span>
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--c-active)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors">
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>

          {/* Info */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-[14px] p-3 flex items-center gap-2">
            <i className="fa-solid fa-star text-amber-400 text-xs flex-shrink-0"></i>
            <p className="text-[11px] text-[var(--c-text3)]">Istaknuti oglasi se pojavljuju prvi u rezultatima pretrage.</p>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {ISTAKNUTI_OPTIONS.map(option => {
              const isSelected = selected === option.id;
              const canAfford = creditBalance >= option.credits;
              return (
                <button
                  key={option.id}
                  onClick={() => setSelected(option.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-[14px] border transition-all text-left ${
                    isSelected
                      ? 'border-amber-500/50 bg-amber-500/10'
                      : 'border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-border2)]'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-[var(--c-active)] text-[var(--c-text3)]'
                  }`}>
                    <i className="fa-solid fa-star text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-[var(--c-text)]">{option.label}</p>
                    <p className="text-[11px] text-[var(--c-text3)]">{option.desc}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-[14px] font-black ${canAfford ? 'text-[var(--c-text)]' : 'text-red-400'}`}>
                      {option.credits} kr.
                    </p>
                    {!canAfford && (
                      <p className="text-[9px] text-red-400">Nedovoljno</p>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-check text-white text-[9px]"></i>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {error && (
            <p className="text-[11px] text-red-400 text-center">{error}</p>
          )}

          {/* CTA */}
          <button
            onClick={handlePromote}
            disabled={!selected || loading}
            className="w-full py-3.5 rounded-[14px] font-bold text-[14px] bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <i className="fa-solid fa-spinner animate-spin"></i>
            ) : selectedOption && creditBalance < selectedOption.credits ? (
              'Kupi kredite'
            ) : (
              `Istakni oglas${selectedOption ? ` — ${selectedOption.credits} kr.` : ''}`
            )}
          </button>
        </div>
      </div>

      <BuyCreditsModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        reason="istaknuti"
        currentBalance={creditBalance}
      />
    </>
  );
}
