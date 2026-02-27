'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect') || '/';
  const redirectTo = rawRedirect.startsWith('/') && !rawRedirect.includes('//') ? rawRedirect : '/';
  const { login, loginWithOAuth, resetPassword, lastError } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; auth?: string }>({});
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!formData.email.trim()) e.email = 'Email je obavezan';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Neispravan email format';
    if (!formData.password) e.password = 'Lozinka je obavezna';
    else if (formData.password.length < 6) e.password = 'Minimalno 6 znakova';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
      if (!validate()) return;
      setIsLoading(true);
      setErrors({});
      try {
        const success = await login(formData.email, formData.password);
        if (success) {
          showToast('Uspješna prijava!');
          setIsLoading(false);
          router.push(redirectTo);
        } else {
          setIsLoading(false);
          setErrors({ auth: lastError || 'Pogrešan email ili lozinka' });
        }
      } catch (err) {
        setIsLoading(false);
        setErrors({ auth: err instanceof Error ? err.message : 'Greška pri prijavi. Pokušajte ponovo.' });
      }
  };

  const handleResetPassword = async () => {
    if (!resetEmail.trim() || !/\S+@\S+\.\S+/.test(resetEmail)) {
      showToast('Unesite ispravan email', 'error');
      return;
    }
    setIsResetting(true);
    try {
      await resetPassword(resetEmail);
      setResetSent(true);
      showToast('Link za novu lozinku poslan na tvoj email!');
    } catch {
      showToast('Greška pri slanju. Pokušajte ponovo.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-5 z-10 animate-[fadeIn_0.3s_ease-out]">
            <div className="text-center mb-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img onClick={() => router.push('/')} src="/emblem.png" alt="NudiNađi" className="w-16 h-16 rounded-[20px] shadow-lg shadow-blue-500/20 mx-auto mb-6 cursor-pointer object-contain" />
                <h2 className="text-2xl font-black text-[var(--c-text)] mb-2">Dobrodošli nazad</h2>
                <p className="text-xs text-[var(--c-text3)]">Unesite podatke za pristup računu.</p>
            </div>

            <div className="space-y-3">
                <div>
                  <div className={`bg-[var(--c-card)] border rounded-[18px] p-1.5 pr-4 flex items-center gap-3 focus-within:border-blue-500/50 transition-colors group ${errors.email ? 'border-red-500/50' : 'border-[var(--c-border2)]'}`}>
                    <div className="w-10 h-10 rounded-[14px] bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text3)] group-focus-within:text-blue-500 group-focus-within:bg-blue-500/10 transition-colors">
                        <i className="fa-solid fa-envelope"></i>
                    </div>
                    <div className="flex-1">
                        <label className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-0.5">Email</label>
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
                        <label className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-0.5">Lozinka</label>
                        <input
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={e => { setFormData({...formData, password: e.target.value}); if (errors.password) setErrors({...errors, password: undefined}); }}
                            placeholder="••••••••"
                            className="w-full bg-transparent text-base text-[var(--c-text)] font-bold outline-none placeholder:text-[var(--c-placeholder)]"
                        />
                    </div>
                  </div>
                  {errors.password && <p className="text-[10px] text-red-400 mt-1 ml-3">{errors.password}</p>}
                </div>

                {/* Forgot Password Link */}
                <div className="text-right px-1">
                  <button
                    type="button"
                    onClick={() => { setShowResetPassword(true); setResetEmail(formData.email); }}
                    className="text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    Zaboravio/la lozinku?
                  </button>
                </div>
            </div>

            {/* Reset Password Inline Form */}
            {showResetPassword && (
              <div className="bg-[var(--c-card)] border border-blue-500/30 rounded-[18px] p-4 space-y-3 animate-[fadeIn_0.2s_ease-out]">
                {resetSent ? (
                  <div className="text-center space-y-2">
                    <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                      <i className="fa-solid fa-envelope-circle-check text-green-500"></i>
                    </div>
                    <p className="text-[11px] font-bold text-[var(--c-text)]">Link poslan!</p>
                    <p className="text-[10px] text-[var(--c-text3)]">Provjeri inbox na <span className="font-bold text-[var(--c-text)]">{resetEmail}</span></p>
                    <button
                      type="button"
                      onClick={() => { setShowResetPassword(false); setResetSent(false); }}
                      className="text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      Nazad na prijavu
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <i className="fa-solid fa-key text-blue-500 text-xs"></i>
                      <p className="text-[11px] font-bold text-[var(--c-text)]">Resetuj lozinku</p>
                    </div>
                    <p className="text-[10px] text-[var(--c-text3)]">Unesite email i poslat ćemo vam link za novu lozinku.</p>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="tvoj@email.com"
                      className="w-full bg-[var(--c-hover)] border border-[var(--c-border2)] rounded-[14px] px-4 py-3 text-sm text-[var(--c-text)] font-bold outline-none focus:border-blue-500/50 placeholder:text-[var(--c-placeholder)]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(false)}
                        className="flex-1 py-2.5 rounded-[14px] bg-[var(--c-hover)] border border-[var(--c-border2)] text-[10px] font-bold text-[var(--c-text3)] hover:bg-[var(--c-active)] transition-colors uppercase tracking-wider"
                      >
                        Odustani
                      </button>
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        disabled={isResetting}
                        className="flex-1 py-2.5 rounded-[14px] blue-gradient text-white text-[10px] font-black uppercase tracking-wider shadow-md shadow-blue-500/20 active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                      >
                        {isResetting ? <i className="fa-solid fa-spinner animate-spin"></i> : <><i className="fa-solid fa-paper-plane"></i> Pošalji</>}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {errors.auth && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-[14px] px-4 py-3 text-xs text-red-400">
                    <i className="fa-solid fa-circle-exclamation mr-2"></i>{errors.auth}
                </div>
            )}

            <button type="submit" disabled={isLoading} className="w-full py-4 rounded-[20px] blue-gradient text-white font-black text-xs uppercase tracking-[2px] shadow-xl shadow-blue-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2">
                {isLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : <><i className="fa-solid fa-arrow-right-to-bracket"></i> Prijavi se</>}
            </button>

            {/* OAuth Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-[var(--c-border2)]"></div>
              <span className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest">ili</span>
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
              <button
                type="button"
                onClick={() => loginWithOAuth('facebook')}
                className="flex-1 py-3.5 rounded-[18px] bg-[#1877F2] border border-[#1877F2] text-white font-bold text-[11px] hover:bg-[#166FE5] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-brands fa-facebook-f text-sm"></i>
                Facebook
              </button>
            </div>

            <div className="text-center mt-6">
                <p className="text-[10px] text-[var(--c-text3)] font-bold uppercase tracking-widest mb-3">Nemaš račun?</p>
                <button
                    type="button"
                    onClick={() => router.push('/register')}
                    className="px-6 py-3 rounded-full border border-[var(--c-border2)] text-[10px] font-bold text-[var(--c-text)] hover:bg-[var(--c-hover)] transition-colors uppercase tracking-wider"
                >
                    Registriraj se
                </button>
            </div>
             <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full text-center py-4 text-[10px] text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors uppercase tracking-widest"
            >
                Nastavi kao Gost
            </button>
        </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
