import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Link Import | NudiNađi',
  description: 'Importuj oglas s bilo kojeg portala jednim klikom. AI automatski popunjava sve podatke.',
  openGraph: {
    title: 'Link Import | NudiNađi',
    description: 'Importuj oglas s bilo kojeg portala jednim klikom. AI preuzima podatke automatski.',
    siteName: 'NudiNađi',
  },
};

export default function LinkImportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
