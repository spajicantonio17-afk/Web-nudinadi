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

// Vehicle type union (matches vehicle-models.ts if/when VehicleType is exported)
type VehicleType = 'car' | 'motorcycle' | 'bicycle' | 'truck' | 'camper' | 'boat' | 'atv' | 'parts';

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

// ── Motorcycle Fields ─────────────────────────────────────

const MOTORCYCLE_FIELDS: CategoryField[] = [
  // Page 1
  { key: 'marka', label: 'Marka', type: 'text', formPage: 1, placeholder: 'npr. Yamaha' },
  { key: 'model', label: 'Model', type: 'text', formPage: 1, placeholder: 'npr. MT-07' },
  { key: 'godiste', label: 'Godište', type: 'number', formPage: 1, placeholder: 'npr. 2021' },
  { key: 'km', label: 'Kilometraža', type: 'number', formPage: 1, placeholder: 'npr. 15000', unit: 'km' },
  { key: 'kubikaza', label: 'Kubikaža', type: 'number', formPage: 1, placeholder: 'npr. 689', unit: 'ccm' },
  { key: 'gorivo', label: 'Gorivo', type: 'select', formPage: 1, options: ['Benzin', 'Električni'] },
  { key: 'tipMotocikla', label: 'Tip motocikla', type: 'select', formPage: 1, options: ['Sport', 'Naked', 'Touring', 'Enduro', 'Cross', 'Cruiser', 'Chopper', 'Skuter', 'Moped', 'Supermoto', 'Custom', 'Trike'] },
  { key: 'boja', label: 'Boja', type: 'select', formPage: 1, options: ['Crna', 'Bijela', 'Siva', 'Srebrna', 'Crvena', 'Plava', 'Zelena', 'Narančasta', 'Zlatna', 'Ostalo'] },
  // Page 2
  { key: 'konjskeSile', label: 'Konjske snage', type: 'number', formPage: 2, placeholder: 'npr. 73', unit: 'ks' },
  { key: 'registracija', label: 'Registracija do', type: 'text', formPage: 2, placeholder: 'MM/GGGG' },
  { key: 'abs', label: 'ABS', type: 'boolean', formPage: 2 },
  { key: 'kontrolaTrakcije', label: 'Kontrola trakcije', type: 'boolean', formPage: 2 },
  { key: 'quickshifter', label: 'Quickshifter', type: 'boolean', formPage: 2 },
  { key: 'servisnaKnjiga', label: 'Servisna knjiga', type: 'boolean', formPage: 2 },
  { key: 'brojVlasnika', label: 'Broj vlasnika', type: 'number', formPage: 2, placeholder: 'npr. 2' },
];

// ── Bicycle Fields ────────────────────────────────────────

const BICYCLE_FIELDS: CategoryField[] = [
  // Page 1
  { key: 'marka', label: 'Marka', type: 'text', formPage: 1, placeholder: 'npr. Trek' },
  { key: 'model', label: 'Model', type: 'text', formPage: 1, placeholder: 'npr. Marlin 7' },
  { key: 'godiste', label: 'Godište', type: 'number', formPage: 1, placeholder: 'npr. 2022' },
  { key: 'tipBicikla', label: 'Tip bicikla', type: 'select', formPage: 1, options: ['MTB', 'Trekking / City', 'Cestovni', 'E-bike', 'Gravel', 'BMX', 'Dječji', 'Sklopivi', 'Tandem'] },
  { key: 'velicinaOkvira', label: 'Veličina okvira', type: 'select', formPage: 1, options: ['XS (13-14")', 'S (15-16")', 'M (17-18")', 'L (19-20")', 'XL (21-22")', 'XXL (23"+)'] },
  { key: 'velicinaKotaca', label: 'Veličina kotača', type: 'select', formPage: 1, options: ['20"', '24"', '26"', '27.5"', '28"', '29"'] },
  { key: 'materijal', label: 'Materijal okvira', type: 'select', formPage: 1, options: ['Aluminij', 'Karbon', 'Čelik', 'Titan'] },
  { key: 'boja', label: 'Boja', type: 'select', formPage: 1, options: ['Crna', 'Bijela', 'Siva', 'Crvena', 'Plava', 'Zelena', 'Narančasta', 'Ostalo'] },
  // Page 2
  { key: 'mjenjac', label: 'Mjenjač', type: 'text', formPage: 2, placeholder: 'npr. Shimano Deore 12-speed' },
  { key: 'kocnice', label: 'Kočnice', type: 'select', formPage: 2, options: ['Disk hidrauličke', 'Disk mehaničke', 'V-brake', 'Cantilever'] },
  { key: 'vilica', label: 'Vilica', type: 'select', formPage: 2, options: ['Rigidna', 'Amortizer air', 'Amortizer coil', 'Full suspension'] },
  { key: 'ebikeMotor', label: 'E-bike motor', type: 'text', formPage: 2, placeholder: 'npr. Bosch Performance CX' },
  { key: 'baterija', label: 'Baterija', type: 'text', formPage: 2, placeholder: 'npr. 625 Wh' },
];

