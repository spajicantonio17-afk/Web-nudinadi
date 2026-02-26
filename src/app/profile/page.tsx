'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/lib/auth';
import { getUserProducts, deleteProduct, archiveProduct, unarchiveProduct } from '@/services/productService';
import { isUsernameAvailable } from '@/services/profileService';
import { uploadAvatar } from '@/services/uploadService';
import { getSupabase } from '@/lib/supabase';
import { CITIES, getRegionsForCountry, getCitiesByRegion } from '@/lib/location';
import type { ProductWithSeller, Review } from '@/lib/database.types';
import { xpForNextLevel } from '@/lib/database.types';

type ReviewWithReviewer = Review & {
  reviewer: { username: string; avatar_url: string | null } | null;
};

const REVIEWS_PER_PAGE = 10;

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
  const months = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
    'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar',
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function calcDraftCompletion(draft: ProductWithSeller): number {
  let score = 0;
  const total = 5;
  if (draft.title && draft.title.length > 0) score++;
  if (draft.description && draft.description.length > 0) score++;
  if (draft.price && draft.price > 0) score++;
  if (draft.images && draft.images.length > 0) score++;
  if (draft.category_id) score++;
  return Math.round((score / total) * 100);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex text-yellow-500 text-[10px] gap-0.5">
      {[1, 2, 3, 4, 5].map(star => {
        if (rating >= star) {
          return <i key={star} className="fa-solid fa-star" />;
        } else if (rating >= star - 0.5) {
          return <i key={star} className="fa-solid fa-star-half-stroke" />;
        }
        return <i key={star} className="fa-solid fa-star text-[var(--c-star-off)]" />;
      })}
    </div>
  );
}

function ProfileContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading, logout, refreshProfile, resendVerificationEmail } = useAuth();
  const initialTab = searchParams.get('tab') || 'Aktivni';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [userProducts, setUserProducts] = useState<ProductWithSeller[]>([]);
  const [reviews, setReviews] = useState<ReviewWithReviewer[]>([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState(false);

  // ── Edit Profile ──────────────────────────────────────
  const [verifyPopup, setVerifyPopup] = useState(false);
  const [verifySending, setVerifySending] = useState(false);
  const [verifySent, setVerifySent] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', fullName: '', bio: '', location: '', phone: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [locationCountry, setLocationCountry] = useState<'BiH' | 'HR'>('BiH');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openEdit = useCallback(() => {
    // Parse existing location to pre-select region + city
    const loc = user?.location || '';
    const match = CITIES.find(c => loc.includes(c.name));
    setSelectedRegion(match?.region || '');
    setSelectedCity(match?.name || '');
    setLocationCountry(match?.country || 'BiH');
    setEditForm({
      username: user?.username || '',
      fullName: user?.fullName || '',
      bio: user?.bio || '',
      location: loc,
      phone: user?.phone || '',
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setUsernameError(null);
    setEditOpen(true);
  }, [user]);

  const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleUsernameChange = (val: string) => {
    setEditForm(f => ({ ...f, username: val }));
    setUsernameError(null);
    setUsernameChecking(false);
    if (usernameTimer.current) clearTimeout(usernameTimer.current);
    if (!val || val === user?.username) return;
    if (val.length < 3) { setUsernameError('Minimum 3 znaka'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(val)) { setUsernameError('Samo slova, brojevi i _'); return; }
    setUsernameChecking(true);
    usernameTimer.current = setTimeout(async () => {
      try {
        const available = await Promise.race([
          isUsernameAvailable(val),
          new Promise<boolean>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
        ]);
        setUsernameChecking(false);
        if (!available) setUsernameError('Username je zauzet');
      } catch {
        setUsernameChecking(false);
      }
    }, 600);
  };

  const handleSaveProfile = async () => {
    if (!user?.id || saving || usernameError || usernameChecking) return;
    setSaving(true);
    setUsernameError(null);
    try {
      let avatarUrl: string | undefined;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(user.id, avatarFile);
      }

      // Build update payload — only send changed fields
      const locationValue = selectedCity ? `${selectedCity}, ${selectedRegion}` : null;
      const body: Record<string, string | null> = {
        full_name: editForm.fullName.trim() || null,
        bio: editForm.bio.trim() || null,
        location: locationValue,
        phone: editForm.phone.trim() || null,
      };
      if (editForm.username.trim() && editForm.username.trim() !== user.username) {
        body.username = editForm.username.trim();
      }
      if (avatarUrl) {
        body.avatar_url = avatarUrl;
      }

      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setUsernameError('Username je zauzet. Pokušaj drugi.');
        } else if (res.status === 401) {
          setUsernameError('Sesija je istekla. Prijavi se ponovo.');
        } else {
          setUsernameError(json.error || 'Greška pri čuvanju. Pokušaj ponovo.');
        }
        return;
      }

      await refreshProfile();
      setEditOpen(false);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch (err) {
      console.error('Profile save error:', err);
      setUsernameError('Greška pri čuvanju. Pokušaj ponovo.');
    } finally {
      setSaving(false);
    }
  };

  // Sync tab with URL
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'Aktivni') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [router, pathname, searchParams]);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login?redirect=/profile');
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch products
  useEffect(() => {
    if (!user?.id) return;
    getUserProducts(user.id).then(setUserProducts).catch(console.error);
  }, [user?.id]);

  // Fetch reviews (paginated)
  const fetchReviews = useCallback(async (page: number, append = false) => {
    if (!user?.id) return;
    setLoadingMoreReviews(true);
    try {
      const from = (page - 1) * REVIEWS_PER_PAGE;
      const to = from + REVIEWS_PER_PAGE - 1;
      const { data } = await getSupabase()
        .from('reviews')
        .select('*, reviewer:profiles!reviewer_id(username, avatar_url)')
        .eq('reviewed_user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);
      const fetched = (data || []) as ReviewWithReviewer[];
      if (append) {
        setReviews(prev => [...prev, ...fetched]);
      } else {
        setReviews(fetched);
      }
      setHasMoreReviews(fetched.length === REVIEWS_PER_PAGE);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMoreReviews(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  // Load more reviews
  const handleLoadMoreReviews = () => {
    const nextPage = reviewsPage + 1;
    setReviewsPage(nextPage);
    fetchReviews(nextPage, true);
  };

  // Delete draft
  const handleDeleteDraft = async (draftId: string) => {
    if (deletingDraftId) return;
    setDeletingDraftId(draftId);
    try {
      await deleteProduct(draftId);
      setUserProducts(prev => prev.filter(p => p.id !== draftId));
    } catch (err) {
      console.error('Draft deletion failed:', err);
    } finally {
      setDeletingDraftId(null);
    }
  };

  // Archive / Unarchive product
  const handleArchive = async (productId: string) => {
    if (archivingId) return;
    setArchivingId(productId);
    try {
      await archiveProduct(productId);
      setUserProducts(prev => prev.map(p => p.id === productId ? { ...p, status: 'archived' as const } : p));
    } catch (err) {
      console.error('Archive failed:', err);
    } finally {
      setArchivingId(null);
    }
  };

  const handleUnarchive = async (productId: string) => {
    if (archivingId) return;
    setArchivingId(productId);
    try {
      await unarchiveProduct(productId);
      setUserProducts(prev => prev.map(p => p.id === productId ? { ...p, status: 'active' as const } : p));
    } catch (err) {
      console.error('Unarchive failed:', err);
    } finally {
      setArchivingId(null);
    }
  };

  // Share profile
  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/user/${user?.username}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${user?.username} - NudiNađi`, url: profileUrl });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      }
    } catch {
      // User cancelled share
    }
  };

  // Logout
  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  if (isLoading) {
    return (
      <MainLayout title="Moj Profil" showSigurnost={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <i className="fa-solid fa-spinner animate-spin text-2xl text-blue-500"></i>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) return null;

  const displayName = user?.username || 'Gost';
  const displayLocation = user?.location || 'Nepoznato';
  const displayAvatar = user?.avatarUrl || 'https://picsum.photos/seed/guest/200/200';

  // Computed from real data
  const activeProducts = userProducts.filter(p => p.status === 'active');
  const soldProducts = userProducts.filter(p => p.status === 'sold');
  const draftProducts = userProducts.filter(p => p.status === 'draft');
  const archivedProducts = userProducts.filter(p => p.status === 'archived');
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / totalReviews * 10) / 10
    : 0;
  const ratingCounts = [5, 4, 3, 2, 1].reduce((acc, star) => {
    acc[star] = reviews.filter(r => r.rating === star).length;
    return acc;
  }, {} as Record<number, number>);
  const xpProgress = xpForNextLevel(user?.xp || 0);
  const userLevel = user?.level || 1;

  // Global product numbering by upload order (oldest = #1)
  const productNumberMap = new Map<string, number>();
  [...userProducts]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .forEach((p, i) => productNumberMap.set(p.id, i + 1));

  // Tab counts for badges
  const tabCounts: Record<string, number> = {
    Aktivni: activeProducts.length,
    'Završeni': soldProducts.length,
    Dojmovi: totalReviews,
    Arhiv: archivedProducts.length + draftProducts.length,
  };

  return (
    <MainLayout title="Moj Profil" showSigurnost={false}>
      <div className="max-w-2xl mx-auto mt-1 pb-32 space-y-3">

        {/* Share Toast */}
        {shareToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-[fadeIn_0.2s_ease-out]">
            <i className="fa-solid fa-check mr-1.5"></i> Link kopiran!
          </div>
        )}

        {/* Save Toast */}
        {saveToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-[fadeIn_0.2s_ease-out]">
            <i className="fa-solid fa-check mr-1.5"></i> Profil sačuvan!
          </div>
        )}

        {/* ── VERIFY EMAIL POPUP ─────────────────────────────── */}
        {verifyPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-[var(--c-overlay)] backdrop-blur-sm" onClick={() => setVerifyPopup(false)} role="presentation"></div>
            <div className="relative w-full max-w-sm bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] shadow-2xl animate-fadeIn p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-[16px] flex items-center justify-center text-orange-400 text-xl mx-auto">
                <i className="fa-solid fa-envelope-circle-check"></i>
              </div>
              <h3 className="text-base font-black text-[var(--c-text)]">Email verificirati</h3>
              <p className="text-[11px] text-[var(--c-text2)] leading-relaxed">
                Tvoj email <span className="font-bold text-[var(--c-text)]">{user?.email}</span> još nije verificiran.
                Klikni na dugme ispod da dobiješ novi link za verifikaciju.
              </p>
              {verifySent ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[12px] px-4 py-3 text-[11px] font-bold text-emerald-400">
                  <i className="fa-solid fa-check mr-1.5"></i> Link poslan! Provjeri email.
                </div>
              ) : (
                <button
                  onClick={async () => {
                    setVerifySending(true);
                    const ok = await resendVerificationEmail();
                    setVerifySending(false);
                    if (ok) setVerifySent(true);
                  }}
                  disabled={verifySending}
                  className="w-full py-3 rounded-[14px] blue-gradient text-white font-black text-[10px] uppercase tracking-[2px] shadow-lg shadow-blue-500/20 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {verifySending ? (
                    <><i className="fa-solid fa-spinner animate-spin"></i> Šaljem...</>
                  ) : (
                    <><i className="fa-solid fa-paper-plane"></i> Pošalji verifikacijski link</>
                  )}
                </button>
              )}
              <button
                onClick={() => setVerifyPopup(false)}
                className="text-[10px] font-bold text-[var(--c-text3)] hover:text-[var(--c-text)] uppercase tracking-wider transition-colors"
              >
                Zatvori
              </button>
            </div>
          </div>
        )}

        {/* ── EDIT PROFILE MODAL ─────────────────────────────── */}
        {editOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-[var(--c-overlay)] backdrop-blur-sm" onClick={() => !saving && setEditOpen(false)} role="presentation"></div>
            <div className="relative w-full max-w-lg bg-[var(--c-card)] border border-[var(--c-border)] rounded-[6px] shadow-2xl animate-fadeIn flex flex-col max-h-[90vh]">

              {/* HEADER */}
              <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-[var(--c-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[4px] blue-gradient flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <i className="fa-solid fa-user-pen text-white text-sm"></i>
                  </div>
                  <div>
                    <p className="text-[13px] font-black text-[var(--c-text)] tracking-tight leading-none">UREDI PROFIL</p>
                    <p className="text-[8px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-0.5">Postavke Računa</p>
                  </div>
                </div>
                <button onClick={() => !saving && setEditOpen(false)} aria-label="Zatvori" className="w-8 h-8 rounded-[4px] bg-[var(--c-hover)] hover:bg-[var(--c-active)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] transition-all">
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>
              </div>

              {/* BODY */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                {/* Avatar Upload */}
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-[4px] overflow-hidden border-2 border-[var(--c-border)] shadow-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatarPreview || user?.avatarUrl || `https://picsum.photos/seed/${user?.id}/200/200`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-[4px] bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 active:scale-95 transition-all"
                    >
                      <i className="fa-solid fa-camera text-[10px]"></i>
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/heic"
                      className="hidden"
                      onChange={handleAvatarPick}
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[var(--c-text)]">Profilna slika</p>
                    <p className="text-[9px] text-[var(--c-text3)]">JPG, PNG ili WebP. Max 5MB.</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Username */}
                  <div>
                    <label className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em] mb-1.5 block">Username</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] text-[var(--c-text3)]">@</span>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={e => handleUsernameChange(e.target.value)}
                        maxLength={30}
                        placeholder="korisnicko_ime"
                        className={`w-full bg-[var(--c-hover)] border rounded-[4px] pl-8 pr-9 py-2.5 text-[12px] font-bold text-[var(--c-text)] placeholder-[var(--c-text-muted)] focus:outline-none transition-colors ${
                          usernameError ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--c-border)] focus:border-blue-500/50'
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px]">
                        {usernameChecking && <i className="fa-solid fa-spinner animate-spin text-blue-400"></i>}
                        {!usernameChecking && editForm.username && !usernameError && editForm.username !== user?.username && (
                          <i className="fa-solid fa-circle-check text-emerald-500"></i>
                        )}
                      </div>
                    </div>
                    {usernameError && (
                      <p className="text-[9px] text-red-400 mt-1.5 flex items-center gap-1">
                        <i className="fa-solid fa-circle-exclamation text-[8px]"></i> {usernameError}
                      </p>
                    )}
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em] mb-1.5 block">Ime i prezime</label>
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))}
                      maxLength={60}
                      placeholder="Ime Prezime"
                      className="w-full bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] px-3.5 py-2.5 text-[12px] font-bold text-[var(--c-text)] placeholder-[var(--c-text-muted)] focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>

                  {/* Location — Country + Region + City dropdowns */}
                  <div>
                    <label className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em] mb-1.5 block">Lokacija</label>

                    {/* Country toggle */}
                    <div className="flex gap-1.5 mb-2">
                      {(['BiH', 'HR'] as const).map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => { setLocationCountry(c); setSelectedRegion(''); setSelectedCity(''); }}
                          className={`px-3 py-1.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider transition-all ${
                            locationCountry === c
                              ? 'bg-blue-500 text-white shadow-md'
                              : 'bg-[var(--c-hover)] text-[var(--c-text3)] border border-[var(--c-border)] hover:text-[var(--c-text)]'
                          }`}
                        >
                          {c === 'BiH' ? 'Bosna i Hercegovina' : 'Hrvatska'}
                        </button>
                      ))}
                    </div>

                    {/* Region/Kanton select */}
                    <div className="relative mb-2">
                      <i className="fa-solid fa-map absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] text-blue-400 pointer-events-none z-10"></i>
                      <select
                        value={selectedRegion}
                        onChange={e => { setSelectedRegion(e.target.value); setSelectedCity(''); }}
                        className="w-full bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] pl-9 pr-3.5 py-2.5 text-[12px] font-bold text-[var(--c-text)] focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">{locationCountry === 'BiH' ? 'Odaberi kanton / entitet...' : 'Odaberi županiju...'}</option>
                        {getRegionsForCountry(locationCountry).map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] text-[var(--c-text3)] pointer-events-none"></i>
                    </div>

                    {/* City select */}
                    {selectedRegion && (
                      <div className="relative">
                        <i className="fa-solid fa-location-dot absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] text-blue-400 pointer-events-none z-10"></i>
                        <select
                          value={selectedCity}
                          onChange={e => setSelectedCity(e.target.value)}
                          className="w-full bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] pl-9 pr-3.5 py-2.5 text-[12px] font-bold text-[var(--c-text)] focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
                        >
                          <option value="">Odaberi grad...</option>
                          {getCitiesByRegion(selectedRegion).map(c => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                        <i className="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] text-[var(--c-text3)] pointer-events-none"></i>
                      </div>
                    )}

                    {/* Selected location preview */}
                    {selectedCity && selectedRegion && (
                      <p className="text-[9px] text-blue-400 mt-1.5 flex items-center gap-1">
                        <i className="fa-solid fa-check-circle text-[8px]"></i> {selectedCity}, {selectedRegion}
                      </p>
                    )}
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em] mb-1.5 block">Bio</label>
                    <textarea
                      value={editForm.bio}
                      onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                      maxLength={200}
                      rows={3}
                      placeholder="Kratko o sebi..."
                      className="w-full bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] px-3.5 py-2.5 text-[12px] text-[var(--c-text)] placeholder-[var(--c-text-muted)] focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                    />
                    <div className="flex justify-between mt-1">
                      <p className="text-[8px] text-[var(--c-text3)]">Kratki opis koji drugi korisnici vide</p>
                      <p className={`text-[8px] font-bold ${editForm.bio.length > 180 ? 'text-orange-400' : 'text-[var(--c-text3)]'}`}>{editForm.bio.length}/200</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em] mb-1.5 block">Telefon <span className="opacity-50 lowercase">(opcionalno)</span></label>
                    <div className="relative">
                      <i className="fa-solid fa-phone absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] text-blue-400 pointer-events-none"></i>
                      <input
                        type="tel"
                        inputMode="tel"
                        value={editForm.phone}
                        onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                        maxLength={20}
                        placeholder="+387 6..."
                        className="w-full bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] pl-9 pr-3.5 py-2.5 text-[12px] font-bold text-[var(--c-text)] placeholder-[var(--c-text-muted)] focus:outline-none focus:border-blue-500/50 transition-colors"
                      />
                    </div>
                    <p className="text-[8px] text-[var(--c-text3)] mt-1">Vidljiv kupcima ako ga uneseš</p>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="shrink-0 px-6 py-4 border-t border-[var(--c-border)] flex gap-3">
                <button
                  onClick={() => !saving && setEditOpen(false)}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-[4px] bg-[var(--c-hover)] border border-[var(--c-border)] text-[10px] font-bold text-[var(--c-text2)] uppercase tracking-widest hover:text-[var(--c-text)] hover:bg-[var(--c-active)] transition-all disabled:opacity-50"
                >
                  Odustani
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving || !!usernameError || usernameChecking}
                  className="flex-1 py-2.5 rounded-[4px] blue-gradient text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><i className="fa-solid fa-spinner animate-spin text-xs"></i> Čuvam...</>
                  ) : (
                    <><i className="fa-solid fa-check text-xs"></i> Sačuvaj Promjene</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* COMPACT IDENTITY HEADER (Horizontal Layout) */}
        <div className="relative bg-[var(--c-card)] rounded-[24px] overflow-hidden border border-[var(--c-border)] p-5">
            {/* Background Decor (Subtle) */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 blur-[40px] rounded-full"></div>

            <div className="relative z-10">
                {/* Top row: Avatar + Name */}
                <div className="flex items-start gap-4">
                    {/* Avatar Area */}
                    <div className="relative shrink-0 mt-1">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-[16px] md:rounded-[18px] bg-gradient-to-br from-[var(--c-avatar-border-from)] to-[var(--c-avatar-border-to)] p-0.5 shadow-2xl shadow-blue-500/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover rounded-[14px] md:rounded-[16px]" />
                        </div>
                    </div>

                    {/* Name + Location + Badges */}
                    <div className="flex-1 min-w-0 pt-0.5">
                        <h2 className="text-base md:text-lg font-black text-[var(--c-text)] tracking-tight leading-none truncate">{displayName}</h2>
                        <div className="flex items-center gap-1.5 text-[var(--c-text2)] mt-1.5">
                            <i className="fa-solid fa-location-dot text-[10px] text-blue-400"></i>
                            <span className="text-[11px] font-medium truncate">{displayLocation}</span>
                        </div>
                        {user?.email && (
                          <div className="flex items-center gap-1.5 text-[var(--c-text3)] mt-0.5">
                            <i className="fa-solid fa-envelope text-[9px] text-[var(--c-text3)]"></i>
                            <span className="text-[10px] font-medium truncate">{user.email}</span>
                          </div>
                        )}

                        {/* Verification Badges */}
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {isAuthenticated ? (
                              <>
                                {user?.emailVerified ? (
                                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                                      <i className="fa-solid fa-check-circle text-[9px]"></i> Verificiran
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => { setVerifySent(false); setVerifyPopup(true); }}
                                    className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-orange-500/20 transition-colors cursor-pointer"
                                  >
                                      <i className="fa-solid fa-exclamation-circle text-[9px]"></i> Nije verificiran
                                  </button>
                                )}
                                {user?.phone && (
                                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                                      <i className="fa-solid fa-phone text-[8px]"></i> {user.phone}
                                  </span>
                                )}
                                {userLevel >= 5 && (
                                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                                      <i className="fa-solid fa-star text-[9px]"></i> Premium
                                  </span>
                                )}
                              </>
                            ) : (
                              <button onClick={() => router.push('/login')} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-[6px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-blue-500/20 transition-colors">
                                  <i className="fa-solid fa-arrow-right-to-bracket text-[9px]"></i> Prijavi se
                              </button>
                            )}
                        </div>
                    </div>

                    {/* Level — desktop only (inline), hidden on mobile */}
                    <div className="shrink-0 hidden md:flex flex-col items-end">
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-black text-[var(--c-text3)] uppercase tracking-widest">Level</span>
                            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-500 italic drop-shadow-[0_0_15px_rgba(59,130,246,0.2)]">{userLevel}</span>
                        </div>
                        <div className="w-44 mb-1.5 relative group">
                            <div className="flex justify-between text-[9px] font-bold text-[var(--c-text2)] mb-1 opacity-90 group-hover:opacity-100 transition-opacity">
                                <span className="text-blue-400">{xpProgress.current} XP</span>
                                <span>{xpProgress.needed} XP</span>
                            </div>
                            <div className="h-2.5 bg-[var(--c-xp-bar-bg)] rounded-full overflow-hidden border border-[var(--c-border2)] p-[1px] shadow-inner">
                                <div className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-300 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)] relative overflow-hidden" style={{ width: `${xpProgress.progress}%` }}>
                                    <div className="absolute inset-0 bg-white/30 skew-x-[-20deg] animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Level — mobile only (full width row below avatar+name) */}
                <div className="md:hidden flex items-center gap-3 mt-3 px-1">
                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-widest">Level</span>
                        <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-500 italic">{userLevel}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="h-2 bg-[var(--c-xp-bar-bg)] rounded-full overflow-hidden border border-[var(--c-border2)] p-[1px] shadow-inner">
                            <div className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-300 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)] relative overflow-hidden" style={{ width: `${xpProgress.progress}%` }}>
                                <div className="absolute inset-0 bg-white/30 skew-x-[-20deg] animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                        <p className="text-[8px] text-[var(--c-text3)] text-right mt-0.5">{xpProgress.current}/{xpProgress.needed} XP</p>
                    </div>
                </div>

                {/* Action Buttons Row — wraps on mobile */}
                <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-3">
                    <button
                        onClick={openEdit}
                        className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full hover:bg-blue-500/20 hover:border-blue-500/50 transition-all active:scale-95 group shadow-lg"
                    >
                        <i className="fa-solid fa-pen text-[9px] md:text-[10px] text-blue-500"></i>
                        <span className="text-[8px] md:text-[9px] font-bold text-blue-500 uppercase tracking-wide">Uredi</span>
                    </button>
                    <button
                        onClick={() => router.push('/menu')}
                        className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-full hover:bg-[var(--c-hover)] transition-all active:scale-95 group shadow-lg"
                    >
                        <i className="fa-solid fa-gear text-[9px] md:text-[10px] text-[var(--c-text2)] group-hover:text-[var(--c-text)] group-hover:rotate-90 transition-transform duration-500"></i>
                        <span className="text-[8px] md:text-[9px] font-bold text-[var(--c-text2)] group-hover:text-[var(--c-text)] uppercase tracking-wide">Postavke</span>
                    </button>
                    <button
                        onClick={handleShareProfile}
                        className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-full hover:border-blue-500/40 hover:bg-blue-500/5 transition-all active:scale-95 group shadow-lg"
                    >
                        <i className="fa-solid fa-share-nodes text-[9px] md:text-[10px] text-[var(--c-text2)] group-hover:text-blue-500 transition-colors"></i>
                        <span className="text-[8px] md:text-[9px] font-bold text-[var(--c-text2)] group-hover:text-[var(--c-text)] uppercase tracking-wide">Podijeli</span>
                    </button>
                    <button
                        onClick={() => router.push('/profile/level')}
                        className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-full hover:border-blue-500/50 hover:bg-blue-500/5 transition-all active:scale-95 group shadow-lg"
                    >
                        <i className="fa-solid fa-trophy text-[9px] md:text-[10px] text-yellow-500 group-hover:scale-110 transition-transform"></i>
                        <span className="text-[8px] md:text-[9px] font-bold text-[var(--c-text2)] group-hover:text-[var(--c-text)] uppercase tracking-wide">Level</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-full hover:border-red-500/40 hover:bg-red-500/5 transition-all active:scale-95 group shadow-lg"
                    >
                        <i className="fa-solid fa-arrow-right-from-bracket text-[9px] md:text-[10px] text-[var(--c-text2)] group-hover:text-red-500 transition-colors"></i>
                        <span className="text-[8px] md:text-[9px] font-bold text-[var(--c-text2)] group-hover:text-red-500 uppercase tracking-wide">Odjava</span>
                    </button>
                </div>
            </div>

            {/* BIO */}
            {(user?.bio) && (
              <div className="relative z-10 mt-4 pt-4 border-t border-[var(--c-border)]">
                <p className="text-[11px] text-[var(--c-text2)] leading-relaxed">{user.bio}</p>
              </div>
            )}
        </div>

        {/* COMPACT TABS WITH COUNTS */}
        <div>
            <div className="flex p-0.5 bg-[var(--c-card)] border border-[var(--c-border)] rounded-[14px] overflow-x-auto no-scrollbar">
                {['Aktivni', 'Završeni', 'Dojmovi', 'Arhiv', 'Info'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`flex-1 py-2 px-3 rounded-[10px] text-[10px] font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                            activeTab === tab
                            ? 'bg-[var(--c-active)] text-[var(--c-text)] shadow-sm'
                            : 'text-[var(--c-text3)] hover:text-[var(--c-text2)]'
                        }`}
                    >
                        {tab === 'Arhiv' && (
                            <i className="fa-solid fa-box-archive text-[9px]"></i>
                        )}
                        {tab}
                        {tabCounts[tab] !== undefined && tabCounts[tab] > 0 && (
                          <span className={`ml-0.5 min-w-[16px] h-4 px-1 rounded-full text-[8px] font-black flex items-center justify-center ${
                            activeTab === tab
                              ? 'bg-blue-500/15 text-blue-500'
                              : 'bg-[var(--c-overlay)] text-[var(--c-text3)]'
                          }`}>
                            {tabCounts[tab]}
                          </span>
                        )}
                    </button>
                ))}
            </div>
        </div>

        {/* TAB CONTENT */}

        {/* ARHIV TAB */}
        {activeTab === 'Arhiv' && (
            <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">

                {/* ── ARCHIVED PRODUCTS ── */}
                <div className="space-y-2">
                    <div className="px-1 mb-1">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-400">Arhivirani Oglasi</h3>
                        <p className="text-[9px] text-[var(--c-text3)]">Privremeno sklonjeni sa tržišta</p>
                    </div>

                    {archivedProducts.length === 0 ? (
                        <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-5 text-center">
                            <i className="fa-solid fa-box-archive text-lg text-[var(--c-text-muted)] mb-1.5"></i>
                            <p className="text-[11px] text-[var(--c-text3)]">Nema arhiviranih oglasa.</p>
                            <p className="text-[9px] text-[var(--c-text-muted)] mt-0.5">Koristi <i className="fa-solid fa-box-archive text-[8px]"></i> dugme na aktivnim oglasima za arhiviranje.</p>
                        </div>
                    ) : archivedProducts.map(p => (
                        <div key={p.id} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-2.5 flex gap-3 group active:scale-[0.99] transition-all hover:border-[var(--c-border2)] opacity-80">
                            <div className="relative w-16 h-16 rounded-[12px] overflow-hidden shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={p.images?.[0] || `https://picsum.photos/seed/${p.id}/200/200`} alt={p.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <span className="text-[7px] font-black text-white bg-orange-500 px-1.5 py-0.5 rounded-full uppercase">Arhiv</span>
                                </div>
                                <span className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[7px] font-black px-1 py-0.5 rounded-[4px] leading-none backdrop-blur-sm z-10">#{productNumberMap.get(p.id)}</span>
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-0.5">
                                <div>
                                    <h4 className="text-[12px] font-bold text-[var(--c-text)] leading-tight line-clamp-1">{p.title}</h4>
                                    <span className="text-[11px] font-black text-orange-400 mt-0.5 block">{Number(p.price).toLocaleString()} &euro;</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <button
                                        onClick={() => handleUnarchive(p.id)}
                                        disabled={archivingId === p.id}
                                        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 px-2.5 py-1 rounded-[6px] text-[8px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                                    >
                                        {archivingId === p.id ? <i className="fa-solid fa-spinner animate-spin"></i> : <><i className="fa-solid fa-rotate-left text-[7px] mr-1"></i>Vrati na tržište</>}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteDraft(p.id); }}
                                        disabled={deletingDraftId === p.id}
                                        className="text-[var(--c-text-muted)] hover:text-red-400 p-1 transition-colors disabled:opacity-50"
                                        title="Obriši"
                                    >
                                        <i className={`text-[10px] ${deletingDraftId === p.id ? 'fa-solid fa-spinner animate-spin' : 'fa-solid fa-trash'}`}></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── DRAFTS ── */}
                {draftProducts.length > 0 && (
                    <div className="space-y-2">
                        <div className="px-1 mb-1 flex items-center justify-between">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--c-text3)]">Nedovršeni Oglasi</h3>
                                <p className="text-[9px] text-[var(--c-text-muted)]">Drafts</p>
                            </div>
                            <button
                                onClick={() => router.push('/upload')}
                                className="w-6 h-6 rounded-full bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text2)] hover:text-[var(--c-text)] border border-[var(--c-border)] hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-500 transition-colors"
                            >
                                <i className="fa-solid fa-plus text-[10px]"></i>
                            </button>
                        </div>

                        {draftProducts.map((draft) => {
                            const completion = calcDraftCompletion(draft);
                            return (
                            <div key={draft.id} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-2.5 flex gap-3 group active:scale-[0.99] transition-all hover:border-[var(--c-border2)]">
                                <div className="relative w-16 h-16 rounded-[12px] overflow-hidden shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={draft.images?.[0] || `https://picsum.photos/seed/${draft.id}/200/200`} alt="Draft" className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all" />
                                    <div className="absolute inset-0 bg-[var(--c-overlay)] flex items-center justify-center">
                                        <i className="fa-solid fa-pen text-white/80 text-xs"></i>
                                    </div>
                                    <span className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[7px] font-black px-1 py-0.5 rounded-[4px] leading-none backdrop-blur-sm z-10">#{productNumberMap.get(draft.id)}</span>
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-0.5">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-[12px] font-bold text-[var(--c-text)] leading-tight line-clamp-1">{draft.title || 'Bez naslova'}</h4>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteDraft(draft.id); }}
                                                disabled={deletingDraftId === draft.id}
                                                className="text-[var(--c-text-muted)] hover:text-red-400 p-1 -mr-2 -mt-2 transition-colors disabled:opacity-50"
                                            >
                                                <i className={`text-[10px] ${deletingDraftId === draft.id ? 'fa-solid fa-spinner animate-spin' : 'fa-solid fa-xmark'}`}></i>
                                            </button>
                                        </div>
                                        <span className="text-[10px] text-orange-400 font-bold mt-0.5 block">
                                            {draft.price ? `${Number(draft.price).toLocaleString()} €` : 'Cijena nije def.'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <div className="flex-1">
                                            <div className="flex justify-between text-[8px] font-bold text-[var(--c-text3)] mb-0.5">
                                                <span>Popunjeno</span>
                                                <span>{completion}%</span>
                                            </div>
                                            <div className="h-1 bg-[var(--c-overlay)] rounded-full overflow-hidden">
                                                <div style={{ width: `${completion}%` }} className={`h-full rounded-full ${completion >= 80 ? 'bg-emerald-500' : completion >= 50 ? 'bg-orange-500' : 'bg-red-400'}`}></div>
                                            </div>
                                        </div>
                                        <button onClick={() => router.push(`/upload?draft=${draft.id}`)} className="bg-[var(--c-active)] hover:bg-blue-600 text-white px-2 py-1 rounded-[6px] text-[8px] font-bold uppercase tracking-wider transition-colors">
                                            Nastavi
                                        </button>
                                    </div>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>
        )}

        {/* DOJMOVI (REVIEWS) TAB */}
        {activeTab === 'Dojmovi' && (
            <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                {/* Stats Card */}
                <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] p-5 flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center min-w-[90px]">
                        <span className="text-4xl font-black text-[var(--c-text)] leading-none">{averageRating || '—'}</span>
                        <div className="my-2">
                            <StarRating rating={averageRating} />
                        </div>
                        <span className="text-[9px] text-[var(--c-text3)] uppercase tracking-widest">{totalReviews} Dojmova</span>
                    </div>

                    <div className="flex-1 space-y-2 border-l border-[var(--c-border)] pl-5">
                        {[5, 4, 3, 2, 1].map(star => (
                            <div key={star} className="flex items-center gap-3">
                                <span className="text-[9px] font-bold text-[var(--c-text3)] w-3">{star}</span>
                                <div className="flex-1 h-1.5 bg-[var(--c-card-alt)] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${star >= 4 ? 'bg-blue-600' : star === 3 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        style={{ width: totalReviews > 0 ? `${((ratingCounts[star] || 0) / totalReviews) * 100}%` : '0%' }}
                                    ></div>
                                </div>
                                <span className="text-[8px] font-bold text-[var(--c-text3)] w-4 text-right">{ratingCounts[star] || 0}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reviews List */}
                <div>
                    <div className="flex justify-between items-end mb-3 px-1">
                        <h3 className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-widest">Zadnji Dojmovi</h3>
                    </div>

                    <div className="space-y-2">
                        {reviews.length === 0 ? (
                            <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-6 text-center">
                                <i className="fa-solid fa-comments text-xl text-[var(--c-text-muted)] mb-2"></i>
                                <p className="text-[11px] text-[var(--c-text3)]">Još nema dojmova.</p>
                            </div>
                        ) : reviews.map(review => (
                            <div key={review.id} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 hover:border-[var(--c-border2)] transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[var(--c-card-alt)] rounded-[10px] overflow-hidden shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={review.reviewer?.avatar_url || `https://picsum.photos/seed/${review.reviewer_id}/100/100`} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-[var(--c-text)]">{review.reviewer?.username || 'Korisnik'}</h4>
                                            <div className="flex text-yellow-500 text-[8px] gap-0.5 mt-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <i key={i} className={`fa-solid fa-star ${i < review.rating ? '' : 'text-[var(--c-star-off)]'}`}></i>
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
                </div>

                {hasMoreReviews && reviews.length > 0 && (
                  <button
                    onClick={handleLoadMoreReviews}
                    disabled={loadingMoreReviews}
                    className="w-full py-3.5 bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] text-[10px] font-bold text-[var(--c-text2)] hover:text-[var(--c-text)] transition-colors uppercase tracking-widest hover:bg-[var(--c-hover)] disabled:opacity-50"
                  >
                    {loadingMoreReviews ? (
                      <><i className="fa-solid fa-spinner animate-spin mr-1.5"></i> Učitavanje...</>
                    ) : (
                      'Učitaj više'
                    )}
                  </button>
                )}
            </div>
        )}

        {/* INFO TAB */}
        {activeTab === 'Info' && (
            <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                {/* Avatar Header */}
                <div className="text-center py-2">
                    <div className="w-20 h-20 rounded-[20px] p-0.5 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/20 mx-auto mb-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={displayAvatar} alt="Profile" className="w-full h-full object-cover rounded-[18px] border-2 border-[var(--c-bg)]" />
                    </div>
                    <h3 className="text-xl font-black text-[var(--c-text)] uppercase tracking-tight">{displayName}</h3>
                    <p className="text-sm text-[var(--c-text2)]">{user?.fullName || user?.email}</p>
                </div>

                {/* Stats Grid */}
                <h4 className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-widest px-1">Statistika</h4>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 flex flex-col items-start gap-2 hover:border-blue-500/30 transition-colors">
                        <div className="w-8 h-8 rounded-[10px] bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <i className="fa-regular fa-calendar"></i>
                        </div>
                        <div>
                            <h5 className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest">Član od</h5>
                            <p className="text-xs font-bold text-[var(--c-text)]">{formatMemberSince(user?.createdAt)}</p>
                        </div>
                    </div>
                    <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 flex flex-col items-start gap-2 hover:border-blue-500/30 transition-colors">
                        <div className="w-8 h-8 rounded-[10px] bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <i className="fa-solid fa-location-dot"></i>
                        </div>
                        <div>
                            <h5 className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest">Lokacija</h5>
                            <p className="text-xs font-bold text-[var(--c-text)]">{displayLocation}</p>
                        </div>
                    </div>
                    <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 flex flex-col items-start gap-2 hover:border-blue-500/30 transition-colors">
                        <div className="w-8 h-8 rounded-[10px] bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <i className="fa-solid fa-bag-shopping"></i>
                        </div>
                        <div>
                            <h5 className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest">Prodaja</h5>
                            <p className="text-xs font-bold text-[var(--c-text)]">{user?.totalSales || soldProducts.length} prodano</p>
                        </div>
                    </div>
                    <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 flex flex-col items-start gap-2 hover:border-blue-500/30 transition-colors">
                        <div className="w-8 h-8 rounded-[10px] bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <i className="fa-solid fa-tags"></i>
                        </div>
                        <div>
                            <h5 className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest">Aktivni oglasi</h5>
                            <p className="text-xs font-bold text-[var(--c-text)]">{activeProducts.length} aktivnih</p>
                        </div>
                    </div>
                    <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 flex flex-col items-start gap-2 hover:border-blue-500/30 transition-colors">
                        <div className="w-8 h-8 rounded-[10px] bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <i className="fa-solid fa-star"></i>
                        </div>
                        <div>
                            <h5 className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest">Ocjena</h5>
                            <p className="text-xs font-bold text-[var(--c-text)]">{averageRating > 0 ? `${averageRating} / 5` : 'Nema ocjena'}</p>
                        </div>
                    </div>
                    <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 flex flex-col items-start gap-2 hover:border-emerald-500/30 transition-colors">
                        <div className="w-8 h-8 rounded-[10px] bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <i className="fa-solid fa-shield-halved"></i>
                        </div>
                        <div>
                            <h5 className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest">Verifikacija</h5>
                            <p className={`text-xs font-bold ${user?.emailVerified ? 'text-emerald-400' : 'text-orange-400'}`}>{user?.emailVerified ? 'Email potvrđen' : 'Nije verificiran'}</p>
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                <h4 className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-widest px-1">Social & Links</h4>
                <div className="space-y-2">
                    <div className="flex items-center justify-between bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 cursor-pointer hover:bg-[var(--c-hover)] transition-colors group">
                        <span className="text-[10px] font-bold text-[var(--c-text2)] uppercase group-hover:text-[var(--c-text)] transition-colors">Web stranica</span>
                        <i className="fa-solid fa-arrow-up-right-from-square text-[var(--c-text-muted)] text-xs group-hover:text-blue-400 transition-colors"></i>
                    </div>
                    <div className="flex items-center justify-between bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 cursor-pointer hover:bg-[var(--c-hover)] transition-colors group">
                        <span className="text-[10px] font-bold text-[var(--c-text2)] uppercase group-hover:text-[var(--c-text)] transition-colors">Instagram</span>
                        <i className="fa-brands fa-instagram text-[var(--c-text-muted)] text-xs group-hover:text-pink-400 transition-colors"></i>
                    </div>
                    <div className="flex items-center justify-between bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 cursor-pointer hover:bg-[var(--c-hover)] transition-colors group">
                        <span className="text-[10px] font-bold text-[var(--c-text2)] uppercase group-hover:text-[var(--c-text)] transition-colors">Facebook</span>
                        <i className="fa-brands fa-facebook text-[var(--c-text-muted)] text-xs group-hover:text-blue-600 transition-colors"></i>
                    </div>
                </div>
            </div>
        )}

        {/* AKTIVNI TAB */}
        {activeTab === 'Aktivni' && (
            <div className="space-y-2 animate-[fadeIn_0.2s_ease-out]">
                {activeProducts.length === 0 ? (
                    <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] p-6 flex flex-col items-center text-center min-h-[200px] justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[linear-gradient(var(--c-grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--c-grid-line)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-12 h-12 rounded-[16px] bg-[var(--c-overlay)] border border-[var(--c-border)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500">
                                <i className="fa-solid fa-ghost text-xl text-[var(--c-text-muted)] group-hover:text-[var(--c-text)] transition-colors"></i>
                            </div>
                            <h3 className="text-[13px] font-black text-[var(--c-text)] mb-0.5">Nema Aktivnih Oglasa</h3>
                            <p className="text-[10px] text-[var(--c-text3)] max-w-[180px] leading-relaxed mb-4">Objavi oglas i pojavi se na tržištu.</p>
                            <button onClick={() => router.push('/upload')} className="blue-gradient px-4 py-2.5 rounded-[12px] text-white font-bold text-[9px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2">
                                <i className="fa-solid fa-plus"></i>
                                Objavi Oglas
                            </button>
                        </div>
                    </div>
                ) : activeProducts.map(p => (
                    <div key={p.id} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-2.5 flex gap-3 group active:scale-[0.99] transition-all hover:border-[var(--c-border2)]">
                        <div onClick={() => router.push(`/product/${p.id}`)} className="relative w-16 h-16 rounded-[12px] overflow-hidden shrink-0 cursor-pointer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.images?.[0] || `https://picsum.photos/seed/${p.id}/200/200`} alt={p.title} className="w-full h-full object-cover" />
                            <span className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[7px] font-black px-1 py-0.5 rounded-[4px] leading-none backdrop-blur-sm">#{productNumberMap.get(p.id)}</span>
                        </div>
                        <div onClick={() => router.push(`/product/${p.id}`)} className="flex-1 flex flex-col justify-between py-0.5 cursor-pointer">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h4 className="text-[12px] font-bold text-[var(--c-text)] leading-tight line-clamp-1">{p.title}</h4>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleArchive(p.id); }}
                                        disabled={archivingId === p.id}
                                        title="Arhiviraj oglas"
                                        className="text-[var(--c-text-muted)] hover:text-orange-400 p-1 -mr-2 -mt-1 transition-colors disabled:opacity-50 shrink-0"
                                    >
                                        <i className={`text-[10px] ${archivingId === p.id ? 'fa-solid fa-spinner animate-spin' : 'fa-solid fa-box-archive'}`}></i>
                                    </button>
                                </div>
                                <span className="text-[11px] font-black text-blue-500 mt-0.5 block">{Number(p.price).toLocaleString()} &euro;</span>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] text-[var(--c-text3)]">
                                <i className="fa-solid fa-eye text-[8px]"></i>
                                <span>{p.views_count} pregleda</span>
                                <span>·</span>
                                <i className="fa-solid fa-heart text-[8px]"></i>
                                <span>{p.favorites_count}</span>
                                <span>·</span>
                                <span>{formatTimeLabel(p.created_at)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* ZAVRŠENI TAB */}
        {activeTab === 'Završeni' && (
            <div className="space-y-2 animate-[fadeIn_0.2s_ease-out]">
                {soldProducts.length === 0 ? (
                    <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] p-6 flex flex-col items-center text-center min-h-[200px] justify-center">
                        <i className="fa-solid fa-check-circle text-2xl text-[var(--c-text-muted)] mb-3"></i>
                        <h3 className="text-[13px] font-black text-[var(--c-text)] mb-0.5">Nema Prodanih Oglasa</h3>
                        <p className="text-[10px] text-[var(--c-text3)] max-w-[180px] leading-relaxed">Ovdje će se pojaviti tvoji završeni oglasi.</p>
                    </div>
                ) : soldProducts.map(p => (
                    <div key={p.id} onClick={() => router.push(`/product/${p.id}`)} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-2.5 flex gap-3 group active:scale-[0.99] transition-all hover:border-[var(--c-border2)] cursor-pointer opacity-70">
                        <div className="w-16 h-16 rounded-[12px] overflow-hidden shrink-0 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.images?.[0] || `https://picsum.photos/seed/${p.id}/200/200`} alt={p.title} className="w-full h-full object-cover grayscale" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <span className="text-[8px] font-black text-white bg-emerald-500 px-1.5 py-0.5 rounded-full uppercase">Prodano</span>
                            </div>
                            <span className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[7px] font-black px-1 py-0.5 rounded-[4px] leading-none backdrop-blur-sm z-10">#{productNumberMap.get(p.id)}</span>
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                            <div>
                                <h4 className="text-[12px] font-bold text-[var(--c-text)] leading-tight line-clamp-1">{p.title}</h4>
                                <span className="text-[11px] font-black text-emerald-500 mt-0.5 block">{Number(p.price).toLocaleString()} &euro;</span>
                            </div>
                            <span className="text-[9px] text-[var(--c-text3)]">{formatTimeLabel(p.created_at)}</span>
                        </div>
                    </div>
                ))}
            </div>
        )}

      </div>
    </MainLayout>
  );
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileContent />
    </Suspense>
  );
}
