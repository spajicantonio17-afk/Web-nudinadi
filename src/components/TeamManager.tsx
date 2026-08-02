'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getTeamMembers, inviteTeamMember, removeTeamMember, updateTeamMemberRole, findUserByEmail } from '@/services/businessService';
import { useToast } from '@/components/Toast';
import { useI18n } from '@/lib/i18n';
import type { BusinessTeamMemberWithProfile } from '@/lib/database.types';

interface Props {
  userId: string;
}

export default function TeamManager({ userId }: Props) {
  const { showToast } = useToast();
  const { t } = useI18n();
  const [members, setMembers] = useState<BusinessTeamMemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    try {
      const data = await getTeamMembers(userId);
      setMembers(data);
    } catch {
      showToast(t('business.teamLoadError'), 'error');
    } finally {
      setLoading(false);
    }
  }, [userId, showToast, t]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const found = await findUserByEmail(inviteEmail.trim());
      if (!found) {
        showToast(t('business.userNotFound'), 'error');
        return;
      }
      if (found.id === userId) {
        showToast(t('business.cannotInviteSelf'), 'error');
        return;
      }
      await inviteTeamMember(userId, found.id, 'member');
      setInviteEmail('');
      showToast(t('business.memberInvited'));
      loadMembers();
    } catch {
      showToast(t('business.inviteError'), 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      await removeTeamMember(userId, memberId);
      showToast(t('business.memberRemoved'));
      setConfirmRemoveId(null);
      loadMembers();
    } catch {
      showToast(t('business.genericError'), 'error');
    }
  };

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'member') => {
    try {
      await updateTeamMemberRole(userId, memberId, newRole);
      loadMembers();
      showToast(t('business.roleUpdated'));
    } catch {
      showToast(t('business.roleUpdateError'), 'error');
    }
  };

  const roleBadge = (role: string) => {
    if (role === 'owner') return <span className="shrink-0 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-[3px] bg-amber-500 text-white">{t('business.owner')}</span>;
    if (role === 'admin') return <span className="shrink-0 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-[3px] bg-blue-500 text-white">{t('business.admin')}</span>;
    return <span className="shrink-0 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-[3px] bg-[var(--c-hover)] text-[var(--c-text3)] border border-[var(--c-border)]">{t('business.member')}</span>;
  };

  const statusBadge = (acceptedAt: string | null) => {
    if (acceptedAt) return <span className="shrink-0 text-[8px] font-bold text-emerald-400">{t('business.active')}</span>;
    return <span className="shrink-0 text-[8px] font-bold text-[var(--c-text-muted)]">{t('business.invited')}</span>;
  };

  return (
    <div className="bg-[var(--c-card)] border border-purple-500/20 rounded-[14px] p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <i className="fa-solid fa-users text-purple-400 text-sm"></i>
        <h3 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide">{t('business.team')}</h3>
      </div>

      {/* Invite */}
      <div className="flex gap-2">
        <input
          type="email"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          value={inviteEmail}
          onChange={e => setInviteEmail(e.target.value)}
          placeholder={t('business.invitePlaceholder')}
          className="flex-1 min-w-0 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-[8px] px-3 min-h-[44px] text-[11px] text-[var(--c-text)] placeholder-[var(--c-text-muted)] focus:outline-none focus:border-purple-500/50"
          onKeyDown={e => e.key === 'Enter' && handleInvite()}
        />
        <button
          onClick={handleInvite}
          disabled={inviting || !inviteEmail.trim()}
          className="px-4 min-h-[44px] bg-purple-500 text-white rounded-[8px] text-[10px] font-bold hover:bg-purple-600 transition-colors disabled:opacity-50 shrink-0"
        >
          {inviting ? <i className="fa-solid fa-spinner animate-spin"></i> : t('business.inviteSend')}
        </button>
      </div>

      {/* Members List */}
      {loading ? (
        <div className="py-6 text-center">
          <i className="fa-solid fa-spinner animate-spin text-[var(--c-text-muted)]"></i>
        </div>
      ) : members.length === 0 ? (
        <p className="text-[10px] text-[var(--c-text-muted)] text-center py-4">{t('business.noMembers')}</p>
      ) : (
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-3 p-3 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-[8px]">
              <div className="w-8 h-8 rounded-[8px] bg-[var(--c-hover)] overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.member?.avatar_url || `https://picsum.photos/seed/${m.member_user_id}/100/100`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                {/* Name gets its own row so the unshrinkable badges can't squeeze it to
                    zero width; badges wrap underneath on narrow screens. */}
                <span className="block text-[11px] font-bold text-[var(--c-text)] truncate">{m.member?.full_name || m.member?.username || 'Korisnik'}</span>
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  {roleBadge(m.role)}
                  {statusBadge(m.accepted_at)}
                  <span className="text-[9px] text-[var(--c-text-muted)] truncate">@{m.member?.username}</span>
                </div>
              </div>
              {m.role !== 'owner' && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <select
                    value={m.role}
                    onChange={e => handleRoleChange(m.id, e.target.value as 'admin' | 'member')}
                    className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[6px] px-1.5 min-h-[44px] text-[9px] text-[var(--c-text)] focus:outline-none"
                  >
                    <option value="admin">{t('business.admin')}</option>
                    <option value="member">{t('business.member')}</option>
                  </select>
                  {confirmRemoveId === m.id ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleRemove(m.id)} className="px-3 min-h-[44px] flex items-center bg-red-500 text-white rounded-[4px] text-[8px] font-bold">{t('common.yes')}</button>
                      <button onClick={() => setConfirmRemoveId(null)} className="px-3 min-h-[44px] flex items-center bg-[var(--c-hover)] text-[var(--c-text3)] rounded-[4px] text-[8px] font-bold border border-[var(--c-border)]">{t('common.no')}</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmRemoveId(m.id)}
                      aria-label={t('business.remove')}
                      className="relative w-7 h-7 rounded-[6px] border border-red-500/20 bg-red-500/5 flex items-center justify-center hover:bg-red-500/10 transition-colors before:absolute before:-inset-2 before:content-['']"
                    >
                      <i className="fa-solid fa-xmark text-red-400 text-[10px]"></i>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