// ── Truck Fields ──────────────────────────────────────────

const TRUCK_FIELDS: CategoryField[] = [
  // Page 1
  { key: 'marka', label: 'Marka', type: 'text', formPage: 1, placeholder: 'npr. MAN' },
  { key: 'model', label: 'Model', type: 'text', formPage: 1, placeholder: 'npr. TGX' },
  { key: 'godiste', label: 'Godište', type: 'number', formPage: 1, placeholder: 'npr. 2020' },
  { key: 'km', label: 'Kilometraža', type: 'number', formPage: 1, placeholder: 'npr. 450000', unit: 'km' },
  { key: 'gorivo', label: 'Gorivo', type: 'select', formPage: 1, options: ['Dizel', 'CNG', 'LNG', 'Električni', 'Hibrid'] },
  { key: 'konjskeSile', label: 'Snaga motora', type: 'number', formPage: 1, placeholder: 'npr. 440', unit: 'ks' },
  { key: 'mjenjac', label: 'Mjenjač', type: 'select', formPage: 1, options: ['Manuelni', 'Automatski', 'Polu-automatski'] },
  // Page 2
  { key: 'nosivost', label: 'Nosivost', type: 'number', formPage: 2, placeholder: 'npr. 18', unit: 't' },
  { key: 'ukupnaMasa', label: 'Ukupna masa', type: 'number', formPage: 2, placeholder: 'npr. 40', unit: 't' },
  { key: 'brojOsovina', label: 'Broj osovina', type: 'select', formPage: 2, options: ['2', '3', '4', '5+'] },
  { key: 'tahograf', label: 'Tahograf', type: 'select', formPage: 2, options: ['Digitalni', 'Analogni', 'Bez'] },
  { key: 'registracija', label: 'Registracija do', type: 'text', formPage: 2, placeholder: 'MM/GGGG' },
  { key: 'servisnaKnjiga', label: 'Servisna knjiga', type: 'boolean', formPage: 2 },
  { key: 'kabina', label: 'Kabina', type: 'select', formPage: 2, options: ['Dnevna kabina', 'Noćna kabina', 'Mega kabina'] },
  { key: 'adr', label: 'ADR', type: 'boolean', formPage: 2 },
  { key: 'euroNorma', label: 'Euro norma', type: 'select', formPage: 2, options: ['Euro 3', 'Euro 4', 'Euro 5', 'Euro 6'] },
];

// ── Camper Fields ─────────────────────────────────────────

