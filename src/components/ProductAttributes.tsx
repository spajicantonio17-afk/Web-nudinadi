'use client';

import React from 'react';
import { getCategoryFields, type CategoryField } from '@/lib/category-attributes';
import { CATEGORIES } from '@/lib/constants';
import { resolveVehicleType } from '@/lib/vehicle-models';

interface ProductAttributesProps {
  categoryName: string;
  attributes: Record<string, string | number | boolean | string[]> | null;
}

// ── Resolve DB category name → full path string for getCategoryFields() ──

function resolveCategoryPath(categoryName: string): { path: string; parentName: string } {
  for (const cat of CATEGORIES) {
    if (cat.name === categoryName) return { path: cat.name, parentName: cat.name };
    for (const sub of cat.subCategories) {
      if (sub.name === categoryName) return { path: `${cat.name} - ${sub.name}`, parentName: cat.name };
      if (sub.items?.includes(categoryName)) {
        return { path: `${cat.name} - ${sub.name} - ${categoryName}`, parentName: cat.name };
      }
    }
  }
  return { path: categoryName, parentName: '' };
}

// ── Format a raw attribute value for display ──

function formatValue(raw: string | number | boolean | string[], field: CategoryField): string {
  if (Array.isArray(raw)) return raw.join(', ');
  if (typeof raw === 'number') {
    const formatted = raw.toLocaleString('de-DE');
    return field.unit ? `${formatted} ${field.unit}` : formatted;
  }
  if (typeof raw === 'boolean') return raw ? 'Da' : 'Ne';
  const str = String(raw);
  return field.unit ? `${str} ${field.unit}` : str;
}

// ── Keys to skip (displayed elsewhere in the page) ──

const SKIP_KEYS = new Set(['price_type']);

export default function ProductAttributes({ categoryName, attributes }: ProductAttributesProps) {
  if (!attributes || !categoryName) return null;

  const { path, parentName } = resolveCategoryPath(categoryName);

  // For vehicles, infer vehicleType from subcategory name
  const isVehicle = parentName === 'Vozila' || parentName === 'Dijelovi za automobile';
  const vehicleType = isVehicle ? resolveVehicleType(categoryName) : undefined;

  const allFields = getCategoryFields(path, vehicleType);
  if (allFields.length === 0) return null;

  // Split fields into specs vs equipment
  const specFields: Array<{ field: CategoryField; display: string }> = [];
  const equipmentFields: CategoryField[] = [];

  for (const field of allFields) {
    if (SKIP_KEYS.has(field.key)) continue;
    const raw = attributes[field.key];

    if (field.type === 'boolean') {
      if (raw === true) equipmentFields.push(field);
    } else {
      if (raw == null || raw === '') continue;
      if (typeof raw === 'number' && isNaN(raw)) continue;
      specFields.push({ field, display: formatValue(raw, field) });
    }
  }

  if (specFields.length === 0 && equipmentFields.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* SPECS TABLE */}
      {specFields.length > 0 && (
        <div className="bg-[var(--c-card-alt)] border border-[var(--c-border2)] rounded-sm overflow-hidden">
          <h3 className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-widest p-4 sm:p-6 pb-0 ml-4 sm:ml-6 border-l-2 border-blue-500 pl-2">
            Specifikacije
          </h3>
          <div className="p-4 sm:p-6 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
              {specFields.map(({ field, display }, i) => (
                <div
                  key={field.key}
                  className={`flex justify-between items-center py-2.5 border-b border-[var(--c-border)] ${
                    i % 2 === 0 ? 'sm:pr-4 sm:border-r sm:border-r-[var(--c-border)]' : 'sm:pl-4'
                  }`}
                >
                  <span className="text-xs text-[var(--c-text3)]">{field.label}</span>
                  <span className="text-sm font-semibold text-[var(--c-text)]">{display}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EQUIPMENT CHECKMARKS */}
      {equipmentFields.length > 0 && (
        <div className="bg-[var(--c-card-alt)] border border-[var(--c-border2)] rounded-sm p-4 sm:p-6">
          <h3 className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-widest mb-4 border-l-2 border-blue-500 pl-2">
            Oprema i karakteristike
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4">
            {equipmentFields.map(field => (
              <div key={field.key} className="flex items-center gap-2">
                <i className="fa-solid fa-check text-emerald-500 text-xs" />
                <span className="text-xs text-[var(--c-text2)]">{field.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
