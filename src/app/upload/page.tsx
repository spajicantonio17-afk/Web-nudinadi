'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { CATEGORIES } from '@/lib/constants';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/lib/auth';
import { uploadProductImages } from '@/services/uploadService';
import { createProduct, updateProduct, getProductById } from '@/services/productService';
import { resolveCategoryId } from '@/services/categoryService';

import type { ProductCondition } from '@/lib/database.types';
import type { AttributeValues } from '@/lib/category-attributes';
import { getCategoryFields } from '@/lib/category-attributes';
import { findBrandModels, getBrandsForVehicleType, findBrandModelsForType, resolveVehicleType, getBrandsForTruckSubType, type VehicleType } from '@/lib/vehicle-models';
import { lookupChassis, chassisLabel, generateVehicleTags, type ChassisLookupResult } from '@/lib/vehicle-chassis-codes';
const VehicleModelPicker = lazy(() => import('@/components/upload/VehicleModelPicker'));
const AiModelVerifier = lazy(() => import('@/components/upload/AiModelVerifier'));
import { type City } from '@/lib/location';
import { BAM_RATE } from '@/lib/constants';

// Lazy-loaded heavy components
const ImageUpload = lazy(() => import('@/components/ImageUpload'));
const CategoryAttributesSection = lazy(() => import('@/components/upload/CategoryAttributesSection'));
const LocationPicker = lazy(() => import('@/components/LocationPicker'));

// Real AI functions via Gemini API routes
const generateListingDescription = async (title: string, category: string): Promise<string> => {
    const res = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'description', title, category }),
    });
    const json = await res.json();
    if (json.success && json.data?.description) return json.data.description;
    return `${title} u odličnom stanju. Potpuno funkcionalno, bez oštećenja. Idealno za svakodnevnu upotrebu.`;
};

const suggestPrice = async (title: string, category: string): Promise<number> => {
    const res = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'quality', title, category }),
    });
    const json = await res.json();
    if (json.success && json.data?.priceEstimate?.min) {
        return Math.round((json.data.priceEstimate.min + (json.data.priceEstimate.max || json.data.priceEstimate.min)) / 2);
    }
    return 0;
};

type AiAnalysisResult = {
  title: string;
  category: string;
  subcategory?: string;
  description: string;
  price?: number;
  confidence?: number;
  isVehicle?: boolean;
};

const analyzeRawInput = async (input: string): Promise<AiAnalysisResult> => {
    try {
      const res = await Promise.race([
        fetch('/api/ai/enhance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'categorize', title: input }),
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000)),
      ]);
      const json = await res.json();
      if (json.success && json.data) {
        const cat = (json.data.category as string) || 'Ostalo';
        const correctedTitle = (json.data.correctedTitle as string) || input;
        const sub = (json.data.subcategory as string) || undefined;
        const confidence = typeof json.data.confidence === 'number' ? json.data.confidence : undefined;
        const isVehicle = cat.toLowerCase().includes('vozila');
        return { title: correctedTitle, category: cat, subcategory: sub, description: '', confidence, isVehicle };
      }
    } catch {
      // AI call failed — fall through to local fallback
    }
    // Local fallback: fuzzy keyword matching (handles common typos)
    const l = input.toLowerCase();
    // Vehicles — brand names + common misspellings
    if (/go.?lf|bm.?w|aud.?i|merc.?ed|vo.?zil|aut.?o|pass.?at|po.?lo|op.?el|rena.?ult|fi.?at|toy.?ot|fo.?rd|škod|volks|peug|citro|hyund|ki.?a|seat|daci/i.test(l))
      return { title: input, category: 'Vozila', description: '', isVehicle: true };
    // Real estate
    if (/sta.?n|ku[cć]|apart|nekret|so.?ba|garson|vikend/i.test(l))
      return { title: input, category: 'Nekretnine', description: '' };
    // Mobile phones — handles "iphon", "samung", "huavei" etc.
    if (/i.?ph.?on|samsu|hua.?w|xia.?om|mobi.?t|telef|pixe|galax|redm|poco|onepl/i.test(l))
      return { title: input, category: 'Mobilni uređaji', description: '' };
    // Electronics
    if (/lap.?to|raču|moni.?t|grafi|gpu|cpu|ram|ssd|komp.?jut|print|desk.?top|tv|televi/i.test(l))
      return { title: input, category: 'Elektronika', description: '' };
    // Fashion
    if (/pat.?ik|cip.?el|jak.?n|halji|maji|hla[cč]|ni.?ke|adi.?das|za.?ra|torb|obu[cć]/i.test(l))
      return { title: input, category: 'Odjeća i obuća', description: '' };
    // Gaming
    if (/ps.?5|ps.?4|x.?box|nint.?end|konzo|play.?st|igr.?ic|game|gejm/i.test(l))
      return { title: input, category: 'Elektronika', description: '' };
    // Children & babies
    if (/koli.?c|beb|dje[cč].?j|igra[cč]|auto.?sjed/i.test(l))
      return { title: input, category: 'Odjeća za djecu', description: '' };
    // Music & instruments
    if (/gitar|bubn|klavir|sintesa|violi|saksof|trub|harmoni/i.test(l))
      return { title: input, category: 'Glazba i instrumenti', description: '' };
    // Animals
    if (/pas |psa |psić|mačk|životin|akvarij|papig|zamorc/i.test(l))
      return { title: input, category: 'Životinje', description: '' };
    // Sports
    if (/bici.?k|tre.?k|gia.?nt|cub.?e|fitne|tren.?ink|sport|teg|buc/i.test(l))
      return { title: input, category: 'Sport i rekreacija', description: '' };
    // Home & garden
    if (/sto.?l|orma|kau[cč]|sof.?a|krev|namje|stoli|polica|tepi/i.test(l))
      return { title: input, category: 'Dom i vrt', description: '' };
    return { title: input, category: 'Ostalo', description: '' };
};

// Fuel options per vehicle type
const FUEL_OPTIONS: Record<string, string[]> = {
  car: ['Benzin', 'Dizel', 'Električni', 'Hibrid', 'Plug-in Hibrid', 'LPG/CNG'],
  motorcycle: ['Benzin', 'Električni'],
  truck: ['Dizel', 'CNG/LNG', 'Električni', 'Hibrid'],
  bicycle: [],
  camper: ['Dizel', 'Benzin', 'LPG'],
  boat: ['Benzin', 'Dizel', 'Električni'],
  atv: ['Benzin', 'Dizel', 'Električni'],
};

// Bicycle drive types (instead of fuel)
const BICYCLE_DRIVE_TYPES = ['Mehanički', 'E-bike (električni)'];

type UploadStep = 'selection' | 'all-categories' | 'vehicle-sub' | 'parts-sub' | 'car-method' | 'truck-sub' | 'prikolice-sub' | 'nekretnine-sub' | 'nekretnine-quicktap' | 'elektronika-quicktap' | 'mobile-sub' | 'moda-sub' | 'moda-artikl' | 'tehnika-sub' | 'services-sub' | 'poslovi-sub' | 'detail-sub' | 'dom-sub' | 'sport-sub' | 'djeca-sub' | 'glazba-sub' | 'literatura-sub' | 'zivotinje-sub' | 'hrana-sub' | 'strojevi-sub' | 'umjetnost-sub' | 'videoigre-sub' | 'ostalo-sub' | 'form';

const NEKRETNINE_TYPES = [
  { name: 'Stanovi i apartmani', icon: 'fa-building' },
  { name: 'Kuće', icon: 'fa-house' },
  { name: 'Poslovni prostori', icon: 'fa-briefcase' },
  { name: 'Sobe', icon: 'fa-bed' },
  { name: 'Zemljišta', icon: 'fa-map' },
  { name: 'Garaže', icon: 'fa-dungeon' },
  { name: 'Stan na dan', icon: 'fa-suitcase' },
  { name: 'Vikendice', icon: 'fa-tree' },
  { name: 'Skladišta i hale', icon: 'fa-warehouse' },
  { name: 'Tražim cimera/icu', icon: 'fa-user-group' },
  { name: 'Ostalo', icon: 'fa-ellipsis' },
];

// ── Nekretnine Quick-Tap Questions per Type ───────────────────
type QuickTapQuestion = {
  key: string;
  label: string;
  options: string[];
  multi?: boolean; // Multi-Select (z.B. Komunalije)
  customInput?: {
    type: 'number' | 'text';
    unit: string;       // "GB", '"' (Zoll), etc.
    placeholder: string; // "Unesi vrijednost"
    min?: number;
    max?: number;
    step?: number;       // z.B. 0.1 für Dijagonala
  };
};

