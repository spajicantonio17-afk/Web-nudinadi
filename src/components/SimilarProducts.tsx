'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSimilarProducts, type SimilarProduct } from '@/services/productService'

interface SimilarProductsProps {
  productId: string
  categoryId: string | null
  tags: string[]
  price: number
}

export default function SimilarProducts({ productId, categoryId, tags, price }: SimilarProductsProps) {
  const [products, setProducts] = useState<SimilarProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    getSimilarProducts(productId, categoryId, tags, price, 6)
      .then(data => {
        if (!cancelled) setProducts(data)
      })
      .catch(() => {
        if (!cancelled) setProducts([])
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [productId, categoryId, tags, price])

  // Don't render anything if no results and not loading
  if (!isLoading && products.length === 0) return null

  return (
    <div className="mt-8">
      <h2 className="text-[16px] font-bold text-[var(--c-text)] mb-4 flex items-center gap-2">
        <i className="fa-solid fa-shuffle text-[var(--c-accent)] text-[14px]"></i>
        Slični oglasi
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[var(--c-card)] rounded-[14px] border border-[var(--c-border)] h-[200px] animate-pulse">
              <div className="h-[120px] bg-[var(--c-card-alt)] rounded-t-[14px]"></div>
              <div className="p-2.5 space-y-2">
                <div className="h-3 bg-[var(--c-card-alt)] rounded w-3/4"></div>
                <div className="h-4 bg-[var(--c-card-alt)] rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {products.map(p => (
            <button
              key={p.id}
              onClick={() => router.push(`/product/${p.id}`)}
              className="bg-[var(--c-card)] rounded-[14px] border border-[var(--c-border)] overflow-hidden shrink-0 w-[160px] hover:shadow-medium hover:border-[var(--c-active)] transition-all duration-150 text-left"
            >
              {/* Image */}
              <div className="h-[110px] w-full bg-[var(--c-card-alt)] overflow-hidden">
                {p.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="fa-solid fa-image text-[var(--c-text-muted)] text-xl"></i>
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="p-2.5">
                <p className="text-[12px] font-semibold text-[var(--c-text)] line-clamp-2 leading-snug mb-1">
                  {p.title}
                </p>
                <p className="text-[13px] font-bold text-[var(--c-accent)]">
                  {p.price.toLocaleString('de-DE')} &euro;
                </p>
                {p.location && (
                  <p className="text-[10px] text-[var(--c-text3)] mt-0.5 truncate">{p.location}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
