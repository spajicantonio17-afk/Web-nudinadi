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
      <span className="inline-flex items-center text-[8px] font-black uppercase px-1.5 py-0.5 rounded-[3px] bg-amber-500 text-white leading-none tracking-wide">
        BIZ
      </span>
    );
  }

  return null;
}
