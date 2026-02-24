'use client';

import React, { useEffect, useState } from 'react';
import { getModerationStats } from '@/services/moderationService';
import { MOCK_ACTIONS } from '@/lib/mock-moderation-data';
import { ACTION_LABELS } from '@/lib/mock-moderation-data';

interface Stats {
  pendingReports: number;
  resolvedToday: number;
  activeBans: number;
  aiFlagsToday: number;
  totalReports: number;
  reportsByReason: { reason: string; label: string; count: number; color: string }[];
  reportsOverTime: { date: string; count: number }[];
}

export default function StatsOverview() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getModerationStats().then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <i className="fa-solid fa-spinner fa-spin text-2xl text-gray-400" />
      </div>
    );
  }

  const kpis = [
    { label: 'Otvoreni prijave', value: stats.pendingReports, icon: 'fa-clock', color: 'border-l-blue-500', textColor: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Riješeno danas', value: stats.resolvedToday, icon: 'fa-check-circle', color: 'border-l-green-500', textColor: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Aktivne blokade', value: stats.activeBans, icon: 'fa-ban', color: 'border-l-red-500', textColor: 'text-red-600', bg: 'bg-red-50' },
    { label: 'AI flagovi danas', value: stats.aiFlagsToday, icon: 'fa-robot', color: 'border-l-purple-500', textColor: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const maxBarValue = Math.max(...stats.reportsByReason.map(r => r.count));
  const maxLineValue = Math.max(...stats.reportsOverTime.map(r => r.count));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`bg-white rounded-xl border border-gray-200 shadow-sm border-l-4 ${kpi.color} p-4`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <i className={`fa-solid ${kpi.icon} ${kpi.textColor}`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${kpi.textColor}`}>{kpi.value}</div>
                <div className="text-xs text-gray-500">{kpi.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart — Reports by Reason */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            <i className="fa-solid fa-chart-bar text-gray-400 mr-2" />
            Prijave po razlogu
          </h3>
          <div className="space-y-3">
            {stats.reportsByReason.map(r => (
              <div key={r.reason} className="flex items-center gap-3">
                <div className="w-24 text-xs text-gray-600 text-right truncate">{r.label}</div>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(r.count / maxBarValue) * 100}%`, backgroundColor: r.color }}
                  />
                </div>
                <div className="w-8 text-xs font-medium text-gray-700 text-right">{r.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Line Chart — Reports over Time (CSS-based) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            <i className="fa-solid fa-chart-line text-gray-400 mr-2" />
            Prijave (zadnjih 7 dana)
          </h3>
          <div className="flex items-end gap-2 h-40">
            {stats.reportsOverTime.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs font-medium text-gray-700">{d.count}</div>
                <div
                  className="w-full bg-blue-500 rounded-t-md transition-all duration-500 min-h-[4px]"
                  style={{ height: `${(d.count / maxLineValue) * 120}px` }}
                />
                <div className="text-[10px] text-gray-400">{d.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Actions Feed */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          <i className="fa-solid fa-clock-rotate-left text-gray-400 mr-2" />
          Posljednje akcije
        </h3>
        <div className="space-y-3">
          {MOCK_ACTIONS.slice(0, 5).map(action => {
            const time = new Date(action.created_at);
            const timeStr = `${time.getDate()}.${time.getMonth() + 1}. ${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
            const actionLabel = ACTION_LABELS[action.action_type] || action.action_type;
            const color = action.action_type === 'ban' ? 'text-red-600 bg-red-50' :
              action.action_type === 'warn' ? 'text-amber-600 bg-amber-50' :
              action.action_type === 'approve' ? 'text-green-600 bg-green-50' :
              action.action_type === 'reject' ? 'text-red-600 bg-red-50' :
              'text-gray-600 bg-gray-50';

            return (
              <div key={action.id} className="flex items-center gap-3 text-sm">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
                  {actionLabel}
                </span>
                <span className="text-gray-700 flex-1 truncate">{action.reason || '—'}</span>
                <span className="text-xs text-gray-400 whitespace-nowrap">{timeStr}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
