'use client';

import React from 'react';

interface LogoProps {
  variant?: 'icon' | 'full';
  size?: number;
  className?: string;
}

/** Modern NudiNađi logo with gradient background and bold N */
export function Logo({ variant = 'icon', size = 40, className = '' }: LogoProps) {
  if (variant === 'full') {
    return <LogoFull size={size} className={className} />;
  }
  return <LogoIcon size={size} className={className} />;
}

function LogoIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={`transition-transform duration-300 hover:scale-105 ${className}`}
      role="img"
      aria-label="NudiNađi Logo"
    >
      <defs>
        <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="45%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
        <radialGradient id="logo-glow" cx="30%" cy="25%" r="60%">
          <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
        </radialGradient>
        <clipPath id="logo-clip">
          <rect width="512" height="512" rx="112" />
        </clipPath>
      </defs>

      {/* Background */}
      <rect width="512" height="512" rx="112" fill="url(#logo-bg)" />
      <rect
        width="512"
        height="512"
        rx="112"
        fill="url(#logo-glow)"
        clipPath="url(#logo-clip)"
      />

      {/* Bold N */}
      <g fill="white">
        <rect x="120" y="126" width="56" height="260" rx="14" />
        <rect x="336" y="126" width="56" height="260" rx="14" />
        <polygon points="120,126 176,126 392,386 336,386" />
        {/* Exchange arrows */}
        <polygon points="148,102 128,126 168,126" opacity="0.9" />
        <polygon points="364,410 344,386 384,386" opacity="0.9" />
      </g>
    </svg>
  );
}

function LogoFull({ size, className }: { size: number; className: string }) {
  const width = (size / 120) * 460;

  return (
    <div
      className={`inline-flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02] ${className}`}
      role="img"
      aria-label="NudiNađi"
    >
      {/* Icon */}
      <LogoIcon size={size} className="" />

      {/* Wordmark */}
      <div className="flex flex-col">
        <span
          className="font-extrabold tracking-tight leading-none"
          style={{ fontSize: size * 0.45 }}
        >
          <span className="text-[#0F172A] dark:text-white">nudi</span>
          <span className="text-[#2563EB] dark:text-[#60A5FA]" style={{ fontWeight: 900 }}>
            nađi
          </span>
        </span>
        <span
          className="text-[#64748B] dark:text-[#94A3B8] font-medium uppercase tracking-[0.2em] leading-none mt-1"
          style={{ fontSize: size * 0.1 }}
        >
          Kupuj &amp; Prodaj
        </span>
      </div>
    </div>
  );
}

export default Logo;
