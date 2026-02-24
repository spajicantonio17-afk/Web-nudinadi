export interface Product {
  id: string;
  name: string;
  price: number;
  secondaryPriceLabel: string;
  location: string;
  timeLabel: string;
  description: string;
  imageUrl: string;
  category: string;
  subCategory?: string;
  seller: string;
  condition: 'New' | 'Like New' | 'Used';
  views?: number;
}

export interface SubCategoryGroup {
  name: string;
  items?: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subCategories: SubCategoryGroup[];
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
