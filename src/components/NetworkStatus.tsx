'use client';

import { useState, useEffect } from 'react';

export default function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    // Check initial state
    if (!navigator.onLine) setIsOffline(true);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[300] flex items-center justify-center gap-2 px-4 py-2.5 text-white text-[11px] font-bold transition-all animate-[fadeIn_0.2s_ease-out] ${
      isOffline ? 'bg-red-500' : 'bg-emerald-500'
    }`}>
      {isOffline ? (
        <>
          <i className="fa-solid fa-wifi-slash"></i>
          <span>Nema internet veze — podaci možda nisu ažurni</span>
        </>
      ) : (
        <>
          <i className="fa-solid fa-wifi"></i>
          <span>Veza ponovo uspostavljena</span>
        </>
      )}
    </div>
  );
}
