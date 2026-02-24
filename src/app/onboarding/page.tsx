'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect logged-in users to home
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--c-bg)] text-[var(--c-text)] relative font-sans select-none flex flex-col items-center justify-center p-8">

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-sm z-10 text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)] mb-8 animate-[bounce_3s_infinite]">
                <i className="fa-solid fa-rocket text-4xl text-white"></i>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 leading-none">
                Nur den<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Marketplace</span>
            </h1>
            <p className="text-[var(--c-text2)] text-sm max-w-[280px] leading-relaxed mb-12">
                Revolucija trgovine.
                <span className="text-[var(--c-text)] font-bold"> AI podrška</span>,
                munjevita pretraga i dizajn koji diše.
            </p>

            <div className="w-full space-y-4">
                <button
                    onClick={() => router.push('/login')}
                    className="w-full py-4 rounded-[24px] bg-[var(--c-text)] text-[var(--c-bg)] font-black uppercase tracking-[2px] shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-arrow-right-to-bracket"></i> Prijavi se
                </button>

                <button
                    onClick={() => router.push('/register')}
                    className="w-full py-4 rounded-[24px] bg-[var(--c-card)] border border-[var(--c-border2)] text-[var(--c-text)] font-black uppercase tracking-[2px] hover:bg-[var(--c-hover)] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-user-plus"></i> Registracija
                </button>

                <button
                    onClick={() => router.push('/')}
                    className="block w-full py-4 text-[10px] text-[var(--c-text3)] font-bold uppercase tracking-widest hover:text-[var(--c-text)] transition-colors"
                >
                    Nastavi kao Gost
                </button>
            </div>
      </div>
    </div>
  );
}
