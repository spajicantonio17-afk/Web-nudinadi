'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { isBusiness } from '@/lib/plans';
import { getBusinessStats, getTopProducts, exportProductsCsv } from '@/services/businessService';
import { getUserProducts } from '@/services/productService';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [stats, setStats] = useState<{ totalViews30d: number; totalFavorites30d: number; activeListings: number; soldItems30d: number } | null>(null);
  const [topProducts, setTopProducts] = useState<Array<{ id: string; title: string; images: string[]; views_count: number; favorites_count: number; status: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !isBusiness(user?.accountType)) return;
    Promise.all([
      getBusinessStats(user.id),
      getTopProducts(user.id, 5),
    ]).then(([s, tp]) => {
      setStats(s);
      setTopProducts(tp);
    }).finally(() => setLoading(false));
  }, [user?.id, user?.accountType]);

  // Access gate
  if (!isBusiness(user?.accountType)) {
    return (
      <MainLayout title={t('analytics.title')}>
        <div className="max-w-lg mx-auto py-20 text-center">
          <div className="w-14 h-14 rounded-[14px] bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-chart-line text-purple-400 text-xl"></i>
          </div>
          <h2 className="text-lg font-black text-[var(--c-text)] mb-2">{t('analytics.title')}</h2>
          <p className="text-[11px] text-[var(--c-text3)] mb-6">{t('analytics.businessOnly')}</p>
          <Link href="/planovi" className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500 text-white rounded-[8px] text-[11px] font-bold hover:bg-purple-600 transition-colors">
            <i className="fa-solid fa-gem text-xs"></i> {t('analytics.upgradeBusiness')}
          </Link>
        </div>
      </MainLayout>
    );
  }

  const handleExportCsv = async () => {
    if (!user?.id) return;
    try {
      const products = await getUserProducts(user.id);
      const csv = exportProductsCsv(
        products.map(p => ({
          title: p.title,
          price: p.price,
          category: (p.category as { name?: string } | null)?.name || '',
          condition: p.condition,
          status: p.status,
          views_count: p.views_count,
          favorites_count: p.favorites_count,
          created_at: p.created_at,
        }))
      );
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nudinadi-products-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent
    }
  };

  const statCards = stats ? [
    { icon: 'fa-eye', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', value: stats.totalViews30d, label: t('analytics.totalViews') },
    { icon: 'fa-heart', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', value: stats.totalFavorites30d, label: t('analytics.totalFavorites') },
    { icon: 'fa-box-open', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', value: stats.activeListings, label: t('analytics.activeListings') },
    { icon: 'fa-check-circle', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', value: stats.soldItems30d, label: t('analytics.sold30d') },
  ] : [];

  return (
    <MainLayout title={t('analytics.title')}>
      <div className="max-w-2xl mx-auto py-6 space-y-4">

        {/* Header */}
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-chart-line text-purple-400"></i>
          <h2 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide">{t('analytics.title')}</h2>
        </div>

        {loading ? (
          <div className="py-10 text-center">
            <i className="fa-solid fa-spinner animate-spin text-[var(--c-text-muted)] text-lg"></i>
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {statCards.map(card => (
                <div key={card.label} className={`${card.bg} border rounded-[4px] p-4 flex flex-col items-center gap-1 text-center`}>
                  <i className={`fa-solid ${card.icon} ${card.color} text-sm`}></i>
                  <span className="text-2xl font-black text-[var(--c-text)] leading-none">{card.value.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-wider">{card.label}</span>
                </div>
              ))}
            </div>

            {/* Top 5 Articles */}
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] overflow-hidden">
              <div className="p-4 border-b border-[var(--c-border)]">
                <h3 className="text-[11px] font-black text-[var(--c-text)] uppercase tracking-wide">{t('analytics.topProducts')}</h3>
              </div>
              {topProducts.length === 0 ? (
                <p className="text-[10px] text-[var(--c-text-muted)] text-center py-6">{t('analytics.noData')}</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--c-border)]">
                      <th className="text-left text-[9px] font-black text-[var(--c-text3)] uppercase tracking-wide p-3">{t('analytics.colProduct')}</th>
                      <th className="text-center text-[9px] font-black text-[var(--c-text3)] uppercase tracking-wide p-3 w-20">{t('analytics.colViews')}</th>
                      <th className="text-center text-[9px] font-black text-[var(--c-text3)] uppercase tracking-wide p-3 w-20">{t('analytics.colFavorites')}</th>
                      <th className="text-center text-[9px] font-black text-[var(--c-text3)] uppercase tracking-wide p-3 w-20">{t('analytics.colStatus')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, i) => (
                      <tr key={p.id} className={i % 2 === 0 ? '' : 'bg-[var(--c-bg)]'}>
                        <td className="p-3">
                          <Link href={`/product/${p.id}`} className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-[4px] overflow-hidden shrink-0 border border-[var(--c-border)]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p.images?.[0] || `https://picsum.photos/seed/${p.id}/100/100`} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[10px] font-bold text-[var(--c-text)] group-hover:text-blue-400 truncate transition-colors">{p.title}</span>
                          </Link>
                        </td>
                        <td className="text-center text-[10px] font-bold text-[var(--c-text)] p-3">{p.views_count}</td>
                        <td className="text-center text-[10px] font-bold text-[var(--c-text)] p-3">{p.favorites_count}</td>
                        <td className="text-center p-3">
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-[3px] ${
                            p.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[var(--c-hover)] text-[var(--c-text3)] border border-[var(--c-border)]'
                          }`}>{p.status === 'active' ? t('analytics.statusActive') : p.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Chart Placeholder */}
            <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-8 text-center">
              <i className="fa-solid fa-chart-line text-2xl text-[var(--c-text-muted)] mb-3"></i>
              <p className="text-[11px] font-bold text-[var(--c-text3)]">{t('analytics.chartSoon')}</p>
            </div>

            {/* CSV Export */}
            <button
              onClick={handleExportCsv}
              className="w-full py-3 bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] text-[11px] font-bold text-[var(--c-text)] hover:border-purple-500/40 transition-colors flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-download text-purple-400 text-xs"></i> {t('analytics.downloadCsv')}
            </button>
          </>
        )}
      </div>
    </MainLayout>
  );
}
