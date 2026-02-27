'use client';

import React, { useState, useEffect } from 'react';

// ── Filter State Types ───────────────────────────────────────────

export interface FilterState {
  priceMin: string;
  priceMax: string;
  condition: string;
  sortBy: string;
  timePosted: string;
  delivery: string;
  sellerType: string;
  radiusKm: number;
}

export const DEFAULT_FILTERS: FilterState = {
  priceMin: '',
  priceMax: '',
  condition: 'all',
  sortBy: 'newest',
  timePosted: 'all',
  delivery: 'all',
  sellerType: 'all',
  radiusKm: 0,
};

function countActiveFilters(f: FilterState): number {
  let count = 0;
  if (f.priceMin) count++;
  if (f.priceMax) count++;
  if (f.condition !== 'all') count++;
  if (f.sortBy !== 'newest') count++;
  if (f.timePosted !== 'all') count++;
  if (f.delivery !== 'all') count++;
  if (f.sellerType !== 'all') count++;
  if (f.radiusKm > 0) count++;
  return count;
}

// ── Reusable pill-button group ───────────────────────────────────

function PillGroup<T extends string>({
  options,
  value,
  onChange,
  activeClass,
}: {
  options: { value: T; label: string; icon: string }[];
  value: T;
  onChange: (v: T) => void;
  activeClass: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-[4px] text-[12px] font-semibold transition-all duration-150 active:scale-95 border ${
            value === opt.value
              ? activeClass
              : 'bg-[var(--c-card-alt)] text-[var(--c-text2)] border-[var(--c-border)] hover:border-[var(--c-active)] hover:text-[var(--c-text)]'
          }`}
        >
          <i className={`fa-solid ${opt.icon} text-[11px]`}></i>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Section card ─────────────────────────────────────────────────

function Section({
  icon,
  label,
  accent,
  children,
}: {
  icon: string;
  label: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-[8px] p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-6 h-6 rounded-[4px] ${accent} flex items-center justify-center`}>
          <i className={`fa-solid ${icon} text-white text-[11px]`}></i>
        </div>
        <span className="text-[12px] font-bold text-[var(--c-text2)] uppercase tracking-wider">{label}</span>
      </div>
      {children}
    </div>
  );
}

// ── Props ────────────────────────────────────────────────────────

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  currentFilters: FilterState;
  locationName: string | null;
  onLocationClick: () => void;
  onDetectGPS: () => void;
  isDetectingGPS: boolean;
}

// ── Component ────────────────────────────────────────────────────

