'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { useNotifications } from '@/lib/notifications';
import { useAuth } from '@/lib/auth';
import { getUnreadCount } from '@/services/messageService';
import NotificationPanel from '@/components/NotificationPanel';
import SiteFooter from '@/components/layout/SiteFooter';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  headerRight?: React.ReactNode;
  showSigurnost?: boolean;
  hideSearchOnMobile?: boolean;
  /** Back button handler. undefined = auto router.back(), null = hide back button, function = custom handler */
  onBack?: (() => void) | null;
}

export default function MainLayout({ children, headerRight, hideSearchOnMobile, onBack }: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const { items: cartItems } = useCart();
  const { unreadCount } = useNotifications();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchUnread = useCallback(async () => {
    if (!user?.id) return;
    try {
      const count = await getUnreadCount(user.id);
      setUnreadMessages(count);
    } catch { /* silent */ }
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setUnreadMessages(0);
      return;
    }
    fetchUnread();
    pollRef.current = setInterval(fetchUnread, 30000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [isAuthenticated, user?.id, fetchUnread]);

  const isHome = pathname === '/';

  return (
    <div className="flex min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] font-sans relative overflow-x-hidden selection:bg-blue-500/20">

      {/* DESKTOP HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 md:h-16 px-4 md:px-6 lg:px-8 flex items-center justify-between glass-nav border-b border-[var(--c-border)] shadow-[0_1px_0_rgba(0,0,0,0.04)]">

        {/* LEFT: Back Button + Logo & Brand + Info Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">

          {/* Back Button — visible on all sub-pages, LEFT side */}
          {!isHome && onBack !== null && (
            <button
              onClick={onBack || (() => router.back())}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] blue-gradient text-white shadow-accent hover:brightness-110 transition-all duration-150 active:scale-95"
              aria-label="Nazad"
            >
              <i className="fa-solid fa-arrow-left text-sm"></i>
              <span className="text-xs font-bold uppercase tracking-wider">Nazad</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => router.push('/')}
            onKeyDown={(e) => e.key === 'Enter' && router.push('/')}
            aria-label="NudiNađi — idi na početnu stranicu"
            className="flex items-center gap-1 md:gap-1.5 cursor-pointer group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/emblem.png"
              alt="NudiNađi emblem"
              className="h-8 md:h-10 w-auto object-contain rounded-[4px]"
            />
            <span className="text-base md:text-xl font-black tracking-tight">
              <span className="text-[var(--c-text)]">nudi</span><span className="text-[var(--c-text)] group-hover:text-[var(--c-accent)] transition-colors duration-150">nađi</span>
            </span>
          </button>

          {/* Info Buttons — desktop only */}
          <div className="hidden xl:flex items-center gap-1.5 ml-1">
            <div className="w-[1px] h-6 bg-[var(--c-border)] mr-1"></div>
            <button
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-[12px] font-semibold text-[var(--c-text3)] hover:text-[var(--c-accent)] hover:bg-[var(--c-accent-light)] border border-transparent hover:border-[var(--c-accent)]/20 transition-all duration-150"
            >
              <i className="fa-solid fa-circle-info text-[11px]"></i>
              Više informacija
            </button>
            <button
              onClick={() => setShowHowItWorks(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-[12px] font-semibold text-[var(--c-text3)] hover:text-purple-600 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/20 transition-all duration-150"
            >
              <i className="fa-solid fa-circle-play text-[11px]"></i>
              Kako funkcionira
            </button>
          </div>
        </div>

        {/* CENTER: Novi Oglas — absolute centered, only on large screens */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden xl:block">
          <Link
            href="/upload"
            aria-label="Novi oglas — dodaj oglas"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-[6px] transition-all duration-150 ${
              pathname === '/upload'
                ? 'bg-[var(--c-accent)] text-white shadow-accent'
                : 'blue-gradient text-white shadow-accent hover:brightness-110'
            }`}
          >
            <i className="fa-solid fa-plus text-sm" aria-hidden="true"></i>
            <span className="text-[12px] font-bold uppercase tracking-wider">Novi Oglas</span>
          </Link>
        </div>

        {/* RIGHT: User Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-4">

          {/* Novi Oglas — compact, in flex flow, only on sm-to-lg screens */}
          <Link
            href="/upload"
            aria-label="Novi oglas — dodaj oglas"
            className={`hidden sm:flex xl:hidden items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 md:py-2 rounded-[6px] transition-all duration-150 shrink-0 ${
              pathname === '/upload'
                ? 'bg-[var(--c-accent)] text-white shadow-accent'
                : 'blue-gradient text-white shadow-accent hover:brightness-110'
            }`}
          >
            <i className="fa-solid fa-plus text-[10px] md:text-xs" aria-hidden="true"></i>
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider">Novi Oglas</span>
          </Link>

          {/* Header Right Custom Actions */}
          {headerRight && <div className="mr-2">{headerRight}</div>}

          {/* Messages Icon — only when logged in, hidden on mobile (in bottom nav) */}
          {isAuthenticated && (
          <Link
            href="/messages"
            className={`hidden sm:flex sm:w-7 md:w-8 lg:w-10 sm:h-7 md:h-8 lg:h-10 rounded-[6px] items-center justify-center transition-all duration-150 border ${
              pathname === '/messages'
                ? 'bg-[var(--c-accent)] text-white border-[var(--c-accent)] shadow-accent'
                : 'bg-[var(--c-card-alt)] border-[var(--c-border)] text-[var(--c-text3)] hover:bg-[var(--c-active)] hover:text-[var(--c-text2)]'
            }`}
            aria-label="Poruke"
          >
            <div className="relative" aria-hidden="true">
              <i className="fa-solid fa-comment-dots text-sm"></i>
              {unreadMessages > 0 && (
                <div className="absolute -top-2 -right-2.5 min-w-[16px] h-[16px] md:min-w-[18px] md:h-[18px] bg-red-500 rounded-full border-2 border-[var(--c-card)] flex items-center justify-center">
                  <span className="text-[7px] md:text-[8px] font-black text-white">{unreadMessages > 9 ? '9+' : unreadMessages}</span>
                </div>
              )}
            </div>
          </Link>
          )}

          {/* Cart Icon — responsive size */}
          <Link
            href="/cart"
            className={`w-8 sm:w-7 md:w-8 lg:w-10 h-8 sm:h-7 md:h-8 lg:h-10 rounded-[6px] flex items-center justify-center transition-all duration-150 border ${
              pathname === '/cart'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-[var(--c-card-alt)] border-[var(--c-border)] text-[var(--c-text3)] hover:bg-[var(--c-active)] hover:text-[var(--c-text2)]'
            }`}
            aria-label={`Korpa${cartItems.length > 0 ? ` (${cartItems.length})` : ''}`}
          >
            <div className="relative" aria-hidden="true">
              <i className="fa-solid fa-bag-shopping text-xs md:text-sm"></i>
              {cartItems.length > 0 && (
                <div className="absolute -top-2 -right-2.5 min-w-[16px] h-[16px] md:min-w-[18px] md:h-[18px] bg-emerald-500 rounded-full border-2 border-[var(--c-card)] flex items-center justify-center">
                  <span className="text-[7px] md:text-[8px] font-black text-white">{cartItems.length}</span>
                </div>
              )}
            </div>
          </Link>

          {/* Notification Bell — responsive size */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-8 sm:w-7 md:w-8 lg:w-10 h-8 sm:h-7 md:h-8 lg:h-10 rounded-[6px] flex items-center justify-center transition-all duration-150 border ${
              showNotifications
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-[var(--c-card-alt)] border-[var(--c-border)] text-[var(--c-text3)] hover:bg-[var(--c-active)] hover:text-[var(--c-text2)]'
            }`}
            aria-label={`Obavještenja${unreadCount > 0 ? ` (${unreadCount} nepročitanih)` : ''}`}
            aria-expanded={showNotifications}
          >
            <div className="relative" aria-hidden="true">
              <i className="fa-solid fa-bell text-xs md:text-sm"></i>
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2.5 min-w-[16px] h-[16px] md:min-w-[18px] md:h-[18px] bg-red-500 rounded-full border-2 border-[var(--c-card)] flex items-center justify-center">
                  <span className="text-[7px] md:text-[8px] font-black text-white">{unreadCount}</span>
                </div>
              )}
            </div>
          </button>

          {/* Settings / Menu Icon — only when logged in, hidden on mobile (in bottom nav) */}
          {isAuthenticated && (
          <Link
            href="/menu"
            className={`hidden sm:flex sm:w-7 md:w-8 lg:w-10 sm:h-7 md:h-8 lg:h-10 rounded-[6px] items-center justify-center transition-all duration-150 border ${
              pathname === '/menu'
                ? 'bg-[var(--c-text)] text-[var(--c-bg)] border-[var(--c-text)]'
                : 'bg-[var(--c-card-alt)] border-[var(--c-border)] text-[var(--c-text3)] hover:bg-[var(--c-active)] hover:text-[var(--c-text2)]'
            }`}
            aria-label="Postavke"
          >
            <i className="fa-solid fa-gear text-sm" aria-hidden="true"></i>
          </Link>
          )}

          {/* Divider */}
          <div className="w-[1px] h-8 bg-[var(--c-border)] mx-1 hidden sm:block"></div>

          {/* Profile Avatar / Guest Button — responsive */}
          {isAuthenticated && user ? (
            <Link
              href="/profile"
              className={`relative group flex items-center gap-2 md:gap-3 pl-1 pr-1 md:pr-4 py-1 rounded-[6px] transition-all duration-150 border ${
                pathname === '/profile'
                  ? 'bg-[var(--c-card-alt)] border-[var(--c-accent)]/50'
                  : 'border-transparent hover:bg-[var(--c-card-alt)]'
              }`}
            >
              <div className={`w-7 h-7 md:w-9 md:h-9 rounded-full p-[2px] ${pathname === '/profile' ? 'blue-gradient' : 'bg-[var(--c-border)] group-hover:bg-[var(--c-active)]'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatarUrl || 'https://picsum.photos/seed/me/200/200'}
                  alt={`${user.username} profil slika`}
                  className="w-full h-full rounded-full object-cover border border-[var(--c-card)]"
                />
              </div>
              <div className="hidden md:block text-left">
                <p className={`text-[13px] font-semibold leading-none ${pathname === '/profile' ? 'text-[var(--c-text)]' : 'text-[var(--c-text2)]'}`}>{user.username}</p>
                <p className="text-[11px] text-[var(--c-accent)] font-semibold uppercase tracking-wider mt-0.5">Moj Profil</p>
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              className="relative group flex items-center gap-1.5 md:gap-2 pl-1.5 md:pl-2 pr-2 md:pr-3 py-1 md:py-1.5 rounded-[6px] transition-all duration-150 border border-[var(--c-border)] hover:bg-[var(--c-card-alt)]"
            >
              <div className="w-7 h-7 md:w-9 md:h-9 rounded-[6px] bg-[var(--c-card-alt)] border border-[var(--c-border)] flex items-center justify-center">
                <i className="fa-solid fa-user-slash text-xs md:text-sm text-[var(--c-text3)]"></i>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[12px] font-extrabold leading-none text-[var(--c-text2)] uppercase tracking-wider">GOST</p>
                <p className="text-[11px] text-[var(--c-accent)] font-semibold uppercase tracking-wider mt-0.5">Prijavi se</p>
              </div>
            </Link>
          )}
        </div>
      </header>

      {/* NOTIFICATION PANEL */}
      <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

      {/* HOW IT WORKS MODAL */}
      {showHowItWorks && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-6 lg:p-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="how-it-works-title"
        >
          <div
            className="absolute inset-0 bg-[var(--c-overlay)] backdrop-blur-sm"
            onClick={() => setShowHowItWorks(false)}
            onKeyDown={(e) => e.key === 'Escape' && setShowHowItWorks(false)}
          ></div>
          <div className="relative w-full max-w-4xl bg-[var(--c-card)] border border-[var(--c-border)] rounded-[10px] shadow-strong animate-scaleIn flex flex-col overflow-hidden" style={{ height: 'min(85vh, 700px)' }}>

            {/* HEADER */}
            <div className="shrink-0 flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-[var(--c-border)]">
              <div className="flex items-center gap-1 md:gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/emblem.png"
                  alt="NudiNađi emblem"
                  className="h-8 md:h-10 w-auto object-contain rounded-xl"
                />
                <div>
                  <p className="text-sm md:text-base font-black text-[var(--c-text)] tracking-tight leading-none">nudinađi</p>
                  <p className="text-[7px] md:text-[8px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-0.5">AI Marketplace Platforma</p>
                </div>
              </div>
              <button
                onClick={() => setShowHowItWorks(false)}
                className="w-8 h-8 rounded-[4px] bg-[var(--c-hover)] hover:bg-[var(--c-active)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] transition-all duration-150"
                aria-label="Zatvori"
              >
                <i className="fa-solid fa-xmark text-sm" aria-hidden="true"></i>
              </button>
            </div>

            {/* BODY — scrollable on mobile */}
            <div className="flex-1 flex flex-col px-4 md:px-6 py-4 md:py-5 gap-4 md:gap-5 min-h-0 overflow-y-auto">

              {/* TOP ROW: Hero + Stats */}
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 shrink-0">
                <div className="flex-1">
                  <h2 id="how-it-works-title" className="text-2xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-2 md:mb-3">
                    TRGOVINA<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">REDEFINIRANA.</span>
                  </h2>
                  <div className="w-10 h-[3px] bg-blue-500 mb-2 md:mb-3"></div>
                  <p className="text-[11px] md:text-[12px] text-[var(--c-text2)] leading-relaxed max-w-[380px]">
                    NudiNađi nije samo još jedan oglasnik. To je inteligentni ekosistem koji razumije šta želiš, prije nego što to i sam znaš.
                  </p>
                </div>
                <div className="hidden md:flex gap-3 shrink-0">
                  <div className="w-36 bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-4">
                    <i className="fa-solid fa-bolt text-[var(--c-text3)] text-xl mb-3 block"></i>
                    <p className="text-3xl font-black text-[var(--c-text)] leading-none mb-1">AI</p>
                    <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-widest">Pametna Pretraga</p>
                  </div>
                  <div className="w-36 bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-4">
                    <i className="fa-solid fa-brain text-[var(--c-text3)] text-xl mb-3 block"></i>
                    <p className="text-3xl font-black text-[var(--c-text)] leading-none mb-1">24/7</p>
                    <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-widest">Dostupnost</p>
                  </div>
                </div>
              </div>

              {/* SECTION LABEL */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-8 h-[2px] bg-blue-500"></div>
                <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Kako to radi</p>
              </div>

              {/* FEATURE CARDS — responsive grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 flex-1 min-h-0">
                <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-blue-500/40 transition-colors flex flex-col">
                  <div className="absolute top-0 right-0 w-14 h-14 bg-blue-500/20 rounded-bl-[35px]"></div>
                  <div className="w-10 h-10 rounded-[4px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4 shrink-0">
                    <i className="fa-solid fa-magnifying-glass-chart text-blue-400 text-sm"></i>
                  </div>
                  <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">1. Kontekstualna<br />Pretraga</h3>
                  <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">
                    Zaboravi na ključne riječi i filtere. Naš AI razumije prirodni jezik. Napiši <span className="text-[var(--c-text)] font-bold">&ldquo;Trebam laptop za faks do 500 KM&rdquo;</span> i sistem će automatski filtrirati kategoriju, cijenu i specifikacije.
                  </p>
                </div>

                <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-purple-500/40 transition-colors flex flex-col">
                  <div className="absolute top-0 right-0 w-14 h-14 bg-purple-500/20 rounded-bl-[35px]"></div>
                  <div className="w-10 h-10 rounded-[4px] bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4 shrink-0">
                    <i className="fa-solid fa-camera text-purple-400 text-sm"></i>
                  </div>
                  <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">2. Vizualna<br />Prodaja</h3>
                  <p className="text-[10px] text-[var(--c-text3)] leading-relaxed mb-3">
                    Prodaja nikad nije bila brža. Uslikaj predmet, a naš AI ga prepoznaje, kategorizira i predlaže opis. Tvoj oglas je online za manje od 30 sekundi.
                  </p>
                  <p className="text-[8px] font-bold text-purple-400 uppercase tracking-wider mt-auto">
                    <i className="fa-solid fa-mobile-screen text-[7px] mr-1"></i>Dostupno u aplikaciji · Business plan
                  </p>
                </div>

                <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 relative overflow-hidden hover:border-orange-500/40 transition-colors flex flex-col">
                  <div className="absolute top-0 right-0 w-14 h-14 bg-orange-500/20 rounded-bl-[35px]"></div>
                  <div className="w-10 h-10 rounded-[4px] bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mb-4 shrink-0">
                    <i className="fa-solid fa-spell-check text-orange-400 text-sm"></i>
                  </div>
                  <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide mb-2">3. AI Pretraga &<br />Kategorija</h3>
                  <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">
                    Napiši <span className="text-[var(--c-text)] font-bold">&ldquo;bmv 3&rdquo;</span> ili <span className="text-[var(--c-text)] font-bold">&ldquo;iphone&rdquo;</span> — AI ispravlja greške i pronalazi pravo. Kategorija se automatski prepoznaje iz opisa, bez ručnog biranja.
                  </p>
                </div>
              </div>

              {/* BOTTOM QUOTE */}
              <div className="shrink-0 text-center pt-3 md:pt-4 border-t border-[var(--c-border)]">
                <p className="text-sm md:text-lg font-black text-[var(--c-text)] uppercase tracking-tight mb-1">
                  &ldquo;Tehnologija koja radi za tebe.&rdquo;
                </p>
                <p className="text-[7px] md:text-[8px] font-bold text-[var(--c-text-muted)] uppercase tracking-[0.3em]">NudiNađi platforma</p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* GUEST LOGIN BANNER */}
      {!authLoading && !isAuthenticated && (
        <div className="fixed top-12 sm:top-14 md:top-16 left-0 right-0 z-40 bg-[var(--c-accent)] text-white px-3 sm:px-4 py-1.5 sm:py-2 md:py-2.5 flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3">
          <i className="fa-solid fa-user-plus text-xs opacity-80"></i>
          <span className="text-[11px] font-bold">Gost si — prijavi se ili napravi profil!</span>
          <Link href="/login" className="ml-2 px-3 py-1 bg-[var(--c-card)] text-[var(--c-accent)] rounded-[4px] text-[12px] font-bold uppercase tracking-wider hover:bg-[var(--c-accent-light)] transition-all duration-150">
            Prijavi se
          </Link>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 flex flex-col ${!authLoading && !isAuthenticated ? 'pt-20 sm:pt-24 md:pt-28' : 'pt-14 sm:pt-16 md:pt-20'} min-w-0 relative z-10`}>

        {/* SECURITY INFO MODAL */}
        {showSecurityInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-[var(--c-overlay)] backdrop-blur-sm" onClick={() => setShowSecurityInfo(false)}></div>
            <div className="relative bg-[var(--c-card)] border border-[var(--c-border)] w-full max-w-sm rounded-[10px] p-6 shadow-strong overflow-hidden animate-scaleIn">

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-[8px] bg-[var(--c-accent-light)] border border-[var(--c-accent)]/20 flex items-center justify-center">
                  <i className="fa-solid fa-shield-halved text-3xl text-blue-500"></i>
                </div>

                <div>
                  <h2 className="text-xl font-black text-[var(--c-text)] uppercase tracking-tight">AI Zaštita</h2>
                  <p className="text-xs text-blue-500 font-bold uppercase tracking-widest mt-1">Sigurnost na prvom mjestu</p>
                </div>

                <div className="bg-[var(--c-card-alt)] rounded-[6px] p-4 w-full border border-[var(--c-border)] text-left space-y-3">
                  <div className="flex gap-3">
                    <i className="fa-solid fa-user-shield text-emerald-500 mt-1"></i>
                    <div>
                      <h4 className="text-[12px] font-bold text-[var(--c-text)]">Anti-Scam Detekcija</h4>
                      <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">
                        Naš AI analizira ponašanje korisnika i sumnjive poruke kako bi spriječio prevare prije nego se dogode.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowSecurityInfo(false)}
                  className="w-full py-3 rounded-[6px] bg-[var(--c-card-alt)] hover:bg-[var(--c-active)] border border-[var(--c-border)] text-[var(--c-text2)] text-xs font-bold uppercase tracking-wider transition-all duration-150"
                >
                  Razumijem
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 px-3 sm:px-4 md:px-8 w-full max-w-full mx-auto pb-24 sm:pb-6">
          {children}
        </main>

        {/* SITE FOOTER — shown on every page */}
        <SiteFooter />
      </div>

      {/* MOBILE BOTTOM NAV — Floating Pill */}
      <nav aria-label="Mobilna navigacija" className="sm:hidden fixed bottom-0 left-0 right-0 z-[90] px-2 pb-3">
        <div className="flex justify-around items-center px-2 sm:px-4 py-2 rounded-[28px] bg-[var(--c-bg)]/80 backdrop-blur-xl border border-[var(--c-glass-border)] shadow-2xl">
          <Link href="/" aria-label="Početna" aria-current={pathname === '/' ? 'page' : undefined} className={`flex flex-col items-center gap-0.5 transition-all px-2 ${pathname === '/' ? 'text-[var(--c-accent)]' : 'text-[var(--c-text3)]'}`}>
            <i className="fa-solid fa-house text-[17px]" aria-hidden="true"></i>
            <span className="text-[9px] sm:text-[10px] font-semibold">Početna</span>
          </Link>

          {isAuthenticated && (
          <Link href="/messages" aria-label={`Poruke${unreadMessages > 0 ? ` (${unreadMessages} nepročitanih)` : ''}`} aria-current={pathname === '/messages' ? 'page' : undefined} className={`flex flex-col items-center gap-0.5 transition-all px-2 relative ${pathname === '/messages' ? 'text-[var(--c-accent)]' : 'text-[var(--c-text3)]'}`}>
            <div className="relative">
              <i className="fa-solid fa-comment-dots text-[17px]" aria-hidden="true"></i>
              {unreadMessages > 0 && (
                <div className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] bg-red-500 rounded-full border-[1.5px] border-[var(--c-bg)] flex items-center justify-center">
                  <span className="text-[7px] font-black text-white">{unreadMessages > 9 ? '9+' : unreadMessages}</span>
                </div>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] font-semibold">Poruke</span>
          </Link>
          )}

          <Link href="/upload" aria-label="Novi oglas" className="flex items-center justify-center px-2">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 ${pathname === '/upload' ? 'blue-gradient shadow-accent' : 'blue-gradient shadow-accent'}`}>
              <i className="fa-solid fa-plus text-white text-base" aria-hidden="true"></i>
            </div>
          </Link>

          <Link href={isAuthenticated ? '/profile' : '/login'} aria-label={isAuthenticated ? 'Profil' : 'Prijavi se'} aria-current={pathname === '/profile' ? 'page' : undefined} className={`flex flex-col items-center gap-0.5 transition-all px-2 ${pathname === '/profile' ? 'text-[var(--c-accent)]' : 'text-[var(--c-text3)]'}`}>
            <i className={`fa-solid ${isAuthenticated ? 'fa-user' : 'fa-right-to-bracket'} text-[17px]`} aria-hidden="true"></i>
            <span className="text-[9px] sm:text-[10px] font-semibold">{isAuthenticated ? 'Profil' : 'Prijava'}</span>
          </Link>

          {isAuthenticated && (
          <Link href="/menu" aria-label="Meni" aria-current={pathname === '/menu' ? 'page' : undefined} className={`flex flex-col items-center gap-0.5 transition-all px-2 ${pathname === '/menu' ? 'text-[var(--c-accent)]' : 'text-[var(--c-text3)]'}`}>
            <i className="fa-solid fa-bars text-[17px]" aria-hidden="true"></i>
            <span className="text-[9px] sm:text-[10px] font-semibold">Meni</span>
          </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
