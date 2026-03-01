import React from 'react';

type IconProps = { className?: string; size?: number };

const Icon = ({ children, size = 28, className }: IconProps & { children: React.ReactNode }) => (
  <svg
    viewBox={`0 0 ${size} ${size}`}
    fill="none"
    stroke="currentColor"
    strokeWidth={size === 28 ? 1.8 : 1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ width: '100%', height: '100%' }}
  >
    {children}
  </svg>
);

// ─── PRIMARY (viewBox 28) ────────────────────────────────

const SveIcon = (p: IconProps) => (
  <Icon {...p} size={28}>
    <rect x="3" y="3" width="9" height="9" rx="2"/>
    <rect x="16" y="3" width="9" height="9" rx="2"/>
    <rect x="3" y="16" width="9" height="9" rx="2"/>
    <rect x="16" y="16" width="9" height="9" rx="2"/>
  </Icon>
);

const VozilaIcon = (p: IconProps) => (
  <Icon {...p} size={28}>
    <path d="M4 17h20"/>
    <path d="M6 17l2-6h12l2 6"/>
    <rect x="3" y="17" width="22" height="5" rx="1.5"/>
    <circle cx="8" cy="22" r="2"/>
    <circle cx="20" cy="22" r="2"/>
  </Icon>
);

const NekretnineIcon = (p: IconProps) => (
  <Icon {...p} size={28}>
    <path d="M4 24V12l10-8 10 8v12"/>
    <path d="M4 24h20"/>
    <rect x="10" y="16" width="8" height="8"/>
    <line x1="14" y1="16" x2="14" y2="24"/>
    <line x1="10" y1="20" x2="18" y2="20"/>
  </Icon>
);

const TehnikaIcon = (p: IconProps) => (
  <Icon {...p} size={28}>
    <rect x="3" y="4" width="22" height="15" rx="2"/>
    <line x1="8" y1="23" x2="20" y2="23"/>
    <line x1="14" y1="19" x2="14" y2="23"/>
    <circle cx="14" cy="11" r="1" fill="currentColor" stroke="none"/>
  </Icon>
);

const DomIcon = (p: IconProps) => (
  <Icon {...p} size={28}>
    <path d="M3 24h22"/>
    <path d="M5 24V14"/>
    <path d="M23 24V14"/>
    <path d="M5 14h18"/>
    <path d="M5 18h18"/>
    <path d="M9 14v10"/>
    <path d="M19 14v10"/>
    <path d="M7 10l7-6 7 6"/>
  </Icon>
);

const PosloviIcon = (p: IconProps) => (
  <Icon {...p} size={28}>
    <rect x="3" y="10" width="22" height="13" rx="2"/>
    <path d="M9 10V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v3"/>
    <line x1="3" y1="16" x2="25" y2="16"/>
    <circle cx="14" cy="16" r="1.5" fill="currentColor" stroke="none"/>
  </Icon>
);

// ─── SECONDARY (viewBox 24) ──────────────────────────────

const DijeloviIcon = (p: IconProps) => (
  <Icon {...p} size={24}>
    <circle cx="12" cy="12" r="9"/>
    <circle cx="12" cy="12" r="3"/>
    <line x1="12" y1="3" x2="12" y2="9"/>
    <line x1="12" y1="15" x2="12" y2="21"/>
    <line x1="3" y1="12" x2="9" y2="12"/>
    <line x1="15" y1="12" x2="21" y2="12"/>
  </Icon>
);

const MobiteliIcon = (p: IconProps) => (
  <Icon {...p} size={24}>
    <rect x="6" y="2" width="12" height="20" rx="3"/>
    <line x1="10" y1="18" x2="14" y2="18"/>
    <line x1="6" y1="5" x2="18" y2="5"/>
    <line x1="6" y1="16" x2="18" y2="16"/>
  </Icon>
);

const RacunalaIcon = (p: IconProps) => (
  <Icon {...p} size={24}>
    <rect x="2" y="3" width="20" height="13" rx="2"/>
    <line x1="7" y1="20" x2="17" y2="20"/>
    <line x1="9" y1="16" x2="9" y2="20"/>
    <line x1="15" y1="16" x2="15" y2="20"/>
    <polyline points="7 10 10 7 13 10 17 6"/>
  </Icon>
);

