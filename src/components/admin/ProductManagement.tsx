'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getProducts, deleteProduct } from '@/services/productService';
import type { ProductFull, ProductStatus } from '@/lib/database.types';

const STATUS_LABELS: Record<ProductStatus, string> = {
  active: 'Aktivan',
  sold: 'Prodan',
  pending_sale: 'Na čekanju',
  archived: 'Arhiviran',
  draft: 'Nacrt',
};

const STATUS_COLORS: Record<ProductStatus, string> = {
  active: 'bg-green-100 text-green-700',
  sold: 'bg-blue-100 text-blue-700',
  pending_sale: 'bg-amber-100 text-amber-700',
  archived: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-600',
};

const STATUS_FILTERS: { value: ProductStatus | ''; label: string }[] = [
  { value: '', label: 'Svi statusi' },
  { value: 'active', label: 'Aktivni' },
  { value: 'pending_sale', label: 'Na čekanju' },
  { value: 'archived', label: 'Arhivirani' },
  { value: 'sold', label: 'Prodani' },
];

export default function ProductManagement() {
  const [products, setProducts] = useState<ProductFull[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        search: search || undefined,
        status: statusFilter || undefined,
        limit: 30,
        sortBy: 'created_at' as const,
        sortOrder: 'desc' as const,
      };
      const { data, count } = await getProducts(filters);
      setProducts(data);
      setTotal(count);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setTotal(prev => prev - 1);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('bs', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text-muted)] text-sm" />
          <input
            type="text"
            placeholder="Pretraži oglase..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-[var(--c-border)] rounded-lg bg-[var(--c-card)] text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as ProductStatus | '')}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_FILTERS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <span className="text-sm text-[var(--c-text2)] ml-auto">{total} oglasa ukupno</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-gray-400" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <i className="fa-solid fa-box-open text-4xl mb-3 block" />
          <p>Nema oglasa za prikaz</p>
        </div>
      ) : (
        <div className="bg-[var(--c-card)] rounded-xl border border-[var(--c-border)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--c-border)] bg-[var(--c-card-alt)]">
                  <th className="p-3 text-left">Oglas</th>
                  <th className="p-3 text-left">Prodavač</th>
                  <th className="p-3 text-right">Cijena</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-left">Datum</th>
                  <th className="p-3 w-20 text-center">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b border-[var(--c-border)] hover:bg-[var(--c-hover)] transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={product.images[0]}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <i className="fa-solid fa-image text-gray-400 text-xs" />
                          </div>
                        )}
                        <span className="font-medium text-[var(--c-text)] truncate max-w-[180px]">{product.title}</span>
                      </div>
                    </td>
                    <td className="p-3 text-[var(--c-text2)]">
                      {product.seller ? `@${product.seller.username}` : '—'}
                    </td>
                    <td className="p-3 text-right font-medium text-[var(--c-text)]">
                      {product.price.toFixed(2)} €
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[product.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[product.status] || product.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-[var(--c-text2)] whitespace-nowrap">
                      {formatDate(product.created_at)}
                    </td>
                    <td className="p-3 text-center">
                      {confirmId === product.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                          >
                            {deletingId === product.id ? <i className="fa-solid fa-spinner fa-spin" /> : 'Da'}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                          >
                            Ne
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(product.id)}
                          className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center mx-auto"
                          title="Izbriši oglas"
                        >
                          <i className="fa-solid fa-trash text-xs" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
