'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { VehicleType } from '@/lib/vehicle-models';

interface AiModelVerifierProps {
  open: boolean;
  userInput: string;
  suggestedBrand: string;
  suggestedModel: string;
  suggestedVariant?: string;
  vehicleType: VehicleType;
  confidence: number;
  onConfirm: (brand: string, model: string, variant?: string) => void;
  onReject: () => void;
  onClose: () => void;
}

const vehicleIcons: Record<string, string> = {
  car: 'fa-car', motorcycle: 'fa-motorcycle', bicycle: 'fa-bicycle',
  truck: 'fa-truck', camper: 'fa-caravan', boat: 'fa-ship',
  atv: 'fa-flag-checkered', parts: 'fa-gears',
};

export default function AiModelVerifier({
  open, userInput, suggestedBrand, suggestedModel, suggestedVariant,
  vehicleType, confidence, onConfirm, onReject, onClose,
}: AiModelVerifierProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() => setAnimating(true));
    } else {
      setAnimating(false);
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  }, [onClose]);

  if (!visible) return null;

  const confidenceColor = confidence > 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : confidence > 60 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    : 'text-red-400 bg-red-500/10 border-red-500/20';

  const icon = vehicleIcons[vehicleType] || 'fa-car';

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center transition-all duration-300 ${
        animating ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
      }`}
    >
      <div
        className={`relative w-full sm:max-w-[440px] max-h-[60vh] sm:max-h-none bg-[var(--c-card)] border border-[var(--c-border)] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-transform duration-300 ease-out ${
          animating ? 'translate-y-0' : 'translate-y-full sm:translate-y-8 sm:opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--c-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <i className="fa-solid fa-wand-magic-sparkles text-sm"></i>
            </div>
            <div>
              <h2 className="text-sm font-black text-[var(--c-text)]">AI Prepoznavanje</h2>
              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[9px] font-bold ${confidenceColor}`}>
                <i className="fa-solid fa-chart-simple text-[8px]"></i>
                {confidence}% siguran
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-5 space-y-5">
          {/* User input */}
          <div>
            <p className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest mb-1">Tvoj unos</p>
            <p className="text-sm text-[var(--c-text2)] font-medium">&quot;{userInput}&quot;</p>
          </div>

          {/* Suggested match */}
          <div>
            <p className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest mb-2">Da li si mislio/la na:</p>
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-xl p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <i className={`fa-solid ${icon} text-2xl`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-black text-[var(--c-text)] leading-tight">{suggestedBrand} {suggestedModel}</p>
                {suggestedVariant && (
                  <span className="inline-block mt-1 text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">
                    {suggestedVariant}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Low confidence warning */}
          {confidence < 60 && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2.5">
              <i className="fa-solid fa-triangle-exclamation text-amber-400 text-xs mt-0.5"></i>
              <p className="text-[10px] text-amber-400 font-medium">Nisam siguran — provjeri podatke prije potvrde.</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onReject}
              className="flex-1 py-3.5 rounded-xl bg-[var(--c-hover)] border border-[var(--c-border)] text-sm font-bold text-[var(--c-text2)] transition-all hover:bg-[var(--c-active)] active:scale-[0.98]"
            >
              <i className="fa-solid fa-xmark text-xs mr-2 opacity-60"></i>
              Ne, biraj ručno
            </button>
            <button
              onClick={() => onConfirm(suggestedBrand, suggestedModel, suggestedVariant)}
              className="flex-1 py-3.5 rounded-xl bg-blue-600 text-white text-sm font-bold transition-all hover:bg-blue-500 active:scale-[0.98] shadow-lg shadow-blue-500/20"
            >
              <i className="fa-solid fa-check text-xs mr-2"></i>
              Da, to je to
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
