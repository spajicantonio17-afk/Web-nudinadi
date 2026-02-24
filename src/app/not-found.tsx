import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--c-bg)] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="text-center space-y-6 z-10 animate-[fadeIn_0.3s_ease-out]">
        {/* 404 Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[24px] flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/20">
          <i className="fa-solid fa-ghost text-3xl"></i>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-6xl font-black text-[var(--c-text)] tracking-tighter mb-2">404</h1>
          <h2 className="text-lg font-bold text-[var(--c-text2)]">Stranica nije pronađena</h2>
          <p className="text-sm text-[var(--c-text3)] mt-2 max-w-xs mx-auto">
            Stranica koju tražiš ne postoji ili je premještena.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="px-6 py-3.5 rounded-[20px] blue-gradient text-white font-black text-xs uppercase tracking-[2px] shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-house"></i>
            Početna
          </Link>
          <Link
            href="/"
            className="px-6 py-3.5 rounded-[20px] bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] font-bold text-xs uppercase tracking-wider hover:bg-[var(--c-hover)] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <i className="fa-solid fa-magnifying-glass"></i>
            Pretraži oglase
          </Link>
        </div>
      </div>
    </div>
  );
}
