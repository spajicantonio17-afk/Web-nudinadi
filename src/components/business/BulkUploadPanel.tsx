'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/Toast';
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

export default function BulkUploadPanel() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();
  const [items, setItems] = useState<BulkItem[]>([createEmptyItem()]);
  const [publishing, setPublishing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Array<{ id: string; title: string }>>([]);

  const updateItem = (id: string, patch: Partial<BulkItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item));
  };

  const addItem = () => {
    if (items.length >= MAX_BATCH) {
      showToast(t('business.bulkMax', { max: MAX_BATCH }), 'error');
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
      showToast(t('business.fillTitlePrice'), 'error');
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
        const msg = err instanceof Error ? err.message : t('business.genericError');
        showToast(`${t('business.errorFor')} "${item.title}": ${msg}`, 'error');
      }
      setProgress(i + 1);
    }

    setResults(published);
    setPublishing(false);
    if (published.length > 0) {
      showToast(t('business.bulkSuccess', { count: published.length }));
    }
  };

  // Success view
  if (results.length > 0) {
    return (
      <div className="max-w-lg mx-auto py-10 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
          <i className="fa-solid fa-check text-emerald-400 text-xl"></i>
        </div>
        <h2 className="text-lg font-black text-[var(--c-text)] mb-2">{t('business.bulkSuccess', { count: results.length })}</h2>
        <div className="space-y-2 mt-6 text-left">
          {results.map(r => (
            <Link key={r.id} href={`/product/${r.id}`} className="block bg-[var(--c-card)] border border-[var(--c-border)] rounded-[8px] px-4 py-3 text-[11px] font-bold text-[var(--c-text)] hover:border-blue-500/40 transition-colors">
              <i className="fa-solid fa-box-open text-blue-400 mr-2"></i> {r.title}
            </Link>
          ))}
        </div>
        <button onClick={() => { setResults([]); setItems([createEmptyItem()]); }} className="mt-6 px-5 py-2.5 bg-purple-500 text-white rounded-[8px] text-[11px] font-bold hover:bg-purple-600 transition-colors">
          {t('business.publishMore')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-layer-group text-purple-400"></i>
          <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide">{t('business.bulkUpload')}</h2>
          <span className="text-[9px] font-bold text-[var(--c-text3)] bg-[var(--c-hover)] border border-[var(--c-border)] px-2 py-0.5 rounded-full">{items.length}/{MAX_BATCH}</span>
        </div>
        <button
          onClick={addItem}
          disabled={items.length >= MAX_BATCH}
          className="flex items-center gap-1.5 px-3 min-h-[44px] bg-purple-500 text-white rounded-[8px] text-[10px] font-bold hover:bg-purple-600 transition-colors disabled:opacity-50"
        >
          <i className="fa-solid fa-plus text-[9px]"></i> {t('business.addArticle')}
        </button>
      </div>

      {/* Progress bar during publishing */}
      {publishing && (
        <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[8px] p-4">
          <div className="flex items-center gap-3 mb-2">
            <i className="fa-solid fa-spinner animate-spin text-purple-400"></i>
            <span className="text-[11px] font-bold text-[var(--c-text)]">{t('business.publishing')} {progress}/{items.length}</span>
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
            <span className="text-[10px] font-black text-[var(--c-text3)] uppercase tracking-wider">{t('business.article')} {idx + 1}</span>
            {items.length > 1 && (
              <button onClick={() => removeItem(item.id)} className="min-h-[44px] flex items-center text-[9px] font-bold text-red-400 hover:text-red-300 transition-colors">
                <i className="fa-solid fa-trash text-[9px] mr-1"></i> {t('business.remove')}
              </button>
            )}
          </div>

          {/* Images */}
          <div>
            <label className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-1.5">{t('business.images')}</label>
            <div className="flex gap-2 flex-wrap">
              {item.previews.map((url, i) => (
                <div key={i} className="relative w-16 h-16 rounded-[6px] overflow-hidden border border-[var(--c-border)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {/* before-overlay enlarges the tap area to ~44px without changing the visual size */}
                  <button
                    onClick={() => removeImage(item.id, i)}
                    aria-label={t('business.remove')}
                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center before:absolute before:-inset-3.5 before:content-['']"
                  >
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
              <label className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-1">{t('business.fieldTitle')}</label>
              <input
                type="text"
                value={item.title}
                onChange={e => updateItem(item.id, { title: e.target.value })}
                placeholder={t('business.fieldTitlePlaceholder')}
                className="w-full bg-[var(--c-bg)] border border-[var(--c-border)] rounded-[6px] px-2.5 py-2 text-[11px] text-[var(--c-text)] placeholder-[var(--c-text-muted)] focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-1">{t('business.fieldPrice')}</label>
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
            <div className="min-w-0">
              <label className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-1">{t('business.fieldCategory')}</label>
              <select
                value={item.categoryId}
                onChange={e => updateItem(item.id, { categoryId: e.target.value })}
                className="w-full min-w-0 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-[6px] px-2.5 min-h-[44px] text-[11px] text-[var(--c-text)] focus:outline-none focus:border-purple-500/50"
              >
                <option value="">{t('business.select')}</option>
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-1">{t('business.fieldCondition')}</label>
              <select
                value={item.condition}
                onChange={e => updateItem(item.id, { condition: e.target.value as ProductCondition })}
                className="w-full min-w-0 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-[6px] px-2.5 min-h-[44px] text-[11px] text-[var(--c-text)] focus:outline-none focus:border-purple-500/50"
              >
                <option value="new">{t('business.conditionNew')}</option>
                <option value="like_new">{t('business.conditionLikeNew')}</option>
                <option value="used">{t('business.conditionUsed')}</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-1">{t('business.fieldDescription')}</label>
            <textarea
              value={item.description}
              onChange={e => updateItem(item.id, { description: e.target.value })}
              placeholder={t('business.fieldDescriptionPlaceholder')}
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
          {t('business.publishAll')} ({items.length})
        </button>
      )}
    </div>
  );
}
