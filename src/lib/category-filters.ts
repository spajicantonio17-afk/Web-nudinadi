// ── Category-Specific Quick Filter Definitions ──────────────────
// Used by CategoryFilterBar to show relevant filters per category.
// Supports subcategory-specific filters (Phase 2).

import { CAR_BRANDS_WITH_MODELS, MOTORCYCLE_BRANDS, TRUCK_BRANDS } from './vehicle-models';

export type QuickFilterType = 'select' | 'range' | 'text' | 'autocomplete';

export interface QuickFilter {
  key: string;
  label: string;
  type: QuickFilterType;
  options?: string[];
  /** For range filters: [min, max] */
  range?: [number, number];
  /** Unit label for range filters (e.g. 'km', 'ccm', 'kW') */
  unit?: string;
  /** If this filter depends on another filter's value */
  dependsOn?: string;
  /** Attribute key in JSONB (defaults to `key`) */
  attributeKey?: string;
}

export interface SubcategoryFilterConfig {
  quickFilters: QuickFilter[];
  booleanFilters: { key: string; label: string }[];
}

export interface CategoryFilterConfig {
  /** Category name (matches CATEGORIES[].name) */
  categoryName: string;
  /** General quick filters (shown when only main category selected) */
  quickFilters: QuickFilter[];
  /** General boolean filters */
  booleanFilters: { key: string; label: string }[];
  /** Subcategory-specific filters (key = subcategory name from constants.ts) */
  subcategoryFilters?: Record<string, SubcategoryFilterConfig>;
}

// ── Dynamic options resolver for autocomplete filters ────────────

/** Get dynamic options for autocomplete filters based on context */
export function getAutoCompleteOptions(
  categoryName: string,
  filterKey: string,
  currentFilters: Record<string, string | number | boolean | [number, number]>,
  subcategoryName?: string,
): string[] {
  if (categoryName === 'Vozila' || categoryName === 'Dijelovi za automobile') {
    if (filterKey === 'marka' || filterKey === 'markaVozila') {
      if (subcategoryName === 'Motocikli i skuteri') {
        return MOTORCYCLE_BRANDS.map(b => b.name);
      }
      if (subcategoryName === 'Teretna vozila' || subcategoryName === 'Autobusi i minibusi') {
        return TRUCK_BRANDS.map(b => b.name);
      }
      return CAR_BRANDS_WITH_MODELS.map(b => b.name);
    }
    if (filterKey === 'model') {
      const marka = currentFilters.marka ?? currentFilters.markaVozila;
      if (typeof marka === 'string') {
        const brandList =
          subcategoryName === 'Motocikli i skuteri'
            ? MOTORCYCLE_BRANDS
            : subcategoryName === 'Teretna vozila' || subcategoryName === 'Autobusi i minibusi'
              ? TRUCK_BRANDS
              : CAR_BRANDS_WITH_MODELS;
        const brand = brandList.find(
          b => b.name.toLowerCase() === marka.toLowerCase()
        );
        if (brand) {
          const models: string[] = [];
          for (const m of brand.models) {
            models.push(m.name);
            if (m.variants) {
              for (const v of m.variants) models.push(v);
            }
          }
          return models;
        }
      }
      return [];
    }
  }
  return [];
}

// ── Shared filter fragments ─────────────────────────────────────

const BOJA_SELECT: QuickFilter = { key: 'boja', label: 'Boja', type: 'select', options: ['Crna', 'Bijela', 'Siva', 'Srebrna', 'Crvena', 'Plava', 'Zelena', 'Narančasta', 'Zlatna', 'Smeđa', 'Bež', 'Ostalo'] };

const STANJE_SELECT: QuickFilter = { key: 'stanje', label: 'Stanje', type: 'select', options: ['Novo', 'Polovni'] };

// Dijelovi za automobile shared sets
const DIJELOVI_AUTO_STANDARD: QuickFilter[] = [
  { key: 'markaVozila', label: 'Marka vozila', type: 'autocomplete' },
  { key: 'model', label: 'Model', type: 'autocomplete', dependsOn: 'markaVozila' },
  { key: 'godisteVozila', label: 'Godište vozila', type: 'range', range: [1980, 2026] },
];

const DIJELOVI_AUTO_BASIC: QuickFilter[] = [
  { key: 'markaVozila', label: 'Marka vozila', type: 'autocomplete' },
  { key: 'model', label: 'Model', type: 'autocomplete', dependsOn: 'markaVozila' },
];

const DIJELOVI_MOTO: QuickFilter[] = [
  { key: 'markaMotocikla', label: 'Marka motocikla', type: 'text' },
  { key: 'model', label: 'Model', type: 'text' },
];

