import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nova Lozinka | NudiNađi',
  description: 'Postavi novu lozinku za svoj NudiNađi račun.',
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
