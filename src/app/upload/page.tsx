'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { CATEGORIES } from '@/lib/constants';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/lib/auth';
import { uploadProductImages } from '@/services/uploadService';
import { createProduct, updateProduct, getProductById } from '@/services/productService';
import { resolveCategoryId } from '@/services/categoryService';
import { getSupabase } from '@/lib/supabase';
import type { ProductCondition } from '@/lib/database.types';
import type { AttributeValues } from '@/lib/category-attributes';
import { getCategoryFields } from '@/lib/category-attributes';
import { findBrandModels, getBrandsForVehicleType, findBrandModelsForType, resolveVehicleType, type VehicleType } from '@/lib/vehicle-models';
import VehicleModelPicker from '@/components/upload/VehicleModelPicker';
import AiModelVerifier from '@/components/upload/AiModelVerifier';
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
      return { title: input, category: 'Djeca i bebe', description: '' };
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

type UploadStep = 'selection' | 'all-categories' | 'vehicle-sub' | 'parts-sub' | 'car-method' | 'nekretnine-sub' | 'mobile-sub' | 'moda-sub' | 'tehnika-sub' | 'services-sub' | 'poslovi-sub' | 'form';

const NEKRETNINE_TYPES = [
  { name: 'Stanovi i Apartmani', icon: 'fa-building' },
  { name: 'Stan na dan', icon: 'fa-suitcase' },
  { name: 'Kuće', icon: 'fa-house' },
  { name: 'Poslovni prostori', icon: 'fa-briefcase' },
  { name: 'Vikendice', icon: 'fa-tree' },
  { name: 'Skladišta i hale', icon: 'fa-warehouse' },
  { name: 'Sobe', icon: 'fa-bed' },
  { name: 'Zemljišta', icon: 'fa-map' },
  { name: 'Garaže', icon: 'fa-dungeon' },
  { name: 'Montažni objekti', icon: 'fa-hammer' },
  { name: 'Ostalo', icon: 'fa-ellipsis' },
];

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
  { name: 'Accessoires', icon: 'fa-hat-cowboy' },
  { name: 'Radna i zaštitna oprema', icon: 'fa-helmet-safety' },
  { name: 'Cipele', icon: 'fa-shoe-prints' },
  { name: 'Nakit (Schmuck)', icon: 'fa-gem' },
  { name: 'Maškare i kostimi', icon: 'fa-mask' },
  { name: 'Dodaci za odjeću', icon: 'fa-socks' },
];

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
  { name: 'Građevina i zanatstvo', icon: 'fa-hammer', subs: 'Građevinski radnik, pomoćnik, zidar, gipsar, keramičar, moler, krovopokrivač, stolar' },
  { name: 'Elektro i tehnika', icon: 'fa-bolt', subs: 'Električar, elektroinstalacije, mrežna tehnika, solarni paneli, pametna kuća' },
  { name: 'Vodovod, grijanje, klima', icon: 'fa-faucet', subs: 'Instalater, sanitarije, grijanje, klimatizacija' },
  { name: 'Auto i transport', icon: 'fa-car', subs: 'Automehaničar, autoelektričar, vulkanizer, šlep služba, vozač (auto/kamion)' },
  { name: 'IT i digitalno', icon: 'fa-laptop-code', subs: 'Razvoj softvera, web dizajn, IT podrška, sistemski admin, marketing/SEO' },
  { name: 'Čišćenje i održavanje', icon: 'fa-broom', subs: 'Čišćenje zgrada, ureda, kućanstva, pranje prozora' },
  { name: 'Nekretnine i upravljanje', icon: 'fa-house-chimney', subs: 'Domar, upravljanje objektima, održavanje vrta' },
  { name: 'Ugostiteljstvo i hoteli', icon: 'fa-utensils', subs: 'Kuhar, konobar, pomoćnik u kuhinji, hotelski servis' },
  { name: 'Industrija i proizvodnja', icon: 'fa-industry', subs: 'Proizvodni radnik, rukovalac strojevima, skladište i logistika' },
  { name: 'Ured i administracija', icon: 'fa-file-invoice', subs: 'Uredski asistent, knjigovodstvo, sekretarijat' },
  { name: 'Obrazovanje i njega', icon: 'fa-graduation-cap', subs: 'Instrukcije, poduka jezika, čuvanje djece' },
  { name: 'Ljepota i njega', icon: 'fa-scissors', subs: 'Frizer, kozmetika, masaža' },
  { name: 'Ostali poslovi', icon: 'fa-briefcase', subs: 'Freelancer, projektni rad, sezonski rad, ostalo' },
];