// Mobiteli shared
const MOBITEL_STANDARD_QUICK: QuickFilter[] = [
  { key: 'memorija', label: 'Memorija', type: 'select', options: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'] },
  { key: 'ram', label: 'RAM', type: 'select', options: ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'] },
  { ...BOJA_SELECT, options: ['Crna', 'Bijela', 'Siva', 'Srebrna', 'Plava', 'Crvena', 'Zelena', 'Zlatna', 'Roza', 'Ljubičasta', 'Ostalo'] },
  { key: 'stanjeEkrana', label: 'Stanje ekrana', type: 'select', options: ['Savršeno', 'Sitne ogrebotine', 'Vidljive ogrebotine', 'Napuknuće', 'Zamijenjen ekran'] },
];
const MOBITEL_STANDARD_BOOL = [
  { key: 'fabrickaKutija', label: 'Fabrička kutija' },
  { key: 'punjac', label: 'Punjač uključen' },
  { key: 'ostecen', label: 'Oštećen' },
];

// Poslovi shared
const POSLOVI_BASE: QuickFilter[] = [
  { key: 'tipPosla', label: 'Tip posla', type: 'select', options: ['Puno radno vrijeme', 'Pola radnog vremena', 'Honorarno', 'Praksa'] },
  { key: 'iskustvo', label: 'Iskustvo', type: 'select', options: ['Bez iskustva', 'Junior', 'Mid', 'Senior'] },
  { key: 'obrazovanje', label: 'Obrazovanje', type: 'select', options: ['SSS', 'VŠS', 'VSS'] },
];

// ── 1. VOZILA ───────────────────────────────────────────────────

const VOZILA_FILTERS: CategoryFilterConfig = {
  categoryName: 'Vozila',
  quickFilters: [
    { key: 'godiste', label: 'Godište', type: 'range', range: [1980, 2026] },
    STANJE_SELECT,
  ],
  booleanFilters: [],
  subcategoryFilters: {
    'Osobni automobili': {
      quickFilters: [
        { key: 'marka', label: 'Marka', type: 'autocomplete' },
        { key: 'model', label: 'Model', type: 'autocomplete', dependsOn: 'marka' },
        { key: 'godiste', label: 'Godište', type: 'range', range: [1980, 2026] },
        { key: 'km', label: 'Kilometraža', type: 'range', range: [0, 500000], unit: 'km' },
        { key: 'gorivo', label: 'Gorivo', type: 'select', options: ['Dizel', 'Benzin', 'Benzin+LPG', 'Hibrid', 'Plug-in hibrid', 'Električni', 'CNG'] },
        { key: 'mjenjac', label: 'Mjenjač', type: 'select', options: ['Ručni', 'Automatik', 'Poluautomatik', 'DSG-DCT'] },
        { key: 'karoserija', label: 'Karoserija', type: 'select', options: ['Sedan', 'Karavan', 'Hatchback', 'Coupe', 'Kabriolet', 'SUV', 'Crossover', 'Pickup', 'Van', 'Minivan', 'Limuzina'] },
        BOJA_SELECT,
        { key: 'snaga', label: 'Snaga kW', type: 'range', range: [0, 500], unit: 'kW' },
        { key: 'pogon', label: 'Pogon', type: 'select', options: ['Prednji', 'Zadnji', '4x4 stalni', '4x4 povremeni'] },
        { key: 'kubikaza', label: 'Kubikaža', type: 'range', range: [0, 6000], unit: 'ccm' },
        { key: 'registracija', label: 'Registracija', type: 'select', options: ['Istekla', 'Do 3mj', 'Do 6mj', 'Do 12mj'] },
      ],
      booleanFilters: [
        { key: 'klima', label: 'Klima' },
        { key: 'autoKlima', label: 'Automatska klima' },
        { key: 'tempomat', label: 'Tempomat' },
        { key: 'adaptivniTempomat', label: 'Adaptivni tempomat' },
        { key: 'parkSenzori', label: 'Parking senzori' },
        { key: 'kameraNazad', label: 'Kamera nazad' },
        { key: 'kamera360', label: 'Kamera 360°' },
        { key: 'navigacija', label: 'Navigacija' },
        { key: 'bluetooth', label: 'Bluetooth' },
        { key: 'appleCarPlay', label: 'Apple CarPlay' },
        { key: 'androidAuto', label: 'Android Auto' },
        { key: 'kozenaSjed', label: 'Kožna sjedišta' },
        { key: 'grejanaSjed', label: 'Grijana sjedišta' },
        { key: 'xenon', label: 'Xenon/LED' },
        { key: 'matrixLed', label: 'Matrix LED' },
        { key: 'panoramskiKrov', label: 'Panoramski krov' },
        { key: 'abs', label: 'ABS' },
        { key: 'esp', label: 'ESP/ASR' },
        { key: 'laneAssist', label: 'Lane Assist' },
        { key: 'autoKocenje', label: 'Automatsko kočenje' },
        { key: 'servisnaKnjiga', label: 'Servisna knjiga' },
        { key: 'udareno', label: 'Udareno' },
        { key: 'registriran', label: 'Registriran' },
        { key: 'turbo', label: 'Turbo' },
        { key: 'aluFelge', label: 'Alu felge' },
        { key: 'touchscreen', label: 'Touchscreen' },
        { key: 'digKokpit', label: 'Digitalni kokpit' },
        { key: 'headUpDisplay', label: 'Head-up display' },
        { key: 'bezKljucPokr', label: 'Keyless Go' },
        { key: 'startStop', label: 'Start/Stop' },
        { key: 'grijaniVolan', label: 'Grijani volan' },
        { key: 'elProzori', label: 'El. prozori' },
        { key: 'elRetrovizori', label: 'El. retrovizori' },
        { key: 'kukaPrivez', label: 'Kuka za prikolicu' },
        { key: 'isofix', label: 'ISOFIX' },
        { key: 'ocarinjen', label: 'Ocarinjen' },
        { key: 'alarm', label: 'Alarm' },
        { key: 'centralnaBrava', label: 'Centralna brava' },
        { key: 'voznoStanje', label: 'U voznom stanju' },
        { key: 'uKompletu', label: 'U kompletu' },
      ],
    },
    'Motocikli i skuteri': {
      quickFilters: [
        { key: 'marka', label: 'Marka', type: 'autocomplete' },
        { key: 'model', label: 'Model', type: 'autocomplete', dependsOn: 'marka' },
        { key: 'godiste', label: 'Godište', type: 'range', range: [1980, 2026] },
        { key: 'km', label: 'Kilometraža', type: 'range', range: [0, 200000], unit: 'km' },
        { key: 'kubikaza', label: 'Kubikaža', type: 'range', range: [0, 2500], unit: 'ccm' },
        { key: 'tip', label: 'Tip', type: 'select', options: ['Naked', 'Sport', 'Enduro', 'Cruiser', 'Chopper', 'Skuter', 'Moped', 'Tricikl'] },
        { key: 'snaga', label: 'Snaga kW', type: 'range', range: [0, 200], unit: 'kW' },
        BOJA_SELECT,
      ],
      booleanFilters: [],
    },
    'Teretna vozila': {
      quickFilters: [
        { key: 'marka', label: 'Marka', type: 'autocomplete' },
        { key: 'model', label: 'Model', type: 'text' },
        { key: 'godiste', label: 'Godište', type: 'range', range: [1980, 2026] },
        { key: 'km', label: 'Kilometraža', type: 'range', range: [0, 1000000], unit: 'km' },
        { key: 'nosivost', label: 'Nosivost t', type: 'range', range: [0, 40], unit: 't' },
        { key: 'gorivo', label: 'Gorivo', type: 'select', options: ['Dizel', 'Benzin', 'Električni', 'CNG'] },
        { key: 'mjenjac', label: 'Mjenjač', type: 'select', options: ['Ručni', 'Automatik'] },
        { key: 'tip', label: 'Tip', type: 'select', options: ['Kamion 3.5t-7.5t', 'Teški kamion 7.5t+', 'Kombi do 3.5t', 'Tegljač', 'Kiper', 'Cisterna', 'Hladnjača'] },
      ],
      booleanFilters: [],
    },
    'Autobusi i minibusi': {
      quickFilters: [
        { key: 'marka', label: 'Marka', type: 'autocomplete' },
        { key: 'godiste', label: 'Godište', type: 'range', range: [1980, 2026] },
        { key: 'km', label: 'Kilometraža', type: 'range', range: [0, 1000000], unit: 'km' },
        { key: 'brojMjesta', label: 'Broj mjesta', type: 'range', range: [0, 60] },
        { key: 'gorivo', label: 'Gorivo', type: 'select', options: ['Dizel', 'Benzin', 'Električni', 'CNG'] },
        { key: 'tip', label: 'Tip', type: 'select', options: ['Gradski', 'Turistički', 'Minibus', 'Školski'] },
      ],
      booleanFilters: [],
    },
    'Bicikli': {
      quickFilters: [
        { key: 'marka', label: 'Marka', type: 'text' },
        { key: 'tip', label: 'Tip', type: 'select', options: ['MTB', 'Cestovni', 'Gravel', 'Trekking', 'City', 'BMX', 'Dječji', 'Sklopivi', 'E-bike'] },
        { key: 'velicinaOkvira', label: 'Veličina okvira', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL'] },
        { key: 'materijal', label: 'Materijal okvira', type: 'select', options: ['Aluminij', 'Karbon', 'Čelik'] },
      ],
      booleanFilters: [],
    },
    'Kamper i kamp prikolice': {
      quickFilters: [
        { key: 'marka', label: 'Marka', type: 'text' },
        { key: 'godiste', label: 'Godište', type: 'range', range: [1980, 2026] },
        { key: 'km', label: 'Kilometraža', type: 'range', range: [0, 500000], unit: 'km' },
        { key: 'duzina', label: 'Dužina m', type: 'range', range: [4, 12], unit: 'm' },
        { key: 'brojLezajeva', label: 'Broj ležajeva', type: 'select', options: ['2', '3', '4', '5', '6+'] },
        { key: 'tip', label: 'Tip', type: 'select', options: ['Integrirani', 'Polu-integrirani', 'Alkoven', 'Kamp prikolica', 'Krovni šator'] },
      ],
      booleanFilters: [],
    },
    'Prikolice': {
      quickFilters: [
        { key: 'tipPrikolice', label: 'Tip prikolice', type: 'select', options: ['Osobna', 'Za čamce', 'Za motocikle', 'Za konje', 'Kiper', 'Hladnjača', 'Za drva', 'Za građevinu', 'Za bicikle', 'Ostalo'] },
        { key: 'nosivost', label: 'Nosivost kg', type: 'range', range: [0, 3500], unit: 'kg' },
        { key: 'duzina', label: 'Dužina m', type: 'range', range: [1, 10], unit: 'm' },
      ],
      booleanFilters: [],
    },
    'Nautika i plovila': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Čamac na motor', 'Jedrilica', 'Jahta', 'Gumenjak', 'Jet ski', 'Kajak', 'Kanu', 'Ribarski čamac', 'SUP', 'Brod'] },
        { key: 'duzina', label: 'Dužina m', type: 'range', range: [1, 30], unit: 'm' },
        { key: 'snagaMotora', label: 'Snaga motora KS', type: 'range', range: [0, 1000], unit: 'KS' },
        { key: 'godiste', label: 'Godište', type: 'range', range: [1980, 2026] },
        { key: 'gorivo', label: 'Gorivo', type: 'select', options: ['Benzin', 'Dizel', 'Električni', 'Bez motora'] },
      ],
      booleanFilters: [],
    },
    'ATV / Quad / UTV': {
      quickFilters: [
        { key: 'marka', label: 'Marka', type: 'text' },
        { key: 'godiste', label: 'Godište', type: 'range', range: [1980, 2026] },
        { key: 'km', label: 'Kilometraža', type: 'range', range: [0, 100000], unit: 'km' },
        { key: 'kubikaza', label: 'Kubikaža', type: 'range', range: [0, 1000], unit: 'ccm' },
        { key: 'snaga', label: 'Snaga kW', type: 'range', range: [0, 100], unit: 'kW' },
      ],
      booleanFilters: [],
    },
    'Ostala vozila': {
      quickFilters: [
        { key: 'marka', label: 'Marka', type: 'text' },
        { key: 'godiste', label: 'Godište', type: 'range', range: [1980, 2026] },
      ],
      booleanFilters: [],
    },
  },
};

// ── 2. DIJELOVI ZA AUTOMOBILE ───────────────────────────────────

const DIJELOVI_FILTERS: CategoryFilterConfig = {
  categoryName: 'Dijelovi za automobile',
  quickFilters: [
    { key: 'markaVozila', label: 'Marka vozila', type: 'autocomplete' },
    STANJE_SELECT,
  ],
  booleanFilters: [],
  subcategoryFilters: {
    'Za automobile – Motor i mjenjač': { quickFilters: [...DIJELOVI_AUTO_STANDARD], booleanFilters: [] },
    'Za automobile – Elektrika i elektronika': { quickFilters: [...DIJELOVI_AUTO_STANDARD], booleanFilters: [] },
    'Za automobile – Ovjes i kočnice': { quickFilters: [...DIJELOVI_AUTO_STANDARD], booleanFilters: [] },
    'Za automobile – Karoserija i stakla': { quickFilters: [...DIJELOVI_AUTO_STANDARD, BOJA_SELECT], booleanFilters: [] },
    'Za automobile – Unutrašnjost i sjedala': { quickFilters: [...DIJELOVI_AUTO_STANDARD, BOJA_SELECT], booleanFilters: [] },
    'Za automobile – Felge i gume': {
      quickFilters: [
        { key: 'markaVozila', label: 'Marka vozila', type: 'autocomplete' },
        { key: 'dimenzija', label: 'Dimenzija', type: 'text' },
        { key: 'sezona', label: 'Sezona', type: 'select', options: ['Ljetne', 'Zimske', 'Cijelogodišnje'] },
        { key: 'promjerFelge', label: 'Promjer felge', type: 'select', options: ['14"', '15"', '16"', '17"', '18"', '19"', '20"+'] },
      ],
      booleanFilters: [],
    },
    'Za automobile – Tuning i oprema': { quickFilters: [...DIJELOVI_AUTO_BASIC], booleanFilters: [] },
    'Za automobile – Navigacija i auto akustika': { quickFilters: [...DIJELOVI_AUTO_BASIC], booleanFilters: [] },
    'Za automobile – Kozmetika i ulja': { quickFilters: [], booleanFilters: [] },
    'Za motocikle – Motor i transmisija': { quickFilters: [...DIJELOVI_MOTO], booleanFilters: [] },
    'Za motocikle – Elektrika i paljenje': { quickFilters: [...DIJELOVI_MOTO], booleanFilters: [] },
    'Za motocikle – Ovjes i kočnice': { quickFilters: [...DIJELOVI_MOTO], booleanFilters: [] },
    'Za motocikle – Koferi, torbe i nosači': { quickFilters: [...DIJELOVI_MOTO], booleanFilters: [] },
    'Za motocikle – Karoserija i oklopi': { quickFilters: [...DIJELOVI_MOTO, BOJA_SELECT], booleanFilters: [] },
    'Za motocikle – Felge i gume': {
      quickFilters: [
        { key: 'dimenzija', label: 'Dimenzija', type: 'text' },
        { key: 'sezona', label: 'Sezona', type: 'select', options: ['Ljetne', 'Zimske'] },
      ],
      booleanFilters: [],
    },
    'Za motocikle – Zaštitna oprema i odjeća': {
      quickFilters: [
        { key: 'velicina', label: 'Veličina', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
      ],
      booleanFilters: [],
    },
    'Za bicikle – Dijelovi': { quickFilters: [], booleanFilters: [] },
    'Za teretna vozila': {
      quickFilters: [
        { key: 'markaVozila', label: 'Marka vozila', type: 'autocomplete' },
        { key: 'model', label: 'Model', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Za autobuse i minibuse': {
      quickFilters: [
        { key: 'markaVozila', label: 'Marka vozila', type: 'autocomplete' },
      ],
      booleanFilters: [],
    },
    'Za nautiku i plovila': {
      quickFilters: [
        { key: 'tipPlovila', label: 'Tip plovila', type: 'text' },
        { key: 'markaMotora', label: 'Marka motora', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Za kampere i prikolice': {
      quickFilters: [
        { key: 'marka', label: 'Marka', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Za ATV / Quad': {
      quickFilters: [
        { key: 'marka', label: 'Marka', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Za građevinske strojeve': {
      quickFilters: [
        { key: 'marka', label: 'Marka', type: 'text' },
        { key: 'tipStroja', label: 'Tip stroja', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Za prikolice (dijelovi)': { quickFilters: [], booleanFilters: [] },
    'Ostali dijelovi za vozila': { quickFilters: [], booleanFilters: [] },
  },
};

// ── 3. NEKRETNINE ───────────────────────────────────────────────

const GRIJANJE_SELECT: QuickFilter = { key: 'grijanje', label: 'Grijanje', type: 'select', options: ['Centralno', 'Etažno plin', 'Etažno struja', 'Na drva', 'Klima', 'Podno', 'Bez'] };
const PARKING_SELECT: QuickFilter = { key: 'parking', label: 'Parking', type: 'select', options: ['Nema', 'Ulična', 'Garaža', 'Parkiralište'] };
const ENERGETSKI_SELECT: QuickFilter = { key: 'energetskirazred', label: 'Energetski razred', type: 'select', options: ['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'] };
const NAMJESTENOST_SELECT: QuickFilter = { key: 'namjestenost', label: 'Namještenost', type: 'select', options: ['Namješten', 'Polunamješten', 'Nenamješten'] };

const STANOVI_CONFIG: SubcategoryFilterConfig = {
  quickFilters: [
    { key: 'povrsina', label: 'Površina m²', type: 'range', range: [10, 500], unit: 'm²' },
    { key: 'brojSoba', label: 'Broj soba', type: 'select', options: ['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5+'] },
    { key: 'brojKupatila', label: 'Broj kupatila', type: 'select', options: ['1', '2', '3', '4', '5+'] },
    { key: 'kat', label: 'Kat/Sprat', type: 'select', options: ['Prizemlje', '1', '2', '3', '4', '5+'] },
    GRIJANJE_SELECT,
    NAMJESTENOST_SELECT,
    PARKING_SELECT,
    ENERGETSKI_SELECT,
  ],
  booleanFilters: [
    { key: 'lift', label: 'Lift' },
    { key: 'balkon', label: 'Balkon/Terasa' },
    { key: 'klimatizovano', label: 'Klima uređaj' },
    { key: 'internet', label: 'Internet/Kabel' },
    { key: 'podrum', label: 'Podrum' },
    { key: 'alarm', label: 'Alarmni sustav' },
    { key: 'blindiranaVrata', label: 'Blindirana vrata' },
    { key: 'videoNadzor', label: 'Video nadzor' },
    { key: 'uknjizeno', label: 'Uknjiženo/ZK' },
  ],
};

const NEKRETNINE_FILTERS: CategoryFilterConfig = {
  categoryName: 'Nekretnine',
  quickFilters: [
    { key: 'povrsina', label: 'Površina m²', type: 'range', range: [10, 1000], unit: 'm²' },
    { key: 'brojSoba', label: 'Broj soba', type: 'select', options: ['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5+'] },
  ],
  booleanFilters: [],
  subcategoryFilters: {
    'Stanovi': STANOVI_CONFIG,
    'Kuće': {
      quickFilters: [
        { key: 'povrsina', label: 'Površina m²', type: 'range', range: [30, 2000], unit: 'm²' },
        { key: 'povrsinaZemljista', label: 'Površina zemljišta m²', type: 'range', range: [100, 10000], unit: 'm²' },
        { key: 'brojSoba', label: 'Broj soba', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8+'] },
        { key: 'brojKupatila', label: 'Broj kupatila', type: 'select', options: ['1', '2', '3', '4', '5+'] },
        { key: 'brojEtaza', label: 'Broj etaža', type: 'select', options: ['1', '2', '3', '4+'] },
        GRIJANJE_SELECT,
        PARKING_SELECT,
        ENERGETSKI_SELECT,
      ],
      booleanFilters: [
        { key: 'garaza', label: 'Garaža' },
        { key: 'dvoriste', label: 'Dvorište' },
        { key: 'bazen', label: 'Bazen' },
        { key: 'klimatizovano', label: 'Klima uređaj' },
        { key: 'uknjizeno', label: 'Uknjiženo/ZK' },
      ],
    },
    'Zemljišta': {
      quickFilters: [
        { key: 'povrsina', label: 'Površina m²', type: 'range', range: [100, 100000], unit: 'm²' },
        { key: 'namjena', label: 'Namjena', type: 'select', options: ['Građevinsko', 'Poljoprivredno', 'Šumsko', 'Ostalo'] },
        { key: 'pristupniPut', label: 'Pristupni put', type: 'select', options: ['Da', 'Ne'] },
      ],
      booleanFilters: [
        { key: 'uknjizeno', label: 'Uknjiženo/ZK' },
        { key: 'komunalije', label: 'Komunalije (voda/struja)' },
      ],
    },
    'Poslovni prostori': {
      quickFilters: [
        { key: 'povrsina', label: 'Površina m²', type: 'range', range: [10, 5000], unit: 'm²' },
        { key: 'kat', label: 'Kat/Sprat', type: 'select', options: ['Prizemlje', '1', '2', '3', '4', '5+'] },
        { key: 'namjena', label: 'Namjena', type: 'select', options: ['Ured', 'Ugostiteljstvo', 'Skladište', 'Industrijski', 'Hala'] },
        PARKING_SELECT,
      ],
      booleanFilters: [
        { key: 'lift', label: 'Lift' },
        { key: 'klimatizovano', label: 'Klima uređaj' },
        { key: 'uknjizeno', label: 'Uknjiženo/ZK' },
      ],
    },
    'Garaže i parkirna mjesta': {
      quickFilters: [
        { key: 'povrsina', label: 'Površina m²', type: 'range', range: [5, 100], unit: 'm²' },
        { key: 'tip', label: 'Tip', type: 'select', options: ['Garaža', 'Parkirno mjesto'] },
      ],
      booleanFilters: [],
    },
    'Turistički smještaj': {
      quickFilters: [
        { key: 'povrsina', label: 'Površina m²', type: 'range', range: [10, 500], unit: 'm²' },
        { key: 'brojSoba', label: 'Broj soba', type: 'select', options: ['1', '2', '3', '4', '5+'] },
        { key: 'brojLezajeva', label: 'Broj ležajeva', type: 'select', options: ['1', '2', '3', '4', '5', '6+'] },
        NAMJESTENOST_SELECT,
      ],
      booleanFilters: [
        { key: 'klimatizovano', label: 'Klima uređaj' },
        { key: 'wifi', label: 'WiFi' },
        { key: 'parking', label: 'Parking' },
        { key: 'balkon', label: 'Balkon' },
      ],
    },
    'Luksuzne nekretnine': STANOVI_CONFIG,
    'Ostale nekretnine': {
      quickFilters: [
        { key: 'povrsina', label: 'Površina m²', type: 'range', range: [10, 10000], unit: 'm²' },
      ],
      booleanFilters: [],
    },
  },
};

// ── 4. MOBITELI I OPREMA ────────────────────────────────────────

const MOBITELI_FILTERS: CategoryFilterConfig = {
  categoryName: 'Mobiteli i oprema',
  quickFilters: [STANJE_SELECT],
  booleanFilters: [],
  subcategoryFilters: {
    'Mobiteli – Samsung': { quickFilters: [...MOBITEL_STANDARD_QUICK], booleanFilters: [...MOBITEL_STANDARD_BOOL] },
    'Mobiteli – Xiaomi / Redmi / POCO': { quickFilters: [...MOBITEL_STANDARD_QUICK], booleanFilters: [...MOBITEL_STANDARD_BOOL] },
    'Mobiteli – Huawei / Honor': { quickFilters: [...MOBITEL_STANDARD_QUICK], booleanFilters: [...MOBITEL_STANDARD_BOOL] },
    'Mobiteli – OnePlus / Oppo / Realme': { quickFilters: [...MOBITEL_STANDARD_QUICK], booleanFilters: [...MOBITEL_STANDARD_BOOL] },
    'Mobiteli – Nokia / Motorola / Sony': { quickFilters: [...MOBITEL_STANDARD_QUICK], booleanFilters: [...MOBITEL_STANDARD_BOOL] },
    'Mobiteli – Ostale marke': { quickFilters: [...MOBITEL_STANDARD_QUICK], booleanFilters: [...MOBITEL_STANDARD_BOOL] },
    'Mobiteli – Apple iPhone': {
      quickFilters: [
        { key: 'memorija', label: 'Memorija', type: 'select', options: ['64GB', '128GB', '256GB', '512GB', '1TB'] },
        { ...BOJA_SELECT, options: ['Crna', 'Bijela', 'Siva', 'Srebrna', 'Plava', 'Crvena', 'Zelena', 'Zlatna', 'Roza', 'Ljubičasta', 'Ostalo'] },
        { key: 'zdravljeBaterije', label: 'Zdravlje baterije', type: 'select', options: ['100%', '95-99%', '90-94%', '85-89%', '80-84%', '<80%'] },
        { key: 'stanjeEkrana', label: 'Stanje ekrana', type: 'select', options: ['Savršeno', 'Sitne ogrebotine', 'Vidljive ogrebotine', 'Napuknuće', 'Zamijenjen ekran'] },
      ],
      booleanFilters: [...MOBITEL_STANDARD_BOOL],
    },
    'Tableti': {
      quickFilters: [
        { key: 'memorija', label: 'Memorija', type: 'select', options: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'] },
        { key: 'dijagonala', label: 'Dijagonala ekrana', type: 'select', options: ['7"', '8"', '10"', '11"', '12"+'] },
        { ...BOJA_SELECT, options: ['Crna', 'Bijela', 'Siva', 'Srebrna', 'Plava', 'Crvena', 'Zelena', 'Zlatna', 'Roza', 'Ljubičasta', 'Ostalo'] },
      ],
      booleanFilters: [...MOBITEL_STANDARD_BOOL],
    },
    'Pametni satovi i fitness narukvice': {
      quickFilters: [
        { key: 'marka', label: 'Marka', type: 'select', options: ['Apple', 'Samsung', 'Garmin', 'Huawei', 'Xiaomi', 'Ostalo'] },
        { ...BOJA_SELECT, options: ['Crna', 'Bijela', 'Siva', 'Srebrna', 'Plava', 'Crvena', 'Zelena', 'Zlatna', 'Roza', 'Ljubičasta', 'Ostalo'] },
      ],
      booleanFilters: [{ key: 'punjac', label: 'Punjač uključen' }],
    },
    'Slušalice i Bluetooth zvučnici': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['In-ear', 'Over-ear', 'Gaming headset', 'Bluetooth zvučnik'] },
        { key: 'marka', label: 'Marka', type: 'text' },
      ],
      booleanFilters: [{ key: 'bezicne', label: 'Bežične' }],
    },
    'Punjači, powerbanke i kabeli': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Punjač', 'Powerbanka', 'Kabel'] },
        { key: 'prikljucak', label: 'Priključak', type: 'select', options: ['USB-C', 'Lightning', 'Micro USB'] },
      ],
      booleanFilters: [],
    },
    'Maske, stakla i zaštitne folije': {
      quickFilters: [
        { key: 'modelTelefona', label: 'Model telefona', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Dijelovi mobitela (ekrani, baterije...)': {
      quickFilters: [
        { key: 'modelTelefona', label: 'Model telefona', type: 'text' },
        { key: 'tipDijela', label: 'Tip dijela', type: 'select', options: ['Ekran', 'Baterija', 'Kamera', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Ostala mobilna oprema': { quickFilters: [], booleanFilters: [] },
  },
};

// ── 5. RAČUNALA I IT ────────────────────────────────────────────

const RACUNALA_FILTERS: CategoryFilterConfig = {
  categoryName: 'Računala i IT',
  quickFilters: [STANJE_SELECT],
  booleanFilters: [],
  subcategoryFilters: {
    'Laptopi': {
      quickFilters: [
        { key: 'ram', label: 'RAM', type: 'select', options: ['4GB', '8GB', '16GB', '32GB', '64GB'] },
        { key: 'ssd', label: 'SSD', type: 'select', options: ['128GB', '256GB', '512GB', '1TB', '2TB'] },
        { key: 'dijagonala', label: 'Dijagonala', type: 'select', options: ['13"', '14"', '15"', '16"', '17"'] },
        { key: 'procesor', label: 'Procesor', type: 'select', options: ['Intel', 'AMD', 'Apple M'] },
        { key: 'gpu', label: 'GPU', type: 'text' },
        { key: 'marka', label: 'Marka', type: 'select', options: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Ostalo'] },
      ],
      booleanFilters: [
        { key: 'touchscreen', label: 'Touchscreen' },
        { key: 'ostecen', label: 'Oštećen' },
      ],
    },
    'Desktop računala': {
      quickFilters: [
        { key: 'ram', label: 'RAM', type: 'select', options: ['4GB', '8GB', '16GB', '32GB', '64GB'] },
        { key: 'ssd', label: 'SSD', type: 'select', options: ['128GB', '256GB', '512GB', '1TB', '2TB'] },
        { key: 'procesor', label: 'Procesor', type: 'select', options: ['Intel', 'AMD'] },
        { key: 'gpu', label: 'GPU', type: 'text' },
        { key: 'marka', label: 'Marka', type: 'text' },
      ],
      booleanFilters: [{ key: 'ostecen', label: 'Oštećen' }],
    },
    'Monitori': {
      quickFilters: [
        { key: 'dijagonala', label: 'Dijagonala', type: 'select', options: ['22"', '24"', '27"', '32"', '34"+'] },
        { key: 'rezolucija', label: 'Rezolucija', type: 'select', options: ['FHD', 'QHD', '4K'] },
        { key: 'panel', label: 'Panel', type: 'select', options: ['IPS', 'VA', 'TN', 'OLED'] },
        { key: 'refreshRate', label: 'Refresh rate', type: 'select', options: ['60Hz', '75Hz', '144Hz', '165Hz', '240Hz+'] },
        { key: 'tip', label: 'Tip', type: 'select', options: ['Standardni', 'Ultrawide', 'Zakrivljeni'] },
      ],
      booleanFilters: [],
    },
    'Komponente': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['GPU', 'CPU', 'RAM', 'SSD', 'HDD', 'Matična ploča', 'Kućište', 'PSU', 'Hlađenje'] },
      ],
      booleanFilters: [],
    },
    'Mrežna oprema': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Router', 'Switch', 'NAS', 'WiFi extender', 'Mrežna kartica'] },
      ],
      booleanFilters: [],
    },
    'Printeri i skeneri': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Inkjet', 'Laser', '3D', 'Multifunkcijski'] },
        { key: 'marka', label: 'Marka', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Serveri': {
      quickFilters: [
        { key: 'ram', label: 'RAM', type: 'select', options: ['8GB', '16GB', '32GB', '64GB', '128GB+'] },
        { key: 'brojProcesora', label: 'Broj procesora', type: 'select', options: ['1', '2', '4'] },
        { key: 'kapacitetDiska', label: 'Kapacitet diska', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Softver i licence': {
      quickFilters: [
        { key: 'platforma', label: 'Platforma', type: 'select', options: ['Windows', 'Mac', 'Linux'] },
        { key: 'tip', label: 'Tip', type: 'select', options: ['Operativni sustav', 'Office', 'Antivirus', 'Profesionalni', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Gaming i konzole': {
      quickFilters: [
        { key: 'platforma', label: 'Platforma', type: 'select', options: ['PS4', 'PS5', 'Xbox One', 'Xbox Series', 'Nintendo Switch', 'PC', 'VR', 'Retro'] },
      ],
      booleanFilters: [],
    },
    'Dronovi i oprema': {
      quickFilters: [
        { key: 'marka', label: 'Marka', type: 'select', options: ['DJI', 'Ostalo'] },
        { key: 'tip', label: 'Tip', type: 'select', options: ['Kamera', 'FPV', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Ostala IT oprema': { quickFilters: [], booleanFilters: [] },
  },
};

// ── 6. TEHNIKA I ELEKTRONIKA ────────────────────────────────────

const TEHNIKA_FILTERS: CategoryFilterConfig = {
  categoryName: 'Tehnika i elektronika',
  quickFilters: [
    { key: 'marka', label: 'Marka', type: 'text' },
    STANJE_SELECT,
  ],
  booleanFilters: [],
  subcategoryFilters: {
    'Televizori': {
      quickFilters: [
        { key: 'dijagonala', label: 'Dijagonala', type: 'select', options: ['32"', '40"', '43"', '50"', '55"', '65"', '75"+'] },
        { key: 'tip', label: 'Tip', type: 'select', options: ['LED', 'QLED', 'OLED'] },
        { key: 'rezolucija', label: 'Rezolucija', type: 'select', options: ['HD', 'FHD', '4K', '8K'] },
        { key: 'marka', label: 'Marka', type: 'select', options: ['Samsung', 'LG', 'Sony', 'Hisense', 'TCL', 'Philips', 'Ostalo'] },
      ],
      booleanFilters: [{ key: 'smartTv', label: 'Smart TV' }],
    },
    'Audio oprema': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Zvučnici', 'Soundbar', 'Pojačalo', 'Gramofon', 'Slušalice'] },
        { key: 'marka', label: 'Marka', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Foto i video oprema': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['DSLR', 'Mirrorless', 'Kompaktni', 'Action kamera', 'Video kamera', 'Objektiv', 'Stativ'] },
        { key: 'marka', label: 'Marka', type: 'select', options: ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'GoPro', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Bijela tehnika': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Perilica rublja', 'Sušilica', 'Perilica posuđa', 'Hladnjak', 'Štednjak', 'Pećnica', 'Mikrovalna', 'Klima'] },
        { key: 'marka', label: 'Marka', type: 'text' },
        { key: 'energetskirazred', label: 'Energetski razred', type: 'select', options: ['A+++', 'A++', 'A+', 'A', 'B', 'C'] },
      ],
      booleanFilters: [],
    },
    'Mali kućanski aparati': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Usisavač', 'Aparat za kavu', 'Blender', 'Glačalo', 'Robotski usisavač', 'Ostalo'] },
        { key: 'marka', label: 'Marka', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Smart home i IoT': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Kamera', 'Žarulja', 'Termostat', 'Brava', 'Prekidač', 'Hub'] },
        { key: 'marka', label: 'Marka', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Solarna i alternativna energija': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Solarne ploče', 'Inverter', 'Baterija', 'Vjetroturbina'] },
        { key: 'snaga', label: 'Snaga', type: 'range', range: [0, 10000], unit: 'W' },
      ],
      booleanFilters: [],
    },
    'Medicinska oprema': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Mjerač tlaka', 'Termometar', 'Inhalator', 'Invalidska kolica', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Ostala tehnika': { quickFilters: [], booleanFilters: [] },
  },
};

// ── 7. DOM I VRTNE GARNITURE ────────────────────────────────────

const BOJA_DOM: QuickFilter = { key: 'boja', label: 'Boja', type: 'select', options: ['Crna', 'Bijela', 'Siva', 'Srebrna', 'Crvena', 'Plava', 'Zelena', 'Narančasta', 'Zlatna', 'Smeđa', 'Bež', 'Ostalo'] };
const MATERIJAL_SELECT: QuickFilter = { key: 'materijal', label: 'Materijal', type: 'select', options: ['Drvo', 'Staklo', 'Metal', 'MDF', 'Ostalo'] };

const DOM_FILTERS: CategoryFilterConfig = {
  categoryName: 'Dom i vrtne garniture',
  quickFilters: [STANJE_SELECT],
  booleanFilters: [],
  subcategoryFilters: {
    'Namještaj – Dnevna soba': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Sofa', 'Fotelja', 'Stol', 'TV komoda', 'Polica', 'Vitrina'] },
        MATERIJAL_SELECT,
        BOJA_DOM,
      ],
      booleanFilters: [],
    },
    'Namještaj – Spavaća soba': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Krevet', 'Madrac', 'Noćni ormarić', 'Ormar', 'Toaletni stol'] },
        { key: 'dimKreveta', label: 'Dimenzija kreveta', type: 'select', options: ['90x200', '140x200', '160x200', '180x200', '200x200'] },
        BOJA_DOM,
      ],
      booleanFilters: [],
    },
    'Namještaj – Kuhinja i blagovaonica': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Kuhinjska garnitura', 'Stol', 'Stolice', 'Barski stolac', 'Polica'] },
        MATERIJAL_SELECT,
        BOJA_DOM,
      ],
      booleanFilters: [],
    },
    'Namještaj – Dječja soba': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Krevetić', 'Krevet na kat', 'Stol', 'Stolica', 'Ormar', 'Polica'] },
        BOJA_DOM,
      ],
      booleanFilters: [],
    },
    'Namještaj – Radna soba i ured': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Radni stol', 'Uredska stolica', 'Ormar', 'Polica', 'Konferencijski stol'] },
      ],
      booleanFilters: [],
    },
    'Namještaj – Kupaonica': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Ormarić', 'Ogledalo', 'Polica'] },
      ],
      booleanFilters: [],
    },
    'Rasvjeta': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Luster', 'Podna lampa', 'Stolna lampa', 'Zidna', 'LED traka', 'Vanjska'] },
      ],
      booleanFilters: [],
    },
    'Tepisi, zavjese i tekstil': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Tepih', 'Zavjesa', 'Posteljina', 'Deka', 'Jastuk', 'Ručnik'] },
        { key: 'dimenzija', label: 'Dimenzija', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Dekoracije i ukrasi': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Slika', 'Vaza', 'Svjećnjak', 'Sat', 'Figura', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Grijanje i hlađenje': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Klima', 'Peć na drva', 'Peć na pelete', 'Radijator', 'Bojler', 'Ventilator'] },
        { key: 'snaga', label: 'Snaga kW', type: 'range', range: [0, 50], unit: 'kW' },
      ],
      booleanFilters: [],
    },
    'Vrt i balkon': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Vrtni namještaj', 'Roštilj', 'Alat', 'Biljke', 'Sjemenke', 'Saksije', 'Fontana', 'Ljuljačka'] },
      ],
      booleanFilters: [],
    },
    'Bazeni, jacuzzi i saune': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Bazen', 'Jacuzzi', 'Sauna finska', 'Sauna infracrvena', 'Oprema'] },
      ],
      booleanFilters: [],
    },
    'Sigurnosni sustavi': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Kamera', 'Alarm', 'Pametna brava', 'Vatrodojava'] },
      ],
      booleanFilters: [],
    },
    'Vodoinstalacije i sanitarije': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Slavina', 'Kada', 'Tuš kabina', 'WC', 'Sudoper', 'Bojler', 'Cijev', 'Filter'] },
      ],
      booleanFilters: [],
    },
    'Alati i pribor za dom': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Bušilica', 'Brusilica', 'Pila', 'Čekić', 'Ključevi', 'Mjerni alat'] },
      ],
      booleanFilters: [],
    },
    'Ostalo za dom': { quickFilters: [], booleanFilters: [] },
  },
};

