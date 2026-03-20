import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/auth', '/login', '/register', '/onboarding', '/cart', '/bulk-upload'],
      },
    ],
    sitemap: 'https://nudinadi.com/sitemap.xml',
  }
}
