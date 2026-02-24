import type { Metadata } from 'next';

export const SITE_NAME = 'NudiNađi';
export const SITE_DESCRIPTION = 'Marketplace za kupovinu i prodaju u Hrvatskoj i Bosni. Brzo, sigurno i AI-potpomognuto.';
export const SITE_LOCALE = 'bs_BA';

/**
 * Shared base metadata for all pages.
 * Route-level layouts extend this with page-specific titles/descriptions.
 */
export const BASE_METADATA: Metadata = {
  title: {
    default: `${SITE_NAME} – Kupuj i prodaj brzo i sigurno`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'marketplace', 'oglasi', 'kupovina', 'prodaja',
    'second hand', 'polovne stvari', 'Bosna', 'Hercegovina',
    'Hrvatska', 'BiH', 'NudiNađi', 'nudinadi',
    'vozila', 'nekretnine', 'tehnika', 'mobiteli',
  ],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: 'website',
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    title: `${SITE_NAME} – Kupuj i prodaj brzo i sigurno`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};