// ── 8. ODJEĆA I OBUĆA ──────────────────────────────────────────

const BOJA_ODJECA: QuickFilter = { key: 'boja', label: 'Boja', type: 'select', options: ['Crna', 'Bijela', 'Siva', 'Crvena', 'Plava', 'Zelena', 'Roza', 'Bež', 'Smeđa', 'Narančasta', 'Ostalo'] };
const SEZONA_SELECT: QuickFilter = { key: 'sezona', label: 'Sezona', type: 'select', options: ['Proljeće-Ljeto', 'Jesen-Zima', 'Sva godišnja doba'] };

const ODJECA_FILTERS: CategoryFilterConfig = {
  categoryName: 'Odjeća i obuća',
  quickFilters: [
    { key: 'velicina', label: 'Veličina', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    BOJA_ODJECA,
    STANJE_SELECT,
  ],
  booleanFilters: [],
  subcategoryFilters: {
    'Ženska odjeća': {
      quickFilters: [
        { key: 'velicina', label: 'Veličina', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '34', '36', '38', '40', '42', '44', '46', '48'] },
        BOJA_ODJECA,
        SEZONA_SELECT,
        { key: 'stil', label: 'Stil', type: 'select', options: ['Casual', 'Business', 'Svečano', 'Sport'] },
      ],
      booleanFilters: [],
    },
    'Ženska obuća': {
      quickFilters: [
        { key: 'velicina', label: 'Veličina', type: 'select', options: ['35', '36', '37', '38', '39', '40', '41', '42'] },
        BOJA_ODJECA,
        { key: 'tip', label: 'Tip', type: 'select', options: ['Tenisice', 'Štikle', 'Ravne cipele', 'Čizme', 'Sandale', 'Natikače', 'Kućna'] },
      ],
      booleanFilters: [],
    },
    'Muška odjeća': {
      quickFilters: [
        { key: 'velicina', label: 'Veličina', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '44', '46', '48', '50', '52', '54', '56', '58'] },
        BOJA_ODJECA,
        SEZONA_SELECT,
        { key: 'stil', label: 'Stil', type: 'select', options: ['Casual', 'Business', 'Svečano', 'Sport'] },
      ],
      booleanFilters: [],
    },
    'Muška obuća': {
      quickFilters: [
        { key: 'velicina', label: 'Veličina', type: 'select', options: ['39', '40', '41', '42', '43', '44', '45', '46', '47'] },
        BOJA_ODJECA,
        { key: 'tip', label: 'Tip', type: 'select', options: ['Tenisice', 'Elegantne', 'Čizme', 'Ljetna', 'Kućna'] },
      ],
      booleanFilters: [],
    },
    'Dječja odjeća i obuća': {
      quickFilters: [
        { key: 'uzrast', label: 'Uzrast', type: 'select', options: ['0-2god', '3-8god', '9-14god', '15+'] },
        { key: 'velicina', label: 'Veličina', type: 'text' },
        BOJA_ODJECA,
      ],
      booleanFilters: [],
    },
    'Sportska odjeća i obuća (svi)': {
      quickFilters: [
        { key: 'velicina', label: 'Veličina', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
        BOJA_ODJECA,
        { key: 'sport', label: 'Sport', type: 'select', options: ['Nogomet', 'Trčanje', 'Fitness', 'Skijanje', 'Plivanje', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Nakit i satovi': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Ogrlica', 'Narukvica', 'Prsten', 'Naušnice', 'Sat muški', 'Sat ženski'] },
        { key: 'materijal', label: 'Materijal', type: 'select', options: ['Zlato', 'Srebro', 'Čelik', 'Bižuterija'] },
      ],
      booleanFilters: [],
    },
    'Torbe, novčanici i ruksaci': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Ručna torbica', 'Ruksak', 'Novčanik', 'Putna torba', 'Sportska torba'] },
        BOJA_ODJECA,
      ],
      booleanFilters: [],
    },
    'Naočale': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Sunčane', 'Dioptrijske', 'Okviri'] },
        { key: 'marka', label: 'Marka', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Radna i zaštitna odjeća': {
      quickFilters: [
        { key: 'velicina', label: 'Veličina', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
      ],
      booleanFilters: [],
    },
    'Maškare i kostimi': {
      quickFilters: [
        { key: 'velicina', label: 'Veličina', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
      ],
      booleanFilters: [],
    },
    'Ostala odjeća i dodaci': { quickFilters: [], booleanFilters: [] },
  },
};