export default function FilterModal({
  isOpen,
  onClose,
  onApply,
  currentFilters,
  locationName,
  onLocationClick,
  onDetectGPS,
  isDetectingGPS,
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>(currentFilters);

  useEffect(() => {
    if (isOpen) setFilters(currentFilters);
  }, [isOpen, currentFilters]);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => setFilters(DEFAULT_FILTERS);

  const activeCount = countActiveFilters(filters);

  if (!isOpen) return null;

  // Radius percentage for the track fill
  const radiusPct = (filters.radiusKm / 200) * 100;

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center pt-16 sm:pt-24 pb-4 px-2 sm:px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[var(--c-card)] border border-[var(--c-border)] w-full max-w-2xl rounded-[10px] shadow-strong overflow-hidden animate-scaleIn max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-7rem)] flex flex-col">

        {/* ── Header ── */}
        <div className="relative z-10 shrink-0 px-4 sm:px-6 py-4 sm:py-5 border-b border-[var(--c-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-[var(--c-accent)] flex items-center justify-center shadow-accent">
              <i className="fa-solid fa-sliders text-white text-sm"></i>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[var(--c-text)] tracking-tight leading-none">Filteri</h2>
              <p className="text-[11px] text-[var(--c-text3)] uppercase tracking-wider mt-0.5">
                {activeCount > 0 ? `${activeCount} aktivan filter${activeCount > 1 ? 'a' : ''}` : 'Prilagodi pretragu'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-red-500/10 border border-red-500/20 text-red-500 text-[12px] font-semibold hover:bg-red-500/20 transition-all duration-150"
              >
                <i className="fa-solid fa-rotate-left text-[9px]"></i> Reset
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-[6px] bg-[var(--c-card-alt)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-active)] transition-all duration-150"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="relative z-10 overflow-y-auto flex-1 p-3 sm:p-5 space-y-3">

          {/* ROW 1: Location + Radius side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Location */}
            <Section icon="fa-location-dot" label="Lokacija" accent="bg-blue-500">
              <div className="flex gap-2">
                <button
                  onClick={onLocationClick}
                  className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-[6px] text-[13px] font-semibold text-[var(--c-text2)] hover:border-[var(--c-accent)]/40 transition-all duration-150"
                >
                  <i className="fa-solid fa-map-marker-alt text-blue-500 text-[11px] shrink-0"></i>
                  <span className="truncate">{locationName || 'Sve Lokacije'}</span>
                  <i className="fa-solid fa-chevron-right text-[8px] text-[var(--c-text-muted)] ml-auto shrink-0"></i>
                </button>
                <button
                  onClick={onDetectGPS}
                  disabled={isDetectingGPS}
                  title="Otkrij moju lokaciju"
                  className="w-11 h-11 bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-[6px] flex items-center justify-center text-[var(--c-accent)] hover:bg-[var(--c-accent-light)] hover:border-[var(--c-accent)]/40 transition-all duration-150 disabled:opacity-50 shrink-0"
                >
                  <i className={`fa-solid fa-crosshairs text-sm ${isDetectingGPS ? 'animate-spin' : ''}`}></i>
                </button>
              </div>
            </Section>

            {/* Radius */}
            <Section icon="fa-bullseye" label="Radius pretrage" accent="bg-purple-500">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[var(--c-text-muted)]">Udaljenost</span>
                  <span className="text-[13px] font-black text-[var(--c-text)]">
                    {filters.radiusKm === 0 ? 'Neograničeno' : `${filters.radiusKm} km`}
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full h-2 bg-[var(--c-active)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                      style={{ width: `${radiusPct}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0" max="200" step="5"
                    value={filters.radiusKm}
                    onChange={(e) => setFilters({ ...filters, radiusKm: Number(e.target.value) })}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[var(--c-text3)]">
                  <span>0</span><span>50</span><span>100</span><span>150</span><span>200 km</span>
                </div>
              </div>
            </Section>
          </div>

          {/* ROW 2: Price Range (full width) */}
          <Section icon="fa-euro-sign" label="Raspon Cijena" accent="bg-green-500">
            <div className="flex gap-3 items-center mb-3">
              <div className="flex-1 bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-[6px] px-3 py-2 focus-within:border-green-400 transition-all duration-150">
                <p className="text-[11px] font-semibold text-[var(--c-text3)] uppercase tracking-wider mb-0.5">Min €</p>
                <input
                  type="number"
                  value={filters.priceMin}
                  onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                  placeholder="0"
                  className="w-full bg-transparent text-[15px] font-bold text-[var(--c-text)] placeholder:text-[var(--c-text-muted)] outline-none"
                />
              </div>
              <div className="text-[var(--c-text-muted)] font-bold text-lg shrink-0">—</div>
              <div className="flex-1 bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-[6px] px-3 py-2 focus-within:border-green-400 transition-all duration-150">
                <p className="text-[11px] font-semibold text-[var(--c-text3)] uppercase tracking-wider mb-0.5">Max €</p>
                <input
                  type="number"
                  value={filters.priceMax}
                  onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                  placeholder="∞"
                  className="w-full bg-transparent text-[15px] font-bold text-[var(--c-text)] placeholder:text-[var(--c-text-muted)] outline-none"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {[
                { label: 'do 50€', max: '50' },
                { label: 'do 100€', max: '100' },
                { label: 'do 500€', max: '500' },
                { label: 'do 1.000€', max: '1000' },
                { label: 'do 5.000€', max: '5000' },
              ].map((v) => (
                <button
                  key={v.max}
                  onClick={() => setFilters({ ...filters, priceMax: v.max })}
                  className={`px-2 sm:px-0 sm:flex-1 py-1.5 rounded-[4px] text-[10px] sm:text-[11px] font-semibold transition-all duration-150 active:scale-95 border ${
                    filters.priceMax === v.max
                      ? 'text-green-500 border-green-500/40 bg-green-500/10'
                      : 'text-[var(--c-text3)] border-[var(--c-border)] hover:text-green-500 hover:border-green-500/30'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </Section>

          {/* ROW 3: Condition + Sort 2-column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Section icon="fa-tag" label="Stanje artikla" accent="bg-orange-500">
              <PillGroup
                options={[
                  { value: 'all', label: 'Sve', icon: 'fa-layer-group' },
                  { value: 'new', label: 'Novo', icon: 'fa-certificate' },
                  { value: 'like_new', label: 'Kao novo', icon: 'fa-star' },
                  { value: 'used', label: 'Korišteno', icon: 'fa-recycle' },
                ]}
                value={filters.condition}
                onChange={(v) => setFilters({ ...filters, condition: v })}
                activeClass="bg-orange-500/10 text-orange-500 border-orange-500/30"
              />
            </Section>

            <Section icon="fa-arrow-up-wide-short" label="Sortiranje" accent="bg-cyan-500">
              <PillGroup
                options={[
                  { value: 'newest', label: 'Najnovije', icon: 'fa-clock' },
                  { value: 'price_asc', label: 'Cijena ↑', icon: 'fa-arrow-up-1-9' },
                  { value: 'price_desc', label: 'Cijena ↓', icon: 'fa-arrow-down-9-1' },
                  { value: 'popular', label: 'Popularno', icon: 'fa-fire' },
                ]}
                value={filters.sortBy}
                onChange={(v) => setFilters({ ...filters, sortBy: v })}
                activeClass="bg-cyan-500/10 text-cyan-500 border-cyan-500/30"
              />
            </Section>
          </div>

          {/* ROW 4: Delivery + Seller Type 2-column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Section icon="fa-truck" label="Dostava" accent="bg-emerald-500">
              <PillGroup
                options={[
                  { value: 'all', label: 'Sve', icon: 'fa-layer-group' },
                  { value: 'shipping', label: 'Dostava', icon: 'fa-truck-fast' },
                  { value: 'pickup', label: 'Preuzimanje', icon: 'fa-hand' },
                ]}
                value={filters.delivery}
                onChange={(v) => setFilters({ ...filters, delivery: v })}
                activeClass="bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
              />
            </Section>

            <Section icon="fa-user-check" label="Vrsta prodavca" accent="bg-pink-500">
              <PillGroup
                options={[
                  { value: 'all', label: 'Svi', icon: 'fa-users' },
                  { value: 'verified', label: 'Verificiran', icon: 'fa-circle-check' },
                  { value: 'premium', label: 'Business', icon: 'fa-crown' },
                ]}
                value={filters.sellerType}
                onChange={(v) => setFilters({ ...filters, sellerType: v })}
                activeClass="bg-pink-500/10 text-pink-500 border-pink-500/30"
              />
            </Section>
          </div>

          {/* ROW 5: Time Posted (full width) */}
          <Section icon="fa-calendar" label="Vrijeme objave" accent="bg-yellow-500">
            <PillGroup
              options={[
                { value: 'all', label: 'Sve', icon: 'fa-infinity' },
                { value: 'today', label: 'Danas', icon: 'fa-sun' },
                { value: 'week', label: 'Ovaj tjedan', icon: 'fa-calendar-week' },
                { value: 'month', label: 'Ovaj mjesec', icon: 'fa-calendar' },
              ]}
              value={filters.timePosted}
              onChange={(v) => setFilters({ ...filters, timePosted: v })}
              activeClass="bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
            />
          </Section>

          <div className="h-1" />
        </div>

        {/* ── Footer ── */}
        <div className="relative z-10 shrink-0 px-3 sm:px-5 py-3 sm:py-4 border-t border-[var(--c-border)] bg-[var(--c-card)] flex gap-2 sm:gap-3">
          <button
            onClick={handleReset}
            className="px-5 py-3.5 rounded-[6px] bg-[var(--c-card-alt)] border border-[var(--c-border)] text-[var(--c-text2)] font-semibold text-[12px] uppercase tracking-wider hover:bg-[var(--c-active)] transition-all duration-150 active:scale-95 flex items-center gap-2"
          >
            <i className="fa-solid fa-rotate-left text-[11px]"></i> Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3.5 rounded-[6px] blue-gradient text-white font-bold text-[13px] uppercase tracking-wider shadow-accent active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-check text-[11px]"></i>
            Primijeni{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
