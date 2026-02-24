
import { Product, User, Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'vozila', name: 'Vozila', icon: 'fa-car', subCategories: ['Automobili', 'Motocikli', 'Teretna vozila', 'Bicikli'] },
  { id: 'nekretnine', name: 'Nekretnine', icon: 'fa-building', subCategories: ['Stanovi', 'Kuće', 'Zemljišta'] },
  { id: 'servisi', name: 'Servisi i usluge', icon: 'fa-wrench', subCategories: ['Majstori', 'Transport', 'Ljepota'] },
  { id: 'poslovi', name: 'Poslovi', icon: 'fa-briefcase', subCategories: ['Stalni rad', 'Honorarno'] },
  { id: 'dijelovi', name: 'Dijelovi za vozila', icon: 'fa-gears', subCategories: ['Gume', 'Felge', 'Motori'] },
  { id: 'mobiteli', name: 'Mobilni uređaji', icon: 'fa-mobile-screen', subCategories: ['iPhone', 'Samsung', 'Oprema'] },
  { id: 'kompjuteri', name: 'Kompjuteri', icon: 'fa-laptop', subCategories: ['Laptopi', 'Desktop', 'Monitor'] },
  { id: 'tehnika', name: 'Tehnika', icon: 'fa-plug', subCategories: ['Bijela tehnika', 'TV'] },
  { id: 'dom', name: 'Moj dom', icon: 'fa-house-chimney', subCategories: ['Namještaj', 'Vrt'] },
  { id: 'biznis', name: 'Biznis i industrija', icon: 'fa-industry', subCategories: ['Mašine', 'Alati'] },
  { id: 'odjeca', name: 'Odjeća i obuća', icon: 'fa-shirt', subCategories: ['Muška moda', 'Patike'] },
  { id: 'sport', name: 'Sportska oprema', icon: 'fa-basketball', subCategories: ['Teretana', 'Biciklizam'] },
  { id: 'hrana', name: 'Hrana i piće', icon: 'fa-utensils', subCategories: ['Domaće', 'Restorani'] },
  { id: 'nakit', name: 'Nakit i satovi', icon: 'fa-clock', subCategories: ['Ručni satovi', 'Nakit'] },
  { id: 'zivotinje', name: 'Životinje', icon: 'fa-paw', subCategories: ['Psi', 'Mačke', 'Hrana'] },
  { id: 'ljepota', name: 'Ljepota i zdravlje', icon: 'fa-heart-pulse', subCategories: ['Parfemi', 'Suplementi'] },
  { id: 'bebe', name: 'Bebe', icon: 'fa-baby', subCategories: ['Kolica', 'Odjeća'] },
  { id: 'igracke', name: 'Igre i igračke', icon: 'fa-gamepad', subCategories: ['Lego', 'Puzzle'] },
  { id: 'videoigre', name: 'Video igre', icon: 'fa-headset', subCategories: ['PS5', 'Xbox', 'PC igre'] },
  { id: 'muzika', name: 'Muzička oprema', icon: 'fa-guitar', subCategories: ['Instrumenti', 'Razglas'] },
  { id: 'literatura', name: 'Literatura', icon: 'fa-book', subCategories: ['Knjige', 'Stripovi'] },
  { id: 'umjetnost', name: 'Umjetnost', icon: 'fa-palette', subCategories: ['Slike', 'Skulpture'] },
  { id: 'kolekcionarstvo', name: 'Kolekcionarstvo', icon: 'fa-stamp', subCategories: ['Numizmatika'] },
  { id: 'antikviteti', name: 'Antikviteti', icon: 'fa-scroll', subCategories: ['Stari namještaj'] },
  { id: 'karte', name: 'Karte - tickets', icon: 'fa-ticket', subCategories: ['Koncerti', 'Sport'] },
  { id: 'audio-video', name: 'Audio video foto', icon: 'fa-camera', subCategories: ['Objektivi', 'Zvučnici'] },
  { id: 'poklanjam', name: 'Poklanjam', icon: 'fa-gift', subCategories: ['Sve besplatno'] },
  { id: 'glazbala', name: 'Glazbala', icon: 'fa-music', subCategories: ['Klaviri', 'Harmonike'] },
  { id: 'ostalo', name: 'Sve ostalo', icon: 'fa-ellipsis', subCategories: ['Razno'] }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Samsung Galaxy S25 Ultra 256GB',
    price: 900,
    secondaryPriceLabel: 'KM 1.760',
    location: 'Zagreb',
    timeLabel: 'danas 12:10',
    description: 'Latest flagship Samsung phone.',
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=400',
    category: 'Tehnika',
    subCategory: 'Mobiteli',
    seller: 'alex_k',
    condition: 'New'
  },
  {
    id: '2',
    name: 'iPhone 15 Pro 256GB Platinum',
    price: 1050,
    secondaryPriceLabel: 'KM 2.054',
    location: 'Sarajevo',
    timeLabel: 'prije 1h',
    description: 'Perfect condition iPhone.',
    imageUrl: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=400',
    category: 'Tehnika',
    subCategory: 'Mobiteli',
    seller: 'sneakerhead99',
    condition: 'Like New'
  },
  {
    id: '3',
    name: 'Porsche Panamera 4S (Black Edition)',
    price: 55000,
    secondaryPriceLabel: 'KM 107.500',
    location: 'Banja Luka',
    timeLabel: 'danas 10:45',
    description: 'Fast and reliable luxury car.',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400',
    category: 'Vozila',
    subCategory: 'Automobili',
    seller: 'luxury_autos',
    condition: 'Used'
  }
];

export const CURRENT_USER: User = {
  id: 'user_01',
  username: 'antonios7',
  fullName: 'Leo Andersen',
  bio: 'Curating the best gear.',
  avatarUrl: 'https://picsum.photos/seed/me/200/200',
  followers: 1250,
  following: 432,
  items: ['1']
};
