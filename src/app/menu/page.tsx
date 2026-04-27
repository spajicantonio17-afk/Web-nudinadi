'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { getSupabase } from '@/lib/supabase';
import { uploadAvatar } from '@/services/uploadService';
import AppSettings from '@/components/settings/AppSettings';
import LanguageSettings from '@/components/settings/LanguageSettings';
import EmailNotificationSettings from '@/components/EmailNotificationSettings';
import { getBlockedUsers, unblockUser } from '@/services/blockService';
import { isBusiness } from '@/lib/plans';
import type { Profile } from '@/lib/database.types';

type MenuStep = 'main' | 'account' | 'main-settings' | 'security' | 'devices' | 'notifications' | 'appearance' | 'language' | 'support' | 'verification' | 'blocked-users';

// ── localStorage Persistence Helpers ─────────────────────────

const NOTIF_KEY = 'nudinadi_notif_settings';
const GENERAL_KEY = 'nudinadi_general_settings';
const ICON_KEY = 'nudinadi_app_icon';

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch { return fallback; }
}

function saveJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── Sub-Components ───────────────────────────────────────────

const ToggleRow: React.FC<{ label: string; desc?: string; isOn: boolean; onToggle: () => void }> = ({ label, desc, isOn, onToggle }) => (
    <div onClick={onToggle} className="flex items-center justify-between p-4 bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] mb-2 cursor-pointer active:scale-[0.99] transition-all">
        <div>
            <h4 className="text-[13px] font-bold text-[var(--c-text)]">{label}</h4>
            {desc && <p className="text-[10px] text-[var(--c-text3)] mt-0.5">{desc}</p>}
        </div>
        <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${isOn ? 'bg-blue-500' : 'bg-[var(--c-active)]'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isOn ? 'translate-x-5' : 'translate-x-0'}`}></div>
        </div>
    </div>
);

const SelectionRow: React.FC<{ label: string; isSelected: boolean; onClick: () => void; icon?: string }> = ({ label, isSelected, onClick, icon }) => (
    <div onClick={onClick} className={`flex items-center justify-between p-4 border rounded-[18px] mb-2 cursor-pointer transition-all ${isSelected ? 'bg-blue-500/10 border-blue-500/50' : 'bg-[var(--c-card)] border-[var(--c-border)] hover:border-[var(--c-border2)]'}`}>
        <div className="flex items-center gap-3">
            {icon && <i className={`fa-solid ${icon} ${isSelected ? 'text-blue-400' : 'text-[var(--c-text3)]'}`}></i>}
            <h4 className={`text-[13px] font-bold ${isSelected ? 'text-blue-400' : 'text-[var(--c-text)]'}`}>{label}</h4>
        </div>
        {isSelected && <i className="fa-solid fa-check text-blue-400 text-sm"></i>}
    </div>
);

const AppIconOption: React.FC<{ name: string; colors: string; isSelected: boolean; onClick: () => void }> = ({ name, colors, isSelected, onClick }) => (
    <div onClick={onClick} className="flex flex-col items-center gap-2 cursor-pointer group">
        <div className={`w-16 h-16 rounded-[18px] ${colors} shadow-lg flex items-center justify-center text-2xl text-white transition-all duration-300 relative ${isSelected ? 'scale-110 ring-2 ring-offset-2 ring-offset-[var(--c-bg)] ring-blue-500' : 'opacity-70 group-hover:opacity-100'}`}>
            <i className="fa-solid fa-cube"></i>
            {isSelected && <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-blue-500 rounded-full border-2 border-[var(--c-bg)] flex items-center justify-center"><i className="fa-solid fa-check text-[8px]"></i></div>}
        </div>
        <span className={`text-[10px] font-bold ${isSelected ? 'text-blue-400' : 'text-[var(--c-text3)]'}`}>{name}</span>
    </div>
);

const MenuOption: React.FC<{ label: string; badge?: string; icon: string; onClick: () => void; danger?: boolean }> = ({ label, badge, icon, onClick, danger }) => (
  <div onClick={onClick} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] p-4 mb-2.5 flex items-center justify-between group active:bg-[var(--c-hover)] transition-all cursor-pointer">
    <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-[10px] ${danger ? 'bg-red-500/10 border-red-500/20' : 'bg-[var(--c-hover)] border-[var(--c-border2)]'} border flex items-center justify-center`}>
            <i className={`fa-solid ${icon} ${danger ? 'text-red-400' : 'text-[var(--c-text2)] group-hover:text-blue-400'} transition-colors`}></i>
        </div>
        <span className={`text-[14px] font-semibold ${danger ? 'text-red-400' : 'text-[var(--c-text)]'}`}>{label}</span>
    </div>
    <div className="flex items-center gap-3">
        {badge && (
            <span className="bg-blue-500/10 text-[9px] font-bold px-2 py-0.5 rounded-md text-blue-400 border border-blue-500/20 uppercase tracking-wider">{badge}</span>
        )}
        <i className="fa-solid fa-chevron-right text-[10px] text-[var(--c-text-muted)] group-hover:text-[var(--c-text2)] transition-colors"></i>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════
// VERIFICATION STEP COMPONENT
// ══════════════════════════════════════════════════════════════

function OtpInputMenu({ length = 6, onComplete }: { length?: number; onComplete: (code: string) => void }) {
  const [values, setValues] = React.useState<string[]>(Array(length).fill(''));
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);
  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...values];
    next[index] = val.slice(-1);
    setValues(next);
    if (val && index < length - 1) refs.current[index + 1]?.focus();
    const code = next.join('');
    if (code.length === length) onComplete(code);
  };
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) refs.current[index - 1]?.focus();
  };
  return (
    <div className="flex gap-2 justify-center">
      {values.map((v, i) => (
        <input key={i} ref={el => { refs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={v}
          onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)}
          className="w-10 h-12 rounded-[12px] bg-[var(--c-card)] border border-[var(--c-border2)] text-center text-lg font-black text-[var(--c-text)] outline-none focus:border-blue-500 transition-colors" />
      ))}
    </div>
  );
}

