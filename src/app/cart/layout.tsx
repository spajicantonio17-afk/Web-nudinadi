import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Košarica | NudiNađi',
  description: 'Pregledaj artikle u svojoj košarici i stupi u kontakt s prodavačima na NudiNađi.',
  openGraph: {
    title: 'Košarica | NudiNađi',
    description: 'Pregledaj artikle u svojoj košarici na NudiNađi.',
    siteName: 'NudiNađi',
    locale: 'bs_BA',
  },
  twitter: {
    card: 'summary',
    title: 'Košarica | NudiNađi',
    description: 'Pregledaj artikle u svojoj košarici na NudiNađi.',
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
