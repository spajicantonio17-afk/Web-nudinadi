'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { getProfileByUsername } from '@/services/profileService';
import { getUserProducts } from '@/services/productService';
import { getUserReviews } from '@/services/reviewService';
import { getOrCreateConversation } from '@/services/messageService';
import type { Profile, ProductWithSeller, ReviewWithUsers } from '@/lib/database.types';
import { xpForNextLevel } from '@/lib/database.types';
import { BAM_RATE } from '@/lib/constants';

function formatTimeLabel(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Danas';
  if (d === 1) return 'Jučer';
  if (d < 7) return `Prije ${d} dana`;
  if (d < 30) return `Prije ${Math.floor(d / 7)} sedmica`;
  return `Prije ${Math.floor(d / 30)} mjeseci`;
}

function formatMemberSince(dateStr?: string): string {
  if (!dateStr) return 'Nepoznato';
  const date = new Date(dateStr);
  const months = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni', 'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex text-yellow-500 text-[10px] gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <i key={star} className={`fa-star ${rating >= star ? 'fa-solid' : rating >= star - 0.5 ? 'fa-solid fa-star-half-stroke' : 'fa-regular text-[var(--c-text-muted)]'}`} />
      ))}
    </div>
  );
}

function UserProfileContent() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<ProductWithSeller[]>([]);
  const [reviews, setReviews] = useState<ReviewWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<'oglasi' | 'dojmovi'>('oglasi');
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    if (!params.username) return;
    setLoading(true);
    getProfileByUsername(decodeURIComponent(params.username))
      .then(async (p) => {
        setProfile(p);
        // Load products and reviews in parallel
        const [prods, revs] = await Promise.allSettled([
          getUserProducts(p.id),
          getUserReviews(p.id),
        ]);
        if (prods.status === 'fulfilled') setProducts(prods.value.filter(pr => pr.status === 'active'));
        if (revs.status === 'fulfilled') setReviews(revs.value);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.username]);

  const handleContact = async () => {
    if (!user) { router.push('/login'); return; }
    if (!profile) return;
    if (profile.id === user.id) { showToast('Ovo je vaš profil', 'info'); return; }
    setContacting(true);
    try {
      const convo = await getOrCreateConversation(user.id, profile.id);
      router.push(`/messages?conversation=${convo.id}`);
    } catch {
      showToast('Greška pri otvaranju poruke', 'error');
    } finally {
      setContacting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Profil" showSigurnost={false}>
        <div className="max-w-2xl mx-auto mt-4 pb-24 space-y-3 animate-pulse">
          <div className="h-32 bg-[var(--c-card)] rounded-[24px]" />
          <div className="h-10 bg-[var(--c-card)] rounded-[14px]" />
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-[var(--c-card)] rounded-[16px]" />)}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (notFound || !profile) {
    return (
      <MainLayout title="Profil" showSigurnost={false}>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <i className="fa-solid fa-user-slash text-4xl text-[var(--c-text3)] mb-4"></i>
          <h2 className="text-lg font-black text-[var(--c-text)] mb-2">Korisnik nije pronađen</h2>
          <p className="text-sm text-[var(--c-text3)] mb-6">Profil @{params.username} ne postoji.</p>
          <button onClick={() => router.push('/')} className="blue-gradient text-white px-6 py-3 rounded-[14px] font-bold text-xs uppercase tracking-widest">
            Nazad na početnu
          </button>
        </div>
      </MainLayout>
    );
  }

  const avgRating = reviews.length > 0
    ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 10) / 10
    : 0;
  const xpProgress = xpForNextLevel(profile.xp);
  const isOwnProfile = user?.id === profile.id;

  return (
    <MainLayout title={`@${profile.username}`} showSigurnost={false}>
      <div className="max-w-2xl mx-auto mt-1 pb-32 space-y-3">

        {/* PROFILE HEADER */}
        <div className="relative bg-[var(--c-card)] rounded-[24px] overflow-hidden border border-[var(--c-border)] p-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 blur-[40px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-[18px] bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-xl shadow-blue-500/10 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.avatar_url || `https://picsum.photos/seed/${profile.id}/200/200`}
                alt={profile.username}
                className="w-full h-full object-cover rounded-[16px]"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-lg font-black text-[var(--c-text)] leading-none">{profile.username}</h1>
                  {profile.full_name && (
                    <p className="text-xs text-[var(--c-text3)] mt-0.5">{profile.full_name}</p>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <i className="fa-solid fa-location-dot text-[10px] text-blue-400"></i>
                      <span className="text-[11px] text-[var(--c-text2)]">{profile.location}</span>
                    </div>
                  )}
                </div>

                {/* Level */}
                <div className="flex flex-col items-end shrink-0 pl-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-widest">Level</span>
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-500 italic">{profile.level}</span>
                  </div>
                  <div className="w-28">
                    <div className="flex justify-between text-[8px] font-bold text-[var(--c-text3)] mb-0.5">
                      <span className="text-blue-400">{xpProgress.current} XP</span>
                      <span>{xpProgress.needed}</span>
                    </div>
                    <div className="h-1.5 bg-[var(--c-overlay)] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full" style={{ width: `${xpProgress.progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <i className="fa-solid fa-check-circle text-[8px]"></i> Verificiran
                </span>
                {avgRating >= 4.5 && reviews.length >= 5 && (
                  <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <i className="fa-solid fa-star text-[8px]"></i> Top Prodavač
                  </span>
                )}
                {profile.level >= 5 && (
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <i className="fa-solid fa-shield text-[8px]"></i> Premium
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                {isOwnProfile ? (
                  <button onClick={() => router.push('/profile')} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-[9px] font-bold text-blue-500 hover:bg-blue-500/20 transition-all active:scale-95">
                    <i className="fa-solid fa-pen text-[8px]"></i> Uredi profil
                  </button>
                ) : (
                  <button onClick={handleContact} disabled={contacting} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-full text-[9px] font-bold hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-500/20">
                    {contacting ? <i className="fa-solid fa-spinner animate-spin text-[8px]"></i> : <i className="fa-regular fa-comment text-[8px]"></i>}
                    Pošalji Poruku
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="relative z-10 mt-4 pt-4 border-t border-[var(--c-border)]">
              <p className="text-[11px] text-[var(--c-text2)] leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Oglasi', value: products.length, icon: 'fa-tags', color: 'blue' },
            { label: 'Prodano', value: profile.total_sales, icon: 'fa-bag-shopping', color: 'emerald' },
            { label: 'Ocjena', value: avgRating > 0 ? avgRating.toFixed(1) : '—', icon: 'fa-star', color: 'yellow' },
            { label: 'Dojmovi', value: reviews.length, icon: 'fa-comments', color: 'purple' },
          ].map(stat => (
            <div key={stat.label} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-3 flex flex-col items-center gap-1 text-center">
              <i className={`fa-solid ${stat.icon} text-${stat.color}-400 text-xs`}></i>
              <span className="text-base font-black text-[var(--c-text)] leading-none">{stat.value}</span>
              <span className="text-[9px] text-[var(--c-text3)] uppercase tracking-wider font-bold">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex p-0.5 bg-[var(--c-card)] border border-[var(--c-border)] rounded-[14px]">
          {(['oglasi', 'dojmovi'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-[10px] text-[10px] font-bold transition-all capitalize ${
                activeTab === tab ? 'bg-[var(--c-active)] text-[var(--c-text)] shadow-sm' : 'text-[var(--c-text3)] hover:text-[var(--c-text2)]'
              }`}
            >
              {tab === 'oglasi' ? `Oglasi (${products.length})` : `Dojmovi (${reviews.length})`}
            </button>
          ))}
        </div>

        {/* LISTINGS TAB */}
        {activeTab === 'oglasi' && (
          <div className="animate-[fadeIn_0.2s_ease-out]">
            {products.length === 0 ? (
              <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] p-10 text-center">
                <i className="fa-solid fa-ghost text-2xl text-[var(--c-text3)] mb-3"></i>
                <p className="text-sm font-bold text-[var(--c-text)]">Nema aktivnih oglasa</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {products.map(p => (
                  <div
                    key={p.id}
                    onClick={() => router.push(`/product/${p.id}`)}
                    className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:border-[var(--c-border2)] group"
                  >
                    <div className="aspect-square overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.images?.[0] || `https://picsum.photos/seed/${p.id}/300/300`}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-2.5">
                      <p className="text-[11px] font-bold text-[var(--c-text)] line-clamp-1">{p.title}</p>
                      <p className="text-[12px] font-black text-blue-500 mt-0.5">€{Number(p.price).toLocaleString()}</p>
                      <p className="text-[9px] text-[var(--c-text3)] mt-0.5">{Math.round(Number(p.price) * BAM_RATE)} KM · {formatTimeLabel(p.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'dojmovi' && (
          <div className="space-y-3 animate-[fadeIn_0.2s_ease-out]">
            {/* Rating Summary */}
            {reviews.length > 0 && (
              <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] p-5 flex items-center gap-6">
                <div className="flex flex-col items-center min-w-[80px]">
                  <span className="text-4xl font-black text-[var(--c-text)] leading-none">{avgRating}</span>
                  <div className="my-2"><StarRating rating={avgRating} /></div>
                  <span className="text-[9px] text-[var(--c-text3)] uppercase tracking-widest">{reviews.length} dojmova</span>
                </div>
                <div className="flex-1 space-y-1.5 border-l border-[var(--c-border)] pl-5">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = reviews.filter(r => r.rating === star).length;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-[9px] text-[var(--c-text3)] w-3">{star}</span>
                        <div className="flex-1 h-1.5 bg-[var(--c-overlay)] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${star >= 4 ? 'bg-blue-500' : star === 3 ? 'bg-yellow-500' : 'bg-red-400'}`}
                            style={{ width: `${(count / reviews.length) * 100}%` }} />
                        </div>
                        <span className="text-[8px] text-[var(--c-text3)] w-3 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] p-10 text-center">
                <i className="fa-solid fa-comments text-2xl text-[var(--c-text3)] mb-3"></i>
                <p className="text-sm font-bold text-[var(--c-text)]">Još nema dojmova</p>
              </div>
            ) : reviews.map(review => (
              <div key={review.id} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[10px] overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={review.reviewer?.avatar_url || `https://picsum.photos/seed/${review.reviewer_id}/100/100`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--c-text)]">{review.reviewer?.username || 'Korisnik'}</p>
                      <div className="flex text-yellow-500 text-[8px] gap-0.5 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`fa-solid fa-star ${i < review.rating ? '' : 'text-[var(--c-text-muted)]'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] text-[var(--c-text3)]">{formatTimeLabel(review.created_at)}</span>
                </div>
                {review.comment && (
                  <p className="text-xs text-[var(--c-text2)] leading-relaxed pl-10">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* MEMBER SINCE */}
        <div className="text-center py-4">
          <p className="text-[10px] text-[var(--c-text-muted)]">
            <i className="fa-regular fa-calendar mr-1.5"></i>
            Član od {formatMemberSince(profile.created_at)}
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

export default function UserProfilePage() {
  return (
    <Suspense>
      <UserProfileContent />
    </Suspense>
  );
}
