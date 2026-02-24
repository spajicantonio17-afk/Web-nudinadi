import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-[var(--c-bg)] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="text-center space-y-6 z-10 animate-[fadeIn_0.3s_ease-out]">
        {/* Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-[24px] flex items-center justify-center text-white mx-auto shadow-lg shadow-orange-500/20">
          <i className="fa-solid fa-box-open text-3xl"></i>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl font-black text-[var(--c-text)] mb-2">Oglas nije pronađen</h2>
          <p className="text-sm text-[var(--c-text3)] max-w-xs mx-auto">
            Ovaj oglas više ne postoji ili je uklonjen od strane prodavca.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="px-6 py-3.5 rounded-[20px] blue-gradient text-white font-black text-xs uppercase tracking-[2px] shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-magnifying-glass"></i>
            Pretraži oglase
          </Link>
          <Link
            href="/"
            className="px-6 py-3.5 rounded-[20px] bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] font-bold text-xs uppercase tracking-wider hover:bg-[var(--c-hover)] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <i className="fa-solid fa-house"></i>
            Početna
          </Link>
        </div>
      </div>
    </div>
  );
}
