import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Postavke | NudiNađi',
  description: 'Prilagodi postavke svog računa, sigurnost, notifikacije i izgled NudiNađi aplikacije.',
  openGraph: {
    title: 'Postavke | NudiNađi',
    description: 'Prilagodi postavke svog NudiNađi računa.',
    siteName: 'NudiNađi',
  },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