const VEHICLE_TYPES = [
  { name: 'Osobni automobili', icon: 'fa-car', type: 'car' as VehicleType, desc: 'Auti, limuzine, SUV, kombi...' },
  { name: 'Motocikli i skuteri', icon: 'fa-motorcycle', type: 'motorcycle' as VehicleType, desc: 'Sport, naked, touring, skuter...' },
  { name: 'Teretna vozila', icon: 'fa-truck', type: 'truck' as VehicleType, desc: 'Kamioni, kombiji, autobusi...' },
  { name: 'Bicikli', icon: 'fa-bicycle', type: 'bicycle' as VehicleType, desc: 'MTB, cestovni, e-bike, BMX...' },
  { name: 'Kamperi i prikolice', icon: 'fa-caravan', type: 'camper' as VehicleType, desc: 'Kamperi, kamp prikolice...' },
  { name: 'Nautika i plovila', icon: 'fa-ship', type: 'boat' as VehicleType, desc: 'Čamci, jedrilice, jet ski...' },
  { name: 'ATV / Quad / UTV', icon: 'fa-flag-checkered', type: 'atv' as VehicleType, desc: 'ATV, quad, side-by-side...' },
  { name: 'Prikolice', icon: 'fa-trailer', type: 'car' as VehicleType, desc: 'Auto, moto, čamac prikolice' },
  { name: 'Ostala vozila', icon: 'fa-ellipsis', type: 'car' as VehicleType, desc: 'Traktori, golf kolica...' },
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

  // Edit mode
  const editProductId = searchParams.get('edit');
  const isEditMode = !!editProductId;
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // ── All state declarations (must be before any conditional returns) ──
  const [formErrors, setFormErrors] = useState<{ title?: string; price?: string }>({});
  const [images, setImages] = useState<File[]>([]);
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
  const [showAiVerifier, setShowAiVerifier] = useState(false);
  const [aiVerification, setAiVerification] = useState<{brand: string, model: string, variant?: string, confidence: number} | null>(null);
  const [partsVehicleBrand, setPartsVehicleBrand] = useState('');
  const [partsVehicleModel, setPartsVehicleModel] = useState('');
  const [partsSubStep, setPartsSubStep] = useState<'brand' | 'category'>('brand');
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [catSearch, setCatSearch] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiInfo, setShowAiInfo] = useState(false);
  const [aiWarning, setAiWarning] = useState<{ warnings: string[]; recommendation: string; score: number } | null>(null);
  const [aiWarningBypass, setAiWarningBypass] = useState(false);

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

  // Load pre-filled data from /link-import page (sessionStorage handoff)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = sessionStorage.getItem('nudinadi_import');
    if (!raw) return;
    try {
      const d = JSON.parse(raw) as Record<string, unknown>;
      sessionStorage.removeItem('nudinadi_import');
      setFormData(prev => ({
        ...prev,
        title: (d.title as string) || prev.title,
        description: (d.description as string) || prev.description,
        price: d.price != null ? String(d.price) : prev.price,
        category: (d.category as string) || prev.category,
        location: (d.location as string) || prev.location,
        condition: d.condition === 'Novo' ? 'Novo' : d.condition === 'Kao novo' ? 'Kao novo' : prev.condition,
      }));
      setStep('form');
      showToast('Oglas importiran — provjeri podatke i objavi!');
    } catch {
      sessionStorage.removeItem('nudinadi_import');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth guards (after ALL hooks) ──

  if (isLoading) {
    return (
      <MainLayout>
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
    if (catName.toLowerCase().includes('tehnika') || catName.toLowerCase().includes('elektronika') || catName.toLowerCase().includes('računari')) {
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
    setAttributes({});
    setFormData({ ...formData, category: catName });
    setStep('form');
  };

  const selectNekretnineSub = (subCat: string) => {
      setAttributes({});
      setFormData({ ...formData, category: `Nekretnine - ${subCat}` });
      setStep('form');
  };

  const selectMobileSub = (brand: string) => {
    setAttributes({});
    setFormData({ ...formData, category: 'Mobilni uređaji', brand: brand, title: `${brand} ` });
    setStep('form');
  };

  const selectModaSub = (type: string) => {
    setAttributes({});
    setFormData({ ...formData, category: `Moda - ${type}` });
    setStep('form');
  };

  const selectTehnikaSub = (type: string) => {
    setAttributes({});
    setFormData({ ...formData, category: `Elektronika - ${type}` });
    setStep('form');
  };

  const selectServicesSub = (type: string) => {
    setAttributes({});
    setFormData({ ...formData, category: `Usluge - ${type}` });
    setStep('form');
  };

  const selectPosloviSub = (type: string) => {
    setAttributes({});
    setFormData({ ...formData, category: `Poslovi - ${type}` });
    setStep('form');
  };

  const selectCarBrand = (brand: string) => {
    if (vehicleType === 'parts') {
      setPartsVehicleBrand(brand);
      setAttributes(prev => ({ ...prev, zaVozilo: brand, zaModel: '' }));
      setFormData(prev => ({ ...prev, brand }));
      const brandModels = findBrandModelsForType(brand, 'car');
      if (brandModels.length > 0 && brand !== 'Ostalo') {
        setPickerBrand(brand);
        setShowModelPicker(true);
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
            setAttributes({});
            setFormData(prev => ({ ...prev, title: result.title, category: `Moda - ${matchedSub.name}`, description: result.description || prev.description }));
            setStep('form');
            showToast(`AI: Moda → ${matchedSub.name}`);
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
    const suffix = formData.priceType === 'mk' ? ' MK' : formData.priceType === 'negotiable' ? ' (dogovor)' : '';
    return `${sym} ${formData.price || '0'}${suffix}`;
  };

  // PhonePreview - KEEP dark colors as-is (intentionally dark-themed phone mockup)
  const PhonePreview = () => (
    <div className="w-full h-[700px] bg-[#060E14] border-[8px] border-[#121C26] rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col">
      <div className="h-6 w-full flex justify-between px-6 items-center pt-2 opacity-50">
        <span className="text-[9px] font-bold text-white">9:41</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-white rounded-full"></div>
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar relative bg-[#0B1219]">
        <div className="aspect-square bg-[#080D11] relative flex items-center justify-center border-b border-white/5">
          {images.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={URL.createObjectURL(images[0])} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <i className="fa-regular fa-image text-4xl text-gray-700"></i>
          )}
          <div className="absolute top-4 left-0 bg-blue-600 text-white px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-r-sm shadow-sm">
            {formData.condition}
          </div>
        </div>
        <div className="p-6">
          <h2 className="text-xl font-bold text-white leading-tight mb-2">{formData.title || 'Naslov Artikla'}</h2>
          <div className="flex items-center gap-4 border-b border-white/5 pb-4 mb-4">
            <div className="flex items-center gap-2 text-gray-400 text-[10px]">
              <i className="fa-solid fa-location-dot text-blue-500"></i>
              <span>{formData.location || 'Lokacija'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-[10px]">
              <i className="fa-regular fa-clock"></i>
              <span>Upravo sada</span>
            </div>
          </div>
          <div className="border border-white/10 rounded-[12px] overflow-hidden mb-6">
            <div className="bg-[#121A21] p-4 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cijena</span>
              <span className="text-xl font-black tracking-tight text-white">
                {getPriceLabel()}
              </span>
            </div>
          </div>
          {(formData.category.includes('Mobilni') || formData.category.includes('Mobiteli')) && (
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-[#121C26] p-2 rounded-[8px] text-center border border-white/5">
                <i className="fa-solid fa-microchip text-gray-500 text-xs mb-1"></i>
                <span className="block text-[9px] text-white font-bold mt-1">{(attributes.memorija as string) || '-'}</span>
              </div>
              <div className="bg-[#121C26] p-2 rounded-[8px] text-center border border-white/5">
                <i className="fa-solid fa-battery-half text-gray-500 text-xs mb-1"></i>
                <span className="block text-[9px] text-white font-bold mt-1">{(attributes.baterija as string) || '-'}</span>
              </div>
              <div className="bg-[#121C26] p-2 rounded-[8px] text-center border border-white/5">
                <i className="fa-solid fa-shield text-gray-500 text-xs mb-1"></i>
                <span className="block text-[9px] text-white font-bold mt-1">{attributes.garancija ? 'Da' : 'Ne'}</span>
              </div>
            </div>
          )}
          <div>
            <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2 border-l-2 border-blue-500 pl-2">Opis</h3>
            <p className="text-xs text-gray-300 font-mono leading-relaxed whitespace-pre-line">
              {formData.description || 'Ovdje će se pojaviti opis vašeg artikla.'}
            </p>
          </div>
        </div>
      </div>
      <div className="h-16 bg-[#060E14] border-t border-white/10 flex items-center justify-between px-6">
        <div className="w-8 h-8 rounded-full border border-white/10"></div>
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
        });

        // Award XP for upload
        try {
          await getSupabase().from('user_activities').insert({
            user_id: user.id,
            activity_type: 'upload' as const,
            xp_earned: 10,
          });
        } catch (xpErr) {
          console.warn('XP insert failed:', xpErr);
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
      console.error('Upload failed:', err);
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
    const filteredCats = catSearch.trim()
      ? CATEGORIES.filter(cat => {
          const q = catSearch.toLowerCase();
          if (cat.name.toLowerCase().includes(q)) return true;
          return cat.subCategories.some(sub =>
            sub.name.toLowerCase().includes(q) ||
            sub.items?.some(item => item.toLowerCase().includes(q))
          );
        })
      : CATEGORIES;

    return (
      <MainLayout title="Sve Kategorije" showSigurnost={false} hideSearchOnMobile headerRight={
        <button onClick={() => { setStep('selection'); setCatSearch(''); setExpandedCat(null); }} className="w-10 h-10 rounded-full bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)]"><i className="fa-solid fa-arrow-left"></i></button>
      }>
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
                            setFormData(prev => ({ ...prev, category: sub.name }));
                            setStep('form');
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

  // Helper: render a sub-selection grid
  const renderSubSelection = (
    title: string,
    subtitle: string,
    color: string,
    items: { name: string; icon: string; type?: string }[],
    onSelect: (name: string) => void,
    searchPlaceholder: string,
    aiLabel: string
  ) => (
    <MainLayout title={title} showSigurnost={false} hideSearchOnMobile headerRight={
      <button onClick={() => setStep('selection')} className="w-10 h-10 rounded-full bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)]"><i className="fa-solid fa-arrow-left"></i></button>
    }>
      <div className="space-y-4 pt-2 pb-24">
        <div className="px-1 mb-2">
           <h2 className={`text-[11px] font-black text-${color}-500 uppercase tracking-[3px] mb-1`}>{subtitle}</h2>
           <p className="text-sm text-[var(--c-text2)] font-medium">Koji tip želite oglasiti?</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
           {items.map((item, index) => (
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
      <MainLayout title="Vozila" showSigurnost={false} hideSearchOnMobile headerRight={
        <button onClick={() => setStep('selection')} className="w-10 h-10 rounded-full bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)]"><i className="fa-solid fa-arrow-left"></i></button>
      }>
        <div className="space-y-4 pt-2 pb-24">
          <div className="px-1 mb-2">
            <h2 className="text-[11px] font-black text-blue-500 uppercase tracking-[3px] mb-1">Vrsta vozila</h2>
            <p className="text-sm text-[var(--c-text2)] font-medium">Šta želite oglasiti?</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {VEHICLE_TYPES.map((vt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setVehicleType(vt.type);
                  setFormData(prev => ({ ...prev, category: `Vozila - ${vt.name}` }));
                  if (vt.name === 'Prikolice' || vt.name === 'Ostala vozila') {
                    setStep('form');
                  } else {
                    setStep('car-method');
                  }
                }}
                className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] p-4 flex flex-col items-center justify-center gap-2 text-center group active:scale-95 transition-all hover:bg-[var(--c-hover)] hover:border-blue-500/30"
              >
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

          {/* Dijelovi za vozila shortcut */}
          <button
            onClick={() => {
              setVehicleType('parts');
              setFormData(prev => ({ ...prev, category: 'Dijelovi za vozila' }));
              setPartsSubStep('brand');
              setStep('parts-sub');
            }}
            className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] p-4 flex items-center gap-4 group active:scale-[0.98] transition-all hover:bg-[var(--c-hover)] hover:border-amber-500/30"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform shrink-0">
              <i className="fa-solid fa-gears text-lg"></i>
            </div>
            <div className="text-left">
              <span className="text-[13px] font-bold text-[var(--c-text)] block">Dijelovi za vozila</span>
              <span className="text-[9px] text-[var(--c-text3)]">Auto, moto, bicikl dijelovi i oprema</span>
            </div>
            <i className="fa-solid fa-chevron-right text-[10px] text-[var(--c-text-muted)] ml-auto"></i>
          </button>
        </div>
      </MainLayout>
    );
  }

  // ── Parts Sub-Selection (multi-step) ───────────────────
  if (step === 'parts-sub') {
    if (partsSubStep === 'category') {
      // Step 2: Pick parts category
      return (
        <MainLayout title="Dijelovi" showSigurnost={false} hideSearchOnMobile headerRight={
          <button onClick={() => { setPartsSubStep('brand'); }} className="w-10 h-10 rounded-full bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)]"><i className="fa-solid fa-arrow-left"></i></button>
        }>
          <div className="space-y-4 pt-2 pb-24">
            {partsVehicleBrand && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border bg-blue-500/5 border-blue-500/20">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><i className="fa-solid fa-car text-blue-500 text-sm"></i></div>
                <span className="text-[11px] font-black text-blue-500 uppercase tracking-wide">{partsVehicleBrand} {partsVehicleModel}</span>
              </div>
            )}
            <div className="px-1 mb-2">
              <h2 className="text-[11px] font-black text-amber-500 uppercase tracking-[3px] mb-1">Kategorija dijela</h2>
              <p className="text-sm text-[var(--c-text2)] font-medium">Koji tip dijela prodajete?</p>
            </div>
            {PARTS_CATEGORIES.map((group, gi) => (
              <div key={gi}>
                <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-widest mb-2 px-1">{group.group}</p>
                <div className="grid grid-cols-2 gap-2">
                  {group.items.map((item, ii) => (
                    <button
                      key={ii}
                      onClick={() => {
                        setAttributes(prev => ({ ...prev, kategorijaDijela: `${group.group} - ${item.name}` }));
                        setFormData(prev => ({ ...prev, category: `Dijelovi za vozila - ${item.name}` }));
                        setStep('form');
                      }}
                      className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-3 flex items-center gap-3 text-left group active:scale-95 transition-all hover:bg-[var(--c-hover)] hover:border-amber-500/30"
                    >
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 shrink-0">
                        <i className={`fa-solid ${item.icon} text-sm`}></i>
                      </div>
                      <span className="text-[11px] font-bold text-[var(--c-text)] leading-tight">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </MainLayout>
      );
    }
    // Step 1 (brand): reuse car-method by switching to it
    setStep('car-method');
    return null;
  }

  if (step === 'nekretnine-sub') {
    return renderSubSelection('Nekretnine', 'Izaberite kategoriju nekretnine', 'emerald', NEKRETNINE_TYPES, selectNekretnineSub, 'Npr. Stan u centru Sarajeva...', 'NudiNađi AI');
  }
  if (step === 'mobile-sub') {
    return renderSubSelection('Mobilni', 'Izaberite Brend', 'rose', MOBILE_BRANDS, selectMobileSub, 'Npr. iPhone 13 Pro Max plavi...', 'NudiNađi AI');
  }
  if (step === 'moda-sub') {
    return renderSubSelection('Moda', 'Kategorije Mode', 'amber', MODA_TYPES, selectModaSub, 'Npr. Crvena haljina M veličina...', 'NudiNađi AI');
  }
  if (step === 'tehnika-sub') {
    return renderSubSelection('Elektronika', 'IT & Gaming', 'purple', TEHNIKA_TYPES, selectTehnikaSub, 'Npr. Gaming PC RTX 3060...', 'NudiNađi AI');
  }
  if (step === 'services-sub') {
    return renderSubSelection('Usluge', 'Kategorije Usluga', 'cyan', SERVICES_TYPES, selectServicesSub, 'Npr. Popravka veš mašine...', 'NudiNađi AI');
  }

  // Poslovi Sub-Selection (unique layout with sticky search)
  if (step === 'poslovi-sub') {
    return (
      <MainLayout title="Poslovi" showSigurnost={false} hideSearchOnMobile headerRight={
        <button onClick={() => setStep('selection')} className="w-10 h-10 rounded-full bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)]"><i className="fa-solid fa-arrow-left"></i></button>
      }>
        <div className="pb-24 relative min-h-screen">

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
                            placeholder="Traži posao (npr. Vozač kamiona)..."
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

  // 3. Car Method (VIN/AI + Brand Picker) — now dynamic per vehicleType
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
    const currentBrands = getBrandsForVehicleType(vehicleType).map(b => ({ name: b.name, slug: b.slug }));
    const filteredBrands = carBrandSearch.trim()
      ? currentBrands.filter(b => b.name.toLowerCase().includes(carBrandSearch.toLowerCase()))
      : currentBrands;

    const showVinSection = vehicleType === 'car' || vehicleType === 'parts';

    return (
      <MainLayout title={vehicleType === 'parts' ? 'Dijelovi' : 'Vozila'} showSigurnost={false} hideSearchOnMobile headerRight={
        <button onClick={() => setStep(vehicleType === 'parts' ? 'parts-sub' : 'vehicle-sub')} className="w-10 h-10 rounded-full bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)]"><i className="fa-solid fa-arrow-left"></i></button>
      }>
        <div className="pb-24 pt-2 space-y-6 px-1">

          {/* VIN + AI Section — only for cars/parts */}
          {showVinSection && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
               <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <i className={`fa-solid ${vLabel.icon} text-lg text-blue-400`}></i>
               </div>
               <h2 className="text-lg font-black text-[var(--c-text)]">Smart Identifikacija</h2>
               <p className="text-[10px] text-[var(--c-text3)]">Unesite VIN broj ili opišite vozilo</p>
            </div>

            {/* VIN INPUT */}
            <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[24px] p-1.5">
               <div className="bg-[var(--c-overlay)] rounded-[20px] p-3 flex gap-3 items-center border border-[var(--c-border)] focus-within:border-blue-500/50 transition-colors">
                    <input
                      type="text"
                      value={formData.vin}
                      onChange={(e) => setFormData({...formData, vin: e.target.value.toUpperCase()})}
                      placeholder="VIN broj..."
                      className="w-full bg-transparent text-sm font-mono text-[var(--c-text)] outline-none placeholder:text-[var(--c-placeholder)] uppercase tracking-widest text-center"
                    />
                    <button onClick={handleVinLookup} className="w-10 h-10 rounded-xl blue-gradient flex items-center justify-center text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-transform shrink-0">
                        <i className="fa-solid fa-arrow-right"></i>
                    </button>
               </div>
            </div>

            {/* AI SEARCH BAR */}
            <div className="relative group w-full">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[22px] blur opacity-20 group-focus-within:opacity-60 transition duration-500"></div>
                <div className="relative bg-[var(--c-card-alt)] rounded-[20px] flex items-center p-1.5 border border-[var(--c-border2)]">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--c-hover)] flex items-center justify-center text-blue-400 shrink-0">
                         <i className="fa-solid fa-wand-magic-sparkles text-sm"></i>
                    </div>
                    <input
                        type="text"
                        value={magicSearchInput}
                        onChange={(e) => setMagicSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleMagicSearch()}
                        placeholder="Npr. Golf 7 2.0 TDI 2018..."
                        className="w-full bg-transparent text-[11px] font-medium text-[var(--c-text)] px-3 focus:outline-none placeholder:text-[var(--c-placeholder)]"
                    />
                    <button
                        onClick={handleMagicSearch}
                        disabled={isAiLoading}
                        className="w-10 h-10 rounded-xl bg-[var(--c-active)] flex items-center justify-center text-[var(--c-text)] hover:bg-[var(--c-active)] transition-all disabled:opacity-50 shrink-0"
                    >
                        {isAiLoading ? <i className="fa-solid fa-spinner animate-spin text-xs"></i> : <i className="fa-solid fa-paper-plane text-xs"></i>}
                    </button>
                </div>
            </div>
            <p className="text-center text-[8px] text-[var(--c-text-muted)] font-medium">
               <span className="text-blue-500">NudiNađi AI</span> automatski prepoznaje detalje vozila.
            </p>
          </div>
          )}

          {/* Divider: RUČNI UNOS */}
          <div className="flex items-center gap-4">
             <div className="h-[1px] bg-[var(--c-border)] flex-1"></div>
             <span className="text-[9px] font-black uppercase tracking-[3px] text-blue-500">Ručni Unos</span>
             <div className="h-[1px] bg-[var(--c-border)] flex-1"></div>
          </div>

          {/* Brand Picker */}
          <div>
            <h3 className="text-[11px] font-black text-[var(--c-text2)] uppercase tracking-[2px] mb-3 px-1">{vLabel.title}</h3>

            {/* Brand Search */}
            <div className="relative mb-4">
              <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] flex items-center px-4 py-3 gap-3 focus-within:border-blue-500/40 transition-colors">
                <i className="fa-solid fa-magnifying-glass text-[var(--c-text3)] text-xs"></i>
                <input
                  type="text"
                  value={carBrandSearch}
                  onChange={(e) => setCarBrandSearch(e.target.value)}
                  placeholder={vLabel.searchPlaceholder}
                  className="w-full bg-transparent text-sm text-[var(--c-text)] outline-none placeholder:text-[var(--c-placeholder)]"
                />
                {carBrandSearch && (
                  <button onClick={() => setCarBrandSearch('')} className="text-[var(--c-text3)] hover:text-[var(--c-text)]">
                    <i className="fa-solid fa-xmark text-xs"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Brand Grid */}
            <div className="grid grid-cols-3 gap-2">
              {filteredBrands.map((brand) => (
                <button
                  key={brand.name}
                  onClick={() => selectCarBrand(brand.name)}
                  className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] p-2.5 sm:p-3.5 flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-center group active:scale-95 transition-all hover:bg-[var(--c-hover)] hover:border-blue-500/30"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--c-card)] flex items-center justify-center border border-[var(--c-border)] group-hover:scale-110 transition-transform overflow-hidden">
                    {brand.name === 'Ostalo' ? (
                      <i className="fa-solid fa-ellipsis text-lg text-[var(--c-text-muted)]"></i>
                    ) : (vehicleType === 'car' || vehicleType === 'parts') && brand.slug ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${CAR_LOGO_BASE}/${brand.slug}.png`}
                        alt={brand.name}
                        className="w-9 h-9 object-contain"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; const next = (e.target as HTMLImageElement).nextElementSibling; if (next) (next as HTMLElement).style.display = 'flex'; }}
                      />
                    ) : null}
                    {brand.name !== 'Ostalo' && (
                      <span style={{ display: (vehicleType === 'car' || vehicleType === 'parts') && brand.slug ? 'none' : 'flex' }} className="text-lg font-black text-blue-400">{brand.name[0]}</span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-[var(--c-text)] leading-tight">{brand.name}</span>
                </button>
              ))}
            </div>

            {filteredBrands.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-[var(--c-text3)]">Nema rezultata za &quot;{carBrandSearch}&quot;</p>
                <button
                  onClick={() => { setCarBrandSearch(''); selectCarBrand(carBrandSearch.trim()); }}
                  className="mt-3 text-[11px] font-bold text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Koristi &quot;{carBrandSearch.trim()}&quot; kao marku
                </button>
              </div>
            )}
          </div>

        </div>
      </MainLayout>
    );
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
      headerRight={
        <button
          onClick={() => { if (formPage === 3) { setFormPage(2); window.scrollTo({ top: 0, behavior: 'smooth' }); } else if (formPage === 2) { setFormPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); } else { setStep('selection'); } }}
          className="text-[var(--c-text3)] text-xs font-bold uppercase hover:text-[var(--c-text)] transition-colors"
        >
          Nazad
        </button>
      }
    >
      <div className="max-w-2xl lg:max-w-5xl mx-auto w-full flex flex-col lg:flex-row gap-8 pb-32 pt-2 px-2 sm:px-4 lg:px-0">

        {/* LEFT: FORM */}
        <div className="flex-1 space-y-5">

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
              <ImageUpload images={images} onImagesChange={setImages} />

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
              {(formData.category.toLowerCase().includes('vozila') || formData.category.toLowerCase() === 'automobili') && (
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
                excludeKeys={(formData.category.toLowerCase().includes('vozila') || formData.category.toLowerCase() === 'automobili') ? ['marka', 'model', 'godiste', 'karoserija'] : undefined}
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
      <VehicleModelPicker
        open={showModelPicker}
        brandName={pickerBrand}
        vehicleType={vehicleType}
        onSelect={handleModelPickerSelect}
        onClose={() => setShowModelPicker(false)}
      />

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
