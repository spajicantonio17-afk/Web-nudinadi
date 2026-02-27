'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/lib/auth';
import { xpForNextLevel, LEVEL_THRESHOLDS } from '@/lib/database.types';

const XP_ACTIONS = [
  { icon: 'fa-plus', label: 'Novi Oglas', desc: 'Za svaki objavljen artikal', xp: 10, color: 'blue' },
  { icon: 'fa-star', label: 'Dojam / Review', desc: 'Od 5 do 25 XP zavisno od ocjene', xp: '5-25', color: 'yellow' },
  { icon: 'fa-handshake', label: 'Uspješna Prodaja', desc: 'Kupac potvrdi transakciju', xp: 50, color: 'emerald' },
  { icon: 'fa-clock', label: 'Dnevna Prijava', desc: 'Svakodnevni bonus', xp: 5, color: 'cyan', iconStyle: 'fa-regular' },
  { icon: 'fa-shield-halved', label: 'Verifikacija', desc: 'Email + telefon potvrđeni (jednokratno)', xp: 500, color: 'red' },
];

const COLOR_MAP: Record<string, string> = {
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 hover:border-blue-500/30',
  yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20 hover:border-yellow-500/30',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 hover:border-purple-500/30',
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/30',
  cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/30',
  red: 'text-red-400 bg-red-500/10 border-red-500/20 hover:border-red-500/30',
};

function getLevelTitle(level: number): string {
  if (level <= 2) return 'Početnik';
  if (level <= 5) return 'Napredni Korisnik';
  if (level <= 8) return 'Iskusni Prodavač';
  return 'Ekspert';
}

export default function LevelSystemPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) return null;

  const currentLevel = user?.level || 1;
  const totalXp = user?.xp || 0;
  const xpInfo = xpForNextLevel(totalXp);
  const progress = xpInfo.progress;
  const maxLevel = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].level;
  const isMaxLevel = currentLevel >= maxLevel;

  return (
    <MainLayout
      title="Level Sistem"
      showSigurnost={false}
    >
      <div className="pt-4 pb-24 px-0 md:px-0 max-w-2xl mx-auto">

        {/* HERO SECTION */}
        <div className="relative mb-8 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-32 h-32 mb-4 relative flex items-center justify-center">
              {/* Circular XP Gauge */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[var(--c-card)]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  strokeDasharray={`${progress}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>

              {/* Inner Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-widest">Level</span>
                <span className="text-4xl font-black text-[var(--c-text)] leading-none">{currentLevel}</span>
              </div>
            </div>

            <h1 className="text-2xl font-black text-[var(--c-text)] uppercase tracking-tight mb-1">{getLevelTitle(currentLevel)}</h1>
            {isMaxLevel ? (
              <p className="text-xs text-emerald-400 font-bold mb-4">
                Maksimalni level dostignut! <span className="text-[var(--c-text2)] font-medium">({totalXp} ukupno XP)</span>
              </p>
            ) : (
              <p className="text-xs text-[var(--c-text2)] font-medium mb-4">
                Još <span className="text-[var(--c-text)] font-bold">{xpInfo.needed - xpInfo.current} XP</span> do Levela {currentLevel + 1}
              </p>
            )}

            {/* Progress Bar */}
            <div className="w-full max-w-xs bg-[var(--c-card)] rounded-sm h-3 border border-[var(--c-border2)] overflow-hidden relative">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 to-amber-600 rounded-sm shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between w-full max-w-xs mt-2 text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest">
              <span>{xpInfo.current} XP</span>
              <span>{isMaxLevel ? 'MAX' : `${xpInfo.needed} XP`}</span>
            </div>
          </div>
        </div>

        {/* SYSTEM EXPLANATION */}
        <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl"></div>
          <h2 className="text-sm font-bold text-[var(--c-text)] uppercase tracking-widest mb-3 flex items-center gap-2">
            <i className="fa-solid fa-layer-group text-blue-500"></i> Kako sistem radi?
          </h2>
          <p className="text-xs text-[var(--c-text2)] leading-relaxed mb-4">
            Level sistem je dizajniran da nagradi aktivne i pouzdane korisnike.
            Sistem ide do <span className="text-[var(--c-text)] font-bold">Levela {maxLevel}</span>.
            Što je veći level, teže je napredovati, jer svaki novi nivo zahtijeva više XP bodova.
          </p>
          <div className="flex gap-2">
            {[
              { range: '1-2', label: 'Početnik', active: currentLevel >= 1 && currentLevel <= 2 },
              { range: '3-5', label: 'Napredni', active: currentLevel >= 3 && currentLevel <= 5 },
              { range: '6-8', label: 'Iskusni', active: currentLevel >= 6 && currentLevel <= 8 },
              { range: '9-10', label: 'Ekspert', active: currentLevel >= 9 },
            ].map(tier => (
              <div
                key={tier.range}
                className={`flex-1 rounded-[10px] p-3 border flex flex-col items-center justify-center text-center ${
                  tier.active
                    ? 'bg-gradient-to-br from-blue-900/20 to-blue-600/20 border-blue-500/30'
                    : 'bg-[var(--c-card-alt)] border-[var(--c-border)]'
                }`}
              >
                <span className={`text-lg font-black ${tier.active ? 'text-blue-400' : 'text-[var(--c-text)]'}`}>{tier.range}</span>
                <span className={`text-[8px] uppercase tracking-wider ${tier.active ? 'text-blue-300' : 'text-[var(--c-text3)]'}`}>{tier.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* EARN XP GRID */}
        <h2 className="text-[11px] font-black uppercase tracking-[2px] text-[var(--c-text3)] mb-4 px-2">Kako zaraditi XP?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {XP_ACTIONS.map((action) => {
            const colors = COLOR_MAP[action.color];
            const [textColor, bgColor, borderColor, hoverBorder] = colors.split(' ');
            return (
              <div
                key={action.label}
                className={`bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 flex items-center justify-between group ${hoverBorder} transition-colors`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-[10px] ${bgColor} flex items-center justify-center ${textColor} border ${borderColor}`}>
                    <i className={`${action.iconStyle || 'fa-solid'} ${action.icon}`}></i>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[var(--c-text)]">{action.label}</h3>
                    <p className="text-[9px] text-[var(--c-text3)]">{action.desc}</p>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-[8px]">+{action.xp} XP</span>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
