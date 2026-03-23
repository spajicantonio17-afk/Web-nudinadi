'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getMyInvitations, acceptInvitation, rejectInvitation } from '@/services/businessService';
import { useToast } from '@/components/Toast';
import type { Profile } from '@/lib/database.types';

interface Invitation {
  id: string;
  business_user_id: string;
  role: string;
  invited_at: string;
  accepted_at: string | null;
  business?: Profile;
}

interface Props {
  userId: string;
}

export default function TeamInvitations({ userId }: Props) {
  const { showToast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadInvitations = useCallback(async () => {
    try {
      const data = await getMyInvitations(userId);
      setInvitations(data as unknown as Invitation[]);
    } catch {
      // Silent — not critical
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  const handleAccept = async (id: string) => {
    setProcessingId(id);
    try {
      await acceptInvitation(id, userId);
      showToast('Poziv prihvaćen!');
      loadInvitations();
    } catch {
      showToast('Greška pri prihvatanju poziva', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await rejectInvitation(id, userId);
      showToast('Poziv odbijen');
      loadInvitations();
    } catch {
      showToast('Greška pri odbijanju poziva', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // Don't render anything if no pending invitations
  if (loading || invitations.length === 0) return null;

  return (
    <div className="bg-[var(--c-card)] border border-amber-500/20 rounded-[14px] p-5 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <i className="fa-solid fa-envelope-open text-amber-400 text-sm"></i>
        <h3 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide">Pozivi u tim</h3>
        <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">{invitations.length}</span>
      </div>

      <div className="space-y-2">
        {invitations.map(inv => (
          <div key={inv.id} className="flex items-center gap-3 p-3 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-[8px]">
            <div className="w-10 h-10 rounded-[8px] bg-[var(--c-hover)] overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={inv.business?.company_logo || inv.business?.avatar_url || `https://picsum.photos/seed/${inv.business_user_id}/100/100`}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-[var(--c-text)] truncate">
                {inv.business?.company_name || inv.business?.full_name || 'Poslovni korisnik'}
              </div>
              <div className="text-[9px] text-[var(--c-text-muted)]">
                Pozvan kao <span className="font-bold">{inv.role === 'admin' ? 'Admin' : 'Član'}</span>
                {' · '}
                {new Date(inv.invited_at).toLocaleDateString('bs-BA')}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleAccept(inv.id)}
                disabled={processingId === inv.id}
                className="px-3 py-1.5 bg-emerald-500 text-white rounded-[6px] text-[9px] font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {processingId === inv.id ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Prihvati'}
              </button>
              <button
                onClick={() => handleReject(inv.id)}
                disabled={processingId === inv.id}
                className="px-3 py-1.5 bg-[var(--c-hover)] text-[var(--c-text3)] border border-[var(--c-border)] rounded-[6px] text-[9px] font-bold hover:border-red-500/30 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                Odbij
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
