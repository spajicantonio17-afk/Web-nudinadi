'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { Product, Profile } from '@/lib/database.types';
import { useI18n } from '@/lib/i18n';

interface ProductWithSeller extends Product {
  seller: Pick<Profile, 'id' | 'username' | 'account_type' | 'avatar_url' | 'company_name'>;
}

export default function FeaturedManagement() {
  const { t } = useI18n();
  const [products, setProducts] = useState<ProductWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'business' | 'featured'>('all');
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = getSupabase();
      let query = supabase
        .from('products')
        .select('*, seller:profiles!products_seller_id_fkey(id, username, account_type, avatar_url, company_name)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter === 'featured') {
        query = query.eq('is_featured', true);
      }

      if (search.trim()) {
        query = query.ilike('title', `%${search.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      let items = (data || []) as unknown as ProductWithSeller[];

      // Client-side filter for business-only (since seller is joined)
      if (filter === 'business') {
        items = items.filter(p => p.seller?.account_type === 'business');
      }

      setProducts(items);
    } catch (err) {
      console.error('FeaturedManagement fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleFeatured = async (productId: string, currentValue: boolean) => {
    setToggling(productId);
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('products')
        .update({ is_featured: !currentValue })
        .eq('id', productId);
      if (error) throw error;

      setProducts(prev =>
        prev.map(p => p.id === productId ? { ...p, is_featured: !currentValue } : p)
      );
    } catch (err) {
      console.error('Toggle featured error:', err);
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[var(--c-text)]">
          <i className="fa-solid fa-star text-amber-500 mr-2" />
          {t('admin.featured.title')}
        </h2>
        <p className="text-sm text-[var(--c-text2)] mt-0.5">{t('admin.featured.subtitle')}</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text3)] text-xs" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('admin.featured.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-[var(--c-card)] border border-[var(--c-border)] rounded-xl text-[var(--c-text)] placeholder:text-[var(--c-text3)] focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-1 bg-[var(--c-card-alt)] rounded-xl p-1">
          {(['all', 'business', 'featured'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-[var(--c-card)] text-[var(--c-text)] shadow-sm'
                  : 'text-[var(--c-text2)] hover:text-[var(--c-text)]'
              }`}
            >
              {f === 'all' ? t('admin.featured.allTypes') : f === 'business' ? t('admin.featured.businessOnly') : t('admin.featured.featuredOnly')}
            </button>
          ))}
        </div>
      </div>

      {/* Products List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-blue-500" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-xl p-8 text-center">
          <i className="fa-solid fa-box-open text-2xl text-[var(--c-text3)] mb-2 block" />
          <p className="text-sm text-[var(--c-text2)]">{t('admin.featured.noResults')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map(p => (
            <div
              key={p.id}
              className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-xl p-3 flex items-center gap-3 hover:border-[var(--c-border2)] transition-colors"
            >
              {/* Product Image */}
              <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--c-card-alt)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.images?.[0] || `https://picsum.photos/seed/${p.id}/100/100`}
                  alt={p.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--c-text)] truncate">{p.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-blue-500 font-bold">
                    {Number(p.price).toLocaleString()} &euro;
                  </span>
                  <span className="text-[9px] text-[var(--c-text3)]">&middot;</span>
                  <span className="text-[10px] text-[var(--c-text3)]">
                    {t('admin.featured.seller')}: @{p.seller?.username || '—'}
                  </span>
                  {p.seller?.account_type === 'business' && (
                    <span className="text-[8px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">
                      BIZ
                    </span>
                  )}
                </div>
              </div>

              {/* Toggle Button */}
              <button
                onClick={() => toggleFeatured(p.id, p.is_featured)}
                disabled={toggling === p.id}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  p.is_featured
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300'
                    : 'bg-[var(--c-card-alt)] text-[var(--c-text3)] hover:text-[var(--c-text)] border border-[var(--c-border)]'
                }`}
              >
                {toggling === p.id ? (
                  <i className="fa-solid fa-spinner fa-spin text-[10px]" />
                ) : (
                  <i className={`fa-solid fa-star text-[10px] ${p.is_featured ? 'text-amber-500' : ''}`} />
                )}
                {p.is_featured ? t('admin.featured.featured') : t('admin.featured.notFeatured')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
