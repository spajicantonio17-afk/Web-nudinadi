import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dobrodošli | NudiNađi',
  description: 'Dobrodošli na NudiNađi - revolucija online trgovine s AI podrškom.',
  openGraph: {
    title: 'Dobrodošli | NudiNađi',
    description: 'NudiNađi - marketplace za kupovinu i prodaju u Hrvatskoj i Bosni.',
    siteName: 'NudiNađi',
  },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
