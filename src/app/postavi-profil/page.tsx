'use client';

// ── Mandatory post-registration step ────────────────────────
// Every new account (email signup AND OAuth) lands here once. The username
// is required — signup only ever generated one (from the email local-part,
// or user_xxxxxxxx for OAuth), so this is the first time the user picks it.
// Full name and location are optional and can be filled in later.
//
// OnboardingGate redirects here while profiles.username_chosen is false.

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { getRegionsForCountry, getCitiesByRegion } from '@/lib/location';
import { markJustRegistered } from '@/lib/onboardingTour';
import StepIndicator from '@/components/onboarding/StepIndicator';
import type { Profile } from '@/lib/database.types';
import { logger } from '@/lib/logger';

type Country = 'BiH' | 'HR' | 'RS' | 'DE' | 'AT';

export default function PostaviProfilPage() {
  const { user, isLoading, refreshProfile } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameOk, setUsernameOk] = useState(false);
  const [checking, setChecking] = useState(false);

  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState<Country>('BiH');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');

  const [saving, setSaving] = useState(false);

  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bumped on every keystroke so a slow response can't overwrite a newer one.
  const reqIdRef = useRef(0);
  // Hands navigation control to handleSave — see the bookmark guard below.
  const justSavedRef = useRef(false);

  useEffect(() => () => {
    if (usernameTimer.current) clearTimeout(usernameTimer.current);
  }, []);

  // Not a dead end if bookmarked: bounce out when there's nothing to do here.
  useEffect(() => {
    if (isLoading) return;
    // handleSave owns navigation once the save is under way. Without this,
    // refreshProfile flipping usernameChosen to true re-fires this effect
    // and its replace('/') beats the save flow's replace('/profile') — the
    // user lands on the feed and the tour never starts.
    if (justSavedRef.current) return;
    if (!user) router.replace('/login');
    else if (user.usernameChosen === true) router.replace('/');
  }, [user, isLoading, router]);

  const handleUsernameChange = (val: string) => {
    setUsername(val);
    setUsernameError(null);
    setUsernameOk(false);
    setChecking(false);
    if (usernameTimer.current) clearTimeout(usernameTimer.current);

    if (!val) return;
    if (val.length < 3) { setUsernameError(t('welcome.usernameMin')); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(val)) { setUsernameError(t('welcome.usernameChars')); return; }

    setChecking(true);
    const myId = ++reqIdRef.current;
    usernameTimer.current = setTimeout(async () => {
      try {
        const res = await Promise.race([
          fetch('/api/auth/check-username', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: val }),
          }).then(r => r.json()),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 5000)
          ),
        ]);
        if (myId !== reqIdRef.current) return;
        setChecking(false);
        if (res.available) setUsernameOk(true);
        else setUsernameError(t('welcome.usernameTaken'));
      } catch {
        if (myId !== reqIdRef.current) return;
        // Fail open — the POST below re-validates server-side anyway.
        setChecking(false);
      }
    }, 600);
  };

  const canSave = Boolean(username.trim()) && !usernameError && !checking && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setUsernameError(null);
    try {
      const body: Record<string, string | null> = { username: username.trim() };
      if (fullName.trim()) body.full_name = fullName.trim();
      if (city && region) body.location = `${city}, ${region}`;

      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!res.ok) {
        setUsernameError(
          res.status === 409 ? t('welcome.usernameTaken') : (json.error || t('welcome.saveError'))
        );
        return;
      }

      // Claim navigation BEFORE the refresh: the bookmark guard re-runs on
      // the state flip that refreshProfile triggers, which happens before
      // the next line of code here.
      justSavedRef.current = true;
      // Refresh BEFORE navigating, otherwise the gate still sees
      // usernameChosen === false and bounces us right back here.
      await refreshProfile(json.profile as Profile);
      // Arm the tour at the one choke point every new account passes
      // through — email signup and OAuth alike. It survives the navigation
      // and is consumed once /profile is the active route.
      markJustRegistered();
      router.replace('/profile');
    } catch (err) {
      logger.error('[postavi-profil] Save error:', err);
      justSavedRef.current = false; // navigation never happened — re-arm the guard
      setUsernameError(t('welcome.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const regionPlaceholder = {
    BiH: t('profile.edit.selectCantonBiH'),
    HR: t('profile.edit.selectCountyHR'),
    RS: t('profile.edit.selectRegionRS'),
    DE: t('profile.edit.selectRegionDE'),
    AT: t('profile.edit.selectRegionAT'),
  }[country];

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--c-bg)] flex items-center justify-center">
        <i className="fa-solid fa-spinner animate-spin text-2xl text-blue-500"></i>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-sm space-y-6 animate-[fadeIn_0.3s_ease-out] relative z-10">
        <StepIndicator current={3} />

        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-[20px] flex items-center justify-center text-white text-2xl mx-auto mb-4">
            <i className="fa-solid fa-user-pen"></i>
          </div>
          <h2 className="text-xl font-black">{t('welcome.headline')}</h2>
          <p className="text-[11px] text-[var(--c-text2)] mt-2 leading-relaxed">
            {t('welcome.subtitle')}
          </p>
        </div>

        <div className="bg-[var(--c-card)] border border-[var(--c-border2)] rounded-[18px] p-5 space-y-4">
          {/* Username — required */}
          <div>
            <label className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em] mb-1.5 block">
              {t('welcome.usernameLabel')}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] text-[var(--c-text3)]">@</span>
              <input
                type="text"
                value={username}
                onChange={e => handleUsernameChange(e.target.value)}
                maxLength={30}
                autoFocus
                autoComplete="off"
                placeholder={t('welcome.usernamePlaceholder')}
                className={`w-full bg-[var(--c-hover)] border rounded-[4px] pl-8 pr-9 py-2.5 text-[12px] font-bold text-[var(--c-text)] placeholder-[var(--c-text-muted)] focus:outline-none transition-colors ${
                  usernameError ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--c-border)] focus:border-blue-500/50'
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px]">
                {checking && <i className="fa-solid fa-spinner animate-spin text-blue-400"></i>}
                {!checking && usernameOk && !usernameError && (
                  <i className="fa-solid fa-circle-check text-emerald-500"></i>
                )}
              </div>
            </div>

            {usernameError ? (
              <p className="text-[9px] text-red-400 mt-1.5 flex items-center gap-1">
                <i className="fa-solid fa-circle-exclamation text-[8px]"></i> {usernameError}
              </p>
            ) : usernameOk ? (
              <p className="text-[9px] text-emerald-500 mt-1.5 flex items-center gap-1">
                <i className="fa-solid fa-check text-[8px]"></i> {t('welcome.usernameFree')}
              </p>
            ) : (
              <p className="text-[9px] text-[var(--c-text3)] mt-1.5">{t('welcome.usernameHint')}</p>
            )}

            <p className="text-[9px] text-[var(--c-text3)] mt-1 opacity-70">
              {t('welcome.usernameCurrent', { username: user.username })}
            </p>
          </div>

          {/* Full name — optional */}
          <div>
            <label className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em] mb-1.5 block">
              {t('welcome.fullNameLabel')}
              <span className="ml-1.5 normal-case tracking-normal font-bold opacity-60">({t('welcome.optional')})</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              maxLength={60}
              placeholder={t('welcome.fullNamePlaceholder')}
              className="w-full bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] px-3.5 py-2.5 text-[12px] font-bold text-[var(--c-text)] placeholder-[var(--c-text-muted)] focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          {/* Location — optional */}
          <div>
            <label className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em] mb-1.5 block">
              {t('welcome.locationLabel')}
              <span className="ml-1.5 normal-case tracking-normal font-bold opacity-60">({t('welcome.optional')})</span>
            </label>

            <div className="flex flex-wrap gap-1.5 mb-2">
              {(['BiH', 'HR', 'RS', 'DE', 'AT'] as const).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setCountry(c); setRegion(''); setCity(''); }}
                  className={`px-3 py-1.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider transition-all ${
                    country === c
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-[var(--c-hover)] text-[var(--c-text3)] border border-[var(--c-border)] hover:text-[var(--c-text)]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="relative mb-2">
              <i className="fa-solid fa-map absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] text-blue-400 pointer-events-none z-10"></i>
              <select
                value={region}
                onChange={e => { setRegion(e.target.value); setCity(''); }}
                className="w-full bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] pl-9 pr-3.5 py-2.5 text-[12px] font-bold text-[var(--c-text)] focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
              >
                <option value="">{regionPlaceholder}</option>
                {getRegionsForCountry(country).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] text-[var(--c-text3)] pointer-events-none"></i>
            </div>

            {region && (
              <div className="relative">
                <i className="fa-solid fa-location-dot absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] text-blue-400 pointer-events-none z-10"></i>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] pl-9 pr-3.5 py-2.5 text-[12px] font-bold text-[var(--c-text)] focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
                >
                  <option value="">{t('profile.edit.selectCity')}</option>
                  {getCitiesByRegion(region).map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <i className="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] text-[var(--c-text3)] pointer-events-none"></i>
              </div>
            )}

            {city && region && (
              <p className="text-[9px] text-blue-400 mt-1.5 flex items-center gap-1">
                <i className="fa-solid fa-check-circle text-[8px]"></i> {city}, {region}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full py-4 rounded-[20px] blue-gradient text-white font-black text-xs uppercase tracking-[2px] shadow-xl shadow-blue-500/20 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {saving ? (
            <><i className="fa-solid fa-spinner animate-spin mr-2"></i>{t('welcome.saving')}</>
          ) : (
            t('welcome.save')
          )}
        </button>

        <p className="text-[10px] text-[var(--c-text3)] text-center leading-relaxed">
          {t('welcome.optionalNote')}
        </p>
      </div>
    </div>
  );
}
