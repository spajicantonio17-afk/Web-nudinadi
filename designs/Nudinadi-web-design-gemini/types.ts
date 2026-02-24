
export interface Product {
  id: string;
  name: string;
  price: number;
  secondaryPriceLabel: string; // e.g., "KM 1.760"
  location: string;
  timeLabel: string; // e.g., "danas 12:10"
  description: string;
  imageUrl: string;
  category: string;
  subCategory?: string;
  seller: string;
  condition: 'New' | 'Like New' | 'Used';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subCategories: string[];
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  bio: string;
  avatarUrl: string;
  followers: number;
  following: number;
  items: string[];
}
