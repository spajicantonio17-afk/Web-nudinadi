'use client';

import React, { useState, useEffect } from 'react';
import { getAiLogs } from '@/services/moderationService';
import type { AiModerationLog } from '@/lib/database.types';

export default function AiModerationTab() {
  const [logs, setLogs] = useState<AiModerationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showManualCheck, setShowManualCheck] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [manualCategory, setManualCategory] = useState('');
  const [manualResult, setManualResult] = useState<Record<string, unknown> | null>(null);
  const [manualLoading, setManualLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAiLogs({ flaggedOnly }).then(setLogs).finally(() => setLoading(false));
  }, [flaggedOnly]);

  const runManualCheck = async () => {
    if (!manualTitle.trim()) return;
    setManualLoading(true);
    setManualResult(null);
    try {
      const res = await fetch('/api/ai/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'moderate',
          title: manualTitle,
          description: manualDesc || undefined,
          price: manualPrice ? parseFloat(manualPrice) : undefined,
          category: manualCategory || undefined,
        }),
      });
      const json = await res.json();
      setManualResult(json.data || json);
    } catch (err) {
      setManualResult({ error: String(err) });
    } finally {
      setManualLoading(false);
    }
  };

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getDate()}.${d.getMonth() + 1}. ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  const actionLabels: Record<string, string> = {
    moderate: 'Moderacija',
    duplicate: 'Duplikat',
    trust: 'Trust Score',
  };

  return (
    <div className="space-y-4">
      {/* Filters + Manual Check */}
      <div className="flex flex-wrap gap-3 items-center">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={flaggedOnly}
            onChange={e => setFlaggedOnly(e.target.checked)}
            className="rounded"
          />
          Samo flagovani
        </label>
        <button
          onClick={() => setShowManualCheck(!showManualCheck)}
          className="ml-auto px-4 py-2 text-sm font-medium bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          <i className="fa-solid fa-wand-magic-sparkles mr-1.5" />
          Manualna provjera
        </button>
      </div>

      {/* Manual Check Panel */}
      {showManualCheck && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-purple-900">
            <i className="fa-solid fa-robot mr-1.5" />
            AI Manualna moderacija
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={manualTitle}
              onChange={e => setManualTitle(e.target.value)}
              placeholder="Naslov oglasa *"
              className="text-sm border border-purple-200 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              value={manualCategory}
              onChange={e => setManualCategory(e.target.value)}
              placeholder="Kategorija"
              className="text-sm border border-purple-200 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              value={manualPrice}
              onChange={e => setManualPrice(e.target.value)}
              placeholder="Cijena (KM)"
              type="number"
              className="text-sm border border-purple-200 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <textarea
              value={manualDesc}
              onChange={e => setManualDesc(e.target.value)}
              placeholder="Opis oglasa"
              className="text-sm border border-purple-200 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={1}
            />
          </div>
          <button
            onClick={runManualCheck}
            disabled={manualLoading || !manualTitle.trim()}
            className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {manualLoading ? (
              <><i className="fa-solid fa-spinner fa-spin mr-1.5" /> Provjera...</>
            ) : (
              <><i className="fa-solid fa-magnifying-glass mr-1.5" /> Pokreni AI provjeru</>
            )}
          </button>
          {manualResult && (
            <div className="bg-white border border-purple-100 rounded-xl p-4 mt-2">
              <h4 className="text-xs font-semibold text-purple-600 mb-2">Rezultat:</h4>
              <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(manualResult, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* Logs Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-gray-400" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <i className="fa-solid fa-robot text-4xl mb-3 block" />
          <p>Nema AI logova za prikaz</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="p-3 text-left">Datum</th>
                  <th className="p-3 text-left">Akcija</th>
                  <th className="p-3 text-left">Input</th>
                  <th className="p-3 text-center">Score</th>
                  <th className="p-3 text-center">Flag</th>
                  <th className="p-3 text-center">Trajanje</th>
                  <th className="p-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const isExpanded = expandedId === log.id;
                  const inputTitle = (log.input_data as { title?: string })?.title || '—';
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      >
                        <td className="p-3 text-xs text-gray-500 whitespace-nowrap">{formatTime(log.created_at)}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            {actionLabels[log.action] || log.action}
                          </span>
                        </td>
                        <td className="p-3 text-gray-700 truncate max-w-[200px]">{inputTitle}</td>
                        <td className="p-3 text-center">
                          {log.score !== null && log.score !== undefined ? (
                            <span className={`text-xs font-bold ${log.score >= 70 ? 'text-green-600' : log.score >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                              {log.score}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="p-3 text-center">
                          {log.is_flagged ? (
                            <i className="fa-solid fa-flag text-red-500" />
                          ) : (
                            <i className="fa-solid fa-check text-green-500" />
                          )}
                        </td>
                        <td className="p-3 text-center text-xs text-gray-500">
                          {log.processing_time_ms ? `${log.processing_time_ms}ms` : '—'}
                        </td>
                        <td className="p-3 text-center">
                          <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} text-xs text-gray-400`} />
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="p-4 bg-gray-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-xs font-semibold text-gray-500 mb-1">Input:</h5>
                                <pre className="text-xs text-gray-700 bg-white rounded-lg p-3 border border-gray-100 overflow-x-auto whitespace-pre-wrap">
                                  {JSON.stringify(log.input_data, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <h5 className="text-xs font-semibold text-gray-500 mb-1">Rezultat:</h5>
                                <pre className="text-xs text-gray-700 bg-white rounded-lg p-3 border border-gray-100 overflow-x-auto whitespace-pre-wrap">
                                  {JSON.stringify(log.result_data, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