const OdjecaIcon = (p: IconProps) => (
  <Icon {...p} size={24}>
    <path d="M8 2l-5 5 3 2 2-2v15h8V7l2 2 3-2-5-5"/>
    <path d="M8 2c0 2 2 4 4 4s4-2 4-4"/>
  </Icon>
);

const SportIcon = (p: IconProps) => (
  <Icon {...p} size={24}>
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 3c-2 3-2 6 0 9s2 6 0 9"/>
    <path d="M3 12c3-2 6-2 9 0s6 2 9 0"/>
  </Icon>
);

const DjecjaIcon = (p: IconProps) => (
  <Icon {...p} size={24}>
    <path d="M12 2a4 4 0 0 0-4 4h8a4 4 0 0 0-4-4z"/>
    <path d="M8 6l-3 3v4l3 1v8h8v-8l3-1V9l-3-3"/>
    <line x1="12" y1="10" x2="12" y2="12"/>
    <circle cx="12" cy="13" r="1" fill="currentColor" stroke="none"/>
  </Icon>
);

const GlazbaIcon = (p: IconProps) => (
  <Icon {...p} size={24}>
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </Icon>
);

const LiteraturaIcon = (p: IconProps) => (
  <Icon {...p} size={24}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z"/>
    <line x1="8" y1="6" x2="16" y2="6"/>
    <line x1="8" y1="10" x2="13" y2="10"/>
  </Icon>
);

const VideoigreIcon = (p: IconProps) => (
  <Icon {...p} size={24}>
    <rect x="2" y="6" width="20" height="12" rx="3"/>
    <line x1="6" y1="10" x2="6" y2="14"/>
    <line x1="4" y1="12" x2="8" y2="12"/>
    <circle cx="16" cy="10" r="1" fill="currentColor" stroke="none"/>
    <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none"/>
  </Icon>
);

const ZivotinjeIcon = (p: IconProps) => (
  <Icon {...p} size={24}>
    <path d="M10 5.5C10 4.1 8.9 3 7.5 3S5 4.1 5 5.5c0 .5.1 1 .4 1.4"/>
    <path d="M14 5.5C14 4.1 15.1 3 16.5 3S19 4.1 19 5.5c0 .5-.1 1-.4 1.4"/>
    <path d="M8 14c0 3.3 1.8 6 4 6s4-2.7 4-6c0-3.5-1.8-7-4-7s-4 3.5-4 7z"/>
    <circle cx="10" cy="12" r="0.8" fill="currentColor" stroke="none"/>
    <circle cx="14" cy="12" r="0.8" fill="currentColor" stroke="none"/>
    <path d="M11 14.5c.5.5 1.5.5 2 0"/>
  </Icon>
);

const StrojeviIcon = (p: IconProps) => (
  <Icon {...p} size={24}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </Icon>
);

const UslugeIcon = (p: IconProps) => (
  <Icon {...p} size={24}>
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    <path d="M21 21v-2a4 4 0 0 0-3-3.85"/>
  </Icon>
);

const UmjetnostIcon = (p: IconProps) => (
  <Icon {...p} size={24}>
    <circle cx="12" cy="12" r="9"/>
    <circle cx="8" cy="9" r="1.5" fill="currentColor" opacity="0.3" stroke="none"/>
    <circle cx="15" cy="8" r="1.5" fill="currentColor" opacity="0.3" stroke="none"/>
    <circle cx="16" cy="13" r="1.5" fill="currentColor" opacity="0.3" stroke="none"/>
    <circle cx="9" cy="14" r="1.5" fill="currentColor" opacity="0.3" stroke="none"/>
    <circle cx="13" cy="17" r="1.5" fill="currentColor" opacity="0.3" stroke="none"/>
    <path d="M19 12c0-1-1.5-1.5-2.5-.5L14 14c-1 1-2.5 1-3.5 0"/>
  </Icon>
);

const OstaloIcon = (p: IconProps) => (
  <Icon {...p} size={24}>
    <circle cx="12" cy="12" r="1.5"/>
    <circle cx="6" cy="12" r="1.5"/>
    <circle cx="18" cy="12" r="1.5"/>
  </Icon>
);

