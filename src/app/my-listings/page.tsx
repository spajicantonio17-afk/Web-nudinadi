'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { getUserProducts, updateProduct, deleteProduct } from '@/services/productService';
import type { ProductWithSeller } from '@/lib/database.types';
import BuyerPickerModal from '@/components/BuyerPickerModal';

const STATUS_LABELS: Record<string, string> = {
  active: 'Aktivan', sold: 'Prodano', draft: 'Skica', pending_sale: 'Čeka potvrdu',
};
const STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-500', sold: 'text-gray-400', draft: 'text-amber-500', pending_sale: 'text-blue-400',
};
const STATUS_DOT: Record<string, string> = {
  active: 'bg-emerald-500', sold: 'bg-gray-400', draft: 'bg-amber-500', pending_sale: 'bg-blue-400',
};

export default function MyListingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<ProductWithSeller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [buyerPickerProduct, setBuyerPickerProduct] = useState<ProductWithSeller | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login?redirect=/my-listings');
  }, [authLoading, isAuthenticated, router]);

  const loadProducts = useCallback(() => {
    if (!user) return;
    setIsLoading(true);
    getUserProducts(user.id)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [user]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!menuOpenId) return;
    const handler = () => setMenuOpenId(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [menuOpenId]);

  const handleToggleStatus = async (p: ProductWithSeller) => {
    setMenuOpenId(null);
    const nextStatus = p.status === 'active' ? 'draft' : 'active';
    try {
      await updateProduct(p.id, { status: nextStatus });
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, status: nextStatus } : x));
      showToast(nextStatus === 'active' ? 'Oglas aktiviran.' : 'Oglas deaktiviran.');
    } catch {
      showToast('Greška pri promjeni statusa.', 'error');
    }
  };

  const handleMarkSold = (p: ProductWithSeller) => {
    setMenuOpenId(null);
    setBuyerPickerProduct(p);
  };

  const handleBuyerPickerSuccess = (status: 'pending_sale' | 'sold') => {
    if (!buyerPickerProduct) return;
    setProducts(prev => prev.map(x => x.id === buyerPickerProduct.id ? { ...x, status } : x));
    setBuyerPickerProduct(null);
    if (status === 'pending_sale') {
      showToast('Transakcija kreirana! Čekamo potvrdu kupca.');
    } else {
      showToast('Označeno kao prodano.');
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null);
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(x => x.id !== id));
      showToast('Oglas obrisan.');
    } catch {
      showToast('Greška pri brisanju.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading) {
    return (
      <MainLayout title="Moji Oglasi" showSigurnost={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <i className="fa-solid fa-spinner animate-spin text-2xl text-blue-500"></i>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <MainLayout title="Moji Oglasi" showSigurnost={false}>
      <div className="max-w-2xl mx-auto pt-4 pb-24 px-3 sm:px-4">

        <div className="flex items-center justify-between mb-6">
          <div className="min-w-0">
            <h1 className="text-xl font-black text-[var(--c-text)]">Moji Oglasi</h1>
            {!isLoading && (
              <p className="text-[11px] text-[var(--c-text3)]">{products.length} ukupno</p>
            )}
          </div>
          <button
            onClick={() => router.push('/upload')}
            className="blue-gradient text-white px-4 py-2.5 rounded-[12px] text-xs font-bold uppercase tracking-widest flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>Novi Oglas
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[var(--c-card)] rounded-[18px] h-24 animate-pulse border border-[var(--c-border)]" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <i className="fa-solid fa-box-open text-4xl text-[var(--c-text3)] mb-4 block"></i>
            <p className="text-sm font-bold text-[var(--c-text2)] uppercase tracking-wider">Nemate nijedan oglas</p>
            <button
              onClick={() => router.push('/upload')}
              className="mt-4 text-blue-400 text-xs font-bold uppercase tracking-widest hover:text-[var(--c-text)]"
            >
              Objavi prvi oglas
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {products.map(p => (
              <div key={p.id} className="relative">
                {/* Confirm delete overlay */}
                {confirmDeleteId === p.id && (
                  <div className="absolute inset-0 z-20 bg-[var(--c-card)] border border-red-500/30 rounded-[18px] flex items-center justify-between px-3 sm:px-5 shadow-lg">
                    <p className="text-[12px] font-bold text-[var(--c-text)]">Obrisati oglas?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-3 py-1.5 text-[11px] font-bold text-[var(--c-text2)] bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[10px]"
                      >
                        Odustani
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="px-3 py-1.5 text-[11px] font-bold text-white bg-red-500 rounded-[10px] hover:bg-red-600 disabled:opacity-60"
                      >
                        {deletingId === p.id
                          ? <i className="fa-solid fa-spinner animate-spin text-[10px]"></i>
                          : 'Obriši'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Listing row */}
                <div className={`bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] p-3 sm:p-4 flex items-center gap-3 sm:gap-4 transition-all ${confirmDeleteId === p.id ? 'opacity-0 pointer-events-none' : ''}`}>
                  {/* Thumbnail */}
                  <div
                    onClick={() => router.push('/product/' + p.id)}
                    className="w-14 h-14 sm:w-16 sm:h-16 bg-[var(--c-card-alt)] rounded-[12px] overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.images?.[0] || 'https://picsum.photos/seed/' + p.id + '/100/100'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div
                    onClick={() => router.push('/product/' + p.id)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <p className="text-sm font-bold text-[var(--c-text)] truncate">{p.title}</p>
                    <p className="text-xs text-[var(--c-text2)] mt-0.5">€{Number(p.price).toLocaleString()}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[p.status] || 'bg-gray-400'}`}></div>
                      <span className={`text-[10px] font-bold uppercase ${STATUS_COLORS[p.status] || 'text-gray-400'}`}>
                        {STATUS_LABELS[p.status] || p.status}
                      </span>
                    </div>
                  </div>

                  {/* Three-dot menu */}
                  <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === p.id ? null : p.id)}
                      className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[var(--c-hover)] border border-[var(--c-border)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors"
                    >
                      <i className="fa-solid fa-ellipsis-vertical text-xs"></i>
                    </button>

                    {menuOpenId === p.id && (
                      <div className="absolute right-0 top-10 z-30 bg-[var(--c-card)] border border-[var(--c-border)] rounded-[14px] shadow-xl min-w-[170px] overflow-hidden">
                        <button
                          onClick={() => { setMenuOpenId(null); router.push('/product/' + p.id); }}
                          className="w-full text-left px-4 py-3 text-[12px] font-bold text-[var(--c-text)] hover:bg-[var(--c-hover)] flex items-center gap-2.5 border-b border-[var(--c-border)]"
                        >
                          <i className="fa-solid fa-eye text-[var(--c-text3)] text-xs w-3"></i>
                          Pogledaj oglas
                        </button>
                        {p.status !== 'sold' && p.status !== 'pending_sale' && (
                          <button
                            onClick={() => handleMarkSold(p)}
                            className="w-full text-left px-4 py-3 text-[12px] font-bold text-[var(--c-text)] hover:bg-[var(--c-hover)] flex items-center gap-2.5 border-b border-[var(--c-border)]"
                          >
                            <i className="fa-solid fa-flag-checkered text-emerald-400 text-xs w-3"></i>
                            Označi prodano
                          </button>
                        )}
                        {p.status !== 'sold' && (
                          <button
                            onClick={() => handleToggleStatus(p)}
                            className="w-full text-left px-4 py-3 text-[12px] font-bold text-[var(--c-text)] hover:bg-[var(--c-hover)] flex items-center gap-2.5 border-b border-[var(--c-border)]"
                          >
                            <i className={`fa-solid ${p.status === 'active' ? 'fa-pause' : 'fa-play'} text-amber-400 text-xs w-3`}></i>
                            {p.status === 'active' ? 'Deaktiviraj' : 'Aktiviraj'}
                          </button>
                        )}
                        <button
                          onClick={() => { setMenuOpenId(null); setConfirmDeleteId(p.id); }}
                          className="w-full text-left px-4 py-3 text-[12px] font-bold text-red-400 hover:bg-red-500/10 flex items-center gap-2.5"
                        >
                          <i className="fa-solid fa-trash-can text-xs w-3"></i>
                          Obriši oglas
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BUYER PICKER MODAL */}
      {buyerPickerProduct && user && (
        <BuyerPickerModal
          productId={buyerPickerProduct.id}
          sellerId={user.id}
          onClose={() => setBuyerPickerProduct(null)}
          onSuccess={handleBuyerPickerSuccess}
        />
      )}
    </MainLayout>
  );
}
