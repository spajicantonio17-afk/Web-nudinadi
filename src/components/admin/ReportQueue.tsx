'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getReports, updateReportStatus, logAction, type ReportFilters } from '@/services/moderationService';
import { REASON_LABELS, STATUS_LABELS } from '@/lib/mock-moderation-data';
import type { ModerationStatus, ReportReason, ModerationReport } from '@/lib/database.types';
import ReportDetailDialog from './ReportDetailDialog';

const PRIORITY_COLORS = ['bg-gray-300', 'bg-yellow-400', 'bg-orange-500', 'bg-red-500'];
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  reviewing: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  escalated: 'bg-purple-100 text-purple-700',
};
const REASON_COLORS: Record<string, string> = {
  spam: 'bg-indigo-100 text-indigo-700',
  scam: 'bg-red-100 text-red-700',
  prohibited_content: 'bg-red-100 text-red-700',
  duplicate: 'bg-amber-100 text-amber-700',
  inappropriate: 'bg-orange-100 text-orange-700',
  fake_listing: 'bg-purple-100 text-purple-700',
  personal_info: 'bg-cyan-100 text-cyan-700',
  other: 'bg-gray-100 text-gray-700',
};

type ExtendedReport = ModerationReport & {
  product_title?: string;
  product_image?: string;
  reported_user_name?: string;
  reporter_name?: string;
};

export default function ReportQueue() {
  const [reports, setReports] = useState<ExtendedReport[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReportFilters>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedReport, setSelectedReport] = useState<ExtendedReport | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const { data, count } = await getReports(filters);
      setReports(data as ExtendedReport[]);
      setTotal(count);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleAction = async (reportId: string, action: 'approved' | 'rejected' | 'escalated', note?: string) => {
    await updateReportStatus(reportId, action, 'admin_01', note);
    await logAction({
      admin_id: 'admin_01',
      report_id: reportId,
      action_type: action === 'approved' ? 'approve' : action === 'rejected' ? 'reject' : 'escalate',
      reason: note,
    });
    fetchReports();
    setSelectedReport(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === reports.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(reports.map(r => r.id)));
    }
  };

  const bulkAction = async (action: 'approved' | 'rejected') => {
    for (const id of selectedIds) {
      await updateReportStatus(id, action, 'admin_01');
      await logAction({
        admin_id: 'admin_01',
        report_id: id,
        action_type: action === 'approved' ? 'approve' : 'reject',
      });
    }
    setSelectedIds(new Set());
    fetchReports();
  };

  function formatTime(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `Prije ${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Prije ${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `Prije ${days}d`;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.status || ''}
          onChange={e => setFilters(f => ({ ...f, status: (e.target.value || undefined) as ModerationStatus | undefined }))}
        >
          <option value="">Svi statusi</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.reason || ''}
          onChange={e => setFilters(f => ({ ...f, reason: (e.target.value || undefined) as ReportReason | undefined }))}
        >
          <option value="">Svi razlozi</option>
          {Object.entries(REASON_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.sortBy || 'created_at'}
          onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value as ReportFilters['sortBy'] }))}
        >
          <option value="created_at">Najnovije</option>
          <option value="priority">Prioritet</option>
          <option value="ai_score">AI Score</option>
        </select>
        <span className="text-sm text-gray-500 ml-auto">{total} prijava ukupno</span>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <span className="text-sm text-blue-700 font-medium">{selectedIds.size} odabrano</span>
          <button onClick={() => bulkAction('approved')} className="text-sm px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600">
            <i className="fa-solid fa-check mr-1" /> Odobri sve
          </button>
          <button onClick={() => bulkAction('rejected')} className="text-sm px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600">
            <i className="fa-solid fa-xmark mr-1" /> Odbij sve
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-sm text-gray-500 ml-auto hover:text-gray-700">
            Otkaži
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-gray-400" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <i className="fa-solid fa-shield-halved text-4xl mb-3 block" />
          <p>Nema prijava za prikaz</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="p-3 w-10">
                    <input type="checkbox" checked={selectedIds.size === reports.length && reports.length > 0} onChange={toggleAll} className="rounded" />
                  </th>
                  <th className="p-3 w-8 text-left">P</th>
                  <th className="p-3 text-left">Artikl / Korisnik</th>
                  <th className="p-3 text-left">Razlog</th>
                  <th className="p-3 text-left">AI</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Vrijeme</th>
                  <th className="p-3 w-20 text-center">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr
                    key={report.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedReport(report)}
                  >
                    <td className="p-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.has(report.id)} onChange={() => toggleSelect(report.id)} className="rounded" />
                    </td>
                    <td className="p-3">
                      <div className={`w-3 h-3 rounded-full ${PRIORITY_COLORS[report.priority]}`} title={`Prioritet ${report.priority}`} />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {report.product_image && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={report.product_image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900 truncate max-w-[200px]">
                            {report.product_title || '(Prijava korisnika)'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {report.reported_user_name ? `@${report.reported_user_name}` : '—'}
                            {report.reporter_name ? ` · Prijavio: @${report.reporter_name}` : report.reporter_id === null ? ' · AI flag' : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${REASON_COLORS[report.reason] || 'bg-gray-100 text-gray-600'}`}>
                        {REASON_LABELS[report.reason] || report.reason}
                      </span>
                    </td>
                    <td className="p-3">
                      {report.ai_score !== null && report.ai_score !== undefined ? (
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${report.ai_score >= 70 ? 'bg-green-500' : report.ai_score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${report.ai_score}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${report.ai_score >= 70 ? 'text-green-600' : report.ai_score >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                            {report.ai_score}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[report.status] || ''}`}>
                        {STATUS_LABELS[report.status] || report.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-gray-500 whitespace-nowrap">{formatTime(report.created_at)}</td>
                    <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                      {(report.status === 'pending' || report.status === 'reviewing') && (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleAction(report.id, 'approved')}
                            className="w-7 h-7 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center"
                            title="Odobri"
                          >
                            <i className="fa-solid fa-check text-xs" />
                          </button>
                          <button
                            onClick={() => handleAction(report.id, 'rejected')}
                            className="w-7 h-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center"
                            title="Odbij"
                          >
                            <i className="fa-solid fa-xmark text-xs" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      {selectedReport && (
        <ReportDetailDialog
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}
