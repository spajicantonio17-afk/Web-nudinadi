'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { useI18n } from '@/lib/i18n';
import { logger } from '@/lib/logger';

// ─── OTP Code Input Component ────────────────────────────────
function OtpInput({ length = 6, onComplete }: { length?: number; onComplete: (code: string) => void }) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

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
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const next = [...values];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setValues(next);
    const focusIdx = Math.min(pasted.length, length - 1);
    refs.current[focusIdx]?.focus();
    if (pasted.length === length) onComplete(pasted);
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {values.map((v, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={v}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="w-10 h-12 rounded-[12px] bg-[var(--c-card)] border border-[var(--c-border2)] text-center text-lg font-black text-[var(--c-text)] outline-none focus:border-blue-500 transition-colors"
        />
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithOAuth, lastError, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const { t } = useI18n();
  const [formData, setFormData] = useState({
      email: '',
      password: '',
      confirmPassword: '',
      phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; auth?: string }>({});

  // Verification state
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [phoneSending, setPhoneSending] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [phoneResendCooldown, setPhoneResendCooldown] = useState(0);
  const [verifyPhone, setVerifyPhone] = useState(formData.phone);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (phoneResendCooldown <= 0) return;
    const timer = setTimeout(() => setPhoneResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phoneResendCooldown]);

  // Sync auth provider errors to local error state
  useEffect(() => {
    if (lastError && !isLoading) {
      setErrors(prev => ({ ...prev, auth: lastError }));
    }
  }, [lastError, isLoading]);

  // Auto-send email code when entering verification screen
  useEffect(() => {
    if (showVerification && !emailCodeSent && !emailSending) {
      sendCode('email');
    }
  }, [showVerification]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendCode = useCallback(async (type: 'email' | 'phone') => {
    const isSending = type === 'email' ? emailSending : phoneSending;
    if (isSending) return;

    if (type === 'email') setEmailSending(true);
    else setPhoneSending(true);
    setVerifyError(null);

    try {
      const res = await fetch('/api/verify/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyError(data.error || t('auth.sendCodeError'));
        return;
      }
      if (type === 'email') {
        setEmailCodeSent(true);
        setResendCooldown(60);
      } else {
        setPhoneCodeSent(true);
        setPhoneResendCooldown(60);
      }
    } catch {
      setVerifyError(t('auth.sendCodeError'));
    } finally {
      if (type === 'email') setEmailSending(false);
      else setPhoneSending(false);
    }
  }, [emailSending, phoneSending, t]);

  const confirmCode = useCallback(async (type: 'email' | 'phone', code: string) => {
    setVerifyError(null);
    try {
      const res = await fetch('/api/verify/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyError(data.error || t('auth.wrongCode'));
        return;
      }
      if (type === 'email') setEmailVerified(true);
      else setPhoneVerified(true);
      showToast(t('auth.verifySuccess'));
      refreshProfile();
    } catch {
      setVerifyError(t('auth.verifyError'));
    }
  }, [showToast, refreshProfile, t]);

  const validate = () => {
    const e: typeof errors = {};
    if (!formData.email.trim()) e.email = t('auth.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = t('auth.emailInvalid');
    if (!formData.password) e.password = t('auth.passwordRequired');
    else if (formData.password.length < 6) e.password = t('auth.passwordMin');
    if (!formData.confirmPassword) e.confirmPassword = t('auth.confirmPasswordRequired');
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = t('auth.passwordsMismatch');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
      if (!validate()) return;
      setIsLoading(true);
      setErrors({});
      try {
        const username = formData.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 30);
        const result = await register(formData.email, formData.password, username, formData.phone || undefined);

        if (result === 'success') {
          showToast(t('auth.registerSuccess'));
          setVerifyPhone(formData.phone);
          setShowVerification(true);
        } else if (result === 'needs_confirmation') {
          setShowVerification(true);
        } else {
          setTimeout(() => {
            setErrors(prev => prev.auth ? prev : { auth: t('auth.registerError') });
          }, 100);
        }
      } catch (err) {
        logger.error('[register] Unexpected error:', err);
        setErrors({ auth: err instanceof Error ? err.message : t('auth.registerError') });
      } finally {
        setIsLoading(false);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRegister();
  };

  const verifiedCount = emailVerified ? 1 : 0;
  const totalVerify = 1;

  // ─── Verification Screen ────────────────────────────────
  if (showVerification) {
    return (
      <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6 animate-[fadeIn_0.3s_ease-out]">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-[20px] flex items-center justify-center text-white text-2xl mx-auto mb-4">
              <i className="fa-solid fa-shield-check"></i>
            </div>
            <h2 className="text-xl font-black">{t('auth.verifyAccount')}</h2>
            <p className="text-[10px] text-[var(--c-text3)] font-bold uppercase tracking-widest mt-2">
              {verifiedCount}/{totalVerify} {t('auth.verified')}
            </p>
          </div>

          {/* Email Verification */}
          <div className={`bg-[var(--c-card)] border rounded-[18px] p-5 ${emailVerified ? 'border-green-500/30' : 'border-[var(--c-border2)]'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${emailVerified ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                <i className={`fa-solid ${emailVerified ? 'fa-check' : 'fa-envelope'}`}></i>
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-[var(--c-text)]">{t('auth.email')}</p>
                <p className="text-[10px] text-[var(--c-text2)]">
                  {emailVerified ? t('auth.codeVerified') : `${t('auth.codeSentTo')} ${formData.email}`}
                </p>
              </div>
              {emailVerified && (
                <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">
                  <i className="fa-solid fa-circle-check mr-1"></i>OK
                </span>
              )}
            </div>

            {!emailVerified && emailCodeSent && (
              <div className="space-y-3">
                <OtpInput onComplete={(code) => confirmCode('email', code)} />
                <div className="text-center">
                  {resendCooldown > 0 ? (
                    <p className="text-[10px] text-[var(--c-text3)]">{t('auth.resendIn')} {resendCooldown}s</p>
                  ) : (
                    <button
                      onClick={() => sendCode('email')}
                      disabled={emailSending}
                      className="text-[10px] text-blue-400 font-bold hover:text-blue-300 transition-colors"
                    >
                      {emailSending ? t('auth.sending') : t('auth.resend')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {verifyError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-[14px] px-4 py-3 text-xs text-red-400 text-center">
              <i className="fa-solid fa-circle-exclamation mr-2"></i>{verifyError}
            </div>
          )}

          {/* Continue Button (after successful verification) */}
          {emailVerified && (
            <button
              onClick={() => router.push('/profile')}
              className="w-full py-3 rounded-[12px] bg-[var(--c-accent)] text-white font-bold text-[14px] hover:opacity-90 transition-opacity mt-4"
            >
              Nastavi →
            </button>
          )}

          {/* Skip Button */}
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-widest hover:text-[var(--c-text)] transition-colors"
          >
            {t('auth.skip')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4 z-10 animate-[fadeIn_0.3s_ease-out]">
            <div className="text-center mb-6">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img onClick={() => router.push('/')} src="/emblem.png" alt="NudiNađi" className="w-16 h-16 rounded-[20px] shadow-lg shadow-purple-500/20 mx-auto mb-6 cursor-pointer object-contain" />
                 <h2 className="text-2xl font-black text-[var(--c-text)] mb-1">{t('auth.registration')}</h2>
                 <p className="text-xs text-[var(--c-text3)]">{t('auth.newProfile')}</p>
            </div>

            <div className="space-y-2">
                <div>
                  <div className={`bg-[var(--c-card)] border rounded-[18px] p-1.5 pr-4 flex items-center gap-3 focus-within:border-blue-500/50 transition-colors group ${errors.email ? 'border-red-500/50' : 'border-[var(--c-border2)]'}`}>
                    <div className="w-10 h-10 rounded-[14px] bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text3)] group-focus-within:text-blue-500 group-focus-within:bg-blue-500/10 transition-colors">
                          <i className="fa-solid fa-envelope"></i>
                    </div>
                    <div className="flex-1">
                        <label className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-0.5">{t('auth.email')}</label>
                        <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            inputMode="email"
                            value={formData.email}
                            onChange={e => { setFormData({...formData, email: e.target.value}); if (errors.email) setErrors({...errors, email: undefined}); }}
                            placeholder="tvoj@email.com"
                            className="w-full bg-transparent text-base text-[var(--c-text)] font-bold outline-none placeholder:text-[var(--c-placeholder)]"
                        />
                    </div>
                  </div>
                  {errors.email && <p className="text-[10px] text-red-400 mt-1 ml-3">{errors.email}</p>}
                </div>

                <div>
                  <div className={`bg-[var(--c-card)] border rounded-[18px] p-1.5 pr-4 flex items-center gap-3 focus-within:border-blue-500/50 transition-colors group ${errors.password ? 'border-red-500/50' : 'border-[var(--c-border2)]'}`}>
                    <div className="w-10 h-10 rounded-[14px] bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text3)] group-focus-within:text-blue-500 group-focus-within:bg-blue-500/10 transition-colors">
                          <i className="fa-solid fa-lock"></i>
                    </div>
                    <div className="flex-1">
                        <label className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-0.5">{t('auth.password')}</label>
                        <input
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={e => { setFormData({...formData, password: e.target.value}); if (errors.password) setErrors({...errors, password: undefined}); }}
                            placeholder="••••••••"
                            className="w-full bg-transparent text-base text-[var(--c-text)] font-bold outline-none placeholder:text-[var(--c-placeholder)]"
                        />
                    </div>
                  </div>
                  {errors.password && <p className="text-[10px] text-red-400 mt-1 ml-3">{errors.password}</p>}
                </div>

                <div>
                  <div className={`bg-[var(--c-card)] border rounded-[18px] p-1.5 pr-4 flex items-center gap-3 focus-within:border-blue-500/50 transition-colors group ${errors.confirmPassword ? 'border-red-500/50' : 'border-[var(--c-border2)]'}`}>
                    <div className="w-10 h-10 rounded-[14px] bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text3)] group-focus-within:text-blue-500 group-focus-within:bg-blue-500/10 transition-colors">
                          <i className="fa-solid fa-shield-halved"></i>
                    </div>
                    <div className="flex-1">
                        <label className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-0.5">{t('auth.confirmPassword')}</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            autoComplete="new-password"
                            value={formData.confirmPassword}
                            onChange={e => { setFormData({...formData, confirmPassword: e.target.value}); if (errors.confirmPassword) setErrors({...errors, confirmPassword: undefined}); }}
                            placeholder="••••••••"
                            className="w-full bg-transparent text-base text-[var(--c-text)] font-bold outline-none placeholder:text-[var(--c-placeholder)]"
                        />
                    </div>
                  </div>
                  {errors.confirmPassword && <p className="text-[10px] text-red-400 mt-1 ml-3">{errors.confirmPassword}</p>}
                </div>

                 <div className="bg-[var(--c-card)] border border-[var(--c-border2)] rounded-[18px] p-1.5 pr-4 flex items-center gap-3 focus-within:border-blue-500/50 transition-colors group">
                    <div className="w-10 h-10 rounded-[14px] bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text3)] group-focus-within:text-blue-500 group-focus-within:bg-blue-500/10 transition-colors">
                          <i className="fa-solid fa-phone"></i>
                    </div>
                    <div className="flex-1">
                        <label className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-0.5">{t('auth.phone')} <span className="opacity-50 lowercase">({t('auth.phoneOptional')})</span></label>
                        <input
                            type="tel"
                            name="phone"
                            autoComplete="tel"
                            inputMode="tel"
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                            placeholder="+387 6..."
                            className="w-full bg-transparent text-base text-[var(--c-text)] font-bold outline-none placeholder:text-[var(--c-placeholder)]"
                        />
                    </div>
                </div>
            </div>

            {/* Age & Terms Confirmation */}
            <div className="space-y-2.5 pt-1">
              <label
                onClick={() => setAgeConfirmed(!ageConfirmed)}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <div className={`w-5 h-5 mt-0.5 rounded-[6px] border flex items-center justify-center shrink-0 transition-all ${ageConfirmed ? 'bg-blue-500 border-blue-500 text-white' : 'border-[var(--c-border2)] bg-[var(--c-card)] group-hover:border-blue-500/50'}`}>
                  {ageConfirmed && <i className="fa-solid fa-check text-[10px]"></i>}
                </div>
                <span className="text-[11px] text-[var(--c-text2)] leading-relaxed">
                  {t('auth.confirmAge')} <strong className="text-[var(--c-text)]">{t('auth.yearsOld')}</strong>
                </span>
              </label>

              <label
                onClick={() => setTermsAccepted(!termsAccepted)}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <div className={`w-5 h-5 mt-0.5 rounded-[6px] border flex items-center justify-center shrink-0 transition-all ${termsAccepted ? 'bg-blue-500 border-blue-500 text-white' : 'border-[var(--c-border2)] bg-[var(--c-card)] group-hover:border-blue-500/50'}`}>
                  {termsAccepted && <i className="fa-solid fa-check text-[10px]"></i>}
                </div>
                <span className="text-[11px] text-[var(--c-text2)] leading-relaxed">
                  {t('auth.acceptTerms')}{' '}
                  <a href="/uvjeti" target="_blank" className="text-blue-500 underline underline-offset-2 hover:text-blue-400">
                    {t('auth.termsOfUse')}
                  </a>{' '}
                  {t('auth.and')}{' '}
                  <a href="/privatnost" target="_blank" className="text-blue-500 underline underline-offset-2 hover:text-blue-400">
                    {t('auth.privacyPolicy')}
                  </a>
                </span>
              </label>
            </div>

            {errors.auth && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-[14px] px-4 py-3 text-xs text-red-400">
                    <i className="fa-solid fa-circle-exclamation mr-2"></i>{errors.auth}
                </div>
            )}

            <button type="submit" disabled={isLoading || !ageConfirmed || !termsAccepted} className="w-full py-4 rounded-[20px] blue-gradient text-white font-black text-xs uppercase tracking-[2px] shadow-xl shadow-blue-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100">
                {isLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : <><i className="fa-solid fa-user-plus"></i> {t('auth.register')}</>}
            </button>

            {/* OAuth Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-[var(--c-border2)]"></div>
              <span className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest">{t('auth.or')}</span>
              <div className="flex-1 h-px bg-[var(--c-border2)]"></div>
            </div>

            {/* OAuth Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => loginWithOAuth('google')}
                className="flex-1 py-3.5 rounded-[18px] bg-[var(--c-card)] border border-[var(--c-border2)] text-[var(--c-text)] font-bold text-[11px] hover:bg-[var(--c-hover)] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-brands fa-google text-sm"></i>
                Google
              </button>
            </div>

            <div className="text-center mt-4">
                 <p className="text-[10px] text-[var(--c-text3)] font-bold uppercase tracking-widest mb-3">{t('auth.alreadyHaveAccount')}</p>
                 <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="px-6 py-3 rounded-full border border-[var(--c-border2)] text-[10px] font-bold text-[var(--c-text)] hover:bg-[var(--c-hover)] transition-colors uppercase tracking-wider"
                >
                    {t('auth.login')}
                </button>
            </div>
        </form>
    </div>
  );
}
