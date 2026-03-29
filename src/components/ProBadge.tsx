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
      <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-[3px] border border-amber-400/60 text-amber-600 bg-amber-50 leading-none tracking-wide">
        <i className="fa-solid fa-building text-[7px]"></i>
        BIZ
      </span>
    );
  }

  return null;
}
