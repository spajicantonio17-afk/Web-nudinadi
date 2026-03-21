'use client';

interface JsonLdProps {
  data: Record<string, unknown>;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── Schema Helpers ────────────────────────────────────

const CONDITION_MAP: Record<string, string> = {
  new: 'https://schema.org/NewCondition',
  like_new: 'https://schema.org/UsedCondition',
  used: 'https://schema.org/UsedCondition',
};

const STATUS_MAP: Record<string, string> = {
  active: 'https://schema.org/InStock',
  sold: 'https://schema.org/SoldOut',
  reserved: 'https://schema.org/LimitedAvailability',
};

export function buildProductSchema(product: {
  id: string;
  title: string;
  description: string | null;
  price: number;
  condition: string;
  images: string[];
  status: string;
  location: string | null;
  category?: { name: string } | null;
  seller: { full_name: string | null; username: string };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || product.title,
    image: product.images.length > 0 ? product.images : undefined,
    url: `https://nudinadi.com/product/${product.id}`,
    offers: {
      '@type': 'Offer',
      price: product.price.toFixed(2),
      priceCurrency: 'EUR',
      itemCondition: CONDITION_MAP[product.condition] || CONDITION_MAP.used,
      availability: STATUS_MAP[product.status] || STATUS_MAP.active,
      seller: {
        '@type': 'Person',
        name: product.seller.full_name || product.seller.username,
      },
    },
    ...(product.category?.name && { category: product.category.name }),
  };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildPersonSchema(profile: {
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.full_name || profile.username,
    url: `https://nudinadi.com/user/${profile.username}`,
    ...(profile.bio && { description: profile.bio }),
    ...(profile.avatar_url && { image: profile.avatar_url }),
  };
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'NudiNađi',
  url: 'https://nudinadi.com',
  logo: 'https://nudinadi.com/icons/icon-512x512.png',
  description: 'Vodeći marketplace za kupoprodaju rabljenih i novih artikala u regiji.',
};