// ─── Blocked Users Step ──────────────────────────────────
function BlockedUsersStep({ onBack, userId, t, showToast }: { onBack: () => void; userId?: string; t: (key: string) => string; showToast: (msg: string) => void }) {
  const [blockedUsers, setBlockedUsers] = useState<(Profile & { blockedAt: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;
    getBlockedUsers(userId)
      .then(setBlockedUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleUnblock = async (blockedId: string) => {
    if (!userId) return;
    setUnblocking(blockedId);
    try {
      await unblockUser(userId, blockedId);
      setBlockedUsers(prev => prev.filter(u => u.id !== blockedId));
      showToast(t('chat.unblocked'));
    } catch {
      showToast('Greška');
    } finally {
      setUnblocking(null);
    }
  };

  return (
    <MainLayout title={t('settings.blockedUsers')} showSigurnost={false} onBack={onBack}>
      <div className="max-w-2xl mx-auto pt-2 pb-24 space-y-3">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] animate-pulse"></div>
            ))}
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] p-10 text-center">
            <i className="fa-solid fa-user-check text-3xl text-[var(--c-text3)] mb-3"></i>
            <p className="text-sm font-bold text-[var(--c-text)]">{t('settings.blockedUsers.empty')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {blockedUsers.map(u => (
              <div
                key={u.id}
                className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-3 flex items-center gap-3"
              >
                <button
                  onClick={() => router.push(`/user/${u.username}`)}
                  className="w-10 h-10 rounded-[12px] bg-[var(--c-card-alt)] overflow-hidden shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={u.avatar_url || `https://picsum.photos/seed/${u.id}/100/100`}
                    alt={u.username}
                    className="w-full h-full object-cover"
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-[var(--c-text)] truncate">{u.username}</p>
                  {u.full_name && <p className="text-[10px] text-[var(--c-text3)] truncate">{u.full_name}</p>}
                </div>
                <button
                  onClick={() => handleUnblock(u.id)}
                  disabled={unblocking === u.id}
                  className="px-3 py-1.5 text-[10px] font-bold text-blue-500 border border-blue-500/30 rounded-full hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                >
                  {unblocking === u.id ? (
                    <i className="fa-solid fa-spinner animate-spin text-xs"></i>
                  ) : (
                    t('settings.blockedUsers.unblock')
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

interface VerificationStepProps {
  onBack: () => void;
  user: ReturnType<typeof useAuth>['user'];
  refreshProfile: () => Promise<void>;
  showToast: (msg: string) => void;
  t: (key: string) => string;
}

function VerificationStep({ onBack, user, refreshProfile, showToast, t }: VerificationStepProps) {
  const [emailCodeSent, setEmailCodeSent] = React.useState(false);
  const [emailSending, setEmailSending] = React.useState(false);
  const [verifyError, setVerifyError] = React.useState<string | null>(null);
  const [emailVerified, setEmailVerified] = React.useState(user?.emailVerified || false);
  const [resendCooldown, setResendCooldown] = React.useState(0);

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const sendCode = async () => {
    setEmailSending(true);
    setVerifyError(null);
    try {
      const res = await fetch('/api/verify/send-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'email' }),
      });
      const data = await res.json();
      if (!res.ok) { setVerifyError(data.error); return; }
      setEmailCodeSent(true);
      setResendCooldown(60);
    } catch { setVerifyError('Greška pri slanju koda.'); }
    finally { setEmailSending(false); }
  };

  const confirmCode = async (code: string) => {
    setVerifyError(null);
    try {
      const res = await fetch('/api/verify/confirm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'email', code }),
      });
      const data = await res.json();
      if (!res.ok) { setVerifyError(data.error); return; }
      setEmailVerified(true);
      showToast(t('verify.success'));
      refreshProfile();
    } catch { setVerifyError('Greška pri verifikaciji.'); }
  };

  return (
    <MainLayout title={t('verify.section')} showSigurnost={false} onBack={onBack}>
      <div className="max-w-2xl mx-auto pt-2 pb-24 space-y-4">
        {/* Email */}
        <div className={`bg-[var(--c-card)] border rounded-[18px] p-5 ${emailVerified ? 'border-green-500/30' : 'border-[var(--c-border)]'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${emailVerified ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
              <i className={`fa-solid ${emailVerified ? 'fa-check' : 'fa-envelope'}`}></i>
            </div>
            <div className="flex-1">
              <h3 className="text-[13px] font-bold text-[var(--c-text)]">Email</h3>
              <p className="text-[10px] text-[var(--c-text2)]">{user?.email}</p>
            </div>
            {emailVerified ? (
              <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">
                <i className="fa-solid fa-circle-check mr-1"></i>{t('verify.verified')}
              </span>
            ) : (
              <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">
                <i className="fa-solid fa-exclamation-circle mr-1"></i>{t('verify.notVerified')}
              </span>
            )}
          </div>
          {!emailVerified && (
            <div className="space-y-3">
              {!emailCodeSent ? (
                <button onClick={() => sendCode()} disabled={emailSending}
                  className="w-full py-3 rounded-[14px] bg-blue-600/10 text-blue-500 text-[11px] font-black uppercase tracking-widest hover:bg-blue-600/20 transition-colors disabled:opacity-50">
                  {emailSending ? <i className="fa-solid fa-spinner animate-spin"></i> : t('verify.phone.send')}
                </button>
              ) : (
                <>
                  <OtpInputMenu onComplete={(code) => confirmCode(code)} />
                  <div className="text-center">
                    {resendCooldown > 0 ? (
                      <p className="text-[10px] text-[var(--c-text3)]">{t('verify.resendIn')} {resendCooldown}s</p>
                    ) : (
                      <button onClick={() => sendCode()} className="text-[10px] text-blue-400 font-bold">{t('verify.resend')}</button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {verifyError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-[14px] px-4 py-3 text-xs text-red-400 text-center">
            <i className="fa-solid fa-circle-exclamation mr-2"></i>{verifyError}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════

export default function MenuPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const { locale, setLocale, t } = useI18n();
  const { theme, setTheme } = useTheme();

  // Support URL-based step: /menu?step=verification
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialStep = (searchParams?.get('step') as MenuStep) || 'main';
  const [step, setStep] = useState<MenuStep>(initialStep);

  // Scroll to top when switching menu sections
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login?redirect=/menu');
    }
  }, [isLoading, isAuthenticated, router]);

  // ── Persisted Settings State ─────────────────────────────

  const [notifSettings, setNotifSettings] = useState({
      messages: true,
      search: true,
      promotions: false,
      priceDrops: true
  });

  const [generalSettings, setGeneralSettings] = useState({
      location: true,
      dataSaver: false,
      autoPlay: true
  });

  const [appIcon, setAppIcon] = useState('classic');

  // Load persisted settings on mount
  useEffect(() => {
    setNotifSettings(loadJSON(NOTIF_KEY, { messages: true, search: true, promotions: false, priceDrops: true }));
    setGeneralSettings(loadJSON(GENERAL_KEY, { location: true, dataSaver: false, autoPlay: true }));
    setAppIcon(loadJSON(ICON_KEY, 'classic'));
  }, []);

  // Persist notification settings
  const updateNotif = useCallback((patch: Partial<typeof notifSettings>) => {
    setNotifSettings(prev => {
      const next = { ...prev, ...patch };
      saveJSON(NOTIF_KEY, next);
      return next;
    });
  }, []);

  // Persist general settings
  const updateGeneral = useCallback((patch: Partial<typeof generalSettings>) => {
    setGeneralSettings(prev => {
      const next = { ...prev, ...patch };
      saveJSON(GENERAL_KEY, next);
      return next;
    });
  }, []);

  // Persist app icon
  const updateAppIcon = useCallback((icon: string) => {
    setAppIcon(icon);
    saveJSON(ICON_KEY, icon);
  }, []);

  // ── Account Form State (controlled) ─────────────────────

  const [accountForm, setAccountForm] = useState({
    username: '',
    email: '',
    bio: '',
    fullName: '',
    phone: '',
    instagram: '',
    facebook: '',
  });
  const [accountSaving, setAccountSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Sync account form with user data
  useEffect(() => {
    if (user) {
      setAccountForm({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        fullName: user.fullName || '',
        phone: user.phone || '',
        instagram: user.instagramUrl || '',
        facebook: user.facebookUrl || '',
      });
    }
  }, [user]);

  const handleAccountSave = async () => {
    if (!user) return;
    setAccountSaving(true);
    try {
      let avatarUrl: string | undefined;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(user.id, avatarFile);
      }

      const updatePayload: Record<string, string | null | undefined> = {
        username: accountForm.username,
        full_name: accountForm.fullName,
        bio: accountForm.bio,
        phone: accountForm.phone || null,
        instagram_url: accountForm.instagram.trim().replace(/^@/, '') || null,
        facebook_url: accountForm.facebook.trim() || null,
      };
      if (avatarUrl) updatePayload.avatar_url = avatarUrl;

      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Greška');

      setAvatarFile(null);
      setAvatarPreview(null);
      await refreshProfile();
      showToast('Profil uspješno ažuriran!');
      setStep('main');
    } catch {
      showToast('Greška pri spremanju profila.', 'error');
    } finally {
      setAccountSaving(false);
    }
  };

  // ── Password Change ─────────────────────────────────────

  const [pwShowForm, setPwShowForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');

  const handleChangePassword = async () => {
    setPwError('');
    if (!user?.email) return;
    if (pwForm.newPw.length < 6) { setPwError('Lozinka mora imati min. 6 znakova.'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Lozinke se ne podudaraju.'); return; }
    setPwSaving(true);
    try {
      const { error: signInErr } = await getSupabase().auth.signInWithPassword({ email: user.email, password: pwForm.current });
      if (signInErr) { setPwError('Trenutna lozinka nije ispravna.'); setPwSaving(false); return; }
      const { error } = await getSupabase().auth.updateUser({ password: pwForm.newPw });
      if (error) throw error;
      showToast('Lozinka uspješno promijenjena!');
      setPwShowForm(false);
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch {
      setPwError('Greška pri promjeni lozinke.');
    } finally {
      setPwSaving(false);
    }
  };

  // ── Session Info ─────────────────────────────────────────

  const [sessionLastSignIn, setSessionLastSignIn] = useState<string | null>(null);

  useEffect(() => {
    if (step !== 'security') return;
    getSupabase().auth.getSession().then(({ data: { session } }) => {
      const raw = session?.user?.last_sign_in_at;
      if (raw) {
        const d = new Date(raw);
        setSessionLastSignIn(d.toLocaleString('hr', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
      }
    });
  }, [step]);

  // ── Cache Clear ─────────────────────────────────────────

  const handleClearCache = () => {
    if (typeof window === 'undefined') return;
    const keysToKeep = ['supabase.auth.token', 'sb-'];
    const allKeys = Object.keys(localStorage);
    let cleared = 0;
    allKeys.forEach(key => {
      if (!keysToKeep.some(k => key.startsWith(k))) {
        localStorage.removeItem(key);
        cleared++;
      }
    });
    showToast(`Cache očišćen (${cleared} stavki)`);
  };

  // ── Delete Account ──────────────────────────────────────

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      // Mark profile as deleted (soft delete)
      await getSupabase()
        .from('profiles')
        .update({ username: '[deleted]', bio: null, avatar_url: null, full_name: '[Izbrisani Korisnik]' })
        .eq('id', user.id);
      await logout();
      showToast('Račun je uspješno obrisan.');
      router.push('/');
    } catch {
      showToast('Greška pri brisanju računa.', 'error');
    }
  };

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

  // ══════════════════════════════════════════════════════════
  // SUB-PAGES
  // ══════════════════════════════════════════════════════════

  // ── Main Settings ────────────────────────────────────────

  if (step === 'main-settings') {
    return (
      <MainLayout title={t('menu.mainSettings')} showSigurnost={false} onBack={() => setStep('main')}>
          <div className="max-w-2xl mx-auto pt-2 pb-24 space-y-6">

              {/* Header Card — Light theme friendly */}
              <div className="bg-blue-500/5 border border-blue-500/15 rounded-[22px] p-6 mb-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[30px]"></div>
                  <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                          <i className="fa-solid fa-sliders text-xl"></i>
                      </div>
                      <div>
                          <h3 className="text-lg font-black text-[var(--c-text)]">{t('menu.systemSettings')}</h3>
                          <p className="text-[11px] text-[var(--c-text3)]">{t('menu.customizeApp')}</p>
                      </div>
                  </div>
              </div>

              <section>
                  <h2 className="text-[11px] font-black uppercase tracking-[2px] text-[var(--c-text3)] mb-3 px-2">{t('menu.general')}</h2>
                  <ToggleRow
                      label={t('menu.autoLocation')}
                      desc={t('menu.autoLocationDesc')}
                      isOn={generalSettings.location}
                      onToggle={() => updateGeneral({ location: !generalSettings.location })}
                  />
                  <ToggleRow
                      label={t('menu.dataSaver')}
                      desc={t('menu.dataSaverDesc')}
                      isOn={generalSettings.dataSaver}
                      onToggle={() => updateGeneral({ dataSaver: !generalSettings.dataSaver })}
                  />
                  <ToggleRow
                      label={t('menu.autoPlayVideo')}
                      desc={t('menu.autoPlayVideoDesc')}
                      isOn={generalSettings.autoPlay}
                      onToggle={() => updateGeneral({ autoPlay: !generalSettings.autoPlay })}
                  />
              </section>

              <section>
                  <h2 className="text-[11px] font-black uppercase tracking-[2px] text-[var(--c-text3)] mb-3 px-2">{t('menu.regionalSettings')}</h2>
                  <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] p-1">
                      <div className="w-full text-left p-4 flex justify-between items-center border-b border-[var(--c-border)]">
                          <div>
                            <span className="text-sm font-bold text-[var(--c-text)] block">{t('menu.country')}</span>
                            <span className="text-[10px] text-[var(--c-text3)]">Bosna i Hercegovina</span>
                          </div>
                          <span className="text-[10px] text-[var(--c-text3)]">🇧🇦</span>
                      </div>
                      <div className="w-full text-left p-4 flex justify-between items-center">
                          <div>
                            <span className="text-sm font-bold text-[var(--c-text)] block">{t('menu.currency')}</span>
                            <span className="text-[10px] text-[var(--c-text3)]">EUR (€) / BAM (KM)</span>
                          </div>
                          <span className="text-[10px] text-[var(--c-text3)]">€ / KM</span>
                      </div>
                  </div>
              </section>

              <section>
                   <h2 className="text-[11px] font-black uppercase tracking-[2px] text-[var(--c-text3)] mb-3 px-2">{t('menu.system')}</h2>
                   <div className="space-y-3">
                       <button
                         onClick={handleClearCache}
                         className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] p-4 text-left flex items-center justify-between text-red-400 font-bold text-sm active:bg-red-500/10 transition-colors"
                       >
                           {t('menu.clearCache')}
                           <i className="fa-solid fa-trash-can"></i>
                       </button>

                       <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] p-4 flex justify-between items-center">
                            <span className="text-sm font-bold text-[var(--c-text)]">{t('menu.appVersion')}</span>
                            <span className="text-[10px] font-mono text-[var(--c-text3)] bg-[var(--c-hover)] px-2 py-1 rounded-md">v2.4.0 (Beta)</span>
                       </div>
                   </div>
              </section>
          </div>
      </MainLayout>
    );
  }

  // ── Appearance & Theme ──────────────────────────────────

  if (step === 'appearance') {
      return (
        <MainLayout title={t('menu.appearance')} showSigurnost={false} onBack={() => setStep('main')}>
            <div className="max-w-2xl mx-auto pt-2 pb-24">
                <AppSettings />
            </div>
        </MainLayout>
      );
  }

  // ── Notifications ───────────────────────────────────────

  if (step === 'notifications') {
      return (
        <MainLayout title={t('menu.notifications')} showSigurnost={false} onBack={() => setStep('main')}>
            <div className="max-w-2xl mx-auto pt-2 pb-24 space-y-6">
                <section>
                    <h2 className="text-[11px] font-black uppercase tracking-[2px] text-[var(--c-text3)] mb-3 px-2">{t('menu.directMessages')}</h2>
                    <ToggleRow
                        label={t('menu.newMessages')}
                        desc={t('menu.newMessagesDesc')}
                        isOn={notifSettings.messages}
                        onToggle={() => updateNotif({ messages: !notifSettings.messages })}
                    />
                </section>

                <section>
                    <h2 className="text-[11px] font-black uppercase tracking-[2px] text-[var(--c-text3)] mb-3 px-2">{t('menu.myInterests')}</h2>
                    <ToggleRow
                        label={t('menu.savedSearches')}
                        desc={t('menu.savedSearchesDesc')}
                        isOn={notifSettings.search}
                        onToggle={() => updateNotif({ search: !notifSettings.search })}
                    />
                    <ToggleRow
                        label={t('menu.priceDrops')}
                        desc={t('menu.priceDropsDesc')}
                        isOn={notifSettings.priceDrops}
                        onToggle={() => updateNotif({ priceDrops: !notifSettings.priceDrops })}
                    />
                </section>

                <section>
                    <h2 className="text-[11px] font-black uppercase tracking-[2px] text-[var(--c-text3)] mb-3 px-2">NudiNađi</h2>
                    <ToggleRow
                        label={t('menu.newsPromo')}
                        desc={t('menu.newsPromoDesc')}
                        isOn={notifSettings.promotions}
                        onToggle={() => updateNotif({ promotions: !notifSettings.promotions })}
                    />
                </section>

                {user && (
                  <section>
                    <h2 className="text-[11px] font-black uppercase tracking-[2px] text-[var(--c-text3)] mb-3 px-2">Email</h2>
                    <EmailNotificationSettings user={user} />
                  </section>
                )}
            </div>
        </MainLayout>
      );
  }

  // ── Language ────────────────────────────────────────────

  if (step === 'language') {
      return (
        <MainLayout title={t('menu.language')} showSigurnost={false} onBack={() => setStep('main')}>
             <div className="max-w-2xl mx-auto pt-2 pb-24">                 <LanguageSettings />             </div>
        </MainLayout>
      );
  }

  // ── Account / Personal Data ────────────────────────────

  if (step === 'account') {
      return (
        <MainLayout title={t('menu.personalInfo')} showSigurnost={false} onBack={() => setStep('main')} headerRight={
          <button
            onClick={handleAccountSave}
            disabled={accountSaving}
            className="text-blue-400 hover:text-blue-500 font-bold text-xs uppercase disabled:opacity-50"
          >
            {accountSaving ? <i className="fa-solid fa-spinner animate-spin"></i> : t('menu.save')}
          </button>
        }>
            <div className="max-w-2xl mx-auto pt-2 pb-24 space-y-4">
                {/* Avatar */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-[var(--c-card-alt)] overflow-hidden border-2 border-[var(--c-border2)]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={avatarPreview || user?.avatarUrl || '/default-avatar.svg'} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarPick} className="hidden" />
                        <button onClick={() => avatarInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white border-2 border-[var(--c-bg)]">
                            <i className="fa-solid fa-camera text-xs"></i>
                        </button>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] p-4 space-y-4">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--c-text3)] block mb-1">{t('menu.username')}</label>
                        <input
                          type="text"
                          value={accountForm.username}
                          onChange={(e) => setAccountForm(prev => ({ ...prev, username: e.target.value }))}
                          className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border2)] rounded-lg p-3 text-sm text-[var(--c-text)] focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--c-text3)] block mb-1">{t('menu.fullName')}</label>
                        <input
                          type="text"
                          value={accountForm.fullName}
                          onChange={(e) => setAccountForm(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Vaše puno ime"
                          className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border2)] rounded-lg p-3 text-sm text-[var(--c-text)] focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--c-text3)] block mb-1">{t('menu.email')}</label>
                        <input
                          type="email"
                          value={accountForm.email}
                          disabled
                          className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border2)] rounded-lg p-3 text-sm text-[var(--c-text3)] outline-none cursor-not-allowed"
                        />
                        <p className="text-[9px] text-[var(--c-text-muted)] mt-1 px-1">Email se ne može mijenjati direktno.</p>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--c-text3)] block mb-1">
                          <i className="fa-solid fa-phone mr-1"></i> Telefon
                        </label>
                        <input
                          type="tel"
                          value={accountForm.phone}
                          onChange={(e) => setAccountForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+387 6x xxx xxx"
                          className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border2)] rounded-lg p-3 text-sm text-[var(--c-text)] focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--c-text3)] block mb-1">{t('menu.bio')}</label>
                        <textarea
                          rows={3}
                          value={accountForm.bio}
                          onChange={(e) => setAccountForm(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Kratki opis o sebi..."
                          className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border2)] rounded-lg p-3 text-sm text-[var(--c-text)] focus:border-blue-500 outline-none resize-none"
                        />
                    </div>

                    {/* Social Media Links */}
                    <div className="pt-2 border-t border-[var(--c-border)]">
                      <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em] mb-3">{t('menu.socialMedia')}</p>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-[var(--c-text3)] block mb-1">
                            <i className="fa-brands fa-instagram mr-1"></i> Instagram
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] text-[var(--c-text3)]">@</span>
                            <input
                              type="text"
                              value={accountForm.instagram}
                              onChange={(e) => setAccountForm(prev => ({ ...prev, instagram: e.target.value.replace('@', '') }))}
                              placeholder="username"
                              className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border2)] rounded-lg p-3 pl-8 text-sm text-[var(--c-text)] focus:border-blue-500 outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-[var(--c-text3)] block mb-1">
                            <i className="fa-brands fa-facebook-f mr-1"></i> Facebook
                          </label>
                          <input
                            type="text"
                            value={accountForm.facebook}
                            onChange={(e) => setAccountForm(prev => ({ ...prev, facebook: e.target.value }))}
                            placeholder="facebook.com/username ili ime profila"
                            className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border2)] rounded-lg p-3 text-sm text-[var(--c-text)] focus:border-blue-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                </div>

            </div>
        </MainLayout>
      );
  }

  // ── Security ────────────────────────────────────────────

  if (step === 'security') {
    return (
        <MainLayout title="Sigurnost & Privatnost" showSigurnost={false} onBack={() => setStep('main')}>
            <div className="max-w-2xl mx-auto pt-2 pb-24 space-y-6">
                {/* Change Password */}
                <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] overflow-hidden">
                    <button
                      onClick={() => { setPwShowForm(v => !v); setPwError(''); }}
                      className="w-full text-left p-4 flex justify-between items-center border-b border-[var(--c-border)] hover:bg-[var(--c-hover)] transition-colors"
                    >
                        <div>
                          <span className="text-sm font-bold text-[var(--c-text)] block">{t('menu.changePassword')}</span>
                          <span className="text-[10px] text-[var(--c-text3)]">Promijeni lozinku direktno ovdje</span>
                        </div>
                        <i className={`fa-solid ${pwShowForm ? 'fa-chevron-up' : 'fa-chevron-down'} text-[var(--c-text-muted)] text-xs`}></i>
                    </button>

                    {pwShowForm && (
                      <div className="p-4 space-y-3 border-b border-[var(--c-border)]">
                        {pwError && (
                          <p className="text-[11px] text-red-400 font-bold bg-red-500/10 px-3 py-2 rounded-lg">{pwError}</p>
                        )}
                        <div>
                          <label className="text-[10px] uppercase font-bold text-[var(--c-text3)] block mb-1">Trenutna lozinka</label>
                          <input
                            type="password"
                            value={pwForm.current}
                            onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                            placeholder="••••••••"
                            className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border2)] rounded-lg p-3 text-sm text-[var(--c-text)] focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-[var(--c-text3)] block mb-1">Nova lozinka</label>
                          <input
                            type="password"
                            value={pwForm.newPw}
                            onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))}
                            placeholder="min. 6 znakova"
                            className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border2)] rounded-lg p-3 text-sm text-[var(--c-text)] focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-[var(--c-text3)] block mb-1">Potvrdi novu lozinku</label>
                          <input
                            type="password"
                            value={pwForm.confirm}
                            onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                            placeholder="••••••••"
                            className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border2)] rounded-lg p-3 text-sm text-[var(--c-text)] focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => { setPwShowForm(false); setPwError(''); setPwForm({ current: '', newPw: '', confirm: '' }); }}
                            className="flex-1 py-2.5 text-[var(--c-text2)] text-[12px] font-bold border border-[var(--c-border)] rounded-lg hover:bg-[var(--c-hover)] transition-colors"
                          >
                            Odustani
                          </button>
                          <button
                            onClick={handleChangePassword}
                            disabled={pwSaving || !pwForm.current || !pwForm.newPw || !pwForm.confirm}
                            className="flex-1 py-2.5 bg-blue-500 text-white text-[12px] font-bold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                          >
                            {pwSaving ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Spremi'}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="w-full text-left p-4 flex justify-between items-center">
                        <div>
                          <span className="text-sm font-bold text-[var(--c-text)] block">{t('menu.twoFactor')}</span>
                          <span className="text-[10px] text-[var(--c-text3)]">Dodatna zaštita za vaš račun</span>
                        </div>
                        <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded uppercase font-bold">Uskoro</span>
                    </div>
                </div>

                {/* Active Sessions */}
                <section>
                    <h2 className="text-[11px] font-black uppercase tracking-[2px] text-[var(--c-text3)] mb-3 px-2">{t('menu.activeSessions')}</h2>
                    <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-[12px] bg-[var(--c-hover)] flex items-center justify-center">
                              <i className="fa-solid fa-display text-[var(--c-text2)]"></i>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-[var(--c-text)]">Ovaj uređaj</h4>
                                <p className="text-[10px] text-[var(--c-text3)]">
                                  {sessionLastSignIn ? `Posljednja prijava: ${sessionLastSignIn}` : t('menu.currentlyActive')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          <span className="text-[9px] text-emerald-500 font-bold uppercase">Aktivan</span>
                        </div>
                    </div>
                </section>

                {/* Podaci & Privatnost */}
                <section>
                    <h2 className="text-[11px] font-black uppercase tracking-[2px] text-[var(--c-text3)] mb-3 px-2">Podaci & Privatnost</h2>
                    <div className="space-y-2">
                      <button className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] p-4 flex items-center justify-between hover:bg-[var(--c-hover)] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-[10px] bg-blue-500/10 flex items-center justify-center">
                            <i className="fa-solid fa-download text-blue-500 text-xs"></i>
                          </div>
                          <div>
                            <span className="text-[13px] font-bold text-[var(--c-text)] block">Preuzmi moje podatke</span>
                            <span className="text-[10px] text-[var(--c-text3)]">Izvoz svih podataka (GDPR)</span>
                          </div>
                        </div>
                        <i className="fa-solid fa-chevron-right text-[var(--c-text-muted)] text-[10px]"></i>
                      </button>
                      <button
                        onClick={() => setStep('blocked-users')}
                        className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] p-4 flex items-center justify-between hover:bg-[var(--c-hover)] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-[10px] bg-[var(--c-hover)] flex items-center justify-center">
                            <i className="fa-solid fa-user-slash text-[var(--c-text3)] text-xs"></i>
                          </div>
                          <div>
                            <span className="text-[13px] font-bold text-[var(--c-text)] block">{t('settings.blockedUsers')}</span>
                            <span className="text-[10px] text-[var(--c-text3)]">{t('settings.blockedUsers.desc')}</span>
                          </div>
                        </div>
                        <i className="fa-solid fa-chevron-right text-[var(--c-text-muted)] text-[10px]"></i>
                      </button>
                    </div>
                </section>

                {/* Opasna Zona */}
                <section>
                    <h2 className="text-[11px] font-black uppercase tracking-[2px] text-red-400 mb-3 px-2">Opasna Zona</h2>
                    <div className="bg-red-500/5 border border-red-500/15 rounded-[18px] p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <i className="fa-solid fa-triangle-exclamation text-red-400 mt-0.5"></i>
                        <div>
                          <h4 className="text-[13px] font-bold text-red-400">Obriši racun</h4>
                          <p className="text-[10px] text-[var(--c-text3)] mt-1 leading-relaxed">
                            Ova akcija je nepovratna. Svi oglasi, poruke i podaci ce biti trajno obrisani.
                          </p>
                        </div>
                      </div>
                      {!showDeleteConfirm ? (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="w-full py-3 text-red-400 font-bold text-[12px] border border-red-500/20 rounded-[12px] hover:bg-red-500/10 transition-colors uppercase tracking-wider"
                        >
                          Obriši moj racun
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold text-red-400 text-center">Jeste li sigurni? Ovo se ne može poništiti.</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              className="flex-1 py-2.5 text-[var(--c-text)] font-bold text-[11px] bg-[var(--c-card)] border border-[var(--c-border)] rounded-[12px] hover:bg-[var(--c-hover)] transition-colors"
                            >
                              Odustani
                            </button>
                            <button
                              onClick={handleDeleteAccount}
                              className="flex-1 py-2.5 text-white font-bold text-[11px] bg-red-500 rounded-[12px] hover:bg-red-600 transition-colors"
                            >
                              Da, obriši
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                </section>
            </div>
        </MainLayout>
    );
  }

  // ── Support / Help ─────────────────────────────────────

  if (step === 'support') {
    return (
      <MainLayout title={t('menu.support')} showSigurnost={false} onBack={() => setStep('main')}>
        <div className="max-w-2xl mx-auto pt-2 pb-24 space-y-6">

          {/* Contact Card */}
          <div className="bg-blue-500/5 border border-blue-500/15 rounded-[22px] p-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 mb-3">
              <i className="fa-solid fa-headset text-2xl"></i>
            </div>
            <h3 className="text-lg font-black text-[var(--c-text)] mb-1">Trebate pomoć?</h3>
            <p className="text-[11px] text-[var(--c-text3)] mb-4">Naš tim za podršku je dostupan 24/7</p>
            <Link href="/kontakt" className="inline-flex items-center gap-2 bg-blue-500 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-600 transition-colors">
              <i className="fa-solid fa-paper-plane text-xs"></i>
              Kontaktiraj nas
            </Link>
          </div>

          {/* FAQ Section */}
          <section>
            <h2 className="text-[11px] font-black uppercase tracking-[2px] text-[var(--c-text3)] mb-3 px-2">Česta Pitanja (FAQ)</h2>
            <div className="space-y-2">
              {[
                { q: 'Kako objaviti oglas?', a: 'Kliknite na "+" dugme, odaberite kategoriju i popunite podatke. AI će pomoći s opisom.', icon: 'fa-plus-circle' },
                { q: 'Kako kontaktirati prodavca?', a: 'Otvorite oglas i kliknite "Pošalji Poruku" ili "Telefon".', icon: 'fa-comment' },
                { q: 'Kako promijeniti lozinku?', a: 'Idite na Meni → Sigurnost → Promijeni Lozinku. Unesite trenutnu i novu lozinku.', icon: 'fa-lock' },
                { q: 'Kako izbrisati oglas?', a: 'Otvorite svoj oglas i kliknite na tri točke → Obriši.', icon: 'fa-trash' },
                { q: 'Kako funkcioniše AI pretraga?', a: 'Upišite šta tražite prirodnim jezikom. AI razumije sinonime i ispravlja greške.', icon: 'fa-wand-magic-sparkles' },
              ].map((faq, i) => (
                <details key={i} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] group">
                  <summary className="p-4 cursor-pointer flex items-center gap-3 list-none">
                    <div className="w-8 h-8 rounded-[10px] bg-[var(--c-hover)] flex items-center justify-center shrink-0">
                      <i className={`fa-solid ${faq.icon} text-[var(--c-text3)] text-xs`}></i>
                    </div>
                    <span className="text-[13px] font-bold text-[var(--c-text)] flex-1">{faq.q}</span>
                    <i className="fa-solid fa-chevron-down text-[10px] text-[var(--c-text-muted)] group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div className="px-4 pb-4 pt-0 ml-11">
                    <p className="text-[12px] text-[var(--c-text3)] leading-relaxed">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Legal Links */}
          <section>
            <h2 className="text-[11px] font-black uppercase tracking-[2px] text-[var(--c-text3)] mb-3 px-2">Pravne Informacije</h2>
            <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] p-1">
              <Link href="/uvjeti" className="w-full text-left p-4 flex justify-between items-center border-b border-[var(--c-border)] hover:bg-[var(--c-hover)] transition-colors rounded-t-[16px]">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-file-lines text-[var(--c-text3)]"></i>
                  <span className="text-sm font-bold text-[var(--c-text)]">{t('menu.terms')}</span>
                </div>
                <i className="fa-solid fa-chevron-right text-[var(--c-text-muted)] text-xs"></i>
              </Link>
              <Link href="/privatnost" className="w-full text-left p-4 flex justify-between items-center border-b border-[var(--c-border)] hover:bg-[var(--c-hover)] transition-colors">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-shield-halved text-[var(--c-text3)]"></i>
                  <span className="text-sm font-bold text-[var(--c-text)]">Politika Privatnosti</span>
                </div>
                <i className="fa-solid fa-chevron-right text-[var(--c-text-muted)] text-xs"></i>
              </Link>
              <Link href="/kolacici" className="w-full text-left p-4 flex justify-between items-center hover:bg-[var(--c-hover)] transition-colors rounded-b-[16px]">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-cookie text-[var(--c-text3)]"></i>
                  <span className="text-sm font-bold text-[var(--c-text)]">Cookie Politika</span>
                </div>
                <i className="fa-solid fa-chevron-right text-[var(--c-text-muted)] text-xs"></i>
              </Link>
            </div>
          </section>

          {/* App Info */}
          <div className="text-center py-4 space-y-1">
            <p className="text-[10px] text-[var(--c-text-muted)] font-bold">NudiNađi Marketplace v2.4.0 (Beta)</p>
            <p className="text-[9px] text-[var(--c-text-muted)]">© 2024-2026 NudiNađi. Sva prava zadržana.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ── Verification ───────────────────────────────────────

  if (step === 'verification') {
    return <VerificationStep onBack={() => setStep('main')} user={user} refreshProfile={refreshProfile} showToast={showToast} t={t} />;
  }

  // ── Blocked Users ─────────────────────────────────────────
  if (step === 'blocked-users') {
    return <BlockedUsersStep onBack={() => setStep('security')} userId={user?.id} t={t} showToast={showToast} />;
  }

    // MAIN MENU
  // ══════════════════════════════════════════════════════════

  return (
    <MainLayout title={t('menu.title')} showSigurnost={false}>
      <div className="max-w-2xl mx-auto mt-2 space-y-4 pb-24">
        {/* User Quick Info */}
        <Link href="/planovi" className="bg-blue-500/5 border border-blue-500/10 rounded-[22px] p-5 mb-3 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-full blue-gradient flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <i className="fa-solid fa-star"></i>
            </div>
            <div className="flex-1">
                <h3 className="text-[15px] font-bold text-[var(--c-text)]">{t('menu.plusMembership')}</h3>
                <p className="text-[11px] text-[var(--c-text3)] leading-tight">{t('menu.plusDesc')}</p>
            </div>
            <i className="fa-solid fa-chevron-right text-[10px] text-[var(--c-text-muted)] group-hover:text-[var(--c-text2)] transition-colors"></i>
        </Link>
        <Link href="/krediti" className="bg-amber-500/5 border border-amber-500/10 rounded-[22px] p-5 mb-6 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
                <i className="fa-solid fa-coins"></i>
            </div>
            <div className="flex-1">
                <h3 className="text-[15px] font-bold text-[var(--c-text)]">Moji krediti</h3>
                <p className="text-[11px] text-[var(--c-text3)] leading-tight">Extra slike i istaknuti oglasi</p>
            </div>
            <i className="fa-solid fa-chevron-right text-[10px] text-[var(--c-text-muted)] group-hover:text-[var(--c-text2)] transition-colors"></i>
        </Link>

        {/* RAČUN */}
        <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-[var(--c-text-muted)] mb-3 mt-4 px-2">{t('menu.account')}</h2>
            <MenuOption label={t('menu.personalInfo')} icon="fa-user-gear" onClick={() => setStep('account')} />
            <MenuOption label={t('verify.section')} icon="fa-certificate" onClick={() => setStep('verification')} />
            <MenuOption label="Sigurnost & Privatnost" icon="fa-shield-halved" onClick={() => setStep('security')} />
        </div>

        {/* POSTAVKE */}
        <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-[var(--c-text-muted)] mb-3 mt-4 px-2">{t('menu.settings')}</h2>
            <MenuOption label="Aplikacija" icon="fa-sliders" onClick={() => setStep('main-settings')} />
            <MenuOption label={t('menu.notifications')} icon="fa-bell" onClick={() => setStep('notifications')} />
            <MenuOption label={t('menu.appearance')} icon="fa-palette" onClick={() => setStep('appearance')} />
            <MenuOption label={t('menu.language')} icon="fa-globe" onClick={() => setStep('language')} />
        </div>

        {/* POSLOVNI ALATI (only for Business users) */}
        {isBusiness(user?.accountType) && (
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-[var(--c-text-muted)] mb-3 mt-4 px-2">Poslovni alati</h2>
            <MenuOption label="Analitika" icon="fa-chart-line" onClick={() => router.push('/analytics')} />
            <MenuOption label="Masovno objavljivanje" icon="fa-layer-group" onClick={() => router.push('/bulk-upload')} />
          </div>
        )}

        {/* PODRŠKA */}
        <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-[var(--c-text-muted)] mb-3 mt-4 px-2">{t('menu.support')}</h2>
            <MenuOption label={t('menu.help')} icon="fa-circle-question" badge="24/7" onClick={() => setStep('support')} />
        </div>

        {/* LOGOUT */}
        {isAuthenticated ? (
          <button
            onClick={() => { logout(); showToast(t('menu.loggedOut')); router.push('/'); }}
            className="w-full mt-6 py-4 text-red-400 font-bold text-[13px] bg-red-400/5 border border-red-400/10 rounded-[18px] hover:bg-red-400/10 transition-colors"
          >
            {t('menu.logout')}
          </button>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="w-full mt-6 py-4 text-blue-400 font-bold text-[13px] bg-blue-400/5 border border-blue-400/10 rounded-[18px] hover:bg-blue-400/10 transition-colors"
          >
            {t('menu.login')}
          </button>
        )}
      </div>
    </MainLayout>
  );
}
