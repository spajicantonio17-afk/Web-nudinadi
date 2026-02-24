import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Favoriti | NudiNađi',
  description: 'Tvoji omiljeni artikli na NudiNađi marketplace platformi. Pregledaj spašene oglase.',
  openGraph: {
    title: 'Favoriti | NudiNađi',
    description: 'Pregledaj svoje omiljene artikle na NudiNađi.',
    siteName: 'NudiNađi',
  },
};

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
