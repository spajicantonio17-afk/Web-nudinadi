import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Moj Profil | NudiNađi',
  description: 'Upravljaj svojim profilom, pregledaj aktivne oglase i prati svoj level na NudiNađi marketplace platformi.',
  openGraph: {
    title: 'Moj Profil | NudiNađi',
    description: 'Upravljaj svojim profilom i oglasima na NudiNađi.',
    siteName: 'NudiNađi',
  },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
