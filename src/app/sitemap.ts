import type { MetadataRoute } from 'next'

const BASE_URL = 'https://nudinadi.com'

export default function sitemap(): MetadataRoute.Sitemap {
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

  return staticPages.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))
}
