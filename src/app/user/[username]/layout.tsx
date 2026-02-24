import type { Metadata } from 'next';
import { createServerSupabase } from '@/lib/supabase-server';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createServerSupabase();

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, bio, avatar_url, total_sales')
    .eq('username', username)
    .single();

  if (!profile) {
    return {
      title: `${username} | NudiNađi`,
      description: 'Korisnički profil na NudiNađi.',
    };
  }

  const displayName = profile.full_name || profile.username;
  const title = `${displayName} (@${profile.username}) | NudiNađi`;
  const description = profile.bio
    ? profile.bio.slice(0, 160)
    : `Pogledaj profil korisnika ${displayName} na NudiNađi – ${profile.total_sales ?? 0} prodanih artikala.`;
  const image = profile.avatar_url ?? 'https://nudinadi.ba/og-default.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 400, height: 400, alt: displayName }],
      type: 'profile',
      siteName: 'NudiNađi',
      locale: 'bs_BA',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [image],
    },
  };
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return children;
}
