'use client';

import React from 'react';
import { getVerificationStatus, type VerificationStatus } from '@/services/verificationService';
import type { Profile } from '@/lib/database.types';
import type { AuthUser } from '@/lib/auth';

interface VerificationProgressProps {
  profile?: Profile;
  authUser?: AuthUser;
  compact?: boolean;
}

function authUserToProfileFields(u: AuthUser): Pick<Profile, 'email_verified' | 'phone_verified' | 'location' | 'bio'> {
  return {
    email_verified: u.emailVerified,
    phone_verified: u.phoneVerified,
    location: u.location || null,
    bio: u.bio || null,
  };
}

export default function VerificationProgress({ profile, authUser, compact = false }: VerificationProgressProps) {
  const profileData = profile || (authUser ? { ...authUserToProfileFields(authUser) } as Profile : null);
  if (!profileData) return null;
  const status = getVerificationStatus(profileData);

  if (compact) {
    return <VerificationCompact status={status} isFullyVerified={status.isFullyVerified} />;
  }

  return <VerificationFull status={status} />;
}

// ─── Compact Badge (for profile header) ─────────────────────

function VerificationCompact({ status, isFullyVerified }: { status: VerificationStatus; isFullyVerified: boolean }) {
  if (isFullyVerified) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
        <i className="fa-solid fa-circle-check text-emerald-400 text-[10px]"></i>
        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Verificiran</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)]">
      <i className="fa-solid fa-shield-halved text-[var(--c-text3)] text-[10px]"></i>
      <span className="text-[10px] font-bold text-[var(--c-text2)]">
        Verifikacija: {status.currentStep}/5
      </span>
    </div>
  );
}

// ─── Full Progress Card (for profile page) ──────────────────

function VerificationFull({ status }: { status: VerificationStatus }) {
  const progress = (status.currentStep / status.totalSteps) * 100;

  return (
    <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-4 relative overflow-hidden">
      {/* Glow effect for fully verified */}
      {status.isFullyVerified && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            status.isFullyVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[var(--c-hover)] text-[var(--c-text2)]'
          }`}>
            <i className={`fa-solid ${status.isFullyVerified ? 'fa-circle-check' : 'fa-shield-halved'} text-sm`}></i>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--c-text)]">
              {status.isFullyVerified ? 'Potpuno verificiran!' : 'Verifikacija'}
            </h3>
            <p className="text-[9px] text-[var(--c-text3)]">
              {status.currentStep}/{status.totalSteps} koraka zavrseno
            </p>
          </div>
        </div>

        {status.isFullyVerified && (
          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
            +500 XP
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[var(--c-hover)] rounded-full h-2 mb-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            status.isFullyVerified
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
              : 'bg-gradient-to-r from-blue-500 to-cyan-400'
          }`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {status.steps.map((step) => (
          <div
            key={step.step}
            className={`flex items-center gap-3 px-3 py-2 rounded-[10px] transition-colors ${
              step.completed
                ? 'bg-emerald-500/5 border border-emerald-500/10'
                : 'bg-[var(--c-hover)] border border-transparent'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
              step.completed
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-[var(--c-card)] text-[var(--c-text3)] border border-[var(--c-border)]'
            }`}>
              {step.completed ? (
                <i className="fa-solid fa-check text-[9px]"></i>
              ) : (
                <span className="text-[9px] font-bold">{step.step}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className={`text-[11px] font-bold ${step.completed ? 'text-emerald-400' : 'text-[var(--c-text2)]'}`}>
                {step.label}
              </span>
              {!step.completed && (
                <p className="text-[9px] text-[var(--c-text3)]">{step.description}</p>
              )}
            </div>
            <i className={`fa-solid ${step.icon} text-[10px] ${
              step.completed ? 'text-emerald-400' : 'text-[var(--c-text3)]'
            }`}></i>
          </div>
        ))}
      </div>
    </div>
  );
}
