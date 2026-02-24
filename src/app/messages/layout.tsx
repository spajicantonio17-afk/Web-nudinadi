import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Poruke | NudiNađi',
  description: 'Razgovaraj s prodavačima i kupcima na NudiNađi marketplace platformi. Sigurna komunikacija za tvoje oglase.',
  openGraph: {
    title: 'Poruke | NudiNađi',
    description: 'Razgovaraj s prodavačima i kupcima na NudiNađi marketplace platformi.',
    siteName: 'NudiNađi',
  },
};

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
