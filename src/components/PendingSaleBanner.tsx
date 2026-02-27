'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { getPendingTransactionsForBuyer, confirmTransaction, denyTransaction } from '@/services/transactionService';
import type { TransactionWithDetails } from '@/lib/database.types';
import { getSupabase } from '@/lib/supabase';

export default function PendingSaleBanner() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getPendingTransactionsForBuyer(user.id);
      setTransactions(data);
    } catch {
      // Silent fail
    }
  }, [user]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Listen for realtime changes on transactions table
  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();
    const channel = supabase
      .channel(`transactions_buyer_${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `buyer_id=eq.${user.id}` },
        () => { loadTransactions(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, loadTransactions]);

  const handleConfirm = async (txId: string) => {
    if (!user || processing) return;
    setProcessing(txId);
    try {
      await confirmTransaction(txId, user.id);
      setTransactions(prev => prev.filter(t => t.id !== txId));
    } catch {
      // Error
    } finally {
      setProcessing(null);
    }
  };

  const handleDeny = async (txId: string) => {
    if (!user || processing) return;
    setProcessing(txId);
    try {
      await denyTransaction(txId, user.id);
      setTransactions(prev => prev.filter(t => t.id !== txId));
    } catch {
      // Error
    } finally {
      setProcessing(null);
    }
  };

  if (transactions.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {transactions.map(tx => {
        const isProcessing = processing === tx.id;
        const expiresAt = new Date(tx.expires_at);
        const hoursLeft = Math.max(0, Math.round((expiresAt.getTime() - Date.now()) / 3600000));
        const productTitle = tx.product?.title || 'Artikal';
        const sellerName = tx.seller?.full_name || tx.seller?.username || 'Korisnik';

        return (
          <div
            key={tx.id}
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-[12px] p-3 sm:p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-handshake text-blue-400 text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[var(--c-text)]">
                  Potvrda kupovine
                </p>
                <p className="text-[11px] text-[var(--c-text2)] mt-0.5">
                  <span className="font-semibold text-[var(--c-text)]">{sellerName}</span> želi označiti{' '}
                  <span className="font-semibold text-[var(--c-text)]">&quot;{productTitle}&quot;</span> kao prodano tebi.
                </p>
                <p className="text-[9px] text-[var(--c-text3)] mt-1">
                  <i className="fa-regular fa-clock mr-1"></i>Ističe za {hoursLeft}h
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                disabled={isProcessing}
                onClick={() => handleConfirm(tx.id)}
                className="flex-1 py-2 rounded-[8px] bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isProcessing ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : (
                  <><i className="fa-solid fa-check"></i>Da, kupio/la sam</>
                )}
              </button>
              <button
                disabled={isProcessing}
                onClick={() => handleDeny(tx.id)}
                className="flex-1 py-2 rounded-[8px] bg-[var(--c-hover)] text-[var(--c-text2)] text-xs font-bold hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-xmark"></i>Ne, nisam
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
