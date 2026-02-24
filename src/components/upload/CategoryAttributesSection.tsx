'use client';

import React from 'react';
import { getCategoryFields, type CategoryField, type AttributeValues } from '@/lib/category-attributes';

interface Props {
  category: string;
  attributes: AttributeValues;
  onChange: (key: string, value: string | number | boolean) => void;
  /** Which form page to render (1, 2, or 3). If undefined, renders all fields. */
  formPage?: number;
  /** Keys to exclude (e.g. already shown elsewhere in the form) */
  excludeKeys?: string[];
}

export default function CategoryAttributesSection({
  category,
  attributes,
  onChange,
  formPage,
  excludeKeys,
}: Props) {
  const allFields = getCategoryFields(category);

  const fields = allFields.filter(f => {
    if (excludeKeys?.includes(f.key)) return false;
    if (formPage !== undefined) return f.formPage === formPage;
    return true;
  });

  if (fields.length === 0) return null;

  const booleanFields = fields.filter(f => f.type === 'boolean');
  const regularFields = fields.filter(f => f.type !== 'boolean');

  return (
    <div className="space-y-3">
      {regularFields.map(field => (
        <FieldInput
          key={field.key}
          field={field}
          value={attributes[field.key]}
          onChange={onChange}
        />
      ))}

      {booleanFields.length > 0 && (
        <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-xl p-4">
          <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-widest mb-3">
            Oprema i karakteristike
          </p>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            {booleanFields.map(field => (
              <BooleanToggle
                key={field.key}
                field={field}
                value={!!attributes[field.key]}
                onChange={onChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Field Input ───────────────────────────────────────────

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: CategoryField;
  value: AttributeValues[string] | undefined;
  onChange: (key: string, value: string | number | boolean) => void;
}) {
  const strValue = value != null ? String(value) : '';

  if (field.type === 'select') {
    return (
      <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-xl px-4 py-3 focus-within:border-gray-400 transition-colors">
        <label className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-widest block mb-1">
          {field.label}
        </label>
        <select
          value={strValue}
          onChange={e => onChange(field.key, e.target.value)}
          className="w-full bg-[var(--c-card)] text-sm text-[var(--c-text)] outline-none cursor-pointer"
        >
          <option value="">— Odaberite —</option>
          {field.options?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-xl px-4 py-3 focus-within:border-gray-400 transition-colors">
      <label className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-widest block mb-1">
        {field.label}{field.unit ? ` (${field.unit})` : ''}
      </label>
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        value={strValue}
        onChange={e =>
          onChange(
            field.key,
            field.type === 'number' ? Number(e.target.value) : e.target.value
          )
        }
        placeholder={field.placeholder || ''}
        className="w-full bg-transparent text-sm text-[var(--c-text)] placeholder:text-[var(--c-placeholder)] outline-none"
      />
    </div>
  );
}

// ── Boolean Toggle ────────────────────────────────────────

function BooleanToggle({
  field,
  value,
  onChange,
}: {
  field: CategoryField;
  value: boolean;
  onChange: (key: string, value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(field.key, !value)}
      className={`flex items-center gap-2 text-left transition-colors ${value ? 'text-[var(--c-text)]' : 'text-[var(--c-text3)]'}`}
    >
      <div
        className={`w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0 ${
          value
            ? 'bg-blue-500 border-blue-500'
            : 'border-[var(--c-border)] bg-transparent'
        }`}
      >
        {value && <i className="fa-solid fa-check text-white" style={{ fontSize: '8px' }}></i>}
      </div>
      <span className="text-[11px] font-semibold leading-tight">{field.label}</span>
    </button>
  );
}
