'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { isBusiness } from '@/lib/plans';
import { createProduct } from '@/services/productService';
import { uploadProductImages } from '@/services/uploadService';
import { CATEGORIES } from '@/lib/constants';
import type { ProductCondition } from '@/lib/database.types';

const MAX_BATCH = 10;

interface BulkItem {
  id: string;
  title: string;
  price: string;
  description: string;
  condition: ProductCondition;
  categoryId: string;
  files: File[];
  previews: string[];
}

function createEmptyItem(): BulkItem {
  return {
    id: Math.random().toString(36).slice(2),
    title: '',
    price: '',
    description: '',
    condition: 'used',
    categoryId: '',
    files: [],
    previews: [],
  };
}

export default function BulkUploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [items, setItems] = useState<BulkItem[]>([createEmptyItem()]);
  const [publishing, setPublishing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Array<{ id: string; title: string }>>([]);

  // Access gate
  if (!isBusiness(user?.accountType)) {
    return (
      <MainLayout title="Masovno objavljivanje">
        <div className="max-w-lg mx-auto py-20 text-center">
          <div className="w-14 h-14 rounded-[14px] bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-layer-group text-purple-400 text-xl"></i>
          </div>
          <h2 className="text-lg font-black text-[var(--c-text)] mb-2">Masovno objavljivanje</h2>
          <p className="text-[11px] text-[var(--c-text3)] mb-6">Ova funkcija je dostupna samo za Business korisnike.</p>
          <Link href="/planovi" className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500 text-white rounded-[8px] text-[11px] font-bold hover:bg-purple-600 transition-colors">
            <i className="fa-solid fa-gem text-xs"></i> Nadogradi na Business
          </Link>
        </div>
      </MainLayout>
    );
  }

  const updateItem = (id: string, patch: Partial<BulkItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item));
  };

  const addItem = () => {
    if (items.length >= MAX_BATCH) {
      showToast(`Maksimalno ${MAX_BATCH} artikala po objavi.`, 'error');
      return;
    }
    setItems(prev => [...prev, createEmptyItem()]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleFileChange = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const previews = files.map(f => URL.createObjectURL(f));
    const item = items.find(i => i.id === itemId);
    if (item) {
      updateItem(itemId, {
        files: [...item.files, ...files],
        previews: [...item.previews, ...previews],
      });
    }
  };

  const removeImage = (itemId: string, index: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    updateItem(itemId, {
      files: item.files.filter((_, i) => i !== index),
      previews: item.previews.filter((_, i) => i !== index),
    });
  };

  const handlePublishAll = async () => {
    if (!user) return;

    // Validate
    const invalid = items.find(i => !i.title.trim() || !i.price.trim());
    if (invalid) {
      showToast('Popuni naslov i cijenu za sve artikle.', 'error');
      return;
    }

    setPublishing(true);
    setProgress(0);
    const published: Array<{ id: string; title: string }> = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        // Upload images
        let imageUrls: string[] = [];
        if (item.files.length > 0) {
          imageUrls = await uploadProductImages(user.id, item.files);
        }

        // Create product
        const product = await createProduct({
          seller_id: user.id,
          title: item.title.trim(),
          description: item.description.trim() || null,
          price: parseFloat(item.price),
          condition: item.condition,
          category_id: item.categoryId || null,
          images: imageUrls,
          status: 'active',
          location: user.location || null,
        });

        published.push({ id: product.id, title: product.title });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Greška';
        showToast(`Greška za "${item.title}": ${msg}`, 'error');
      }
      setProgress(i + 1);
    }

    setResults(published);
    setPublishing(false);
    if (published.length > 0) {
      showToast(`Uspješno objavljeno ${published.length} artikala!`);
    }
  };

  // Success view
  if (results.length > 0) {
    return (
      <MainLayout title="Masovno objavljivanje">
        <div className="max-w-lg mx-auto py-10 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-check text-emerald-400 text-xl"></i>
          </div>
          <h2 className="text-lg font-black text-[var(--c-text)] mb-2">Uspješno objavljeno {results.length} artikala!</h2>
          <div className="space-y-2 mt-6 text-left">
            {results.map(r => (
              <Link key={r.id} href={`/product/${r.id}`} className="block bg-[var(--c-card)] border border-[var(--c-border)] rounded-[8px] px-4 py-3 text-[11px] font-bold text-[var(--c-text)] hover:border-blue-500/40 transition-colors">
                <i className="fa-solid fa-box-open text-blue-400 mr-2"></i> {r.title}
              </Link>
            ))}
          </div>
          <button onClick={() => { setResults([]); setItems([createEmptyItem()]); }} className="mt-6 px-5 py-2.5 bg-purple-500 text-white rounded-[8px] text-[11px] font-bold hover:bg-purple-600 transition-colors">
            Objavi još
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Masovno objavljivanje">
      <div className="max-w-2xl mx-auto py-6 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-layer-group text-purple-400"></i>
            <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide">Masovno objavljivanje</h2>
            <span className="text-[9px] font-bold text-[var(--c-text3)] bg-[var(--c-hover)] border border-[var(--c-border)] px-2 py-0.5 rounded-full">{items.length}/{MAX_BATCH}</span>
          </div>
          <button
            onClick={addItem}
            disabled={items.length >= MAX_BATCH}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 text-white rounded-[8px] text-[10px] font-bold hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            <i className="fa-solid fa-plus text-[9px]"></i> Dodaj artikal
          </button>
        </div>

        {/* Progress bar during publishing */}
        {publishing && (
          <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[8px] p-4">
            <div className="flex items-center gap-3 mb-2">
              <i className="fa-solid fa-spinner animate-spin text-purple-400"></i>
              <span className="text-[11px] font-bold text-[var(--c-text)]">Objavljivanje... {progress}/{items.length}</span>
            </div>
            <div className="h-2 bg-[var(--c-hover)] rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all duration-300" style={{ width: `${(progress / items.length) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Item Cards */}
        {!publishing && items.map((item, idx) => (
          <div key={item.id} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[14px] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-[var(--c-text3)] uppercase tracking-wider">Artikal {idx + 1}</span>
              {items.length > 1 && (
                <button onClick={() => removeItem(item.id)} className="text-[9px] font-bold text-red-400 hover:text-red-300 transition-colors">
                  <i className="fa-solid fa-trash text-[9px] mr-1"></i> Ukloni
                </button>
              )}
            </div>

            {/* Images */}
            <div>
              <label className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-1.5">Slike</label>
              <div className="flex gap-2 flex-wrap">
                {item.previews.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-[6px] overflow-hidden border border-[var(--c-border)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(item.id, i)} className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center">
                      <i className="fa-solid fa-xmark text-white text-[7px]"></i>
                    </button>
                  </div>
                ))}
                <label className="w-16 h-16 rounded-[6px] border-2 border-dashed border-[var(--c-border)] flex items-center justify-center cursor-pointer hover:border-purple-500/40 transition-colors">
                  <i className="fa-solid fa-plus text-[var(--c-text-muted)] text-sm"></i>
                  <input type="file" accept="image/*" multiple onChange={e => handleFileChange(item.id, e)} className="hidden" />
                </label>
              </div>
            </div>

            {/* Title + Price */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-1">Naslov</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={e => updateItem(item.id, { title: e.target.value })}
                  placeholder="Naslov artikla"
                  className="w-full bg-[var(--c-bg)] border border-[var(--c-border)] rounded-[6px] px-2.5 py-2 text-[11px] text-[var(--c-text)] placeholder-[var(--c-text-muted)] focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-1">Cijena (€)</label>
                <input
                  type="number"
                  value={item.price}
                  onChange={e => updateItem(item.id, { price: e.target.value })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full bg-[var(--c-bg)] border border-[var(--c-border)] rounded-[6px] px-2.5 py-2 text-[11px] text-[var(--c-text)] placeholder-[var(--c-text-muted)] focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            {/* Category + Condition */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-1">Kategorija</label>
                <select
                  value={item.categoryId}
                  onChange={e => updateItem(item.id, { categoryId: e.target.value })}
                  className="w-full bg-[var(--c-bg)] border border-[var(--c-border)] rounded-[6px] px-2.5 py-2 text-[11px] text-[var(--c-text)] focus:outline-none focus:border-purple-500/50"
                >
                  <option value="">Odaberi</option>
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-1">Stanje</label>
                <select
                  value={item.condition}
                  onChange={e => updateItem(item.id, { condition: e.target.value as ProductCondition })}
                  className="w-full bg-[var(--c-bg)] border border-[var(--c-border)] rounded-[6px] px-2.5 py-2 text-[11px] text-[var(--c-text)] focus:outline-none focus:border-purple-500/50"
                >
                  <option value="new">Novo</option>
                  <option value="like_new">Kao novo</option>
                  <option value="used">Korišteno</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-1">Opis (opcionalno)</label>
              <textarea
                value={item.description}
                onChange={e => updateItem(item.id, { description: e.target.value })}
                placeholder="Detalji, specifikacije..."
                rows={2}
                className="w-full bg-[var(--c-bg)] border border-[var(--c-border)] rounded-[6px] px-2.5 py-2 text-[11px] text-[var(--c-text)] placeholder-[var(--c-text-muted)] focus:outline-none focus:border-purple-500/50 resize-none"
              />
            </div>
          </div>
        ))}

        {/* Publish Button */}
        {!publishing && (
          <button
            onClick={handlePublishAll}
            disabled={items.length === 0}
            className="w-full py-3.5 bg-purple-500 text-white rounded-[10px] text-[12px] font-black uppercase tracking-wider hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            <i className="fa-solid fa-rocket mr-2"></i>
            Objavi sve ({items.length} artikala)
          </button>
        )}
      </div>
    </MainLayout>
  );
}