const CAMPER_FIELDS: CategoryField[] = [
  // Page 1
  { key: 'marka', label: 'Marka', type: 'text', formPage: 1, placeholder: 'npr. Hymer' },
  { key: 'model', label: 'Model', type: 'text', formPage: 1, placeholder: 'npr. B-Klasse' },
  { key: 'godiste', label: 'Godište', type: 'number', formPage: 1, placeholder: 'npr. 2019' },
  { key: 'km', label: 'Kilometraža', type: 'number', formPage: 1, placeholder: 'npr. 45000', unit: 'km' },
  { key: 'sasija', label: 'Šasija', type: 'select', formPage: 1, options: ['Fiat Ducato', 'Mercedes Sprinter', 'VW Crafter', 'MAN', 'Iveco Daily', 'Ford Transit', 'Renault Master', 'Ostalo'] },
  { key: 'tipKampera', label: 'Tip', type: 'select', formPage: 1, options: ['Integralni', 'Poluintegralni', 'Alkoven', 'Van', 'Kamp prikolica', 'Kamp kućica'] },
  { key: 'duzinaVozila', label: 'Dužina vozila', type: 'number', formPage: 1, placeholder: 'npr. 7.2', unit: 'm' },
  // Page 2
  { key: 'brojLezajeva', label: 'Broj ležajeva', type: 'number', formPage: 2, placeholder: 'npr. 4' },
  { key: 'gorivo', label: 'Gorivo', type: 'select', formPage: 2, options: ['Dizel', 'Benzin', 'LPG'] },
  { key: 'konjskeSile', label: 'Konjske snage', type: 'number', formPage: 2, placeholder: 'npr. 140', unit: 'ks' },
  { key: 'registracija', label: 'Registracija do', type: 'text', formPage: 2, placeholder: 'MM/GGGG' },
  { key: 'klima', label: 'Klima', type: 'boolean', formPage: 2 },
  { key: 'solarniPanel', label: 'Solarni panel', type: 'boolean', formPage: 2 },
  { key: 'markiza', label: 'Markiza', type: 'boolean', formPage: 2 },
  { key: 'satelitskaAntena', label: 'Satelitska antena', type: 'boolean', formPage: 2 },
  { key: 'grijanje', label: 'Grijanje', type: 'select', formPage: 2, options: ['Plin', 'Dizel', 'Električni', 'Kombinirani'] },
];

// ── Boat Fields ───────────────────────────────────────────

const BOAT_FIELDS: CategoryField[] = [
  // Page 1
  { key: 'marka', label: 'Marka', type: 'text', formPage: 1, placeholder: 'npr. Bayliner' },
  { key: 'model', label: 'Model', type: 'text', formPage: 1, placeholder: 'npr. VR5' },
  { key: 'godiste', label: 'Godište', type: 'number', formPage: 1, placeholder: 'npr. 2020' },
  { key: 'tipPlovila', label: 'Tip plovila', type: 'select', formPage: 1, options: ['Motorni čamac', 'Jedrilica', 'Gumenjak', 'Jet ski', 'Katamaran', 'Ribarski brod', 'Gliser', 'Jahta', 'Kajak / Kanu', 'Ostalo'] },
  { key: 'duzina', label: 'Dužina', type: 'number', formPage: 1, placeholder: 'npr. 6.5', unit: 'm' },
  { key: 'sirina', label: 'Širina', type: 'number', formPage: 1, placeholder: 'npr. 2.3', unit: 'm' },
  // Page 2
  { key: 'motorTip', label: 'Motor tip', type: 'select', formPage: 2, options: ['Vanbrodski', 'Unutarnji', 'Električni', 'Bez motora'] },
  { key: 'snagaMotora', label: 'Snaga motora', type: 'number', formPage: 2, placeholder: 'npr. 150', unit: 'ks' },
  { key: 'gorivo', label: 'Gorivo', type: 'select', formPage: 2, options: ['Benzin', 'Dizel', 'Električni'] },
  { key: 'materijalTrupa', label: 'Materijal trupa', type: 'select', formPage: 2, options: ['Stakloplastika (GRP)', 'Aluminij', 'Drvo', 'PVC', 'Guma / Hypalon', 'Čelik'] },
  { key: 'registracija', label: 'Registracija', type: 'text', formPage: 2, placeholder: 'MM/GGGG' },
  { key: 'satiMotora', label: 'Sati motora', type: 'number', formPage: 2, placeholder: 'npr. 350' },
  { key: 'brojPutnika', label: 'Broj putnika', type: 'number', formPage: 2, placeholder: 'npr. 8' },
];

// ── ATV Fields ────────────────────────────────────────────

