import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Novi Oglas | NudiNađi',
  description: 'Objavi novi oglas na NudiNađi. AI-potpomognuto postavljanje oglasa za brzu i jednostavnu prodaju.',
  openGraph: {
    title: 'Novi Oglas | NudiNađi',
    description: 'Objavi novi oglas na NudiNađi sa AI asistentom.',
    siteName: 'NudiNađi',
  },
};

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
