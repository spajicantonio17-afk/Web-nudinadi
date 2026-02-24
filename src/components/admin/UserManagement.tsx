'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, getUserWarnings, getUserBans, isUserBannedMock } from '@/services/moderationService';
import type { Profile } from '@/lib/database.types';
import UserDetailDialog from './UserDetailDialog';

export default function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bannedOnly, setBannedOnly] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, count } = await getAllUsers({ search: search || undefined, bannedOnly });
      setUsers(data);
      setTotal(count);
    } finally {
      setLoading(false);
    }
  }, [search, bannedOnly]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('bs', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Pretraži korisnike..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={bannedOnly}
            onChange={e => setBannedOnly(e.target.checked)}
            className="rounded"
          />
          Samo blokirani
        </label>
        <span className="text-sm text-gray-500 ml-auto">{total} korisnika</span>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-gray-400" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <i className="fa-solid fa-users text-4xl mb-3 block" />
          <p>Nema korisnika za prikaz</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="p-3 text-left">Korisnik</th>
                  <th className="p-3 text-left">Lokacija</th>
                  <th className="p-3 text-center">Level</th>
                  <th className="p-3 text-center">Prodaje</th>
                  <th className="p-3 text-center">Ocjena</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-left">Član od</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const isBanned = isUserBannedMock(user.id);
                  return (
                    <tr
                      key={user.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">@{user.username}</div>
                            <div className="text-xs text-gray-500">{user.full_name || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">{user.location || '—'}</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                          <i className="fa-solid fa-star text-[10px]" /> {user.level}
                        </span>
                      </td>
                      <td className="p-3 text-center text-gray-700">{user.total_sales}</td>
                      <td className="p-3 text-center">
                        {user.rating_average ? (
                          <span className="inline-flex items-center gap-1 text-yellow-600">
                            <i className="fa-solid fa-star text-[10px]" />
                            {user.rating_average.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {isBanned ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            <i className="fa-solid fa-ban mr-1" /> Blokiran
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Aktivan
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(user.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Detail Dialog */}
      {selectedUser && (
        <UserDetailDialog
          user={selectedUser}
          onClose={() => { setSelectedUser(null); fetchUsers(); }}
        />
      )}
    </div>
  );
}