const NEKRETNINE_QUESTIONS: Record<string, QuickTapQuestion[]> = {
  'Stanovi i apartmani': [
    { key: 'tipPonude', label: 'Prodaja ili iznajmljivanje?', options: ['Prodaja', 'Iznajmljivanje'] },
    { key: 'stanjeNekretnine', label: 'Stanje?', options: ['Novogradnja', 'Renoviran', 'Dobro stanje', 'Za renoviranje', 'U izgradnji'] },
    { key: 'brojSoba', label: 'Broj soba?', options: ['Garsonjera', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5+'] },
    { key: 'sprat', label: 'Sprat?', options: ['Suteren', 'Prizemlje', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+', 'Potkrovlje'] },
    { key: 'namjestenost', label: 'Namještenost?', options: ['Namješteno', 'Polunamješteno', 'Nenamješteno'] },
  ],
  'Kuće': [
    { key: 'tipPonude', label: 'Prodaja ili iznajmljivanje?', options: ['Prodaja', 'Iznajmljivanje'] },
    { key: 'stanjeNekretnine', label: 'Stanje?', options: ['Novogradnja', 'Renovirana', 'Dobro stanje', 'Za renoviranje', 'U izgradnji'] },
    { key: 'brojSoba', label: 'Broj soba?', options: ['1', '2', '3', '4', '5', '6', '7', '8+'] },
    { key: 'brojEtaza', label: 'Broj etaža?', options: ['1', '2', '3', '4+'] },
    { key: 'namjestenost', label: 'Namještenost?', options: ['Namješteno', 'Polunamješteno', 'Nenamješteno'] },
  ],
  'Poslovni prostori': [
    { key: 'tipPonude', label: 'Prodaja ili iznajmljivanje?', options: ['Prodaja', 'Iznajmljivanje'] },
    { key: 'tipProstora', label: 'Tip prostora?', options: ['Ured', 'Trgovina', 'Ugostiteljski', 'Salon / Ordinacija', 'Skladište', 'Ostalo'] },
    { key: 'stanjeNekretnine', label: 'Stanje?', options: ['Novogradnja', 'Renoviran', 'Dobro stanje', 'Za renoviranje', 'U izgradnji'] },
    { key: 'namjestenost', label: 'Namještenost?', options: ['Namješteno', 'Polunamješteno', 'Nenamješteno'] },
  ],
  'Zemljišta': [
    { key: 'tipPonude', label: 'Prodaja ili iznajmljivanje?', options: ['Prodaja', 'Iznajmljivanje'] },
    { key: 'tipZemljista', label: 'Tip zemljišta?', options: ['Građevinsko', 'Poljoprivredno', 'Šumsko', 'Industrijsko', 'Ostalo'] },
    { key: 'povrsina', label: 'Površina?', options: ['< 500 m²', '500–1000 m²', '1000–2000 m²', '2000–5000 m²', '5000–10000 m²', '10000+ m²'] },
    { key: 'komunalije', label: 'Komunalije?', options: ['Struja', 'Voda', 'Kanalizacija', 'Plin', 'Sve priključeno', 'Bez'], multi: true },
  ],
  'Garaže': [
    { key: 'tipPonude', label: 'Prodaja ili iznajmljivanje?', options: ['Prodaja', 'Iznajmljivanje'] },
    { key: 'tipGaraze', label: 'Tip?', options: ['Garaža', 'Garažno mjesto', 'Vanjsko natkriveno', 'Vanjsko nenatkriveno'] },
    { key: 'kvadratura', label: 'Veličina?', options: ['< 15 m²', '15–25 m²', '25–40 m²', '40+ m²'] },
  ],
  'Vikendice': [
    { key: 'tipPonude', label: 'Prodaja ili iznajmljivanje?', options: ['Prodaja', 'Iznajmljivanje'] },
    { key: 'stanjeNekretnine', label: 'Stanje?', options: ['Novogradnja', 'Renovirana', 'Dobro stanje', 'Za renoviranje', 'U izgradnji'] },
    { key: 'brojSoba', label: 'Broj soba?', options: ['1', '2', '3', '4', '5+'] },
    { key: 'brojEtaza', label: 'Broj etaža?', options: ['1', '2', '3'] },
    { key: 'grijanje', label: 'Grijanje?', options: ['Centralno', 'Etažno plin', 'Etažno struja', 'Na drva', 'Klima', 'Bez'] },
  ],
  'Sobe': [
    { key: 'tipPonude', label: 'Prodaja ili iznajmljivanje?', options: ['Prodaja', 'Iznajmljivanje'] },
    { key: 'namjestenost', label: 'Namještenost?', options: ['Namješteno', 'Polunamješteno', 'Nenamješteno'] },
    { key: 'kupatilo', label: 'Kupatilo?', options: ['Vlastito', 'Zajedničko'] },
    { key: 'zaStudente', label: 'Za studente?', options: ['Da', 'Ne'] },
  ],
  'Skladišta i hale': [
    { key: 'tipPonude', label: 'Prodaja ili iznajmljivanje?', options: ['Prodaja', 'Iznajmljivanje'] },
    { key: 'tipObjekta', label: 'Tip objekta?', options: ['Skladište', 'Hala', 'Magacin', 'Hangar', 'Ostalo'] },
    { key: 'stanjeNekretnine', label: 'Stanje?', options: ['Novogradnja', 'Dobro stanje', 'Za renoviranje', 'U izgradnji'] },
    { key: 'kvadratura', label: 'Veličina?', options: ['< 100 m²', '100–300 m²', '300–500 m²', '500–1000 m²', '1000–3000 m²', '3000+ m²'] },
    { key: 'rampaUtovar', label: 'Rampa za utovar?', options: ['Da', 'Ne'] },
  ],
  'Stan na dan': [
    { key: 'brojSoba', label: 'Broj soba?', options: ['Garsonjera', '1', '2', '3', '4', '5+'] },
    { key: 'sprat', label: 'Sprat?', options: ['Prizemlje', '1', '2', '3', '4', '5+', 'Potkrovlje'] },
    { key: 'klima', label: 'Klima?', options: ['Da', 'Ne'] },
  ],
  'Tražim cimera/icu': [
    { key: 'brojSoba', label: 'Broj soba u stanu?', options: ['1', '1.5', '2', '2.5', '3', '3.5', '4', '5+'] },
    { key: 'sprat', label: 'Sprat?', options: ['Suteren', 'Prizemlje', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+', 'Potkrovlje'] },
    { key: 'namjestenost', label: 'Namještenost?', options: ['Namješteno', 'Polunamješteno', 'Nenamješteno'] },
  ],
  'Ostalo': [
    { key: 'tipPonude', label: 'Prodaja ili iznajmljivanje?', options: ['Prodaja', 'Iznajmljivanje'] },
    { key: 'stanjeNekretnine', label: 'Stanje?', options: ['Novogradnja', 'Renovirano', 'Dobro stanje', 'Za renoviranje'] },
  ],
};

// ── Elektronika Quick-Tap Questions ──────────────────────
const ELEKTRONIKA_QUICKTAP_TYPES = ['Laptopi', 'Kompjuteri (Desktop)', 'Monitori / TV', 'Konzole'];

const ELEKTRONIKA_QUESTIONS: Record<string, QuickTapQuestion[]> = {
  'Laptopi': [
    { key: 'tipLaptopa', label: 'Tip laptopa?', options: ['Gaming', 'Business / Office', 'Ultrabook', 'Ostalo'] },
    { key: 'marka', label: 'Marka?', options: ['Apple', 'Lenovo', 'HP', 'Dell', 'Asus', 'Acer', 'MSI', 'Samsung', 'Toshiba', 'Ostalo'] },
    { key: 'stanjeUredaja', label: 'Stanje?', options: ['Novo', 'Korišteno', 'Neispravno'] },
    { key: 'ram', label: 'RAM?', options: ['4 GB', '8 GB', '16 GB', '32 GB', '64 GB+'],
      customInput: { type: 'number', unit: 'GB', placeholder: 'npr. 24', min: 1, max: 512 },
    },
    { key: 'disk', label: 'Disk / Storage?', options: ['128 GB', '256 GB', '512 GB', '1 TB', '2 TB+'],
      customInput: { type: 'number', unit: 'GB', placeholder: 'npr. 750', min: 16, max: 16000 },
    },
    { key: 'dijagonala', label: 'Dijagonala ekrana?', options: ['13"', '14"', '15.6"', '16"', '17"'],
      customInput: { type: 'number', unit: '"', placeholder: 'npr. 11.6', min: 10, max: 21, step: 0.1 },
    },
  ],
  'Kompjuteri (Desktop)': [
    { key: 'tipDesktopa', label: 'Tip?', options: ['Gaming PC', 'Office / Radni', 'Workstation', 'Server', 'Ostalo'] },
    { key: 'stanjeUredaja', label: 'Stanje?', options: ['Novo', 'Korišteno', 'Neispravno'] },
    { key: 'ram', label: 'RAM?', options: ['4 GB', '8 GB', '16 GB', '32 GB', '64 GB', '128 GB+'],
      customInput: { type: 'number', unit: 'GB', placeholder: 'npr. 24', min: 1, max: 512 },
    },
    { key: 'disk', label: 'Disk / Storage?', options: ['256 GB', '512 GB', '1 TB', '2 TB', '4 TB+'],
      customInput: { type: 'number', unit: 'GB', placeholder: 'npr. 3000', min: 16, max: 32000 },
    },
    { key: 'procesor', label: 'Procesor?', options: ['Intel', 'AMD', 'Ostalo'] },
  ],
  'Monitori / TV': [
    { key: 'tipEkrana', label: 'Tip?', options: ['Gaming monitor', 'Office monitor', 'TV', 'Projektor', 'Ostalo'] },
    { key: 'stanjeUredaja', label: 'Stanje?', options: ['Novo', 'Korišteno'] },
    { key: 'dijagonala', label: 'Veličina ekrana?', options: ['24"', '27"', '32"', '40"', '43"', '50"', '55"', '65"', '75"+'],
      customInput: { type: 'number', unit: '"', placeholder: 'npr. 34', min: 15, max: 120 },
    },
  ],
  'Konzole': [
    { key: 'platforma', label: 'Platforma?', options: ['PlayStation', 'Xbox', 'Nintendo', 'Ostalo'] },
    { key: 'stanjeUredaja', label: 'Stanje?', options: ['Novo', 'Korišteno'] },
    { key: 'sadrzaj', label: 'Šta prodajete?', options: ['Konzola', 'Konzola + Igrice', 'Samo igrice', 'Oprema'] },
  ],
};

const MOBILE_BRANDS = [
  { name: 'Apple', icon: 'fa-apple', type: 'brands' },
  { name: 'Google', icon: 'fa-google', type: 'brands' },
  { name: 'Samsung', icon: 'fa-android', type: 'brands' },
  { name: 'Huawei', icon: 'fa-mobile-screen', type: 'solid' },
  { name: 'Xiaomi', icon: 'fa-bolt', type: 'solid' },
  { name: 'Sony', icon: 'fa-gamepad', type: 'solid' },
  { name: 'Nokia', icon: 'fa-mobile-retro', type: 'solid' },
  { name: 'HTC', icon: 'fa-mobile-screen-button', type: 'solid' },
  { name: 'Siemens', icon: 'fa-phone', type: 'solid' },
  { name: 'Faks uređaji', icon: 'fa-fax', type: 'solid' },
  { name: 'Fiksni telefoni', icon: 'fa-phone-flip', type: 'solid' },
  { name: 'Ostalo', icon: 'fa-ellipsis', type: 'solid' },
];

const CAR_LOGO_BASE = 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb';

const CAR_BRANDS = [
  // Njemačke marke
  { name: 'Audi', slug: 'audi' },
  { name: 'BMW', slug: 'bmw' },
  { name: 'Mercedes-Benz', slug: 'mercedes-benz' },
  { name: 'Volkswagen', slug: 'volkswagen' },
  { name: 'Opel', slug: 'opel' },
  { name: 'Porsche', slug: 'porsche' },
  { name: 'Smart', slug: 'smart' },
  // Francuske marke
  { name: 'Renault', slug: 'renault' },
  { name: 'Peugeot', slug: 'peugeot' },
  { name: 'Citroën', slug: 'citroen' },
  { name: 'Dacia', slug: 'dacia' },
  { name: 'Alpine', slug: 'alpine' },
  // Talijanske marke
  { name: 'Fiat', slug: 'fiat' },
  { name: 'Alfa Romeo', slug: 'alfa-romeo' },
  { name: 'Lancia', slug: 'lancia' },
  { name: 'Ferrari', slug: 'ferrari' },
  { name: 'Lamborghini', slug: 'lamborghini' },
  { name: 'Maserati', slug: 'maserati' },
  // Japanske marke
  { name: 'Toyota', slug: 'toyota' },
  { name: 'Honda', slug: 'honda' },
  { name: 'Nissan', slug: 'nissan' },
  { name: 'Mazda', slug: 'mazda' },
  { name: 'Suzuki', slug: 'suzuki' },
  { name: 'Mitsubishi', slug: 'mitsubishi' },
  { name: 'Subaru', slug: 'subaru' },
  { name: 'Lexus', slug: 'lexus' },
  { name: 'Infiniti', slug: 'infiniti' },
  { name: 'Isuzu', slug: 'isuzu' },
  // Korejske marke
  { name: 'Hyundai', slug: 'hyundai' },
  { name: 'Kia', slug: 'kia' },
  { name: 'SsangYong', slug: 'ssangyong' },
  // Češke / Slovačke
  { name: 'Škoda', slug: 'skoda' },
  // Švedske marke
  { name: 'Volvo', slug: 'volvo' },
  { name: 'Saab', slug: 'saab' },
  // Britanske marke
  { name: 'Land Rover', slug: 'land-rover' },
  { name: 'Jaguar', slug: 'jaguar' },
  { name: 'Mini', slug: 'mini' },
  { name: 'Bentley', slug: 'bentley' },
  { name: 'Rolls-Royce', slug: 'rolls-royce' },
  { name: 'Aston Martin', slug: 'aston-martin' },
  // Američke marke
  { name: 'Ford', slug: 'ford' },
  { name: 'Chevrolet', slug: 'chevrolet' },
  { name: 'Jeep', slug: 'jeep' },
  { name: 'Dodge', slug: 'dodge' },
  { name: 'Chrysler', slug: 'chrysler' },
  { name: 'Cadillac', slug: 'cadillac' },
  { name: 'Tesla', slug: 'tesla' },
  { name: 'GMC', slug: 'gmc' },
  { name: 'Lincoln', slug: 'lincoln' },
  { name: 'Hummer', slug: 'hummer' },
  // Španske
  { name: 'SEAT', slug: 'seat' },
  { name: 'Cupra', slug: 'cupra' },
  // Kineske marke
  { name: 'BYD', slug: 'byd' },
  { name: 'MG', slug: 'mg' },
  { name: 'NIO', slug: 'nio' },
  { name: 'Geely', slug: 'geely' },
  { name: 'Great Wall', slug: 'great-wall' },
  { name: 'Chery', slug: 'chery' },
  // Indijske
  { name: 'Tata', slug: 'tata' },
  { name: 'Mahindra', slug: 'mahindra' },
  // Bivša Yu / Balkanske
  { name: 'Zastava', slug: 'zastava' },
  { name: 'Yugo', slug: '' },
  // Ruske
  { name: 'Lada', slug: 'lada' },
  // Ostalo
  { name: 'Ostalo', slug: '' },
];

const MODA_TYPES = [
  { name: 'Ženska moda', icon: 'fa-person-dress' },
  { name: 'Muška moda', icon: 'fa-user-tie' },
  { name: 'Dječja odjeća i obuća', icon: 'fa-child-reaching' },
  { name: 'Aksesoari', icon: 'fa-hat-cowboy' },
  { name: 'Radna i zaštitna oprema', icon: 'fa-helmet-safety' },
  { name: 'Cipele', icon: 'fa-shoe-prints' },
  { name: 'Nakit', icon: 'fa-gem' },
  { name: 'Maškare i kostimi', icon: 'fa-mask' },
  { name: 'Dodaci za odjeću', icon: 'fa-socks' },
];

const MODA_ARTIKLI: Record<string, Array<{name: string, icon: string}>> = {
  'Ženska moda': [
    // Gornji dio
    { name: 'Majice i topovi', icon: 'fa-shirt' },
    { name: 'Bluze i košulje', icon: 'fa-vest' },
    { name: 'Džemperi i veste', icon: 'fa-mitten' },
    { name: 'Jakne i kaputi', icon: 'fa-vest-patches' },
    // Donji dio
    { name: 'Hlače i traperice', icon: 'fa-socks' },
    { name: 'Suknje', icon: 'fa-fan' },
    { name: 'Kratke hlače i šorcevi', icon: 'fa-scissors' },
    { name: 'Tajice i helanke', icon: 'fa-person-running' },
    // Komplet
    { name: 'Haljine', icon: 'fa-person-dress' },
    { name: 'Kombinezoni i jumpsuit', icon: 'fa-person' },
    { name: 'Odijela i komplet', icon: 'fa-user-tie' },
    // Ostalo
    { name: 'Sportska odjeća', icon: 'fa-dumbbell' },
    { name: 'Donje rublje', icon: 'fa-heart' },
    { name: 'Pidžame i kućna odjeća', icon: 'fa-moon' },
    { name: 'Kupaći kostimi', icon: 'fa-umbrella-beach' },
    { name: 'Trudnička odjeća', icon: 'fa-baby' },
    { name: 'Šalovi i marame', icon: 'fa-wind' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Muška moda': [
    // Gornji dio
    { name: 'Majice', icon: 'fa-shirt' },
    { name: 'Košulje', icon: 'fa-user-tie' },
    { name: 'Džemperi i veste', icon: 'fa-mitten' },
    { name: 'Jakne i kaputi', icon: 'fa-vest-patches' },
    // Donji dio
    { name: 'Hlače i traperice', icon: 'fa-socks' },
    { name: 'Kratke hlače i šorcevi', icon: 'fa-scissors' },
    { name: 'Trenirke i joggers', icon: 'fa-person-running' },
    // Komplet
    { name: 'Odijela i sakoi', icon: 'fa-user-tie' },
    // Ostalo
    { name: 'Sportska odjeća', icon: 'fa-dumbbell' },
    { name: 'Donje rublje i čarape', icon: 'fa-socks' },
    { name: 'Kupaće hlačice', icon: 'fa-umbrella-beach' },
    { name: 'Radna odjeća', icon: 'fa-helmet-safety' },
    { name: 'Pidžame', icon: 'fa-moon' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Dječja odjeća i obuća': [
    // Bebe
    { name: 'Za bebe (0-2 god.)', icon: 'fa-baby' },
    // Djevojčice
    { name: 'Djevojčice — gornji dio', icon: 'fa-child-dress' },
    { name: 'Djevojčice — donji dio', icon: 'fa-child-dress' },
    { name: 'Djevojčice — haljine i suknje', icon: 'fa-child-dress' },
    { name: 'Djevojčice — kompleti', icon: 'fa-child-dress' },
    // Dječaci
    { name: 'Dječaci — gornji dio', icon: 'fa-child-reaching' },
    { name: 'Dječaci — donji dio (hlače, trenirke, šorcevi)', icon: 'fa-child-reaching' },
    { name: 'Dječaci — kompleti', icon: 'fa-child-reaching' },
    // Zajedničko
    { name: 'Školska odjeća', icon: 'fa-school' },
    { name: 'Sportska odjeća (dječja)', icon: 'fa-dumbbell' },
    { name: 'Zimska odjeća (jakne, kombinezoni)', icon: 'fa-snowflake' },
    { name: 'Pidžame (dječje)', icon: 'fa-moon' },
    { name: 'Dječja obuća', icon: 'fa-shoe-prints' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Cipele': [
    { name: 'Ženske cipele', icon: 'fa-shoe-prints' },
    { name: 'Ženske čizme', icon: 'fa-shoe-prints' },
    { name: 'Ženske sandale i papuče', icon: 'fa-umbrella-beach' },
    { name: 'Muške cipele', icon: 'fa-shoe-prints' },
    { name: 'Muške čizme', icon: 'fa-shoe-prints' },
    { name: 'Muške sandale i papuče', icon: 'fa-umbrella-beach' },
    { name: 'Tenisice / Patike', icon: 'fa-shoe-prints' },
    { name: 'Sportska obuća', icon: 'fa-dumbbell' },
    { name: 'Radna obuća', icon: 'fa-helmet-safety' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Aksesoari': [
    { name: 'Torbe i ruksaci', icon: 'fa-bag-shopping' },
    { name: 'Novčanici', icon: 'fa-wallet' },
    { name: 'Remeni', icon: 'fa-ring' },
    { name: 'Kape i šeširi', icon: 'fa-hat-cowboy' },
    { name: 'Rukavice', icon: 'fa-mitten' },
    { name: 'Naočale', icon: 'fa-glasses' },
    { name: 'Satovi', icon: 'fa-clock' },
    { name: 'Kišobrani', icon: 'fa-umbrella' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Nakit': [
    { name: 'Ogrlice i lanci', icon: 'fa-gem' },
    { name: 'Narukvice', icon: 'fa-ring' },
    { name: 'Prstenje', icon: 'fa-ring' },
    { name: 'Naušnice', icon: 'fa-gem' },
    { name: 'Setovi nakita', icon: 'fa-gem' },
    { name: 'Piercing nakit', icon: 'fa-circle-dot' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
};

const TEHNIKA_TYPES = [
  { name: 'Kompjuteri (Desktop)', icon: 'fa-desktop' },
  { name: 'Laptopi', icon: 'fa-laptop' },
  { name: 'Monitori / TV', icon: 'fa-tv' },
  { name: 'PC Oprema', icon: 'fa-keyboard' },
  { name: 'Konzole', icon: 'fa-gamepad' },
  { name: 'Video Igre', icon: 'fa-compact-disc' },
  { name: 'Gaming Oprema', icon: 'fa-headset' },
  { name: 'Zvučnici / Audio', icon: 'fa-volume-high' },
  { name: 'Kamere', icon: 'fa-camera' },
  { name: 'Foto Oprema', icon: 'fa-sd-card' },
  { name: 'Gadgets', icon: 'fa-microchip' },
];

const SERVICES_TYPES = [
  { name: 'Zanatstvo i Popravke', icon: 'fa-wrench' },
  { name: 'Selidbe i Transport', icon: 'fa-truck-moving' },
  { name: 'Čišćenje i Održavanje', icon: 'fa-broom' },
  { name: 'Građevina i Renoviranje', icon: 'fa-trowel-bricks' },
  { name: 'Auto Servisi', icon: 'fa-car-wrench' },
  { name: 'IT i Tehnika', icon: 'fa-computer' },
  { name: 'Instrukcije', icon: 'fa-chalkboard-user' },
  { name: 'Ljepota i Njega', icon: 'fa-spa' },
  { name: 'Događaji i Zabava', icon: 'fa-champagne-glasses' },
  { name: 'Ostale Usluge', icon: 'fa-ellipsis' },
];

const POSLOVI_TYPES = [
  { name: 'Građevina i zanatstvo', icon: 'fa-hammer', subs: 'Građevinski radnik, Pomoćni radnik, Zidar, Suha gradnja, Keramičar, Moler, Krovopokrivač, Stolar' },
  { name: 'Elektro i tehnika', icon: 'fa-bolt', subs: 'Električar, Elektroinstalacije, Mrežna tehnika, Fotonaponski sistemi, Pametna kuća' },
  { name: 'Vodovod, grijanje, klima', icon: 'fa-faucet', subs: 'Instalater, Sanitarni radovi, Grijanje, Klima uređaji' },
  { name: 'Auto i transport', icon: 'fa-car', subs: 'Automehaničar, Autoelektričar, Vulkanizer, Šlep služba, Vozač (osobni/teretni)' },
  { name: 'IT i digitalno', icon: 'fa-laptop-code', subs: 'Razvoj softvera, Web dizajn, IT podrška, Sistemski admin, Marketing/SEO' },
  { name: 'Čišćenje i održavanje', icon: 'fa-broom', subs: 'Čišćenje zgrada, Čišćenje ureda, Domaćinstvo, Pranje prozora' },
  { name: 'Nekretnine i upravljanje', icon: 'fa-house-chimney', subs: 'Domar, Upravljanje objektima, Održavanje zelenih površina' },
  { name: 'Ugostiteljstvo i hotelijerstvo', icon: 'fa-utensils', subs: 'Kuhar, Konobar, Pomoć u kuhinji, Hotelski servis' },
  { name: 'Industrija i proizvodnja', icon: 'fa-industry', subs: 'Proizvodni radnik, Mašinski operater, Skladište i logistika' },
  { name: 'Ured i administracija', icon: 'fa-file-invoice', subs: 'Uredski asistent, Računovodstvo, Sekretarijat' },
  { name: 'Obrazovanje i njega', icon: 'fa-graduation-cap', subs: 'Instrukcije, Jezični kursevi, Čuvanje djece' },
  { name: 'Ljepota i njega', icon: 'fa-scissors', subs: 'Frizer, Kozmetika, Masaža' },
  { name: 'Ostalo', icon: 'fa-briefcase', subs: 'Freelancer, Projektni rad, Sezonski rad, Ostalo' },
];

// Hauptfahrzeuge — 2-Spalten Grid
const VEHICLE_TYPES_MAIN = [
  { name: 'Osobni automobili', icon: 'fa-car', type: 'car' as VehicleType, desc: 'Auti, limuzine, SUV, kombi...' },
  { name: 'Motocikli i skuteri', icon: 'fa-motorcycle', type: 'motorcycle' as VehicleType, desc: 'Sport, naked, touring, skuter...' },
];

// Weitere Fahrzeuge — 2-Spalten Grid (Kamperi entfernt → unter Teretna vozila)
const VEHICLE_TYPES_MORE = [
  { name: 'ATV / Quad / UTV', icon: 'fa-flag-checkered', type: 'atv' as VehicleType, desc: 'ATV, quad, side-by-side...' },
  { name: 'Teretna vozila', icon: 'fa-truck', type: 'truck' as VehicleType, desc: 'Kamioni, kombiji, autobusi...' },
  { name: 'Nautika i plovila', icon: 'fa-ship', type: 'boat' as VehicleType, desc: 'Čamci, jedrilice, jet ski...' },
  { name: 'Bicikli', icon: 'fa-bicycle', type: 'bicycle' as VehicleType, desc: 'MTB, cestovni, e-bike, BMX...' },
];

// Truck sub-types — Zwischen-Screen für Teretna vozila
const TRUCK_TYPES = [
  { name: 'Kamion', icon: 'fa-truck', desc: 'Šleper, tegljač, kamion...' },
  { name: 'Kombi / Van', icon: 'fa-van-shuttle', desc: 'Sprinter, Crafter, Transit...' },
  { name: 'Autobus / Minibus', icon: 'fa-bus', desc: 'Gradski, turistički, minibus...' },
  { name: 'Dostavno vozilo', icon: 'fa-truck-fast', desc: 'Caddy, Berlingo, Partner...' },
  { name: 'Kamper / Autodom', icon: 'fa-caravan', desc: 'Integralni, poluintegralni, van...' },
  { name: 'Građevinsko vozilo', icon: 'fa-truck-monster', desc: 'Bager, dizalica, mješalica...' },
  { name: 'Poljoprivredno vozilo', icon: 'fa-tractor', desc: 'Traktor, kombajn, priključak...' },
  { name: 'Ostalo', icon: 'fa-ellipsis', desc: 'Ostala teretna vozila...' },
];

// Prikolice sub-types — Zwischen-Screen für Prikolice
const PRIKOLICE_TYPES = [
  { name: 'Auto prikolica', icon: 'fa-trailer', desc: 'Za prevoz vozila' },
  { name: 'Teretna prikolica', icon: 'fa-truck-ramp-box', desc: 'Za robu i materijal' },
  { name: 'Kamp prikolica', icon: 'fa-campground', desc: 'Za stanovanje/kampiranje' },
  { name: 'Prikolica za čamac', icon: 'fa-ship', desc: 'Za prevoz plovila' },
  { name: 'Prikolica za motocikl', icon: 'fa-motorcycle', desc: 'Za prevoz motocikala' },
  { name: 'Stočna prikolica', icon: 'fa-cow', desc: 'Za prevoz životinja' },
  { name: 'Ostale prikolice', icon: 'fa-ellipsis', desc: 'Ostale vrste prikolica' },
];

// Fahrzeugtypen für Teile-Flow
const PARTS_VEHICLE_TYPES = [
  { name: 'Za automobile', icon: 'fa-car', type: 'car' as VehicleType },
  { name: 'Za motocikle', icon: 'fa-motorcycle', type: 'motorcycle' as VehicleType },
  { name: 'Za teretna vozila', icon: 'fa-truck', type: 'truck' as VehicleType },
  { name: 'Za bicikle', icon: 'fa-bicycle', type: 'bicycle' as VehicleType },
  { name: 'Za kampere', icon: 'fa-caravan', type: 'camper' as VehicleType },
  { name: 'Za plovila', icon: 'fa-ship', type: 'boat' as VehicleType },
  { name: 'Za ATV / Quad', icon: 'fa-flag-checkered', type: 'atv' as VehicleType },
];

const PARTS_CATEGORIES = [
  { group: 'Za automobile', items: [
    { name: 'Motor i mjenjač', icon: 'fa-gears' },
    { name: 'Elektrika i elektronika', icon: 'fa-bolt' },
    { name: 'Karoserija i stakla', icon: 'fa-car-side' },
    { name: 'Unutrašnjost', icon: 'fa-couch' },
    { name: 'Ovjes i kočnice', icon: 'fa-circle-stop' },
    { name: 'Felge i gume', icon: 'fa-circle' },
    { name: 'Tuning i oprema', icon: 'fa-gauge-high' },
    { name: 'Navigacija i auto akustika', icon: 'fa-radio' },
    { name: 'Kozmetika i ulja', icon: 'fa-oil-can' },
  ]},
  { group: 'Za motocikle', items: [
    { name: 'Motor i dijelovi', icon: 'fa-motorcycle' },
    { name: 'Karoserija i plastika', icon: 'fa-shield' },
    { name: 'Elektrika', icon: 'fa-plug' },
    { name: 'Oprema za vozača', icon: 'fa-helmet-safety' },
    { name: 'Felge i gume', icon: 'fa-circle' },
  ]},
  { group: 'Za bicikle', items: [
    { name: 'Okviri, vilice, amortizeri', icon: 'fa-bicycle' },
    { name: 'Pogon (mjenjač, pedala, lanac)', icon: 'fa-gears' },
    { name: 'Kotači, gume, felge', icon: 'fa-circle' },
    { name: 'Kočnice', icon: 'fa-hand' },
    { name: 'Oprema i dodaci', icon: 'fa-lightbulb' },
  ]},
];

// ── Parts detail items — exact parts per category and vehicle type ────────
const PARTS_DETAIL_ITEMS: Record<string, Record<string, string[]>> = {
  'Za automobile': {
    'Motor i mjenjač': ['Turbina', 'Turbo crijevo', 'Usisna grana', 'Ispušni kolektor', 'Bregasta osovina', 'Klipovi i klipnjače', 'Brizgaljke', 'Pumpa visokog pritiska', 'Motorni blok', 'Glava motora', 'Brtva glave', 'Uljni filter', 'Uljni hladnjak', 'EGR ventil', 'Mjenjač komplet', 'Kuplug set', 'Zamajac (dvomasa)', 'Kardansko vratilo', 'Poluosovina', 'Diferencijal', 'Rozeta', 'Lanac/remen motora', 'Vodena pumpa', 'Termostat', 'Hladnjak motora', 'Ventilator hladnjaka', 'Kompresor klime', 'Alternator', 'Anlaser/Starter', 'Ostalo motor'],
    'Elektrika i elektronika': ['Motorsteuergerät (ECU)', 'Kabelbaum', 'Senzor MAP/MAF', 'Lambda sonda', 'Senzor radilice', 'Senzor bregaste', 'ABS senzor', 'Senzor temperature', 'Senzor parkinga (PDC)', 'Svjećice', 'Bobina paljenja', 'Relej', 'Osigurač/Kutija osigurača', 'Akumulator', 'Kontrolna ploča (instrument cluster)', 'Radio/Navigacija', 'Pojačalo (amplifier)', 'Zvučnik', 'Kamera za vožnju unazad', 'Ostalo elektrika'],
    'Karoserija i stakla': ['Prednji branik', 'Zadnji branik', 'Hauba', 'Gepek vrata', 'Prednja vrata lijeva', 'Prednja vrata desna', 'Zadnja vrata lijeva', 'Zadnja vrata desna', 'Prednji blatobran lijevi', 'Prednji blatobran desni', 'Zadnji blatobran', 'Prag lijevi', 'Prag desni', 'Krov', 'Vjetrobransko staklo', 'Zadnje staklo', 'Bočno staklo', 'Retrovizor lijevi', 'Retrovizor desni', 'Prednje svjetlo lijevo', 'Prednje svjetlo desno', 'Zadnje svjetlo lijevo', 'Zadnje svjetlo desno', 'Maglenka', 'Maska (grill)', 'Spojler', 'Ostalo karoserija'],
    'Unutrašnjost': ['Sjedalo vozača', 'Sjedalo suvozača', 'Zadnja klupa', 'Volan', 'Airbag vozača', 'Airbag suvozača', 'Bočni airbag', 'Instrument tabla', 'Centralna konzola', 'Poluga mjenjača', 'Ručna kočnica', 'Pepeljara', 'Grijač sjedala', 'Tapaciranje vrata', 'Stropno tapaciranje', 'Tepih/Pod', 'Pojasevi', 'Pedale', 'Ostalo unutrašnjost'],
    'Ovjes i kočnice': ['Amortizer prednji', 'Amortizer zadnji', 'Opruga prednja', 'Opruga zadnja', 'Vilica prednja gornja', 'Vilica prednja donja', 'Stabilizator prednji', 'Stabilizator zadnji', 'Ležaj kotača', 'Glavčina', 'Spona volana', 'Letva volana', 'Kočioni disk prednji', 'Kočioni disk zadnji', 'Kočione pločice prednje', 'Kočione pločice zadnje', 'Kočiona čeljust', 'Kočiono crijevo', 'Servo pumpa', 'ABS pumpa/modul', 'Ručna kočnica sajla', 'Ostalo ovjes/kočnice'],
    'Felge i gume': ['Aluminijska felga', 'Čelična felga', 'Ljetna guma', 'Zimska guma', 'Cjelogodišnja guma', 'Vijci za felge', 'Ukrasni poklopac', 'Adapter za felge', 'TPMS senzor', 'Rezervni kotač', 'Ostalo felge/gume'],
    'Tuning i oprema': ['Bodykit', 'Difuzor', 'Spojler', 'Carbon dijelovi', 'LED traka', 'Xenon/LED kit', 'Sportski auspuh', 'Sportski filter zraka', 'Chiptuning/Remap modul', 'Sniženje (Lowering springs)', 'Coilover ovjes', 'Rol bar', 'Krovni nosač', 'Kuka za vuču', 'Ostalo tuning'],
    'Navigacija i auto akustika': ['Radio/CD player', 'Android multimedija', 'Apple CarPlay modul', 'Subwoofer', 'Pojačalo', 'Zvučnici', 'Navigacijski modul', 'Antena', 'USB adapter', 'Bluetooth modul', 'Ostalo akustika'],
    'Kozmetika i ulja': ['Motorno ulje', 'Ulje mjenjača', 'Antifriz', 'Kočiona tečnost', 'AdBlue', 'Sredstvo za stakla', 'Polir pasta', 'Vosak za lak', 'Keramička zaštita', 'Ostalo kozmetika'],
  },
  'Za motocikle': {
    'Motor i dijelovi': ['Cilindar', 'Klip', 'Bregasta osovina', 'Lanac/remen', 'Lančanik prednji', 'Lančanik zadnji', 'Kvačilo komplet', 'Karburator', 'Brizgaljka', 'Filter zraka', 'Auspuh komplet', 'Hladnjak', 'Uljni hladnjak', 'Starter motor', 'Alternator/Stator', 'Vodena pumpa', 'Uljni filter', 'Mjenjač', 'Ostalo motor'],
    'Karoserija i plastika': ['Prednja maska', 'Bočna plastika lijeva', 'Bočna plastika desna', 'Zadnja plastika', 'Blatobran prednji', 'Blatobran zadnji', 'Sjedalo', 'Spremnik goriva (tank)', 'Vjetrobran', 'Nosač prtljage', 'Bočni kofer', 'Top case', 'Ostalo plastika'],
    'Elektrika': ['ECU/CDI', 'Kabelbaum', 'Akumulator', 'Svjećica', 'Bobina', 'Senzor', 'Instrument tabla', 'Prekidač/Komanda', 'Svjetlo prednje', 'Svjetlo zadnje', 'LED traka', 'Alarm', 'Ostalo elektrika'],
    'Oprema za vozača': ['Kaciga (integral)', 'Kaciga (jet)', 'Kaciga (cross)', 'Jakna', 'Hlače', 'Rukavice', 'Čizme', 'Protektor leđa', 'Kiša odijelo', 'Potkaciga', 'Interkom/Komunikacija', 'Ostalo oprema'],
    'Felge i gume': ['Prednja felga', 'Zadnja felga', 'Prednja guma', 'Zadnja guma', 'Guma za cross/enduro', 'Zračnica', 'Ostalo felge/gume'],
  },
  'Za bicikle': {
    'Okviri, vilice, amortizeri': ['Okvir (frame)', 'Prednja vilica (rigidna)', 'Prednja vilica (amortizer)', 'Zadnji amortizer', 'Štitnk (headset)', 'Sedežna cijev', 'Dropper post', 'Ostalo okvir'],
    'Pogon (mjenjač, pedala, lanac)': ['Prednji mjenjač', 'Zadnji mjenjač', 'Šifter (ručica)', 'Lanac', 'Kaseta (zadnji zupčanik)', 'Pogonski zupčanik (chainring)', 'Srednje ležište (BB)', 'Pedale', 'Kurbla (crank)', 'Derailleur hanger', 'Ostalo pogon'],
    'Kotači, gume, felge': ['Prednji kotač komplet', 'Zadnji kotač komplet', 'Felga (rim)', 'Glavčina (hub)', 'Žbice (spokes)', 'Guma MTB', 'Guma cestovna', 'Guma gravel', 'Zračnica (tube)', 'Tubeless ventil', 'Ostalo kotači'],
    'Kočnice': ['Disk kočnica prednja', 'Disk kočnica zadnja', 'Kočione pločice', 'Kočioni disk (rotor)', 'V-brake čeljust', 'Kočiono uže', 'Hidraulično crijevo', 'Ručica kočnice', 'Ostalo kočnice'],
    'Oprema i dodaci': ['Prednje svjetlo', 'Zadnje svjetlo', 'Blatobran prednji', 'Blatobran zadnji', 'Nosač (rack)', 'Bisage', 'Boca za vodu + držač', 'Brava/Lokot', 'Pumpa', 'Alatka (multi-tool)', 'Brzinomjer/Kompjuter', 'Zvonce', 'Ostalo oprema'],
  },
  'Za teretna vozila': {
    'Motor i mjenjač': ['Turbina', 'Brizgaljka', 'Pumpa goriva', 'EGR', 'DPF filter', 'SCR katalizator', 'Hladnjak', 'Kompresor klime', 'Kompresor zraka', 'Anlaser', 'Alternator', 'Mjenjač', 'Kardansko vratilo', 'Retarder', 'Ostalo motor'],
    'Karoserija': ['Kabina komplet', 'Vrata kabine', 'Branik prednji', 'Maska', 'Prednje svjetlo', 'Zadnje svjetlo', 'Ogledalo', 'Blatobran', 'Ostalo karoserija'],
    'Ovjes i kočnice': ['Opruga (leaf spring)', 'Zračni jastuk (air bag)', 'Amortizer', 'Kočioni disk', 'Kočione obloge', 'ABS modul', 'Kočioni cilindar', 'Kompresor zraka za kočnice', 'Ostalo ovjes/kočnice'],
    'Elektrika': ['ECU', 'Tahograf', 'Kabelbaum', 'Senzor', 'Instrument tabla', 'Akumulator', 'Ostalo elektrika'],
    'Felge i gume': ['Felga čelična', 'Felga aluminijska', 'Guma 315/80 R22.5', 'Guma 385/65 R22.5', 'Guma 295/80 R22.5', 'Ostalo felge/gume'],
  },
};

// ── Sub-category arrays for categories without dedicated sub-steps ──────
const DOM_TYPES = [
  { name: 'Namještaj', icon: 'fa-couch' },
  { name: 'Kuhinja', icon: 'fa-kitchen-set' },
  { name: 'Kupatilo', icon: 'fa-shower' },
  { name: 'Vrt i bašta', icon: 'fa-seedling' },
  { name: 'Bijela tehnika', icon: 'fa-temperature-low' },
  { name: 'Mala kućna tehnika', icon: 'fa-blender' },
  { name: 'Dekoracija', icon: 'fa-image' },
  { name: 'Tekstil za dom', icon: 'fa-bed' },
  { name: 'Rasvjeta', icon: 'fa-lightbulb' },
  { name: 'Grijanje i hlađenje', icon: 'fa-snowflake' },
  { name: 'Alati', icon: 'fa-screwdriver-wrench' },
  { name: 'Građevinski materijal', icon: 'fa-trowel-bricks' },
  { name: 'Čišćenje i održavanje', icon: 'fa-broom' },
  { name: 'Ostalo', icon: 'fa-ellipsis' },
];

const SPORT_TYPES = [
  { name: 'Fitness oprema', icon: 'fa-dumbbell' },
  { name: 'Biciklizam', icon: 'fa-bicycle' },
  { name: 'Zimski sportovi', icon: 'fa-person-skiing' },
  { name: 'Fudbal', icon: 'fa-futbol' },
  { name: 'Kampovanje', icon: 'fa-campground' },
  { name: 'Tenis / Badminton', icon: 'fa-table-tennis-paddle-ball' },
  { name: 'Borilački sportovi', icon: 'fa-hand-fist' },
  { name: 'Vodeni sportovi', icon: 'fa-person-swimming' },
  { name: 'Trčanje', icon: 'fa-person-running' },
  { name: 'Planinarenje', icon: 'fa-mountain' },
  { name: 'Košarka', icon: 'fa-basketball' },
  { name: 'Ostalo', icon: 'fa-ellipsis' },
];

const DJECA_TYPES = [
  { name: 'Kolica i autosjedalice', icon: 'fa-baby-carriage' },
  { name: 'Dječji namještaj', icon: 'fa-bed' },
  { name: 'Igračke', icon: 'fa-cube' },
  { name: 'Školski pribor', icon: 'fa-pencil' },
  { name: 'Hranjenje i njega', icon: 'fa-bottle-water' },
  { name: 'Dječja odjeća', icon: 'fa-shirt' },
  { name: 'Ostalo', icon: 'fa-ellipsis' },
];

const GLAZBA_TYPES = [
  { name: 'Gitare', icon: 'fa-guitar' },
  { name: 'Klavijature i klaviri', icon: 'fa-music' },
  { name: 'Bubnjevi i udaraljke', icon: 'fa-drum' },
  { name: 'Duvački instrumenti', icon: 'fa-music' },
  { name: 'Gudački instrumenti', icon: 'fa-music' },
  { name: 'Audio oprema', icon: 'fa-volume-high' },
  { name: 'DJ oprema', icon: 'fa-record-vinyl' },
  { name: 'Ostalo', icon: 'fa-ellipsis' },
];

const LITERATURA_TYPES = [
  { name: 'Knjige', icon: 'fa-book' },
  { name: 'Stripovi i manga', icon: 'fa-book-open' },
  { name: 'Filmovi i serije', icon: 'fa-film' },
  { name: 'Muzika (fizička)', icon: 'fa-record-vinyl' },
  { name: 'Časopisi', icon: 'fa-newspaper' },
  { name: 'Ostalo', icon: 'fa-ellipsis' },
];

const ZIVOTINJE_TYPES = [
  { name: 'Psi', icon: 'fa-dog' },
  { name: 'Mačke', icon: 'fa-cat' },
  { name: 'Ptice', icon: 'fa-dove' },
  { name: 'Akvaristika', icon: 'fa-fish' },
  { name: 'Ostale životinje', icon: 'fa-paw' },
  { name: 'Ostalo', icon: 'fa-ellipsis' },
];

const HRANA_TYPES = [
  { name: 'Domaći proizvodi', icon: 'fa-jar' },
  { name: 'Piće', icon: 'fa-wine-glass' },
  { name: 'Svježe meso', icon: 'fa-drumstick-bite' },
  { name: 'Voće i povrće', icon: 'fa-apple-whole' },
  { name: 'Mliječni proizvodi', icon: 'fa-cheese' },
  { name: 'Zimnica i konzerve', icon: 'fa-jar' },
  { name: 'Kolači i slatkiši', icon: 'fa-cake-candles' },
  { name: 'Ostalo', icon: 'fa-ellipsis' },
];

const STROJEVI_TYPES = [
  { name: 'Ručni alati', icon: 'fa-screwdriver-wrench' },
  { name: 'Električni alati', icon: 'fa-screwdriver' },
  { name: 'Građevinski strojevi', icon: 'fa-tractor' },
  { name: 'Poljoprivredni strojevi', icon: 'fa-tractor' },
  { name: 'Vrtni strojevi', icon: 'fa-leaf' },
  { name: 'Industrijski strojevi', icon: 'fa-industry' },
  { name: 'Ostalo', icon: 'fa-ellipsis' },
];

const UMJETNOST_TYPES = [
  { name: 'Slike i grafike', icon: 'fa-paintbrush' },
  { name: 'Skulpture', icon: 'fa-monument' },
  { name: 'Kolekcionarstvo', icon: 'fa-coins' },
  { name: 'Ručni rad', icon: 'fa-scissors' },
  { name: 'Fotografije i posteri', icon: 'fa-image' },
  { name: 'Ostalo', icon: 'fa-ellipsis' },
];

const VIDEOIGRE_TYPES = [
  { name: 'PlayStation', icon: 'fa-playstation', type: 'brands' },
  { name: 'Xbox', icon: 'fa-xbox', type: 'brands' },
  { name: 'Nintendo', icon: 'fa-gamepad' },
  { name: 'PC igre', icon: 'fa-computer' },
  { name: 'Retro igre i konzole', icon: 'fa-ghost' },
  { name: 'Gaming Oprema', icon: 'fa-headset' },
];

const OSTALO_TYPES = [
  { name: 'Karte i ulaznice', icon: 'fa-ticket' },
  { name: 'Kozmetika i ljepota', icon: 'fa-spa' },
  { name: 'Medicinska pomagala', icon: 'fa-kit-medical' },
  { name: 'Vjenčanja', icon: 'fa-ring' },
  { name: 'Investicijsko zlato i srebro', icon: 'fa-coins' },
  { name: 'Grobna mjesta', icon: 'fa-cross' },
  { name: 'Poklanjam (besplatno)', icon: 'fa-gift' },
  { name: 'Sve ostalo', icon: 'fa-ellipsis' },
];

// ── Master detail-options for ALL subcategories (2nd tier) ──────────────
const CATEGORY_DETAILS: Record<string, Array<{name: string, icon: string}>> = {
  // ── NEKRETNINE ──
  'Stanovi i Apartmani': [
    { name: 'Jednosoban stan', icon: 'fa-door-open' },
    { name: 'Dvosoban stan', icon: 'fa-door-open' },
    { name: 'Trosoban stan', icon: 'fa-door-open' },
    { name: 'Četverosoban+', icon: 'fa-door-open' },
    { name: 'Garsonjera', icon: 'fa-bed' },
    { name: 'Penthouse', icon: 'fa-building' },
    { name: 'Duplex', icon: 'fa-layer-group' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Kuće': [
    { name: 'Kuća sa okućnicom', icon: 'fa-house' },
    { name: 'Kuća u nizu', icon: 'fa-city' },
    { name: 'Vila', icon: 'fa-house-chimney' },
    { name: 'Brvnara', icon: 'fa-tree' },
    { name: 'Nedovršena kuća', icon: 'fa-hammer' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Stan na dan': [
    { name: 'Studio apartman', icon: 'fa-bed' },
    { name: 'Apartman (2+ sobe)', icon: 'fa-door-open' },
    { name: 'Soba u stanu', icon: 'fa-bed' },
    { name: 'Kuća za odmor', icon: 'fa-umbrella-beach' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Poslovni prostori': [
    { name: 'Kancelarija / Ured', icon: 'fa-briefcase' },
    { name: 'Trgovina / Lokal', icon: 'fa-store' },
    { name: 'Ugostiteljski objekt', icon: 'fa-utensils' },
    { name: 'Salon / Studio', icon: 'fa-spa' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Zemljišta': [
    { name: 'Građevinsko zemljište', icon: 'fa-map' },
    { name: 'Poljoprivredno zemljište', icon: 'fa-tractor' },
    { name: 'Šuma', icon: 'fa-tree' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],

  // ── ELEKTRONIKA / TEHNIKA ──
  'Kompjuteri (Desktop)': [
    { name: 'Gaming PC', icon: 'fa-gamepad' },
    { name: 'Office / Radni PC', icon: 'fa-briefcase' },
    { name: 'Mini PC', icon: 'fa-microchip' },
    { name: 'Workstation', icon: 'fa-server' },
    { name: 'Samo kućište', icon: 'fa-box' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Laptopi': [
    { name: 'Gaming laptop', icon: 'fa-gamepad' },
    { name: 'Business / Office', icon: 'fa-briefcase' },
    { name: 'Ultrabook', icon: 'fa-feather' },
    { name: 'Chromebook', icon: 'fa-globe' },
    { name: '2-u-1 / Tablet laptop', icon: 'fa-tablet-screen-button' },
    { name: 'MacBook', icon: 'fa-laptop' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Monitori / TV': [
    { name: 'Gaming monitor', icon: 'fa-gamepad' },
    { name: 'Office monitor', icon: 'fa-desktop' },
    { name: 'TV (LED/OLED/QLED)', icon: 'fa-tv' },
    { name: 'Projektor', icon: 'fa-video' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'PC Oprema': [
    { name: 'Grafičke kartice (GPU)', icon: 'fa-microchip' },
    { name: 'Procesori (CPU)', icon: 'fa-microchip' },
    { name: 'RAM memorija', icon: 'fa-memory' },
    { name: 'Matične ploče', icon: 'fa-microchip' },
    { name: 'SSD / HDD diskovi', icon: 'fa-hard-drive' },
    { name: 'Napajanja (PSU)', icon: 'fa-plug' },
    { name: 'Hladnjaci i ventilatori', icon: 'fa-fan' },
    { name: 'Kućišta', icon: 'fa-box' },
    { name: 'Tastature', icon: 'fa-keyboard' },
    { name: 'Miševi', icon: 'fa-computer-mouse' },
    { name: 'USB hubovi i adapteri', icon: 'fa-usb' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Konzole': [
    { name: 'PlayStation', icon: 'fa-gamepad' },
    { name: 'Xbox', icon: 'fa-gamepad' },
    { name: 'Nintendo Switch', icon: 'fa-gamepad' },
    { name: 'Retro konzole', icon: 'fa-gamepad' },
    { name: 'Handheld (Steam Deck, ROG Ally)', icon: 'fa-mobile-screen' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Video Igre': [
    { name: 'PS4 / PS5 igre', icon: 'fa-compact-disc' },
    { name: 'Xbox igre', icon: 'fa-compact-disc' },
    { name: 'Nintendo igre', icon: 'fa-compact-disc' },
    { name: 'PC igre (fizičke)', icon: 'fa-compact-disc' },
    { name: 'Digitalni kodovi / Accounti', icon: 'fa-key' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Gaming Oprema': [
    { name: 'Slušalice (headset)', icon: 'fa-headset' },
    { name: 'Gaming stolica', icon: 'fa-chair' },
    { name: 'Gaming stol', icon: 'fa-table' },
    { name: 'Kontroleri / Joystick', icon: 'fa-gamepad' },
    { name: 'VR oprema', icon: 'fa-vr-cardboard' },
    { name: 'Streaming oprema', icon: 'fa-video' },
    { name: 'RGB / LED oprema', icon: 'fa-lightbulb' },
    { name: 'Podloge za miša', icon: 'fa-square' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Zvučnici / Audio': [
    { name: 'Bluetooth zvučnici', icon: 'fa-volume-high' },
    { name: 'Soundbar', icon: 'fa-volume-high' },
    { name: 'Kućni Hi-Fi sistem', icon: 'fa-music' },
    { name: 'Slušalice', icon: 'fa-headphones' },
    { name: 'Mikrofoni', icon: 'fa-microphone' },
    { name: 'DJ oprema', icon: 'fa-record-vinyl' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Kamere': [
    { name: 'DSLR fotoaparat', icon: 'fa-camera' },
    { name: 'Mirrorless fotoaparat', icon: 'fa-camera' },
    { name: 'Kompaktni fotoaparat', icon: 'fa-camera' },
    { name: 'Action kamera (GoPro)', icon: 'fa-camera' },
    { name: 'Dron s kamerom', icon: 'fa-helicopter' },
    { name: 'Video kamera', icon: 'fa-video' },
    { name: 'Nadzorne kamere', icon: 'fa-eye' },
    { name: 'Webcam', icon: 'fa-video' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Foto Oprema': [
    { name: 'Objektivi', icon: 'fa-circle' },
    { name: 'Stativi / Tripod', icon: 'fa-up-down-left-right' },
    { name: 'Blic / Flash', icon: 'fa-bolt' },
    { name: 'Torbe i futrole', icon: 'fa-bag-shopping' },
    { name: 'Memorijske kartice', icon: 'fa-sd-card' },
    { name: 'Filteri', icon: 'fa-circle' },
    { name: 'Studio oprema (svjetla, pozadine)', icon: 'fa-lightbulb' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Gadgets': [
    { name: 'Pametni satovi (Smartwatch)', icon: 'fa-clock' },
    { name: 'Fitness narukvice', icon: 'fa-heart-pulse' },
    { name: 'E-čitači (Kindle)', icon: 'fa-book' },
    { name: 'Tableti', icon: 'fa-tablet-screen-button' },
    { name: 'Powerbank', icon: 'fa-battery-full' },
    { name: 'Punjači i kablovi', icon: 'fa-plug' },
    { name: 'Smart home uređaji', icon: 'fa-house-signal' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],

  // ── DOM I VRT ──
  'Namještaj': [
    { name: 'Sofe i fotelje', icon: 'fa-couch' },
    { name: 'Stolovi (trpezarijski, radni)', icon: 'fa-table' },
    { name: 'Stolice', icon: 'fa-chair' },
    { name: 'Kreveti i madraci', icon: 'fa-bed' },
    { name: 'Ormari i komode', icon: 'fa-box-archive' },
    { name: 'Police i regali', icon: 'fa-layer-group' },
    { name: 'TV stolovi i vitrine', icon: 'fa-tv' },
    { name: 'Vrtni namještaj', icon: 'fa-umbrella-beach' },
    { name: 'Dječji namještaj', icon: 'fa-baby' },
    { name: 'Kancelarijski namještaj', icon: 'fa-briefcase' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Kuhinja': [
    { name: 'Kuhinjski elementi (gornji/donji)', icon: 'fa-kitchen-set' },
    { name: 'Sudoper i slavina', icon: 'fa-faucet' },
    { name: 'Posuđe (lonci, tave)', icon: 'fa-bowl-food' },
    { name: 'Pribor za jelo', icon: 'fa-utensils' },
    { name: 'Aparati (mikser, toster, blender)', icon: 'fa-blender' },
    { name: 'Čaše i šolje', icon: 'fa-mug-hot' },
    { name: 'Organizacija (police, kutije)', icon: 'fa-box' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Kupatilo': [
    { name: 'Tuš kabine i kade', icon: 'fa-shower' },
    { name: 'Umivaonici', icon: 'fa-faucet' },
    { name: 'WC školjke i bidei', icon: 'fa-toilet' },
    { name: 'Ogledala i ormarići', icon: 'fa-square' },
    { name: 'Peškiri i tekstil', icon: 'fa-vest' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Vrt i bašta': [
    { name: 'Alati za vrt (lopata, makaze, grablje)', icon: 'fa-seedling' },
    { name: 'Kosilice i trimeri', icon: 'fa-leaf' },
    { name: 'Saksije i žardinjere', icon: 'fa-seedling' },
    { name: 'Sjeme i sadnice', icon: 'fa-seedling' },
    { name: 'Navodnjavanje', icon: 'fa-faucet' },
    { name: 'Staklenici i plasticnici', icon: 'fa-house' },
    { name: 'Bazeni i oprema', icon: 'fa-water-ladder' },
    { name: 'Roštilji i oprema', icon: 'fa-fire' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Bijela tehnika': [
    { name: 'Veš mašina', icon: 'fa-shirt' },
    { name: 'Sušilica', icon: 'fa-wind' },
    { name: 'Frižider / Zamrzivač', icon: 'fa-temperature-low' },
    { name: 'Šporet / Rerna', icon: 'fa-fire-burner' },
    { name: 'Perilica posuđa', icon: 'fa-faucet' },
    { name: 'Aspirator / Napa', icon: 'fa-wind' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Mala kućna tehnika': [
    { name: 'Usisivač', icon: 'fa-broom' },
    { name: 'Pegla', icon: 'fa-temperature-high' },
    { name: 'Aparat za kafu', icon: 'fa-mug-hot' },
    { name: 'Mikser / Blender', icon: 'fa-blender' },
    { name: 'Toster / Grill', icon: 'fa-fire' },
    { name: 'Friteza (Air fryer)', icon: 'fa-bowl-food' },
    { name: 'Robot za kuhanje', icon: 'fa-gears' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Dekoracija': [
    { name: 'Slike i posteri', icon: 'fa-image' },
    { name: 'Vaze i skulpture', icon: 'fa-wine-glass' },
    { name: 'Svijeće i difuzeri', icon: 'fa-fire' },
    { name: 'Satovi (zidni)', icon: 'fa-clock' },
    { name: 'Tepisi', icon: 'fa-rug' },
    { name: 'Zavjese i draperije', icon: 'fa-window-maximize' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Tekstil za dom': [
    { name: 'Posteljina', icon: 'fa-bed' },
    { name: 'Jastučnice i jastuki', icon: 'fa-cloud' },
    { name: 'Deke i pokrivači', icon: 'fa-bed' },
    { name: 'Stolnjaci', icon: 'fa-table' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Rasvjeta': [
    { name: 'Lustri i plafonjere', icon: 'fa-lightbulb' },
    { name: 'Stojeće lampe', icon: 'fa-lightbulb' },
    { name: 'Stolne lampe', icon: 'fa-lightbulb' },
    { name: 'LED trake', icon: 'fa-lightbulb' },
    { name: 'Vrtna rasvjeta', icon: 'fa-sun' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Grijanje i hlađenje': [
    { name: 'Klima uređaji', icon: 'fa-snowflake' },
    { name: 'Radijatori / Grijači', icon: 'fa-temperature-high' },
    { name: 'Kamini i peći', icon: 'fa-fire' },
    { name: 'Ventilatori', icon: 'fa-fan' },
    { name: 'Bojleri', icon: 'fa-faucet' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],

  // ── SPORT I REKREACIJA ──
  'Fitness oprema': [
    { name: 'Utezi i bučice', icon: 'fa-dumbbell' },
    { name: 'Klupe za vježbanje', icon: 'fa-dumbbell' },
    { name: 'Traka za trčanje', icon: 'fa-person-running' },
    { name: 'Sobni bicikl / Eliptical', icon: 'fa-bicycle' },
    { name: 'Otporne trake / Gume', icon: 'fa-ring' },
    { name: 'Prostirke za yogu', icon: 'fa-rug' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Biciklizam': [
    { name: 'Kacige', icon: 'fa-helmet-safety' },
    { name: 'Odjeća za biciklizam', icon: 'fa-shirt' },
    { name: 'Svjetla i reflektori', icon: 'fa-lightbulb' },
    { name: 'Brave i lokoti', icon: 'fa-lock' },
    { name: 'Torbe i nosači', icon: 'fa-bag-shopping' },
    { name: 'Pumpe i alat', icon: 'fa-wrench' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Zimski sportovi': [
    { name: 'Skije i štapovi', icon: 'fa-person-skiing' },
    { name: 'Snowboard', icon: 'fa-snowflake' },
    { name: 'Skijaška odjeća', icon: 'fa-vest-patches' },
    { name: 'Skijaška obuća', icon: 'fa-shoe-prints' },
    { name: 'Kacige i naočale', icon: 'fa-helmet-safety' },
    { name: 'Klizaljke', icon: 'fa-snowflake' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Fudbal': [
    { name: 'Kopačke', icon: 'fa-shoe-prints' },
    { name: 'Lopte', icon: 'fa-futbol' },
    { name: 'Dresovi i oprema', icon: 'fa-shirt' },
    { name: 'Golmanski pribor', icon: 'fa-hand' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Kampovanje': [
    { name: 'Šatori', icon: 'fa-campground' },
    { name: 'Vreće za spavanje', icon: 'fa-bed' },
    { name: 'Ruksaci / Torbe', icon: 'fa-bag-shopping' },
    { name: 'Kuhalo / Roštilj za kampovanje', icon: 'fa-fire' },
    { name: 'Lampe i rasvjeta', icon: 'fa-lightbulb' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Tenis / Badminton': [
    { name: 'Reketi', icon: 'fa-table-tennis-paddle-ball' },
    { name: 'Loptice / Perilice', icon: 'fa-circle' },
    { name: 'Odjeća i obuća', icon: 'fa-shirt' },
    { name: 'Torbe za rekete', icon: 'fa-bag-shopping' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Borilački sportovi': [
    { name: 'Rukavice za boks', icon: 'fa-hand-fist' },
    { name: 'Vreće za udaranje', icon: 'fa-hand-fist' },
    { name: 'Štitnici i oprema', icon: 'fa-shield' },
    { name: 'Kimono / Gi', icon: 'fa-shirt' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Vodeni sportovi': [
    { name: 'Oprema za plivanje', icon: 'fa-person-swimming' },
    { name: 'Oprema za ronjenje', icon: 'fa-water' },
    { name: 'Daske za surfanje / SUP', icon: 'fa-water' },
    { name: 'Kajaci i kanui', icon: 'fa-ship' },
    { name: 'Plovni prsluci', icon: 'fa-vest' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],

  // ── DJECA I BEBE ──
  'Kolica i autosjedalice': [
    { name: 'Kolica (sportska)', icon: 'fa-baby-carriage' },
    { name: 'Kolica (duboka)', icon: 'fa-baby-carriage' },
    { name: 'Kolica (3u1 / kombinirane)', icon: 'fa-baby-carriage' },
    { name: 'Autosjedalice (0-13 kg)', icon: 'fa-car' },
    { name: 'Autosjedalice (9-36 kg)', icon: 'fa-car' },
    { name: 'Boosteri', icon: 'fa-car' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Dječji namještaj': [
    { name: 'Krevetići', icon: 'fa-bed' },
    { name: 'Komode za previjanje', icon: 'fa-box' },
    { name: 'Stolice za hranjenje', icon: 'fa-chair' },
    { name: 'Ljuljačke i ležaljke', icon: 'fa-baby' },
    { name: 'Ograde i prepreke', icon: 'fa-shield' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Igračke': [
    { name: 'Za bebe (0-1 god.)', icon: 'fa-baby' },
    { name: 'Edukativne igračke', icon: 'fa-graduation-cap' },
    { name: 'Lego i kocke', icon: 'fa-cube' },
    { name: 'Lutke i figurice', icon: 'fa-child-dress' },
    { name: 'Autići i vlakovi', icon: 'fa-car' },
    { name: 'Igračke za vani', icon: 'fa-sun' },
    { name: 'Društvene igre', icon: 'fa-dice' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Školski pribor': [
    { name: 'Školske torbe', icon: 'fa-bag-shopping' },
    { name: 'Pernice', icon: 'fa-pencil' },
    { name: 'Bilježnice i papir', icon: 'fa-book' },
    { name: 'Pribor za crtanje', icon: 'fa-paintbrush' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Hranjenje i njega': [
    { name: 'Bočice i dude', icon: 'fa-bottle-water' },
    { name: 'Sterilizatori', icon: 'fa-shield' },
    { name: 'Posuđe za djecu', icon: 'fa-utensils' },
    { name: 'Pelene i vlažne maramice', icon: 'fa-baby' },
    { name: 'Kozmetika za djecu', icon: 'fa-pump-soap' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],

  // ── GLAZBA I INSTRUMENTI ──
  'Gitare': [
    { name: 'Akustična gitara', icon: 'fa-guitar' },
    { name: 'Električna gitara', icon: 'fa-guitar' },
    { name: 'Bas gitara', icon: 'fa-guitar' },
    { name: 'Klasična gitara', icon: 'fa-guitar' },
    { name: 'Ukulele', icon: 'fa-guitar' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Klavijature i klaviri': [
    { name: 'Digitalni klavir', icon: 'fa-music' },
    { name: 'Sintisajzer / Keyboard', icon: 'fa-music' },
    { name: 'MIDI kontroler', icon: 'fa-sliders' },
    { name: 'Akustični klavir', icon: 'fa-music' },
    { name: 'Harmonika', icon: 'fa-music' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Bubnjevi i udaraljke': [
    { name: 'Akustični bubnjevi', icon: 'fa-drum' },
    { name: 'Elektronski bubnjevi', icon: 'fa-drum' },
    { name: 'Cajón', icon: 'fa-drum' },
    { name: 'Činele', icon: 'fa-circle' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Duvački instrumenti': [
    { name: 'Flauta', icon: 'fa-music' },
    { name: 'Saksofon', icon: 'fa-music' },
    { name: 'Truba / Trombon', icon: 'fa-music' },
    { name: 'Klarinet', icon: 'fa-music' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Gudački instrumenti': [
    { name: 'Violina', icon: 'fa-music' },
    { name: 'Viola / Čelo', icon: 'fa-music' },
    { name: 'Kontrabas', icon: 'fa-music' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Audio oprema': [
    { name: 'Pojačala za gitaru', icon: 'fa-volume-high' },
    { name: 'Miksete', icon: 'fa-sliders' },
    { name: 'Mikrofoni', icon: 'fa-microphone' },
    { name: 'Zvučnici (PA)', icon: 'fa-volume-high' },
    { name: 'Audio interface', icon: 'fa-sliders' },
    { name: 'Efekt pedale', icon: 'fa-circle-nodes' },
    { name: 'Kablovi i konektori', icon: 'fa-plug' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'DJ oprema': [
    { name: 'DJ kontroler', icon: 'fa-record-vinyl' },
    { name: 'Gramofon', icon: 'fa-record-vinyl' },
    { name: 'DJ mikseta', icon: 'fa-sliders' },
    { name: 'Slušalice za DJ', icon: 'fa-headphones' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],

  // ── LITERATURA I MEDIJI ──
  'Knjige': [
    { name: 'Romani i beletristika', icon: 'fa-book' },
    { name: 'Stručne i naučne', icon: 'fa-graduation-cap' },
    { name: 'Udžbenici (škola/fakultet)', icon: 'fa-school' },
    { name: 'Dječje knjige', icon: 'fa-child-reaching' },
    { name: 'Kuharske knjige', icon: 'fa-utensils' },
    { name: 'Religijske knjige', icon: 'fa-book-bible' },
    { name: 'Biografije', icon: 'fa-user' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Stripovi i manga': [
    { name: 'Stripovi', icon: 'fa-book-open' },
    { name: 'Manga', icon: 'fa-book-open' },
    { name: 'Graphic novels', icon: 'fa-book-open' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Filmovi i serije': [
    { name: 'DVD', icon: 'fa-compact-disc' },
    { name: 'Blu-ray', icon: 'fa-compact-disc' },
    { name: 'VHS (retro)', icon: 'fa-film' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Muzika (fizička)': [
    { name: 'Vinili / Ploče', icon: 'fa-record-vinyl' },
    { name: 'CD-ovi', icon: 'fa-compact-disc' },
    { name: 'Kasete', icon: 'fa-tape' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],

  // ── ŽIVOTINJE ──
  'Psi': [
    { name: 'Štenci na prodaju', icon: 'fa-dog' },
    { name: 'Hrana za pse', icon: 'fa-bowl-food' },
    { name: 'Oprema (povodci, ogrlice)', icon: 'fa-link' },
    { name: 'Kućice i krevetići', icon: 'fa-house' },
    { name: 'Igračke za pse', icon: 'fa-bone' },
    { name: 'Odjeća za pse', icon: 'fa-shirt' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Mačke': [
    { name: 'Mačići na prodaju', icon: 'fa-cat' },
    { name: 'Hrana za mačke', icon: 'fa-bowl-food' },
    { name: 'Oprema (posude, toalet)', icon: 'fa-box' },
    { name: 'Grebalice i igračke', icon: 'fa-cat' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Ptice': [
    { name: 'Ptice na prodaju', icon: 'fa-dove' },
    { name: 'Kavezi', icon: 'fa-box' },
    { name: 'Hrana i dodaci', icon: 'fa-bowl-food' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Akvaristika': [
    { name: 'Ribe', icon: 'fa-fish' },
    { name: 'Akvariji', icon: 'fa-water' },
    { name: 'Filteri i pumpe', icon: 'fa-filter' },
    { name: 'Hrana za ribe', icon: 'fa-bowl-food' },
    { name: 'Dekoracija za akvarij', icon: 'fa-seedling' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Ostale životinje': [
    { name: 'Zečevi i glodavci', icon: 'fa-paw' },
    { name: 'Gmizavci', icon: 'fa-worm' },
    { name: 'Terariji', icon: 'fa-box' },
    { name: 'Konji i oprema', icon: 'fa-horse' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],

  // ── STROJEVI I ALATI ──
  'Ručni alati': [
    { name: 'Odvijači, kliješta, ključevi', icon: 'fa-screwdriver-wrench' },
    { name: 'Čekići', icon: 'fa-hammer' },
    { name: 'Pile i testere (ručne)', icon: 'fa-gears' },
    { name: 'Mjerni alati', icon: 'fa-ruler' },
    { name: 'Setovi alata', icon: 'fa-toolbox' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Električni alati': [
    { name: 'Bušilice i udarne bušilice', icon: 'fa-screwdriver' },
    { name: 'Brusilice', icon: 'fa-gears' },
    { name: 'Kružne pile i ubodne pile', icon: 'fa-gears' },
    { name: 'Aku odvijači', icon: 'fa-screwdriver' },
    { name: 'Zavarivači (varilice)', icon: 'fa-fire' },
    { name: 'Kompresori', icon: 'fa-wind' },
    { name: 'Generatori', icon: 'fa-bolt' },
    { name: 'Visokotlačni perači', icon: 'fa-faucet' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Građevinski strojevi': [
    { name: 'Mini bageri', icon: 'fa-tractor' },
    { name: 'Skele i ljestve', icon: 'fa-layer-group' },
    { name: 'Betonski mikseri', icon: 'fa-gears' },
    { name: 'Vibro ploče', icon: 'fa-square' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Poljoprivredni strojevi': [
    { name: 'Traktori', icon: 'fa-tractor' },
    { name: 'Priključci za traktor', icon: 'fa-gears' },
    { name: 'Kosilice (profesionalne)', icon: 'fa-leaf' },
    { name: 'Motokultivatori', icon: 'fa-tractor' },
    { name: 'Motorne pile', icon: 'fa-tree' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],

  // ── UMJETNOST I KOLEKCIONARSTVO ──
  'Slike i grafike': [
    { name: 'Uljane slike', icon: 'fa-paintbrush' },
    { name: 'Akvareli', icon: 'fa-droplet' },
    { name: 'Grafike i printovi', icon: 'fa-print' },
    { name: 'Digitalna umjetnost', icon: 'fa-laptop' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Skulpture': [
    { name: 'Kamene skulpture', icon: 'fa-monument' },
    { name: 'Drvene skulpture', icon: 'fa-tree' },
    { name: 'Metalne skulpture', icon: 'fa-gears' },
    { name: 'Keramika', icon: 'fa-wine-glass' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Kolekcionarstvo': [
    { name: 'Poštanske marke', icon: 'fa-stamp' },
    { name: 'Kovanice i novčanice', icon: 'fa-coins' },
    { name: 'Figurice i modeli', icon: 'fa-chess-knight' },
    { name: 'Starine i antikviteti', icon: 'fa-hourglass' },
    { name: 'Razglednice', icon: 'fa-image' },
    { name: 'Vojni predmeti', icon: 'fa-shield' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Ručni rad': [
    { name: 'Heklanje / Pletenje', icon: 'fa-scissors' },
    { name: 'Šivanje i patchwork', icon: 'fa-scissors' },
    { name: 'Nakit (ručna izrada)', icon: 'fa-gem' },
    { name: 'Drvorezbarstvo', icon: 'fa-tree' },
    { name: 'Materijali za ručni rad', icon: 'fa-palette' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],

  // ── HRANA I PIĆE ──
  'Domaći proizvodi': [
    { name: 'Med i pčelinji proizvodi', icon: 'fa-jar' },
    { name: 'Džemovi i pekmezi', icon: 'fa-jar' },
    { name: 'Sirevi', icon: 'fa-cheese' },
    { name: 'Suhomesnati proizvodi', icon: 'fa-drumstick-bite' },
    { name: 'Ulje (maslinovo, bučino)', icon: 'fa-bottle-droplet' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Piće': [
    { name: 'Vino', icon: 'fa-wine-glass' },
    { name: 'Rakija / Loza', icon: 'fa-whiskey-glass' },
    { name: 'Pivo (craft)', icon: 'fa-beer-mug-empty' },
    { name: 'Sokovi', icon: 'fa-glass-water' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],

  // ── USLUGE (detail for each service type) ──
  'Zanatstvo i Popravke': [
    { name: 'Vodoinstalater', icon: 'fa-faucet' },
    { name: 'Električar', icon: 'fa-bolt' },
    { name: 'Stolar', icon: 'fa-hammer' },
    { name: 'Bravar', icon: 'fa-key' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Građevina i Renoviranje': [
    { name: 'Molerski radovi', icon: 'fa-paintbrush' },
    { name: 'Keramičarski radovi', icon: 'fa-border-all' },
    { name: 'Suha gradnja (gips)', icon: 'fa-layer-group' },
    { name: 'Fasade', icon: 'fa-building' },
    { name: 'Krovopokrivanje', icon: 'fa-house-chimney' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],

  // ── POSLOVI (detail for each job type) ──
  'Građevina i zanatstvo': [
    { name: 'Građevinski radnik', icon: 'fa-helmet-safety' },
    { name: 'Pomoćni radnik', icon: 'fa-person-digging' },
    { name: 'Zidar', icon: 'fa-trowel-bricks' },
    { name: 'Keramičar', icon: 'fa-border-all' },
    { name: 'Moler', icon: 'fa-paintbrush' },
    { name: 'Krovopokrivač', icon: 'fa-house-chimney' },
    { name: 'Stolar', icon: 'fa-hammer' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Elektro i tehnika': [
    { name: 'Električar', icon: 'fa-bolt' },
    { name: 'Elektroinstalacije', icon: 'fa-plug' },
    { name: 'Mrežna tehnika', icon: 'fa-network-wired' },
    { name: 'Fotonaponski sistemi', icon: 'fa-solar-panel' },
    { name: 'Pametna kuća', icon: 'fa-house-signal' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Vodovod, grijanje, klima': [
    { name: 'Instalater', icon: 'fa-faucet' },
    { name: 'Sanitarni radovi', icon: 'fa-shower' },
    { name: 'Grijanje', icon: 'fa-temperature-high' },
    { name: 'Klima uređaji', icon: 'fa-snowflake' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Auto i transport': [
    { name: 'Automehaničar', icon: 'fa-wrench' },
    { name: 'Autoelektričar', icon: 'fa-bolt' },
    { name: 'Vulkanizer', icon: 'fa-circle' },
    { name: 'Šlep služba', icon: 'fa-truck-pickup' },
    { name: 'Vozač', icon: 'fa-id-card' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'IT i digitalno': [
    { name: 'Razvoj softvera', icon: 'fa-code' },
    { name: 'Web dizajn', icon: 'fa-palette' },
    { name: 'IT podrška', icon: 'fa-headset' },
    { name: 'Sistemski admin', icon: 'fa-server' },
    { name: 'Marketing / SEO', icon: 'fa-chart-line' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Ugostiteljstvo i hotelijerstvo': [
    { name: 'Kuhar', icon: 'fa-utensils' },
    { name: 'Konobar', icon: 'fa-martini-glass' },
    { name: 'Pomoć u kuhinji', icon: 'fa-kitchen-set' },
    { name: 'Hotelski servis', icon: 'fa-hotel' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
  'Industrija i proizvodnja': [
    { name: 'Proizvodni radnik', icon: 'fa-industry' },
    { name: 'Mašinski operater', icon: 'fa-gears' },
    { name: 'Skladište i logistika', icon: 'fa-warehouse' },
    { name: 'Ostalo', icon: 'fa-ellipsis' },
  ],
};

// Map subcategory → parent color for detail-sub back navigation
const DETAIL_COLOR_MAP: Record<string, { color: string; parentStep: UploadStep; parentCategory: string }> = {};
// Nekretnine
for (const t of NEKRETNINE_TYPES) if (CATEGORY_DETAILS[t.name]) DETAIL_COLOR_MAP[t.name] = { color: 'emerald', parentStep: 'nekretnine-sub', parentCategory: 'Nekretnine' };
// Tehnika
for (const t of TEHNIKA_TYPES) if (CATEGORY_DETAILS[t.name]) DETAIL_COLOR_MAP[t.name] = { color: 'purple', parentStep: 'tehnika-sub', parentCategory: 'Elektronika' };
// Dom
for (const t of DOM_TYPES) if (CATEGORY_DETAILS[t.name]) DETAIL_COLOR_MAP[t.name] = { color: 'teal', parentStep: 'dom-sub', parentCategory: 'Dom i vrt' };
// Sport
for (const t of SPORT_TYPES) if (CATEGORY_DETAILS[t.name]) DETAIL_COLOR_MAP[t.name] = { color: 'green', parentStep: 'sport-sub', parentCategory: 'Sport i rekreacija' };
// Djeca
for (const t of DJECA_TYPES) if (CATEGORY_DETAILS[t.name]) DETAIL_COLOR_MAP[t.name] = { color: 'pink', parentStep: 'djeca-sub', parentCategory: 'Odjeća za djecu' };
// Glazba
for (const t of GLAZBA_TYPES) if (CATEGORY_DETAILS[t.name]) DETAIL_COLOR_MAP[t.name] = { color: 'indigo', parentStep: 'glazba-sub', parentCategory: 'Glazba i instrumenti' };
// Literatura
for (const t of LITERATURA_TYPES) if (CATEGORY_DETAILS[t.name]) DETAIL_COLOR_MAP[t.name] = { color: 'orange', parentStep: 'literatura-sub', parentCategory: 'Literatura i mediji' };
// Životinje
for (const t of ZIVOTINJE_TYPES) if (CATEGORY_DETAILS[t.name]) DETAIL_COLOR_MAP[t.name] = { color: 'amber', parentStep: 'zivotinje-sub', parentCategory: 'Životinje' };
// Hrana
for (const t of HRANA_TYPES) if (CATEGORY_DETAILS[t.name]) DETAIL_COLOR_MAP[t.name] = { color: 'red', parentStep: 'hrana-sub', parentCategory: 'Hrana i piće' };
// Strojevi
for (const t of STROJEVI_TYPES) if (CATEGORY_DETAILS[t.name]) DETAIL_COLOR_MAP[t.name] = { color: 'gray', parentStep: 'strojevi-sub', parentCategory: 'Strojevi i alati' };
// Umjetnost
for (const t of UMJETNOST_TYPES) if (CATEGORY_DETAILS[t.name]) DETAIL_COLOR_MAP[t.name] = { color: 'rose', parentStep: 'umjetnost-sub', parentCategory: 'Umjetnost i kolekcionarstvo' };
// Usluge
for (const t of SERVICES_TYPES) if (CATEGORY_DETAILS[t.name]) DETAIL_COLOR_MAP[t.name] = { color: 'cyan', parentStep: 'services-sub', parentCategory: 'Usluge' };
// Poslovi
for (const t of POSLOVI_TYPES) if (CATEGORY_DETAILS[t.name]) DETAIL_COLOR_MAP[t.name] = { color: 'indigo', parentStep: 'poslovi-sub', parentCategory: 'Poslovi' };
// Video igre
for (const t of VIDEOIGRE_TYPES) if (CATEGORY_DETAILS[t.name]) DETAIL_COLOR_MAP[t.name] = { color: 'violet', parentStep: 'videoigre-sub', parentCategory: 'Video igre' };
// Ostalo
for (const t of OSTALO_TYPES) if (CATEGORY_DETAILS[t.name]) DETAIL_COLOR_MAP[t.name] = { color: 'slate', parentStep: 'ostalo-sub', parentCategory: 'Ostalo' };

// ── Category breadcrumb info ──────────────────────────────────────────────
function getCategoryBreadcrumb(category: string, brand?: string): { main: string; sub?: string; icon: string; color: string } {
  const c = category.toLowerCase();
  if (c.includes('vozila') || c === 'automobili') {
    return { main: 'Vozila', sub: brand || undefined, icon: 'fa-car', color: 'blue' };
  }
  if (c.startsWith('nekretnine')) {
    const sub = category.includes(' - ') ? category.split(' - ')[1] : undefined;
    return { main: 'Nekretnine', sub, icon: 'fa-building', color: 'emerald' };
  }
  if (c.includes('mobilni')) {
    return { main: 'Mobilni uređaji', sub: brand || undefined, icon: 'fa-mobile-screen', color: 'rose' };
  }
  if (c.startsWith('elektronika')) {
    const sub = category.includes(' - ') ? category.split(' - ')[1] : undefined;
    return { main: 'Elektronika', sub, icon: 'fa-laptop', color: 'purple' };
  }
  if (c.startsWith('moda')) {
    const sub = category.includes(' - ') ? category.split(' - ')[1] : undefined;
    return { main: 'Moda', sub, icon: 'fa-shirt', color: 'amber' };
  }
  if (c.startsWith('usluge')) {
    const sub = category.includes(' - ') ? category.split(' - ')[1] : undefined;
    return { main: 'Usluge', sub, icon: 'fa-wrench', color: 'cyan' };
  }
  if (c.startsWith('poslovi')) {
    const sub = category.includes(' - ') ? category.split(' - ')[1] : undefined;
    return { main: 'Poslovi', sub, icon: 'fa-briefcase', color: 'indigo' };
  }
  if (c.includes('dom') || c.includes('vrt') || c.includes('namještaj')) {
    return { main: 'Dom i Vrt', sub: undefined, icon: 'fa-house', color: 'green' };
  }
  if (c.includes('sport')) {
    return { main: 'Sport', sub: undefined, icon: 'fa-futbol', color: 'orange' };
  }
  if (c.includes('životinj') || c.includes('ljubimci')) {
    return { main: 'Životinje', sub: undefined, icon: 'fa-paw', color: 'amber' };
  }
  if (c.includes('igračk') || c.includes('bebe')) {
    return { main: 'Bebe i Igračke', sub: undefined, icon: 'fa-baby-carriage', color: 'pink' };
  }
  if (c.includes('muzik') || c.includes('instrument')) {
    return { main: 'Muzika', sub: undefined, icon: 'fa-guitar', color: 'purple' };
  }
  if (c.includes('knjig') || c.includes('edukacij')) {
    return { main: 'Knjige', sub: undefined, icon: 'fa-book', color: 'amber' };
  }
  if (c.includes('kolekcionar')) {
    return { main: 'Kolekcionarstvo', sub: undefined, icon: 'fa-gem', color: 'rose' };
  }
  if (c.includes('alat') || c.includes('gradnja')) {
    return { main: 'Alati i Gradnja', sub: undefined, icon: 'fa-screwdriver-wrench', color: 'orange' };
  }
  if (c.includes('bicikl')) {
    return { main: 'Bicikli', sub: undefined, icon: 'fa-bicycle', color: 'green' };
  }
  return { main: category, sub: undefined, icon: 'fa-tag', color: 'blue' };
}

const BREADCRUMB_COLORS: Record<string, { bg: string; text: string; iconBg: string; border: string }> = {
  blue:    { bg: 'bg-blue-500/5',    text: 'text-blue-500',    iconBg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  emerald: { bg: 'bg-emerald-500/5', text: 'text-emerald-500', iconBg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  rose:    { bg: 'bg-rose-500/5',    text: 'text-rose-500',    iconBg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
  purple:  { bg: 'bg-purple-500/5',  text: 'text-purple-500',  iconBg: 'bg-purple-500/10',  border: 'border-purple-500/20' },
  amber:   { bg: 'bg-amber-500/5',   text: 'text-amber-500',   iconBg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  cyan:    { bg: 'bg-cyan-500/5',    text: 'text-cyan-500',    iconBg: 'bg-cyan-500/10',    border: 'border-cyan-500/20' },
  indigo:  { bg: 'bg-indigo-500/5',  text: 'text-indigo-500',  iconBg: 'bg-indigo-500/10',  border: 'border-indigo-500/20' },
  green:   { bg: 'bg-green-500/5',   text: 'text-green-500',   iconBg: 'bg-green-500/10',   border: 'border-green-500/20' },
  orange:  { bg: 'bg-orange-500/5',  text: 'text-orange-500',  iconBg: 'bg-orange-500/10',  border: 'border-orange-500/20' },
  pink:    { bg: 'bg-pink-500/5',    text: 'text-pink-500',    iconBg: 'bg-pink-500/10',    border: 'border-pink-500/20' },
  teal:    { bg: 'bg-teal-500/5',    text: 'text-teal-500',    iconBg: 'bg-teal-500/10',    border: 'border-teal-500/20' },
  red:     { bg: 'bg-red-500/5',     text: 'text-red-500',     iconBg: 'bg-red-500/10',     border: 'border-red-500/20' },
  gray:    { bg: 'bg-gray-500/5',    text: 'text-gray-500',    iconBg: 'bg-gray-500/10',    border: 'border-gray-500/20' },
};

// Map UI condition labels to DB enum values
function mapCondition(uiCondition: string): ProductCondition {
  switch (uiCondition) {
    case 'Novo': return 'new';
    case 'Kao novo': return 'like_new';
    case 'Korišteno':
    case 'Oštećeno':
    default: return 'used';
  }
}

function UploadPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [step, setStep] = useState<UploadStep>('selection');
  const [modaSubCategory, setModaSubCategory] = useState('');
  const [parentSubCategory, setParentSubCategory] = useState('');
  const [parentColor, setParentColor] = useState('blue');
  const [previousStep, setPreviousStep] = useState<UploadStep>('selection');

  // Edit mode
  const editProductId = searchParams.get('edit');
  const isEditMode = !!editProductId;
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // ── All state declarations (must be before any conditional returns) ──
  const [formErrors, setFormErrors] = useState<{ title?: string; price?: string; images?: string; category?: string }>({});
  const [images, setImages] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showAiWindow, setShowAiWindow] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    brand: '',
    description: '',
    model: '',
    vin: '',
    priceType: 'fixed' as 'fixed' | 'negotiable' | 'mk',
    condition: 'Korišteno',
    location: '',
  });
  const [attributes, setAttributes] = useState<AttributeValues>({});
  const [formPage, setFormPage] = useState<1 | 2 | 3>(1);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [currency, setCurrency] = useState<'EUR' | 'KM'>('EUR');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [newProductId, setNewProductId] = useState<string | null>(null);
  const [standaloneInput, setStandaloneInput] = useState('');
  const [magicSearchInput, setMagicSearchInput] = useState('');
  const [carBrandSearch, setCarBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [pickerBrand, setPickerBrand] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [truckSubType, setTruckSubType] = useState('');
  const [prikolicaSubType, setPrikolicaSubType] = useState('');
  const [showBicyclePopup, setShowBicyclePopup] = useState(false);
  const [showAiVerifier, setShowAiVerifier] = useState(false);
  const [aiVerification, setAiVerification] = useState<{brand: string, model: string, variant?: string, confidence: number} | null>(null);
  const [partsVehicleBrand, setPartsVehicleBrand] = useState('');
  const [partsVehicleModel, setPartsVehicleModel] = useState('');
  const [partsSubStep, setPartsSubStep] = useState<'vehicle-type' | 'brand' | 'model' | 'model-detail' | 'category' | 'detail'>('vehicle-type');
  const [partsVehicleType, setPartsVehicleType] = useState<VehicleType>('car');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [partsCategory, setPartsCategory] = useState('');
  const [partsModelDetail, setPartsModelDetail] = useState('');
  const [partsModelVariants, setPartsModelVariants] = useState<string[]>([]);
  const [partsDetailSearch, setPartsDetailSearch] = useState('');
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [catSearch, setCatSearch] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiInfo, setShowAiInfo] = useState(false);
  const [aiWarning, setAiWarning] = useState<{ warnings: string[]; recommendation: string; score: number } | null>(null);
  const [aiWarningBypass, setAiWarningBypass] = useState(false);

  // ── Quick-Tap state ──
  const [nekretSubType, setNekretSubType] = useState('');
  const [elektronikaSub, setElektronikaSub] = useState('');
  const [customInputOpen, setCustomInputOpen] = useState<Record<string, boolean>>({});
  const [customInputValues, setCustomInputValues] = useState<Record<string, string>>({});

  // ── Breadcrumb state ──
  const [breadcrumb, setBreadcrumb] = useState<Array<{ label: string; step: UploadStep; subStep?: string }>>([]);

  // ── Car flow sub-steps state ──
  const [carFlowStep, setCarFlowStep] = useState<'brand' | 'model' | 'variant'>('brand');
  const [vehicleModel, setVehicleModel] = useState<string>('');
  const [vehicleVariant, setVehicleVariant] = useState<string>('');
  const [vehicleYear, setVehicleYear] = useState<number>(new Date().getFullYear());
  const [vehicleFuel, setVehicleFuel] = useState<string>('');
  const [chassisMatchResult, setChassisMatchResult] = useState<ChassisLookupResult | null>(null);
  const [chassisUserInput, setChassisUserInput] = useState<string>('');
  const [modelSearchLocal, setModelSearchLocal] = useState('');
  const [manualModelInput, setManualModelInput] = useState('');
  const [showManualModel, setShowManualModel] = useState(false);
  const [manualVariantInput, setManualVariantInput] = useState('');
  const [showManualVariant, setShowManualVariant] = useState(false);

  // ── Memoized values ──
  const filteredCategories = useMemo(() =>
    catSearch.trim()
      ? CATEGORIES.filter(cat => {
          const q = catSearch.toLowerCase();
          if (cat.name.toLowerCase().includes(q)) return true;
          return cat.subCategories.some(sub =>
            sub.name.toLowerCase().includes(q) ||
            sub.items?.some(item => item.toLowerCase().includes(q))
          );
        })
      : CATEGORIES,
    [catSearch]
  );

  // ── All effects (must be before any conditional returns) ──

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login?redirect=/upload');
    }
  }, [isLoading, isAuthenticated, router]);

  // Load existing product data when in edit mode
  useEffect(() => {
    if (!editProductId || isLoading || !isAuthenticated) return;
    getProductById(editProductId)
      .then(product => {
        setFormData(prev => ({
          ...prev,
          title: product.title,
          price: String(product.price),
          category: product.category?.name || '',
          description: product.description || '',
          condition: product.condition === 'new' ? 'Novo' : product.condition === 'like_new' ? 'Kao novo' : 'Korišteno',
          location: product.location || '',
        }));
        if (product.attributes && typeof product.attributes === 'object') {
          setAttributes(product.attributes as AttributeValues);
        }
        setExistingImages(product.images || []);
        setStep('form');
      })
      .catch(() => showToast('Oglas nije pronađen', 'error'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editProductId, isLoading, isAuthenticated]);

  // Reset to page 1 whenever category changes
  useEffect(() => {
    setFormPage(1);
  }, [formData.category]);

  // Preview URL cleanup (PhonePreview memory leak fix)
  useEffect(() => {
    if (images.length > 0) {
      const url = URL.createObjectURL(images[0]);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [images]);

  // Reset custom input states when subcategory changes
  useEffect(() => {
    setCustomInputOpen({});
    setCustomInputValues({});
  }, [elektronikaSub, nekretSubType]);

  // Load pre-filled data from /link-import page (sessionStorage handoff)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = sessionStorage.getItem('nudinadi_import');
    if (!raw) return;
    try {
      const d = JSON.parse(raw) as Record<string, unknown>;
      sessionStorage.removeItem('nudinadi_import');
      // Parse price — handle string/number and strip non-numeric chars
      let importPrice = '';
      if (d.price != null) {
        const raw = typeof d.price === 'string' ? d.price.replace(/[^0-9.,]/g, '').replace(',', '.') : String(d.price);
        const num = parseFloat(raw);
        if (!isNaN(num) && num > 0) importPrice = String(Math.round(num));
      }

      setFormData(prev => ({
        ...prev,
        title: (d.title as string) || prev.title,
        description: (d.description as string) || prev.description,
        price: importPrice || prev.price,
        category: (d.category as string) || prev.category,
        location: (d.location as string) || prev.location,
        condition: d.condition === 'Novo' ? 'Novo' : d.condition === 'Kao novo' ? 'Kao novo' : prev.condition,
      }));

      // Set currency from import (KM, EUR, HRK → map to EUR/KM)
      const importCurrency = (d.currency as string || '').toUpperCase();
      if (importCurrency === 'KM' || importCurrency === 'BAM') {
        setCurrency('KM');
      } else if (importCurrency === 'EUR' || importCurrency === 'HRK' || importCurrency === 'USD') {
        setCurrency('EUR');
      }

      setStep('form');

      // Download imported images and add to form
      const imageUrls = Array.isArray(d.images) ? (d.images as string[]).filter(u => typeof u === 'string' && u.startsWith('http')) : [];
      if (imageUrls.length > 0) {
        const downloadImages = async () => {
          const files: File[] = [];
          for (const url of imageUrls.slice(0, 10)) {
            try {
              const res = await fetch(url);
              if (!res.ok) continue;
              const blob = await res.blob();
              const ext = blob.type.split('/')[1] || 'jpg';
              const fileName = `import-${files.length + 1}.${ext}`;
              files.push(new File([blob], fileName, { type: blob.type }));
            } catch {
              // Skip failed downloads silently
            }
          }
          if (files.length > 0) {
            setImages(prev => [...prev, ...files]);
            showToast(`${files.length} slika importirano`);
          }
        };
        downloadImages();
      }

      showToast('Oglas importiran — provjeri podatke i objavi!');
    } catch {
      sessionStorage.removeItem('nudinadi_import');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth guards (after ALL hooks) ──

  if (isLoading) {
    return (
      <MainLayout onBack={null}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <i className="fa-solid fa-spinner animate-spin text-2xl text-blue-500"></i>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) return null;

  const selectCategory = (catName: string) => {
    if (catName.toLowerCase().includes('dijelovi')) {
      setFormData({ ...formData, category: 'Dijelovi za vozila' });
      setVehicleType('parts');
      setPartsSubStep('brand');
      setStep('parts-sub');
      return;
    }
    if (catName.toLowerCase().includes('vozila') || catName.toLowerCase() === 'automobili') {
      setFormData({ ...formData, category: catName });
      setStep('vehicle-sub');
      return;
    }
    if (catName.toLowerCase() === 'nekretnine') {
        setStep('nekretnine-sub');
        return;
    }
    if (catName.toLowerCase().includes('mobilni')) {
        setStep('mobile-sub');
        return;
    }
    if (catName.toLowerCase().includes('odjeća') || catName.toLowerCase().includes('moda')) {
        setStep('moda-sub');
        return;
    }
    if (catName.toLowerCase().includes('tehnika') || catName.toLowerCase().includes('elektronika') || catName.toLowerCase().includes('računala')) {
        setStep('tehnika-sub');
        return;
    }
    if (catName.toLowerCase().includes('servisi') || catName.toLowerCase().includes('usluge')) {
        setStep('services-sub');
        return;
    }
    if (catName.toLowerCase().includes('poslovi')) {
        setStep('poslovi-sub');
        return;
    }
    if (catName.toLowerCase().includes('dom') || catName.toLowerCase().includes('vrt')) {
        setStep('dom-sub');
        return;
    }
    if (catName.toLowerCase().includes('sport') || catName.toLowerCase().includes('rekreacij')) {
        setStep('sport-sub');
        return;
    }
    if (catName.toLowerCase().includes('djeca') || catName.toLowerCase().includes('bebe') || catName.toLowerCase().includes('igračk')) {
        setStep('djeca-sub');
        return;
    }
    if (catName.toLowerCase().includes('glazba') || catName.toLowerCase().includes('instrument')) {
        setStep('glazba-sub');
        return;
    }
    if (catName.toLowerCase().includes('literatura') || catName.toLowerCase().includes('knjig') || catName.toLowerCase().includes('mediji')) {
        setStep('literatura-sub');
        return;
    }
    if (catName.toLowerCase().includes('životinj') || catName.toLowerCase().includes('ljubimci')) {
        setStep('zivotinje-sub');
        return;
    }
    if (catName.toLowerCase().includes('hrana') || catName.toLowerCase().includes('piće')) {
        setStep('hrana-sub');
        return;
    }
    if (catName.toLowerCase().includes('strojevi') || catName.toLowerCase().includes('alati')) {
        setStep('strojevi-sub');
        return;
    }
    if (catName.toLowerCase().includes('umjetnost') || catName.toLowerCase().includes('kolekcion')) {
        setStep('umjetnost-sub');
        return;
    }
    if (catName.toLowerCase().includes('video ig') || catName.toLowerCase() === 'video igre') {
        setStep('videoigre-sub');
        return;
    }
    if (catName.toLowerCase() === 'ostalo') {
        setStep('ostalo-sub');
        return;
    }
    setAttributes({});
    setFormData({ ...formData, category: catName });
    setStep('form');
  };

  const selectNekretnineSub = (subCat: string) => {
      // Detailkategorien (CATEGORY_DETAILS) normal behandeln
      if (CATEGORY_DETAILS[subCat]) {
        setParentSubCategory(subCat);
        setParentColor('emerald');
        setPreviousStep('nekretnine-sub');
        setFormData(prev => ({ ...prev, category: `Nekretnine - ${subCat}` }));
        setStep('detail-sub');
        return;
      }

      setAttributes({});
      setNekretSubType(subCat);
      setFormData(prev => ({ ...prev, category: `Nekretnine - ${subCat}` }));
      setBreadcrumb([
        { label: 'Nekretnine', step: 'nekretnine-sub' },
        { label: subCat, step: 'nekretnine-quicktap' },
      ]);

      // Quick-Tap wenn Fragen vorhanden, sonst direkt Formular
      const questions = NEKRETNINE_QUESTIONS[subCat];
      if (questions && questions.length > 0) {
        setStep('nekretnine-quicktap');
      } else {
        setStep('form');
      }
  };

  const selectMobileSub = (brand: string) => {
    setAttributes({});
    setFormData({ ...formData, category: 'Mobilni uređaji', brand: brand, title: `${brand} ` });
    setStep('form');
  };

  const selectModaSub = (type: string) => {
    setAttributes({});
    const artikli = MODA_ARTIKLI[type];
    if (artikli && artikli.length > 0) {
      setModaSubCategory(type);
      setFormData(prev => ({ ...prev, category: `Moda - ${type}` }));
      setStep('moda-artikl');
    } else {
      setFormData(prev => ({ ...prev, category: `Moda - ${type}` }));
      setStep('form');
    }
  };

  const selectModaArtikl = (artikl: string) => {
    setFormData(prev => ({ ...prev, category: `Moda - ${modaSubCategory} - ${artikl}` }));
    setStep('form');
  };

  const selectTehnikaSub = (type: string) => {
    setAttributes({});

    // Typen mit Quick-Tap: detail-sub überspringen, direkt Quick-Tap
    if (ELEKTRONIKA_QUICKTAP_TYPES.includes(type)) {
      setElektronikaSub(type);
      setFormData(prev => ({ ...prev, category: `Elektronika - ${type}` }));
      setPreviousStep('tehnika-sub');
      setStep('elektronika-quicktap');
      return;
    }

    // Alle anderen: bestehende Logik (detail-sub oder direkt form)
    const details = CATEGORY_DETAILS[type];
    if (details && details.length > 0) {
      setParentSubCategory(type);
      setParentColor('purple');
      setPreviousStep('tehnika-sub');
      setFormData(prev => ({ ...prev, category: `Elektronika - ${type}` }));
      setStep('detail-sub');
    } else {
      setFormData(prev => ({ ...prev, category: `Elektronika - ${type}` }));
      setStep('form');
    }
  };

  const selectServicesSub = (type: string) => {
    setAttributes({});
    const details = CATEGORY_DETAILS[type];
    if (details && details.length > 0) {
      setParentSubCategory(type);
      setParentColor('cyan');
      setPreviousStep('services-sub');
      setFormData({ ...formData, category: `Usluge - ${type}` });
      setStep('detail-sub');
    } else {
      setFormData({ ...formData, category: `Usluge - ${type}` });
      setStep('form');
    }
  };

  const selectPosloviSub = (type: string) => {
    setAttributes({});
    const details = CATEGORY_DETAILS[type];
    if (details && details.length > 0) {
      setParentSubCategory(type);
      setParentColor('indigo');
      setPreviousStep('poslovi-sub');
      setFormData({ ...formData, category: `Poslovi - ${type}` });
      setStep('detail-sub');
    } else {
      setFormData({ ...formData, category: `Poslovi - ${type}` });
      setStep('form');
    }
  };

  const selectGenericSub = (parentCat: string, color: string, parentStep: UploadStep, type: string) => {
    setAttributes({});
    const details = CATEGORY_DETAILS[type];
    if (details && details.length > 0) {
      setParentSubCategory(type);
      setParentColor(color);
      setPreviousStep(parentStep);
      setFormData(prev => ({ ...prev, category: `${parentCat} - ${type}` }));
      setStep('detail-sub');
    } else {
      setFormData(prev => ({ ...prev, category: `${parentCat} - ${type}` }));
      setStep('form');
    }
  };

  const selectDetailItem = (itemName: string) => {
    setFormData(prev => ({ ...prev, category: `${prev.category} - ${itemName}` }));
    setStep('form');
  };

  const selectCarBrand = (brand: string) => {
    if (vehicleType === 'parts') {
      setPartsVehicleBrand(brand);
      setAttributes(prev => ({ ...prev, zaVozilo: brand, zaModel: '' }));
      setFormData(prev => ({ ...prev, brand }));
      const brandModels = findBrandModelsForType(brand, partsVehicleType);
      if (brandModels.length > 0 && brand !== 'Ostalo') {
        setPartsSubStep('model');
        setStep('parts-sub');
      } else {
        setPartsSubStep('category');
        setStep('parts-sub');
      }
      return;
    }
    setAttributes(prev => ({ ...prev, marka: brand, model: '', varijanta: '' }));
    setFormData(prev => ({ ...prev, brand, title: brand === 'Ostalo' ? '' : `${brand} ` }));
    setCarBrandSearch('');
    const brandModels = findBrandModelsForType(brand, vehicleType);
    if (brandModels.length > 0 && brand !== 'Ostalo') {
      setPickerBrand(brand);
      setShowModelPicker(true);
      setStep('form');
    } else {
      setStep('form');
    }
  };

  const handleModelPickerSelect = (model: string, variant?: string) => {
    if (vehicleType === 'parts') {
      setPartsVehicleModel(model);
      setAttributes(prev => ({ ...prev, zaModel: model, zaVarijanta: variant || '' }));
      setShowModelPicker(false);
      setPartsSubStep('category');
      setStep('parts-sub');
      return;
    }
    setAttributes(prev => ({ ...prev, model, varijanta: variant || '' }));
    setFormData(prev => ({ ...prev, title: `${prev.brand} ${model}${variant ? ' ' + variant : ''} ` }));
    setShowModelPicker(false);
    setModelSearch('');
  };

  const handleMagicSearch = async () => {
      if (!magicSearchInput.trim()) return;

      // ── Fast path: chassis code / model shortcut lookup (no AI call) ──
      const chassisHits = lookupChassis(magicSearchInput.trim());
      if (chassisHits.length > 0) {
        const hit = chassisHits[0]; // take first (highest confidence) match
        const userInput = magicSearchInput.trim(); // keep original input as title base
        // Set brand — title keeps user's original input (e.g., "e90 330d")
        setFormData(prev => ({
          ...prev,
          brand: hit.brand,
          title: userInput,
          category: 'Vozila',
        }));
        setAttributes(prev => ({ ...prev, marka: hit.brand }));
        // Set fuel if detected
        if (hit.fuel) setVehicleFuel(hit.fuel);
        // Pre-fill model + variant so they auto-select on the model step
        setVehicleModel(hit.model);
        if (hit.variant) setVehicleVariant(hit.variant);
        // Save chassis match for tag generation during publish
        setChassisMatchResult(hit);
        setChassisUserInput(userInput);
        setModelSearchLocal(hit.model);
        setMagicSearchInput('');
        // Set vehicle type to car (magic search is in vehicle context)
        setVehicleType('car');
        // Navigate to model step (user picks year, then clicks pre-filtered model)
        setStep('car-method');
        setBreadcrumb([
          { label: 'Vozila', step: 'vehicle-sub' as UploadStep },
          { label: hit.brand, step: 'car-method' as UploadStep },
        ]);
        setCarFlowStep('model');
        showToast(`${hit.generation || hit.model} → ${hit.brand} ${hit.model}${hit.fuel ? ' (' + hit.fuel + ')' : ''}`);
        return;
      }

      setIsAiLoading(true);
      try {
        const result = await analyzeRawInput(magicSearchInput.trim());
        const cat = result.category;
        const sub = result.subcategory;
        const catLower = cat.toLowerCase();

        const findMatch = <T extends { name: string }>(arr: T[], val: string | undefined): T | undefined =>
          val ? arr.find(item => item.name.toLowerCase() === val.toLowerCase()) : undefined;

        if ((catLower.includes('vozila') && catLower !== 'dijelovi za vozila') || catLower === 'automobili') {
          const matchedBrand = findMatch(CAR_BRANDS, sub);
          if (matchedBrand) {
            setAttributes(prev => ({ ...prev, marka: matchedBrand.name }));
            setFormData(prev => ({ ...prev, title: result.title, category: 'Vozila', brand: matchedBrand.name, description: result.description || prev.description }));
            setStep('form');
            showToast(`AI: Vozila → ${matchedBrand.name}`);
          } else {
            setFormData(prev => ({ ...prev, title: result.title, category: 'Vozila', description: result.description || prev.description }));
            setStep('car-method');
            showToast('AI: Vozila');
          }
        } else if (catLower === 'nekretnine') {
          const matchedSub = findMatch(NEKRETNINE_TYPES, sub);
          if (matchedSub) {
            setAttributes({});
            setFormData(prev => ({ ...prev, title: result.title, category: `Nekretnine - ${matchedSub.name}`, description: result.description || prev.description }));
            setStep('form');
            showToast(`AI: Nekretnine → ${matchedSub.name}`);
          } else {
            setFormData(prev => ({ ...prev, title: result.title, description: result.description || prev.description }));
            setStep('nekretnine-sub');
            showToast('AI: Nekretnine');
          }
        } else if (catLower.includes('mobilni') || catLower.includes('mobiteli')) {
          const matchedBrand = findMatch(MOBILE_BRANDS, sub);
          if (matchedBrand) {
            setAttributes({});
            setFormData(prev => ({ ...prev, title: result.title, category: 'Mobilni uređaji', brand: matchedBrand.name, description: result.description || prev.description }));
            setStep('form');
            showToast(`AI: Mobilni → ${matchedBrand.name}`);
          } else {
            setFormData(prev => ({ ...prev, title: result.title, description: result.description || prev.description }));
            setStep('mobile-sub');
            showToast('AI: Mobilni uređaji');
          }
        } else if (catLower.includes('odjeća') || catLower.includes('obuća') || catLower.includes('moda')) {
          const matchedSub = findMatch(MODA_TYPES, sub);
          if (matchedSub) {
            const artikli = MODA_ARTIKLI[matchedSub.name];
            if (artikli && artikli.length > 0) {
              setAttributes({});
              setModaSubCategory(matchedSub.name);
              setFormData(prev => ({ ...prev, title: result.title, category: `Moda - ${matchedSub.name}`, description: result.description || prev.description }));
              setStep('moda-artikl');
              showToast(`AI: Moda → ${matchedSub.name}`);
            } else {
              setAttributes({});
              setFormData(prev => ({ ...prev, title: result.title, category: `Moda - ${matchedSub.name}`, description: result.description || prev.description }));
              setStep('form');
              showToast(`AI: Moda → ${matchedSub.name}`);
            }
          } else {
            setFormData(prev => ({ ...prev, title: result.title, description: result.description || prev.description }));
            setStep('moda-sub');
            showToast('AI: Odjeća i obuća');
          }
        } else if (catLower.includes('elektronika') || catLower.includes('tehnika') || catLower.includes('računal') || catLower.includes('racunal')) {
          const matchedSub = findMatch(TEHNIKA_TYPES, sub);
          if (matchedSub) {
            setAttributes({});
            setFormData(prev => ({ ...prev, title: result.title, category: `Elektronika - ${matchedSub.name}`, description: result.description || prev.description }));
            setStep('form');
            showToast(`AI: Elektronika → ${matchedSub.name}`);
          } else {
            setFormData(prev => ({ ...prev, title: result.title, description: result.description || prev.description }));
            setStep('tehnika-sub');
            showToast('AI: Elektronika');
          }
        } else if (catLower.includes('usluge') || catLower.includes('servisi')) {
          const matchedSub = findMatch(SERVICES_TYPES, sub);
          if (matchedSub) {
            setAttributes({});
            setFormData(prev => ({ ...prev, title: result.title, category: `Usluge - ${matchedSub.name}`, description: result.description || prev.description }));
            setStep('form');
            showToast(`AI: Usluge → ${matchedSub.name}`);
          } else {
            setFormData(prev => ({ ...prev, title: result.title, description: result.description || prev.description }));
            setStep('services-sub');
            showToast('AI: Usluge');
          }
        } else if (catLower.includes('poslovi')) {
          const matchedSub = findMatch(POSLOVI_TYPES, sub);
          if (matchedSub) {
            setAttributes({});
            setFormData(prev => ({ ...prev, title: result.title, category: `Poslovi - ${matchedSub.name}`, description: result.description || prev.description }));
            setStep('form');
            showToast(`AI: Poslovi → ${matchedSub.name}`);
          } else {
            setFormData(prev => ({ ...prev, title: result.title, description: result.description || prev.description }));
            setStep('poslovi-sub');
            showToast('AI: Poslovi');
          }
        } else {
          setAttributes({});
          setFormData(prev => ({ ...prev, title: result.title, category: cat, description: result.description || prev.description, price: result.price ? result.price.toString() : prev.price }));
          setStep('form');
          showToast(`AI: ${cat}`);
        }

        if (result.confidence !== undefined && result.confidence < 40) {
          setTimeout(() => showToast('Provjeri kategoriju — AI nije siguran', 'info'), 600);
        }
      } catch {
        showToast('AI pretraga nije uspjela. Pokušajte ponovo.', 'error');
      } finally {
        setIsAiLoading(false);
      }
  };

  const handleVinLookup = async () => {
    if (!formData.vin || formData.vin.length !== 17) {
      showToast('VIN mora imati točno 17 znakova', 'error');
      return;
    }
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'vin', vin: formData.vin }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'VIN lookup failed');
      const d = json.data as { brand?: string; model?: string; year?: number; engine?: string; bodyType?: string; title?: string; description?: string; confidence?: number };
      if ((d.confidence ?? 0) < 20) {
        showToast('VIN nije prepoznat. Provjerite broj.', 'error');
      } else {
        setFormData(prev => ({
          ...prev,
          title: d.title || prev.title,
          brand: d.brand || prev.brand,
          model: d.model || prev.model,
          description: d.description || prev.description,
        }));
        setAttributes(prev => ({
          ...prev,
          ...(d.year ? { godiste: d.year } : {}),
          ...(d.brand ? { marka: d.brand } : {}),
          ...(d.model ? { model: d.model } : {}),
          ...(d.engine ? { motor: d.engine } : {}),
          ...(d.bodyType ? { karoserija: d.bodyType } : {}),
        }));
        setStep('form');
        showToast('Vozilo prepoznato!');
      }
    } catch {
      showToast('Greška pri VIN pretrazi. Pokušajte ponovo.', 'error');
    }
    setIsAiLoading(false);
  };

  const getPriceLabel = () => {
    const sym = currency === 'KM' ? 'KM' : '€';
    const price = formData.price || '0';
    const suffix = formData.priceType === 'mk' ? ' MK' : formData.priceType === 'negotiable' ? ' (dogovor)' : '';
    return `${price}${suffix} ${sym}`;
  };

  // PhonePreview — adapts to current theme (light/dark)
  const PhonePreview = () => (
    <div className="w-full h-[700px] bg-[var(--c-bg)] border-[8px] border-[var(--c-border)] rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col">
      <div className="h-6 w-full flex justify-between px-6 items-center pt-2 opacity-50">
        <span className="text-[9px] font-bold text-[var(--c-text)]">9:41</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-[var(--c-text)] rounded-full opacity-40"></div>
          <div className="w-3 h-3 bg-[var(--c-text)] rounded-full opacity-40"></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar relative bg-[var(--c-bg)]">
        <div className="aspect-square bg-[var(--c-card-alt)] relative flex items-center justify-center border-b border-[var(--c-border)]">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <i className="fa-regular fa-image text-4xl text-[var(--c-text-muted)]"></i>
          )}
          <div className="absolute top-4 left-0 bg-blue-600 text-white px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-r-sm shadow-sm">
            {formData.condition}
          </div>
        </div>
        <div className="p-6">
          <h2 className="text-xl font-bold text-[var(--c-text)] leading-tight mb-2">{formData.title || 'Naslov Artikla'}</h2>
          <div className="flex items-center gap-4 border-b border-[var(--c-border)] pb-4 mb-4">
            <div className="flex items-center gap-2 text-[var(--c-text3)] text-[10px]">
              <i className="fa-solid fa-location-dot text-blue-500"></i>
              <span>{formData.location || 'Lokacija'}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--c-text3)] text-[10px]">
              <i className="fa-regular fa-clock"></i>
              <span>Upravo sada</span>
            </div>
          </div>
          <div className="border border-[var(--c-border)] rounded-[12px] overflow-hidden mb-6">
            <div className="bg-[var(--c-card)] p-4 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-widest">Cijena</span>
              <span className="text-xl font-black tracking-tight text-[var(--c-text)]">
                {getPriceLabel()}
              </span>
            </div>
          </div>
          {(formData.category.includes('Mobilni') || formData.category.includes('Mobiteli')) && (
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-[var(--c-card)] p-2 rounded-[8px] text-center border border-[var(--c-border)]">
                <i className="fa-solid fa-microchip text-[var(--c-text-muted)] text-xs mb-1"></i>
                <span className="block text-[9px] text-[var(--c-text)] font-bold mt-1">{(attributes.memorija as string) || '-'}</span>
              </div>
              <div className="bg-[var(--c-card)] p-2 rounded-[8px] text-center border border-[var(--c-border)]">
                <i className="fa-solid fa-battery-half text-[var(--c-text-muted)] text-xs mb-1"></i>
                <span className="block text-[9px] text-[var(--c-text)] font-bold mt-1">{(attributes.baterija as string) || '-'}</span>
              </div>
              <div className="bg-[var(--c-card)] p-2 rounded-[8px] text-center border border-[var(--c-border)]">
                <i className="fa-solid fa-shield text-[var(--c-text-muted)] text-xs mb-1"></i>
                <span className="block text-[9px] text-[var(--c-text)] font-bold mt-1">{attributes.garancija ? 'Da' : 'Ne'}</span>
              </div>
            </div>
          )}
          <div>
            <h3 className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest mb-2 border-l-2 border-blue-500 pl-2">Opis</h3>
            <p className="text-xs text-[var(--c-text2)] font-mono leading-relaxed whitespace-pre-line">
              {formData.description || 'Ovdje će se pojaviti opis vašeg artikla.'}
            </p>
          </div>
        </div>
      </div>
      <div className="h-16 bg-[var(--c-bg)] border-t border-[var(--c-border)] flex items-center justify-between px-6">
        <div className="w-8 h-8 rounded-full border border-[var(--c-border)]"></div>
        <div className="w-32 h-10 bg-blue-600 rounded-[10px]"></div>
      </div>
    </div>
  );

  const validateForm = () => {
    const e: typeof formErrors = {};
    if (!formData.title.trim()) e.title = 'Naslov je obavezan';
    if (formData.priceType !== 'negotiable') {
      if (!formData.price.trim()) e.price = 'Cijena je obavezna';
      else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) e.price = 'Unesite ispravnu cijenu';
    }
    if (images.length === 0 && existingImages.length === 0) e.images = 'Dodajte barem jednu sliku';
    if (!formData.category.trim()) e.category = 'Odaberite kategoriju';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePublish = async () => {
    if (!validateForm()) {
      showToast('Popunite obavezna polja', 'error');
      return;
    }
    if (!user) {
      showToast('Morate biti prijavljeni', 'error');
      return;
    }

    setIsPublishing(true);
    try {
      // 0. AI Moderation check (non-blocking — only warns, never prevents publish)
      if (!aiWarningBypass) {
        try {
          const modRes = await fetch('/api/ai/moderate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'moderate',
              title: formData.title,
              description: formData.description,
              price: Number(formData.price),
              category: formData.category,
              images: images.length,
            }),
          });
          const modJson = await modRes.json();
          if (modJson.success && modJson.data) {
            const { warnings = [], recommendation, score = 100 } = modJson.data;
            // Show a confirmation dialog if AI has concerns (but never block)
            if (warnings.length > 0 || score < 50) {
              setAiWarning({ warnings, recommendation: recommendation || 'Provjeri', score: score ?? 0 });
              setIsPublishing(false);
              return; // Pause — user will see the warning dialog and can choose to proceed
            }
          }
        } catch { /* moderation failure must not block publish */ }
      }
      // Reset bypass flag for next publish
      setAiWarningBypass(false);

      // 1. Upload new images to Supabase Storage
      let newImageUrls: string[] = [];
      if (images.length > 0) {
        newImageUrls = await uploadProductImages(user.id, images);
      }
      const finalImages = [...existingImages, ...newImageUrls];

      // 1.5 Resolve category name → UUID
      const categoryId = await resolveCategoryId(formData.category);

      // Convert KM → EUR if needed
      const priceEUR = currency === 'KM'
        ? Math.round((Number(formData.price) / BAM_RATE) * 100) / 100
        : Number(formData.price);

      // Merge price_type into attributes
      const priceTypeLabel = formData.priceType === 'mk' ? 'MK' : formData.priceType === 'negotiable' ? 'Po dogovoru' : 'Fiksno';
      const mergedAttributes = { ...attributes, price_type: priceTypeLabel };

      // Generate AI tags if not already present (non-blocking)
      let tags = generatedTags;
      if (tags.length === 0 && formData.title.trim()) {
        try {
          const tagRes = await fetch('/api/ai/enhance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'tags', title: formData.title, description: formData.description, category: formData.category }),
          });
          const tagJson = await tagRes.json();
          if (tagJson.success && Array.isArray(tagJson.data?.tags)) {
            tags = tagJson.data.tags;
          }
        } catch { /* Tags-Generierung fehlgeschlagen — nicht blockierend */ }
      }

      // Merge vehicle chassis tags if a chassis code was recognized during upload
      if (chassisMatchResult && chassisUserInput) {
        const vehicleTags = generateVehicleTags(chassisUserInput, chassisMatchResult);
        const merged = new Set([...tags, ...vehicleTags]);
        tags = [...merged];
      }

      if (isEditMode && editProductId) {
        // ── EDIT MODE: update existing product ────────────────
        await updateProduct(editProductId, {
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          price: priceEUR,
          category_id: categoryId,
          condition: mapCondition(formData.condition),
          images: finalImages.length > 0 ? finalImages : undefined,
          location: formData.location.trim() || null,
          attributes: mergedAttributes,
          tags: tags.length > 0 ? tags : undefined,
        });
        showToast('Oglas uspješno ažuriran!');
        router.push(`/product/${editProductId}`);
      } else {
        // ── CREATE MODE: publish new product ──────────────────
        const newProduct = await createProduct({
          seller_id: user.id,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          price: priceEUR,
          category_id: categoryId,
          condition: mapCondition(formData.condition),
          images: finalImages,
          status: 'active',
          location: formData.location.trim() || null,
          attributes: mergedAttributes,
          tags,
        });

        // Award XP for upload
        try {
          const { logActivity } = await import('@/services/levelService');
          await logActivity(user.id, 'upload');
        } catch {
          // XP insert failed silently — non-critical
        }

        // Show success overlay, then redirect after 1.5s
        setNewProductId(newProduct.id);
        setUploadSuccess(true);
        showToast('Oglas objavljen! +10 XP 🎉');
        setTimeout(() => {
          router.push(`/product/${newProduct.id}`);
        }, 1500);
        return; // Don't clear isPublishing — overlay is shown
      }
    } catch (err) {
      showToast('Greška pri objavljivanju. Pokušajte ponovo.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const getActiveTitle = () => formData.title || standaloneInput;

  const handleAiGenerateDescription = async () => {
    const title = getActiveTitle();
    if (!title) return;
    setIsAiLoading(true);
    try {
      const description = await generateListingDescription(title, formData.category || 'General');
      setFormData(prev => ({ ...prev, description }));
    } catch {
      showToast('Greška pri generiranju opisa', 'error');
    } finally {
      setShowAiWindow(false);
      setIsAiLoading(false);
    }
  };

  const handleAiSuggestPrice = async () => {
    const title = getActiveTitle();
    if (!title) return;
    setIsAiLoading(true);
    try {
      const price = await suggestPrice(title, formData.category);
      if (price > 0) setFormData(prev => ({ ...prev, price: price.toString() }));
    } catch {
      showToast('Greška pri procjeni cijene', 'error');
    } finally {
      setShowAiWindow(false);
      setIsAiLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
    });

  const handleAiAnalyzeImage = async () => {
    if (images.length === 0) { showToast('Dodajte sliku za analizu', 'error'); return; }
    setIsAiLoading(true);
    try {
      const file = images[0];
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'full', image: base64, mimeType: file.type || 'image/jpeg' }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setFormData(prev => ({
          ...prev,
          title: d.title || prev.title,
          category: d.category || prev.category,
          description: d.description || prev.description,
          brand: d.brand || prev.brand,
          model: d.model || prev.model,
          condition: d.condition === 'Novo' ? 'Novo' : d.condition === 'Kao novo' ? 'Kao novo' : 'Korišteno',
          price: d.priceEstimate?.min ? Math.round((d.priceEstimate.min + (d.priceEstimate.max || d.priceEstimate.min)) / 2).toString() : prev.price,
        }));
        showToast('AI prepoznao sliku i popunio podatke!');
        setStep('form');
      } else {
        showToast('AI nije uspio prepoznati sliku', 'error');
      }
    } catch { showToast('Greška pri analizi slike', 'error'); }
    setIsAiLoading(false);
    setShowAiWindow(false);
  };

  const handleAiImproveTitle = async () => {
    if (!formData.title) { showToast('Unesite naslov za poboljšanje', 'error'); return; }
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'title', title: formData.title, category: formData.category }),
      });
      const json = await res.json();
      if (json.success && json.data?.improvedTitle) {
        setFormData(prev => ({ ...prev, title: json.data.improvedTitle }));
        showToast('Naslov poboljšan!');
      }
    } catch { showToast('Greška pri poboljšanju naslova', 'error'); }
    setIsAiLoading(false);
    setShowAiWindow(false);
  };

  const handleAiCategorize = async () => {
    if (!formData.title) { showToast('Unesite naslov ili opis za kategorizaciju', 'error'); return; }
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'categorize', title: formData.title, description: formData.description }),
      });
      const json = await res.json();
      if (json.success && json.data?.category) {
        setFormData(prev => ({ ...prev, category: json.data.category }));
        if (Array.isArray(json.data.tags) && json.data.tags.length > 0) {
          setGeneratedTags(json.data.tags);
        }
        showToast(`Kategorija: ${json.data.category}`);
      }
    } catch { showToast('Greška pri kategorizaciji', 'error'); }
    setIsAiLoading(false);
    setShowAiWindow(false);
  };

  // AI Assistant Overlay UI - KEEP dark colors as-is (intentionally dark-themed overlay)
  const AiAssistantWindow = () => {
    const hasInput = !!getActiveTitle();

    return (
      <div className={`fixed inset-x-0 bottom-0 z-[120] transition-all duration-500 transform ${showAiWindow ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowAiWindow(false)}></div>
        <div className="relative bg-[var(--c-card)] border-t border-[var(--c-border)] rounded-t-[32px] p-4 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
          <div className="w-12 h-1 bg-[var(--c-border)] rounded-full mx-auto mb-8"></div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                      <i className="fa-solid fa-wand-magic-sparkles text-2xl"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[var(--c-text)] italic tracking-tight">NudiNađi AI</h3>
                      <p className="text-[11px] text-blue-400 font-bold uppercase tracking-widest">Smart Studio</p>
                    </div>
                </div>
                <button onClick={() => setShowAiWindow(false)} className="w-10 h-10 rounded-full bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text3)] hover:bg-[var(--c-active)]">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            {!formData.title && (
                <div className="relative">
                    <input
                        type="text"
                        value={standaloneInput}
                        onChange={(e) => setStandaloneInput(e.target.value)}
                        placeholder="Šta želiš analizirati?"
                        className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-2xl py-4 px-5 text-sm text-[var(--c-text)] focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-[var(--c-placeholder)]"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleAiAnalyzeImage}
                disabled={images.length === 0 || isAiLoading}
                className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-2xl p-5 flex items-center gap-5 active:scale-95 transition-all text-left group disabled:opacity-50 hover:bg-[var(--c-hover)]"
              >
                <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-camera-retro"></i>
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[var(--c-text)]">Prepoznaj Sliku</h4>
                  <p className="text-[11px] text-[var(--c-text3)]">AI popunjava sve podatke sa foto</p>
                </div>
                {images.length === 0 && <span className="ml-auto text-[9px] text-[var(--c-text-muted)] font-bold uppercase">Dodaj sliku</span>}
              </button>

              <button
                onClick={handleAiGenerateDescription}
                disabled={!hasInput || isAiLoading}
                className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-2xl p-5 flex items-center gap-5 active:scale-95 transition-all text-left group disabled:opacity-50 hover:bg-[var(--c-hover)]"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-pen-fancy"></i>
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[var(--c-text)]">Generiši Opis</h4>
                  <p className="text-[11px] text-[var(--c-text3)]">Profesionalni tekst za prodaju</p>
                </div>
              </button>

              <button
                onClick={handleAiImproveTitle}
                disabled={!formData.title || isAiLoading}
                className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-2xl p-5 flex items-center gap-5 active:scale-95 transition-all text-left group disabled:opacity-50 hover:bg-[var(--c-hover)]"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-heading"></i>
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[var(--c-text)]">Poboljšaj Naslov</h4>
                  <p className="text-[11px] text-[var(--c-text3)]">Optimizacija naslova za bolji reach</p>
                </div>
              </button>

              <button
                onClick={handleAiSuggestPrice}
                disabled={!hasInput || isAiLoading}
                className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-2xl p-5 flex items-center gap-5 active:scale-95 transition-all text-left group disabled:opacity-50 hover:bg-[var(--c-hover)]"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-chart-line"></i>
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[var(--c-text)]">Provjeri Cijenu</h4>
                  <p className="text-[11px] text-[var(--c-text3)]">Analiza tržišne vrijednosti</p>
                </div>
              </button>

              <button
                onClick={handleAiCategorize}
                disabled={!hasInput || isAiLoading}
                className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-2xl p-5 flex items-center gap-5 active:scale-95 transition-all text-left group disabled:opacity-50 hover:bg-[var(--c-hover)]"
              >
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-layer-group"></i>
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[var(--c-text)]">Kategoriziraj AI</h4>
                  <p className="text-[11px] text-[var(--c-text3)]">Automatski odabir kategorije</p>
                </div>
              </button>

              {isAiLoading && (
                <div className="flex items-center justify-center gap-3 py-3 text-blue-400">
                  <i className="fa-solid fa-spinner animate-spin"></i>
                  <span className="text-[12px] font-bold">AI obrađuje...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 1. Selection (Main categories) - CENTERED BENTO STYLE
  if (step === 'selection') {
    return (
      <MainLayout title="Kategorija" showSigurnost={false} hideSearchOnMobile headerRight={
        <div className="flex items-center gap-1.5 md:gap-2">
          <button onClick={() => setShowAiInfo(true)} className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-4 py-2 md:py-2.5 rounded-[8px] text-[10px] md:text-[11px] font-bold text-blue-500 hover:text-blue-600 bg-blue-500/5 hover:bg-blue-50 border border-blue-500/20 hover:border-blue-300 transition-all group">
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-[5px] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <i className="fa-solid fa-camera-retro text-[9px] md:text-[10px] text-blue-500"></i>
            </div>
            <span className="hidden sm:inline">AI Foto</span>
          </button>
          <button onClick={() => router.push('/')} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors"><i className="fa-solid fa-xmark text-xs md:text-sm"></i></button>
        </div>
      }>
        {/* AI Image Recognition Info Popup */}
        {showAiInfo && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 md:p-10" onClick={() => setShowAiInfo(false)}>
            <div className="absolute inset-0 bg-[var(--c-overlay)] backdrop-blur-sm"></div>
            <div className="relative bg-[var(--c-card)] border border-[var(--c-border)] rounded-[8px] p-5 sm:p-8 max-w-lg w-full shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[8px] bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <i className="fa-solid fa-camera-retro text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[var(--c-text)]">AI Prepoznavanje Slika</h3>
                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Smart Recognition</p>
                  </div>
                </div>
                <button onClick={() => setShowAiInfo(false)} className="w-9 h-9 rounded-[6px] bg-[var(--c-hover)] hover:bg-[var(--c-active)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] transition-all">
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>
              </div>

              {/* How it works - 3 steps */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-[2px] bg-blue-500"></div>
                <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Kako radi?</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-6">
                {[
                  { step: '1', icon: 'fa-camera', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Slikaj', desc: 'Fotografiši artikal koji prodaješ' },
                  { step: '2', icon: 'fa-wand-magic-sparkles', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', label: 'AI analizira', desc: 'AI prepoznaje artikal i popunjava podatke' },
                  { step: '3', icon: 'fa-check-circle', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Gotovo', desc: 'Naslov, kategorija, cijena — sve automatski' },
                ].map((s) => (
                  <div key={s.step} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[6px] p-3 sm:p-4 text-center sm:text-center hover:border-blue-500/30 transition-colors flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0">
                    <div className={`w-10 h-10 rounded-[6px] ${s.color} border flex items-center justify-center mx-auto mb-3`}>
                      <i className={`fa-solid ${s.icon} text-sm`}></i>
                    </div>
                    <p className="text-[11px] font-black text-[var(--c-text)] mb-1">{s.label}</p>
                    <p className="text-[9px] text-[var(--c-text3)] leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>

              {/* App-only notice */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-[8px] p-5 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-[6px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 flex-shrink-0 mt-0.5">
                    <i className="fa-solid fa-mobile-screen text-sm"></i>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-[var(--c-text)] mb-0.5">Samo u aplikaciji</p>
                    <p className="text-[10px] text-[var(--c-text2)] leading-relaxed">AI prepoznavanje slika koristi kameru uređaja i trenutno je dostupno samo u NudiNađi mobilnoj aplikaciji.</p>
                  </div>
                </div>
              </div>

              <button onClick={() => setShowAiInfo(false)} className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 text-white text-[12px] font-black rounded-[8px] transition-colors active:scale-[0.98]">
                Razumijem
              </button>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-4 pt-2 pb-24">
          <div className="text-center px-1">
             <h2 className="text-[11px] font-black text-blue-500 uppercase tracking-[3px] mb-1">Šta prodaješ?</h2>
             <p className="text-sm text-[var(--c-text2)] font-medium">Samo upiši naziv, AI prepoznaje kategoriju.</p>
          </div>

          {/* MAGIC SEARCH BAR */}
          <div className="pb-2">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[22px] blur opacity-20 group-focus-within:opacity-60 transition duration-500"></div>
                    <div className="relative bg-[var(--c-card-alt)] rounded-[20px] flex items-center p-1.5 border border-[var(--c-border2)]">
                        <div className="w-10 h-10 rounded-2xl bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text2)]">
                             <i className="fa-solid fa-wand-magic-sparkles text-sm"></i>
                        </div>
                        <input
                            type="text"
                            value={magicSearchInput}
                            onChange={(e) => setMagicSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleMagicSearch()}
                            placeholder="Npr. Sony PS5, Golf 7, Nike Patike..."
                            className="w-full bg-transparent text-[11px] font-medium text-[var(--c-text)] px-3 focus:outline-none placeholder:text-[var(--c-placeholder)]"
                        />
                        <button
                            onClick={handleMagicSearch}
                            disabled={isAiLoading}
                            className="w-10 h-10 rounded-xl bg-[var(--c-active)] flex items-center justify-center text-[var(--c-text)] hover:bg-[var(--c-active)] transition-all disabled:opacity-50"
                        >
                            {isAiLoading ? <i className="fa-solid fa-spinner animate-spin text-xs"></i> : <i className="fa-solid fa-arrow-up text-xs"></i>}
                        </button>
                    </div>
                </div>
                <p className="text-center text-[8px] text-[var(--c-text-muted)] mt-2 font-medium">
                    <span className="text-blue-500">NudiNađi AI</span> automatski prepoznaje kategoriju i detalje.
                </p>
          </div>

          {/* Top 2 Hero Cards - Vozila + Nekretnine */}
          <div className="grid grid-cols-2 gap-3">
            <button
                onClick={() => selectCategory('Vozila')}
                className="relative h-36 bg-[var(--c-card)] rounded-[24px] border border-[var(--c-border)] overflow-hidden group active:scale-[0.98] transition-all p-5 flex flex-col justify-between items-start hover:border-blue-500/20"
            >
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-blue-500/15 blur-[25px] group-hover:opacity-100 transition-opacity"></div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-car text-xl"></i>
                </div>
                <div className="text-left relative z-10">
                    <h3 className="text-[15px] font-black text-[var(--c-text)]">Vozila</h3>
                    <p className="text-[9px] text-[var(--c-text3)] mt-0.5 font-medium">Auti, Motori, Dijelovi</p>
                </div>
            </button>

            <button
                onClick={() => selectCategory('Nekretnine')}
                className="relative h-36 bg-[var(--c-card)] rounded-[24px] border border-[var(--c-border)] overflow-hidden group active:scale-[0.98] transition-all p-5 flex flex-col justify-between items-start hover:border-emerald-500/20"
            >
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-emerald-500/15 blur-[25px] group-hover:opacity-100 transition-opacity"></div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-building text-xl"></i>
                </div>
                <div className="text-left relative z-10">
                    <h3 className="text-[15px] font-black text-[var(--c-text)]">Nekretnine</h3>
                    <p className="text-[9px] text-[var(--c-text3)] mt-0.5 font-medium">Stanovi, Kuće</p>
                </div>
            </button>
          </div>

          {/* Middle row - 3 equal cards */}
          <div className="grid grid-cols-3 gap-3">
            <button
                onClick={() => selectCategory('Mobilni uređaji')}
                className="relative bg-[var(--c-card)] rounded-[20px] border border-[var(--c-border)] overflow-hidden group active:scale-[0.98] transition-all p-4 flex flex-col items-center text-center gap-2.5 hover:border-rose-500/20"
            >
                <div className="w-11 h-11 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-mobile-screen text-lg"></i>
                </div>
                <span className="text-[11px] font-bold text-[var(--c-text)] leading-tight">Mobilni</span>
            </button>

            <button
                onClick={() => selectCategory('Elektronika')}
                className="relative bg-[var(--c-card)] rounded-[20px] border border-[var(--c-border)] overflow-hidden group active:scale-[0.98] transition-all p-4 flex flex-col items-center text-center gap-2.5 hover:border-purple-500/20"
            >
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-laptop text-lg"></i>
                </div>
                <span className="text-[11px] font-bold text-[var(--c-text)] leading-tight">Elektronika</span>
            </button>

            <button
                onClick={() => selectCategory('Odjeća i obuća')}
                className="relative bg-[var(--c-card)] rounded-[20px] border border-[var(--c-border)] overflow-hidden group active:scale-[0.98] transition-all p-4 flex flex-col items-center text-center gap-2.5 hover:border-amber-500/20"
            >
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-shirt text-lg"></i>
                </div>
                <span className="text-[11px] font-bold text-[var(--c-text)] leading-tight">Moda</span>
            </button>
          </div>

          {/* Bottom row - 2 compact cards */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => selectCategory('Servisi i usluge')} className="relative bg-[var(--c-card)] rounded-[20px] border border-[var(--c-border)] overflow-hidden group active:scale-[0.98] transition-all p-4 flex flex-col items-center text-center gap-2.5 hover:border-cyan-500/20">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform"><i className="fa-solid fa-wrench text-lg"></i></div>
                <span className="text-[11px] font-bold text-[var(--c-text)] leading-tight">Usluge</span>
            </button>
            <button onClick={() => selectCategory('Poslovi')} className="relative bg-[var(--c-card)] rounded-[20px] border border-[var(--c-border)] overflow-hidden group active:scale-[0.98] transition-all p-4 flex flex-col items-center text-center gap-2.5 hover:border-indigo-500/20">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform"><i className="fa-solid fa-briefcase text-lg"></i></div>
                <span className="text-[11px] font-bold text-[var(--c-text)] leading-tight">Poslovi</span>
            </button>
          </div>

          {/* Link Import Shortcut */}
          <Link href="/link-import" className="block w-full relative group overflow-hidden bg-orange-50 border border-orange-200 rounded-[24px] p-5 flex items-center justify-between active:scale-[0.98] transition-all hover:bg-orange-100">
              <div className="flex items-center gap-4 z-10">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                  <i className="fa-solid fa-file-import"></i>
                </div>
                <div className="text-left">
                  <h4 className="text-[13px] font-black text-[var(--c-text)]">Import s drugog portala</h4>
                  <p className="text-[9px] text-orange-500 font-bold uppercase mt-0.5 tracking-wide">Zalijepi link — AI uvozi sve</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                <i className="fa-solid fa-arrow-right text-orange-400 text-xs group-hover:translate-x-1 transition-transform"></i>
              </div>
          </Link>

          {/* View All Button */}
          <button onClick={() => setStep('all-categories')} className="w-full relative group overflow-hidden bg-[var(--c-hover)] border border-[var(--c-border2)] rounded-[24px] p-5 flex items-center justify-between active:scale-[0.98] transition-all mt-1 hover:bg-[var(--c-hover)]">
              <div className="flex items-center gap-4 z-10">
              <div className="w-10 h-10 rounded-full bg-[var(--c-hover)] border border-[var(--c-border)] flex items-center justify-center text-[var(--c-text3)] group-hover:text-[var(--c-text)] transition-colors">
                  <i className="fa-solid fa-layer-group"></i>
              </div>
              <div className="text-left">
                  <h4 className="text-[13px] font-black text-[var(--c-text)]">Sve kategorije</h4>
                  <p className="text-[9px] text-[var(--c-text3)] font-bold uppercase mt-0.5">Pogledaj sve {CATEGORIES.length} opcija</p>
              </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[var(--c-hover)] flex items-center justify-center">
                   <i className="fa-solid fa-arrow-right text-[var(--c-text3)] text-xs group-hover:text-[var(--c-text)] transition-colors"></i>
              </div>
          </button>
        </div>
      </MainLayout>
    );
  }

  // 2. FULL VERTICAL CATEGORY LIST with expandable subcategories
  if (step === 'all-categories') {
    const filteredCats = filteredCategories;

    return (
      <MainLayout title="Sve Kategorije" showSigurnost={false} hideSearchOnMobile onBack={() => { setStep('selection'); setCatSearch(''); setExpandedCat(null); }}>
        <div className="max-w-4xl mx-auto space-y-3 pt-2 pb-24">
          {/* Search */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--c-text-muted)]">
              <i className="fa-solid fa-magnifying-glass text-xs"></i>
            </div>
            <input
              type="text"
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
              placeholder="Pretraži kategorije..."
              className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl py-3 pl-11 pr-4 text-sm text-[var(--c-text)] placeholder:text-[var(--c-placeholder)] focus:outline-none focus:border-blue-400 transition-colors"
            />
            {catSearch && (
              <button onClick={() => setCatSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--c-text-muted)] hover:text-[var(--c-text)]">
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            )}
          </div>

          <p className="text-[10px] text-[var(--c-text-muted)] font-medium px-1">{filteredCats.length} kategorija</p>

          {/* Category accordion list */}
          <div className="flex flex-col gap-2">
            {filteredCats.map((cat) => {
              const isExpanded = expandedCat === cat.id;
              const hasSubs = cat.subCategories.length > 0;

              return (
                <div key={cat.id} className="rounded-[20px] border border-[var(--c-border)] bg-[var(--c-card)] overflow-hidden transition-all">
                  {/* Category header */}
                  <button
                    onClick={() => {
                      if (hasSubs) {
                        setExpandedCat(isExpanded ? null : cat.id);
                      } else {
                        selectCategory(cat.name);
                      }
                    }}
                    className="w-full p-4 flex items-center justify-between group hover:bg-[var(--c-hover)] transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[var(--c-hover)] border border-[var(--c-border)] flex items-center justify-center text-[var(--c-text3)] group-hover:text-blue-400 transition-all">
                        <i className={`fa-solid ${cat.icon} text-base`}></i>
                      </div>
                      <div className="text-left">
                        <h4 className="text-[13px] font-bold text-[var(--c-text)] group-hover:text-blue-400 transition-colors">{cat.name}</h4>
                        {hasSubs && <p className="text-[9px] text-[var(--c-text-muted)] mt-0.5">{cat.subCategories.length} podkategorija</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasSubs ? (
                        <i className={`fa-solid fa-chevron-down text-[10px] text-[var(--c-text-muted)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}></i>
                      ) : (
                        <i className="fa-solid fa-chevron-right text-[10px] text-[var(--c-text-muted)] group-hover:translate-x-1 transition-all"></i>
                      )}
                    </div>
                  </button>

                  {/* Expanded subcategories */}
                  {isExpanded && hasSubs && (
                    <div className="border-t border-[var(--c-border)] bg-[var(--c-bg)]">
                      {/* Quick select - use main category directly */}
                      <button
                        onClick={() => selectCategory(cat.name)}
                        className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-[var(--c-hover)] transition-colors border-b border-[var(--c-border)]"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                          <i className="fa-solid fa-layer-group text-[10px]"></i>
                        </div>
                        <span className="text-[12px] font-bold text-blue-500">Sve iz &quot;{cat.name}&quot;</span>
                      </button>

                      {cat.subCategories.map((sub, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            // Route vehicle subcategories through brand picker
                            if (cat.id === 'vozila' || cat.name.toLowerCase().includes('vozila')) {
                              const vType = resolveVehicleType(sub.name);
                              setVehicleType(vType);
                              setFormData(prev => ({ ...prev, category: `Vozila - ${sub.name}` }));
                              setStep('car-method');
                              return;
                            }
                            if (cat.id === 'dijelovi' || cat.name.toLowerCase().includes('dijelovi')) {
                              setVehicleType('parts');
                              setFormData(prev => ({ ...prev, category: 'Dijelovi za vozila' }));
                              setPartsSubStep('brand');
                              setStep('parts-sub');
                              return;
                            }
                            // Check if this subcategory has detail options
                            const catDetails = CATEGORY_DETAILS[sub.name];
                            if (catDetails && catDetails.length > 0) {
                              const colorInfo = DETAIL_COLOR_MAP[sub.name];
                              setParentSubCategory(sub.name);
                              setParentColor(colorInfo?.color || 'blue');
                              setPreviousStep('all-categories');
                              setFormData(prev => ({ ...prev, category: `${cat.name} - ${sub.name}` }));
                              setStep('detail-sub');
                            } else {
                              setFormData(prev => ({ ...prev, category: `${cat.name} - ${sub.name}` }));
                              setStep('form');
                            }
                          }}
                          className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-[var(--c-hover)] transition-colors group/sub"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--c-text-muted)] group-hover/sub:bg-blue-400 transition-colors"></div>
                            <span className="text-[12px] font-medium text-[var(--c-text)] group-hover/sub:text-blue-400 transition-colors">{sub.name}</span>
                          </div>
                          {sub.items && (
                            <span className="text-[9px] text-[var(--c-text-muted)] font-medium">{sub.items.length}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredCats.length === 0 && (
            <div className="text-center py-12">
              <i className="fa-solid fa-search text-2xl text-[var(--c-text-muted)] mb-3 block"></i>
              <p className="text-sm text-[var(--c-text2)] font-medium">Nema rezultata za &quot;{catSearch}&quot;</p>
              <button onClick={() => setCatSearch('')} className="text-xs text-blue-500 font-bold mt-2 hover:underline">Očisti pretragu</button>
            </div>
          )}
        </div>
      </MainLayout>
    );
  }

  // ── Shared Quick-Tap Renderer ──
  const renderQuickTap = (
    title: string,
    color: string,
    questions: QuickTapQuestion[],
    backStep: UploadStep,
  ) => (
    <MainLayout title={title} showSigurnost={false} hideSearchOnMobile onBack={() => setStep(backStep)}>
      <div className="max-w-4xl mx-auto pt-2 pb-32">
        {/* Überschrift */}
        <div className="px-1 mb-5">
          <h2 className={`text-[11px] font-black text-${color}-500 uppercase tracking-[3px] mb-1`}>Brzo popunite</h2>
          <p className="text-sm text-[var(--c-text2)] font-medium">Odaberite opcije koje odgovaraju vašem oglasu</p>
        </div>

        {/* Frage-Cards */}
        <div className="space-y-4">
          {questions.map((q) => {
            const currentValue = String(attributes[q.key] || '');
            const selectedValues = q.multi ? currentValue.split(',').filter(Boolean) : [];
            const isCustomOpen = customInputOpen[q.key] || false;
            const customVal = customInputValues[q.key] || '';
            const isCustomValueActive = q.customInput && currentValue && !q.options.includes(currentValue);

            return (
              <div key={q.key} className={`bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] p-4 hover:border-${color}-500/20 transition-colors`}>
                <p className={`text-[10px] font-black text-${color}-400 uppercase tracking-[2px] mb-3`}>
                  {q.label}
                  {q.multi && <span className="normal-case tracking-normal font-medium text-[var(--c-text-muted)] ml-1">(više odgovora)</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {/* Standard Option-Buttons */}
                  {q.options.map((opt) => {
                    const isSelected = q.multi
                      ? selectedValues.includes(opt)
                      : currentValue === opt;

                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          if (isCustomOpen) {
                            setCustomInputOpen(prev => ({ ...prev, [q.key]: false }));
                            setCustomInputValues(prev => ({ ...prev, [q.key]: '' }));
                          }
                          if (q.multi) {
                            const exclusive = ['Sve priključeno', 'Sve', 'Bez'];
                            let newVals: string[];
                            if (exclusive.includes(opt)) {
                              newVals = selectedValues.includes(opt) ? [] : [opt];
                            } else {
                              const cleaned = selectedValues.filter(v => !exclusive.includes(v));
                              newVals = cleaned.includes(opt) ? cleaned.filter(v => v !== opt) : [...cleaned, opt];
                            }
                            setAttributes(prev => ({ ...prev, [q.key]: newVals.join(',') }));
                          } else {
                            setAttributes(prev => ({
                              ...prev,
                              [q.key]: prev[q.key] === opt ? '' : opt,
                            }));
                          }
                        }}
                        className={`px-4 py-2.5 rounded-[14px] text-[12px] font-bold transition-all active:scale-95 ${
                          isSelected
                            ? `bg-${color}-600 text-white shadow-lg shadow-${color}-600/25`
                            : `bg-[var(--c-hover)] text-[var(--c-text)] border border-[var(--c-border)] hover:border-${color}-500/40`
                        }`}
                      >
                        {q.multi && isSelected && <i className="fa-solid fa-check text-[9px] mr-1.5" />}
                        {opt}
                      </button>
                    );
                  })}

                  {/* Custom Input Toggle-Button */}
                  {q.customInput && !isCustomOpen && !isCustomValueActive && (
                    <button
                      onClick={() => {
                        setCustomInputOpen(prev => ({ ...prev, [q.key]: true }));
                        if (currentValue && q.options.includes(currentValue)) {
                          setAttributes(prev => ({ ...prev, [q.key]: '' }));
                        }
                      }}
                      className={`px-4 py-2.5 rounded-[14px] text-[12px] font-bold transition-all active:scale-95 border border-dashed border-${color}-500/40 text-${color}-400 hover:bg-${color}-500/10`}
                    >
                      <i className="fa-solid fa-pen text-[9px] mr-1.5" />
                      Unesi
                    </button>
                  )}

                  {/* Aktiver Custom-Wert Chip */}
                  {q.customInput && isCustomValueActive && !isCustomOpen && (
                    <button
                      onClick={() => {
                        setAttributes(prev => ({ ...prev, [q.key]: '' }));
                        setCustomInputValues(prev => ({ ...prev, [q.key]: '' }));
                      }}
                      className={`px-4 py-2.5 rounded-[14px] text-[12px] font-bold bg-${color}-600 text-white shadow-lg shadow-${color}-600/25 transition-all active:scale-95`}
                    >
                      {currentValue}
                      <i className="fa-solid fa-xmark text-[9px] ml-2 opacity-70" />
                    </button>
                  )}
                </div>

                {/* Custom Input Inline-Feld */}
                {q.customInput && isCustomOpen && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className={`flex-1 flex items-center bg-[var(--c-hover)] border border-${color}-500/40 rounded-[14px] px-3 py-2 focus-within:border-${color}-500`}>
                      <input
                        type={q.customInput.type}
                        value={customVal}
                        onChange={(e) => setCustomInputValues(prev => ({ ...prev, [q.key]: e.target.value }))}
                        placeholder={q.customInput.placeholder}
                        min={q.customInput.min}
                        max={q.customInput.max}
                        step={q.customInput.step}
                        className="flex-1 bg-transparent text-[var(--c-text)] text-[13px] font-bold outline-none placeholder:text-[var(--c-text-muted)] placeholder:font-normal [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && customVal.trim()) {
                            const val = `${customVal.trim()} ${q.customInput!.unit}`;
                            setAttributes(prev => ({ ...prev, [q.key]: val }));
                            setCustomInputOpen(prev => ({ ...prev, [q.key]: false }));
                          }
                        }}
                      />
                      <span className={`text-[12px] font-bold text-${color}-400 ml-1`}>{q.customInput.unit}</span>
                    </div>
                    <button
                      onClick={() => {
                        if (customVal.trim()) {
                          const val = `${customVal.trim()} ${q.customInput!.unit}`;
                          setAttributes(prev => ({ ...prev, [q.key]: val }));
                          setCustomInputOpen(prev => ({ ...prev, [q.key]: false }));
                        }
                      }}
                      disabled={!customVal.trim()}
                      className={`w-10 h-10 rounded-[14px] flex items-center justify-center transition-all active:scale-95 ${
                        customVal.trim()
                          ? `bg-${color}-600 text-white`
                          : 'bg-[var(--c-hover)] text-[var(--c-text-muted)]'
                      }`}
                    >
                      <i className="fa-solid fa-check text-sm" />
                    </button>
                    <button
                      onClick={() => {
                        setCustomInputOpen(prev => ({ ...prev, [q.key]: false }));
                        setCustomInputValues(prev => ({ ...prev, [q.key]: '' }));
                      }}
                      className="w-10 h-10 rounded-[14px] flex items-center justify-center bg-[var(--c-hover)] text-[var(--c-text-muted)] hover:text-red-400 transition-all active:scale-95"
                    >
                      <i className="fa-solid fa-xmark text-sm" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[var(--c-border)]" style={{ background: 'var(--c-bg)' }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex gap-3">
          <button
            onClick={() => setStep('form')}
            className="flex-1 py-3 rounded-[14px] font-bold text-[12px] bg-[var(--c-card)] text-[var(--c-text2)] border border-[var(--c-border)] active:scale-95 transition-all hover:bg-[var(--c-hover)]"
          >
            Preskoči
          </button>
          <button
            onClick={() => setStep('form')}
            className={`flex-[2] py-3 rounded-[14px] text-white font-bold text-[12px] bg-${color}-600 hover:bg-${color}-700 active:scale-95 transition-all shadow-lg shadow-${color}-600/25`}
          >
            Dalje <i className="fa-solid fa-arrow-right ml-1.5 text-[10px]" />
          </button>
        </div>
      </div>
    </MainLayout>
  );

  // ── Breadcrumb render function ──
  const renderBreadcrumb = () => {
    if (breadcrumb.length === 0) return null;
    return (
      <div className="flex flex-wrap items-center gap-1 px-1 py-2 mb-3">
        {breadcrumb.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <i className="fa-solid fa-chevron-right text-[8px] text-[var(--c-text-muted)]"></i>}
            <button
              onClick={() => {
                setBreadcrumb(prev => prev.slice(0, idx + 1));
                setStep(crumb.step);
                if (crumb.subStep) {
                  setPartsSubStep(crumb.subStep as typeof partsSubStep);
                }
                if (crumb.step === 'car-method') {
                  // Reset car flow to brand step when clicking back
                  setCarFlowStep('brand');
                }
              }}
              className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                idx === breadcrumb.length - 1
                  ? 'text-blue-500 bg-blue-500/10'
                  : 'text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-hover)]'
              }`}
            >
              {crumb.label}
            </button>
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Helper: render a sub-selection grid
  const renderSubSelection = (
    title: string,
    subtitle: string,
    color: string,
    items: { name: string; icon: string; type?: string }[],
    onSelect: (name: string) => void,
    searchPlaceholder: string,
    aiLabel: string,
    backStep: UploadStep = 'selection'
  ) => (
    <MainLayout title={title} showSigurnost={false} hideSearchOnMobile onBack={() => setStep(backStep)}>
      <div className="max-w-4xl mx-auto space-y-4 pt-2 pb-24">
        <div className="px-1 mb-2">
           <h2 className={`text-[11px] font-black text-${color}-500 uppercase tracking-[3px] mb-1`}>{subtitle}</h2>
           <p className="text-sm text-[var(--c-text2)] font-medium">Koji tip želite oglasiti?</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
           {items.filter(item => item.name !== 'Ostalo').map((item, index) => (
              <button
                  key={index}
                  onClick={() => onSelect(item.name)}
                  className={`bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] p-4 flex flex-col items-center justify-center gap-3 text-center group active:scale-95 transition-all hover:bg-[var(--c-hover)] hover:border-${color}-500/30`}
              >
                  <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center text-${color}-400 border border-${color}-500/20 group-hover:scale-110 transition-transform`}>
                      <i className={`${item.type === 'brands' ? 'fa-brands' : 'fa-solid'} ${item.icon} text-lg`}></i>
                  </div>
                  <div>
                      <span className="text-[12px] font-bold text-[var(--c-text)] block leading-tight">{item.name}</span>
                  </div>
              </button>
           ))}
        </div>

        {/* Ostalo — full-width */}
        {items.find(item => item.name === 'Ostalo') && (
          <button
            onClick={() => onSelect('Ostalo')}
            className={`w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] p-4 flex items-center gap-4 group active:scale-[0.98] transition-all hover:bg-[var(--c-hover)] hover:border-${color}-500/30`}
          >
            <div className={`w-11 h-11 rounded-xl bg-${color}-500/10 flex items-center justify-center text-${color}-400 border border-${color}-500/20 group-hover:scale-110 transition-transform shrink-0`}>
              <i className="fa-solid fa-ellipsis text-lg"></i>
            </div>
            <div className="text-left">
              <span className="text-[13px] font-bold text-[var(--c-text)] block">Ostalo</span>
            </div>
            <i className="fa-solid fa-chevron-right text-[10px] text-[var(--c-text-muted)] ml-auto"></i>
          </button>
        )}

        {/* MAGIC SEARCH BAR */}
        <div className="mt-4 border-t border-[var(--c-border)] pt-6 pb-2">
              <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[22px] blur opacity-20 group-focus-within:opacity-60 transition duration-500"></div>
                  <div className="relative bg-[var(--c-card-alt)] rounded-[20px] flex items-center p-1.5 border border-[var(--c-border2)]">
                      <div className="w-10 h-10 rounded-2xl bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text2)]">
                           <i className="fa-solid fa-wand-magic-sparkles text-sm"></i>
                      </div>
                      <input
                          type="text"
                          value={magicSearchInput}
                          onChange={(e) => setMagicSearchInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleMagicSearch()}
                          placeholder={searchPlaceholder}
                          className="w-full bg-transparent text-[11px] font-medium text-[var(--c-text)] px-3 focus:outline-none placeholder:text-[var(--c-placeholder)]"
                      />
                      <button
                          onClick={handleMagicSearch}
                          disabled={isAiLoading}
                          className="w-10 h-10 rounded-xl bg-[var(--c-active)] flex items-center justify-center text-[var(--c-text)] hover:bg-[var(--c-active)] transition-all disabled:opacity-50"
                      >
                          {isAiLoading ? <i className="fa-solid fa-spinner animate-spin text-xs"></i> : <i className="fa-solid fa-arrow-up text-xs"></i>}
                      </button>
                  </div>
              </div>
              <p className="text-center text-[8px] text-[var(--c-text-muted)] mt-2 font-medium">
                  <span className={`text-${color}-500`}>{aiLabel}</span> automatski prepoznaje detalje.
              </p>
          </div>
      </div>
    </MainLayout>
  );

  // ── Vehicle Type Sub-Selection ───────────────────────────
  if (step === 'vehicle-sub') {
    return (
      <MainLayout title="Vozila" showSigurnost={false} hideSearchOnMobile onBack={() => setStep('selection')}>
        <div className="max-w-4xl mx-auto space-y-4 pt-2 pb-24">
          <div className="px-1 mb-2">
            <h2 className="text-[11px] font-black text-blue-500 uppercase tracking-[3px] mb-1">Vrsta vozila</h2>
            <p className="text-sm text-[var(--c-text2)] font-medium">Šta želite oglasiti?</p>
          </div>

          {/* 1) Hauptfahrzeuge: Auto + Motorrad */}
          <div className="grid grid-cols-2 gap-3">
            {VEHICLE_TYPES_MAIN.map((vt, idx) => (
              <button key={idx} onClick={() => {
                setVehicleType(vt.type);
                setFormData(prev => ({ ...prev, category: `Vozila - ${vt.name}`, brand: '', title: '' }));
                setCarFlowStep('brand');
                setBreadcrumb([{ label: 'Vozila', step: 'vehicle-sub' }, { label: vt.name, step: 'car-method' }]);
                setStep('car-method');
              }} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] p-4 flex flex-col items-center justify-center gap-2 text-center group active:scale-95 transition-all hover:bg-[var(--c-hover)] hover:border-blue-500/30">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <i className={`fa-solid ${vt.icon} text-lg`}></i>
                </div>
                <div>
                  <span className="text-[12px] font-bold text-[var(--c-text)] block leading-tight">{vt.name}</span>
                  <span className="text-[9px] text-[var(--c-text3)] mt-0.5 block">{vt.desc}</span>
                </div>
              </button>
            ))}
          </div>

          {/* 2) Dijelovi i oprema — volle Breite */}
          <button onClick={() => {
            setVehicleType('parts');
            setFormData(prev => ({ ...prev, category: 'Dijelovi za vozila', brand: '', title: '' }));
            setPartsSubStep('vehicle-type');
            setBreadcrumb([{ label: 'Vozila', step: 'vehicle-sub' }, { label: 'Dijelovi', step: 'parts-sub', subStep: 'vehicle-type' }]);
            setStep('parts-sub');
          }} className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] p-4 flex items-center gap-4 group active:scale-[0.98] transition-all hover:bg-[var(--c-hover)] hover:border-amber-500/30">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform shrink-0">
              <i className="fa-solid fa-screwdriver-wrench text-lg"></i>
            </div>
            <div className="text-left">
              <span className="text-[13px] font-bold text-[var(--c-text)] block">Dijelovi i oprema</span>
              <span className="text-[9px] text-[var(--c-text3)]">Auto, moto, bicikl dijelovi i oprema</span>
            </div>
            <i className="fa-solid fa-chevron-right text-[10px] text-[var(--c-text-muted)] ml-auto"></i>
          </button>

          {/* 3) Weitere Fahrzeuge: ATV, Boot, Fahrrad + Teretna → truck-sub */}
          <div className="grid grid-cols-2 gap-3">
            {VEHICLE_TYPES_MORE.map((vt, idx) => (
              <button key={idx} onClick={() => {
                setVehicleType(vt.type);
                setFormData(prev => ({ ...prev, category: `Vozila - ${vt.name}`, brand: '', title: '' }));
                if (vt.name === 'Teretna vozila') {
                  setBreadcrumb([{ label: 'Vozila', step: 'vehicle-sub' }, { label: 'Teretna vozila', step: 'truck-sub' }]);
                  setStep('truck-sub');
                } else if (vt.type === 'bicycle') {
                  setShowBicyclePopup(true);
                } else {
                  setCarFlowStep('brand');
                  setBreadcrumb([{ label: 'Vozila', step: 'vehicle-sub' }, { label: vt.name, step: 'car-method' }]);
                  setStep('car-method');
                }
              }} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] p-4 flex flex-col items-center justify-center gap-2 text-center group active:scale-95 transition-all hover:bg-[var(--c-hover)] hover:border-blue-500/30">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <i className={`fa-solid ${vt.icon} text-lg`}></i>
                </div>
                <div>
                  <span className="text-[12px] font-bold text-[var(--c-text)] block leading-tight">{vt.name}</span>
                  <span className="text-[9px] text-[var(--c-text3)] mt-0.5 block">{vt.desc}</span>
                </div>
              </button>
            ))}
          </div>

          {/* 4) Prikolice — volle Breite */}
          <button onClick={() => {
            setBreadcrumb([{ label: 'Vozila', step: 'vehicle-sub' }, { label: 'Prikolice', step: 'prikolice-sub' }]);
            setStep('prikolice-sub');
          }} className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] p-4 flex items-center gap-4 group active:scale-[0.98] transition-all hover:bg-[var(--c-hover)] hover:border-blue-500/30">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform shrink-0">
              <i className="fa-solid fa-trailer text-lg"></i>
            </div>
            <div className="text-left">
              <span className="text-[13px] font-bold text-[var(--c-text)] block">Prikolice</span>
              <span className="text-[9px] text-[var(--c-text3)]">Auto, teretne, kamp, čamac prikolice</span>
            </div>
            <i className="fa-solid fa-chevron-right text-[10px] text-[var(--c-text-muted)] ml-auto"></i>
          </button>

          {/* 5) Ostala vozila — volle Breite */}
          <button onClick={() => {
            setVehicleType('car');
            setFormData(prev => ({ ...prev, category: 'Vozila - Ostala vozila', brand: '', title: '' }));
            setStep('form');
          }} className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] p-4 flex items-center gap-4 group active:scale-[0.98] transition-all hover:bg-[var(--c-hover)] hover:border-gray-500/30">
            <div className="w-11 h-11 rounded-xl bg-gray-500/10 flex items-center justify-center text-gray-400 border border-gray-500/20 group-hover:scale-110 transition-transform shrink-0">
              <i className="fa-solid fa-ellipsis text-lg"></i>
            </div>
            <div className="text-left">
              <span className="text-[13px] font-bold text-[var(--c-text)] block">Ostala vozila</span>
              <span className="text-[9px] text-[var(--c-text3)]">Traktori, golf kolica, ostalo...</span>
            </div>
            <i className="fa-solid fa-chevron-right text-[10px] text-[var(--c-text-muted)] ml-auto"></i>
          </button>
        </div>

        {/* Bicycle Popup — S markom / Bez marke */}
        {showBicyclePopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowBicyclePopup(false)}>
            <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[24px] p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
                  <i className="fa-solid fa-bicycle text-xl text-blue-400"></i>
                </div>
                <h3 className="text-base font-black text-[var(--c-text)]">Imaš li marku bicikla?</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => {
                  setShowBicyclePopup(false);
                  setCarFlowStep('brand');
                  setBreadcrumb([{ label: 'Vozila', step: 'vehicle-sub' }, { label: 'Bicikli', step: 'car-method' }]);
                  setStep('car-method');
                }} className="py-3.5 rounded-xl text-[13px] font-bold text-white blue-gradient shadow-lg shadow-blue-500/20 active:scale-95">
                  S markom
                </button>
                <button onClick={() => {
                  setShowBicyclePopup(false);
                  setBreadcrumb([{ label: 'Vozila', step: 'vehicle-sub' }, { label: 'Bicikli', step: 'form' as UploadStep }]);
                  setStep('form');
                }} className="py-3.5 rounded-xl text-[13px] font-bold text-[var(--c-text)] bg-[var(--c-hover)] border border-[var(--c-border)] active:scale-95">
                  Bez marke
                </button>
              </div>
            </div>
          </div>
        )}
      </MainLayout>
    );
  }

  // ── Truck Sub-Type Selection ───────────────────────────
  if (step === 'truck-sub') {
    return (
      <MainLayout title="Teretna vozila" showSigurnost={false} hideSearchOnMobile onBack={() => { setStep('vehicle-sub'); setBreadcrumb([]); }}>
        <div className="max-w-4xl mx-auto space-y-4 pt-2 pb-24">
          {renderBreadcrumb()}
          <div className="px-1 mb-2">
            <h2 className="text-[11px] font-black text-blue-500 uppercase tracking-[3px] mb-1">Vrsta teretnog vozila</h2>
            <p className="text-sm text-[var(--c-text2)] font-medium">Koji tip teretnog vozila?</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {TRUCK_TYPES.map((tt, idx) => (
              <button key={idx} onClick={() => {
                setTruckSubType(tt.name);
                setVehicleType('truck');
                setFormData(prev => ({ ...prev, category: `Vozila - Teretna vozila - ${tt.name}`, brand: '', title: '' }));
                setCarFlowStep('brand');
                setBreadcrumb([
                  { label: 'Vozila', step: 'vehicle-sub' },
                  { label: 'Teretna vozila', step: 'truck-sub' },
                  { label: tt.name, step: 'car-method' },
                ]);
                setStep('car-method');
              }} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] p-4 flex flex-col items-center justify-center gap-2 text-center group active:scale-95 transition-all hover:bg-[var(--c-hover)] hover:border-blue-500/30">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <i className={`fa-solid ${tt.icon} text-lg`}></i>
                </div>
                <div>
                  <span className="text-[12px] font-bold text-[var(--c-text)] block leading-tight">{tt.name}</span>
                  <span className="text-[9px] text-[var(--c-text3)] mt-0.5 block">{tt.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  // ── Prikolice Sub-Type Selection ───────────────────────────
  if (step === 'prikolice-sub') {
    return (
      <MainLayout title="Prikolice" showSigurnost={false} hideSearchOnMobile onBack={() => { setStep('vehicle-sub'); setBreadcrumb([]); }}>
        <div className="max-w-4xl mx-auto space-y-4 pt-2 pb-24">
          {renderBreadcrumb()}
          <div className="px-1 mb-2">
            <h2 className="text-[11px] font-black text-blue-500 uppercase tracking-[3px] mb-1">Vrsta prikolice</h2>
            <p className="text-sm text-[var(--c-text2)] font-medium">Koji tip prikolice?</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {PRIKOLICE_TYPES.map((pt, idx) => (
              <button key={idx} onClick={() => {
                setPrikolicaSubType(pt.name);
                setFormData(prev => ({ ...prev, category: `Vozila - Prikolice - ${pt.name}`, brand: '', title: '' }));
                setBreadcrumb([
                  { label: 'Vozila', step: 'vehicle-sub' },
                  { label: 'Prikolice', step: 'prikolice-sub' },
                  { label: pt.name, step: 'form' },
                ]);
                setStep('form');
              }} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] p-4 flex flex-col items-center justify-center gap-2 text-center group active:scale-95 transition-all hover:bg-[var(--c-hover)] hover:border-blue-500/30">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <i className={`fa-solid ${pt.icon} text-lg`}></i>
                </div>
                <div>
                  <span className="text-[12px] font-bold text-[var(--c-text)] block leading-tight">{pt.name}</span>
                  <span className="text-[9px] text-[var(--c-text3)] mt-0.5 block">{pt.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  // ── Parts Sub-Selection (multi-step, 4 own screens) ───────────────────
  if (step === 'parts-sub') {

    // Screen 1: Fahrzeugtyp wählen
    if (partsSubStep === 'vehicle-type') {
      return (
        <MainLayout title="Dijelovi" showSigurnost={false} hideSearchOnMobile onBack={() => { setStep('vehicle-sub'); setBreadcrumb([]); }}>
          <div className="max-w-4xl mx-auto space-y-4 pt-2 pb-24">
            {renderBreadcrumb()}
            <div className="px-1 mb-2">
              <h2 className="text-[11px] font-black text-amber-500 uppercase tracking-[3px] mb-1">Dijelovi i oprema</h2>
              <p className="text-sm text-[var(--c-text2)] font-medium">Za koje vozilo je ovaj dio?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PARTS_VEHICLE_TYPES.map((pvt, idx) => (
                <button key={idx} onClick={() => {
                  setPartsVehicleType(pvt.type);
                  setBreadcrumb(prev => [...prev, { label: pvt.name, step: 'parts-sub', subStep: 'brand' }]);
                  setPartsSubStep('brand');
                }} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] p-4 flex flex-col items-center justify-center gap-2 text-center group active:scale-95 transition-all hover:bg-[var(--c-hover)] hover:border-amber-500/30">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                    <i className={`fa-solid ${pvt.icon} text-lg`}></i>
                  </div>
                  <span className="text-[12px] font-bold text-[var(--c-text)] block leading-tight">{pvt.name}</span>
                </button>
              ))}
            </div>
          </div>
        </MainLayout>
      );
    }

    // Screen 2: Marke wählen (für den gewählten Fahrzeugtyp)
    if (partsSubStep === 'brand') {
      const partsBrands = getBrandsForVehicleType(partsVehicleType).map(b => ({ name: b.name, slug: b.slug }));
      const filteredPartsBrands = carBrandSearch.trim()
        ? partsBrands.filter(b => b.name.toLowerCase().includes(carBrandSearch.toLowerCase()))
        : partsBrands;

      return (
        <MainLayout title="Dijelovi" showSigurnost={false} hideSearchOnMobile onBack={() => { setPartsSubStep('vehicle-type'); setCarBrandSearch(''); }}>
          <div className="max-w-4xl mx-auto space-y-4 pt-2 pb-24">
            {renderBreadcrumb()}
            <div className="px-1 mb-2">
              <h2 className="text-[11px] font-black text-amber-500 uppercase tracking-[3px] mb-1">Odaberi marku</h2>
              <p className="text-sm text-[var(--c-text2)] font-medium">Za koje vozilo je ovaj dio?</p>
            </div>
            {/* Suchfeld */}
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text-muted)] text-xs"></i>
              <input type="text" value={carBrandSearch} onChange={e => setCarBrandSearch(e.target.value)} placeholder="Pretraži marke..." className="w-full pl-9 pr-4 py-2.5 bg-[var(--c-card)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] placeholder:text-[var(--c-text-muted)] focus:border-amber-500/50 focus:outline-none" />
            </div>
            {/* Marken-Grid */}
            <div className="grid grid-cols-3 gap-2">
              {filteredPartsBrands.map((brand, idx) => (
                <button key={idx} onClick={() => {
                  setPartsVehicleBrand(brand.name);
                  setAttributes(prev => ({ ...prev, zaVozilo: brand.name, zaModel: '' }));
                  setCarBrandSearch('');
                  setBreadcrumb(prev => [...prev, { label: brand.name, step: 'parts-sub', subStep: 'brand' }]);
                  const brandModels = findBrandModelsForType(brand.name, partsVehicleType);
                  if (brandModels.length > 0 && brand.name !== 'Ostalo') {
                    setPartsSubStep('model');
                  } else {
                    setPartsSubStep('category');
                  }
                }} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-3 flex flex-col items-center gap-2 group active:scale-95 transition-all hover:bg-[var(--c-hover)] hover:border-amber-500/30">
                  {partsVehicleType === 'car' ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/${brand.slug}.png`} alt={brand.name} className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden'); }} />
                      <span className="text-lg font-black text-amber-400 hidden">{brand.name[0]}</span>
                    </>
                  ) : (
                    <span className="text-lg font-black text-amber-400">{brand.name[0]}</span>
                  )}
                  <span className="text-[10px] font-bold text-[var(--c-text)] text-center leading-tight">{brand.name}</span>
                </button>
              ))}
            </div>
          </div>
        </MainLayout>
      );
    }

    // Screen 3: Modell wählen (eigener Screen, KEIN Modal!)
    if (partsSubStep === 'model') {
      const models = findBrandModelsForType(partsVehicleBrand, partsVehicleType);
      const filteredModels = modelSearch.trim()
        ? models.filter(m => m.name.toLowerCase().includes(modelSearch.toLowerCase()))
        : models;

      return (
        <MainLayout title="Dijelovi" showSigurnost={false} hideSearchOnMobile onBack={() => { setPartsSubStep('brand'); setModelSearch(''); }}>
          <div className="max-w-4xl mx-auto space-y-4 pt-2 pb-24">
            {renderBreadcrumb()}
            {/* Gewählte Marke anzeigen */}
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border bg-amber-500/5 border-amber-500/20">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><i className="fa-solid fa-car text-amber-500 text-sm"></i></div>
              <span className="text-[11px] font-black text-amber-500 uppercase tracking-wide">{partsVehicleBrand}</span>
            </div>
            <div className="px-1 mb-2">
              <h2 className="text-[11px] font-black text-amber-500 uppercase tracking-[3px] mb-1">Odaberi model</h2>
              <p className="text-sm text-[var(--c-text2)] font-medium">Koji model vozila?</p>
            </div>
            {/* Suchfeld */}
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text-muted)] text-xs"></i>
              <input type="text" value={modelSearch} onChange={e => setModelSearch(e.target.value)} placeholder="Pretraži modele..." className="w-full pl-9 pr-4 py-2.5 bg-[var(--c-card)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] placeholder:text-[var(--c-text-muted)] focus:border-amber-500/50 focus:outline-none" />
            </div>
            {/* Modell-Liste */}
            <div className="grid grid-cols-2 gap-2">
              {filteredModels.map((model, idx) => (
                <button key={idx} onClick={() => {
                  setPartsVehicleModel(model.name);
                  setAttributes(prev => ({ ...prev, zaModel: model.name }));
                  setModelSearch('');
                  setBreadcrumb(prev => [...prev, { label: model.name, step: 'parts-sub', subStep: 'model' }]);
                  // Use local variants
                  const variants = model.variants || [];
                  setPartsModelVariants(variants);
                  if (variants.length > 0) {
                    setPartsSubStep('model-detail');
                  } else {
                    setPartsSubStep('category');
                  }
                }} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-3 text-left group active:scale-95 transition-all hover:bg-[var(--c-hover)] hover:border-amber-500/30">
                  <span className="text-[11px] font-bold text-[var(--c-text)] leading-tight">{model.name}</span>
                </button>
              ))}
            </div>
            {/* Manuell eingeben — skip model-detail */}
            <button onClick={() => {
              setPartsVehicleModel('');
              setModelSearch('');
              setPartsSubStep('category');
            }} className="w-full py-3 text-center text-[11px] font-bold text-amber-500 border border-dashed border-amber-500/30 rounded-xl hover:bg-amber-500/5">
              Ručni unos modela →
            </button>
          </div>
        </MainLayout>
      );
    }

    // Screen 3.5: Model-Detail (z.B. BMW Serija 3 → 320/325/330/335/340/M3)
    if (partsSubStep === 'model-detail') {
      return (
        <MainLayout title="Dijelovi" showSigurnost={false} hideSearchOnMobile onBack={() => setPartsSubStep('model')}>
          {renderBreadcrumb()}
          <div className="max-w-4xl mx-auto space-y-4 pt-2 pb-24">
            {/* Gewählte Marke + Modell anzeigen */}
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border bg-amber-500/5 border-amber-500/20">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><i className="fa-solid fa-car text-amber-500 text-sm"></i></div>
              <span className="text-[11px] font-black text-amber-500 uppercase tracking-wide">{partsVehicleBrand} {partsVehicleModel}</span>
            </div>
            <div className="px-1 mb-2">
              <h2 className="text-[11px] font-black text-amber-500 uppercase tracking-[3px] mb-1">Koji tačno?</h2>
              <p className="text-sm text-[var(--c-text2)] font-medium">Odaberite specifičnu varijantu</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {partsModelVariants.map((detail, idx) => (
                <button key={idx} onClick={() => {
                  setPartsModelDetail(detail);
                  setAttributes(prev => ({ ...prev, zaModelDetail: detail }));
                  setBreadcrumb(prev => [...prev, { label: detail, step: 'parts-sub', subStep: 'model-detail' }]);
                  setPartsSubStep('category');
                }} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-3 text-center group active:scale-95 transition-all hover:bg-[var(--c-hover)] hover:border-amber-500/30">
                  <span className="text-[12px] font-bold text-[var(--c-text)]">{detail}</span>
                </button>
              ))}
            </div>

            {/* Preskoči */}
            <button onClick={() => {
              setPartsModelDetail('');
              setPartsSubStep('category');
            }} className="w-full py-3 text-center text-[11px] font-bold text-amber-500 border border-dashed border-amber-500/30 rounded-xl hover:bg-amber-500/5">
              Preskoči — ne znam tačnu varijantu
            </button>
          </div>
        </MainLayout>
      );
    }

    // Screen 4: Teile-Kategorie (gefiltert nach partsVehicleType)
    if (partsSubStep === 'category') {
      const relevantParts = PARTS_CATEGORIES.filter(group => {
        if (partsVehicleType === 'motorcycle') return group.group === 'Za motocikle';
        if (partsVehicleType === 'bicycle') return group.group === 'Za bicikle';
        if (partsVehicleType === 'truck') return group.group === 'Za teretna vozila';
        return group.group === 'Za automobile';
      });

      return (
        <MainLayout title="Dijelovi" showSigurnost={false} hideSearchOnMobile onBack={() => setPartsSubStep(partsModelDetail ? 'model-detail' : 'model')}>
          <div className="max-w-4xl mx-auto space-y-4 pt-2 pb-24">
            {renderBreadcrumb()}
            {partsVehicleBrand && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border bg-amber-500/5 border-amber-500/20">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><i className="fa-solid fa-car text-amber-500 text-sm"></i></div>
                <span className="text-[11px] font-black text-amber-500 uppercase tracking-wide">{partsVehicleBrand} {partsVehicleModel}{partsModelDetail ? ` ${partsModelDetail}` : ''}</span>
              </div>
            )}
            <div className="px-1 mb-2">
              <h2 className="text-[11px] font-black text-amber-500 uppercase tracking-[3px] mb-1">Kategorija dijela</h2>
              <p className="text-sm text-[var(--c-text2)] font-medium">Koji tip dijela prodajete?</p>
            </div>
            {relevantParts.map((group, gi) => (
              <div key={gi}>
                <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-widest mb-2 px-1">{group.group}</p>
                <div className="grid grid-cols-2 gap-2">
                  {group.items.map((item, ii) => {
                    // Check if detail items exist for this category
                    const groupKey = partsVehicleType === 'motorcycle' ? 'Za motocikle'
                      : partsVehicleType === 'bicycle' ? 'Za bicikle'
                      : partsVehicleType === 'truck' ? 'Za teretna vozila'
                      : 'Za automobile';
                    const hasDetails = !!(PARTS_DETAIL_ITEMS[groupKey]?.[item.name]);

                    return (
                      <button
                        key={ii}
                        onClick={() => {
                          setAttributes(prev => ({ ...prev, kategorijaDijela: `${group.group} - ${item.name}` }));
                          if (hasDetails) {
                            setPartsCategory(item.name);
                            setBreadcrumb(prev => [...prev, { label: item.name, step: 'parts-sub', subStep: 'category' }]);
                            setPartsSubStep('detail');
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              category: `Dijelovi za vozila - ${item.name}`,
                              brand: partsVehicleBrand || prev.brand,
                              title: `${partsVehicleBrand || ''} ${partsVehicleModel || ''}${partsModelDetail ? ' ' + partsModelDetail : ''} - ${item.name}`.trim(),
                            }));
                            setBreadcrumb(prev => [...prev, { label: item.name, step: 'form' }]);
                            setStep('form');
                          }
                        }}
                        className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-3 flex items-center gap-3 text-left group active:scale-95 transition-all hover:bg-[var(--c-hover)] hover:border-amber-500/30"
                      >
                        <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 shrink-0">
                          <i className={`fa-solid ${item.icon} text-sm`}></i>
                        </div>
                        <span className="text-[11px] font-bold text-[var(--c-text)] leading-tight">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </MainLayout>
      );
    }

    // Screen 5: Exaktes Teil (detail items from PARTS_DETAIL_ITEMS)
    if (partsSubStep === 'detail') {
      const groupKey = partsVehicleType === 'motorcycle' ? 'Za motocikle'
        : partsVehicleType === 'bicycle' ? 'Za bicikle'
        : partsVehicleType === 'truck' ? 'Za teretna vozila'
        : 'Za automobile';
      const details = PARTS_DETAIL_ITEMS[groupKey]?.[partsCategory] || [];
      const filteredDetails = partsDetailSearch.trim()
        ? details.filter(d => d.toLowerCase().includes(partsDetailSearch.toLowerCase()))
        : details;

      return (
        <MainLayout title="Dijelovi" showSigurnost={false} hideSearchOnMobile onBack={() => { setPartsSubStep('category'); setPartsDetailSearch(''); }}>
          <div className="max-w-4xl mx-auto space-y-4 pt-2 pb-24">
            {renderBreadcrumb()}
            <div className="px-1 mb-2">
              <h2 className="text-[11px] font-black text-amber-500 uppercase tracking-[3px] mb-1">Koji dio tačno?</h2>
              <p className="text-sm text-[var(--c-text2)] font-medium">Odaberite specifičan dio</p>
            </div>
            {/* Search field */}
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text-muted)] text-xs"></i>
              <input type="text" value={partsDetailSearch} onChange={e => setPartsDetailSearch(e.target.value)} placeholder="Pretraži dijelove..." className="w-full pl-9 pr-4 py-2.5 bg-[var(--c-card)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] placeholder:text-[var(--c-text-muted)] focus:border-amber-500/50 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {filteredDetails.map((detail, idx) => (
                <button key={idx} onClick={() => {
                  setAttributes(prev => ({ ...prev, dio: detail }));
                  setFormData(prev => ({
                    ...prev,
                    category: `Dijelovi za vozila - ${detail}`,
                    brand: partsVehicleBrand || prev.brand,
                    title: `${partsVehicleBrand || ''} ${partsVehicleModel || ''}${partsModelDetail ? ' ' + partsModelDetail : ''} - ${detail}`.trim(),
                  }));
                  setBreadcrumb(prev => [...prev, { label: detail, step: 'form' }]);
                  setStep('form');
                }} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-3 text-left group active:scale-95 transition-all hover:bg-[var(--c-hover)] hover:border-amber-500/30">
                  <span className="text-[11px] font-bold text-[var(--c-text)] leading-tight">{detail}</span>
                </button>
              ))}
            </div>
            {filteredDetails.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-[var(--c-text3)]">Nema rezultata za &quot;{partsDetailSearch}&quot;</p>
              </div>
            )}
            {/* Manual input */}
            <button onClick={() => {
              setFormData(prev => ({
                ...prev,
                category: `Dijelovi za vozila - ${partsCategory}`,
                brand: partsVehicleBrand || prev.brand,
                title: `${partsVehicleBrand || ''} ${partsVehicleModel || ''}${partsModelDetail ? ' ' + partsModelDetail : ''} - ${partsCategory}`.trim(),
              }));
              setBreadcrumb(prev => [...prev, { label: partsCategory, step: 'form' }]);
              setStep('form');
            }} className="w-full py-3 text-center text-[11px] font-bold text-amber-500 border border-dashed border-amber-500/30 rounded-xl hover:bg-amber-500/5">
              Ručni unos dijela →
            </button>
          </div>
        </MainLayout>
      );
    }
  }

  if (step === 'nekretnine-sub') {
    return renderSubSelection('Nekretnine', 'Izaberite kategoriju nekretnine', 'emerald', NEKRETNINE_TYPES, selectNekretnineSub, 'Npr. Stan u centru Sarajeva...', 'NudiNađi AI');
  }

  // ── Nekretnine Quick-Tap Screen ───────────────────────────
  if (step === 'nekretnine-quicktap') {
    const questions = NEKRETNINE_QUESTIONS[nekretSubType] || [];
    return renderQuickTap(nekretSubType, 'emerald', questions, 'nekretnine-sub');
  }

  if (step === 'mobile-sub') {
    return renderSubSelection('Mobilni', 'Odaberite brend', 'rose', MOBILE_BRANDS, selectMobileSub, 'Npr. iPhone 13 Pro Max plavi...', 'NudiNađi AI');
  }
  if (step === 'moda-sub') {
    return renderSubSelection('Moda', 'Koju vrstu odjeće prodajete?', 'amber', MODA_TYPES, selectModaSub, 'Npr. Crvena haljina M veličina...', 'NudiNađi AI');
  }
  if (step === 'moda-artikl') {
    const artikli = MODA_ARTIKLI[modaSubCategory] || [];
    return renderSubSelection(modaSubCategory, 'Odaberite vrstu artikla', 'amber', artikli, selectModaArtikl, 'Npr. Majica, haljina, cipele...', 'NudiNađi AI', 'moda-sub');
  }
  if (step === 'tehnika-sub') {
    return renderSubSelection('Elektronika', 'IT i Gaming', 'purple', TEHNIKA_TYPES, selectTehnikaSub, 'Npr. Gaming PC RTX 3060...', 'NudiNađi AI');
  }
  // ── Elektronika Quick-Tap Screen ───────────────────────────
  if (step === 'elektronika-quicktap') {
    const questions = ELEKTRONIKA_QUESTIONS[elektronikaSub] || [];
    return renderQuickTap(elektronikaSub, 'purple', questions, 'tehnika-sub');
  }
  if (step === 'services-sub') {
    return renderSubSelection('Usluge', 'Koju vrstu usluge nudite?', 'cyan', SERVICES_TYPES, selectServicesSub, 'Npr. Popravka veš mašine...', 'NudiNađi AI');
  }

  // Poslovi Sub-Selection (unique layout with sticky search)
  if (step === 'poslovi-sub') {
    return (
      <MainLayout title="Poslovi" showSigurnost={false} hideSearchOnMobile onBack={() => setStep('selection')}>
        <div className="max-w-4xl mx-auto pb-24 relative min-h-screen">

          {/* STICKY HEADER AREA with SEARCH BAR */}
          <div className="sticky top-0 z-20 bg-[var(--c-card-alt)]/95 backdrop-blur-md pb-4 pt-2 px-1 border-b border-[var(--c-border)] -mx-6 px-6 mb-4 shadow-2xl">
              <div className="mb-3 px-1">
                <h2 className="text-[11px] font-black text-indigo-500 uppercase tracking-[3px] mb-1">Poslovi</h2>
                <p className="text-sm text-[var(--c-text2)] font-medium">Koju vrstu posla nudite?</p>
              </div>

              {/* MAGIC SEARCH BAR (Sticky) */}
              <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-[22px] blur opacity-20 group-focus-within:opacity-60 transition duration-500"></div>
                    <div className="relative bg-[var(--c-card-alt)] rounded-[20px] flex items-center p-1.5 border border-[var(--c-border2)]">
                        <div className="w-10 h-10 rounded-2xl bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text2)]">
                             <i className="fa-solid fa-magnifying-glass text-sm"></i>
                        </div>
                        <input
                            type="text"
                            value={magicSearchInput}
                            onChange={(e) => setMagicSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleMagicSearch()}
                            placeholder="Npr. Električar za stan u Sarajevu..."
                            className="w-full bg-transparent text-[11px] font-medium text-[var(--c-text)] px-3 focus:outline-none placeholder:text-[var(--c-placeholder)]"
                        />
                        <button
                            onClick={handleMagicSearch}
                            disabled={isAiLoading}
                            className="w-10 h-10 rounded-xl bg-[var(--c-active)] flex items-center justify-center text-[var(--c-text)] hover:bg-[var(--c-active)] transition-all disabled:opacity-50"
                        >
                            {isAiLoading ? <i className="fa-solid fa-spinner animate-spin text-xs"></i> : <i className="fa-solid fa-arrow-right text-xs"></i>}
                        </button>
                    </div>
              </div>
          </div>

          {/* SCROLLABLE LIST OF JOBS */}
          <div className="flex flex-col gap-3">
             {POSLOVI_TYPES.map((type, index) => (
                <button
                    key={index}
                    onClick={() => selectPosloviSub(type.name)}
                    className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[24px] p-5 flex items-start gap-5 text-left group active:scale-[0.99] transition-all hover:bg-[var(--c-hover)] hover:border-indigo-500/30"
                >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform shrink-0 mt-1">
                        <i className={`fa-solid ${type.icon} text-xl`}></i>
                    </div>
                    <div>
                        <span className="text-[14px] font-black text-[var(--c-text)] block mb-1.5 group-hover:text-indigo-400 transition-colors">{type.name}</span>
                        <span className="text-[10px] text-[var(--c-text3)] font-medium leading-relaxed block">{type.subs}</span>
                    </div>
                </button>
             ))}
          </div>

        </div>
      </MainLayout>
    );
  }

  // ── Generic sub-steps for extra categories ──
  if (step === 'dom-sub') {
    return renderSubSelection('Dom i vrt', 'Koja kategorija doma?', 'teal', DOM_TYPES, (name) => selectGenericSub('Dom i vrt', 'teal', 'dom-sub', name), 'Npr. Kauč, frižider, lampa...', 'NudiNađi AI');
  }
  if (step === 'sport-sub') {
    return renderSubSelection('Sport i rekreacija', 'Koji sport ili oprema?', 'green', SPORT_TYPES, (name) => selectGenericSub('Sport i rekreacija', 'green', 'sport-sub', name), 'Npr. Bučice, bicikl, skije...', 'NudiNađi AI');
  }
  if (step === 'djeca-sub') {
    return renderSubSelection('Odjeća za djecu', 'Što prodajete?', 'pink', DJECA_TYPES, (name) => selectGenericSub('Odjeća za djecu', 'pink', 'djeca-sub', name), 'Npr. Kolica, igračke, krevetić...', 'NudiNađi AI');
  }
  if (step === 'glazba-sub') {
    return renderSubSelection('Glazba i instrumenti', 'Koji instrument ili oprema?', 'indigo', GLAZBA_TYPES, (name) => selectGenericSub('Glazba i instrumenti', 'indigo', 'glazba-sub', name), 'Npr. Akustična gitara, bubnjevi...', 'NudiNađi AI');
  }
  if (step === 'literatura-sub') {
    return renderSubSelection('Literatura i mediji', 'Koju vrstu medija?', 'orange', LITERATURA_TYPES, (name) => selectGenericSub('Literatura i mediji', 'orange', 'literatura-sub', name), 'Npr. Roman, udžbenik, vinil...', 'NudiNađi AI');
  }
  if (step === 'zivotinje-sub') {
    return renderSubSelection('Životinje', 'Koja vrsta životinje?', 'amber', ZIVOTINJE_TYPES, (name) => selectGenericSub('Životinje', 'amber', 'zivotinje-sub', name), 'Npr. Štene, mačić, akvarij...', 'NudiNađi AI');
  }
  if (step === 'hrana-sub') {
    return renderSubSelection('Hrana i piće', 'Koja vrsta hrane?', 'red', HRANA_TYPES, (name) => selectGenericSub('Hrana i piće', 'red', 'hrana-sub', name), 'Npr. Domaći med, rakija, sir...', 'NudiNađi AI');
  }
  if (step === 'strojevi-sub') {
    return renderSubSelection('Strojevi i alati', 'Koji tip stroja ili alata?', 'gray', STROJEVI_TYPES, (name) => selectGenericSub('Strojevi i alati', 'gray', 'strojevi-sub', name), 'Npr. Bušilica, traktor, kompresor...', 'NudiNađi AI');
  }
  if (step === 'umjetnost-sub') {
    return renderSubSelection('Umjetnost i kolekcionarstvo', 'Koja vrsta?', 'rose', UMJETNOST_TYPES, (name) => selectGenericSub('Umjetnost i kolekcionarstvo', 'rose', 'umjetnost-sub', name), 'Npr. Uljana slika, marke, antikviteti...', 'NudiNađi AI');
  }
  if (step === 'videoigre-sub') {
    return renderSubSelection('Video igre', 'Koja platforma?', 'violet', VIDEOIGRE_TYPES, (name) => selectGenericSub('Video igre', 'violet', 'videoigre-sub', name), 'Npr. PS5 igra, Xbox kontroler...', 'NudiNađi AI');
  }
  if (step === 'ostalo-sub') {
    return renderSubSelection('Ostalo', 'Koja kategorija?', 'slate', OSTALO_TYPES, (name) => selectGenericSub('Ostalo', 'slate', 'ostalo-sub', name), 'Npr. Parfem, karte za koncert...', 'NudiNađi AI');
  }

  // ── Generic detail-sub step (2nd tier for ALL categories) ──
  if (step === 'detail-sub') {
    const details = CATEGORY_DETAILS[parentSubCategory] || [];
    const backInfo = DETAIL_COLOR_MAP[parentSubCategory];
    const backStep = backInfo?.parentStep || previousStep || 'selection';
    return renderSubSelection(parentSubCategory, 'Odaberite detaljnije', parentColor, details, selectDetailItem, 'Pretraži...', 'NudiNađi AI', backStep);
  }

  // 3. Car Method (VIN + Brand Picker) — dynamic per vehicleType
  // 3. Car Method — 3 sub-steps: brand → model → variant (all local data)
  if (step === 'car-method') {
    const vehicleLabels: Record<string, { title: string; icon: string; searchPlaceholder: string }> = {
      car: { title: 'Odaberi marku automobila', icon: 'fa-car', searchPlaceholder: 'Pretraži marke automobila...' },
      motorcycle: { title: 'Odaberi marku motocikla', icon: 'fa-motorcycle', searchPlaceholder: 'Pretraži marke motocikala...' },
      bicycle: { title: 'Odaberi marku bicikla', icon: 'fa-bicycle', searchPlaceholder: 'Pretraži marke bicikala...' },
      truck: { title: 'Odaberi marku teretnog vozila', icon: 'fa-truck', searchPlaceholder: 'Pretraži marke kamiona...' },
      camper: { title: 'Odaberi marku kampera', icon: 'fa-caravan', searchPlaceholder: 'Pretraži marke kampera...' },
      boat: { title: 'Odaberi marku plovila', icon: 'fa-ship', searchPlaceholder: 'Pretraži marke plovila...' },
      atv: { title: 'Odaberi marku ATV/Quad', icon: 'fa-flag-checkered', searchPlaceholder: 'Pretraži ATV/Quad marke...' },
      parts: { title: 'Za koje vozilo je ovaj dio?', icon: 'fa-gears', searchPlaceholder: 'Pretraži marke vozila...' },
    };
    const vLabel = vehicleLabels[vehicleType] || vehicleLabels.car;

    const handleBackFromCarFlow = () => {
      if (carFlowStep === 'variant') { setCarFlowStep('model'); }
      else if (carFlowStep === 'model') { setCarFlowStep('brand'); }
      else if (truckSubType) {
        setStep('truck-sub');
        setTruckSubType('');
        setBreadcrumb([{ label: 'Vozila', step: 'vehicle-sub' }, { label: 'Teretna vozila', step: 'truck-sub' }]);
      }
      else { setStep('vehicle-sub'); setBreadcrumb([]); }
    };

    // ── Sub-Step: BRAND ──
    if (carFlowStep === 'brand') {
      const currentBrands = (vehicleType === 'truck' && truckSubType
        ? getBrandsForTruckSubType(truckSubType)
        : getBrandsForVehicleType(vehicleType)
      ).map(b => ({ name: b.name, slug: b.slug }));
      const filteredBrands = carBrandSearch.trim()
        ? currentBrands.filter(b => b.name.toLowerCase().includes(carBrandSearch.toLowerCase()))
        : currentBrands;
      const showVinSection = vehicleType === 'car' || vehicleType === 'parts';

      return (
        <MainLayout title="Vozila" showSigurnost={false} hideSearchOnMobile onBack={() => { setStep('vehicle-sub'); setBreadcrumb([]); }}>
          <div className="max-w-4xl mx-auto pb-24 pt-2 space-y-6 px-1">
            {renderBreadcrumb()}

            {showVinSection && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <i className={`fa-solid ${vLabel.icon} text-lg text-blue-400`}></i>
                </div>
                <h2 className="text-lg font-black text-[var(--c-text)]">Smart Identifikacija</h2>
                <p className="text-[10px] text-[var(--c-text3)]">Unesite VIN broj ili opišite vozilo</p>
              </div>
              <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[24px] p-1.5">
                <div className="bg-[var(--c-overlay)] rounded-[20px] p-3 flex gap-3 items-center border border-[var(--c-border)] focus-within:border-blue-500/50 transition-colors">
                  <input type="text" value={formData.vin} onChange={(e) => setFormData({...formData, vin: e.target.value.toUpperCase()})} placeholder="VIN broj..." className="w-full bg-transparent text-sm font-mono text-[var(--c-text)] outline-none placeholder:text-[var(--c-placeholder)] uppercase tracking-widest text-center" />
                  <button onClick={handleVinLookup} className="w-10 h-10 rounded-xl blue-gradient flex items-center justify-center text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-transform shrink-0"><i className="fa-solid fa-arrow-right"></i></button>
                </div>
              </div>
              <div className="relative group w-full">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[22px] blur opacity-20 group-focus-within:opacity-60 transition duration-500"></div>
                <div className="relative bg-[var(--c-card-alt)] rounded-[20px] flex items-center p-1.5 border border-[var(--c-border2)]">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--c-hover)] flex items-center justify-center text-blue-400 shrink-0"><i className="fa-solid fa-wand-magic-sparkles text-sm"></i></div>
                  <input type="text" value={magicSearchInput} onChange={(e) => setMagicSearchInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleMagicSearch()} placeholder="Npr. Golf 7 2.0 TDI 2018..." className="w-full bg-transparent text-[11px] font-medium text-[var(--c-text)] px-3 focus:outline-none placeholder:text-[var(--c-placeholder)]" />
                  <button onClick={handleMagicSearch} disabled={isAiLoading} className="w-10 h-10 rounded-xl bg-[var(--c-active)] flex items-center justify-center text-[var(--c-text)] hover:bg-[var(--c-active)] transition-all disabled:opacity-50 shrink-0">
                    {isAiLoading ? <i className="fa-solid fa-spinner animate-spin text-xs"></i> : <i className="fa-solid fa-paper-plane text-xs"></i>}
                  </button>
                </div>
              </div>
              <p className="text-center text-[8px] text-[var(--c-text-muted)] font-medium"><span className="text-blue-500">NudiNađi AI</span> automatski prepoznaje detalje vozila.</p>
            </div>
            )}

            <div className="flex items-center gap-4">
              <div className="h-[1px] bg-[var(--c-border)] flex-1"></div>
              <span className="text-[9px] font-black uppercase tracking-[3px] text-blue-500">Ručni Unos</span>
              <div className="h-[1px] bg-[var(--c-border)] flex-1"></div>
            </div>

            <div>
              <h3 className="text-[11px] font-black text-[var(--c-text2)] uppercase tracking-[2px] mb-3 px-1">{vLabel.title}</h3>
              <div className="relative mb-4">
                <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] flex items-center px-4 py-3 gap-3 focus-within:border-blue-500/40 transition-colors">
                  <i className="fa-solid fa-magnifying-glass text-[var(--c-text3)] text-xs"></i>
                  <input type="text" value={carBrandSearch} onChange={(e) => setCarBrandSearch(e.target.value)} placeholder={vLabel.searchPlaceholder} className="w-full bg-transparent text-sm text-[var(--c-text)] outline-none placeholder:text-[var(--c-placeholder)]" />
                  {carBrandSearch && <button onClick={() => setCarBrandSearch('')} className="text-[var(--c-text3)] hover:text-[var(--c-text)]"><i className="fa-solid fa-xmark text-xs"></i></button>}
                </div>
              </div>
              {/* Chassis code / model shortcut suggestions */}
              {(() => {
                const chassisMatches = carBrandSearch.trim().length >= 2 ? lookupChassis(carBrandSearch) : [];
                if (chassisMatches.length === 0) return null;
                return (
                  <div className="mb-3 space-y-1.5">
                    {chassisMatches.slice(0, 3).map((match: ChassisLookupResult, idx: number) => (
                      <button key={idx} onClick={() => {
                        // Set brand
                        setFormData(prev => ({ ...prev, brand: match.brand, title: `${match.brand} ` }));
                        setAttributes(prev => ({ ...prev, marka: match.brand }));
                        setCarBrandSearch('');
                        // Pre-fill fuel if detected
                        if (match.fuel) setVehicleFuel(match.fuel);
                        // Pre-fill model + variant
                        if (match.variant) setVehicleVariant(match.variant);
                        setVehicleModel(match.model);
                        // Save chassis match for tag generation during publish
                        setChassisMatchResult(match);
                        setChassisUserInput(carBrandSearch.trim());
                        // Pre-fill model search to filter to the matched model
                        setModelSearchLocal(match.model);
                        // Update breadcrumb and go to model step
                        setBreadcrumb(prev => {
                          const base = prev.length > 0 ? prev : [{ label: 'Vozila', step: 'vehicle-sub' as UploadStep }];
                          return [...base, { label: match.brand, step: 'car-method' as UploadStep }];
                        });
                        setCarFlowStep('model');
                      }} className="w-full flex items-center gap-3 px-4 py-3 bg-blue-500/5 border border-blue-500/20 rounded-[14px] text-left hover:bg-blue-500/10 hover:border-blue-500/40 transition-all active:scale-[0.98]">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                          <i className="fa-solid fa-bolt text-blue-400 text-xs"></i>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-bold text-[var(--c-text)] truncate">{chassisLabel(match)}</p>
                          <p className="text-[10px] text-blue-400 font-medium">Brzi odabir</p>
                        </div>
                        <i className="fa-solid fa-chevron-right text-blue-400/60 text-[10px]"></i>
                      </button>
                    ))}
                  </div>
                );
              })()}
              <div className="grid grid-cols-3 gap-2">
                {filteredBrands.map((brand) => (
                  <button key={brand.name} onClick={() => {
                    setFormData(prev => ({ ...prev, brand: brand.name, title: brand.name === 'Ostalo' ? '' : `${brand.name} ` }));
                    setAttributes(prev => ({ ...prev, marka: brand.name }));
                    setCarBrandSearch('');
                    // Bicycle: after brand → go directly to form (no year-fuel/series/engine)
                    if (vehicleType === 'bicycle') {
                      setBreadcrumb(prev => {
                        const base = prev.length > 0 ? prev : [{ label: 'Vozila', step: 'vehicle-sub' as UploadStep }];
                        return [...base, { label: brand.name, step: 'form' as UploadStep }];
                      });
                      setStep('form');
                      return;
                    }
                    setBreadcrumb(prev => {
                      const base = prev.length > 0 ? prev : [{ label: 'Vozila', step: 'vehicle-sub' as UploadStep }];
                      return [...base, { label: brand.name, step: 'car-method' as UploadStep }];
                    });
                    setCarFlowStep('model');
                  }} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-2.5 sm:p-3.5 flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-center group active:scale-95 transition-all hover:bg-[var(--c-hover)] hover:border-blue-500/30">
                    <div className="w-12 h-12 rounded-xl bg-[var(--c-card)] flex items-center justify-center border border-[var(--c-border)] group-hover:scale-110 transition-transform overflow-hidden">
                      {brand.name === 'Ostalo' ? (
                        <i className="fa-solid fa-ellipsis text-lg text-[var(--c-text-muted)]"></i>
                      ) : (vehicleType === 'car' || (vehicleType === 'truck' && ['kombi / van', 'dostavno vozilo', 'kamper / autodom'].includes(truckSubType.toLowerCase()))) && brand.slug ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`${CAR_LOGO_BASE}/${brand.slug}.png`} alt={brand.name} className="w-9 h-9 object-contain" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; const next = (e.target as HTMLImageElement).nextElementSibling; if (next) (next as HTMLElement).style.display = 'flex'; }} />
                      ) : null}
                      {brand.name !== 'Ostalo' && <span style={{ display: (vehicleType === 'car' || (vehicleType === 'truck' && ['kombi / van', 'dostavno vozilo', 'kamper / autodom'].includes(truckSubType.toLowerCase()))) && brand.slug ? 'none' : 'flex' }} className="text-lg font-black text-blue-400">{brand.name[0]}</span>}
                    </div>
                    <span className="text-[11px] font-bold text-[var(--c-text)] leading-tight">{brand.name}</span>
                  </button>
                ))}
              </div>
              {filteredBrands.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-[var(--c-text3)]">Nema rezultata za &quot;{carBrandSearch}&quot;</p>
                  <button onClick={() => {
                    const name = carBrandSearch.trim();
                    setCarBrandSearch('');
                    setFormData(prev => ({ ...prev, brand: name, title: `${name} ` }));
                    setAttributes(prev => ({ ...prev, marka: name }));
                    if (vehicleType === 'bicycle') {
                      setBreadcrumb(prev => {
                        const base = prev.length > 0 ? prev : [{ label: 'Vozila', step: 'vehicle-sub' as UploadStep }];
                        return [...base, { label: name, step: 'form' as UploadStep }];
                      });
                      setStep('form');
                      return;
                    }
                    setBreadcrumb(prev => {
                      const base = prev.length > 0 ? prev : [{ label: 'Vozila', step: 'vehicle-sub' as UploadStep }];
                      return [...base, { label: name, step: 'car-method' as UploadStep }];
                    });
                    setCarFlowStep('model');
                  }} className="mt-3 text-[11px] font-bold text-blue-500 hover:text-blue-400 transition-colors">
                    Koristi &quot;{carBrandSearch.trim()}&quot; kao marku
                  </button>
                </div>
              )}
            </div>
          </div>
        </MainLayout>
      );
    }

    // ── Sub-Step: MODEL (local data) ──
    if (carFlowStep === 'model') {
      const years = Array.from({ length: new Date().getFullYear() - 1970 + 1 }, (_, i) => new Date().getFullYear() - i);
      const fuels = FUEL_OPTIONS[vehicleType] || FUEL_OPTIONS.car;
      const isBicycle = vehicleType === 'bicycle';
      const fuelOrDrive = isBicycle ? BICYCLE_DRIVE_TYPES : fuels;
      const localModels = findBrandModelsForType(formData.brand, vehicleType);
      const filteredLocalModels = modelSearchLocal.trim()
        ? localModels.filter(m => m.name.toLowerCase().includes(modelSearchLocal.toLowerCase()))
        : localModels;

      return (
        <MainLayout title="Vozila" showSigurnost={false} hideSearchOnMobile onBack={handleBackFromCarFlow}>
          <div className="max-w-4xl mx-auto space-y-6 pt-2 pb-24">
            {renderBreadcrumb()}

            {/* Godina */}
            <div>
              <h2 className="text-[11px] font-black text-blue-500 uppercase tracking-[3px] mb-3 px-1">Godina proizvodnje</h2>
              <div className="relative">
                <select
                  value={vehicleYear}
                  onChange={(e) => setVehicleYear(Number(e.target.value))}
                  className="w-full appearance-none bg-[var(--c-card)] border border-[var(--c-border)] rounded-xl px-4 py-3.5 text-base font-bold text-[var(--c-text)] outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <i className="fa-solid fa-chevron-down text-[var(--c-text3)] text-xs"></i>
                </div>
              </div>
            </div>

            {/* Gorivo / Tip pogona */}
            {fuelOrDrive.length > 0 && (
              <div>
                <h2 className="text-[11px] font-black text-blue-500 uppercase tracking-[3px] mb-3 px-1">{isBicycle ? 'Tip pogona' : 'Gorivo'}</h2>
                <div className="flex flex-wrap gap-2">
                  {fuelOrDrive.map(f => (
                    <button key={f} onClick={() => setVehicleFuel(f)} className={`px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all ${vehicleFuel === f ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] hover:bg-[var(--c-hover)]'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Odaberi model */}
            <div>
              <h2 className="text-[11px] font-black text-blue-500 uppercase tracking-[3px] mb-3 px-1">Odaberi model</h2>
              {localModels.length > 5 && (
                <div className="relative mb-3">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text-muted)] text-xs"></i>
                  <input type="text" value={modelSearchLocal} onChange={e => setModelSearchLocal(e.target.value)} placeholder="Pretraži modele..." className="w-full pl-9 pr-4 py-2.5 bg-[var(--c-card)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] placeholder:text-[var(--c-text-muted)] focus:border-blue-500/50 focus:outline-none" />
                </div>
              )}
              {filteredLocalModels.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {filteredLocalModels.map((model) => (
                    <button key={model.name} onClick={() => {
                      setVehicleModel(model.name);
                      setAttributes(prev => ({ ...prev, marka: formData.brand, model: model.name, godiste: vehicleYear.toString(), gorivo: vehicleFuel }));
                      setBreadcrumb(prev => [...prev, { label: `${vehicleYear} • ${model.name}`, step: 'car-method' as UploadStep }]);
                      // Check if variant was pre-set (e.g. from chassis code "e90 330d")
                      const presetVariant = vehicleVariant;
                      const hasMatchingVariant = presetVariant && model.variants?.includes(presetVariant);
                      if (hasMatchingVariant) {
                        // Variant already known — set it and skip to form, keep existing title
                        setAttributes(prev => ({ ...prev, varijanta: presetVariant }));
                        if (!formData.title || formData.title === `${formData.brand} ${model.name} ${vehicleYear}`) {
                          setFormData(prev => ({ ...prev, title: `${formData.brand} ${model.name} ${vehicleYear}` }));
                        }
                        setStep('form');
                      } else if (model.variants && model.variants.length > 0) {
                        // No pre-set variant — go to variant picker as usual
                        setFormData(prev => ({ ...prev, title: `${formData.brand} ${model.name} ${vehicleYear}` }));
                        setCarFlowStep('variant');
                      } else {
                        setFormData(prev => ({ ...prev, title: `${formData.brand} ${model.name} ${vehicleYear}` }));
                        setStep('form');
                      }
                    }} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-3 text-left group active:scale-95 transition-all hover:bg-[var(--c-hover)] hover:border-blue-500/30">
                      <span className="text-[12px] font-bold text-[var(--c-text)] block">{model.name}</span>
                      {model.variants && model.variants.length > 0 && <span className="text-[9px] text-[var(--c-text3)]">{model.variants.length} varijanti</span>}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--c-text3)] text-center py-4">Nema lokalnih modela za ovu marku.</p>
              )}

              {/* Manual model input */}
              {!showManualModel ? (
                <button onClick={() => setShowManualModel(true)} className="w-full mt-3 py-3 text-center text-[11px] font-bold text-blue-500 border border-dashed border-blue-500/30 rounded-xl hover:bg-blue-500/5">
                  Ručni unos modela →
                </button>
              ) : (
                <div className="space-y-3 mt-3">
                  <input type="text" value={manualModelInput} onChange={e => setManualModelInput(e.target.value)} placeholder="Unesite model ručno..." className="w-full px-4 py-3 bg-[var(--c-card)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] placeholder:text-[var(--c-text-muted)] focus:border-blue-500/50 focus:outline-none" />
                  <button disabled={!manualModelInput.trim()} onClick={() => {
                    const name = manualModelInput.trim();
                    setVehicleModel(name);
                    setAttributes(prev => ({ ...prev, marka: formData.brand, model: name, godiste: vehicleYear.toString(), gorivo: vehicleFuel }));
                    setFormData(prev => ({ ...prev, title: `${formData.brand} ${name} ${vehicleYear}` }));
                    setBreadcrumb(prev => [...prev, { label: `${vehicleYear} • ${name}`, step: 'form' as UploadStep }]);
                    setStep('form');
                  }} className="w-full py-3 rounded-xl text-[12px] font-bold text-white blue-gradient shadow-lg shadow-blue-500/20 disabled:opacity-40">
                    Dalje →
                  </button>
                </div>
              )}

              {/* Skip to form */}
              <button onClick={() => {
                setAttributes(prev => ({ ...prev, marka: formData.brand, godiste: vehicleYear.toString(), gorivo: vehicleFuel }));
                setBreadcrumb(prev => [...prev, { label: `${vehicleYear}`, step: 'form' as UploadStep }]);
                setStep('form');
              }} className="w-full mt-2 py-2 text-center text-[10px] font-bold text-[var(--c-text3)] hover:text-blue-500 transition-colors">
                Preskoči → ručni unos
              </button>
            </div>

            {/* Chassis code pre-fill summary + Dalje button */}
            {vehicleModel && (
              <div className="bg-[var(--c-card)] border border-blue-500/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <i className="fa-solid fa-car-side text-blue-500 text-sm"></i>
                  <span className="text-[11px] font-black text-blue-500 uppercase tracking-[2px]">Prepoznato vozilo</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-[12px] font-bold text-blue-500">
                    <i className="fa-solid fa-industry text-[10px]"></i> {formData.brand}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-[12px] font-bold text-blue-500">
                    <i className="fa-solid fa-car text-[10px]"></i> {vehicleModel}
                  </span>
                  {vehicleVariant && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-[12px] font-bold text-blue-500">
                      <i className="fa-solid fa-gauge text-[10px]"></i> {vehicleVariant}
                    </span>
                  )}
                  {vehicleFuel && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-[12px] font-bold text-blue-500">
                      <i className="fa-solid fa-gas-pump text-[10px]"></i> {vehicleFuel}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--c-hover)] text-[12px] font-bold text-[var(--c-text3)]">
                    <i className="fa-solid fa-calendar text-[10px]"></i> {vehicleYear}
                  </span>
                </div>

                {/* Warning if something is missing */}
                {(!vehicleFuel || !vehicleVariant) && (
                  <p className="text-[11px] text-amber-500 flex items-center gap-1.5">
                    <i className="fa-solid fa-triangle-exclamation text-[10px]"></i>
                    {!vehicleFuel && !vehicleVariant ? 'Gorivo i varijanta nisu odabrani — možeš ih dodati u formularu.' : !vehicleFuel ? 'Gorivo nije odabrano — možeš ga dodati u formularu.' : 'Varijanta nije odabrana — možeš je dodati u formularu.'}
                  </p>
                )}

                <button onClick={() => {
                  setAttributes(prev => ({
                    ...prev,
                    marka: formData.brand,
                    model: vehicleModel,
                    godiste: vehicleYear.toString(),
                    gorivo: vehicleFuel,
                    ...(vehicleVariant ? { varijanta: vehicleVariant } : {}),
                  }));
                  if (!formData.title) {
                    setFormData(prev => ({ ...prev, title: `${formData.brand} ${vehicleModel} ${vehicleYear}` }));
                  }
                  setBreadcrumb(prev => [...prev, { label: `${vehicleYear} • ${vehicleModel}${vehicleVariant ? ' ' + vehicleVariant : ''}`, step: 'car-method' as UploadStep }]);
                  setStep('form');
                }} className="w-full py-3.5 rounded-xl text-[13px] font-black text-white blue-gradient shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  Dalje <i className="fa-solid fa-arrow-right text-[11px]"></i>
                </button>
              </div>
            )}
          </div>
        </MainLayout>
      );
    }

    // ── Sub-Step: VARIANT (local data) ──
    if (carFlowStep === 'variant') {
      const modelData = findBrandModelsForType(formData.brand, vehicleType).find(m => m.name === vehicleModel);
      const variants = modelData?.variants || [];

      return (
        <MainLayout title="Vozila" showSigurnost={false} hideSearchOnMobile onBack={handleBackFromCarFlow}>
          <div className="max-w-4xl mx-auto space-y-4 pt-2 pb-24">
            {renderBreadcrumb()}

            <div className="px-1 mb-2">
              <h2 className="text-[11px] font-black text-blue-500 uppercase tracking-[3px] mb-1">Odaberi varijantu</h2>
              <p className="text-sm text-[var(--c-text2)] font-medium">{formData.brand} {vehicleModel} {vehicleYear}</p>
            </div>

            {variants.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {variants.map((v, idx) => (
                  <button key={idx} onClick={() => {
                    setVehicleVariant(v);
                    setAttributes(prev => ({
                      ...prev,
                      marka: formData.brand,
                      model: vehicleModel,
                      varijanta: v,
                      godiste: vehicleYear.toString(),
                      gorivo: vehicleFuel,
                    }));
                    setFormData(prev => ({
                      ...prev,
                      title: `${formData.brand} ${vehicleModel} ${v} ${vehicleYear}`,
                    }));
                    setBreadcrumb(prev => [...prev, { label: v, step: 'form' as UploadStep }]);
                    setStep('form');
                  }} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-3 text-center group active:scale-95 transition-all hover:bg-[var(--c-hover)] hover:border-blue-500/30">
                    <span className="text-[12px] font-bold text-[var(--c-text)]">{v}</span>
                  </button>
                ))}
              </div>
            )}

            {variants.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-[var(--c-text3)]">Nema varijanti za ovaj model.</p>
              </div>
            )}

            {/* Manual variant input */}
            {!showManualVariant ? (
              <button onClick={() => setShowManualVariant(true)} className="w-full py-3 text-center text-[11px] font-bold text-blue-500 border border-dashed border-blue-500/30 rounded-xl hover:bg-blue-500/5">
                Ručni unos varijante →
              </button>
            ) : (
              <div className="space-y-3">
                <input type="text" value={manualVariantInput} onChange={e => setManualVariantInput(e.target.value)} placeholder="Unesite varijantu ručno (npr. 2.0 TDI 150 KS)..." className="w-full px-4 py-3 bg-[var(--c-card)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] placeholder:text-[var(--c-text-muted)] focus:border-blue-500/50 focus:outline-none" />
                <button disabled={!manualVariantInput.trim()} onClick={() => {
                  const v = manualVariantInput.trim();
                  setVehicleVariant(v);
                  setAttributes(prev => ({
                    ...prev,
                    marka: formData.brand,
                    model: vehicleModel,
                    varijanta: v,
                    godiste: vehicleYear.toString(),
                    gorivo: vehicleFuel,
                  }));
                  setFormData(prev => ({
                    ...prev,
                    title: `${formData.brand} ${vehicleModel} ${v} ${vehicleYear}`,
                  }));
                  setBreadcrumb(prev => [...prev, { label: v, step: 'form' as UploadStep }]);
                  setStep('form');
                }} className="w-full py-3 rounded-xl text-[12px] font-bold text-white blue-gradient shadow-lg shadow-blue-500/20 disabled:opacity-40">
                  Dalje →
                </button>
              </div>
            )}

            {/* Skip variant */}
            <button onClick={() => {
              setAttributes(prev => ({
                ...prev, marka: formData.brand, model: vehicleModel,
                godiste: vehicleYear.toString(), gorivo: vehicleFuel,
              }));
              setFormData(prev => ({ ...prev, title: `${formData.brand} ${vehicleModel} ${vehicleYear}` }));
              setBreadcrumb(prev => [...prev, { label: 'Bez varijante', step: 'form' as UploadStep }]);
              setStep('form');
            }} className="w-full py-2 text-center text-[10px] font-bold text-[var(--c-text3)] hover:text-blue-500 transition-colors">
              Preskoči varijantu → ručni unos
            </button>
          </div>
        </MainLayout>
      );
    }
  }

  // 4. Main Listing Form
  const allCategoryFields = getCategoryFields(formData.category, vehicleType);
  const hasPage2Fields = allCategoryFields.some(f => f.formPage === 2);
  const hasPage3Fields = allCategoryFields.some(f => f.formPage === 3);
  const totalPages = hasPage3Fields ? 3 : hasPage2Fields ? 2 : 1;

  return (
    <MainLayout
      title={isEditMode ? 'Uredi Oglas' : 'Novi Oglas'}
      showSigurnost={false}
      hideSearchOnMobile
      onBack={() => { if (formPage === 3) { setFormPage(2); window.scrollTo({ top: 0, behavior: 'smooth' }); } else if (formPage === 2) { setFormPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); } else { setStep('selection'); } }}
    >
      <div className="max-w-2xl lg:max-w-5xl mx-auto w-full flex flex-col lg:flex-row gap-8 pb-32 pt-2 px-2 sm:px-4 lg:px-0">

        {/* LEFT: FORM */}
        <div className="flex-1 space-y-5">

          {/* Navigation Breadcrumb */}
          {renderBreadcrumb()}

          {/* Category Breadcrumb */}
          {(() => {
            const crumb = getCategoryBreadcrumb(formData.category, formData.brand);
            const clr = BREADCRUMB_COLORS[crumb.color] || BREADCRUMB_COLORS.blue;
            return (
              <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border ${clr.bg} ${clr.border}`}>
                <div className={`w-8 h-8 rounded-lg ${clr.iconBg} flex items-center justify-center shrink-0`}>
                  <i className={`fa-solid ${crumb.icon} ${clr.text} text-sm`}></i>
                </div>
                <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
                  <span className={`text-[11px] font-black ${clr.text} uppercase tracking-wide`}>{crumb.main}</span>
                  {crumb.sub && (
                    <>
                      <i className="fa-solid fa-chevron-right text-[7px] text-[var(--c-text-muted)]"></i>
                      <span className="text-[11px] font-bold text-[var(--c-text)] truncate">{crumb.sub}</span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setStep('selection')}
                  className="text-[9px] font-bold text-[var(--c-text3)] hover:text-[var(--c-text)] uppercase tracking-wider transition-colors shrink-0"
                >
                  Promijeni
                </button>
              </div>
            );
          })()}

          {/* Step progress indicator */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2 px-1">
              <div className={`h-[3px] flex-1 rounded-sm transition-all duration-300 ${formPage >= 1 ? 'bg-blue-500' : 'bg-[var(--c-border)]'}`}></div>
              <div className={`h-[3px] flex-1 rounded-sm transition-all duration-300 ${formPage >= 2 ? 'bg-blue-500' : 'bg-[var(--c-border)]'}`}></div>
              {totalPages >= 3 && <div className={`h-[3px] flex-1 rounded-sm transition-all duration-300 ${formPage >= 3 ? 'bg-blue-500' : 'bg-[var(--c-border)]'}`}></div>}
              <span className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest shrink-0 ml-1">{formPage} / {totalPages}</span>
            </div>
          )}

          {/* ═══ PAGE 1 ═══ */}
          {formPage === 1 && (
            <>
              {/* Existing images (edit mode) */}
              {isEditMode && existingImages.length > 0 && (
                <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-xl p-4">
                  <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-widest mb-3">
                    Trenutne slike ({existingImages.length})
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {existingImages.map((url, idx) => (
                      <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <i className="fa-solid fa-xmark text-white text-sm"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-[var(--c-text3)] mt-2">Hover na sliku → klikni X za uklanjanje</p>
                </div>
              )}

              {/* Image Upload */}
              <ImageUpload images={images} onImagesChange={(imgs) => { setImages(imgs); if (formErrors.images && imgs.length > 0) setFormErrors(prev => ({ ...prev, images: undefined })); }} />
              {formErrors.images && <p className="text-[10px] text-red-400 mt-1 ml-3">{formErrors.images}</p>}

              {/* OCR Button - only for vehicle parts */}
              {(formData.category.includes('Dijelovi') || formData.category.includes('dijelovi')) && images.length > 0 && (
                <button
                  onClick={async () => {
                    if (images.length === 0) return;
                    setIsAiLoading(true);
                    try {
                      const file = images[0];
                      const base64 = await fileToBase64(file);
                      const res = await fetch('/api/ai/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'ocr', image: base64, mimeType: file.type || 'image/jpeg' }),
                      });
                      const json = await res.json();
                      if (json.success && json.data) {
                        const d = json.data;
                        const compat = d.compatibleVehicles?.join(', ') || '';
                        setFormData(prev => ({
                          ...prev,
                          title: d.partName ? `${d.partName}${d.partNumber ? ' ' + d.partNumber : ''}` : prev.title,
                          description: `${d.description || ''}\n\nKompatibilno: ${compat}`.trim(),
                          brand: d.manufacturer || prev.brand,
                        }));
                        showToast('OCR: Broj dijela prepoznat!');
                      }
                    } catch { showToast('OCR nije uspio', 'error'); }
                    setIsAiLoading(false);
                  }}
                  disabled={isAiLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 text-yellow-400 text-[11px] font-bold uppercase tracking-wider hover:bg-yellow-500/10 transition-all disabled:opacity-40"
                >
                  {isAiLoading ? <i className="fa-solid fa-spinner animate-spin text-xs"></i> : <i className="fa-solid fa-barcode text-xs"></i>}
                  OCR – Prepoznaj broj dijela
                </button>
              )}

              {/* ── Vehicle: Marke + Model Hero ── */}
              {(formData.category.toLowerCase().includes('vozila') || formData.category.toLowerCase() === 'automobili') &&
               !formData.category.toLowerCase().includes('prikolice') &&
               !formData.category.toLowerCase().includes('ostala vozila') && (
                <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-xl overflow-hidden">
                  {/* Header */}
                  <div className="px-5 pt-4 pb-2 border-b border-[var(--c-border)] bg-blue-500/[0.03]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center">
                        <i className="fa-solid fa-car text-blue-500 text-[10px]"></i>
                      </div>
                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Vozilo</span>
                    </div>
                  </div>

                  {/* Brand display */}
                  <div className="px-5 pt-4 pb-3">
                    <label className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest mb-2 block">Marka</label>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const brandSlug = CAR_BRANDS.find(b => b.name === formData.brand)?.slug;
                        return (
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 rounded-xl bg-[var(--c-card)] flex items-center justify-center border border-[var(--c-border)] shadow-sm shrink-0">
                              {brandSlug ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={`${CAR_LOGO_BASE}/${brandSlug}.png`} alt={formData.brand} className="w-8 h-8 object-contain" />
                              ) : (
                                <i className="fa-solid fa-car text-lg text-blue-400"></i>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xl font-black text-[var(--c-text)] block leading-tight">{formData.brand || 'Odaberi marku'}</span>
                              <button
                                onClick={() => setStep('car-method')}
                                className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors mt-0.5"
                              >
                                Promijeni marku
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Model selector */}
                  <div className="px-5 pb-5">
                    <label className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest mb-2 block">Model</label>
                    {(() => {
                      const brandModels = findBrandModelsForType(formData.brand, vehicleType);
                      if (brandModels.length === 0) {
                        // Fallback: text input for brands without model data
                        return (
                          <input
                            type="text"
                            value={(attributes.model as string) || ''}
                            onChange={(e) => setAttributes(prev => ({ ...prev, model: e.target.value }))}
                            placeholder="Model vozila..."
                            className="w-full bg-[var(--c-hover)] border border-[var(--c-border)] rounded-lg px-4 py-3.5 text-lg font-bold text-[var(--c-text)] placeholder:text-[var(--c-placeholder)] outline-none focus:border-blue-500/50 transition-colors"
                          />
                        );
                      }
                      // Brand has model data — show selected model + button to open picker
                      const modelName = (attributes.model as string) || '';
                      const variantName = (attributes.varijanta as string) || '';
                      return (
                        <div className="space-y-2">
                          {modelName ? (
                            <div className="flex items-center gap-3">
                              <div className="flex-1 min-w-0 bg-[var(--c-hover)] border border-[var(--c-border)] rounded-xl px-4 py-3 flex items-center gap-2">
                                <span className="text-lg font-black text-[var(--c-text)] truncate">{modelName}</span>
                                {variantName && (
                                  <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md shrink-0">{variantName}</span>
                                )}
                              </div>
                              <button
                                onClick={() => { setPickerBrand(formData.brand); setShowModelPicker(true); }}
                                className="shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 hover:bg-blue-500/20 transition-colors active:scale-95"
                              >
                                <i className="fa-solid fa-pen text-xs"></i>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setPickerBrand(formData.brand); setShowModelPicker(true); }}
                              className="w-full bg-[var(--c-hover)] border border-dashed border-blue-500/30 rounded-xl px-4 py-4 text-center text-sm font-bold text-blue-500 hover:bg-blue-500/5 transition-all active:scale-[0.98]"
                            >
                              <i className="fa-solid fa-plus text-xs mr-2"></i>
                              Odaberi model
                            </button>
                          )}
                          {/* Manual override input */}
                          <input
                            type="text"
                            value={(typeof attributes.model === 'string' && !brandModels.find(m => m.name === attributes.model)) ? (attributes.model as string) : ''}
                            onChange={(e) => setAttributes(prev => ({ ...prev, model: e.target.value, varijanta: '' }))}
                            placeholder="Ili upiši ručno..."
                            className="w-full bg-[var(--c-hover)] border border-[var(--c-border)] rounded-lg px-3 py-2 text-xs text-[var(--c-text)] placeholder:text-[var(--c-placeholder)] outline-none focus:border-blue-500/50 transition-colors"
                          />
                        </div>
                      );
                    })()}
                  </div>

                  {/* Godište row */}
                  <div className="px-5 pb-5 border-t border-[var(--c-border)]">
                    <div className="flex items-center gap-4 pt-4">
                      <div className="flex-1">
                        <label className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest mb-2 block">Godište</label>
                        <input
                          type="number"
                          value={(attributes.godiste as number) || ''}
                          onChange={(e) => setAttributes(prev => ({ ...prev, godiste: parseInt(e.target.value) }))}
                          min={1980}
                          max={new Date().getFullYear()}
                          placeholder="npr. 2019"
                          className="w-full bg-[var(--c-hover)] border border-[var(--c-border)] rounded-lg px-4 py-3 text-sm font-bold text-[var(--c-text)] placeholder:text-[var(--c-placeholder)] outline-none focus:border-blue-500/50 transition-colors"
                        />
                      </div>
                      {vehicleType === 'car' && (
                      <div className="flex-1">
                        <label className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest mb-2 block">Karoserija</label>
                        <select
                          value={(attributes.karoserija as string) || ''}
                          onChange={(e) => setAttributes(prev => ({ ...prev, karoserija: e.target.value }))}
                          className="w-full bg-[var(--c-hover)] border border-[var(--c-border)] rounded-lg px-4 py-3 text-sm font-bold text-[var(--c-text)] outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
                        >
                          <option value="">Odaberi...</option>
                          {['Sedan', 'Karavan', 'Hatchback', 'Coupe', 'Kabriolet', 'SUV', 'Crossover', 'Pickup', 'Van', 'Minivan', 'Limuzina'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <div className={`bg-[var(--c-card)] rounded-xl border p-1 focus-within:border-blue-500/50 transition-colors ${formErrors.title ? 'border-red-500/50' : 'border-[var(--c-border)]'}`}>
                  <div className="px-5 pt-4">
                    <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Naslov</label>
                  </div>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => { setFormData({ ...formData, title: e.target.value }); if (formErrors.title) setFormErrors({...formErrors, title: undefined}); }}
                    placeholder={formData.category.toLowerCase().includes('vozila') ? `${formData.brand || ''} ${(attributes.model as string) || ''} — npr. dodatni opis`.trim() : 'Šta prodaješ?'}
                    className="w-full bg-transparent p-5 pt-1 text-lg font-bold text-[var(--c-text)] placeholder:text-[var(--c-placeholder)] outline-none"
                  />
                </div>
                {formErrors.title && <p className="text-[10px] text-red-400 mt-1 ml-3">{formErrors.title}</p>}
              </div>

              {/* Condition Selector */}
              <div>
                <label className="text-[9px] font-black text-purple-500 uppercase tracking-widest block mb-2 px-2">Stanje Artikla</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Novo', 'Kao novo', 'Korišteno', 'Oštećeno'].map(cond => (
                    <button
                      key={cond}
                      onClick={() => setFormData({...formData, condition: cond})}
                      className={`py-3 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                        formData.condition === cond
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-[var(--c-card)] border-[var(--c-border)] text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-hover)]'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-[9px] font-black text-cyan-500 uppercase tracking-widest block mb-2 px-2">Lokacija</label>
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(true)}
                  className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-lg p-4 flex items-center gap-3 hover:border-cyan-500/50 transition-colors text-left"
                >
                  <i className="fa-solid fa-location-dot text-cyan-400 text-sm"></i>
                  <span className={`text-sm font-bold ${formData.location ? 'text-[var(--c-text)]' : 'text-[var(--c-placeholder)]'}`}>
                    {formData.location || 'Odaberi grad'}
                  </span>
                  <i className="fa-solid fa-chevron-right text-[var(--c-text3)] text-[10px] ml-auto"></i>
                </button>
                <LocationPicker
                  isOpen={showLocationPicker}
                  onClose={() => setShowLocationPicker(false)}
                  onSelect={(city) => {
                    if (city) {
                      setSelectedCity(city);
                      setFormData(prev => ({ ...prev, location: city.name }));
                    } else {
                      setSelectedCity(null);
                      setFormData(prev => ({ ...prev, location: '' }));
                    }
                  }}
                  currentCity={selectedCity}
                />
              </div>

              {/* Price + Currency + Price Type */}
              <div>
                <div className="flex items-center justify-between mb-2 px-2">
                  <label className="text-[9px] font-black text-green-500 uppercase tracking-widest">Cijena &amp; Uvjeti</label>
                  <button
                    onClick={handleAiSuggestPrice}
                    disabled={!formData.title || isAiLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-wider hover:bg-green-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                  >
                    {isAiLoading ? (
                      <i className="fa-solid fa-spinner animate-spin text-[9px]"></i>
                    ) : (
                      <i className="fa-solid fa-chart-line text-[9px]"></i>
                    )}
                    AI Cijena
                  </button>
                </div>
                <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-xl overflow-hidden p-4 space-y-4">
                  {/* Price type pills — shown first so user picks type before entering price */}
                  {/* Price type pills */}
                  <div>
                    <label className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-widest block mb-2">Tip cijene</label>
                    <div className="flex gap-2">
                      {[{ id: 'fixed' as const, label: 'Fiksno' }, { id: 'negotiable' as const, label: 'Po dogovoru' }, { id: 'mk' as const, label: 'MK' }].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setFormData({...formData, priceType: opt.id, ...(opt.id === 'negotiable' ? { price: '0' } : {})})}
                          className={`flex-1 py-2.5 rounded-full text-[10px] font-bold uppercase border transition-all ${formData.priceType === opt.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'border-[var(--c-border2)] text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-hover)]'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Price input — hidden when "Po dogovoru" */}
                  {formData.priceType !== 'negotiable' && (
                    <>
                      <div className="flex items-center gap-3 border-t border-[var(--c-border)] pt-4">
                        <button
                          type="button"
                          onClick={() => setCurrency(prev => prev === 'EUR' ? 'KM' : 'EUR')}
                          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--c-border2)] bg-[var(--c-hover)] hover:bg-[var(--c-active)] transition-all active:scale-95"
                        >
                          <span className="text-lg font-black text-[var(--c-text)]">{currency === 'EUR' ? '€' : 'KM'}</span>
                          <i className="fa-solid fa-arrows-rotate text-[8px] text-[var(--c-text3)]"></i>
                        </button>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => { setFormData({ ...formData, price: e.target.value }); if (formErrors.price) setFormErrors({...formErrors, price: undefined}); }}
                          placeholder="0"
                          className="w-full bg-transparent text-xl font-black text-[var(--c-text)] placeholder:text-[var(--c-placeholder)] outline-none"
                        />
                        <span className={`shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${currency === 'KM' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                          {currency === 'KM' ? 'Konvertibilna Marka' : 'Euro'}
                        </span>
                      </div>
                      {currency === 'KM' && formData.price && (
                        <p className="text-[10px] text-[var(--c-text3)] -mt-2">
                          ≈ € {(Number(formData.price) / BAM_RATE).toFixed(2)} EUR (kurs: 1 EUR = {BAM_RATE} KM)
                        </p>
                      )}
                    </>
                  )}
                </div>
                {formErrors.price && formData.priceType !== 'negotiable' && <p className="text-[10px] text-red-400 mt-1 ml-3">{formErrors.price}</p>}
              </div>

              {/* Category Attributes – Page 1 */}
              <CategoryAttributesSection
                category={formData.category}
                attributes={attributes}
                onChange={(key, value) => setAttributes(prev => ({ ...prev, [key]: value }))}
                formPage={totalPages > 1 ? 1 : undefined}
                excludeKeys={(formData.category.toLowerCase().includes('vozila') || formData.category.toLowerCase() === 'automobili') && !formData.category.toLowerCase().includes('prikolice') && !formData.category.toLowerCase().includes('ostala vozila') ? ['marka', 'model', 'godiste', 'karoserija'] : undefined}
              />

              {/* Description (shown inline for single-page categories that have no page 2/3) */}
              {!hasPage2Fields && (
                <div className="bg-[var(--c-card)] rounded-xl border border-[var(--c-border)] p-5 focus-within:border-[var(--c-text3)] transition-colors min-h-[140px]">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-widest">Opis Artikla</label>
                    <button
                      onClick={handleAiGenerateDescription}
                      disabled={!formData.title || isAiLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-black uppercase tracking-wider hover:bg-purple-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                    >
                      {isAiLoading ? (
                        <i className="fa-solid fa-spinner animate-spin text-[9px]"></i>
                      ) : (
                        <i className="fa-solid fa-wand-magic-sparkles text-[9px]"></i>
                      )}
                      AI Opis
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalji, specifikacije, razlog prodaje..."
                    className="w-full bg-transparent text-sm text-[var(--c-text2)] placeholder:text-[var(--c-placeholder)] outline-none resize-none leading-relaxed"
                  />
                </div>
              )}

              {/* Next or Publish */}
              {hasPage2Fields ? (
                <button
                  onClick={() => { setFormPage(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="w-full blue-gradient text-white font-black py-5 rounded-xl flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20 active:scale-95 transition-all"
                >
                  <span className="text-sm uppercase tracking-[2px]">Dalje</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              ) : (
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="w-full blue-gradient text-white font-black py-5 rounded-xl flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {isPublishing ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                  <span className="text-sm uppercase tracking-[2px]">{isPublishing ? (isEditMode ? 'Snimanje...' : 'Objavljivanje...') : (isEditMode ? 'Spremi Izmjene' : 'Objavi Oglas')}</span>
                </button>
              )}
            </>
          )}

          {/* ═══ PAGE 2 ═══ */}
          {formPage === 2 && (
            <>
              {/* Category Attributes – Page 2 */}
              <CategoryAttributesSection
                category={formData.category}
                attributes={attributes}
                onChange={(key, value) => setAttributes(prev => ({ ...prev, [key]: value }))}
                formPage={2}
              />

              {/* Description (only if no page 3 — otherwise description moves to page 3) */}
              {!hasPage3Fields && (
                <div className="bg-[var(--c-card)] rounded-xl border border-[var(--c-border)] p-5 focus-within:border-[var(--c-text3)] transition-colors min-h-[140px]">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-widest">Opis Artikla</label>
                    <button
                      onClick={handleAiGenerateDescription}
                      disabled={!formData.title || isAiLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-black uppercase tracking-wider hover:bg-purple-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                    >
                      {isAiLoading ? (
                        <i className="fa-solid fa-spinner animate-spin text-[9px]"></i>
                      ) : (
                        <i className="fa-solid fa-wand-magic-sparkles text-[9px]"></i>
                      )}
                      AI Opis
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalji, specifikacije, razlog prodaje..."
                    className="w-full bg-transparent text-sm text-[var(--c-text2)] placeholder:text-[var(--c-placeholder)] outline-none resize-none leading-relaxed"
                  />
                </div>
              )}

              {/* Back + Next/Publish */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setFormPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex-1 py-5 rounded-xl border border-[var(--c-border)] text-[var(--c-text3)] font-black text-sm flex items-center justify-center gap-2 uppercase tracking-wider hover:text-[var(--c-text)] hover:bg-[var(--c-hover)] transition-all"
                >
                  <i className="fa-solid fa-arrow-left text-xs"></i>
                  Nazad
                </button>
                {hasPage3Fields ? (
                  <button
                    onClick={() => { setFormPage(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="flex-[2] blue-gradient text-white font-black py-5 rounded-xl flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    <span className="text-sm uppercase tracking-[2px]">Dalje — Oprema</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                ) : (
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="flex-[2] blue-gradient text-white font-black py-5 rounded-xl flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                  >
                    {isPublishing ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                    <span className="text-sm uppercase tracking-[2px]">{isPublishing ? (isEditMode ? 'Snimanje...' : 'Objavljivanje...') : (isEditMode ? 'Spremi Izmjene' : 'Objavi Oglas')}</span>
                  </button>
                )}
              </div>
            </>
          )}

          {/* ═══ PAGE 3 — Equipment & Finish ═══ */}
          {formPage === 3 && (
            <>
              {/* Category Attributes – Page 3 (Oprema + booleans) */}
              <CategoryAttributesSection
                category={formData.category}
                attributes={attributes}
                onChange={(key, value) => setAttributes(prev => ({ ...prev, [key]: value }))}
                formPage={3}
              />

              {/* Description */}
              <div className="bg-[var(--c-card)] rounded-xl border border-[var(--c-border)] p-5 focus-within:border-[var(--c-text3)] transition-colors min-h-[140px]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-widest">Opis Artikla</label>
                  <button
                    onClick={handleAiGenerateDescription}
                    disabled={!formData.title || isAiLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-black uppercase tracking-wider hover:bg-purple-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                  >
                    {isAiLoading ? (
                      <i className="fa-solid fa-spinner animate-spin text-[9px]"></i>
                    ) : (
                      <i className="fa-solid fa-wand-magic-sparkles text-[9px]"></i>
                    )}
                    AI Opis
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalji, specifikacije, razlog prodaje..."
                  className="w-full bg-transparent text-sm text-[var(--c-text2)] placeholder:text-[var(--c-placeholder)] outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Back + Publish */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setFormPage(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex-1 py-5 rounded-xl border border-[var(--c-border)] text-[var(--c-text3)] font-black text-sm flex items-center justify-center gap-2 uppercase tracking-wider hover:text-[var(--c-text)] hover:bg-[var(--c-hover)] transition-all"
                >
                  <i className="fa-solid fa-arrow-left text-xs"></i>
                  Nazad
                </button>
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="flex-[2] blue-gradient text-white font-black py-5 rounded-xl flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {isPublishing ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                  <span className="text-sm uppercase tracking-[2px]">{isPublishing ? (isEditMode ? 'Snimanje...' : 'Objavljivanje...') : (isEditMode ? 'Spremi Izmjene' : 'Objavi Oglas')}</span>
                </button>
              </div>
            </>
          )}

        </div>

        {/* RIGHT: LIVE PHONE PREVIEW (Desktop Only) */}
        <div className="hidden lg:block w-[360px] shrink-0">
          <div className="sticky top-24">
            <h3 className="text-center text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-widest mb-4">Live Preview</h3>
            <PhonePreview />
          </div>
        </div>

      </div>
      {/* Upload Success Overlay */}
      {uploadSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--c-card)] rounded-[24px] p-8 text-center shadow-2xl border border-[var(--c-border)] animate-[fadeIn_0.3s_ease-out] max-w-sm mx-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center mb-4 animate-bounce">
              <i className="fa-solid fa-check text-3xl text-green-500"></i>
            </div>
            <h3 className="text-lg font-black text-[var(--c-text)] mb-1">Oglas uspješno objavljen!</h3>
            <p className="text-sm text-green-500 font-bold">+10 XP zarađeno 🎉</p>
            <p className="text-xs text-[var(--c-text3)] mt-2">Preusmjeravanje...</p>
          </div>
        </div>
      )}

      {/* AI Moderation Warning Dialog (non-blocking — user can always proceed) */}
      {aiWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-3 sm:px-4">
          <div className="bg-[var(--c-card)] rounded-2xl shadow-xl border border-[var(--c-border)] max-w-md w-full overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-[var(--c-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <i className="fa-solid fa-robot text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--c-text)]">AI Provjera</h3>
                  <p className="text-xs text-[var(--c-text3)]">Naš sistem je primijetio nešto</p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {aiWarning.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm">
                  <i className="fa-solid fa-triangle-exclamation text-amber-500 mt-0.5" />
                  <span className="text-[var(--c-text2)]">{w}</span>
                </div>
              ))}
              <p className="text-sm text-[var(--c-text3)] bg-[var(--c-card-alt)] rounded-lg p-3 mt-2">
                <i className="fa-solid fa-circle-info text-blue-400 mr-1.5" />
                Jeste li sigurni da želite objaviti oglas s ovim podacima? Možete nastaviti ako je sve ispravno.
              </p>
            </div>
            <div className="p-4 border-t border-[var(--c-border)] flex gap-3">
              <button
                onClick={() => setAiWarning(null)}
                className="flex-1 py-2.5 text-sm font-medium text-[var(--c-text3)] bg-[var(--c-hover)] rounded-xl hover:bg-[var(--c-active)] transition-colors"
              >
                <i className="fa-solid fa-pen mr-1.5" />
                Uredi oglas
              </button>
              <button
                onClick={() => {
                  setAiWarning(null);
                  setAiWarningBypass(true);
                  // Re-trigger publish with bypass flag
                  setTimeout(() => handlePublish(), 50);
                }}
                className="flex-1 py-2.5 text-sm font-medium text-white blue-gradient rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              >
                <i className="fa-solid fa-paper-plane mr-1.5" />
                Svejedno objavi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Model Picker Modal */}
      {showModelPicker && (
        <Suspense fallback={null}>
          <VehicleModelPicker
            open={showModelPicker}
            brandName={pickerBrand}
            vehicleType={vehicleType}
            onSelect={handleModelPickerSelect}
            onClose={() => setShowModelPicker(false)}
          />
        </Suspense>
      )}

    </MainLayout>
  );
}

export default function UploadPage() {
  return (
    <Suspense>
      <UploadPageInner />
    </Suspense>
  );
}
