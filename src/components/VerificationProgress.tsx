'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getVerificationStatus, type VerificationStatus } from '@/services/verificationService';
import type { Profile } from '@/lib/database.types';
import type { AuthUser } from '@/lib/auth';
import { logVerificationXp } from '@/services/levelService';
import { useToast } from '@/components/Toast';
import { getSupabase } from '@/lib/supabase';

interface VerificationProgressProps {
  profile?: Profile;
  authUser?: AuthUser;
  compact?: boolean;
}

function authUserToProfileFields(u: AuthUser): Pick<Profile, 'email_verified'> {
  return {
    email_verified: u.emailVerified,
  };
}

export default function VerificationProgress({ profile, authUser, compact = false }: VerificationProgressProps) {
  const profileData = profile || (authUser ? { ...authUserToProfileFields(authUser) } as Profile : null);
  if (!profileData) return null;
  const status = getVerificationStatus(profileData);

  if (compact) {
    return <VerificationCompact status={status} isFullyVerified={status.isFullyVerified} />;
  }

  return <VerificationFull status={status} userId={authUser?.id} />;
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
        Verifikacija: {status.currentStep}/2
      </span>
    </div>
  );
}

// ─── Full Progress Card (for profile page) ──────────────────

function VerificationFull({ status, userId }: { status: VerificationStatus; userId?: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const progress = (status.currentStep / status.totalSteps) * 100;
  const [collected, setCollected] = useState(false);
  const [collecting, setCollecting] = useState(false);

  // Check if XP was already collected (persist across page reloads)
  useEffect(() => {
    if (!userId) return;

    const checkAlreadyCollected = async () => {
      try {
        const supabase = getSupabase();
        const { data } = await supabase
          .from('user_activities')
          .select('id')
          .eq('user_id', userId)
          .eq('activity_type', 'verification')
          .maybeSingle();

        if (data) {
          setCollected(true);
        }
      } catch {
        // Non-critical — if check fails, just show the button
      }
    };

    checkAlreadyCollected();
  }, [userId]);

  // Hide the card entirely if XP was already collected
  if (collected) return null;

  const handleCollectXp = async () => {
    if (!userId || collecting) return;
    setCollecting(true);
    try {
      await logVerificationXp(userId);
      showToast('+500 XP!');
      setCollected(true);
    } catch {
      showToast('Greska pri dodavanju XP-a');
    } finally {
      setCollecting(false);
    }
  };

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
              {status.currentStep}/2 koraka zavrseno
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
            onClick={!step.completed && step.step > 1 ? () => router.push('/menu?step=verification') : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-[10px] transition-colors ${
              step.completed
                ? 'bg-emerald-500/5 border border-emerald-500/10'
                : step.step > 1
                  ? 'bg-[var(--c-hover)] border border-transparent hover:border-orange-500/30 hover:bg-orange-500/5 cursor-pointer group'
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
            {!step.completed && step.step > 1 ? (
              <i className="fa-solid fa-chevron-right text-[9px] text-[var(--c-text3)] group-hover:text-orange-400 transition-colors"></i>
            ) : (
              <i className={`fa-solid ${step.icon} text-[10px] ${
                step.completed ? 'text-emerald-400' : 'text-[var(--c-text3)]'
              }`}></i>
            )}
          </div>
        ))}
      </div>

      {/* Collect 500 XP Button — shown only when fully verified & not yet collected */}
      {status.isFullyVerified && !collected && (
        <button
          onClick={handleCollectXp}
          disabled={collecting}
          className="w-full mt-4 py-3 rounded-[14px] bg-gradient-to-r from-emerald-500 to-emerald-400 text-white text-[11px] font-black uppercase tracking-widest hover:from-emerald-600 hover:to-emerald-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {collecting ? (
            <i className="fa-solid fa-spinner animate-spin"></i>
          ) : (
            <>
              <i className="fa-solid fa-gift"></i>
              500 XP einsammeln
            </>
          )}
        </button>
      )}
    </div>
  );
}
