'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('NudiNađi Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--c-bg)] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="text-center space-y-6 z-10 animate-[fadeIn_0.3s_ease-out]">
        {/* Error Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-[24px] flex items-center justify-center text-white mx-auto shadow-lg shadow-red-500/20">
          <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl font-black text-[var(--c-text)] mb-2">Nešto je pošlo po krivu</h2>
          <p className="text-sm text-[var(--c-text3)] max-w-xs mx-auto">
            Došlo je do greške. Pokušaj ponovo ili se vrati na početnu stranicu.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={reset}
            className="px-6 py-3.5 rounded-[20px] blue-gradient text-white font-black text-xs uppercase tracking-[2px] shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-rotate-right"></i>
            Pokušaj ponovo
          </button>
          <a
            href="/"
            className="px-6 py-3.5 rounded-[20px] bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] font-bold text-xs uppercase tracking-wider hover:bg-[var(--c-hover)] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <i className="fa-solid fa-house"></i>
            Početna
          </a>
        </div>
      </div>
    </div>
  );
}
