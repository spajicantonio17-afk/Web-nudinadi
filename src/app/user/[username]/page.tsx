'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { getProfileByUsername, getProfile } from '@/services/profileService';
import { getUserProducts } from '@/services/productService';
import { getUserReviews } from '@/services/reviewService';
import { getOrCreateConversation } from '@/services/messageService';
import type { Profile, ProductWithSeller, ReviewWithUsers } from '@/lib/database.types';
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
  const [shareToast, setShareToast] = useState(false);

  useEffect(() => {
    if (!params.username) return;
    setLoading(true);
    const decoded = decodeURIComponent(params.username);
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decoded);
    const fetchProfile = isUUID ? getProfile(decoded) : getProfileByUsername(decoded);
    fetchProfile
      .then(async (p) => {
        setProfile(p);
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

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/user/${profile?.username || params.username}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${profile?.username} - NudiNađi`, url: profileUrl });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      }
    } catch {
      // User cancelled share
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
  const isOwnProfile = user?.id === profile.id;
  const userLevel = profile.level || 1;

  return (
    <MainLayout title={`@${profile.username}`} showSigurnost={false}>
      <div className="max-w-2xl mx-auto mt-1 pb-32 space-y-3">

        {/* Share Toast */}
        {shareToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-[fadeIn_0.2s_ease-out]">
            <i className="fa-solid fa-check mr-1.5"></i> Link kopiran!
          </div>
        )}

        {/* ── PROFILE HEADER (matches private profile layout) ── */}
        <div className="relative bg-[var(--c-card)] rounded-[24px] overflow-hidden border border-[var(--c-border)] p-5">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 blur-[40px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            {/* Top row: Avatar + Name + Level */}
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative shrink-0 mt-1">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-[16px] md:rounded-[18px] bg-gradient-to-br from-[var(--c-avatar-border-from,#3b82f6)] to-[var(--c-avatar-border-to,#6366f1)] p-0.5 shadow-2xl shadow-blue-500/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.avatar_url || `https://picsum.photos/seed/${profile.id}/200/200`}
                    alt={profile.username}
                    className="w-full h-full object-cover rounded-[14px] md:rounded-[16px]"
                  />
                </div>
              </div>

              {/* Name + Location + Badges */}
              <div className="flex-1 min-w-0 pt-0.5">
                <h2 className="text-base md:text-lg font-black text-[var(--c-text)] tracking-tight leading-none truncate">{profile.username}</h2>
                {profile.full_name && (
                  <p className="text-xs text-[var(--c-text3)] mt-0.5 truncate">{profile.full_name}</p>
                )}
                {profile.location && (
                  <div className="flex items-center gap-1.5 text-[var(--c-text2)] mt-1.5">
                    <i className="fa-solid fa-location-dot text-[10px] text-blue-400"></i>
                    <span className="text-[11px] font-medium truncate">{profile.location}</span>
                  </div>
                )}

                {/* Verification Badges */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {profile.email_verified ? (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <i className="fa-solid fa-check-circle text-[9px]"></i> Verificiran
                    </span>
                  ) : (
                    <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <i className="fa-solid fa-exclamation-circle text-[9px]"></i> Nije verificiran
                    </span>
                  )}
                  {avgRating >= 4.5 && reviews.length >= 5 && (
                    <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <i className="fa-solid fa-star text-[8px]"></i> Top Prodavač
                    </span>
                  )}
                  {userLevel >= 5 && (
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <i className="fa-solid fa-shield text-[8px]"></i> Premium
                    </span>
                  )}
                  {profile.phone && (
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <i className="fa-solid fa-phone text-[8px]"></i> Telefon
                    </span>
                  )}
                </div>

                {/* Social Media Links */}
                {(profile.instagram_url || profile.facebook_url) && (
                  <div className="flex items-center gap-2 mt-2">
                    {profile.instagram_url && (
                      <a
                        href={`https://instagram.com/${profile.instagram_url.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--c-hover)] border border-[var(--c-border)] text-[10px] font-bold text-[var(--c-text3)] hover:text-[var(--c-text)] hover:border-[var(--c-border2)] transition-all"
                      >
                        <i className="fa-brands fa-instagram text-pink-500"></i>
                        @{profile.instagram_url.replace('@', '')}
                      </a>
                    )}
                    {profile.facebook_url && (
                      <a
                        href={profile.facebook_url.startsWith('http') ? profile.facebook_url : `https://facebook.com/${profile.facebook_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--c-hover)] border border-[var(--c-border)] text-[10px] font-bold text-[var(--c-text3)] hover:text-[var(--c-text)] hover:border-[var(--c-border2)] transition-all"
                      >
                        <i className="fa-brands fa-facebook-f text-blue-500"></i>
                        Facebook
                      </a>
                    )}
                  </div>
                )}
                {isOwnProfile && !profile.instagram_url && !profile.facebook_url && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => router.push('/menu')}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--c-hover)] border border-dashed border-[var(--c-border2)] text-[10px] font-bold text-[var(--c-text-muted)] hover:text-[var(--c-text3)] transition-all"
                    >
                      <i className="fa-solid fa-plus text-[8px]"></i>
                      Poveži društvene mreže
                    </button>
                  </div>
                )}
              </div>

              {/* Level (number only, no XP bar) */}
              <div className="shrink-0 flex flex-col items-center pl-2">
                <span className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-widest">Level</span>
                <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-500 italic drop-shadow-[0_0_15px_rgba(59,130,246,0.2)] leading-none mt-0.5">{userLevel}</span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-3">
              {isOwnProfile ? (
                <button
                  onClick={() => router.push('/profile')}
                  className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full hover:bg-blue-500/20 hover:border-blue-500/50 transition-all active:scale-95 shadow-lg"
                >
                  <i className="fa-solid fa-pen text-[9px] md:text-[10px] text-blue-500"></i>
                  <span className="text-[8px] md:text-[9px] font-bold text-blue-500 uppercase tracking-wide">Uredi profil</span>
                </button>
              ) : (
                <button
                  onClick={handleContact}
                  disabled={contacting}
                  className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-500/20"
                >
                  {contacting ? <i className="fa-solid fa-spinner animate-spin text-[9px]"></i> : <i className="fa-regular fa-comment text-[9px]"></i>}
                  <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wide">Pošalji Poruku</span>
                </button>
              )}
              <button
                onClick={handleShareProfile}
                className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-full hover:border-blue-500/40 hover:bg-blue-500/5 transition-all active:scale-95 group shadow-lg"
              >
                <i className="fa-solid fa-share-nodes text-[9px] md:text-[10px] text-[var(--c-text2)] group-hover:text-blue-500 transition-colors"></i>
                <span className="text-[8px] md:text-[9px] font-bold text-[var(--c-text2)] group-hover:text-[var(--c-text)] uppercase tracking-wide">Podijeli</span>
              </button>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="relative z-10 mt-4 pt-4 border-t border-[var(--c-border)]">
              <p className="text-[11px] text-[var(--c-text2)] leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </div>

        {/* ── STATS GRID ── */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Oglasi', value: products.length, icon: 'fa-tags', color: 'blue' },
            { label: 'Prodano', value: profile.total_sales, icon: 'fa-bag-shopping', color: 'emerald' },
            { label: 'Ocjena', value: avgRating > 0 ? avgRating.toFixed(1) : '\u2014', icon: 'fa-star', color: 'yellow' },
            { label: 'Dojmovi', value: reviews.length, icon: 'fa-comments', color: 'purple' },
          ].map(stat => (
            <div key={stat.label} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-3 flex flex-col items-center gap-1 text-center">
              <i className={`fa-solid ${stat.icon} text-${stat.color}-400 text-xs`}></i>
              <span className="text-base font-black text-[var(--c-text)] leading-none">{stat.value}</span>
              <span className="text-[9px] text-[var(--c-text3)] uppercase tracking-wider font-bold">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div className="flex p-0.5 bg-[var(--c-card)] border border-[var(--c-border)] rounded-[14px]">
          {(['oglasi', 'dojmovi'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-[10px] text-[10px] font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTab === tab
                  ? 'bg-[var(--c-active)] text-[var(--c-text)] shadow-sm'
                  : 'text-[var(--c-text3)] hover:text-[var(--c-text2)]'
              }`}
            >
              {tab === 'oglasi' ? 'Oglasi' : 'Dojmovi'}
              <span className={`min-w-[16px] h-4 px-1 rounded-full text-[8px] font-black flex items-center justify-center ${
                activeTab === tab
                  ? 'bg-blue-500/15 text-blue-500'
                  : 'bg-[var(--c-overlay)] text-[var(--c-text3)]'
              }`}>
                {tab === 'oglasi' ? products.length : reviews.length}
              </span>
            </button>
          ))}
        </div>

        {/* ── LISTINGS TAB ── */}
        {activeTab === 'oglasi' && (
          <div className="animate-[fadeIn_0.2s_ease-out]">
            {products.length === 0 ? (
              <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] p-6 flex flex-col items-center text-center min-h-[200px] justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[linear-gradient(var(--c-grid-line,rgba(255,255,255,0.03))_1px,transparent_1px),linear-gradient(90deg,var(--c-grid-line,rgba(255,255,255,0.03))_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-[16px] bg-[var(--c-overlay)] border border-[var(--c-border)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500">
                    <i className="fa-solid fa-ghost text-xl text-[var(--c-text-muted)] group-hover:text-[var(--c-text)] transition-colors"></i>
                  </div>
                  <h3 className="text-[13px] font-black text-[var(--c-text)] mb-0.5">Nema Aktivnih Oglasa</h3>
                  <p className="text-[10px] text-[var(--c-text3)] max-w-[180px] leading-relaxed">Ovaj korisnik trenutno nema aktivnih oglasa.</p>
                </div>
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
                      <p className="text-[12px] font-black text-blue-500 mt-0.5">&euro;{Number(p.price).toLocaleString()}</p>
                      <p className="text-[9px] text-[var(--c-text3)] mt-0.5">{Math.round(Number(p.price) * BAM_RATE)} KM &middot; {formatTimeLabel(p.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── REVIEWS TAB ── */}
        {activeTab === 'dojmovi' && (
          <div className="space-y-3 animate-[fadeIn_0.2s_ease-out]">
            {/* Rating Summary */}
            {reviews.length > 0 && (
              <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] p-5 flex items-center gap-6">
                <div className="flex flex-col items-center justify-center min-w-[80px]">
                  <span className="text-4xl font-black text-[var(--c-text)] leading-none">{avgRating}</span>
                  <div className="my-2"><StarRating rating={avgRating} /></div>
                  <span className="text-[9px] text-[var(--c-text3)] uppercase tracking-widest">{reviews.length} Dojmova</span>
                </div>
                <div className="flex-1 space-y-2 border-l border-[var(--c-border)] pl-5">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = reviews.filter(r => r.rating === star).length;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-[9px] font-bold text-[var(--c-text3)] w-3">{star}</span>
                        <div className="flex-1 h-1.5 bg-[var(--c-card-alt)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${star >= 4 ? 'bg-blue-600' : star === 3 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%' }}
                          />
                        </div>
                        <span className="text-[8px] font-bold text-[var(--c-text3)] w-4 text-right">{count}</span>
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
            ) : (
              <div className="space-y-2">
                {reviews.map(review => (
                  <div key={review.id} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 hover:border-[var(--c-border2)] transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[var(--c-card-alt)] rounded-[10px] overflow-hidden shrink-0">
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
                      <span className="text-[9px] text-[var(--c-text-muted)]">{formatTimeLabel(review.created_at)}</span>
                    </div>
                    {review.comment && (
                      <p className="text-xs text-[var(--c-text2)] leading-relaxed pl-11">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MEMBER SINCE ── */}
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
