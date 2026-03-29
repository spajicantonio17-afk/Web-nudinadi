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
import { isFollowing as checkIsFollowing, followUser, unfollowUser } from '@/services/followerService';
import { blockUser, unblockUser, isBlocked as checkIsBlocked } from '@/services/blockService';
import type { Profile, ProductWithSeller, ReviewWithUsers } from '@/lib/database.types';
import { BAM_RATE, BUSINESS_DAY_KEYS } from '@/lib/constants';
import ProBadge from '@/components/ProBadge';
import { getCurrencyMode, eurToKm } from '@/lib/currency';
import { isBusiness } from '@/lib/plans';
import JsonLd, { buildPersonSchema } from '@/components/JsonLd';
import { useI18n } from '@/lib/i18n';

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
  const { t } = useI18n();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<ProductWithSeller[]>([]);
  const [reviews, setReviews] = useState<ReviewWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<'oglasi' | 'dojmovi' | 'info'>('oglasi');

  // Scroll to top when switching tabs
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const [contacting, setContacting] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followHover, setFollowHover] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = React.useRef<HTMLDivElement>(null);

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

  // Check follow status + load counts + block status
  useEffect(() => {
    if (!profile) return;
    setFollowerCount(profile.followers_count || 0);
    setFollowingCount(profile.following_count || 0);
    if (user?.id && user.id !== profile.id) {
      checkIsFollowing(user.id, profile.id).then(setFollowing).catch(() => {});
      checkIsBlocked(user.id, profile.id).then(setBlocked).catch(() => {});
    }
  }, [profile, user?.id]);

  // Close more menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    }
    if (showMoreMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMoreMenu]);

  const handleFollow = async () => {
    if (!user) { router.push('/login'); return; }
    if (!profile || followLoading) return;
    setFollowLoading(true);
    try {
      if (following) {
        await unfollowUser(user.id, profile.id);
        setFollowing(false);
        setFollowerCount(c => Math.max(0, c - 1));
      } else {
        await followUser(user.id, profile.id);
        setFollowing(true);
        setFollowerCount(c => c + 1);
      }
    } catch {
      showToast(t('userProfile.error'), 'error');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleContact = async () => {
    if (!user) { router.push('/login'); return; }
    if (!profile) return;
    if (profile.id === user.id) { showToast(t('userProfile.ownProfileToast'), 'info'); return; }
    setContacting(true);
    try {
      const convo = await getOrCreateConversation(user.id, profile.id);
      router.push(`/messages?conversation=${convo.id}`);
    } catch {
      showToast(t('userProfile.messageError'), 'error');
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

  const handleBlockToggle = async () => {
    if (!user) { router.push('/login'); return; }
    if (!profile || blockLoading) return;
    setBlockLoading(true);
    try {
      if (blocked) {
        await unblockUser(user.id, profile.id);
        setBlocked(false);
        showToast(t('userProfile.userUnblocked'));
      } else {
        await blockUser(user.id, profile.id);
        setBlocked(true);
        showToast(t('userProfile.userBlockedToast'));
      }
    } catch {
      showToast(t('userProfile.error'), 'error');
    } finally {
      setBlockLoading(false);
      setShowMoreMenu(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title={t('userProfile.title')} showSigurnost={false}>
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
      <MainLayout title={t('userProfile.title')} showSigurnost={false}>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <i className="fa-solid fa-user-slash text-4xl text-[var(--c-text3)] mb-4"></i>
          <h2 className="text-lg font-black text-[var(--c-text)] mb-2">{t('userProfile.notFoundTitle')}</h2>
          <p className="text-sm text-[var(--c-text3)] mb-6">{t('userProfile.notFoundDesc', { username: params.username })}</p>
          <button onClick={() => router.push('/')} className="blue-gradient text-white px-6 py-3 rounded-[14px] font-bold text-xs uppercase tracking-widest">
            {t('userProfile.backToHome')}
          </button>
        </div>
      </MainLayout>
    );
  }

  const currencyMode = getCurrencyMode();
  const isBiz = isBusiness(profile.account_type);

  // Get today's day key for business hours
  const todayDayKey = BUSINESS_DAY_KEYS[new Date().getDay()];

  const avgRating = reviews.length > 0
    ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 10) / 10
    : 0;
  const isOwnProfile = user?.id === profile.id;
  const userLevel = profile.level || 1;

  return (
    <MainLayout title={`@${profile.username}`} showSigurnost={false}>

      {/* JSON-LD Structured Data */}
      <JsonLd data={buildPersonSchema(profile)} />

      <div className="max-w-2xl mx-auto mt-1 pb-32 space-y-3">

        {/* Share Toast */}
        {shareToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-[fadeIn_0.2s_ease-out]">
            <i className="fa-solid fa-check mr-1.5"></i> {t('userProfile.linkCopied')}
          </div>
        )}

        {/* ── BUSINESS BANNER (only for business accounts) ── */}
        {isBiz && (
          <div className="relative bg-[var(--c-card)] rounded-[24px] overflow-hidden border border-amber-400/20 shadow-sm">
            {/* Edit button for owner */}
            {isOwnProfile && (
              <button
                onClick={() => router.push('/profile')}
                className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1.5 bg-black/40 backdrop-blur-sm border border-white/20 rounded-full text-white text-[10px] font-bold hover:bg-black/60 transition-all active:scale-95"
              >
                <i className="fa-solid fa-pen text-[9px]"></i>
                Uredi
              </button>
            )}

            {/* Banner Image */}
            <div className="h-44 w-full overflow-hidden">
              {profile.banner_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.banner_image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-400/30 via-orange-300/20 to-purple-500/20" />
              )}
            </div>

            {/* Logo + Company Name */}
            <div className="px-5 pb-4 -mt-8 relative z-10">
              <div className="flex items-end gap-4">
                <div className="w-[68px] h-[68px] rounded-[14px] border-[3px] border-white shadow-xl overflow-hidden shrink-0 bg-[var(--c-card)]">
                  {profile.company_logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.company_logo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                      <i className="fa-solid fa-building text-amber-400 text-2xl"></i>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 pb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-black text-[var(--c-text)] truncate leading-tight">{profile.company_name || profile.username}</h2>
                    <ProBadge accountType={profile.account_type} />
                    {profile.business_verified && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                        <i className="fa-solid fa-circle-check text-[8px]"></i>
                        {t('userProfile.verifiedBusiness')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--c-text3)] mt-0.5">@{profile.username}</p>
                </div>
              </div>
            </div>

            {/* Business Info */}
            <div className="px-5 pb-5 space-y-2 border-t border-[var(--c-border)] pt-3 mx-5 -mx-0">
              <div className="space-y-1.5">
                {profile.business_address && (
                  <div className="flex items-center gap-2.5 text-[11px] text-[var(--c-text2)]">
                    <div className="w-5 h-5 rounded-[6px] bg-[var(--c-hover)] flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-location-dot text-[9px] text-amber-500"></i>
                    </div>
                    <span>{profile.business_address}</span>
                  </div>
                )}
                {profile.business_hours && (
                  <div className="flex items-center gap-2.5 text-[11px] text-[var(--c-text2)]">
                    <div className="w-5 h-5 rounded-[6px] bg-[var(--c-hover)] flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-clock text-[9px] text-blue-400"></i>
                    </div>
                    <span>
                      {t('userProfile.todayHours')}{' '}
                      <span className={(profile.business_hours as Record<string, string>)[todayDayKey] === 'Zatvoreno' ? 'text-red-400 font-bold' : 'font-bold text-[var(--c-text)]'}>
                        {(profile.business_hours as Record<string, string>)[todayDayKey] || t('userProfile.unknown')}
                      </span>
                    </span>
                  </div>
                )}
                {profile.website_url && (
                  <div className="flex items-center gap-2.5 text-[11px]">
                    <div className="w-5 h-5 rounded-[6px] bg-[var(--c-hover)] flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-globe text-[9px] text-purple-400"></i>
                    </div>
                    <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate font-medium">
                      {profile.website_url.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
              {profile.business_category && (
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700">
                    <i className="fa-solid fa-tag text-[8px]"></i>
                    {profile.business_category}
                  </span>
                </div>
              )}
            </div>
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
                {isBiz ? (
                  <p className="text-[11px] text-[var(--c-text3)] font-medium leading-none">@{profile.username}</p>
                ) : (
                  <>
                    <h2 className="text-base md:text-lg font-black text-[var(--c-text)] tracking-tight leading-none truncate flex items-center gap-1.5">{profile.username} <ProBadge accountType={profile.account_type} /></h2>
                    {profile.full_name && (
                      <p className="text-xs text-[var(--c-text3)] mt-0.5 truncate">{profile.full_name}</p>
                    )}
                  </>
                )}
                {profile.location && !(isBiz && profile.business_address) && (
                  <div className="flex items-center gap-1.5 text-[var(--c-text2)] mt-1.5">
                    <i className="fa-solid fa-location-dot text-[10px] text-blue-400"></i>
                    <span className="text-[11px] font-medium truncate">{profile.location}</span>
                  </div>
                )}

                {/* Follower/Following Counts */}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-[var(--c-text2)]">
                    <span className="font-black text-[var(--c-text)]">{followerCount}</span> {t('userProfile.followers')}
                  </span>
                  <span className="text-[10px] text-[var(--c-text2)]">
                    <span className="font-black text-[var(--c-text)]">{followingCount}</span> {t('userProfile.followingCount')}
                  </span>
                </div>

                {/* Verification Badges */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {profile.email_verified ? (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <i className="fa-solid fa-check-circle text-[9px]"></i> {t('userProfile.verified')}
                    </span>
                  ) : (
                    <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <i className="fa-solid fa-exclamation-circle text-[9px]"></i> {t('userProfile.notVerified')}
                    </span>
                  )}
                  {avgRating >= 4.5 && reviews.length >= 5 && (
                    <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <i className="fa-solid fa-star text-[8px]"></i> {t('userProfile.topSeller')}
                    </span>
                  )}
                  {userLevel >= 5 && (
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <i className="fa-solid fa-shield text-[8px]"></i> {t('userProfile.premium')}
                    </span>
                  )}
                  {profile.phone_verified ? (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <i className="fa-solid fa-phone text-[8px]"></i> {t('userProfile.phoneVerified')}
                    </span>
                  ) : profile.phone ? (
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <i className="fa-solid fa-phone text-[8px]"></i> {t('userProfile.phoneLabel')}
                    </span>
                  ) : null}
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
                      {t('userProfile.connectSocial')}
                    </button>
                  </div>
                )}
              </div>

              {/* Level (number only, no XP bar) */}
              <div className="shrink-0 flex flex-col items-center pl-2">
                <span className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-widest">{t('userProfile.level')}</span>
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
                  <span className="text-[8px] md:text-[9px] font-bold text-blue-500 uppercase tracking-wide">{t('userProfile.editProfile')}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleContact}
                    disabled={contacting || blocked}
                    title={blocked ? t('userProfile.userBlocked') : undefined}
                    className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-500/20"
                  >
                    {contacting ? <i className="fa-solid fa-spinner animate-spin text-[9px]"></i> : <i className="fa-regular fa-comment text-[9px]"></i>}
                    <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wide">{t('userProfile.sendMessage')}</span>
                  </button>
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    onMouseEnter={() => setFollowHover(true)}
                    onMouseLeave={() => setFollowHover(false)}
                    className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-full transition-all active:scale-95 disabled:opacity-50 shadow-lg ${
                      following
                        ? followHover
                          ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                          : 'bg-blue-500/10 border border-blue-500/30 text-blue-500'
                        : 'bg-[var(--c-bg)] border border-[var(--c-border2)] text-[var(--c-text)] hover:border-blue-500/40 hover:bg-blue-500/5'
                    }`}
                  >
                    {followLoading ? (
                      <i className="fa-solid fa-spinner animate-spin text-[9px]"></i>
                    ) : following ? (
                      <i className={`fa-solid ${followHover ? 'fa-user-minus' : 'fa-user-check'} text-[9px]`}></i>
                    ) : (
                      <i className="fa-solid fa-user-plus text-[9px]"></i>
                    )}
                    <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wide">
                      {following ? (followHover ? t('userProfile.unfollow') : t('userProfile.following')) : t('userProfile.follow')}
                    </span>
                  </button>
                </>
              )}
              <button
                onClick={handleShareProfile}
                className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-full hover:border-blue-500/40 hover:bg-blue-500/5 transition-all active:scale-95 group shadow-lg"
              >
                <i className="fa-solid fa-share-nodes text-[9px] md:text-[10px] text-[var(--c-text2)] group-hover:text-blue-500 transition-colors"></i>
                <span className="text-[8px] md:text-[9px] font-bold text-[var(--c-text2)] group-hover:text-[var(--c-text)] uppercase tracking-wide">{t('userProfile.share')}</span>
              </button>
              {!isOwnProfile && (
                <div className="relative" ref={moreMenuRef}>
                  <button
                    onClick={() => setShowMoreMenu(v => !v)}
                    className="w-8 h-8 rounded-full bg-[var(--c-bg)] border border-[var(--c-border2)] flex items-center justify-center hover:border-blue-500/40 hover:bg-blue-500/5 transition-all active:scale-95 shadow-lg"
                  >
                    <i className="fa-solid fa-ellipsis text-[10px] text-[var(--c-text3)]"></i>
                  </button>
                  {showMoreMenu && (
                    <div className="absolute right-0 top-10 z-50 w-48 bg-[var(--c-card)] border border-[var(--c-border)] rounded-[14px] shadow-xl overflow-hidden animate-[fadeIn_0.15s_ease-out]">
                      <button
                        onClick={handleBlockToggle}
                        disabled={blockLoading}
                        className={`w-full px-4 py-3 text-left text-[12px] font-bold flex items-center gap-2.5 transition-colors hover:bg-[var(--c-hover)] ${blocked ? 'text-emerald-500' : 'text-red-400'}`}
                      >
                        <i className="fa-solid fa-ban text-xs"></i>
                        {blocked ? t('userProfile.unblockUser') : t('userProfile.blockUser')}
                      </button>
                      <button
                        onClick={() => setShowMoreMenu(false)}
                        className="w-full px-4 py-3 text-left text-[12px] font-bold text-orange-400 hover:bg-[var(--c-hover)] flex items-center gap-2.5 transition-colors border-t border-[var(--c-border)]"
                      >
                        <i className="fa-solid fa-flag text-xs"></i>
                        {t('userProfile.reportUser')}
                      </button>
                    </div>
                  )}
                </div>
              )}
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
            { label: t('userProfile.listings'), value: products.length, icon: 'fa-tags', iconColor: 'text-blue-400' },
            { label: t('userProfile.sold'), value: profile.total_sales, icon: 'fa-bag-shopping', iconColor: 'text-emerald-400' },
            { label: t('userProfile.rating'), value: avgRating > 0 ? avgRating.toFixed(1) : '\u2014', icon: 'fa-star', iconColor: 'text-yellow-400' },
            { label: t('userProfile.reviews'), value: reviews.length, icon: 'fa-comments', iconColor: 'text-purple-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-3 flex flex-col items-center gap-1 text-center">
              <i className={`fa-solid ${stat.icon} ${stat.iconColor} text-xs`}></i>
              <span className="text-base font-black text-[var(--c-text)] leading-none">{stat.value}</span>
              <span className="text-[9px] text-[var(--c-text3)] uppercase tracking-wider font-bold">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div className="flex p-0.5 bg-[var(--c-card)] border border-[var(--c-border)] rounded-[14px]">
          {([
            { key: 'oglasi' as const, label: t('userProfile.listings'), count: products.length },
            { key: 'dojmovi' as const, label: t('userProfile.reviews'), count: reviews.length },
            { key: 'info' as const, label: t('userProfile.info'), count: undefined },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-3 rounded-[10px] text-[10px] font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTab === tab.key
                  ? 'bg-[var(--c-active)] text-[var(--c-text)] shadow-sm'
                  : 'text-[var(--c-text3)] hover:text-[var(--c-text2)]'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`min-w-[16px] h-4 px-1 rounded-full text-[8px] font-black flex items-center justify-center ${
                  activeTab === tab.key
                    ? 'bg-blue-500/15 text-blue-500'
                    : 'bg-[var(--c-overlay)] text-[var(--c-text3)]'
                }`}>
                  {tab.count}
                </span>
              )}
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
                  <h3 className="text-[13px] font-black text-[var(--c-text)] mb-0.5">{t('userProfile.noActiveListings')}</h3>
                  <p className="text-[10px] text-[var(--c-text3)] max-w-[180px] leading-relaxed">{t('userProfile.noActiveListingsDesc')}</p>
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
                      {currencyMode === 'km-only' ? (
                        <p className="text-[12px] font-black text-blue-500 mt-0.5">{eurToKm(Number(p.price)).toLocaleString()} KM</p>
                      ) : (
                        <p className="text-[12px] font-black text-blue-500 mt-0.5">{Number(p.price).toLocaleString()} &euro;</p>
                      )}
                      <p className="text-[9px] text-[var(--c-text3)] mt-0.5">
                        {currencyMode === 'dual' && <>{Math.round(Number(p.price) * BAM_RATE).toLocaleString()} KM &middot; </>}
                        {formatTimeLabel(p.created_at)}
                      </p>
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
                  <span className="text-[9px] text-[var(--c-text3)] uppercase tracking-widest">{t('userProfile.reviewsCount', { count: reviews.length })}</span>
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
                <p className="text-sm font-bold text-[var(--c-text)]">{t('userProfile.noReviews')}</p>
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
                          <p className="text-xs font-bold text-[var(--c-text)]">{review.reviewer?.username || t('common.user')}</p>
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

        {/* ── INFO TAB ── */}
        {activeTab === 'info' && (
          <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 flex flex-col items-start gap-2 hover:border-blue-500/30 transition-colors">
                <div className="w-8 h-8 rounded-[10px] bg-blue-500/10 flex items-center justify-center">
                  <i className="fa-regular fa-calendar text-blue-500"></i>
                </div>
                <div>
                  <h5 className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest">{t('userProfile.memberSince')}</h5>
                  <p className="text-xs font-bold text-[var(--c-text)]">{formatMemberSince(profile.created_at)}</p>
                </div>
              </div>
              <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 flex flex-col items-start gap-2 hover:border-blue-500/30 transition-colors">
                <div className="w-8 h-8 rounded-[10px] bg-blue-500/10 flex items-center justify-center">
                  <i className="fa-solid fa-location-dot text-blue-500"></i>
                </div>
                <div>
                  <h5 className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest">{t('userProfile.location')}</h5>
                  <p className="text-xs font-bold text-[var(--c-text)]">{profile.location || t('userProfile.unknown')}</p>
                </div>
              </div>
              <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 flex flex-col items-start gap-2 hover:border-emerald-500/30 transition-colors">
                <div className="w-8 h-8 rounded-[10px] bg-emerald-500/10 flex items-center justify-center">
                  <i className="fa-solid fa-bag-shopping text-emerald-500"></i>
                </div>
                <div>
                  <h5 className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest">{t('userProfile.sales')}</h5>
                  <p className="text-xs font-bold text-[var(--c-text)]">{t('userProfile.soldCount', { count: profile.total_sales || 0 })}</p>
                </div>
              </div>
              <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 flex flex-col items-start gap-2 hover:border-blue-500/30 transition-colors">
                <div className="w-8 h-8 rounded-[10px] bg-blue-500/10 flex items-center justify-center">
                  <i className="fa-solid fa-tags text-blue-500"></i>
                </div>
                <div>
                  <h5 className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest">{t('userProfile.activeListings')}</h5>
                  <p className="text-xs font-bold text-[var(--c-text)]">{t('userProfile.activeCount', { count: products.length })}</p>
                </div>
              </div>
              <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 flex flex-col items-start gap-2 hover:border-yellow-500/30 transition-colors">
                <div className="w-8 h-8 rounded-[10px] bg-yellow-500/10 flex items-center justify-center">
                  <i className="fa-solid fa-star text-yellow-500"></i>
                </div>
                <div>
                  <h5 className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest">{t('userProfile.rating')}</h5>
                  <p className="text-xs font-bold text-[var(--c-text)]">{avgRating > 0 ? t('userProfile.ratingValue', { value: avgRating }) : t('userProfile.noRatings')}</p>
                </div>
              </div>
              <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 flex flex-col items-start gap-2 hover:border-emerald-500/30 transition-colors">
                <div className="w-8 h-8 rounded-[10px] bg-emerald-500/10 flex items-center justify-center">
                  <i className="fa-solid fa-shield-halved text-emerald-500"></i>
                </div>
                <div>
                  <h5 className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest">{t('userProfile.verification')}</h5>
                  <p className={`text-xs font-bold ${profile.email_verified ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {profile.email_verified ? t('userProfile.emailConfirmed') : t('userProfile.notVerified')}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links — always show both, with fallback text */}
            <h4 className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-widest px-1">{t('userProfile.social')}</h4>
            <div className="space-y-2">
              {profile.instagram_url ? (
                <a
                  href={`https://instagram.com/${profile.instagram_url.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 hover:bg-[var(--c-hover)] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <i className="fa-brands fa-instagram text-pink-500"></i>
                    <span className="text-[10px] font-bold text-[var(--c-text2)] group-hover:text-[var(--c-text)] transition-colors">@{profile.instagram_url.replace('@', '')}</span>
                  </div>
                  <i className="fa-solid fa-arrow-up-right-from-square text-[var(--c-text-muted)] text-xs group-hover:text-pink-400 transition-colors"></i>
                </a>
              ) : (
                <div className="flex items-center justify-between bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 opacity-50">
                  <div className="flex items-center gap-3">
                    <i className="fa-brands fa-instagram text-[var(--c-text-muted)]"></i>
                    <span className="text-[10px] font-bold text-[var(--c-text3)]">{t('userProfile.noInstagram')}</span>
                  </div>
                </div>
              )}
              {profile.facebook_url ? (
                <a
                  href={profile.facebook_url.startsWith('http') ? profile.facebook_url : `https://facebook.com/${profile.facebook_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 hover:bg-[var(--c-hover)] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <i className="fa-brands fa-facebook text-blue-500"></i>
                    <span className="text-[10px] font-bold text-[var(--c-text2)] group-hover:text-[var(--c-text)] transition-colors">Facebook</span>
                  </div>
                  <i className="fa-solid fa-arrow-up-right-from-square text-[var(--c-text-muted)] text-xs group-hover:text-blue-400 transition-colors"></i>
                </a>
              ) : (
                <div className="flex items-center justify-between bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 opacity-50">
                  <div className="flex items-center gap-3">
                    <i className="fa-brands fa-facebook text-[var(--c-text-muted)]"></i>
                    <span className="text-[10px] font-bold text-[var(--c-text3)]">{t('userProfile.noFacebook')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MEMBER SINCE ── */}
        <div className="text-center py-4">
          <p className="text-[10px] text-[var(--c-text-muted)]">
            <i className="fa-regular fa-calendar mr-1.5"></i>
            {t('userProfile.memberSince')} {formatMemberSince(profile.created_at)}
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
