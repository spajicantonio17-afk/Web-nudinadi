'use client';

import React, { useState, useEffect } from 'react';
import { getBuyerCandidates, createTransaction, markSoldOutsidePlatform, type BuyerCandidate } from '@/services/transactionService';

interface BuyerPickerModalProps {
  productId: string;
  sellerId: string;
  onClose: () => void;
  onSuccess: (status: 'pending_sale' | 'sold') => void;
}

export default function BuyerPickerModal({ productId, sellerId, onClose, onSuccess }: BuyerPickerModalProps) {
  const [candidates, setCandidates] = useState<BuyerCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBuyerCandidates(productId, sellerId)
      .then(setCandidates)
      .catch(() => setError('Greška pri učitavanju kontakata.'))
      .finally(() => setLoading(false));
  }, [productId, sellerId]);

  const handlePickBuyer = async (buyerId: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await createTransaction(productId, sellerId, buyerId);
      onSuccess('pending_sale');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri kreiranju transakcije.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSoldOutside = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await markSoldOutsidePlatform(productId, sellerId);
      onSuccess('sold');
    } catch {
      setError('Greška pri označavanju.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center pt-16 sm:pt-24 pb-4 px-2 sm:px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[var(--c-card)] border border-[var(--c-border)] w-full max-w-md rounded-[10px] shadow-strong overflow-hidden animate-scaleIn max-h-[calc(100vh-5rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--c-border)]">
          <h2 className="text-sm font-bold text-[var(--c-text)]">Kome ste prodali?</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text2)] hover:text-[var(--c-text)] transition-colors"
          >
            <i className="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-[8px] p-3 text-xs text-red-400">
              <i className="fa-solid fa-triangle-exclamation mr-1.5"></i>{error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <i className="fa-solid fa-spinner fa-spin text-[var(--c-text3)]"></i>
              <span className="text-xs text-[var(--c-text3)] ml-2">Učitavanje...</span>
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-6">
              <i className="fa-solid fa-comments text-2xl text-[var(--c-text3)] mb-2"></i>
              <p className="text-xs text-[var(--c-text3)]">Nema kontakata za ovaj artikal.</p>
              <p className="text-[10px] text-[var(--c-text3)] mt-1">Kupac mora prvo poslati poruku o artiklu.</p>
            </div>
          ) : (
            <>
              <p className="text-[10px] text-[var(--c-text3)] uppercase tracking-wider font-bold mb-2">
                Kontakti za ovaj artikal
              </p>
              {candidates.map(buyer => (
                <button
                  key={buyer.id}
                  disabled={submitting}
                  onClick={() => handlePickBuyer(buyer.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-[10px] border border-[var(--c-border)] bg-[var(--c-card)] hover:bg-[var(--c-hover)] transition-colors disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-full bg-[var(--c-hover)] flex items-center justify-center overflow-hidden shrink-0">
                    {buyer.avatar_url ? (
                      <img src={buyer.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <i className="fa-solid fa-user text-xs text-[var(--c-text3)]"></i>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-bold text-[var(--c-text)]">{buyer.full_name || buyer.username}</p>
                    <p className="text-[10px] text-[var(--c-text3)]">@{buyer.username}</p>
                  </div>
                  <div className="text-[10px] text-emerald-500 font-bold">
                    <i className="fa-solid fa-check mr-1"></i>Odaberi
                  </div>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer — sold outside option */}
        <div className="border-t border-[var(--c-border)] p-4">
          <button
            disabled={submitting}
            onClick={handleSoldOutside}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-[10px] border border-dashed border-[var(--c-border)] text-[var(--c-text2)] hover:bg-[var(--c-hover)] transition-colors disabled:opacity-50"
          >
            <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
            <span className="text-xs font-medium">Prodano izvan NudiNađi</span>
          </button>
          <p className="text-[9px] text-[var(--c-text3)] text-center mt-1.5">
            <i className="fa-solid fa-info-circle mr-1"></i>Nema XP za prodaju izvan platforme
          </p>
        </div>
      </div>
    </div>
  );
}
