import type { Metadata } from 'next';
import { createServerSupabase } from '@/lib/supabase-server';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: product } = await supabase
    .from('products')
    .select('title, description, price, images, location')
    .eq('id', id)
    .single();

  if (!product) {
    return {
      title: 'Oglas nije pronađen | NudiNađi',
      description: 'Ovaj oglas nije dostupan.',
    };
  }

  const title = `${product.title} – €${Number(product.price).toLocaleString()} | NudiNađi`;
  const description = product.description
    ? product.description.slice(0, 160)
    : `Kupite "${product.title}" za samo €${product.price}${product.location ? ` u ${product.location}` : ''} na NudiNađi.`;
  const image = product.images?.[0] ?? 'https://nudinadi.ba/og-default.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: product.title }],
      type: 'website',
      siteName: 'NudiNađi',
      locale: 'bs_BA',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
