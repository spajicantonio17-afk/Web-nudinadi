'use client';

import React, { useState, useRef } from 'react';
import type { ProductFull, ProductStatus } from '@/lib/database.types';
import { uploadProductImage } from '@/services/uploadService';
import { useAuth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'active', label: 'Aktivan' },
  { value: 'sold', label: 'Prodan' },
  { value: 'pending_sale', label: 'Na čekanju' },
  { value: 'archived', label: 'Arhiviran' },
  { value: 'draft', label: 'Nacrt' },
];

interface Props {
  product: ProductFull;
  onClose: () => void;
  onSaved: (updated: Partial<ProductFull>) => void;
}

export default function ProductEditModal({ product, onClose, onSaved }: Props) {
  const { user } = useAuth();
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description ?? '');
  const [price, setPrice] = useState(String(product.price));
  const [status, setStatus] = useState<ProductStatus>(product.status);
  const [images, setImages] = useState<string[]>(product.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemoveImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (!user) { setError('Niste prijavljeni'); return; }
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(f => uploadProductImage(user.id, f)));
      setImages(prev => [...prev, ...urls]);
    } catch {
      setError('Greška pri uploadu slike');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!title.trim()) { setError('Naslov je obavezan'); return; }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) { setError('Cijena nije ispravna'); return; }

    setSaving(true);
    setError('');
    try {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setError('Niste prijavljeni'); return; }

      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || null, price: priceNum, status, images }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? 'Greška pri čuvanju');
        return;
      }

      onSaved({ title: title.trim(), description: description.trim() || null, price: priceNum, status, images });
      onClose();
    } catch {
      setError('Greška pri čuvanju');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-[var(--c-card)] rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--c-border)]">
          <h2 className="font-semibold text-[var(--c-text)]">Uredi oglas</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text2)]">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Images */}
          <div>
            <label className="block text-xs font-medium text-[var(--c-text2)] mb-2">Slike</label>
            <div className="flex flex-wrap gap-2">
              {images.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <i className="fa-solid fa-trash text-white text-sm" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-[var(--c-border)] flex flex-col items-center justify-center text-[var(--c-text-muted)] hover:border-blue-400 hover:text-blue-500 transition-colors text-xs gap-1"
              >
                {uploading
                  ? <i className="fa-solid fa-spinner fa-spin" />
                  : <><i className="fa-solid fa-plus" /><span>Dodaj</span></>
                }
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAddImages} />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-[var(--c-text2)] mb-1">Naslov</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[var(--c-border)] rounded-lg bg-[var(--c-card)] text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-[var(--c-text2)] mb-1">Opis</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 text-sm border border-[var(--c-border)] rounded-lg bg-[var(--c-card)] text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Price + Status */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-[var(--c-text2)] mb-1">Cijena (€)</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                min={0}
                step={0.01}
                className="w-full px-3 py-2 text-sm border border-[var(--c-border)] rounded-lg bg-[var(--c-card)] text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-[var(--c-text2)] mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ProductStatus)}
                className="w-full px-3 py-2 text-sm border border-[var(--c-border)] rounded-lg bg-[var(--c-card)] text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              <i className="fa-solid fa-circle-exclamation mr-1" />{error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-[var(--c-border)]">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm font-medium rounded-xl border border-[var(--c-border)] text-[var(--c-text2)] hover:bg-[var(--c-hover)] transition-colors"
          >
            Odustani
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex-1 py-2 text-sm font-medium rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {saving ? <i className="fa-solid fa-spinner fa-spin" /> : 'Sačuvaj'}
          </button>
        </div>
      </div>
    </div>
  );
}
