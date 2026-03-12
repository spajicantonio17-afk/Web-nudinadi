// ── Category-Specific Quick Filter Definitions ──────────────────
// Used by CategoryFilterBar to show relevant filters per category.

import { CAR_BRANDS_WITH_MODELS } from './vehicle-models';

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

// ── Dynamic options resolver for autocomplete filters ────────────

/** Get dynamic options for autocomplete filters based on context */
export function getAutoCompleteOptions(
  categoryName: string,
  filterKey: string,
  currentFilters: Record<string, string | number | boolean | [number, number]>,
): string[] {
  if (categoryName === 'Vozila' || categoryName === 'Dijelovi za automobile') {
    if (filterKey === 'marka') {
      return CAR_BRANDS_WITH_MODELS.map(b => b.name);
    }
    if (filterKey === 'model') {
      const marka = currentFilters.marka;
      if (typeof marka === 'string') {
        const brand = CAR_BRANDS_WITH_MODELS.find(
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

export interface CategoryFilterConfig {
  /** Category name (matches CATEGORIES[].name) */
  categoryName: string;
  /** Quick filters shown in horizontal bar */
  quickFilters: QuickFilter[];
  /** Boolean attribute keys shown in extended FilterModal */
  booleanFilters: { key: string; label: string }[];
}

// ── VOZILA ──────────────────────────────────────────────────────

const VOZILA_FILTERS: CategoryFilterConfig = {
  categoryName: 'Vozila',
  quickFilters: [
    { key: 'marka', label: 'Marka', type: 'autocomplete' },
    { key: 'model', label: 'Model', type: 'autocomplete', dependsOn: 'marka' },
    { key: 'godiste', label: 'Godište', type: 'range', range: [1980, 2026] },
    { key: 'km', label: 'Kilometraža', type: 'range', range: [0, 500000], unit: 'km' },
    { key: 'gorivo', label: 'Gorivo', type: 'select', options: ['Dizel', 'Benzin', 'Benzin + LPG', 'Hibrid', 'Plug-in hibrid', 'Električni', 'CNG'] },
    { key: 'mjenjac', label: 'Mjenjač', type: 'select', options: ['Ručni', 'Automatik', 'Poluautomatik', 'DSG / DCT'] },
    { key: 'karoserija', label: 'Karoserija', type: 'select', options: ['Sedan', 'Karavan', 'Hatchback', 'Coupe', 'Kabriolet', 'SUV', 'Crossover', 'Pickup', 'Van', 'Minivan', 'Limuzina'] },
    { key: 'boja', label: 'Boja', type: 'select', options: ['Crna', 'Bijela', 'Siva', 'Srebrna', 'Crvena', 'Plava', 'Zelena', 'Narančasta', 'Zlatna', 'Smeđa', 'Bež', 'Ostalo'] },
    { key: 'snaga', label: 'Snaga (kW)', type: 'range', range: [0, 500], unit: 'kW' },
    { key: 'pogon', label: 'Pogon', type: 'select', options: ['Prednji', 'Zadnji', '4x4 (stalni)', '4x4 (povremeni)'] },
    { key: 'kubikaza', label: 'Kubikaža', type: 'range', range: [0, 6000], unit: 'ccm' },
    { key: 'registracija', label: 'Registracija', type: 'select', options: ['Istekla', 'Do 3 mj.', 'Do 6 mj.', 'Do 12 mj.'] },
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
    { key: 'xenon', label: 'Xenon / LED' },
    { key: 'matrixLed', label: 'Matrix LED' },
    { key: 'panoramskiKrov', label: 'Panoramski krov' },
    { key: 'abs', label: 'ABS' },
    { key: 'esp', label: 'ESP / ASR' },
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
    { key: 'startStop', label: 'Start / Stop' },
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
};

// ── DIJELOVI ZA AUTOMOBILE ──────────────────────────────────────

const DIJELOVI_FILTERS: CategoryFilterConfig = {
  categoryName: 'Dijelovi za automobile',
  quickFilters: [
    { key: 'marka', label: 'Marka vozila', type: 'autocomplete' },
    { key: 'model', label: 'Model', type: 'text' },
  ],
  booleanFilters: [],
};

// ── NEKRETNINE ──────────────────────────────────────────────────

const NEKRETNINE_FILTERS: CategoryFilterConfig = {
  categoryName: 'Nekretnine',
  quickFilters: [
    { key: 'povrsina', label: 'Površina m²', type: 'range', range: [10, 1000], unit: 'm²', attributeKey: 'povrsina' },
    { key: 'brojSoba', label: 'Broj soba', type: 'select', options: ['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5+'] },
    { key: 'brojKupatila', label: 'Kupatila', type: 'select', options: ['1', '2', '3', '4', '5+'] },
    { key: 'kat', label: 'Kat/Sprat', type: 'select', options: ['Prizemlje', '1', '2', '3', '4', '5+'] },
    { key: 'grijanje', label: 'Grijanje', type: 'select', options: ['Centralno', 'Etažno plin', 'Etažno struja', 'Na drva', 'Klima', 'Podno', 'Bez'] },
    { key: 'energetskirazred', label: 'Energetski razred', type: 'select', options: ['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'] },
    { key: 'namjestenost', label: 'Namještenost', type: 'select', options: ['Namješten', 'Polunamješten', 'Nenamješten'] },
    { key: 'parking', label: 'Parking', type: 'select', options: ['Nema', 'Ulična', 'Garaža', 'Parkiralište'] },
  ],
  booleanFilters: [
    { key: 'lift', label: 'Lift' },
    { key: 'balkon', label: 'Balkon / Terasa' },
    { key: 'podrum', label: 'Podrum' },
    { key: 'klimatizovano', label: 'Klima uređaj' },
    { key: 'internet', label: 'Internet / Kabel' },
    { key: 'alarm', label: 'Alarmni sustav' },
    { key: 'blindiranaVrata', label: 'Blindirana vrata' },
    { key: 'videoNadzor', label: 'Video nadzor' },
    { key: 'uknjizeno', label: 'Uknjiženo / ZK' },
    { key: 'kuciLjubimci', label: 'Kućni ljubimci' },
  ],
};

// ── MOBITELI I OPREMA ───────────────────────────────────────────

const MOBITELI_FILTERS: CategoryFilterConfig = {
  categoryName: 'Mobiteli i oprema',
  quickFilters: [
    { key: 'memorija', label: 'Memorija', type: 'select', options: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'] },
    { key: 'ram', label: 'RAM', type: 'select', options: ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'] },
    { key: 'zdravljeBaterije', label: 'Baterija', type: 'select', options: ['100%', '95-99%', '90-94%', '85-89%', '80-84%', '<80%'] },
    { key: 'stanjeEkrana', label: 'Ekran', type: 'select', options: ['Savršeno', 'Sitne ogrebotine', 'Vidljive ogrebotine', 'Napuknuće', 'Zamijenjen ekran'] },
    { key: 'boja', label: 'Boja', type: 'select', options: ['Crna', 'Bijela', 'Siva', 'Srebrna', 'Plava', 'Crvena', 'Zelena', 'Zlatna', 'Roza', 'Ljubičasta', 'Ostalo'] },
  ],
  booleanFilters: [
    { key: 'dualSim', label: 'Dual SIM' },
    { key: 'esim', label: 'eSIM' },
    { key: 'vodootporan', label: 'Vodootporan' },
    { key: 'fabrickaKutija', label: 'Fabrička kutija' },
    { key: 'punjac', label: 'Punjač uključen' },
    { key: 'slusalice', label: 'Slušalice' },
    { key: 'ostecen', label: 'Oštećen' },
  ],
};

// ── RAČUNALA I IT ───────────────────────────────────────────────

const RACUNALA_FILTERS: CategoryFilterConfig = {
  categoryName: 'Računala i IT',
  quickFilters: [
    { key: 'ram', label: 'RAM', type: 'select', options: ['4GB', '8GB', '16GB', '32GB', '64GB'] },
    { key: 'ssd', label: 'SSD', type: 'select', options: ['128GB', '256GB', '512GB', '1TB', '2TB'] },
    { key: 'gpu', label: 'GPU', type: 'text' },
  ],
  booleanFilters: [],
};

// ── TEHNIKA I ELEKTRONIKA ───────────────────────────────────────

const TEHNIKA_FILTERS: CategoryFilterConfig = {
  categoryName: 'Tehnika i elektronika',
  quickFilters: [
    { key: 'marka', label: 'Marka', type: 'text' },
  ],
  booleanFilters: [],
};

// ── DOM I VRT ───────────────────────────────────────────────────

const DOM_FILTERS: CategoryFilterConfig = {
  categoryName: 'Dom i vrtne garniture',
  quickFilters: [],
  booleanFilters: [],
};

// ── ODJEĆA I OBUĆA ──────────────────────────────────────────────

const ODJECA_FILTERS: CategoryFilterConfig = {
  categoryName: 'Odjeća i obuća',
  quickFilters: [
    { key: 'velicina', label: 'Veličina', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '26', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48'] },
    { key: 'boja', label: 'Boja', type: 'select', options: ['Crna', 'Bijela', 'Siva', 'Crvena', 'Plava', 'Zelena', 'Roza', 'Bež', 'Smeđa', 'Narančasta', 'Ostalo'] },
    { key: 'sezona', label: 'Sezona', type: 'select', options: ['Proljeće/Ljeto', 'Jesen/Zima', 'Sva godišnja doba'] },
  ],
  booleanFilters: [],
};

// ── SPORT I REKREACIJA ──────────────────────────────────────────

const SPORT_FILTERS: CategoryFilterConfig = {
  categoryName: 'Sport i rekreacija',
  quickFilters: [
    { key: 'marka', label: 'Marka', type: 'text' },
  ],
  booleanFilters: [],
};

// ── ODJEĆA ZA DJECU ─────────────────────────────────────────────

const DJECJI_FILTERS: CategoryFilterConfig = {
  categoryName: 'Odjeća za djecu',
  quickFilters: [
    { key: 'uzrast', label: 'Uzrast', type: 'select', options: ['0-6 mjeseci', '6-12 mjeseci', '1-2 godine', '2-4 godine', '4-6 godina', '6-10 godina', '10-14 godina'] },
  ],
  booleanFilters: [],
};

// ── GLAZBA I GLAZBENI INSTRUMENTI ───────────────────────────────

const GLAZBA_FILTERS: CategoryFilterConfig = {
  categoryName: 'Glazba i glazbeni instrumenti',
  quickFilters: [
    { key: 'marka', label: 'Marka', type: 'text' },
  ],
  booleanFilters: [],
};

// ── LITERATURA I MEDIJI ─────────────────────────────────────────

const LITERATURA_FILTERS: CategoryFilterConfig = {
  categoryName: 'Literatura i mediji',
  quickFilters: [
    { key: 'zanr', label: 'Žanr', type: 'select', options: ['Roman', 'Naučna fantastika', 'Kriminalistički', 'Biografija', 'Historija', 'Udžbenik', 'Dječja literatura', 'Stručna', 'Ostalo'] },
  ],
  booleanFilters: [],
};

// ── VIDEOIGRE ───────────────────────────────────────────────────

const VIDEOIGRE_FILTERS: CategoryFilterConfig = {
  categoryName: 'Videoigre',
  quickFilters: [
    { key: 'platforma', label: 'Platforma', type: 'select', options: ['PlayStation', 'Xbox', 'Nintendo', 'PC', 'Retro'] },
  ],
  booleanFilters: [],
};

// ── ŽIVOTINJE ───────────────────────────────────────────────────

const ZIVOTINJE_FILTERS: CategoryFilterConfig = {
  categoryName: 'Životinje',
  quickFilters: [],
  booleanFilters: [],
};

// ── HRANA I PIĆE ────────────────────────────────────────────────

const HRANA_FILTERS: CategoryFilterConfig = {
  categoryName: 'Hrana i piće',
  quickFilters: [],
  booleanFilters: [],
};

// ── STROJEVI I ALATI ────────────────────────────────────────────

const STROJEVI_FILTERS: CategoryFilterConfig = {
  categoryName: 'Strojevi i alati',
  quickFilters: [
    { key: 'marka', label: 'Marka', type: 'text' },
  ],
  booleanFilters: [],
};

// ── POSLOVI ─────────────────────────────────────────────────────

const POSLOVI_FILTERS: CategoryFilterConfig = {
  categoryName: 'Poslovi',
  quickFilters: [
    { key: 'tipPosla', label: 'Tip posla', type: 'select', options: ['Puno radno vrijeme', 'Pola radnog vremena', 'Honorarno', 'Praksa'] },
  ],
  booleanFilters: [],
};

// ── USLUGE ──────────────────────────────────────────────────────

const USLUGE_FILTERS: CategoryFilterConfig = {
  categoryName: 'Usluge',
  quickFilters: [],
  booleanFilters: [],
};

// ── UMJETNOST I KOLEKCIONARSTVO ─────────────────────────────────

const UMJETNOST_FILTERS: CategoryFilterConfig = {
  categoryName: 'Umjetnost i kolekcionarstvo',
  quickFilters: [],
  booleanFilters: [],
};

// ── OSTALO ──────────────────────────────────────────────────────

const OSTALO_FILTERS: CategoryFilterConfig = {
  categoryName: 'Ostalo',
  quickFilters: [],
  booleanFilters: [],
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

/** Get quick filter config for a category name. Returns null if category has no filters. */
export function getCategoryFilters(categoryName: string): CategoryFilterConfig | null {
  return filterMap.get(categoryName) ?? null;
}

/** Get all category names that have quick filters defined */
export function getCategoriesWithFilters(): string[] {
  return ALL_CATEGORY_FILTERS
    .filter(c => c.quickFilters.length > 0 || c.booleanFilters.length > 0)
    .map(c => c.categoryName);
}
