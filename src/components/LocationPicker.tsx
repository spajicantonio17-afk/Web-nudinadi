'use client';

import React, { useState, useMemo } from 'react';
import { CITIES, searchCities, setSelectedLocation, clearSelectedLocation, detectGPSLocation, findNearestCity, type City } from '@/lib/location';

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (city: City | null) => void;
  currentCity: City | null;
}

const COUNTRY_LABELS: Record<City['country'], string> = {
  'BiH': 'Bosna i Hercegovina',
  'HR': 'Hrvatska',
};

const COUNTRY_ORDER: City['country'][] = ['BiH', 'HR'];

export default function LocationPicker({ isOpen, onClose, onSelect, currentCity }: LocationPickerProps) {
  const [query, setQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());

  const filteredCities = useMemo(() => {
    if (query.trim()) return searchCities(query);
    return CITIES;
  }, [query]);

  // Group: country → region → cities
  const groupedByCountryRegion = useMemo(() => {
    const result: Record<string, Record<string, City[]>> = {};
    for (const city of filteredCities) {
      if (!result[city.country]) result[city.country] = {};
      if (!result[city.country][city.region]) result[city.country][city.region] = [];
      result[city.country][city.region].push(city);
    }
    return result;
  }, [filteredCities]);

  const toggleRegion = (region: string) => {
    setExpandedRegions(prev => {
      const next = new Set(prev);
      if (next.has(region)) next.delete(region);
      else next.add(region);
      return next;
    });
  };

  // When searching, auto-expand all matching regions
  const isSearching = query.trim().length > 0;

  const handleSelect = (city: City) => {
    setSelectedLocation(city);
    onSelect(city);
    onClose();
    setQuery('');
    setGpsError('');
  };

  const handleClear = () => {
    clearSelectedLocation();
    onSelect(null);
    onClose();
    setQuery('');
    setGpsError('');
  };

  const handleDetectGPS = async () => {
    setIsDetecting(true);
    setGpsError('');
    try {
      const coords = await detectGPSLocation();
      const nearest = findNearestCity(coords.lat, coords.lng);
      handleSelect(nearest);
    } catch (err) {
      setGpsError(err instanceof Error ? err.message : 'Greška pri detekciji lokacije');
    } finally {
      setIsDetecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-[var(--c-overlay)] backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-[var(--c-card)] border border-[var(--c-border2)] w-full max-w-3xl rounded-[24px] shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out] max-h-[92vh] sm:max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[var(--c-border)]">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="min-w-0 flex-1 mr-3">
              <h2 className="text-lg sm:text-xl font-black text-[var(--c-text)]">Lokacija</h2>
              <p className="text-xs sm:text-sm text-[var(--c-text2)] mt-1">Odaberi grad za filtriranje oglasa</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text2)] hover:text-[var(--c-text)] transition-colors">
              <i className="fa-solid fa-xmark text-base"></i>
            </button>
          </div>

          {/* GPS Detect Button */}
          <button
            onClick={handleDetectGPS}
            disabled={isDetecting}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 mb-4 bg-blue-500/10 border border-blue-500/20 rounded-[14px] text-sm font-bold text-blue-400 hover:bg-blue-500/15 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <i className={`fa-solid fa-crosshairs ${isDetecting ? 'animate-spin' : ''}`}></i>
            <span>{isDetecting ? 'Detektiranje...' : 'Otkrij moju lokaciju (GPS)'}</span>
          </button>

          {gpsError && (
            <div className="mb-4 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-[10px] text-xs text-red-400 font-medium flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation text-xs"></i>
              {gpsError}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[var(--c-text2)] text-sm"></i>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Traži grad..."
              className="w-full bg-[var(--c-input)] border border-[var(--c-border2)] rounded-[14px] py-3.5 pl-11 pr-4 text-sm text-[var(--c-text)] placeholder:text-[var(--c-placeholder)] outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Current Selection */}
        {currentCity && (
          <div className="px-4 sm:px-6 py-3.5 border-b border-[var(--c-border)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <i className="fa-solid fa-location-dot text-blue-400 text-sm"></i>
              <span className="text-sm font-bold text-[var(--c-text)]">{currentCity.name}, {currentCity.country}</span>
            </div>
            <button onClick={handleClear} className="text-xs font-bold text-red-400 uppercase tracking-wider hover:text-red-300 transition-colors">
              Ukloni
            </button>
          </div>
        )}

        {/* City List */}
        <div className="overflow-y-auto flex-1 p-4">
          {COUNTRY_ORDER.filter(c => groupedByCountryRegion[c]).map((country) => {
            const regions = groupedByCountryRegion[country];
            return (
              <div key={country} className="mb-6">
                {/* Country header */}
                <div className="flex items-center gap-2.5 px-2 mb-3">
                  <i className="fa-solid fa-flag text-xs text-[var(--c-text2)]"></i>
                  <span className="text-xs font-black text-[var(--c-text2)] uppercase tracking-widest">{COUNTRY_LABELS[country]}</span>
                  <span className="text-[11px] text-[var(--c-text3)] ml-auto">{Object.values(regions).flat().length} gradova</span>
                </div>

                {/* Regions within country */}
                {Object.entries(regions).map(([region, cities]) => {
                  const isExpanded = isSearching || expandedRegions.has(region);
                  return (
                    <div key={region} className="mb-2">
                      {/* Region header (collapsible) */}
                      <button
                        onClick={() => toggleRegion(region)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] hover:bg-[var(--c-hover)] transition-colors group"
                      >
                        <i className={`fa-solid fa-chevron-right text-[10px] text-[var(--c-text3)] transition-transform ${isExpanded ? 'rotate-90' : ''}`}></i>
                        <span className="text-sm font-bold text-[var(--c-text2)] group-hover:text-[var(--c-text)] transition-colors">{region}</span>
                        <span className="text-xs text-[var(--c-text3)] ml-auto">{cities.length}</span>
                      </button>

                      {/* Cities grid (shown when expanded or searching) */}
                      {isExpanded && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 sm:gap-1.5 px-1 sm:px-2 pb-1">
                          {cities.map((city) => (
                            <button
                              key={`${city.country}-${city.name}`}
                              onClick={() => handleSelect(city)}
                              className={`text-left px-2.5 sm:px-3.5 py-2.5 rounded-[8px] text-xs sm:text-sm font-bold transition-all active:scale-95 ${
                                currentCity?.name === city.name && currentCity?.country === city.country
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : 'text-[var(--c-text2)] hover:bg-[var(--c-hover)] border border-transparent'
                              }`}
                            >
                              {city.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {filteredCities.length === 0 && (
            <div className="text-center py-8 text-[var(--c-text2)] text-sm">Nema rezultata za &quot;{query}&quot;</div>
          )}
        </div>
      </div>
    </div>
  );
}