// ── 9. SPORT I REKREACIJA ───────────────────────────────────────

const SPORT_FILTERS: CategoryFilterConfig = {
  categoryName: 'Sport i rekreacija',
  quickFilters: [STANJE_SELECT],
  booleanFilters: [],
  subcategoryFilters: {
    'Fitness i teretana': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Bučice', 'Klupa', 'Traka za trčanje', 'Ergometar', 'Crosstrainer', 'Veslač', 'Višefunkcionalna sprava', 'Yoga oprema', 'Dodaci prehrani'] },
      ],
      booleanFilters: [],
    },
    'Biciklizam (oprema)': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Kaciga', 'Odjeća', 'Naočale', 'GPS', 'Sjedalica', 'Košare i tašne'] },
      ],
      booleanFilters: [],
    },
    'Nogomet': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Kopačke', 'Lopta', 'Dres', 'Golovi', 'Štitnici'] },
        { key: 'velicina', label: 'Veličina', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Košarka, rukomet i ostali timski sportovi': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Lopta', 'Obuća', 'Dres', 'Oprema'] },
        { key: 'velicina', label: 'Veličina', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Tenis i badminton': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Reket', 'Lopta', 'Mreža', 'Obuća', 'Torba'] },
      ],
      booleanFilters: [],
    },
    'Zimski sportovi': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Skije', 'Snowboard', 'Klizaljke', 'Sanjke', 'Kaciga', 'Naočale', 'Obuća', 'Odjeća'] },
        { key: 'velicina', label: 'Veličina', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Vodeni sportovi': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Kajak', 'SUP', 'Ronilačka oprema', 'Neopren', 'Surf', 'Plivačke naočale'] },
        { key: 'velicina', label: 'Veličina', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Planinarenje i kampiranje': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Šator', 'Ruksak', 'Vreća za spavanje', 'Cipele', 'Štapovi', 'Kuhalo', 'GPS'] },
        { key: 'velicina', label: 'Veličina', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Ribolov': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Štap', 'Mašinica', 'Varalice', 'Ehosonda', 'Čamac', 'Odjeća', 'Torba'] },
      ],
      booleanFilters: [],
    },
    'Borilački sportovi': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Rukavice', 'Vreća', 'Kimono', 'Zaštitna oprema', 'Tatami'] },
        { key: 'velicina', label: 'Veličina', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Golf': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Palice', 'Torba', 'Loptica', 'Odjeća', 'Obuća'] },
      ],
      booleanFilters: [],
    },
    'Airsoft i paintball': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Oružje', 'Zaštitna oprema', 'Kuglice', 'Odjeća'] },
      ],
      booleanFilters: [],
    },
    'Koturaljke, skateboard i romobili': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Koturaljke', 'Skateboard', 'Romobil', 'Zaštitna oprema'] },
        { key: 'velicina', label: 'Veličina', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Sportski dresovi (kolekcija)': {
      quickFilters: [
        { key: 'sport', label: 'Sport', type: 'select', options: ['Nogomet', 'Košarka', 'Ostalo'] },
        { key: 'velicina', label: 'Veličina', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Ostala sportska oprema': { quickFilters: [], booleanFilters: [] },
  },
};

// ── 10. ODJEĆA ZA DJECU ────────────────────────────────────────

const DJECJI_FILTERS: CategoryFilterConfig = {
  categoryName: 'Odjeća za djecu',
  quickFilters: [
    { key: 'uzrast', label: 'Uzrast', type: 'select', options: ['0-6mj', '6-12mj', '1-2god', '2-4god', '4-6god', '6-10god', '10-14god'] },
    STANJE_SELECT,
  ],
  booleanFilters: [],
  subcategoryFilters: {
    'Oprema za bebe': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Kolica', 'Auto sjedalica', 'Krevetić', 'Hodalica', 'Hranilica', 'Kupaonice'] },
        { key: 'marka', label: 'Marka', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Dječje igračke': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['LEGO', 'Plišane', 'Figurice', 'Slagalice', 'RC', 'Kuhinje', 'Trampoline'] },
        { key: 'uzrast', label: 'Uzrast', type: 'select', options: ['0-6mj', '6-12mj', '1-2god', '2-4god', '4-6god', '6-10god', '10-14god'] },
      ],
      booleanFilters: [],
    },
    'Dječji bicikli, romobili i automobili': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Balans bicikl', 'Romobil', 'Električni auto', 'Quad', 'Skuter'] },
        { key: 'uzrast', label: 'Uzrast', type: 'select', options: ['0-6mj', '6-12mj', '1-2god', '2-4god', '4-6god', '6-10god', '10-14god'] },
      ],
      booleanFilters: [],
    },
    'Dječja odjeća (0–14 god)': {
      quickFilters: [
        { key: 'uzrast', label: 'Uzrast', type: 'select', options: ['0-6mj', '6-12mj', '1-2god', '2-4god', '4-6god', '6-10god', '10-14god'] },
        { key: 'velicina', label: 'Veličina', type: 'text' },
        { key: 'boja', label: 'Boja', type: 'select', options: ['Crna', 'Bijela', 'Siva', 'Crvena', 'Plava', 'Zelena', 'Roza', 'Ostalo'] },
        { key: 'spol', label: 'Spol', type: 'select', options: ['Dječak', 'Djevojčica', 'Unisex'] },
      ],
      booleanFilters: [],
    },
    'Dječje knjige i edukacija': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Slikovnica', 'Edukativna igra', 'Bojice', 'Školski pribor'] },
        { key: 'uzrast', label: 'Uzrast', type: 'select', options: ['0-6mj', '6-12mj', '1-2god', '2-4god', '4-6god', '6-10god', '10-14god'] },
      ],
      booleanFilters: [],
    },
    'Ostalo za djecu': {
      quickFilters: [
        { key: 'uzrast', label: 'Uzrast', type: 'select', options: ['0-6mj', '6-12mj', '1-2god', '2-4god', '4-6god', '6-10god', '10-14god'] },
      ],
      booleanFilters: [],
    },
  },
};

