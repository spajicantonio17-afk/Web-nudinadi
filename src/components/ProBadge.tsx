'use client';

interface ProBadgeProps {
  accountType: string | undefined;
}

export default function ProBadge({ accountType }: ProBadgeProps) {
  if (!accountType || accountType === 'free') return null;

  if (accountType === 'pro') {
    return (
      <span className="inline-flex items-center text-[8px] font-black uppercase px-1.5 py-0.5 rounded-[3px] bg-blue-500 text-white leading-none tracking-wide">
        PRO
      </span>
    );
  }

  if (accountType === 'business') {
    return (
      <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase px-2 py-[3px] rounded-full bg-gradient-to-r from-amber-500 to-orange-400 text-white leading-none tracking-widest shadow-sm shadow-amber-500/40">
        <i className="fa-solid fa-crown text-[6px]"></i>
        BUSINESS
      </span>
    );
  }

  return null;
}
