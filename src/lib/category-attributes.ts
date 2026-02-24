// ── Category-Specific Attribute Definitions ──────────────────
// Used by the Upload form to render dynamic fields per category.

export type AttributeValues = Record<string, string | number | boolean | string[]>;

export interface CategoryField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  formPage: 1 | 2 | 3;
  options?: string[];
  placeholder?: string;
  unit?: string;
}

// ── Vehicle Fields ─────────────────────────────────────────

const VEHICLE_FIELDS: CategoryField[] = [
  // Page 1 — basics
  { key: 'marka',      label: 'Marka',        type: 'text',   formPage: 1, placeholder: 'npr. BMW' },
  { key: 'model',      label: 'Model',        type: 'text',   formPage: 1, placeholder: 'npr. Serija 3' },
  { key: 'godiste',    label: 'Godište',      type: 'number', formPage: 1, placeholder: 'npr. 2018' },
  { key: 'km',         label: 'Kilometraža',  type: 'number', formPage: 1, placeholder: 'npr. 120000', unit: 'km' },
  { key: 'motor',      label: 'Motor',        type: 'text',   formPage: 1, placeholder: 'npr. 2.0 TDI 110 kW' },
  { key: 'gorivo',     label: 'Gorivo',       type: 'select', formPage: 1, options: ['Dizel', 'Benzin', 'Benzin + LPG', 'Hibrid', 'Plug-in hibrid', 'Električni', 'CNG'] },
  { key: 'mjenjac',    label: 'Mjenjač',      type: 'select', formPage: 1, options: ['Ručni', 'Automatik', 'Poluautomatik', 'DSG / DCT'] },
  { key: 'karoserija', label: 'Karoserija',   type: 'select', formPage: 1, options: ['Sedan', 'Karavan', 'Hatchback', 'Coupe', 'Kabriolet', 'SUV', 'Crossover', 'Pickup', 'Van', 'Minivan', 'Limuzina'] },
  { key: 'boja',       label: 'Boja',         type: 'select', formPage: 1, options: ['Crna', 'Bijela', 'Siva', 'Srebrna', 'Crvena', 'Plava', 'Zelena', 'Narančasta', 'Zlatna', 'Smeđa', 'Bež', 'Ostalo'] },
  // Page 2 — technical
  { key: 'pogon',          label: 'Pogon',             type: 'select', formPage: 2, options: ['Prednji', 'Stražnji', '4x4 (stalni)', '4x4 (povremeni)'] },
  { key: 'brVrata',        label: 'Broj vrata',        type: 'select', formPage: 2, options: ['2', '3', '4', '5'] },
  { key: 'konjskeSile',    label: 'Konjske snage',     type: 'number', formPage: 2, placeholder: 'npr. 150', unit: 'ks' },
  { key: 'registracija',   label: 'Registracija do',   type: 'text',   formPage: 2, placeholder: 'MM/GGGG' },
  { key: 'servisnaKnjiga', label: 'Servisna knjiga',   type: 'boolean', formPage: 2 },
  { key: 'noviServis',     label: 'Novi servis',       type: 'boolean', formPage: 2 },
  { key: 'airbag',         label: 'Airbag',            type: 'boolean', formPage: 2 },
  { key: 'abs',            label: 'ABS',               type: 'boolean', formPage: 2 },
  { key: 'esp',            label: 'ESP / ASR',         type: 'boolean', formPage: 2 },
  // Page 3 — equipment (Comfort)
  { key: 'klima',              label: 'Klima',                  type: 'boolean', formPage: 3 },
  { key: 'autoKlima',          label: 'Automatska klima',       type: 'boolean', formPage: 3 },
  { key: 'tempomat',           label: 'Tempomat',               type: 'boolean', formPage: 3 },
  { key: 'adaptivniTempomat',  label: 'Adaptivni tempomat',     type: 'boolean', formPage: 3 },
  { key: 'kozenaSjed',         label: 'Kožna sjedišta',         type: 'boolean', formPage: 3 },
  { key: 'grejanaSjed',        label: 'Grijana sjedišta',       type: 'boolean', formPage: 3 },
  { key: 'ventiliranaSjed',    label: 'Ventilirana sjedišta',   type: 'boolean', formPage: 3 },
  { key: 'elSjedistaVozac',    label: 'El. podesiva sjedišta',  type: 'boolean', formPage: 3 },
  { key: 'memSjedista',        label: 'Memorija sjedišta',      type: 'boolean', formPage: 3 },
  { key: 'elProzori',          label: 'El. prozori',            type: 'boolean', formPage: 3 },
  { key: 'elRetrovizori',      label: 'El. retrovizori',        type: 'boolean', formPage: 3 },
  { key: 'panoramskiKrov',     label: 'Panoramski krov',        type: 'boolean', formPage: 3 },
  { key: 'krovniNosac',        label: 'Krovni nosač',           type: 'boolean', formPage: 3 },
  { key: 'grijaniVolan',       label: 'Grijani volan',          type: 'boolean', formPage: 3 },
  { key: 'multiVolan',         label: 'Multif. volan',          type: 'boolean', formPage: 3 },
  { key: 'startStop',          label: 'Start / Stop',           type: 'boolean', formPage: 3 },
  { key: 'bezKljucPokr',       label: 'Keyless Go',             type: 'boolean', formPage: 3 },
  // Page 3 — equipment (Media & Navigation)
  { key: 'navigacija',         label: 'Navigacija',             type: 'boolean', formPage: 3 },
  { key: 'bluetooth',          label: 'Bluetooth',              type: 'boolean', formPage: 3 },
  { key: 'appleCarPlay',       label: 'Apple CarPlay',          type: 'boolean', formPage: 3 },
  { key: 'androidAuto',        label: 'Android Auto',           type: 'boolean', formPage: 3 },
  { key: 'touchscreen',        label: 'Touchscreen',            type: 'boolean', formPage: 3 },
  { key: 'digKokpit',          label: 'Digitalni kokpit',       type: 'boolean', formPage: 3 },
  { key: 'headUpDisplay',      label: 'Head-up display',        type: 'boolean', formPage: 3 },
  { key: 'usbPort',            label: 'USB / Type-C',           type: 'boolean', formPage: 3 },
  { key: 'bezicnoPunjenje',    label: 'Bežično punjenje',       type: 'boolean', formPage: 3 },
  // Page 3 — equipment (Safety & Driving)
  { key: 'parkSenzori',        label: 'Parking senzori',        type: 'boolean', formPage: 3 },
  { key: 'kameraNazad',        label: 'Kamera (nazad)',         type: 'boolean', formPage: 3 },
  { key: 'kamera360',          label: 'Kamera 360°',            type: 'boolean', formPage: 3 },
  { key: 'laneAssist',         label: 'Lane Assist',            type: 'boolean', formPage: 3 },
  { key: 'mrtvitacni',         label: 'Mrtvi ugao (BSM)',       type: 'boolean', formPage: 3 },
  { key: 'autoKocenje',        label: 'Automatsko kočenje',     type: 'boolean', formPage: 3 },
  { key: 'znakDetekt',         label: 'Prepozn. znakova',       type: 'boolean', formPage: 3 },
  { key: 'zamGume',            label: 'Zamor. gume / Stepne',   type: 'boolean', formPage: 3 },
  // Page 3 — equipment (Lights & Exterior)
  { key: 'xenon',              label: 'Xenon / LED',            type: 'boolean', formPage: 3 },
  { key: 'matrixLed',          label: 'Matrix LED',             type: 'boolean', formPage: 3 },
  { key: 'dnevnaSvjetla',      label: 'Dnevna svjetla',         type: 'boolean', formPage: 3 },
  { key: 'maglenke',           label: 'Maglenke',               type: 'boolean', formPage: 3 },
  { key: 'aluFelge',           label: 'Alu felge',              type: 'boolean', formPage: 3 },
  { key: 'kukaPrivez',         label: 'Kuka za prikolicu',      type: 'boolean', formPage: 3 },
  { key: 'zatTamna',           label: 'Zatamnjena stakla',      type: 'boolean', formPage: 3 },
];

