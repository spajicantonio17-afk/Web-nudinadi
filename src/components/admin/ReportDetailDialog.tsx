'use client';

import React, { useState } from 'react';
import { REASON_LABELS, STATUS_LABELS } from '@/lib/mock-moderation-data';
import type { ModerationReport } from '@/lib/database.types';

type ExtendedReport = ModerationReport & {
  product_title?: string;
  product_image?: string;
  reported_user_name?: string;
  reporter_name?: string;
};

interface Props {
  report: ExtendedReport;
  onClose: () => void;
  onAction: (reportId: string, action: 'approved' | 'rejected' | 'escalated', note?: string) => void;
}

export default function ReportDetailDialog({ report, onClose, onAction }: Props) {
  const [note, setNote] = useState('');

  const aiResult = report.ai_moderation_result as Record<string, unknown> | null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--c-card)] rounded-2xl shadow-xl border border-[var(--c-border)] max-w-lg w-full mx-4 max-h-[65vh] sm:max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--c-border)]">
          <h2 className="text-lg font-semibold text-[var(--c-text)]">
            <i className="fa-solid fa-file-lines text-[var(--c-text-muted)] mr-2" />
            Detalji prijave
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text2)]">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Product info */}
          {report.product_title && (
            <div className="flex items-center gap-4 p-4 bg-[var(--c-card-alt)] rounded-xl">
              {report.product_image && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={report.product_image} alt="" className="w-16 h-16 rounded-xl object-cover" />
              )}
              <div>
                <div className="font-medium text-[var(--c-text)]">{report.product_title}</div>
                <div className="text-sm text-[var(--c-text2)]">
                  Korisnik: @{report.reported_user_name || '—'}
                </div>
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[var(--c-text2)]">Razlog:</span>
              <span className="ml-2 font-medium text-[var(--c-text)]">{REASON_LABELS[report.reason] || report.reason}</span>
            </div>
            <div>
              <span className="text-[var(--c-text2)]">Status:</span>
              <span className="ml-2 font-medium text-[var(--c-text)]">{STATUS_LABELS[report.status] || report.status}</span>
            </div>
            <div>
              <span className="text-[var(--c-text2)]">Prioritet:</span>
              <span className="ml-2 font-medium text-[var(--c-text)]">{report.priority}/3</span>
            </div>
            <div>
              <span className="text-[var(--c-text2)]">Prijavljeno:</span>
              <span className="ml-2 font-medium text-[var(--c-text)]">
                {new Date(report.created_at).toLocaleDateString('bs', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {report.reporter_name && (
              <div className="col-span-2">
                <span className="text-[var(--c-text2)]">Prijavio:</span>
                <span className="ml-2 font-medium text-[var(--c-text)]">@{report.reporter_name}</span>
              </div>
            )}
            {!report.reporter_id && (
              <div className="col-span-2">
                <span className="text-[var(--c-text2)]">Izvor:</span>
                <span className="ml-2 font-medium text-purple-600">
                  <i className="fa-solid fa-robot mr-1" /> AI automatski flag
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {report.description && (
            <div>
              <div className="text-sm text-[var(--c-text2)] mb-1">Opis:</div>
              <p className="text-sm text-[var(--c-text)] bg-[var(--c-card-alt)] rounded-lg p-3">{report.description}</p>
            </div>
          )}

          {/* AI Result */}
          {aiResult && (
            <div className="border border-purple-100 bg-purple-50/50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-purple-800 mb-3">
                <i className="fa-solid fa-robot mr-1" /> AI Analiza
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {aiResult.score !== undefined && (
                  <div>
                    <span className="text-purple-600">Score:</span>
                    <span className="ml-2 font-bold text-purple-900">{String(aiResult.score)}/100</span>
                  </div>
                )}
                {aiResult.level != null && (
                  <div>
                    <span className="text-purple-600">Level:</span>
                    <span className="ml-2 font-medium text-purple-900">{String(aiResult.level)}</span>
                  </div>
                )}
                {aiResult.confidence != null && (
                  <div>
                    <span className="text-purple-600">Pouzdanost:</span>
                    <span className="ml-2 font-bold text-purple-900">{String(aiResult.confidence)}%</span>
                  </div>
                )}
                {aiResult.recommendation != null && (
                  <div>
                    <span className="text-purple-600">Preporuka:</span>
                    <span className="ml-2 font-medium text-purple-900">{String(aiResult.recommendation)}</span>
                  </div>
                )}
              </div>
              {Array.isArray(aiResult.warnings) && (aiResult.warnings as string[]).length > 0 ? (
                <div className="mt-3 space-y-1">
                  {(aiResult.warnings as string[]).map((w, i) => (
                    <div key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                      <i className="fa-solid fa-triangle-exclamation mt-0.5" />
                      {w}
                    </div>
                  ))}
                </div>
              ) : null}
              {Array.isArray(aiResult.blockedReasons) && (aiResult.blockedReasons as string[]).length > 0 ? (
                <div className="mt-3 space-y-1">
                  {(aiResult.blockedReasons as string[]).map((r, i) => (
                    <div key={i} className="text-xs text-red-700 flex items-start gap-1.5">
                      <i className="fa-solid fa-ban mt-0.5" />
                      {r}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {/* Resolution Note */}
          {report.resolution_note && (
            <div>
              <div className="text-sm text-[var(--c-text2)] mb-1">Bilješka rješenja:</div>
              <p className="text-sm text-[var(--c-text)] bg-green-50 rounded-lg p-3 border border-green-100">{report.resolution_note}</p>
            </div>
          )}

          {/* Actions */}
          {(report.status === 'pending' || report.status === 'reviewing' || report.status === 'escalated') && (
            <div className="space-y-3 pt-2">
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Bilješka (opciono)..."
                className="w-full text-sm border border-[var(--c-border)] rounded-lg p-3 bg-[var(--c-input)] text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onAction(report.id, 'approved', note || undefined)}
                  className="flex-1 py-2.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                >
                  <i className="fa-solid fa-check mr-1.5" /> Odobri
                </button>
                <button
                  onClick={() => onAction(report.id, 'rejected', note || undefined)}
                  className="flex-1 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                >
                  <i className="fa-solid fa-xmark mr-1.5" /> Odbij
                </button>
                <button
                  onClick={() => onAction(report.id, 'escalated', note || undefined)}
                  className="py-2.5 px-4 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <i className="fa-solid fa-arrow-up mr-1.5" /> Eskaliraj
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