// ── 11. GLAZBA I GLAZBENI INSTRUMENTI ───────────────────────────

const GLAZBA_FILTERS: CategoryFilterConfig = {
  categoryName: 'Glazba i glazbeni instrumenti',
  quickFilters: [STANJE_SELECT],
  booleanFilters: [],
  subcategoryFilters: {
    'Gitare': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Akustična', 'Električna', 'Bas', 'Klasična'] },
        { key: 'marka', label: 'Marka', type: 'select', options: ['Fender', 'Gibson', 'Ibanez', 'Yamaha', 'Epiphone', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Bubnjevi i udaraljke': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Akustični', 'Elektronički', 'Cajon', 'Činele'] },
        { key: 'marka', label: 'Marka', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Klavijature i klaviri': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Digitalni klavir', 'Sintesajzer', 'Harmonika', 'Akustični klavir'] },
        { key: 'brojTipki', label: 'Broj tipki', type: 'select', options: ['61', '76', '88'] },
        { key: 'marka', label: 'Marka', type: 'select', options: ['Yamaha', 'Roland', 'Korg', 'Casio', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Puhački instrumenti': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Saksofon', 'Flauta', 'Klarinet', 'Truba', 'Trombon', 'Usna harmonika'] },
        { key: 'marka', label: 'Marka', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Gudački instrumenti': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Violina', 'Viola', 'Violončelo'] },
        { key: 'velicina', label: 'Veličina', type: 'select', options: ['1/4', '1/2', '3/4', '4/4'] },
      ],
      booleanFilters: [],
    },
    'Tamburice i folk instrumenti': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Tambura', 'Šargija', 'Saz', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'PA sustavi i ozvučenje': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Zvučnik', 'Pojačalo', 'Mikser', 'Mikrofon'] },
        { key: 'snaga', label: 'Snaga W', type: 'range', range: [0, 5000], unit: 'W' },
        { key: 'marka', label: 'Marka', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Studio oprema': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Audio sučelje', 'MIDI kontroler', 'Studio monitor', 'Snimačka kartica'] },
        { key: 'marka', label: 'Marka', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Scenska i DJ oprema': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['DJ mixer', 'Deck', 'Rasvjeta', 'Stroj za dim'] },
        { key: 'marka', label: 'Marka', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Ostali instrumenti i oprema': { quickFilters: [], booleanFilters: [] },
  },
};

