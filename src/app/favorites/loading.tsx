export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--c-bg)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-[fadeIn_0.2s_ease-out]">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-[14px] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <i className="fa-solid fa-spinner animate-spin text-lg"></i>
        </div>
        <p className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-widest">Učitavanje...</p>
      </div>
    </div>
  );
}
