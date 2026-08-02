'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

// Guest-only banner: shown on all pages EXCEPT homepage (/)
// Fixed position over header, centered layout
export default function GuestBanner() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  // Hide on homepage or for logged-in users
  if (isLoading || user || pathname === '/') return null;

  return (
    <div className="fixed top-14 md:top-16 left-0 right-0 z-40">
      <div className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 md:py-2.5 flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3">
        <i className="fa-solid fa-user text-xs shrink-0" />
        <span className="text-[11px] sm:text-[12px] font-semibold truncate">Gost si — Prijavi se ili napravi profil!</span>
        <Link
          href="/login"
          className="ml-2 shrink-0 px-3 min-h-[44px] flex items-center bg-white text-blue-600 rounded-[4px] text-[11px] sm:text-[12px] font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors"
        >
          Prijavi se
        </Link>
      </div>
    </div>
  );
}
