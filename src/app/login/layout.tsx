import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prijava | NudiNađi',
  description: 'Prijavi se na NudiNađi marketplace. Kupuj i prodaj brzo i sigurno.',
  openGraph: {
    title: 'Prijava | NudiNađi',
    description: 'Prijavi se na NudiNađi marketplace.',
    siteName: 'NudiNađi',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
