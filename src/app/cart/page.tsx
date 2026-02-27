'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { useI18n } from '@/lib/i18n';
import { getProductById } from '@/services/productService';
import { getOrCreateConversation } from '@/services/messageService';
import type { ProductFull } from '@/lib/database.types';
import { BAM_RATE } from '@/lib/constants';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, removeFromCart, clearCart, cartCount } = useCart();
  const { showToast } = useToast();
  const { t } = useI18n();

  const [products, setProducts] = useState<ProductFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactingId, setContactingId] = useState<string | null>(null);

  // Load real products from DB
  useEffect(() => {
    if (items.length === 0) { setProducts([]); setLoading(false); return; }
    setLoading(true);
    Promise.allSettled(items.map(item => getProductById(item.productId)))
      .then(results => {
        const loaded = results
          .filter((r): r is PromiseFulfilledResult<ProductFull> => r.status === 'fulfilled')
          .map(r => r.value);
        setProducts(loaded);
      })
      .finally(() => setLoading(false));
  }, [items]);

  const totalPrice = products.reduce((sum, p) => sum + Number(p.price), 0);
  const totalKM = Math.round(totalPrice * BAM_RATE);

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeFromCart(id);
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast(t('cart.removed'));
  };

  const handleClear = () => {
    clearCart();
    setProducts([]);
    showToast(t('cart.cleared'));
  };

  const handleContactSeller = async (e: React.MouseEvent, product: ProductFull) => {
    e.stopPropagation();
    if (!user) { router.push('/login?redirect=/cart'); return; }
    if (product.seller_id === user.id) { showToast('Ovo je vaš oglas', 'info'); return; }
    setContactingId(product.id);
    try {
      const convo = await getOrCreateConversation(user.id, product.seller_id, product.id);
      router.push(`/messages?conversation=${convo.id}`);
    } catch {
      showToast('Greška pri otvaranju poruke', 'error');
    } finally {
      setContactingId(null);
    }
  };

  return (
    <MainLayout title={t('cart.title')} showSigurnost={false}>
      <div className="pt-2 pb-24 px-2 sm:px-0">

        {/* Header */}
        <div className="mb-6 px-1 sm:px-2">
          <h1 className="text-2xl font-black text-[var(--c-text)] uppercase tracking-tight mb-1">{t('cart.title')}</h1>
          <p className="text-xs text-[var(--c-text3)]">{t('cart.itemCount', { count: cartCount })}</p>
        </div>

        {loading ? (
          /* Skeleton */
          <div className="flex flex-col gap-3 mb-6">
            {items.map(item => (
              <div key={item.productId} className="bg-[var(--c-card)] rounded-[16px] h-24 border border-[var(--c-border)] animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            {/* Cart Items */}
            <div className="flex flex-col gap-3 mb-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => router.push(`/product/${product.id}`)}
                  className="bg-[var(--c-card)] rounded-[16px] overflow-hidden flex border border-[var(--c-border)] relative group active:scale-[0.98] transition-transform cursor-pointer hover:border-[var(--c-border2)]"
                >
                  {/* Thumbnail */}
                  <div className="w-20 sm:w-24 h-20 sm:h-24 shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/200/200`}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="text-[11px] font-bold text-[var(--c-text)] leading-tight line-clamp-1 mb-0.5">{product.title}</h3>
                      <div className="flex items-center gap-1.5">
                        <i className="fa-solid fa-location-dot text-[8px] text-[var(--c-text3)]"></i>
                        <span className="text-[10px] text-[var(--c-text3)]">{product.location || 'Nepoznato'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[14px] font-black text-[var(--c-text)]">€{Number(product.price).toLocaleString()}</span>
                        <span className="text-[9px] text-blue-400 font-bold">{Math.round(Number(product.price) * BAM_RATE)} KM</span>
                      </div>
                      {/* Contact seller button */}
                      {user && product.seller_id !== user.id && (
                        <button
                          onClick={(e) => handleContactSeller(e, product)}
                          disabled={contactingId === product.id}
                          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-2 sm:py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-bold text-blue-500 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                        >
                          {contactingId === product.id
                            ? <i className="fa-solid fa-spinner animate-spin text-[8px]"></i>
                            : <i className="fa-regular fa-comment text-[8px]"></i>}
                          Kontakt
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={(e) => handleRemove(e, product.id)}
                    className="absolute top-2 right-2 w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                  >
                    <i className="fa-solid fa-trash-can text-[10px]"></i>
                  </button>
                </div>
              ))}
            </div>

            {/* Summary Card */}
            <div className="bg-[var(--c-card)] rounded-[24px] border border-[var(--c-border)] p-5 mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-[var(--c-text3)] uppercase tracking-widest">{t('cart.total')}</span>
                <span className="text-xl font-black text-[var(--c-text)]">€{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-end">
                <span className="text-[10px] text-blue-400 font-bold">KM {totalKM.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout info */}
            <div className="w-full bg-blue-500/5 border border-blue-500/20 rounded-[24px] py-4 px-5 flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-handshake text-blue-400"></i>
              </div>
              <div>
                <p className="text-[12px] font-bold text-[var(--c-text)]">Direktan dogovor s prodavačem</p>
                <p className="text-[10px] text-[var(--c-text3)] mt-0.5">Klikni &quot;Kontakt&quot; pored artikla da otvoriš razgovor s prodavačem</p>
              </div>
            </div>

            {/* Clear Cart */}
            <button
              onClick={handleClear}
              className="w-full py-3 bg-[var(--c-hover)] border border-[var(--c-border2)] rounded-[16px] text-xs font-bold text-[var(--c-text2)] uppercase tracking-widest hover:bg-[var(--c-active)] hover:text-[var(--c-text)] transition-colors"
            >
              {t('cart.clear')}
            </button>
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <div className="w-20 h-20 bg-[var(--c-hover)] rounded-full flex items-center justify-center mb-4">
              <i className="fa-solid fa-bag-shopping text-3xl text-[var(--c-text3)]"></i>
            </div>
            <p className="text-sm text-[var(--c-text2)] font-bold uppercase tracking-wider">{t('cart.empty')}</p>
            <button onClick={() => router.push('/')} className="mt-4 text-blue-400 text-xs font-bold uppercase tracking-widest hover:text-[var(--c-text)]">
              {t('cart.explore')}
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
