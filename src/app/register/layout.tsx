import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registracija | NudiNađi',
  description: 'Kreiraj novi račun na NudiNađi marketplace platformi. Besplatna registracija.',
  openGraph: {
    title: 'Registracija | NudiNađi',
    description: 'Registriraj se na NudiNađi marketplace.',
    siteName: 'NudiNađi',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
