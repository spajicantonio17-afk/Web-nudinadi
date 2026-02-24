'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/lib/auth';
import { getFavorites, removeFavorite as removeFav } from '@/services/favoriteService';
import type { FavoriteWithProduct } from '@/lib/database.types';

function formatTimeLabel(createdAt: string): string {
  const diffDays = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
  if (diffDays === 0) return 'Danas';
  if (diffDays === 1) return 'Jučer';
  if (diffDays < 7) return `${diffDays}d`;
  return `${Math.floor(diffDays / 7)}tj`;
}

export default function FavoritesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteWithProduct[]>([]);
  const [loadingFavs, setLoadingFavs] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login?redirect=/favorites');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!user?.id) return;
    setLoadingFavs(true);
    getFavorites(user.id)
      .then(setFavorites)
      .catch(console.error)
      .finally(() => setLoadingFavs(false));
  }, [user?.id]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <i className="fa-solid fa-spinner animate-spin text-2xl text-blue-500"></i>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) return null;

  const handleRemove = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    if (!user?.id) return;
    // Optimistic remove
    setFavorites(prev => prev.filter(f => f.product_id !== productId));
    try {
      await removeFav(user.id, productId);
    } catch {
      // Re-add on error
      if (user?.id) {
        getFavorites(user.id).then(setFavorites).catch(console.error);
      }
    }
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <MainLayout
      title="Sviđanja"
      showSigurnost={false}
      headerRight={
        <button
          onClick={() => router.push('/')}
          className="w-10 h-10 rounded-full bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      }
    >
      <div className="pt-2 pb-24 px-2 sm:px-0">
        <div className="mb-6 px-1 sm:px-2">
          <h1 className="text-2xl font-black text-[var(--c-text)] uppercase tracking-tight mb-1">Moji Favoriti</h1>
          <p className="text-xs text-[var(--c-text3)]">Artikli koje ste označili sa &quot;Sviđa mi se&quot;</p>
        </div>

        {loadingFavs ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-[var(--c-card)] rounded-[16px] overflow-hidden border border-[var(--c-border)] animate-pulse">
                <div className="aspect-square bg-[var(--c-hover)]"></div>
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-[var(--c-hover)] rounded w-3/4"></div>
                  <div className="h-4 bg-[var(--c-hover)] rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {favorites.map((fav) => {
              const p = fav.product;
              if (!p) return null;
              const imageUrl = p.images?.[0] || `https://picsum.photos/seed/${p.id}/400/300`;
              return (
                <div
                  key={fav.id}
                  onClick={() => router.push(`/product/${p.id}`)}
                  className="bg-[var(--c-card)] rounded-[16px] overflow-hidden flex flex-col border border-[var(--c-border)] relative group active:scale-[0.98] transition-transform cursor-pointer"
                >
                  <div className="aspect-square relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <button
                      onClick={(e) => handleRemove(e, p.id)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <i className="fa-solid fa-heart"></i>
                    </button>
                    {p.status === 'sold' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-[10px] font-black text-white bg-red-500 px-2 py-1 rounded-full uppercase">Prodano</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 sm:p-3">
                    <h3 className="text-[10px] sm:text-[11px] font-bold text-[var(--c-text)] leading-tight line-clamp-2 sm:line-clamp-1 mb-1">{p.title}</h3>
                    <div className="flex justify-between items-center mt-1 sm:mt-2">
                      <span className="text-[12px] font-black text-[var(--c-text)]">&euro;{Number(p.price).toLocaleString()}</span>
                      <span className="text-[9px] text-[var(--c-text3)]">{formatTimeLabel(p.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <div className="w-20 h-20 bg-[var(--c-hover)] rounded-full flex items-center justify-center mb-4">
              <i className="fa-regular fa-heart text-3xl text-[var(--c-text3)]"></i>
            </div>
            <p className="text-sm text-[var(--c-text2)] font-bold uppercase tracking-wider">Nema spašenih artikala</p>
            <button onClick={() => router.push('/')} className="mt-4 text-blue-400 text-xs font-bold uppercase tracking-widest hover:text-[var(--c-text)]">
              Istraži Ponudu
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
