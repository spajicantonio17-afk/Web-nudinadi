'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithOAuth, lastError } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
      email: '',
      password: '',
      confirmPassword: '',
      phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; auth?: string }>({});

  // Sync auth provider errors to local error state (React state updates are async,
  // so lastError may not be available immediately after register() returns)
  React.useEffect(() => {
    if (lastError && !isLoading) {
      setErrors(prev => ({ ...prev, auth: lastError }));
    }
  }, [lastError, isLoading]);

  const validate = () => {
    const e: typeof errors = {};
    if (!formData.email.trim()) e.email = 'Email je obavezan';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Neispravan email format';
    if (!formData.password) e.password = 'Lozinka je obavezna';
    else if (formData.password.length < 6) e.password = 'Minimalno 6 znakova';
    if (!formData.confirmPassword) e.confirmPassword = 'Potvrda lozinke je obavezna';
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Lozinke se ne podudaraju';
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
          showToast('Račun uspješno kreiran!');
          router.push('/');
        } else if (result === 'needs_confirmation') {
          setShowConfirmation(true);
        } else {
          // lastError is set by register() via React state — useEffect will sync it.
          // Set a delayed fallback in case lastError is empty (shouldn't happen)
          setTimeout(() => {
            setErrors(prev => prev.auth ? prev : { auth: 'Greška pri registraciji. Pokušajte ponovo.' });
          }, 100);
        }
      } catch (err) {
        console.error('[register] Unexpected error:', err);
        setErrors({ auth: err instanceof Error ? err.message : 'Greška pri registraciji. Pokušajte ponovo.' });
      } finally {
        setIsLoading(false);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRegister();
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-xs text-center space-y-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="w-16 h-16 bg-green-600 rounded-[20px] flex items-center justify-center text-white text-2xl mx-auto">
            <i className="fa-solid fa-envelope-circle-check"></i>
          </div>
          <h2 className="text-xl font-black">Provjeri svoj email!</h2>
          <p className="text-sm text-[var(--c-text2)]">
            Poslali smo link za potvrdu na <span className="text-[var(--c-text)] font-bold">{formData.email}</span>
          </p>
          <p className="text-xs text-[var(--c-text3)]">Klikni na link u emailu da aktiviraš račun, zatim se prijavi.</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-4 rounded-[20px] blue-gradient text-white font-black text-xs uppercase tracking-[2px] mt-4"
          >
            <i className="fa-solid fa-arrow-right-to-bracket mr-2"></i>Idi na prijavu
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
                 <h2 className="text-2xl font-black text-[var(--c-text)] mb-1">Registracija</h2>
                 <p className="text-xs text-[var(--c-text3)]">Novi profil, nove mogućnosti.</p>
            </div>

            <div className="space-y-2">
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
                        <label className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-0.5">Ponovi Lozinku</label>
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
                        <label className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-0.5">Telefon <span className="opacity-50 lowercase">(opcionalno)</span></label>
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

            {errors.auth && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-[14px] px-4 py-3 text-xs text-red-400">
                    <i className="fa-solid fa-circle-exclamation mr-2"></i>{errors.auth}
                </div>
            )}

            <button type="submit" disabled={isLoading} className="w-full py-4 rounded-[20px] blue-gradient text-white font-black text-xs uppercase tracking-[2px] shadow-xl shadow-blue-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2">
                {isLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : <><i className="fa-solid fa-user-plus"></i> Registriraj se</>}
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

            <div className="text-center mt-4">
                 <p className="text-[10px] text-[var(--c-text3)] font-bold uppercase tracking-widest mb-3">Već imaš račun?</p>
                 <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="px-6 py-3 rounded-full border border-[var(--c-border2)] text-[10px] font-bold text-[var(--c-text)] hover:bg-[var(--c-hover)] transition-colors uppercase tracking-wider"
                >
                    Prijavi se
                </button>
            </div>
        </form>
    </div>
  );
}