// ── 12. LITERATURA I MEDIJI ─────────────────────────────────────

const JEZIK_SELECT: QuickFilter = { key: 'jezik', label: 'Jezik', type: 'select', options: ['Bosanski', 'Hrvatski', 'Srpski', 'Engleski', 'Njemački', 'Ostalo'] };
const PISMO_SELECT: QuickFilter = { key: 'pismo', label: 'Pismo', type: 'select', options: ['Latinica', 'Ćirilica'] };

const LITERATURA_FILTERS: CategoryFilterConfig = {
  categoryName: 'Literatura i mediji',
  quickFilters: [STANJE_SELECT],
  booleanFilters: [],
  subcategoryFilters: {
    'Knjige – Beletristika': {
      quickFilters: [
        { key: 'zanr', label: 'Žanr', type: 'select', options: ['Roman', 'Kriminalistički', 'Sci-fi i fantasy', 'Ljubavni', 'Povijesni', 'Horror', 'Humor'] },
        JEZIK_SELECT,
        PISMO_SELECT,
      ],
      booleanFilters: [],
    },
    'Knjige – Stručna literatura': {
      quickFilters: [
        { key: 'podrucje', label: 'Područje', type: 'select', options: ['IT', 'Medicina', 'Pravo', 'Psihologija', 'Filozofija', 'Inženjerstvo', 'Arhitektura'] },
        JEZIK_SELECT,
        PISMO_SELECT,
      ],
      booleanFilters: [],
    },
    'Knjige – Dječje i školske': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Slikovnica', 'Dječji roman', 'Enciklopedija', 'Udžbenik'] },
        { key: 'uzrast', label: 'Uzrast', type: 'text' },
        JEZIK_SELECT,
      ],
      booleanFilters: [],
    },
    'Antikvarne i stare knjige': {
      quickFilters: [JEZIK_SELECT, PISMO_SELECT],
      booleanFilters: [],
    },
    'Časopisi i magazini': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Auto', 'IT', 'Moda', 'Sport', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Stripovi i manga': {
      quickFilters: [JEZIK_SELECT],
      booleanFilters: [],
    },
    'Filmovi i serije (DVD/Blu-ray)': {
      quickFilters: [
        { key: 'format', label: 'Format', type: 'select', options: ['DVD', 'Blu-ray'] },
        { key: 'zanr', label: 'Žanr', type: 'select', options: ['Akcija', 'Komedija', 'Drama', 'Horor', 'Sci-fi', 'Dokumentarni', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Glazba (CD, vinil, kasete)': {
      quickFilters: [
        { key: 'format', label: 'Format', type: 'select', options: ['CD', 'Vinil', 'Kaseta'] },
        { key: 'zanr', label: 'Žanr', type: 'select', options: ['Rock', 'Pop', 'Hip-hop', 'Elektronska', 'Jazz', 'Klasična', 'Folk', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
  },
};

// ── 13. VIDEOIGRE ───────────────────────────────────────────────

const ZANR_IGRE: QuickFilter = { key: 'zanr', label: 'Žanr', type: 'select', options: ['Akcija', 'Sport', 'RPG', 'FPS', 'Racing', 'Avantura', 'Ostalo'] };

const VIDEOIGRE_FILTERS: CategoryFilterConfig = {
  categoryName: 'Videoigre',
  quickFilters: [
    { key: 'platforma', label: 'Platforma', type: 'select', options: ['PlayStation', 'Xbox', 'Nintendo', 'PC', 'Retro'] },
    STANJE_SELECT,
  ],
  booleanFilters: [],
  subcategoryFilters: {
    'PlayStation': {
      quickFilters: [
        { key: 'generacija', label: 'Generacija', type: 'select', options: ['PS3 i stariji', 'PS4', 'PS5'] },
        ZANR_IGRE,
      ],
      booleanFilters: [],
    },
    'Xbox': {
      quickFilters: [
        { key: 'generacija', label: 'Generacija', type: 'select', options: ['Xbox One', 'Xbox Series X|S'] },
        ZANR_IGRE,
      ],
      booleanFilters: [],
    },
    'Nintendo': {
      quickFilters: [
        { key: 'generacija', label: 'Generacija', type: 'select', options: ['DS', '3DS', 'Wii', 'WiiU', 'Switch'] },
        ZANR_IGRE,
      ],
      booleanFilters: [],
    },
    'PC igre': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Digitalni ključ', 'Fizička kopija'] },
        ZANR_IGRE,
      ],
      booleanFilters: [],
    },
    'Retro igre i konzole': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Konzola', 'Igra'] },
        { key: 'platforma', label: 'Platforma', type: 'select', options: ['NES', 'SNES', 'Sega', 'GameBoy', 'PS1', 'PS2', 'N64', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Gaming oprema': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Gamepad', 'Miš', 'Tipkovnica', 'Slušalice', 'VR'] },
        { key: 'platforma', label: 'Platforma', type: 'select', options: ['PC', 'PlayStation', 'Xbox', 'Univerzalno'] },
      ],
      booleanFilters: [],
    },
  },
};

// ── 14. ŽIVOTINJE ───────────────────────────────────────────────

const ZIVOTINJE_FILTERS: CategoryFilterConfig = {
  categoryName: 'Životinje',
  quickFilters: [],
  booleanFilters: [],
  subcategoryFilters: {
    'Psi': {
      quickFilters: [
        { key: 'pasmina', label: 'Pasmina', type: 'text' },
        { key: 'spol', label: 'Spol', type: 'select', options: ['Mužjak', 'Ženka'] },
        { key: 'starost', label: 'Starost', type: 'select', options: ['Štene', 'Mlad', 'Odrastao', 'Senior'] },
      ],
      booleanFilters: [
        { key: 'sRodovnicom', label: 'S rodovnicom' },
        { key: 'vakcinisan', label: 'Vakcinisan' },
        { key: 'cipiran', label: 'Čipiran' },
      ],
    },
    'Mačke': {
      quickFilters: [
        { key: 'pasmina', label: 'Pasmina', type: 'text' },
        { key: 'spol', label: 'Spol', type: 'select', options: ['Mužjak', 'Ženka'] },
        { key: 'starost', label: 'Starost', type: 'select', options: ['Mače', 'Mlada', 'Odrasla', 'Senior'] },
      ],
      booleanFilters: [
        { key: 'cistokrvna', label: 'Čistokrvna' },
        { key: 'vakcinisana', label: 'Vakcinisana' },
        { key: 'cipirana', label: 'Čipirana' },
      ],
    },
    'Ptice i papige': {
      quickFilters: [
        { key: 'vrsta', label: 'Vrsta', type: 'text' },
        { key: 'spol', label: 'Spol', type: 'select', options: ['Mužjak', 'Ženka'] },
      ],
      booleanFilters: [],
    },
    'Glodavci (zečevi, zamorci, hrčci...)': {
      quickFilters: [
        { key: 'vrsta', label: 'Vrsta', type: 'select', options: ['Zec', 'Zamorac', 'Hrčak', 'Ostalo'] },
        { key: 'spol', label: 'Spol', type: 'select', options: ['Mužjak', 'Ženka'] },
      ],
      booleanFilters: [],
    },
    'Ribe i akvaristika': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Tropske ribe', 'Zlatne ribice', 'Akvarij', 'Oprema'] },
      ],
      booleanFilters: [],
    },
    'Terariji i gmizavci': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Gušter', 'Kornjača', 'Zmija', 'Terarij', 'Oprema'] },
      ],
      booleanFilters: [],
    },
    'Konji': {
      quickFilters: [
        { key: 'pasmina', label: 'Pasmina', type: 'text' },
        { key: 'spol', label: 'Spol', type: 'select', options: ['Mužjak', 'Ženka'] },
        { key: 'starost', label: 'Starost', type: 'select', options: ['Ždrijebe', 'Mlad', 'Odrastao'] },
      ],
      booleanFilters: [],
    },
    'Domaće životinje (krave, svinje, koze, ovce, perad...)': {
      quickFilters: [
        { key: 'vrsta', label: 'Vrsta', type: 'select', options: ['Krava', 'Svinja', 'Koza', 'Ovca', 'Perad', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Oprema za životinje': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Hrana', 'Igračke', 'Kućice', 'Njega', 'Ovratnici', 'Kavezi', 'Veterinar'] },
        { key: 'za', label: 'Za', type: 'select', options: ['Pse', 'Mačke', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Udomljavanje – psi': {
      quickFilters: [
        { key: 'spol', label: 'Spol', type: 'select', options: ['Mužjak', 'Ženka'] },
        { key: 'starost', label: 'Starost', type: 'select', options: ['Štene', 'Mlad', 'Odrastao', 'Senior'] },
      ],
      booleanFilters: [
        { key: 'vakcinisan', label: 'Vakcinisan' },
        { key: 'cipiran', label: 'Čipiran' },
      ],
    },
    'Udomljavanje – mačke': {
      quickFilters: [
        { key: 'spol', label: 'Spol', type: 'select', options: ['Mužjak', 'Ženka'] },
        { key: 'starost', label: 'Starost', type: 'select', options: ['Mače', 'Mlada', 'Odrasla', 'Senior'] },
      ],
      booleanFilters: [
        { key: 'vakcinisana', label: 'Vakcinisana' },
        { key: 'cipirana', label: 'Čipirana' },
      ],
    },
    'Udomljavanje – ostalo': {
      quickFilters: [
        { key: 'vrsta', label: 'Vrsta', type: 'text' },
      ],
      booleanFilters: [],
    },
  },
};

// ── 15. HRANA I PIĆE ────────────────────────────────────────────

const HRANA_FILTERS: CategoryFilterConfig = {
  categoryName: 'Hrana i piće',
  quickFilters: [],
  booleanFilters: [],
  subcategoryFilters: {
    'Biljni proizvodi': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Voće', 'Povrće', 'Brašno', 'Ostalo'] },
      ],
      booleanFilters: [
        { key: 'domace', label: 'Domaće' },
        { key: 'organsko', label: 'Organsko/Bio' },
      ],
    },
    'Dezerti i slastice': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Kolači', 'Torte', 'Džem', 'Grickalice', 'Ostalo'] },
      ],
      booleanFilters: [{ key: 'domace', label: 'Domaće' }],
    },
    'Pića': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Rakija', 'Vino', 'Pivo', 'Sok', 'Kafa', 'Čaj', 'Ostalo'] },
      ],
      booleanFilters: [{ key: 'domace', label: 'Domaće' }],
    },
    'Životinjski proizvodi': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Meso', 'Med', 'Jaja', 'Masti', 'Riba', 'Ostalo'] },
      ],
      booleanFilters: [
        { key: 'domace', label: 'Domaće' },
        { key: 'organsko', label: 'Organsko/Bio' },
      ],
    },
    'Mliječni proizvodi': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Sir', 'Mlijeko', 'Jogurt', 'Kajmak', 'Ostalo'] },
      ],
      booleanFilters: [{ key: 'domace', label: 'Domaće' }],
    },
    'Paketi proizvoda': { quickFilters: [], booleanFilters: [] },
    'Prerada hrane': { quickFilters: [], booleanFilters: [] },
    'Ulja i začini': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Maslinovo ulje', 'Ostala ulja', 'Začini'] },
      ],
      booleanFilters: [{ key: 'domace', label: 'Domaće' }],
    },
  },
};

