'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { CREDIT_PACKAGES } from '@/lib/plans';
import { getSupabase } from '@/lib/supabase';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
}

export default function KreditiPage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  const success = searchParams.get('success');
  const cancelled = searchParams.get('cancelled');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/krediti');
      return;
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  async function fetchData() {
    if (!user) return;
    setLoading(true);
    const supabase = getSupabase();

    const [profileRes, txRes] = await Promise.all([
      supabase.from('profiles').select('credit_balance').eq('id', user.id).single(),
      supabase
        .from('credit_transactions')
        .select('id, amount, type, description, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    if (profileRes.data) setBalance(profileRes.data.credit_balance);
    if (txRes.data) setTransactions(txRes.data);
    setLoading(false);
  }

  async function handleBuy(packageId: string) {
    if (!isAuthenticated) {
      router.push('/login?redirect=/krediti');
      return;
    }
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
        alert(data.error || t('credits.paymentError'));
        setBuying(null);
      }
    } catch {
      alert(t('credits.serverError'));
      setBuying(null);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('bs-BA', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function txIcon(type: string) {
    if (type === 'purchase') return 'fa-plus text-emerald-400';
    if (type === 'extra_photos') return 'fa-image text-blue-400';
    if (type === 'istaknuti') return 'fa-star text-amber-400';
    return 'fa-minus text-red-400';
  }

  function txLabel(type: string) {
    if (type === 'purchase') return t('credits.txPurchase');
    if (type === 'extra_photos') return t('credits.txExtraPhotos');
    if (type === 'istaknuti') return t('credits.txFeatured');
    return type;
  }

  return (
    <MainLayout title={t('credits.title')} showSigurnost={false} onBack={() => router.push('/menu')}>
      <div className="max-w-2xl mx-auto pt-2 pb-24 space-y-6">

        {/* Success / Cancel banners */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-[18px] p-4 flex items-center gap-3">
            <i className="fa-solid fa-circle-check text-emerald-400 text-lg"></i>
            <div>
              <p className="text-[13px] font-bold text-[var(--c-text)]">{t('credits.paymentSuccess')}</p>
              <p className="text-[11px] text-[var(--c-text3)]">{t('credits.creditsAdded')}</p>
            </div>
          </div>
        )}
        {cancelled && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-[18px] p-4 flex items-center gap-3">
            <i className="fa-solid fa-circle-xmark text-amber-400 text-lg"></i>
            <p className="text-[13px] text-[var(--c-text)]">{t('credits.paymentCancelled')}</p>
          </div>
        )}

        {/* Balance card */}
        <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[22px] p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl blue-gradient flex items-center justify-center text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
            <i className="fa-solid fa-coins text-xl"></i>
          </div>
          <div className="flex-1">
            <p className="text-[11px] uppercase font-bold tracking-[2px] text-[var(--c-text3)] mb-1">{t('credits.currentBalance')}</p>
            {loading ? (
              <div className="h-8 w-20 bg-[var(--c-active)] rounded animate-pulse"></div>
            ) : (
              <p className="text-[32px] font-black text-[var(--c-text)] leading-none">
                {balance ?? 0}
                <span className="text-[14px] font-bold text-[var(--c-text3)] ml-2">{t('credits.credits')}</span>
              </p>
            )}
          </div>
        </div>

        {/* Credit info */}
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-[18px] p-4 space-y-2">
          <p className="text-[12px] font-bold text-[var(--c-text)]">{t('credits.whatCanYouDo')}</p>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-image text-blue-400 text-xs w-4"></i>
            <p className="text-[11px] text-[var(--c-text3)]">{t('credits.useCase1')}</p>
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-star text-amber-400 text-xs w-4"></i>
            <p className="text-[11px] text-[var(--c-text3)]">{t('credits.useCase2')}</p>
          </div>
        </div>

        {/* Packages */}
        <div>
          <h2 className="text-[11px] font-black uppercase tracking-[2px] text-[var(--c-text3)] mb-3 px-1">{t('credits.buyCredits')}</h2>
          <div className="space-y-3">
            {CREDIT_PACKAGES.map((pkg, i) => {
              const isPopular = i === 1;
              const perCredit = (pkg.priceEur / pkg.credits).toFixed(2);
              return (
                <div
                  key={pkg.id}
                  className={`relative bg-[var(--c-card)] border rounded-[18px] p-4 flex items-center gap-4 ${
                    isPopular ? 'border-blue-500/40' : 'border-[var(--c-border)]'
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-2.5 left-4 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                      {t('credits.mostPopular')}
                    </span>
                  )}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isPopular ? 'blue-gradient text-white shadow-lg shadow-blue-500/20' : 'bg-[var(--c-active)] text-[var(--c-text3)]'
                  }`}>
                    <i className="fa-solid fa-coins text-lg"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[var(--c-text)]">{pkg.label}</p>
                    <p className="text-[12px] text-[var(--c-text3)]">{t('credits.creditsCount', { count: String(pkg.credits), price: perCredit })}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[18px] font-black text-[var(--c-text)]">{pkg.priceEur}€</p>
                    <button
                      onClick={() => handleBuy(pkg.id)}
                      disabled={buying !== null}
                      className={`mt-1 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 ${
                        isPopular
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-[var(--c-active)] text-[var(--c-text)] hover:bg-[var(--c-border2)]'
                      }`}
                    >
                      {buying === pkg.id
                        ? <i className="fa-solid fa-spinner animate-spin"></i>
                        : t('credits.buy')
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transaction history */}
        {!loading && transactions.length > 0 && (
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[2px] text-[var(--c-text3)] mb-3 px-1">{t('credits.history')}</h2>
            <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] overflow-hidden divide-y divide-[var(--c-border)]">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--c-active)] flex items-center justify-center flex-shrink-0">
                    <i className={`fa-solid ${txIcon(tx.type)} text-xs`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-[var(--c-text)]">{txLabel(tx.type)}</p>
                    {tx.description && (
                      <p className="text-[10px] text-[var(--c-text3)] truncate">{tx.description}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-[13px] font-black ${tx.amount > 0 ? 'text-emerald-400' : 'text-[var(--c-text)]'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </p>
                    <p className="text-[10px] text-[var(--c-text3)]">{formatDate(tx.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}