// ── Real Estate Fields ────────────────────────────────────

const NEKRETNINE_FIELDS: CategoryField[] = [
  { key: 'tipPonude',       label: 'Tip ponude',        type: 'select', formPage: 1, options: ['Prodaja', 'Najam', 'Zakup'] },
  { key: 'povrsina',        label: 'Površina',          type: 'number', formPage: 1, placeholder: 'npr. 65', unit: 'm²' },
  { key: 'etaza',           label: 'Etaža',             type: 'number', formPage: 1, placeholder: 'npr. 3' },
  { key: 'ukupnoEtaza',     label: 'Ukupno etaža',      type: 'number', formPage: 1, placeholder: 'npr. 6' },
  { key: 'sobe',            label: 'Broj soba',         type: 'select', formPage: 1, options: ['Garsonijera', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4+'] },
  { key: 'grijanje',        label: 'Grijanje',          type: 'select', formPage: 2, options: ['Centralno', 'Plin', 'El. grijanje', 'Klima', 'Podno grijanje', 'Toplotna pumpa'] },
  { key: 'parking',         label: 'Parking',           type: 'select', formPage: 2, options: ['Nema', 'Ulična', 'Garaža', 'Parkiralište'] },
  { key: 'balkon',          label: 'Balkon / Terasa',   type: 'boolean', formPage: 2 },
  { key: 'lift',            label: 'Lift',              type: 'boolean', formPage: 2 },
  { key: 'podrum',          label: 'Podrum',            type: 'boolean', formPage: 2 },
  { key: 'internet',        label: 'Internet / Kabel',  type: 'boolean', formPage: 2 },
  { key: 'namjesteno',      label: 'Namješteno',        type: 'boolean', formPage: 2 },
  { key: 'klimatizovano',   label: 'Klimatizovano',     type: 'boolean', formPage: 2 },
];

// ── Mobile Devices ────────────────────────────────────────

const MOBILNI_FIELDS: CategoryField[] = [
  { key: 'model',            label: 'Model',            type: 'text',   formPage: 1, placeholder: 'npr. iPhone 15 Pro' },
  { key: 'memorija',         label: 'Memorija',         type: 'select', formPage: 1, options: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'] },
  { key: 'ram',              label: 'RAM',              type: 'select', formPage: 1, options: ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'] },
  { key: 'boja',             label: 'Boja',             type: 'text',   formPage: 1, placeholder: 'npr. Space Black' },
  { key: 'stanjeEkrana',     label: 'Stanje ekrana',    type: 'select', formPage: 1, options: ['Savršeno', 'Sitne ogrebotine', 'Vidljive ogrebotine', 'Napuknuće', 'Zamijenjen ekran'] },
  { key: 'originalnaPaketa', label: 'Originalna paketa', type: 'boolean', formPage: 1 },
  { key: 'simLock',          label: 'SIM lock',         type: 'boolean', formPage: 1 },
];

// ── Electronics / Tech ───────────────────────────────────

const ELEKTRONIKA_FIELDS: CategoryField[] = [
  { key: 'brand',           label: 'Brend',            type: 'text',    formPage: 1, placeholder: 'npr. Apple, Samsung' },
  { key: 'model',           label: 'Model',            type: 'text',    formPage: 1, placeholder: 'Naziv modela' },
  { key: 'godinaKupovine',  label: 'Godina kupovine',  type: 'number',  formPage: 1, placeholder: 'npr. 2022' },
  { key: 'garancija',       label: 'Garancija',        type: 'boolean', formPage: 1 },
  { key: 'racunOPotvrda',   label: 'Račun / Potvrda',  type: 'boolean', formPage: 1 },
];

// ── Fashion / Clothing ────────────────────────────────────

const MODA_FIELDS: CategoryField[] = [
  { key: 'velicina',  label: 'Veličina',  type: 'select', formPage: 1, options: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '36', '38', '40', '42', '44', '46', '48'] },
  { key: 'boja',      label: 'Boja',      type: 'text',   formPage: 1, placeholder: 'npr. Crna, Bijela' },
  { key: 'brand',     label: 'Brand',     type: 'text',   formPage: 1, placeholder: 'npr. Nike, Zara' },
  { key: 'materijal', label: 'Materijal', type: 'text',   formPage: 1, placeholder: 'npr. Pamuk, Poliester' },
];

// ── Shoes ─────────────────────────────────────────────────

const CIPELE_FIELDS: CategoryField[] = [
  { key: 'velicina', label: 'Veličina', type: 'select', formPage: 1, options: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48'] },
  { key: 'boja',     label: 'Boja',     type: 'text',   formPage: 1, placeholder: 'npr. Crna' },
  { key: 'brand',    label: 'Brand',    type: 'text',   formPage: 1, placeholder: 'npr. Nike, Adidas' },
];

// ── Sports ────────────────────────────────────────────────

const SPORT_FIELDS: CategoryField[] = [
  { key: 'brand',              label: 'Brend',    type: 'text',   formPage: 1, placeholder: 'Proizvođač' },
  { key: 'velicina',           label: 'Veličina', type: 'text',   formPage: 1, placeholder: 'npr. M, 56cm' },
  { key: 'godinaProizvodnje',  label: 'Godište',  type: 'number', formPage: 1, placeholder: 'npr. 2021' },
];

// ── Main export ───────────────────────────────────────────

export function getCategoryFields(category: string): CategoryField[] {
  const c = category.toLowerCase();
  if (c.includes('vozila') || c === 'automobili') return VEHICLE_FIELDS;
  if (c.includes('nekretnin')) return NEKRETNINE_FIELDS;
  if (c.includes('mobilni')) return MOBILNI_FIELDS;
  if (c.includes('elektronika') || c.includes('tehnika') || c.includes('računari')) return ELEKTRONIKA_FIELDS;
  if (c.includes('cipele') || c.includes('obuća')) return CIPELE_FIELDS;
  if (c.includes('moda') || c.includes('odjeća') || c.includes('odijelo') || c.includes('ženska') || c.includes('muška')) return MODA_FIELDS;
  if (c.includes('sport') || c.includes('bicikl') || c.includes('fitnes')) return SPORT_FIELDS;
  return [];
}