// ── 16. STROJEVI I ALATI ────────────────────────────────────────

const STROJEVI_FILTERS: CategoryFilterConfig = {
  categoryName: 'Strojevi i alati',
  quickFilters: [
    STANJE_SELECT,
    { key: 'marka', label: 'Marka', type: 'text' },
  ],
  booleanFilters: [],
  subcategoryFilters: {
    'Ručni alati': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Čekić', 'Odvijač', 'Kliješta', 'Ključevi', 'Mjerači', 'Ostalo'] },
        { key: 'marka', label: 'Marka', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Električni alati': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Bušilica', 'Brusilica', 'Cirkularna pila', 'Ubodna pila', 'Kompresor', 'Pneumatski'] },
        { key: 'marka', label: 'Marka', type: 'select', options: ['Bosch', 'Makita', 'DeWalt', 'Hilti', 'Metabo', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Građevinski strojevi': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Mini bager', 'Utovarivač', 'Dizalica', 'Betonska miješalica', 'Vibracijska ploča', 'Kompresor'] },
        { key: 'marka', label: 'Marka', type: 'text' },
        { key: 'radniSati', label: 'Radni sati', type: 'range', range: [0, 20000], unit: 'h' },
      ],
      booleanFilters: [],
    },
    'Poljoprivredni strojevi': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Traktor', 'Kombajn', 'Kosilica', 'Priključak', 'Šprica', 'Cisterna'] },
        { key: 'marka', label: 'Marka', type: 'text' },
        { key: 'radniSati', label: 'Radni sati', type: 'range', range: [0, 20000], unit: 'h' },
        { key: 'snaga', label: 'Snaga KS', type: 'range', range: [0, 500], unit: 'KS' },
      ],
      booleanFilters: [],
    },
    'Vrtni strojevi': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Motorna kosilica', 'Ride-on kosilica', 'Motorna pila', 'Trimer', 'Šišač živice', 'Usisavač lišća'] },
        { key: 'marka', label: 'Marka', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Viljuškari i manipulacijska oprema': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Električni', 'Dizelski', 'Plinski'] },
        { key: 'marka', label: 'Marka', type: 'text' },
        { key: 'nosivost', label: 'Nosivost kg', type: 'range', range: [0, 10000], unit: 'kg' },
        { key: 'radniSati', label: 'Radni sati', type: 'range', range: [0, 20000], unit: 'h' },
      ],
      booleanFilters: [],
    },
    'Industrijski i prerađivački strojevi': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Obrada drva', 'Obrada metala', 'Obrada kamena', 'Pakovanje', 'Tekstil'] },
        { key: 'marka', label: 'Marka', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Ostali strojevi i alati': { quickFilters: [], booleanFilters: [] },
  },
};

// ── 17. POSLOVI ─────────────────────────────────────────────────

