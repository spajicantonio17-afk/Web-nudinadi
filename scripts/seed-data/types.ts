export interface SeedProfile {
  email: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  phone: string;
  location: string;
  country: 'ba' | 'hr' | 'rs';
  account_type: 'free' | 'pro' | 'business';
  email_verified: boolean;
  phone_verified: boolean;
  level: number;
  xp: number;
  total_sales: number;
  total_purchases: number;
  rating_average: number | null;
  followers_count: number;
  following_count: number;
  locale: 'bs' | 'en' | 'de';
  promoted_credits: number;
  // Business-only fields
  company_name?: string;
  company_logo?: string;
  business_verified?: boolean;
  business_category?: string;
  website_url?: string;
  // Timing
  createdDaysAgo: number;
  // Which products this seller has (key into product arrays)
  productsKey: string;
}

export interface SeedProduct {
  sellerKey: string;
  title: string;
  description: string;
  price: number;
  currency: 'EUR' | 'BAM' | 'RSD';
  country: 'ba' | 'hr' | 'rs';
  categorySlug: string;
  condition: 'new' | 'like_new' | 'used';
  listing_type: 'prodaja' | 'najam' | 'najam_kratkorocni';
  images: string[];
  location: string;
  tags: string[];
  attributes: Record<string, unknown>;
  views_count: number;
  favorites_count: number;
  createdDaysAgo: number;
  promoted: boolean;
}
