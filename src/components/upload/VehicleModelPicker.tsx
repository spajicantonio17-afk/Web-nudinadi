'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { findBrandModelsForType, findModelVariantsForType, type VehicleModel, type VehicleType } from '@/lib/vehicle-models';

interface VehicleModelPickerProps {
  open: boolean;
  brandName: string;
  vehicleType: VehicleType;
  onSelect: (model: string, variant?: string) => void;
  onClose: () => void;
}

type PickerStep = 'models' | 'variants' | 'custom';

const typeLabels: Record<string, string> = {
  car: 'model', motorcycle: 'motocikl', bicycle: 'bicikl',
  truck: 'vozilo', camper: 'kamper', boat: 'plovilo',
  atv: 'ATV/Quad', parts: 'vozilo',
};

export default function VehicleModelPicker({
  open,
  brandName,
  vehicleType,
  onSelect,
  onClose,
}: VehicleModelPickerProps) {
  const [step, setStep] = useState<PickerStep>('models');
  const [search, setSearch] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [customInput, setCustomInput] = useState('');
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const customRef = useRef<HTMLInputElement>(null);

  const models = findBrandModelsForType(brandName, vehicleType);
  const variants = selectedModel ? findModelVariantsForType(brandName, selectedModel, vehicleType) : [];

  // Reset on open/brand change
  useEffect(() => {
    if (open) {
      setStep('models');
      setSearch('');
      setSelectedModel('');
      setCustomInput('');
      // Animate in
      setVisible(true);
      requestAnimationFrame(() => setAnimating(true));
      // Focus search after animation
      setTimeout(() => searchRef.current?.focus(), 350);
    } else {
      setAnimating(false);
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [open, brandName]);

  // Focus custom input when switching to custom step
  useEffect(() => {
    if (step === 'custom') {
      setTimeout(() => customRef.current?.focus(), 100);
    }
  }, [step]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  }, [onClose]);

  const handleModelSelect = useCallback((model: VehicleModel) => {
    if (model.variants && model.variants.length > 0) {
      setSelectedModel(model.name);
      setStep('variants');
      setSearch('');
    } else {
      onSelect(model.name);
    }
  }, [onSelect]);

  const handleVariantSelect = useCallback((variant: string) => {
    onSelect(selectedModel, variant);
  }, [onSelect, selectedModel]);

  const handleCustomSubmit = useCallback(() => {
    const val = customInput.trim();
    if (val) {
      if (step === 'models') {
        onSelect(val);
      } else {
        onSelect(selectedModel, val);
      }
    }
  }, [customInput, step, selectedModel, onSelect]);

  // Escape key closes
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!visible) return null;

  const filteredModels = search.trim()
    ? models.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    : models;

  const filteredVariants = search.trim()
    ? variants.filter(v => v.toLowerCase().includes(search.toLowerCase()))
    : variants;

  // Header text
  const headerText = step === 'variants'
    ? `${brandName} ${selectedModel} — Varijanta`
    : step === 'custom'
      ? `${brandName} — Ručni unos`
      : `${brandName} — Odaberi ${typeLabels[vehicleType] || 'model'}`;

  const searchPlaceholder = step === 'variants'
    ? 'Pretraži varijante...'
    : 'Pretraži modele...';

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center transition-all duration-300 ${
        animating ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
      }`}
    >
      <div
        className={`relative w-full sm:max-w-[500px] max-h-[80vh] bg-[var(--c-card)] border border-[var(--c-border)] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-transform duration-300 ease-out ${
          animating ? 'translate-y-0' : 'translate-y-full sm:translate-y-8 sm:opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--c-border)] shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {step === 'variants' && (
              <button
                onClick={() => { setStep('models'); setSearch(''); setSelectedModel(''); }}
                className="w-8 h-8 rounded-lg bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text2)] hover:text-[var(--c-text)] transition-colors shrink-0"
              >
                <i className="fa-solid fa-chevron-left text-xs"></i>
              </button>
            )}
            {step === 'custom' && (
              <button
                onClick={() => { setStep('models'); setSearch(''); setCustomInput(''); }}
                className="w-8 h-8 rounded-lg bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text2)] hover:text-[var(--c-text)] transition-colors shrink-0"
              >
                <i className="fa-solid fa-chevron-left text-xs"></i>
              </button>
            )}
            <h2 className="text-sm font-black text-[var(--c-text)] truncate">{headerText}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors shrink-0 ml-2"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Search */}
        {step !== 'custom' && (
          <div className="px-4 py-3 border-b border-[var(--c-border)] shrink-0">
            <div className="flex items-center gap-2.5 bg-[var(--c-input,var(--c-hover))] border border-[var(--c-border)] rounded-xl px-3.5 py-2.5 focus-within:border-blue-500/40 transition-colors">
              <i className="fa-solid fa-magnifying-glass text-[var(--c-text3)] text-xs"></i>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm text-[var(--c-text)] outline-none placeholder:text-[var(--c-placeholder)]"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-[var(--c-text3)] hover:text-[var(--c-text)]">
                  <i className="fa-solid fa-xmark text-xs"></i>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          {/* Models Grid */}
          {step === 'models' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {filteredModels.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => handleModelSelect(m)}
                    className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-xl px-3 py-3 text-center text-sm font-bold text-[var(--c-text)] transition-all active:scale-95 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-500"
                  >
                    <span>{m.name}</span>
                    {m.variants && m.variants.length > 0 && (
                      <span className="block text-[9px] font-medium text-[var(--c-text3)] mt-0.5">
                        {m.variants.length} varijant{m.variants.length === 1 ? 'a' : m.variants.length < 5 ? 'e' : 'i'}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {filteredModels.length === 0 && search && (
                <div className="text-center py-8">
                  <p className="text-sm text-[var(--c-text3)]">Nema rezultata za &quot;{search}&quot;</p>
                  <button
                    onClick={() => { onSelect(search.trim()); }}
                    className="mt-3 text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors"
                  >
                    Koristi &quot;{search.trim()}&quot; kao model
                  </button>
                </div>
              )}

              {/* Ostalo (manual entry) — always at the bottom */}
              <button
                onClick={() => { setStep('custom'); setCustomInput(''); }}
                className="w-full mt-3 bg-[var(--c-hover)] border border-dashed border-[var(--c-border)] rounded-xl px-4 py-3.5 text-center text-sm font-bold text-[var(--c-text2)] transition-all hover:border-blue-500/40 hover:text-blue-500"
              >
                <i className="fa-solid fa-keyboard text-xs mr-2 opacity-60"></i>
                Ostalo (ručni unos)
              </button>
            </>
          )}

          {/* Variants Grid */}
          {step === 'variants' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {filteredVariants.map((v) => (
                  <button
                    key={v}
                    onClick={() => handleVariantSelect(v)}
                    className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-xl px-3 py-3 text-center text-sm font-bold text-[var(--c-text)] transition-all active:scale-95 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-500"
                  >
                    {v}
                  </button>
                ))}
              </div>

              {filteredVariants.length === 0 && search && (
                <div className="text-center py-8">
                  <p className="text-sm text-[var(--c-text3)]">Nema rezultata za &quot;{search}&quot;</p>
                  <button
                    onClick={() => { onSelect(selectedModel, search.trim()); }}
                    className="mt-3 text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors"
                  >
                    Koristi &quot;{search.trim()}&quot; kao varijantu
                  </button>
                </div>
              )}

              {/* Skip variant — select model without variant */}
              <button
                onClick={() => onSelect(selectedModel)}
                className="w-full mt-3 bg-[var(--c-hover)] border border-dashed border-[var(--c-border)] rounded-xl px-4 py-3.5 text-center text-sm font-bold text-[var(--c-text2)] transition-all hover:border-blue-500/40 hover:text-blue-500"
              >
                <i className="fa-solid fa-forward text-xs mr-2 opacity-60"></i>
                Bez varijante — samo {selectedModel}
              </button>

              {/* Custom variant */}
              <button
                onClick={() => { setStep('custom'); setCustomInput(''); }}
                className="w-full mt-2 bg-[var(--c-hover)] border border-dashed border-[var(--c-border)] rounded-xl px-4 py-3 text-center text-xs font-bold text-[var(--c-text3)] transition-all hover:border-blue-500/40 hover:text-blue-500"
              >
                <i className="fa-solid fa-keyboard text-[10px] mr-2 opacity-60"></i>
                Ručni unos varijante
              </button>
            </>
          )}

          {/* Custom Input */}
          {step === 'custom' && (
            <div className="py-4 space-y-4">
              <p className="text-xs text-[var(--c-text3)] text-center">
                {selectedModel
                  ? `Upiši varijantu za ${brandName} ${selectedModel}`
                  : `Upiši model za ${brandName}`}
              </p>
              <input
                ref={customRef}
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCustomSubmit(); }}
                placeholder={selectedModel ? 'npr. 320d xDrive...' : 'npr. Serija 3...'}
                className="w-full bg-[var(--c-input,var(--c-hover))] border border-[var(--c-border)] rounded-xl px-4 py-3.5 text-lg font-bold text-[var(--c-text)] placeholder:text-[var(--c-placeholder)] outline-none focus:border-blue-500/50 transition-colors text-center"
              />
              <button
                onClick={handleCustomSubmit}
                disabled={!customInput.trim()}
                className="w-full py-3.5 rounded-xl bg-blue-600 text-white text-sm font-bold transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
              >
                Potvrdi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
