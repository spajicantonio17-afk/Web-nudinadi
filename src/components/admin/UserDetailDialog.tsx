'use client';

import React, { useState, useEffect } from 'react';
import { getUserWarnings, getUserBans, warnUser, banUser, unbanUser, logAction } from '@/services/moderationService';
import type { Profile, UserWarning, UserBan } from '@/lib/database.types';

interface Props {
  user: Profile;
  onClose: () => void;
}

export default function UserDetailDialog({ user, onClose }: Props) {
  const [warnings, setWarnings] = useState<UserWarning[]>([]);
  const [bans, setBans] = useState<UserBan[]>([]);
  const [tab, setTab] = useState<'info' | 'warnings' | 'bans'>('info');
  const [showWarnForm, setShowWarnForm] = useState(false);
  const [showBanForm, setShowBanForm] = useState(false);
  const [warnReason, setWarnReason] = useState('');
  const [warnSeverity, setWarnSeverity] = useState(1);
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    getUserWarnings(user.id).then(setWarnings);
    getUserBans(user.id).then(setBans);
  }, [user.id]);

  const activeBan = bans.find(b => b.is_active);

  const handleWarn = async () => {
    if (!warnReason.trim()) return;
    await warnUser(user.id, 'admin_01', warnReason, warnSeverity);
    await logAction({ admin_id: 'admin_01', action_type: 'warn', target_user_id: user.id, reason: warnReason });
    setShowWarnForm(false);
    setWarnReason('');
    getUserWarnings(user.id).then(setWarnings);
  };

  const handleBan = async () => {
    if (!banReason.trim()) return;
    await banUser(user.id, 'admin_01', banReason);
    await logAction({ admin_id: 'admin_01', action_type: 'ban', target_user_id: user.id, reason: banReason });
    setShowBanForm(false);
    setBanReason('');
    getUserBans(user.id).then(setBans);
  };

  const handleUnban = async (banId: string) => {
    await unbanUser(banId, 'admin_01');
    await logAction({ admin_id: 'admin_01', action_type: 'unban', target_user_id: user.id });
    getUserBans(user.id).then(setBans);
  };

  const tabs = [
    { key: 'info', label: 'Profil', icon: 'fa-user' },
    { key: 'warnings', label: `Upozorenja (${warnings.length})`, icon: 'fa-triangle-exclamation' },
    { key: 'bans', label: `Blokade (${bans.length})`, icon: 'fa-ban' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--c-card)] rounded-2xl shadow-xl border border-[var(--c-border)] max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--c-border)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--c-text)]">@{user.username}</h2>
              <div className="text-sm text-[var(--c-text2)]">{user.full_name || '—'} · {user.location || 'Nepoznato'}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text2)]">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--c-border)]">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                tab === t.key ? 'text-blue-600 border-b-2 border-blue-600' : 'text-[var(--c-text2)] hover:text-[var(--c-text)]'
              }`}
            >
              <i className={`fa-solid ${t.icon} mr-1.5`} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Profile Info */}
          {tab === 'info' && (
            <div className="space-y-4">
              {activeBan && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                  <i className="fa-solid fa-ban mr-1.5" />
                  <strong>Blokiran</strong> — {activeBan.reason}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-[var(--c-card-alt)] rounded-xl p-3">
                  <div className="text-[var(--c-text2)] text-xs mb-1">Level / XP</div>
                  <div className="font-semibold text-[var(--c-text)]">{user.level} · {user.xp} XP</div>
                </div>
                <div className="bg-[var(--c-card-alt)] rounded-xl p-3">
                  <div className="text-[var(--c-text2)] text-xs mb-1">Ocjena</div>
                  <div className="font-semibold text-[var(--c-text)]">
                    {user.rating_average ? `${user.rating_average.toFixed(1)} / 5` : '—'}
                  </div>
                </div>
                <div className="bg-[var(--c-card-alt)] rounded-xl p-3">
                  <div className="text-[var(--c-text2)] text-xs mb-1">Prodaje / Kupovine</div>
                  <div className="font-semibold text-[var(--c-text)]">{user.total_sales} / {user.total_purchases}</div>
                </div>
                <div className="bg-[var(--c-card-alt)] rounded-xl p-3">
                  <div className="text-[var(--c-text2)] text-xs mb-1">Član od</div>
                  <div className="font-semibold text-[var(--c-text)]">
                    {new Date(user.created_at).toLocaleDateString('bs', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
              {user.bio && (
                <div>
                  <div className="text-xs text-[var(--c-text2)] mb-1">Bio:</div>
                  <p className="text-sm text-[var(--c-text)] bg-[var(--c-card-alt)] rounded-lg p-3">{user.bio}</p>
                </div>
              )}
              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowWarnForm(true)}
                  className="flex-1 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <i className="fa-solid fa-triangle-exclamation mr-1.5" /> Upozori
                </button>
                {activeBan ? (
                  <button
                    onClick={() => handleUnban(activeBan.id)}
                    className="flex-1 py-2.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <i className="fa-solid fa-unlock mr-1.5" /> Deblokiraj
                  </button>
                ) : (
                  <button
                    onClick={() => setShowBanForm(true)}
                    className="flex-1 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <i className="fa-solid fa-ban mr-1.5" /> Blokiraj
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Warnings */}
          {tab === 'warnings' && (
            <div className="space-y-3">
              {warnings.length === 0 ? (
                <div className="text-center py-8 text-[var(--c-text-muted)]">Nema upozorenja</div>
              ) : (
                warnings.map(w => (
                  <div key={w.id} className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        w.severity === 3 ? 'bg-red-100 text-red-700' : w.severity === 2 ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        Ozbiljnost: {w.severity}/3
                      </span>
                      <span className="text-xs text-[var(--c-text-muted)]">
                        {new Date(w.created_at).toLocaleDateString('bs', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--c-text)]">{w.reason}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Bans */}
          {tab === 'bans' && (
            <div className="space-y-3">
              {bans.length === 0 ? (
                <div className="text-center py-8 text-[var(--c-text-muted)]">Nema blokada</div>
              ) : (
                bans.map(b => (
                  <div key={b.id} className={`rounded-xl p-3 border ${b.is_active ? 'bg-red-50 border-red-200' : 'bg-[var(--c-card-alt)] border-[var(--c-border)]'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${b.is_active ? 'bg-red-100 text-red-700' : 'bg-[var(--c-card-alt)] text-[var(--c-text2)]'}`}>
                        {b.is_active ? 'Aktivna' : 'Istekla'}
                      </span>
                      <span className="text-xs text-[var(--c-text-muted)]">
                        {new Date(b.banned_at).toLocaleDateString('bs', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--c-text)]">{b.reason}</p>
                    {b.is_active && (
                      <button
                        onClick={() => handleUnban(b.id)}
                        className="mt-2 text-xs text-green-600 hover:text-green-700 font-medium"
                      >
                        <i className="fa-solid fa-unlock mr-1" /> Deblokiraj
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Warn Form */}
        {showWarnForm && (
          <div className="border-t border-[var(--c-border)] p-5 space-y-3">
            <h4 className="text-sm font-semibold text-[var(--c-text)]">
              <i className="fa-solid fa-triangle-exclamation text-amber-500 mr-1.5" />
              Upozori korisnika
            </h4>
            <textarea
              value={warnReason}
              onChange={e => setWarnReason(e.target.value)}
              placeholder="Razlog upozorenja..."
              className="w-full text-sm border border-[var(--c-border)] rounded-lg p-3 bg-[var(--c-input)] text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              rows={2}
            />
            <div className="flex items-center gap-3">
              <label className="text-sm text-[var(--c-text2)]">Ozbiljnost:</label>
              {[1, 2, 3].map(s => (
                <button
                  key={s}
                  onClick={() => setWarnSeverity(s)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium ${
                    warnSeverity === s
                      ? s === 3 ? 'bg-red-500 text-white' : s === 2 ? 'bg-orange-500 text-white' : 'bg-amber-500 text-white'
                      : 'bg-[var(--c-card-alt)] text-[var(--c-text2)]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleWarn} className="flex-1 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600">
                Pošalji upozorenje
              </button>
              <button onClick={() => setShowWarnForm(false)} className="px-4 py-2 text-sm text-[var(--c-text2)] hover:text-[var(--c-text)]">
                Otkaži
              </button>
            </div>
          </div>
        )}

        {/* Ban Form */}
        {showBanForm && (
          <div className="border-t border-[var(--c-border)] p-5 space-y-3">
            <h4 className="text-sm font-semibold text-[var(--c-text)]">
              <i className="fa-solid fa-ban text-red-500 mr-1.5" />
              Blokiraj korisnika
            </h4>
            <textarea
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
              placeholder="Razlog blokade..."
              className="w-full text-sm border border-[var(--c-border)] rounded-lg p-3 bg-[var(--c-input)] text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows={2}
            />
            <div className="flex gap-2">
              <button onClick={handleBan} className="flex-1 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600">
                Blokiraj permanentno
              </button>
              <button onClick={() => setShowBanForm(false)} className="px-4 py-2 text-sm text-[var(--c-text2)] hover:text-[var(--c-text)]">
                Otkaži
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