const ATV_FIELDS: CategoryField[] = [
  // Page 1
  { key: 'marka', label: 'Marka', type: 'text', formPage: 1, placeholder: 'npr. Polaris' },
  { key: 'model', label: 'Model', type: 'text', formPage: 1, placeholder: 'npr. Sportsman 570' },
  { key: 'godiste', label: 'Godište', type: 'number', formPage: 1, placeholder: 'npr. 2022' },
  { key: 'km', label: 'Kilometraža', type: 'number', formPage: 1, placeholder: 'npr. 5000', unit: 'km' },
  { key: 'kubikaza', label: 'Kubikaža', type: 'number', formPage: 1, placeholder: 'npr. 570', unit: 'ccm' },
  { key: 'tipAtv', label: 'Tip', type: 'select', formPage: 1, options: ['ATV', 'Quad', 'UTV', 'Side-by-Side', 'Buggy'] },
  { key: 'pogon', label: 'Pogon', type: 'select', formPage: 1, options: ['2WD', '4WD', 'Prebacivi 2WD/4WD'] },
  { key: 'boja', label: 'Boja', type: 'select', formPage: 1, options: ['Crna', 'Bijela', 'Siva', 'Crvena', 'Plava', 'Zelena', 'Narančasta', 'Maslinasta', 'Ostalo'] },
  // Page 2
  { key: 'konjskeSile', label: 'Konjske snage', type: 'number', formPage: 2, placeholder: 'npr. 44', unit: 'ks' },
  { key: 'registracija', label: 'Registracija do', type: 'text', formPage: 2, placeholder: 'MM/GGGG' },
  { key: 'vitlo', label: 'Vitlo', type: 'boolean', formPage: 2 },
  { key: 'krovniLuk', label: 'Krovni luk', type: 'boolean', formPage: 2 },
  { key: 'zastitaDna', label: 'Zaštita dna', type: 'boolean', formPage: 2 },
  { key: 'servisnaKnjiga', label: 'Servisna knjiga', type: 'boolean', formPage: 2 },
];

// ── Parts Fields ──────────────────────────────────────────

const PARTS_FIELDS: CategoryField[] = [
  // Page 1
  { key: 'zaVozilo', label: 'Za vozilo - Marka', type: 'text', formPage: 1, placeholder: 'npr. BMW' },
  { key: 'zaModel', label: 'Za vozilo - Model', type: 'text', formPage: 1, placeholder: 'npr. Serija 3' },
  { key: 'zaGodiste', label: 'Za vozilo - Godište', type: 'number', formPage: 1, placeholder: 'npr. 2018' },
  { key: 'kategorijaDijela', label: 'Kategorija dijela', type: 'text', formPage: 1, placeholder: 'npr. Motor i mjenjač' },
  { key: 'stanjeDijela', label: 'Stanje dijela', type: 'select', formPage: 1, options: ['Novo', 'Rabljeno', 'Obnovljeno', 'Ostalo'] },
  // Page 2
  { key: 'oemBroj', label: 'Originalni broj dijela (OEM)', type: 'text', formPage: 2, placeholder: 'npr. 11 51 7 588 096' },
  { key: 'proizvodacDijela', label: 'Proizvođač dijela', type: 'select', formPage: 2, options: ['Original', 'Aftermarket', 'Sport / Tuning'] },
  { key: 'garancija', label: 'Garancija', type: 'boolean', formPage: 2 },
  { key: 'dostavaMoguca', label: 'Dostava moguća', type: 'boolean', formPage: 2 },
];

// ── Main export ───────────────────────────────────────────

export function getCategoryFields(category: string, vehicleType?: VehicleType): CategoryField[] {
  const c = category.toLowerCase();

  // Parts check first
  if (vehicleType === 'parts' || c.includes('dijelovi')) return PARTS_FIELDS;

  // Vehicle type specific
  if (c.includes('vozila') || c.includes('motocikl') || c.includes('bicikl') || c.includes('kamper') || c.includes('nautika') || c.includes('plovil') || c.includes('teretna') || c.includes('atv') || c.includes('quad') || c === 'automobili') {
    switch (vehicleType) {
      case 'motorcycle': return MOTORCYCLE_FIELDS;
      case 'bicycle': return BICYCLE_FIELDS;
      case 'truck': return TRUCK_FIELDS;
      case 'camper': return CAMPER_FIELDS;
      case 'boat': return BOAT_FIELDS;
      case 'atv': return ATV_FIELDS;
      default: return VEHICLE_FIELDS;
    }
  }

  // Existing logic unchanged
  if (c.includes('nekretnin')) return NEKRETNINE_FIELDS;
  if (c.includes('mobilni')) return MOBILNI_FIELDS;
  if (c.includes('elektronika') || c.includes('tehnika') || c.includes('računari')) return ELEKTRONIKA_FIELDS;
  if (c.includes('cipele') || c.includes('obuća')) return CIPELE_FIELDS;
  if (c.includes('moda') || c.includes('odjeća') || c.includes('odijelo') || c.includes('ženska') || c.includes('muška')) return MODA_FIELDS;
  if (c.includes('sport') || c.includes('fitnes')) return SPORT_FIELDS;
  return [];
}
