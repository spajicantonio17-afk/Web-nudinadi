import type { MetadataRoute } from 'next'
import { createAdminSupabase } from '@/lib/supabase-server'

const BASE_URL = 'https://nudinadi.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { path: '/', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/kako-funkcionira', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/o-nama', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/kontakt', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/planovi', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/uvjeti', priority: 0.5, changeFrequency: 'yearly' as const },
    { path: '/privatnost', priority: 0.5, changeFrequency: 'yearly' as const },
    { path: '/kolacici', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/impressum', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/pomoc', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/sigurnost', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/blog', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/press', priority: 0.4, changeFrequency: 'monthly' as const },
    { path: '/karijere', priority: 0.4, changeFrequency: 'monthly' as const },
    { path: '/partneri', priority: 0.4, changeFrequency: 'monthly' as const },
  ]

  const staticEntries: MetadataRoute.Sitemap = staticPages.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))

  // Fetch dynamic content from Supabase
  try {
    const supabase = await createAdminSupabase()

    const [productsRes, profilesRes] = await Promise.all([
      supabase
        .from('products')
        .select('id, updated_at')
        .eq('status', 'active')
        .order('updated_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('username, updated_at')
        .not('username', 'is', null),
    ])

    const productEntries: MetadataRoute.Sitemap = (productsRes.data || []).map((p) => ({
      url: `${BASE_URL}/product/${p.id}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    const profileEntries: MetadataRoute.Sitemap = (profilesRes.data || []).map((u) => ({
      url: `${BASE_URL}/user/${u.username}`,
      lastModified: new Date(u.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))

    return [...staticEntries, ...productEntries, ...profileEntries]
  } catch {
    // Fallback to static-only sitemap if DB is unavailable
    return staticEntries
  }
}
