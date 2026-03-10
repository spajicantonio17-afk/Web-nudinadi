'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { getCategoryFilters, getAutoCompleteOptions, type QuickFilter } from '@/lib/category-filters';
import { CATEGORIES } from '@/lib/constants';
import BottomSheet from '@/components/BottomSheet';

// ── Types ───────────────────────────────────────────────────────

export type AttributeFilters = Record<string, string | number | boolean | [number, number]>;

interface CategoryFilterBarProps {
  activeCategory: string;
  attributeFilters: AttributeFilters;
  onAttributeFiltersChange: (filters: AttributeFilters) => void;
  onClearCategory: () => void;
  /** Selected subcategory name (2nd level) */
  selectedSubCategory: string | null;
  /** Selected item name (3rd level) */
  selectedSubItem: string | null;
  /** Called when subcategory/item selection changes */
  onSubCategoryChange: (sub: string | null, item: string | null) => void;
}

// ── Helpers ─────────────────────────────────────────────────────

function getFilterDisplayValue(filter: QuickFilter, value: string | number | boolean | [number, number]): string {
  if (Array.isArray(value)) {
    const [min, max] = value;
    const unit = filter.unit ? ` ${filter.unit}` : '';
    if (min && max) return `${min}${unit} – ${max}${unit}`;
    if (max) return `do ${max}${unit}`;
    return `od ${min}${unit}`;
  }
  return String(value);
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

// ── Select Filter Dropdown (Desktop) ────────────────────────────

function FilterDropdown({
  filter,
  value,
  onSelect,
  onClose,
  anchorRef,
  activeCategory,
  attributeFilters,
}: {
  filter: QuickFilter;
  value?: string | number | boolean | [number, number];
  onSelect: (val: string | number | [number, number] | undefined) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  activeCategory: string;
  attributeFilters: AttributeFilters;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ left: rect.left, top: rect.bottom + 4 });
    }
  }, [anchorRef]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose, anchorRef]);

  if (filter.type === 'range') {
    return <RangeDropdown filter={filter} value={value as [number, number] | undefined} onSelect={onSelect} onClose={onClose} pos={pos} dropdownRef={dropdownRef} />;
  }

  // Get options: static OR dynamic autocomplete
  const staticOptions = filter.options || [];
  const dynamicOptions = (filter.type === 'autocomplete' || filter.type === 'text')
    ? getAutoCompleteOptions(activeCategory, filter.key, attributeFilters)
    : [];
  const allOptions = staticOptions.length > 0 ? staticOptions : dynamicOptions;

  // Filter by search text
  const query = searchText.toLowerCase().trim();
  const filteredOptions = query
    ? allOptions.filter(opt => opt.toLowerCase().includes(query))
    : allOptions;

  const isSearchable = filter.type === 'autocomplete' || filter.type === 'text' || allOptions.length > 8;

  return (
    <div
      ref={dropdownRef}
      className="fixed z-[250] bg-[var(--c-card)] border border-[var(--c-border)] rounded-[10px] shadow-strong max-h-[350px] min-w-[200px] animate-fadeIn flex flex-col"
      style={{ left: Math.min(pos.left, window.innerWidth - 220), top: pos.top }}
    >
      {isSearchable && (
        <div className="p-2.5 border-b border-[var(--c-border)] shrink-0">
          <input
            type="text"
            placeholder={`Traži ${filter.label.toLowerCase()}...`}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (filteredOptions.length > 0) {
                  onSelect(filteredOptions[0]);
                } else if (searchText.trim()) {
                  onSelect(searchText.trim());
                }
                onClose();
              }
            }}
            className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-[6px] px-3 py-2 text-[12px] text-[var(--c-text)] placeholder:text-[var(--c-text-muted)] outline-none focus:border-[var(--c-accent)]"
            autoFocus
          />
        </div>
      )}
      <div className="overflow-y-auto flex-1">
        {value !== undefined && (
          <button
            onClick={() => { onSelect(undefined); onClose(); }}
            className="w-full px-4 py-2.5 text-left text-[12px] font-semibold text-red-500 hover:bg-red-500/10 border-b border-[var(--c-border)] flex items-center gap-2"
          >
            <i className="fa-solid fa-xmark text-[10px]"></i>
            Ukloni filter
          </button>
        )}
        {filteredOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => { onSelect(opt); onClose(); }}
            className={`w-full px-4 py-2.5 text-left text-[12px] font-medium transition-colors flex items-center justify-between ${
              value === opt
                ? 'text-[var(--c-accent)] bg-[var(--c-accent-light)]'
                : 'text-[var(--c-text2)] hover:bg-[var(--c-hover)]'
            }`}
          >
            <span>{opt}</span>
            {value === opt && <i className="fa-solid fa-check text-[10px] text-[var(--c-accent)]"></i>}
          </button>
        ))}
        {filteredOptions.length === 0 && searchText.trim() && (
          <button
            onClick={() => { onSelect(searchText.trim()); onClose(); }}
            className="w-full px-4 py-2.5 text-left text-[12px] font-medium text-[var(--c-accent)] hover:bg-[var(--c-hover)]"
          >
            &ldquo;{searchText.trim()}&rdquo; koristiti
          </button>
        )}
      </div>
    </div>
  );
}