const HranaIcon = (p: IconProps) => (
  <Icon {...p} size={24}>
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
    <path d="M7 2v20"/>
    <path d="M21 15V2c-2.5 0-5 2-5 5v6c0 1.1.9 2 2 2h3"/>
    <path d="M18 15v7"/>
  </Icon>
);

// ─── MAPPING ─────────────────────────────────────────────

export const CATEGORY_ICONS: Record<string, React.FC<IconProps>> = {
  'kategorije': SveIcon,
  'sve':        SveIcon,
  'vozila':     VozilaIcon,
  'nekretnine': NekretnineIcon,
  'tehnika':    TehnikaIcon,
  'dom':        DomIcon,
  'poslovi':    PosloviIcon,
  'dijelovi':   DijeloviIcon,
  'mobiteli':   MobiteliIcon,
  'racunala':   RacunalaIcon,
  'odjeca':     OdjecaIcon,
  'sport':      SportIcon,
  'djeca':      DjecjaIcon,
  'glazba':     GlazbaIcon,
  'literatura': LiteraturaIcon,
  'videoigre':  VideoigreIcon,
  'zivotinje':  ZivotinjeIcon,
  'hrana':      HranaIcon,
  'strojevi':   StrojeviIcon,
  'usluge':     UslugeIcon,
  'umjetnost':  UmjetnostIcon,
  'ostalo':     OstaloIcon,
};

// ─── COLORS PER CATEGORY ────────────────────────────────

export const CATEGORY_COLORS: Record<string, { light: string; dark: string; glow: string }> = {
  'kategorije': { light: '#4b5563', dark: '#94a3b8', glow: 'rgba(148,163,184,0.08)' },
  'sve':        { light: '#4b5563', dark: '#94a3b8', glow: 'rgba(148,163,184,0.08)' },
  'vozila':     { light: '#2563eb', dark: '#60a5fa', glow: 'rgba(96,165,250,0.12)' },
  'nekretnine': { light: '#0891b2', dark: '#67e8f9', glow: 'rgba(103,232,249,0.10)' },
  'tehnika':    { light: '#4f46e5', dark: '#818cf8', glow: 'rgba(129,140,248,0.12)' },
  'dom':        { light: '#0d9488', dark: '#5eead4', glow: 'rgba(94,234,212,0.10)' },
  'poslovi':    { light: '#059669', dark: '#34d399', glow: 'rgba(52,211,153,0.10)' },
  'dijelovi':   { light: '#374151', dark: '#94a3b8', glow: 'rgba(148,163,184,0.08)' },
  'mobiteli':   { light: '#2563eb', dark: '#60a5fa', glow: 'rgba(96,165,250,0.12)' },
  'racunala':   { light: '#4f46e5', dark: '#818cf8', glow: 'rgba(129,140,248,0.10)' },
  'odjeca':     { light: '#c026d3', dark: '#f0abfc', glow: 'rgba(240,171,252,0.10)' },
  'sport':      { light: '#059669', dark: '#34d399', glow: 'rgba(52,211,153,0.10)' },
  'djeca':      { light: '#d97706', dark: '#fbbf24', glow: 'rgba(251,191,36,0.10)' },
  'glazba':     { light: '#7c3aed', dark: '#c084fc', glow: 'rgba(192,132,252,0.12)' },
  'literatura': { light: '#1e40af', dark: '#93c5fd', glow: 'rgba(147,197,253,0.10)' },
  'videoigre':  { light: '#6d28d9', dark: '#a78bfa', glow: 'rgba(167,139,250,0.12)' },
  'zivotinje':  { light: '#047857', dark: '#6ee7b7', glow: 'rgba(110,231,183,0.10)' },
  'hrana':      { light: '#ea580c', dark: '#fb923c', glow: 'rgba(251,146,60,0.10)' },
  'strojevi':   { light: '#4b5563', dark: '#cbd5e1', glow: 'rgba(203,213,225,0.08)' },
  'usluge':     { light: '#0891b2', dark: '#67e8f9', glow: 'rgba(103,232,249,0.10)' },
  'umjetnost':  { light: '#db2777', dark: '#f472b6', glow: 'rgba(244,114,182,0.12)' },
  'ostalo':     { light: '#6b7280', dark: '#9ca3af', glow: 'rgba(156,163,175,0.08)' },
};