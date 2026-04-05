'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getCountryPreference, setCountryPreference, type CountryPreference,
  getGPSPosition, setGPSPosition, clearGPSPosition, type GPSPosition,
  getRadius, setRadius, RADIUS_OPTIONS, type RadiusKm,
} from '@/lib/country';
import { useTheme } from '@/lib/theme';
import { detectGPSLocation, findNearestCity } from '@/lib/location';

export default function AppSettings() {
  const { theme, setTheme } = useTheme();
  const [country, setCountry] = useState<CountryPreference>('all');
  const [gps, setGps] = useState<GPSPosition | null>(null);
  const [radius, setRadiusState] = useState<RadiusKm>(50);
  const [nearestCityName, setNearestCityName] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCountry(getCountryPreference());
    setGps(getGPSPosition());
    setRadiusState(getRadius());
  }, []);

  useEffect(() => {
    if (gps) {
      const city = findNearestCity(gps.lat, gps.lng);
      setNearestCityName(city.name);
    } else {
      setNearestCityName(null);
    }
  }, [gps]);

  const handleCountryChange = useCallback((c: CountryPreference) => {
    setCountry(c);
    setCountryPreference(c);
  }, []);

  const handleRadiusChange = useCallback((r: RadiusKm) => {
    setRadiusState(r);
    setRadius(r);
  }, []);

  const handleDetectGPS = useCallback(async () => {
    setGpsLoading(true);
    setGpsError(null);
    try {
      const pos = await detectGPSLocation();
      setGps(pos);
      setGPSPosition(pos);
    } catch (err) {
      setGpsError(err instanceof Error ? err.message : 'Greška pri detekciji lokacije');
    } finally {
      setGpsLoading(false);
    }
  }, []);

  const handleClearGPS = useCallback(() => {
    setGps(null);
    clearGPSPosition();
    setNearestCityName(null);
  }, []);

  if (!mounted) return null;

  const countryLabel = country === 'ba' ? '🇧🇦 BiH' : country === 'hr' ? '🇭🇷 Hrvatska' : country === 'rs' ? '🇷🇸 Srbija' : '🌍 Sve';
  const themeLabel = theme === 'dark' ? 'Tamna' : theme === 'light' ? 'Svijetla' : 'Sistemska';

  return (
    <div className="space-y-6">

      {/* ── Hero Header Card ── */}
      <div className="bg-blue-500/5 border border-blue-500/15 rounded-[22px] p-6 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-blue-500/8 rounded-full blur-[30px]" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-indigo-500/5 rounded-full blur-[25px]" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-[14px] blue-gradient flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <i className="fa-solid fa-palette text-lg"></i>
          </div>
          <div>
            <h3 className="text-lg font-black text-[var(--c-text)]">Izgled i tržište</h3>
            <p className="text-[11px] text-[var(--c-text3)]">Tema, tržište i lokacijske preference</p>
          </div>
        </div>
      </div>

      {/* ── Country Filter ── */}
      <section>
        <h2 className="text-[11px] font-black uppercase tracking-[2px] text-[var(--c-text3)] mb-3 px-2">
          Prikaži artikle iz
        </h2>
        <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] p-1 overflow-hidden">
          <CountryRow
            flag="🇧🇦" label="Bosna i Hercegovina" sub="Samo KM cijene"
            selected={country === 'ba'} onClick={() => handleCountryChange('ba')}
          />
          <CountryRow
            flag="🇭🇷" label="Hrvatska" sub="Samo EUR cijene"
            selected={country === 'hr'} onClick={() => handleCountryChange('hr')}
          />
          <CountryRow
            flag="🇷🇸" label="Srbija" sub="Samo RSD cijene"
            selected={country === 'rs'} onClick={() => handleCountryChange('rs')}
          />
          <CountryRow
            flag="🌍" label="Sva tržišta" sub="Sve valute · KM, EUR i RSD"
            selected={country === 'all'} onClick={() => handleCountryChange('all')} last
          />
        </div>
      </section>

      {/* ── Theme ── */}
      <section>
        <h2 className="text-[11px] font-black uppercase tracking-[2px] text-[var(--c-text3)] mb-3 px-2">
          Tema
        </h2>
        <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] p-1 overflow-hidden">
          <ThemeRow icon="fa-sun" label="Svijetla" sub="Klasični svijetli izgled"
            selected={theme === 'light'} onClick={() => setTheme('light')} />
          <ThemeRow icon="fa-moon" label="Tamna" sub="Glassmorphism dark mode"
            selected={theme === 'dark'} onClick={() => setTheme('dark')} />
          <ThemeRow icon="fa-circle-half-stroke" label="Sistemska" sub="Prati postavke uređaja"
            selected={theme === 'system'} onClick={() => setTheme('system')} last />
        </div>
      </section>

      {/* ── Location / GPS ── */}
      <section>
        <h2 className="text-[11px] font-black uppercase tracking-[2px] text-[var(--c-text3)] mb-3 px-2">
          Lokacija
        </h2>

        <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] overflow-hidden">
          {/* GPS toggle */}
          <button
            onClick={gps ? handleClearGPS : handleDetectGPS}
            disabled={gpsLoading}
            className={`
              w-full flex items-center gap-3.5 p-4 transition-all text-left
              ${gps ? '' : 'hover:bg-[var(--c-hover)]'}
            `}
          >
            <div className={`
              w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 border transition-colors
              ${gps
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                : 'bg-[var(--c-hover)] border-[var(--c-border2)] text-[var(--c-text2)]'
              }
            `}>
              {gpsLoading
                ? <i className="fa-solid fa-spinner fa-spin text-sm" />
                : <i className="fa-solid fa-location-crosshairs text-sm" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`text-[13px] font-bold ${gps ? 'text-blue-500' : 'text-[var(--c-text)]'}`}>
                {gpsLoading ? 'Detektiranje lokacije...' : gps ? 'GPS aktivan' : 'Koristi moju lokaciju'}
              </h4>
              <p className="text-[10px] text-[var(--c-text3)] mt-0.5">
                {gps && nearestCityName
                  ? `Najbliži grad: ${nearestCityName}`
                  : 'Artikli u blizini tvoje lokacije'
                }
              </p>
            </div>
            {gps ? (
              <span className="text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-1 rounded-md border border-red-500/10">
                Ukloni
              </span>
            ) : (
              <i className="fa-solid fa-chevron-right text-[10px] text-[var(--c-text-muted)]" />
            )}
          </button>

          {/* Radius — only show when GPS is active */}
          {gps && (
            <div className="px-4 pb-4 pt-1 border-t border-[var(--c-border)]">
              <div className="flex items-center justify-between mb-3 mt-3">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-bullseye text-[10px] text-[var(--c-text3)]" />
                  <h4 className="text-[12px] font-bold text-[var(--c-text)]">Radius pretrage</h4>
                </div>
                <span className="text-[12px] font-black text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/15">
                  {radius} km
                </span>
              </div>
              <div className="flex gap-1.5">
                {RADIUS_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRadiusChange(r)}
                    className={`
                      flex-1 py-2 rounded-[10px] text-[11px] font-bold transition-all
                      ${radius === r
                        ? 'blue-gradient text-white shadow-md shadow-blue-500/20'
                        : 'bg-[var(--c-hover)] text-[var(--c-text2)] hover:bg-[var(--c-active)] border border-transparent hover:border-[var(--c-border)]'
                      }
                    `}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {/* Country priority info */}
              <div className="flex items-center gap-2 mt-3 px-1">
                <i className="fa-solid fa-circle-info text-[9px] text-[var(--c-text-muted)]" />
                <p className="text-[10px] text-[var(--c-text-muted)]">
                  {country === 'ba'
                    ? 'Prikazuje samo artikle iz BiH unutar radijusa'
                    : country === 'hr'
                      ? 'Prikazuje samo artikle iz Hrvatske unutar radijusa'
                      : country === 'rs'
                        ? 'Prikazuje samo artikle iz Srbije unutar radijusa'
                        : 'Prikazuje artikle iz svih tržišta unutar radijusa'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {gpsError && (
          <div className="flex items-center gap-2 mt-2 px-2">
            <i className="fa-solid fa-triangle-exclamation text-[10px] text-red-400" />
            <p className="text-[11px] text-red-400 font-medium">{gpsError}</p>
          </div>
        )}
      </section>

      {/* ── Quick Info ── */}
      <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[18px] p-4">
        <div className="flex items-center gap-3 text-[11px]">
          <i className="fa-solid fa-sliders text-[var(--c-text-muted)] text-xs" />
          <div className="flex-1 flex items-center gap-2 flex-wrap">
            <span className="bg-[var(--c-hover)] text-[var(--c-text2)] px-2 py-0.5 rounded-md font-bold border border-[var(--c-border)]">
              {countryLabel}
            </span>
            <span className="bg-[var(--c-hover)] text-[var(--c-text2)] px-2 py-0.5 rounded-md font-bold border border-[var(--c-border)]">
              {themeLabel}
            </span>
            {gps && (
              <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-md font-bold border border-blue-500/15">
                GPS {radius}km
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-Components ──────────────────────────────────────────

function CountryRow({ flag, label, sub, selected, onClick, last }: {
  flag: string; label: string; sub: string;
  selected: boolean; onClick: () => void; last?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3.5 px-4 py-3 transition-all text-left
        ${!last ? 'border-b border-[var(--c-border)]' : ''}
        ${selected ? 'bg-blue-500/8' : 'hover:bg-[var(--c-hover)]'}
        ${!last ? '' : 'rounded-b-[16px]'}
      `}
    >
      <span className="text-xl w-7 text-center flex-shrink-0">{flag}</span>
      <div className="flex-1 min-w-0">
        <h4 className={`text-[13px] font-bold ${selected ? 'text-blue-500' : 'text-[var(--c-text)]'}`}>
          {label}
        </h4>
        <p className="text-[10px] text-[var(--c-text3)]">{sub}</p>
      </div>
      <div className={`
        w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
        ${selected ? 'border-blue-500 bg-blue-500' : 'border-[var(--c-border2)]'}
      `}>
        {selected && <i className="fa-solid fa-check text-[7px] text-white" />}
      </div>
    </button>
  );
}

function ThemeRow({ icon, label, sub, selected, onClick, last }: {
  icon: string; label: string; sub: string;
  selected: boolean; onClick: () => void; last?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3.5 px-4 py-3 transition-all text-left
        ${!last ? 'border-b border-[var(--c-border)]' : ''}
        ${selected ? 'bg-blue-500/8' : 'hover:bg-[var(--c-hover)]'}
      `}
    >
      <div className={`
        w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 border transition-colors
        ${selected
          ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
          : 'bg-[var(--c-hover)] border-[var(--c-border2)] text-[var(--c-text2)]'
        }
      `}>
        <i className={`fa-solid ${icon} text-sm`} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-[13px] font-bold ${selected ? 'text-blue-500' : 'text-[var(--c-text)]'}`}>
          {label}
        </h4>
        <p className="text-[10px] text-[var(--c-text3)]">{sub}</p>
      </div>
      <div className={`
        w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
        ${selected ? 'border-blue-500 bg-blue-500' : 'border-[var(--c-border2)]'}
      `}>
        {selected && <i className="fa-solid fa-check text-[7px] text-white" />}
      </div>
    </button>
  );
}