// ── Range Dropdown ──────────────────────────────────────────────

function RangeDropdown({
  filter,
  value,
  onSelect,
  onClose,
  pos,
  dropdownRef,
}: {
  filter: QuickFilter;
  value?: [number, number];
  onSelect: (val: [number, number] | undefined) => void;
  onClose: () => void;
  pos: { left: number; top: number };
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [min, setMin] = useState(value?.[0]?.toString() || '');
  const [max, setMax] = useState(value?.[1]?.toString() || '');
  const unit = filter.unit || '';

  const handleApply = () => {
    const minVal = min ? Number(min) : 0;
    const maxVal = max ? Number(max) : 0;
    if (minVal || maxVal) {
      onSelect([minVal, maxVal]);
    } else {
      onSelect(undefined);
    }
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="fixed z-[250] bg-[var(--c-card)] border border-[var(--c-border)] rounded-[10px] shadow-strong w-[260px] animate-fadeIn"
      style={{ left: Math.min(pos.left, window.innerWidth - 280), top: pos.top }}
    >
      <div className="p-4 space-y-3">
        <p className="text-[11px] font-bold text-[var(--c-text3)] uppercase tracking-wider">{filter.label}</p>
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <label className="text-[10px] text-[var(--c-text-muted)] mb-0.5 block">Od</label>
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              placeholder={filter.range?.[0]?.toString() || '0'}
              className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-[6px] px-2.5 py-2 text-[13px] font-semibold text-[var(--c-text)] placeholder:text-[var(--c-text-muted)] outline-none focus:border-[var(--c-accent)]"
              autoFocus
            />
          </div>
          <span className="text-[var(--c-text-muted)] font-bold mt-4">—</span>
          <div className="flex-1">
            <label className="text-[10px] text-[var(--c-text-muted)] mb-0.5 block">Do</label>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              placeholder={filter.range?.[1]?.toString() || '∞'}
              className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-[6px] px-2.5 py-2 text-[13px] font-semibold text-[var(--c-text)] placeholder:text-[var(--c-text-muted)] outline-none focus:border-[var(--c-accent)]"
            />
          </div>
        </div>
        {unit && (
          <p className="text-[10px] text-[var(--c-text-muted)] text-right">{unit}</p>
        )}
        <div className="flex gap-2">
          {value && (
            <button
              onClick={() => { onSelect(undefined); onClose(); }}
              className="px-3 py-2 rounded-[6px] bg-red-500/10 text-red-500 text-[11px] font-semibold border border-red-500/20 hover:bg-red-500/20 transition-all"
            >
              Ukloni
            </button>
          )}
          <button
            onClick={handleApply}
            className="flex-1 py-2 rounded-[6px] blue-gradient text-white text-[11px] font-bold uppercase tracking-wider shadow-accent active:scale-[0.98] transition-all"
          >
            Primijeni
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Select BottomSheet Content (Mobile) ─────────────────────────

function SelectSheetContent({
  filter,
  value,
  onSelect,
  activeCategory,
  attributeFilters,
}: {
  filter: QuickFilter;
  value?: string | number | boolean | [number, number];
  onSelect: (val: string | number | [number, number] | undefined) => void;
  activeCategory: string;
  attributeFilters: AttributeFilters;
}) {
  const [searchText, setSearchText] = useState('');

  if (filter.type === 'range') {
    return <RangeSheetContent filter={filter} value={value as [number, number] | undefined} onSelect={onSelect} />;
  }

  // Get options: static OR dynamic autocomplete
  const staticOptions = filter.options || [];
  const dynamicOptions = (filter.type === 'autocomplete' || filter.type === 'text')
    ? getAutoCompleteOptions(activeCategory, filter.key, attributeFilters)
    : [];
  const allOptions = staticOptions.length > 0 ? staticOptions : dynamicOptions;

  const query = searchText.toLowerCase().trim();
  const filteredOptions = query
    ? allOptions.filter(opt => opt.toLowerCase().includes(query))
    : allOptions;

  const isSearchable = filter.type === 'autocomplete' || filter.type === 'text' || allOptions.length > 8;

  return (
    <div className="space-y-1">
      {isSearchable && (
        <div className="pb-2 mb-2 border-b border-[var(--c-border)]">
          <input
            type="text"
            placeholder={`Traži ${filter.label.toLowerCase()}...`}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (filteredOptions.length > 0) {
                  onSelect(filteredOptions[0]);
                } else if (searchText.trim()) {
                  onSelect(searchText.trim());
                }
              }
            }}
            className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-[8px] px-4 py-3 text-[13px] text-[var(--c-text)] placeholder:text-[var(--c-text-muted)] outline-none focus:border-[var(--c-accent)]"
            autoFocus
          />
        </div>
      )}
      {value !== undefined && (
        <button
          onClick={() => onSelect(undefined)}
          className="w-full px-4 py-3 text-left text-[13px] font-semibold text-red-500 hover:bg-red-500/10 rounded-[8px] flex items-center gap-2 mb-2"
        >
          <i className="fa-solid fa-xmark text-[11px]"></i>
          Ukloni filter
        </button>
      )}
      {filteredOptions.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={`w-full px-4 py-3 text-left text-[13px] font-medium rounded-[8px] transition-colors flex items-center justify-between ${
            value === opt
              ? 'text-[var(--c-accent)] bg-[var(--c-accent-light)] border border-[var(--c-accent)]/20'
              : 'text-[var(--c-text2)] hover:bg-[var(--c-hover)]'
          }`}
        >
          <span>{opt}</span>
          {value === opt && <i className="fa-solid fa-check text-[11px] text-[var(--c-accent)]"></i>}
        </button>
      ))}
      {filteredOptions.length === 0 && searchText.trim() && (
        <button
          onClick={() => onSelect(searchText.trim())}
          className="w-full px-4 py-3 text-left text-[13px] font-medium text-[var(--c-accent)] hover:bg-[var(--c-hover)] rounded-[8px]"
        >
          &ldquo;{searchText.trim()}&rdquo; koristiti
        </button>
      )}
    </div>
  );
}