const POSLOVI_FILTERS: CategoryFilterConfig = {
  categoryName: 'Poslovi',
  quickFilters: [...POSLOVI_BASE],
  booleanFilters: [],
  subcategoryFilters: {
    'IT i telekomunikacije': {
      quickFilters: [
        ...POSLOVI_BASE,
        { key: 'rad', label: 'Rad', type: 'select', options: ['Remote', 'Hibrid', 'Ured'] },
        { key: 'oblast', label: 'Oblast', type: 'select', options: ['Frontend', 'Backend', 'Fullstack', 'Mobile', 'DevOps', 'QA', 'Data', 'Dizajn', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Građevinarstvo i geodezija': {
      quickFilters: [
        ...POSLOVI_BASE,
        { key: 'kategorija', label: 'Kategorija', type: 'select', options: ['Zidar', 'Tesar', 'Keramičar', 'Elektroinstalater', 'Vodoinstalater', 'Geodet', 'Arhitekt', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Promet, logistika i špedicija': {
      quickFilters: [
        { key: 'tipPosla', label: 'Tip posla', type: 'select', options: ['Puno radno vrijeme', 'Pola radnog vremena', 'Honorarno', 'Praksa'] },
        { key: 'iskustvo', label: 'Iskustvo', type: 'select', options: ['Bez iskustva', 'Junior', 'Mid', 'Senior'] },
        { key: 'vozacka', label: 'Vozačka', type: 'select', options: ['B', 'C', 'CE', 'D', 'Nema'] },
        { key: 'kategorija', label: 'Kategorija', type: 'select', options: ['Vozač', 'Skladištar', 'Špediter', 'Kurir', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Turizam i ugostiteljstvo': {
      quickFilters: [
        { key: 'tipPosla', label: 'Tip posla', type: 'select', options: ['Puno radno vrijeme', 'Pola radnog vremena', 'Honorarno', 'Praksa'] },
        { key: 'iskustvo', label: 'Iskustvo', type: 'select', options: ['Bez iskustva', 'Junior', 'Mid', 'Senior'] },
        { key: 'kategorija', label: 'Kategorija', type: 'select', options: ['Konobar', 'Kuhar', 'Recepcionar', 'Sobarica', 'Animator', 'Ostalo'] },
        { key: 'jezici', label: 'Jezici', type: 'select', options: ['Engleski', 'Njemački', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Zdravstvo i farmacija': {
      quickFilters: [
        ...POSLOVI_BASE,
        { key: 'kategorija', label: 'Kategorija', type: 'select', options: ['Doktor', 'Medicinska sestra', 'Farmaceut', 'Fizioterapeut', 'Stomatolog', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Obrazovanje i nauka': {
      quickFilters: [
        ...POSLOVI_BASE,
        { key: 'kategorija', label: 'Kategorija', type: 'select', options: ['Profesor', 'Učitelj', 'Asistent', 'Istraživač', 'Instruktor', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Financije i računovodstvo': {
      quickFilters: [
        ...POSLOVI_BASE,
        { key: 'kategorija', label: 'Kategorija', type: 'select', options: ['Računovođa', 'Revizor', 'Finansijski analitičar', 'Banka', 'Osiguranje', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Marketing i PR': {
      quickFilters: [
        { key: 'tipPosla', label: 'Tip posla', type: 'select', options: ['Puno radno vrijeme', 'Pola radnog vremena', 'Honorarno', 'Praksa'] },
        { key: 'iskustvo', label: 'Iskustvo', type: 'select', options: ['Bez iskustva', 'Junior', 'Mid', 'Senior'] },
        { key: 'rad', label: 'Rad', type: 'select', options: ['Remote', 'Hibrid', 'Ured'] },
        { key: 'kategorija', label: 'Kategorija', type: 'select', options: ['Social media', 'Content', 'SEO', 'Grafički dizajn', 'PR', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Prodaja i komercijala': {
      quickFilters: [
        { key: 'tipPosla', label: 'Tip posla', type: 'select', options: ['Puno radno vrijeme', 'Pola radnog vremena', 'Honorarno', 'Praksa'] },
        { key: 'iskustvo', label: 'Iskustvo', type: 'select', options: ['Bez iskustva', 'Junior', 'Mid', 'Senior'] },
        { key: 'kategorija', label: 'Kategorija', type: 'select', options: ['Trgovac', 'Komercijalista', 'Terenski prodavač', 'Voditelj prodaje', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Administracija i HR': {
      quickFilters: [
        ...POSLOVI_BASE,
        { key: 'kategorija', label: 'Kategorija', type: 'select', options: ['Administrator', 'Sekretar', 'HR', 'Pravnik', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Poljoprivreda i šumarstvo': {
      quickFilters: [
        { key: 'tipPosla', label: 'Tip posla', type: 'select', options: ['Puno radno vrijeme', 'Pola radnog vremena', 'Honorarno', 'Praksa'] },
        { key: 'iskustvo', label: 'Iskustvo', type: 'select', options: ['Bez iskustva', 'Junior', 'Mid', 'Senior'] },
        { key: 'kategorija', label: 'Kategorija', type: 'select', options: ['Agronom', 'Šumar', 'Radnik', 'Veterinar', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Elektrotehnika i strojarstvo': {
      quickFilters: [
        ...POSLOVI_BASE,
        { key: 'kategorija', label: 'Kategorija', type: 'select', options: ['Električar', 'Strojarski tehničar', 'Inženjer', 'Zavarivač', 'CNC operater', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Tekstilna industrija': {
      quickFilters: [
        { key: 'tipPosla', label: 'Tip posla', type: 'select', options: ['Puno radno vrijeme', 'Pola radnog vremena', 'Honorarno', 'Praksa'] },
        { key: 'iskustvo', label: 'Iskustvo', type: 'select', options: ['Bez iskustva', 'Junior', 'Mid', 'Senior'] },
        { key: 'kategorija', label: 'Kategorija', type: 'select', options: ['Šivač', 'Krojač', 'Dizajner', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Sigurnost i zaštita': {
      quickFilters: [
        { key: 'tipPosla', label: 'Tip posla', type: 'select', options: ['Puno radno vrijeme', 'Pola radnog vremena', 'Honorarno', 'Praksa'] },
        { key: 'iskustvo', label: 'Iskustvo', type: 'select', options: ['Bez iskustva', 'Junior', 'Mid', 'Senior'] },
        { key: 'kategorija', label: 'Kategorija', type: 'select', options: ['Zaštitar', 'Vatrogasac', 'Inspektor', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Ostali poslovi': {
      quickFilters: [...POSLOVI_BASE],
      booleanFilters: [],
    },
  },
};

// ── 18. USLUGE ──────────────────────────────────────────────────

const DOLAZAK_SELECT: QuickFilter = { key: 'dolazak', label: 'Dolazak na adresu', type: 'select', options: ['Da', 'Ne'] };

const USLUGE_FILTERS: CategoryFilterConfig = {
  categoryName: 'Usluge',
  quickFilters: [],
  booleanFilters: [],
  subcategoryFilters: {
    'Servisiranje vozila': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Automehaničar', 'Autoelektričar', 'Autolimar', 'Vulkanizer', 'Klima servis', 'Pranje i detailing', 'Tehnički pregled'] },
        DOLAZAK_SELECT,
      ],
      booleanFilters: [],
    },
    'Građevinske usluge': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Moler', 'Keramičar', 'Elektroinstalater', 'Vodoinstalater', 'Krovopokrivač', 'Stolar', 'Zidanje', 'Fasade', 'Podopolaganje', 'Adaptacije', 'Arhitektura'] },
        DOLAZAK_SELECT,
      ],
      booleanFilters: [],
    },
    'IT usluge': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Servis računala', 'Servis mobitela', 'Web razvoj', 'Dizajn', 'Mrežna infrastruktura'] },
      ],
      booleanFilters: [],
    },
    'Ljepota i njega': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Frizer', 'Kozmetika', 'Manikura', 'Masaža', 'Tattoo'] },
        DOLAZAK_SELECT,
      ],
      booleanFilters: [],
    },
    'Edukacija i poduke': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Instrukcije', 'Jezični tečaj', 'IT kurs', 'Autoškola', 'Glazbena škola', 'Sportska škola'] },
        { key: 'nacin', label: 'Način', type: 'select', options: ['Online', 'Uživo', 'Oboje'] },
      ],
      booleanFilters: [],
    },
    'Transport i selidbe': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Selidbe', 'Kombi prijevoz', 'Dostava', 'Prijevoz osoba'] },
      ],
      booleanFilters: [],
    },
    'Čišćenje i održavanje': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Stan', 'Poslovni prostor', 'Tepihi', 'Nakon gradnje'] },
      ],
      booleanFilters: [],
    },
    'Dizajn, tisak i fotografija': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Grafički dizajn', 'Fotografija', 'Tisak', 'Video produkcija'] },
      ],
      booleanFilters: [],
    },
    'Pravne i financijske usluge': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Advokat', 'Notar', 'Računovođa', 'Finansijski savjetnik'] },
      ],
      booleanFilters: [],
    },
    'Iznajmljivanje vozila i strojeva': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Auto', 'Kombi', 'Kamion', 'Mini bager', 'Alat', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Event, vjenčanja i zabava': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['DJ', 'Fotograf', 'Dekoracija', 'Catering', 'Voditelj', 'Bend'] },
      ],
      booleanFilters: [],
    },
    'Kućni ljubimci – usluge': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Dog sitting', 'Šetanje', 'Šišanje', 'Veterinar'] },
      ],
      booleanFilters: [],
    },
    'Ostale usluge': { quickFilters: [], booleanFilters: [] },
  },
};

// ── 19. UMJETNOST I KOLEKCIONARSTVO ─────────────────────────────

const UMJETNOST_FILTERS: CategoryFilterConfig = {
  categoryName: 'Umjetnost i kolekcionarstvo',
  quickFilters: [
    { key: 'stanje', label: 'Stanje', type: 'select', options: ['Novo', 'Polovni', 'Antikno'] },
  ],
  booleanFilters: [],
  subcategoryFilters: {
    'Slike i skulpture': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Ulje na platnu', 'Akvarel', 'Grafika', 'Skulptura', 'Digitalni print'] },
        { key: 'dimenzija', label: 'Dimenzija', type: 'select', options: ['Mala do 30cm', 'Srednja 30-80cm', 'Velika 80cm+'] },
      ],
      booleanFilters: [],
    },
    'Fotografije i posteri': {
      quickFilters: [
        { key: 'dimenzija', label: 'Dimenzija', type: 'select', options: ['Mala', 'Srednja', 'Velika'] },
        { key: 'uokvireno', label: 'Uokvireno', type: 'select', options: ['Da', 'Ne'] },
      ],
      booleanFilters: [],
    },
    'Antikviteti i starine': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Namještaj', 'Porculan', 'Satovi', 'Ostalo'] },
        { key: 'starost', label: 'Starost', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Numizmatika': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Novčić', 'Novčanica', 'Medalja'] },
        { key: 'zemlja', label: 'Zemlja', type: 'text' },
        { key: 'godina', label: 'Godina', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Filatelija (marke i dopisnice)': {
      quickFilters: [
        { key: 'zemlja', label: 'Zemlja', type: 'text' },
        { key: 'godina', label: 'Godina', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Militarija': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Odlikovanje', 'Uniforma', 'Oružje muzejsko', 'Dokumenti', 'Fotografije'] },
        { key: 'period', label: 'Period', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Modelarstvo': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['RC auto', 'RC zrakoplov', 'Statični model', 'Vlak'] },
        { key: 'mjerilo', label: 'Mjerilo', type: 'select', options: ['1:18', '1:24', '1:43', '1:72', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Razglednice i stare fotografije': { quickFilters: [], booleanFilters: [] },
    'Ostale kolekcije': { quickFilters: [], booleanFilters: [] },
  },
};

// ── 20. OSTALO ──────────────────────────────────────────────────

const OSTALO_FILTERS: CategoryFilterConfig = {
  categoryName: 'Ostalo',
  quickFilters: [STANJE_SELECT],
  booleanFilters: [],
  subcategoryFilters: {
    'Karte i ulaznice': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Koncert', 'Festival', 'Kazalište', 'Sport'] },
        { key: 'brojKarata', label: 'Broj karata', type: 'select', options: ['1', '2', '3', '4+'] },
      ],
      booleanFilters: [],
    },
    'Kozmetika i ljepota': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Parfem', 'Šminka', 'Njega lica', 'Njega kose', 'Salon oprema'] },
        { key: 'spol', label: 'Spol', type: 'select', options: ['Muški', 'Ženski', 'Unisex'] },
      ],
      booleanFilters: [],
    },
    'Medicinska pomagala': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Invalidska kolica', 'Štake', 'Inhalator', 'Ostalo'] },
      ],
      booleanFilters: [],
    },
    'Vjenčanja': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Vjenčanica', 'Odijelo', 'Dekoracija', 'Pozivnice'] },
        { key: 'velicina', label: 'Veličina', type: 'text' },
      ],
      booleanFilters: [],
    },
    'Investicijsko zlato i srebro': {
      quickFilters: [
        { key: 'tip', label: 'Tip', type: 'select', options: ['Zlato', 'Srebro'] },
        { key: 'oblik', label: 'Oblik', type: 'select', options: ['Poluga', 'Kovanica'] },
        { key: 'tezina', label: 'Težina g', type: 'range', range: [1, 1000], unit: 'g' },
      ],
      booleanFilters: [],
    },
    'Grobna mjesta': { quickFilters: [], booleanFilters: [] },
    'Poklanjam (besplatno)': { quickFilters: [], booleanFilters: [] },
    'Sve ostalo': { quickFilters: [], booleanFilters: [] },
  },
};

// ── Registry ────────────────────────────────────────────────────

const ALL_CATEGORY_FILTERS: CategoryFilterConfig[] = [
  VOZILA_FILTERS,
  DIJELOVI_FILTERS,
  NEKRETNINE_FILTERS,
  MOBITELI_FILTERS,
  RACUNALA_FILTERS,
  TEHNIKA_FILTERS,
  DOM_FILTERS,
  ODJECA_FILTERS,
  SPORT_FILTERS,
  DJECJI_FILTERS,
  GLAZBA_FILTERS,
  LITERATURA_FILTERS,
  VIDEOIGRE_FILTERS,
  ZIVOTINJE_FILTERS,
  HRANA_FILTERS,
  STROJEVI_FILTERS,
  POSLOVI_FILTERS,
  USLUGE_FILTERS,
  UMJETNOST_FILTERS,
  OSTALO_FILTERS,
];

const filterMap = new Map<string, CategoryFilterConfig>();
for (const config of ALL_CATEGORY_FILTERS) {
  filterMap.set(config.categoryName, config);
}

/**
 * Get filter config for a category, optionally narrowed to a subcategory.
 * - No subcategory → returns the general (main category) filters
 * - With subcategory → returns subcategory-specific filters if defined, else general
 */
export function getCategoryFilters(
  categoryName: string,
  subcategoryName?: string,
): CategoryFilterConfig | null {
  const config = filterMap.get(categoryName);
  if (!config) return null;

  if (subcategoryName && config.subcategoryFilters?.[subcategoryName]) {
    const sub = config.subcategoryFilters[subcategoryName];
    return {
      categoryName: config.categoryName,
      quickFilters: sub.quickFilters,
      booleanFilters: sub.booleanFilters,
    };
  }

  return config;
}

/** Get all category names that have quick filters defined */
export function getCategoriesWithFilters(): string[] {
  return ALL_CATEGORY_FILTERS
    .filter(c => c.quickFilters.length > 0 || c.booleanFilters.length > 0)
    .map(c => c.categoryName);
}