// ── Range BottomSheet Content (Mobile) ──────────────────────────

function RangeSheetContent({
  filter,
  value,
  onSelect,
}: {
  filter: QuickFilter;
  value?: [number, number];
  onSelect: (val: [number, number] | undefined) => void;
}) {
  const [min, setMin] = useState(value?.[0]?.toString() || '');
  const [max, setMax] = useState(value?.[1]?.toString() || '');
  const unit = filter.unit || '';

  const handleApply = () => {
    const minVal = min ? Number(min) : 0;
    const maxVal = max ? Number(max) : 0;
    if (minVal || maxVal) {
      onSelect([minVal, maxVal]);
    } else {
      onSelect(undefined);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <label className="text-[11px] font-semibold text-[var(--c-text3)] mb-1 block uppercase tracking-wider">Od</label>
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            placeholder={filter.range?.[0]?.toString() || '0'}
            className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-[8px] px-3 py-3 text-[14px] font-semibold text-[var(--c-text)] placeholder:text-[var(--c-text-muted)] outline-none focus:border-[var(--c-accent)]"
            autoFocus
          />
        </div>
        <span className="text-[var(--c-text-muted)] font-bold text-lg mt-6">—</span>
        <div className="flex-1">
          <label className="text-[11px] font-semibold text-[var(--c-text3)] mb-1 block uppercase tracking-wider">Do</label>
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            placeholder={filter.range?.[1]?.toString() || '∞'}
            className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-[8px] px-3 py-3 text-[14px] font-semibold text-[var(--c-text)] placeholder:text-[var(--c-text-muted)] outline-none focus:border-[var(--c-accent)]"
          />
        </div>
      </div>
      {unit && (
        <p className="text-[11px] text-[var(--c-text-muted)] text-right font-medium">{unit}</p>
      )}
      <div className="flex gap-2 pt-2">
        {value && (
          <button
            onClick={() => onSelect(undefined)}
            className="px-4 py-3 rounded-[8px] bg-red-500/10 text-red-500 text-[12px] font-semibold border border-red-500/20"
          >
            Ukloni
          </button>
        )}
        <button
          onClick={handleApply}
          className="flex-1 py-3 rounded-[8px] blue-gradient text-white text-[12px] font-bold uppercase tracking-wider shadow-accent active:scale-[0.98] transition-all"
        >
          Primijeni
        </button>
      </div>
    </div>
  );
}

// ── Grouping logic for categories with many prefixed subcategories ──

interface SubGroup {
  label: string;
  prefix: string;
  subs: { name: string; items?: string[] }[];
}

/**
 * Detect if subcategories share common prefixes (e.g. "Za automobile – ...", "Za motocikle – ...").
 * Returns groups if 2+ groups found with 2+ subs each, otherwise null (no grouping needed).
 */
function detectSubGroups(subs: { name: string; items?: string[] }[]): SubGroup[] | null {
  const prefixMap = new Map<string, { name: string; items?: string[] }[]>();

  for (const sub of subs) {
    // Try "Za X –" pattern first
    const dashMatch = sub.name.match(/^(Za\s+[\w\s/]+?)\s*[–\-]\s*/i);
    if (dashMatch) {
      const prefix = dashMatch[1].trim();
      if (!prefixMap.has(prefix)) prefixMap.set(prefix, []);
      prefixMap.get(prefix)!.push(sub);
    } else {
      // Try "Za X" pattern (e.g. "Za teretna vozila" with no dash)
      const zaMatch = sub.name.match(/^(Za\s+[\w\s/]+)/i);
      if (zaMatch) {
        const prefix = zaMatch[1].trim();
        if (!prefixMap.has(prefix)) prefixMap.set(prefix, []);
        prefixMap.get(prefix)!.push(sub);
      } else {
        // No prefix — standalone
        const key = '__standalone__';
        if (!prefixMap.has(key)) prefixMap.set(key, []);
        prefixMap.get(key)!.push(sub);
      }
    }
  }

  // Only use grouping if we have multiple groups with at least one having 2+ items
  const groups = [...prefixMap.entries()];
  const multiGroups = groups.filter(([, items]) => items.length >= 2);
  if (multiGroups.length < 1) return null;

  const result = groups.map(([prefix, items]) => ({
    label: prefix === '__standalone__' ? 'Kategorije' : prefix,
    prefix,
    subs: items,
  }));
  // Put "Kategorije" (standalone) group first
  result.sort((a, b) => {
    if (a.prefix === '__standalone__') return -1;
    if (b.prefix === '__standalone__') return 1;
    return 0;
  });
  return result;
}

/** Strip the group prefix from a subcategory name for cleaner display */
function stripPrefix(name: string, prefix: string): string {
  if (prefix === '__standalone__' || prefix === 'Kategorije') return name;
  // Remove "Za automobile – " prefix to show just "Motor i mjenjač"
  const regex = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[–\\-]\\s*`, 'i');
  const stripped = name.replace(regex, '');
  return stripped || name;
}

// ── Subcategory Drilldown Bar ────────────────────────────────────

function SubCategoryDrilldown({
  activeCategory,
  selectedSub,
  selectedItem,
  onSelect,
  isMobile,
}: {
  activeCategory: string;
  selectedSub: string | null;
  selectedItem: string | null;
  onSelect: (sub: string | null, item: string | null) => void;
  isMobile: boolean;
}) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const categoryData = useMemo(() => {
    return CATEGORIES.find(c => c.name === activeCategory);
  }, [activeCategory]);

  // Reset group when category changes
  useEffect(() => {
    setSelectedGroup(null);
  }, [activeCategory]);

  // Reset group when sub is cleared
  useEffect(() => {
    if (!selectedSub) setSelectedGroup(null);
  }, [selectedSub]);

  if (!categoryData?.subCategories?.length) return null;

  // Sort "Ostalo/Ostale/Ostali" to the end
  const subs = useMemo(() => {
    const sorted = [...categoryData.subCategories];
    sorted.sort((a, b) => {
      const aIsOstalo = /^ostal/i.test(a.name);
      const bIsOstalo = /^ostal/i.test(b.name);
      if (aIsOstalo && !bIsOstalo) return 1;
      if (!aIsOstalo && bIsOstalo) return -1;
      return 0;
    });
    return sorted;
  }, [categoryData.subCategories]);
  const groups = useMemo(() => detectSubGroups(subs), [subs]);
  const hasGroups = groups !== null;

  const selectedSubData = selectedSub ? subs.find(s => s.name === selectedSub) : null;
  const items = selectedSubData?.items || [];

  // Current group's subcategories (for grouped mode)
  const currentGroupSubs = hasGroups && selectedGroup
    ? groups.find(g => g.label === selectedGroup)?.subs || []
    : [];

  // What to show
  const showingGroups = hasGroups && !selectedGroup && !selectedSub;
  const showingGroupedSubs = hasGroups && selectedGroup && !selectedSub;
  const showingSubs = !hasGroups && !selectedSub;
  const showingItems = selectedSub && items.length > 0 && !selectedItem;

  // Find which group the selected sub belongs to (for chip display)
  const selectedGroupData = hasGroups && selectedSub
    ? groups.find(g => g.subs.some(s => s.name === selectedSub))
    : null;

  const chipClass = "flex items-center gap-1 px-2.5 py-1.5 rounded-[10px] transition-all duration-150 group shrink-0";
  const optionClass = "flex items-center gap-1 px-2.5 py-1.5 bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-[10px] text-[var(--c-text3)] hover:border-[var(--c-active)] hover:text-[var(--c-text2)] transition-all duration-150 shrink-0";

  return (
    <>
      {/* Selected group chip (in grouped mode, when sub is selected) */}
      {hasGroups && selectedGroupData && selectedSub && (
        <button
          onClick={() => { onSelect(null, null); setSelectedGroup(null); }}
          className={`${chipClass} bg-teal-500/15 border border-teal-500/30 hover:bg-red-50 hover:border-red-200`}
        >
          <span className="text-[11px] font-bold text-teal-400 group-hover:text-red-600 whitespace-nowrap">{selectedGroupData.label}</span>
          <i className="fa-solid fa-xmark text-teal-400 text-[9px] ml-0.5 opacity-60 group-hover:text-red-500 group-hover:opacity-100"></i>
        </button>
      )}

      {/* Selected group chip (when group chosen but no sub yet) */}
      {hasGroups && selectedGroup && !selectedSub && (
        <button
          onClick={() => setSelectedGroup(null)}
          className={`${chipClass} bg-teal-500/15 border border-teal-500/30 hover:bg-red-50 hover:border-red-200`}
        >
          <span className="text-[11px] font-bold text-teal-400 group-hover:text-red-600 whitespace-nowrap">{selectedGroup}</span>
          <i className="fa-solid fa-xmark text-teal-400 text-[9px] ml-0.5 opacity-60 group-hover:text-red-500 group-hover:opacity-100"></i>
        </button>
      )}

      {/* Selected sub chip */}
      {selectedSub && (
        <button
          onClick={() => {
            onSelect(null, null);
            // Keep group selected so user can pick a different sub
            if (hasGroups && selectedGroupData) setSelectedGroup(selectedGroupData.label);
          }}
          className={`${chipClass} bg-indigo-500/15 border border-indigo-500/30 hover:bg-red-50 hover:border-red-200`}
        >
          <span className="text-[11px] font-bold text-indigo-400 group-hover:text-red-600 whitespace-nowrap">
            {hasGroups && selectedGroupData ? stripPrefix(selectedSub, selectedGroupData.prefix) : selectedSub}
          </span>
          <i className="fa-solid fa-xmark text-indigo-400 text-[9px] ml-0.5 opacity-60 group-hover:text-red-500 group-hover:opacity-100"></i>
        </button>
      )}

      {/* Selected item chip */}
      {selectedItem && (
        <button
          onClick={() => onSelect(selectedSub, null)}
          className={`${chipClass} bg-purple-500/15 border border-purple-500/30 hover:bg-red-50 hover:border-red-200`}
        >
          <span className="text-[11px] font-bold text-purple-400 group-hover:text-red-600 whitespace-nowrap">{selectedItem}</span>
          <i className="fa-solid fa-xmark text-purple-400 text-[9px] ml-0.5 opacity-60 group-hover:text-red-500 group-hover:opacity-100"></i>
        </button>
      )}

      {/* ── DESKTOP OPTIONS ── */}

      {/* Group options (step 1 for grouped categories) — desktop */}
      {showingGroups && !isMobile && groups.map((g) => (
        <button
          key={g.label}
          onClick={() => {
            // If group has only 1 sub, skip straight to it
            if (g.subs.length === 1) {
              setSelectedGroup(g.label);
              onSelect(g.subs[0].name, null);
            } else {
              setSelectedGroup(g.label);
            }
          }}
          className={optionClass}
        >
          <span className="text-[11px] font-semibold whitespace-nowrap">{g.label}</span>
          {g.subs.length > 1 && (
            <span className="text-[9px] text-[var(--c-text-muted)] ml-0.5">{g.subs.length}</span>
          )}
        </button>
      ))}

      {/* Grouped subs (step 2 after group selected) */}
      {showingGroupedSubs && !isMobile && currentGroupSubs.map((sub) => (
        <button
          key={sub.name}
          onClick={() => onSelect(sub.name, null)}
          className={optionClass}
        >
          <span className="text-[11px] font-semibold whitespace-nowrap">
            {stripPrefix(sub.name, groups.find(g => g.label === selectedGroup)?.prefix || '')}
          </span>
        </button>
      ))}

      {/* Flat subcategory options (no grouping) */}
      {showingSubs && !isMobile && subs.map((sub) => (
        <button
          key={sub.name}
          onClick={() => onSelect(sub.name, null)}
          className={optionClass}
        >
          <span className="text-[11px] font-semibold whitespace-nowrap">{sub.name}</span>
        </button>
      ))}

      {/* Item options */}
      {showingItems && !isMobile && items.map((item) => (
        <button
          key={item}
          onClick={() => onSelect(selectedSub, item)}
          className={optionClass}
        >
          <span className="text-[11px] font-semibold whitespace-nowrap">{item}</span>
        </button>
      ))}

      {/* ── MOBILE INLINE CHIPS (scrollable) ── */}

      {showingGroups && isMobile && groups.map((g) => (
        <button
          key={g.label}
          onClick={() => {
            if (g.subs.length === 1) {
              setSelectedGroup(g.label);
              onSelect(g.subs[0].name, null);
            } else {
              setSelectedGroup(g.label);
            }
          }}
          className={optionClass}
        >
          <span className="text-[11px] font-semibold whitespace-nowrap">{g.label}</span>
          {g.subs.length > 1 && (
            <span className="text-[9px] text-[var(--c-text-muted)] ml-0.5">{g.subs.length}</span>
          )}
        </button>
      ))}

      {showingGroupedSubs && isMobile && currentGroupSubs.map((sub) => (
        <button
          key={sub.name}
          onClick={() => onSelect(sub.name, null)}
          className={optionClass}
        >
          <span className="text-[11px] font-semibold whitespace-nowrap">
            {stripPrefix(sub.name, groups?.find(g => g.label === selectedGroup)?.prefix || '')}
          </span>
        </button>
      ))}

      {showingSubs && isMobile && subs.map((sub) => (
        <button
          key={sub.name}
          onClick={() => onSelect(sub.name, null)}
          className={optionClass}
        >
          <span className="text-[11px] font-semibold whitespace-nowrap">{sub.name}</span>
        </button>
      ))}

      {showingItems && isMobile && items.map((item) => (
        <button
          key={item}
          onClick={() => onSelect(selectedSub, item)}
          className={optionClass}
        >
          <span className="text-[11px] font-semibold whitespace-nowrap">{item}</span>
        </button>
      ))}

      {/* Mobile bottom sheets removed — subcategory chips are now inline scrollable */}
    </>
  );
}

// ── Main Component ──────────────────────────────────────────────

export default function CategoryFilterBar({
  activeCategory,
  attributeFilters,
  onAttributeFiltersChange,
  onClearCategory,
  selectedSubCategory,
  selectedSubItem,
  onSubCategoryChange,
}: CategoryFilterBarProps) {
  const config = getCategoryFilters(activeCategory);
  const hasQuickFilters = config && config.quickFilters.length > 0;
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const isMobile = useIsMobile();

  // Close dropdown on category change
  useEffect(() => {
    setOpenFilter(null);
  }, [activeCategory]);

  const handleFilterSelect = useCallback((key: string, value: string | number | [number, number] | undefined) => {
    const newFilters = { ...attributeFilters };
    if (value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onAttributeFiltersChange(newFilters);
    if (isMobile) setOpenFilter(null);
  }, [attributeFilters, onAttributeFiltersChange, isMobile]);

  // Check if we have anything to show
  const hasSubCategories = useMemo(() => {
    const cat = CATEGORIES.find(c => c.name === activeCategory);
    return (cat?.subCategories?.length ?? 0) > 0;
  }, [activeCategory]);

  // Hide if no subcategories AND no filters
  if (!hasSubCategories && !hasQuickFilters) return null;

  const activeAttrCount = Object.keys(attributeFilters).length;

  return (
    <div className="flex flex-col items-center gap-1 w-full">
      {/* ── Row 1: Category chip + subcategories ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 px-1 max-w-5xl w-full">
        {/* Category chip — always first */}
        <button
          onClick={onClearCategory}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-[var(--c-accent-light)] border border-[var(--c-accent)]/30 rounded-[10px] hover:bg-red-50 hover:border-red-200 transition-all duration-150 group shrink-0"
        >
          <i className="fa-solid fa-tags text-[var(--c-accent)] text-[10px] group-hover:text-red-500"></i>
          <span className="text-[11px] font-bold text-[var(--c-accent)] group-hover:text-red-600 whitespace-nowrap">{activeCategory}</span>
          <i className="fa-solid fa-xmark text-[var(--c-accent)] text-[9px] ml-0.5 opacity-60 group-hover:text-red-500 group-hover:opacity-100"></i>
        </button>

        {/* Subcategory drilldown */}
        {hasSubCategories && (
          <SubCategoryDrilldown
            activeCategory={activeCategory}
            selectedSub={selectedSubCategory}
            selectedItem={selectedSubItem}
            onSelect={onSubCategoryChange}
            isMobile={isMobile}
          />
        )}
      </div>

      {/* ── Row 2: Attribute filter chips (all categories with filters) ── */}
      {hasQuickFilters && config && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 px-1 max-w-5xl w-full">
          {config.quickFilters.map((filter) => {
            const value = attributeFilters[filter.key];
            const hasValue = value !== undefined;

            if (filter.dependsOn && !attributeFilters[filter.dependsOn]) return null;

            return (
              <button
                key={filter.key}
                ref={(el) => { if (el) buttonRefs.current.set(filter.key, el); }}
                onClick={() => setOpenFilter(openFilter === filter.key ? null : filter.key)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[10px] border transition-all duration-150 shrink-0 ${
                  hasValue
                    ? 'bg-[var(--c-accent-light)] border-[var(--c-accent)]/30 text-[var(--c-accent)]'
                    : 'bg-[var(--c-card-alt)] border-[var(--c-border)] text-[var(--c-text3)] hover:border-[var(--c-active)] hover:text-[var(--c-text2)]'
                }`}
              >
                <span className="text-[11px] font-semibold whitespace-nowrap">
                  {hasValue ? getFilterDisplayValue(filter, value) : filter.label}
                </span>
                {hasValue ? (
                  <i
                    className="fa-solid fa-xmark text-[9px] ml-0.5 opacity-60 hover:opacity-100"
                    onClick={(e) => { e.stopPropagation(); handleFilterSelect(filter.key, undefined); }}
                  ></i>
                ) : (
                  <i className="fa-solid fa-chevron-down text-[8px] ml-0.5 opacity-50"></i>
                )}
              </button>
            );
          })}

          {/* Reset button for row 2 */}
          {activeAttrCount > 0 && (
            <button
              onClick={() => onAttributeFiltersChange({})}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 border border-red-500/20 rounded-[10px] hover:bg-red-500/20 transition-all duration-150 shrink-0"
            >
              <i className="fa-solid fa-rotate-left text-red-500 text-[9px]"></i>
              <span className="text-[11px] font-semibold text-red-500 whitespace-nowrap">Reset</span>
            </button>
          )}
        </div>
      )}

      {/* Desktop dropdown */}
      {hasQuickFilters && !isMobile && openFilter && (() => {
        const filter = config?.quickFilters.find(f => f.key === openFilter);
        if (!filter) return null;
        const ref = { current: buttonRefs.current.get(openFilter) || null };
        return (
          <FilterDropdown
            filter={filter}
            value={attributeFilters[filter.key]}
            onSelect={(val) => handleFilterSelect(filter.key, val)}
            onClose={() => setOpenFilter(null)}
            anchorRef={ref}
            activeCategory={activeCategory}
            attributeFilters={attributeFilters}
          />
        );
      })()}

      {/* Mobile bottom sheet */}
      {hasQuickFilters && isMobile && openFilter && (() => {
        const filter = config?.quickFilters.find(f => f.key === openFilter);
        if (!filter) return null;
        return (
          <BottomSheet
            isOpen={true}
            onClose={() => setOpenFilter(null)}
            title={filter.label}
          >
            <SelectSheetContent
              filter={filter}
              value={attributeFilters[filter.key]}
              onSelect={(val) => handleFilterSelect(filter.key, val)}
              activeCategory={activeCategory}
              attributeFilters={attributeFilters}
            />
          </BottomSheet>
        );
      })()}
    </div>
  );
}
