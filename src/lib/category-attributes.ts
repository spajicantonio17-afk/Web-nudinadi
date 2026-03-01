// ── Category-Specific Attribute Definitions ──────────────────
// Used by the Upload form to render dynamic fields per category.

export type AttributeValues = Record<string, string | number | boolean | string[]>;

export interface CategoryField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'button-select';
  formPage: 1 | 2 | 3;
  options?: string[];
  placeholder?: string;
  unit?: string;
  dependsOn?: string;
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
  { key: 'pogon',          label: 'Pogon',             type: 'select', formPage: 2, options: ['Prednji', 'Zadnji', '4x4 (stalni)', '4x4 (povremeni)'] },
  { key: 'brVrata',        label: 'Broj vrata',        type: 'select', formPage: 2, options: ['2', '3', '4', '5'] },
  { key: 'tezina',         label: 'Masa/Težina (KG)',  type: 'number', formPage: 2, placeholder: 'npr. 1450', unit: 'kg' },
  { key: 'registriran',    label: 'Registriran?',      type: 'boolean', formPage: 2 },
  { key: 'registracija',   label: 'Registracija do',   type: 'text',   formPage: 2, placeholder: 'MM/GGGG', dependsOn: 'registriran' },
  // Row 1: Servisna knjiga | Jel auto udareno bilo?
  { key: 'servisnaKnjiga', label: 'Servisna knjiga',           type: 'boolean', formPage: 2 },
  { key: 'udareno',        label: 'Jel auto udareno bilo?',    type: 'boolean', formPage: 2 },
  // Row 2: ABS | Jel auto u voznom stanju?
  { key: 'abs',            label: 'ABS',                       type: 'boolean', formPage: 2 },
  { key: 'voznoStanje',    label: 'Jel auto u voznom stanju?', type: 'boolean', formPage: 2 },
  // Row 3: ESP / ASR | Jel auto u kompletu?
  { key: 'esp',            label: 'ESP / ASR',                 type: 'boolean', formPage: 2 },
  { key: 'uKompletu',      label: 'Jel auto u kompletu?',      type: 'boolean', formPage: 2 },
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
  { key: 'siber',              label: 'Šiber',                  type: 'boolean', formPage: 3 },
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
  // Page 3 — equipment (Extra from OLX)
  { key: 'senzorKise',         label: 'Senzor kiše',            type: 'boolean', formPage: 3 },
  { key: 'senzorSvjetla',      label: 'Senzor auto. svjetla',   type: 'boolean', formPage: 3 },
  { key: 'hillAssist',         label: 'Hill Assist',            type: 'boolean', formPage: 3 },
  { key: 'masazaSjedista',     label: 'Masaža sjedišta',        type: 'boolean', formPage: 3 },
  { key: 'naslonZaRuku',       label: 'Naslon za ruku',         type: 'boolean', formPage: 3 },
  { key: 'alarm',              label: 'Alarm',                  type: 'boolean', formPage: 3 },
  { key: 'centralnaBrava',     label: 'Centralna brava',        type: 'boolean', formPage: 3 },
  { key: 'servoVolan',         label: 'Servo volan',            type: 'boolean', formPage: 3 },
  { key: 'turbo',              label: 'Turbo',                  type: 'boolean', formPage: 3 },
  { key: 'isofix',             label: 'ISOFIX',                 type: 'boolean', formPage: 3 },
  { key: 'ocarinjen',          label: 'Ocarinjen',              type: 'boolean', formPage: 3 },
];

// ── Real Estate Fields ────────────────────────────────────

const NEKRETNINE_FIELDS: CategoryField[] = [
  // Page 1 — Grunddaten (Quick-Tap Daten kommen über attributes)
  { key: 'povrsina',        label: 'Površina (m²)',          type: 'number', formPage: 1, placeholder: 'npr. 65' },
  { key: 'godinaIzgradnje', label: 'Godina izgradnje',       type: 'number', formPage: 1, placeholder: 'npr. 2005' },
  { key: 'brojKupatila',    label: 'Broj kupatila',          type: 'select', formPage: 1, options: ['1', '2', '3', '4', '5+'] },
  { key: 'ukupnoEtaza',     label: 'Ukupno etaža u zgradi', type: 'number', formPage: 1, placeholder: 'npr. 6' },
  // Page 2 — Dodatne informacije
  { key: 'energetskirazred', label: 'Energetski razred',    type: 'select', formPage: 2, options: ['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'] },
  { key: 'orijentacija',    label: 'Orijentacija',           type: 'select', formPage: 2, options: ['Sjever', 'Jug', 'Zapad', 'Istok'] },
  { key: 'parking',         label: 'Parking',                type: 'select', formPage: 2, options: ['Nema', 'Ulična', 'Garaža', 'Parkiralište'] },
  { key: 'vrstaPoda',       label: 'Vrsta poda',             type: 'select', formPage: 2, options: ['Parket', 'Laminat', 'Brodski', 'Keramika', 'Beton', 'Ostalo'] },
  // Page 2 — Checkboxen
  { key: 'balkon',          label: 'Balkon / Terasa',         type: 'boolean', formPage: 2 },
  { key: 'lift',            label: 'Lift',                    type: 'boolean', formPage: 2 },
  { key: 'podrum',          label: 'Podrum',                  type: 'boolean', formPage: 2 },
  { key: 'internet',        label: 'Internet / Kabel',        type: 'boolean', formPage: 2 },
  { key: 'klimatizovano',   label: 'Klima uređaj',            type: 'boolean', formPage: 2 },
  { key: 'alarm',           label: 'Alarmni sustav',           type: 'boolean', formPage: 2 },
  { key: 'blindiranaVrata', label: 'Blindirana vrata',        type: 'boolean', formPage: 2 },
  { key: 'videoNadzor',     label: 'Video nadzor',            type: 'boolean', formPage: 2 },
  { key: 'kuciLjubimci',    label: 'Kućni ljubimci dozvoljeni', type: 'boolean', formPage: 2 },
  { key: 'uknjizeno',       label: 'Uknjiženo / ZK',          type: 'boolean', formPage: 2 },
];

// ── Mobiteli i oprema (per-type) ─────────────────────────

export function getMobitelFields(subType: string): CategoryField[] {
  const s = subType.toLowerCase();
  const fields: CategoryField[] = [];

  const isPhone  = ['mobitel', 'iphone', 'samsung', 'xiaomi', 'redmi', 'poco', 'huawei', 'honor', 'oneplus', 'oppo', 'realme', 'nokia', 'motorola', 'sony', 'ostale marke'].some(t => s.includes(t));
  const isTablet = s.includes('tablet') || s.includes('ipad');
  const isWatch  = s.includes('pametn') || s.includes('fitness');
  const isAudio  = ['slušalic', 'slusalic', 'zvučni', 'zvucni', 'headset'].some(t => s.includes(t));
  const isCharger = ['punjač', 'punjac', 'powerbank', 'kabel'].some(t => s.includes(t));
  const isCase   = ['mask', 'stakl', 'folij'].some(t => s.includes(t));

  if (isPhone) {
    fields.push(
      { key: 'memorija',         label: 'Memorija',              type: 'select',  formPage: 1, options: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'] },
      { key: 'ram',              label: 'RAM',                   type: 'select',  formPage: 1, options: ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB', 'Ne znam'] },
      { key: 'boja',             label: 'Boja',                  type: 'select',  formPage: 1, options: ['Crna', 'Bijela', 'Siva', 'Srebrna', 'Plava', 'Crvena', 'Zelena', 'Zlatna', 'Roza', 'Ljubičasta', 'Narančasta', 'Bež', 'Ostalo'] },
      { key: 'zdravljeBaterije', label: 'Zdravlje baterije (%)', type: 'select',  formPage: 2, options: ['100%', '95-99%', '90-94%', '85-89%', '80-84%', '75-79%', 'Ispod 75%', 'Nova baterija', 'Ne znam'] },
      { key: 'stanjeEkrana',     label: 'Stanje ekrana',         type: 'select',  formPage: 2, options: ['Savršeno', 'Sitne ogrebotine', 'Vidljive ogrebotine', 'Napuknuće', 'Zamijenjen ekran'] },
      { key: 'dualSim',          label: 'Dual SIM',              type: 'boolean', formPage: 2 },
      { key: 'esim',             label: 'eSIM',                  type: 'boolean', formPage: 2 },
      { key: 'punjac',           label: 'Punjač uključen',       type: 'boolean', formPage: 2 },
      { key: 'slusalice',        label: 'Slušalice uključene',   type: 'boolean', formPage: 2 },
      { key: 'vodootporan',      label: 'Vodootporan',           type: 'boolean', formPage: 2 },
      { key: 'fabrickaKutija',   label: 'Fabrička kutija',       type: 'boolean', formPage: 2 },
      { key: 'ostecen',          label: 'Oštećen',               type: 'boolean', formPage: 2 },
    );
  } else if (isTablet) {
    fields.push(
      { key: 'memorija',       label: 'Memorija',        type: 'select',  formPage: 1, options: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'] },
      { key: 'dijagonala',     label: 'Dijagonala',      type: 'select',  formPage: 1, options: ['7"', '8"', '9"', '10"', '11"', '12.9"', '13"', 'Ostalo'] },
      { key: 'boja',           label: 'Boja',            type: 'select',  formPage: 1, options: ['Crna', 'Bijela', 'Siva', 'Srebrna', 'Plava', 'Zlatna', 'Roza', 'Ostalo'] },
      { key: 'stanjeEkrana',   label: 'Stanje ekrana',   type: 'select',  formPage: 2, options: ['Savršeno', 'Sitne ogrebotine', 'Vidljive ogrebotine', 'Napuknuće', 'Zamijenjen ekran'] },
      { key: 'punjac',         label: 'Punjač uključen', type: 'boolean', formPage: 2 },
      { key: 'fabrickaKutija', label: 'Fabrička kutija', type: 'boolean', formPage: 2 },
    );
  } else if (isWatch) {
    fields.push(
      { key: 'boja',           label: 'Boja',            type: 'select',        formPage: 1, options: ['Crna', 'Bijela', 'Siva', 'Srebrna', 'Zlatna', 'Roza', 'Plava', 'Zelena', 'Ostalo'] },
      { key: 'kompatibilnost', label: 'Kompatibilnost',  type: 'button-select', formPage: 1, options: ['iOS', 'Android', 'Oboje'] },
      { key: 'vodootporan',    label: 'Vodootporan',     type: 'boolean',       formPage: 1 },
      { key: 'fabrickaKutija', label: 'Fabrička kutija', type: 'boolean',       formPage: 1 },
    );
  } else if (isAudio) {
    fields.push(
      { key: 'tip',            label: 'Tip',             type: 'button-select', formPage: 1, options: ['In-ear', 'Over-ear', 'On-ear', 'Zvučnik', 'Ostalo'] },
      { key: 'bezicne',        label: 'Bežične',         type: 'boolean',       formPage: 1 },
      { key: 'boja',           label: 'Boja',            type: 'select',        formPage: 1, options: ['Crna', 'Bijela', 'Siva', 'Crvena', 'Plava', 'Zelena', 'Ostalo'] },
      { key: 'fabrickaKutija', label: 'Fabrička kutija', type: 'boolean',       formPage: 1 },
    );
  } else if (isCharger || isCase) {
    fields.push(
      { key: 'kompatibilnost', label: 'Kompatibilnost', type: 'text',   formPage: 1, placeholder: 'npr. iPhone 15, Samsung S24' },
      { key: 'boja',           label: 'Boja',           type: 'select', formPage: 1, options: ['Crna', 'Bijela', 'Prozirna', 'Plava', 'Crvena', 'Roza', 'Ostalo'] },
    );
  } else {
    // Dijelovi mobitela, Ostala oprema
    fields.push(
      { key: 'kompatibilnost', label: 'Kompatibilnost', type: 'text', formPage: 1, placeholder: 'npr. iPhone 14, Samsung A54' },
    );
  }

  return fields;
}

// ── Fashion / Clothing ────────────────────────────────────

export function getModaFields(subType: string): CategoryField[] {
  const s = subType.toLowerCase();
  const fields: CategoryField[] = [];

  // ── Non-clothing accessories (no size field) ──────────────

  const isNakit = s.includes('nakit') || s.includes('satov');
  const isTorbe = s.includes('torb') || s.includes('novčani') || s.includes('novcani') || s.includes('ruksak') || s.includes('ruksaci');
  const isNaocale = s.includes('naočale') || s.includes('naocale');

  if (isNakit) {
    const isWatch = ['ručni sat', 'rucni sat', 'satovi'].some(t => s.includes(t));
    fields.push(
      { key: 'materijal', label: 'Materijal', type: 'select', formPage: 1, options: ['Zlato', 'Srebro', 'Čelik', 'Koža', 'Biseri', 'Ostalo'] },
      { key: 'brand',     label: 'Brand',     type: 'text',   formPage: 1, placeholder: 'npr. Pandora, Swarovski' },
      { key: 'boja',      label: 'Boja',      type: 'select', formPage: 1, options: ['Zlatna', 'Srebrna', 'Crna', 'Bijela', 'Roza', 'Ostalo'] },
      { key: 'za',        label: 'Za',        type: 'button-select', formPage: 1, options: ['Žene', 'Muškarce', 'Unisex'] },
    );
    if (isWatch) {
      fields.push(
        { key: 'mehanizam',       label: 'Mehanizam',        type: 'button-select', formPage: 1, options: ['Kvarcni', 'Automatski', 'Mehanički'] },
        { key: 'originalnaKutija', label: 'Originalna kutija', type: 'boolean',       formPage: 1 },
      );
    }
    return fields;
  }

  if (isTorbe) {
    fields.push(
      { key: 'materijal', label: 'Materijal', type: 'select',        formPage: 1, options: ['Koža', 'Eko koža', 'Platno', 'Najlon', 'Ostalo'] },
      { key: 'brand',     label: 'Brand',     type: 'text',          formPage: 1, placeholder: 'npr. Michael Kors, Louis Vuitton' },
      { key: 'boja',      label: 'Boja',      type: 'select',        formPage: 1, options: ['Crna', 'Bijela', 'Smeđa', 'Bež', 'Crvena', 'Plava', 'Roza', 'Ostalo'] },
      { key: 'za',        label: 'Za',        type: 'button-select', formPage: 1, options: ['Žene', 'Muškarce', 'Unisex'] },
    );
    return fields;
  }

  if (isNaocale) {
    fields.push(
      { key: 'oblik',     label: 'Oblik',      type: 'button-select', formPage: 1, options: ['Aviator', 'Wayfarer', 'Cat-eye', 'Okrugle', 'Pravokutne', 'Ostalo'] },
      { key: 'brand',     label: 'Brand',      type: 'text',          formPage: 1, placeholder: 'npr. Ray-Ban, Oakley' },
      { key: 'bojaOkvira', label: 'Boja okvira', type: 'select',       formPage: 1, options: ['Crna', 'Smeđa', 'Zlatna', 'Srebrna', 'Šareno', 'Ostalo'] },
      { key: 'uvZastita', label: 'UV zaštita', type: 'boolean',       formPage: 1 },
    );
    return fields;
  }

  // ── Clothing: shared base fields (all clothing types) ─────

  const BOJE = ['Crna', 'Bijela', 'Siva', 'Crvena', 'Plava', 'Zelena', 'Žuta', 'Narančasta', 'Roza', 'Ljubičasta', 'Smeđa', 'Bež', 'Ostalo'];

  fields.push(
    { key: 'boja',      label: 'Boja',      type: 'select',        formPage: 1, options: BOJE },
    { key: 'brand',     label: 'Brand',     type: 'text',          formPage: 1, placeholder: 'npr. Nike, Zara' },
    { key: 'materijal', label: 'Materijal', type: 'text',          formPage: 1, placeholder: 'npr. Pamuk, Poliester' },
    { key: 'sezona',    label: 'Sezona',    type: 'button-select', formPage: 1, options: ['Proljeće/Ljeto', 'Jesen/Zima', 'Sva godišnja doba'] },
  );

  // ── Sub-type specific fields ──────────────────────────────

  const isTop       = ['gornji dijel', 'majic', 'top', 'bluz', 'košulj', 'kosulj', 'džemper', 'dzemper', 'vest'].some(t => s.includes(t));
  const isBottom    = ['donji dijel', 'hlač', 'hlac', 'jeans', 'šorc', 'sorc', 'bermud', 'tajic'].some(t => s.includes(t));
  const isDress     = ['haljin', 'kombinezon'].some(t => s.includes(t));
  const isOuterwear = ['vanjska odjeća', 'vanjska odjeca', 'jakn', 'kaput'].some(t => s.includes(t));
  const isSuit      = ['odijel', 'formalna odjeća', 'formalna odjeca'].some(t => s.includes(t));
  const isUnderwear = ['rublje', 'spavaći', 'spavaci'].some(t => s.includes(t));
  const isSportWear = ['sportska', 'sport i'].some(t => s.includes(t));
  const isKids      = ['dječj', 'djecj', 'za djecu', 'za bebe'].some(t => s.includes(t));
  const isMaskare   = ['maškar', 'maskar', 'kostim'].some(t => s.includes(t));
  const isRadna     = ['radna', 'zaštitna', 'zastitna'].some(t => s.includes(t));

  if (isTop) {
    fields.push(
      { key: 'velicina',     label: 'Veličina',       type: 'button-select', formPage: 1, options: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
      { key: 'vrstaRukava',  label: 'Vrsta rukava',   type: 'button-select', formPage: 1, options: ['Kratki rukavi', 'Dugi rukavi', '3/4 rukavi', 'Bez rukava', 'Ostalo'] },
      { key: 'izrezNaVratu', label: 'Izrez na vratu', type: 'button-select', formPage: 1, options: ['V neck', 'Crew', 'Ostalo'] },
      { key: 'dzep',         label: 'Džep',           type: 'boolean',       formPage: 1 },
    );
  } else if (isBottom) {
    fields.push(
      { key: 'velicina', label: 'Veličina', type: 'button-select', formPage: 1, options: ['26', '27', '28', '29', '30', '31', '32', '33', '34', '36', '38', '40', '42', '44', '46', '48'] },
      { key: 'kroj',     label: 'Kroj',     type: 'button-select', formPage: 1, options: ['Slim', 'Regular', 'Wide', 'Skinny', 'Bootcut', 'Straight'] },
      { key: 'vrsta',    label: 'Vrsta',    type: 'button-select', formPage: 1, options: ['Jeans', 'Chino', 'Cargo', 'Jogger', 'Šorc', 'Bermude', 'Tajice', 'Leginsi'] },
    );
  } else if (isDress) {
    fields.push(
      { key: 'velicina', label: 'Veličina', type: 'button-select', formPage: 1, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '34', '36', '38', '40', '42', '44', '46', '48'] },
      { key: 'duzina',  label: 'Dužina',  type: 'button-select', formPage: 1, options: ['Mini', 'Midi', 'Maxi'] },
      { key: 'vrsta',   label: 'Vrsta',   type: 'button-select', formPage: 1, options: ['Haljina', 'Kombinezon'] },
    );
  } else if (isOuterwear) {
    fields.push(
      { key: 'velicina',    label: 'Veličina',    type: 'button-select', formPage: 1, options: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
      { key: 'vrsta',       label: 'Vrsta',       type: 'button-select', formPage: 1, options: ['Jakna', 'Kaput', 'Parka', 'Prsluk', 'Bunda', 'Kišna jakna', 'Pernata jakna'] },
      { key: 'kapuljaca',   label: 'Kapuljača',   type: 'boolean',       formPage: 1 },
      { key: 'vodootporna', label: 'Vodootporna', type: 'boolean',       formPage: 1 },
    );
  } else if (isSuit) {
    fields.push(
      { key: 'velicinaSakoa', label: 'Veličina sakoa', type: 'button-select', formPage: 1, options: ['44', '46', '48', '50', '52', '54', '56', '58'] },
      { key: 'velicinaHlaca', label: 'Veličina hlača', type: 'button-select', formPage: 1, options: ['44', '46', '48', '50', '52', '54', '56'] },
      { key: 'komplet',       label: 'Komplet',        type: 'boolean',       formPage: 1 },
    );
  } else if (isUnderwear) {
    fields.push(
      { key: 'velicina', label: 'Veličina', type: 'button-select', formPage: 1, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
      { key: 'vrsta',    label: 'Vrsta',    type: 'button-select', formPage: 1, options: ['Grudnjak', 'Gaćice', 'Pidžama', 'Kućni ogrtač', 'Komplet'] },
    );
  } else if (isSportWear) {
    fields.push(
      { key: 'velicina', label: 'Veličina', type: 'button-select', formPage: 1, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
      { key: 'sport',    label: 'Sport',    type: 'button-select', formPage: 1, options: ['Fitness', 'Trčanje', 'Nogomet', 'Plivanje', 'Ski', 'Ostalo'] },
    );
  } else if (isKids) {
    fields.push(
      { key: 'velicina', label: 'Veličina (cm)', type: 'button-select', formPage: 1, options: ['56', '62', '68', '74', '80', '86', '92', '98', '104', '110', '116', '122', '128', '134', '140', '146', '152', '158', '164', '170', '176'] },
      { key: 'spol',     label: 'Spol',          type: 'button-select', formPage: 1, options: ['Dječak', 'Djevojčica', 'Unisex'] },
    );
  } else if (isMaskare) {
    fields.push(
      { key: 'velicina', label: 'Veličina', type: 'button-select', formPage: 1, options: ['S', 'M', 'L', 'XL', 'XXL', 'One size'] },
    );
  } else if (isRadna) {
    fields.push(
      { key: 'velicina', label: 'Veličina', type: 'button-select', formPage: 1, options: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    );
  } else {
    // Fallback: generic clothing sizes (Casual, Business, Svečano, Specijalne linije, Ostalo)
    fields.push(
      { key: 'velicina', label: 'Veličina', type: 'button-select', formPage: 1, options: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    );
  }

  return fields;
}

// ── Shoes ─────────────────────────────────────────────────

const CIPELE_FIELDS: CategoryField[] = [
  { key: 'velicina',  label: 'Veličina',  type: 'select',        formPage: 1, options: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48'] },
  { key: 'boja',      label: 'Boja',      type: 'select',        formPage: 1, options: ['Crna', 'Bijela', 'Siva', 'Smeđa', 'Bež', 'Crvena', 'Plava', 'Zelena', 'Roza', 'Ostalo'] },
  { key: 'brand',     label: 'Brand',     type: 'text',          formPage: 1, placeholder: 'npr. Nike, Adidas' },
  { key: 'materijal', label: 'Materijal', type: 'text',          formPage: 1, placeholder: 'npr. Koža, Platno' },
  { key: 'sezona',    label: 'Sezona',    type: 'button-select', formPage: 1, options: ['Proljeće/Ljeto', 'Jesen/Zima', 'Sva godišnja doba'] },
];

// ── Sport i rekreacija (per-type) ────────────────────────

export function getSportFields(subType: string): CategoryField[] {
  const s = subType.toLowerCase();
  const fields: CategoryField[] = [];

  // Base for all sport items
  fields.push(
    { key: 'brand',  label: 'Brand',  type: 'text',          formPage: 1, placeholder: 'npr. Nike, Adidas, Decathlon' },
    { key: 'stanje', label: 'Stanje', type: 'button-select', formPage: 1, options: ['Novo', 'Kao novo', 'Korišteno'] },
  );

  const isFitness    = ['fitness', 'fitnes', 'teretana', 'uteg', 'bučic', 'bucic', 'klup', 'trak', 'yoga', 'pilates', 'crossfit', 'sprav'].some(t => s.includes(t));
  const isBiciklizam = s.includes('bicikl');
  const isNogometTimski = ['nogomet', 'košark', 'kosark', 'rukomet', 'timski'].some(t => s.includes(t));
  const isTenis      = ['tenis', 'badminton', 'reket'].some(t => s.includes(t));
  const isZimski     = ['zimski', 'skij', 'snowboard', 'klizaljk', 'sanjk'].some(t => s.includes(t));
  const isVodeni     = ['vodeni', 'kajak', 'neopren', 'plivač', 'plivac', 'ronilaček', 'ronilack', 'sup dask', 'surfanj', 'kite'].some(t => s.includes(t));
  const isPlaninarenje = ['planinar', 'kampiranj', 'šator', 'sator', 'vreć', 'vrec', 'ruksak', 'štapov', 'stapov'].some(t => s.includes(t));
  const isRibolov    = ['ribolov', 'mašinic', 'masinic', 'varalic', 'ehosond', 'čamac za ribolov', 'camac za ribolov'].some(t => s.includes(t));
  const isBorilacki  = ['borilačk', 'borilack', 'kimon', 'ring', 'tatami'].some(t => s.includes(t));
  const isKoturaljke = ['koturaljk', 'skateboard', 'romobil'].some(t => s.includes(t));
  const isDresovi    = s.includes('dresov') || s.includes('kolekcij');
  const isAirsoft    = ['airsoft', 'paintball'].some(t => s.includes(t));

  if (isFitness) {
    fields.push(
      { key: 'tip',    label: 'Tip',        type: 'button-select', formPage: 1, options: ['Utezi/Bučice', 'Klupa', 'Traka za trčanje', 'Sprava', 'Dodaci prehrani', 'Yoga/Pilates', 'Ostalo'] },
      { key: 'tezina', label: 'Težina (kg)', type: 'number',        formPage: 1, placeholder: 'npr. 20' },
    );
  } else if (isBiciklizam) {
    fields.push(
      { key: 'tip',      label: 'Tip',      type: 'button-select', formPage: 1, options: ['Odjeća', 'Kaciga', 'GPS/Računalo', 'Sjedalica', 'Košare/Tašne', 'Naočale', 'Ostalo'] },
      { key: 'velicina', label: 'Veličina', type: 'text',          formPage: 1, placeholder: 'npr. M, 58cm' },
    );
  } else if (isNogometTimski) {
    fields.push(
      { key: 'tip',      label: 'Tip',      type: 'button-select', formPage: 1, options: ['Kopačke', 'Lopte', 'Dresovi/Oprema', 'Golovi/Mreže', 'Zaštita', 'Ostalo'] },
      { key: 'velicina', label: 'Veličina', type: 'text',          formPage: 1, placeholder: 'npr. 42, M' },
    );
  } else if (isTenis) {
    fields.push(
      { key: 'tip', label: 'Tip', type: 'button-select', formPage: 1, options: ['Reket', 'Lopte/Perje', 'Obuća', 'Mreže', 'Torbe', 'Ostalo'] },
    );
  } else if (isZimski) {
    fields.push(
      { key: 'tip',        label: 'Tip',        type: 'button-select', formPage: 1, options: ['Skije', 'Snowboard', 'Klizaljke', 'Sanjke', 'Odjeća/Rukavice', 'Kaciga/Naočale', 'Obuća'] },
      { key: 'velicina',   label: 'Veličina',   type: 'text',          formPage: 1, placeholder: 'npr. 170cm, 42, M' },
      { key: 'vrsta',      label: 'Vrsta',      type: 'select',        formPage: 1, options: ['All Round', 'All Mountain', 'Freeride', 'Freestyle/Park', 'Race', 'Powder', 'Ostalo'], dependsOn: 'tip' },
      { key: 'saVezovima', label: 'Sa vezovima', type: 'boolean',      formPage: 1 },
      { key: 'komplet',   label: 'Komplet set', type: 'boolean',       formPage: 1 },
    );
  } else if (isVodeni) {
    fields.push(
      { key: 'tip',      label: 'Tip',      type: 'button-select', formPage: 1, options: ['Kajak/Kanu', 'Neopren', 'SUP daska', 'Ronilačka oprema', 'Surfanje/Kite', 'Plivačke naočale/Kape', 'Ostalo'] },
      { key: 'velicina', label: 'Veličina', type: 'text',          formPage: 1, placeholder: 'npr. M, XL' },
    );
  } else if (isPlaninarenje) {
    fields.push(
      { key: 'tip',       label: 'Tip',              type: 'button-select', formPage: 1, options: ['Šator', 'Vreća za spavanje', 'Ruksak', 'Cipele', 'Kuhalo/Oprema', 'GPS', 'Štapovi', 'Ostalo'] },
      { key: 'kapacitet', label: 'Kapacitet (osobe)', type: 'select',       formPage: 1, options: ['1', '2', '3', '4', '5+'] },
    );
  } else if (isRibolov) {
    fields.push(
      { key: 'tip',    label: 'Tip',         type: 'button-select', formPage: 1, options: ['Štap', 'Mašinica/Kolut', 'Čamac', 'Varalice/Mamci', 'Ehosonda', 'Odjeća/Čizme', 'Oprema', 'Ostalo'] },
      { key: 'duzina', label: 'Dužina (m)',  type: 'number',        formPage: 1, placeholder: 'npr. 3.6' },
    );
  } else if (isBorilacki) {
    fields.push(
      { key: 'tip',      label: 'Tip',      type: 'button-select', formPage: 1, options: ['Kimono', 'Rukavice', 'Vreća', 'Zaštitna oprema', 'Ring/Tatami', 'Ostalo'] },
      { key: 'velicina', label: 'Veličina', type: 'button-select', formPage: 1, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    );
  } else if (isKoturaljke) {
    fields.push(
      { key: 'tip',      label: 'Tip',      type: 'button-select', formPage: 1, options: ['Koturaljke', 'Skateboard', 'Romobil', 'Ostalo'] },
      { key: 'velicina', label: 'Veličina', type: 'text',          formPage: 1, placeholder: 'npr. 38, M' },
    );
  } else if (isDresovi) {
    fields.push(
      { key: 'velicina', label: 'Veličina',   type: 'button-select', formPage: 1, options: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
      { key: 'tim',      label: 'Tim/Igrač', type: 'text',          formPage: 1, placeholder: 'npr. Real Madrid, Messi' },
    );
  } else if (isAirsoft) {
    fields.push(
      { key: 'tip', label: 'Tip', type: 'button-select', formPage: 1, options: ['Oružje', 'Zaštitna oprema', 'Kuglice/Boje', 'Ostalo'] },
    );
  } else {
    // Golf, Ostala sportska oprema — fallback
    fields.push(
      { key: 'godinaProizvodnje', label: 'Godište', type: 'number', formPage: 1, placeholder: 'npr. 2023' },
    );
  }

  return fields;
}

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

// ── Camper Fields ───────────────────────────���─────────────

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

// ── Prikolice Fields ─────────────────────────────────────

const PRIKOLICE_FIELDS: CategoryField[] = [
  { key: 'godiste', label: 'Godište', type: 'number', formPage: 1, placeholder: 'npr. 2020' },
  { key: 'nosivost', label: 'Nosivost (kg)', type: 'number', formPage: 1, placeholder: 'npr. 750' },
  { key: 'ukupnaMasa', label: 'Ukupna masa (kg)', type: 'number', formPage: 1, placeholder: 'npr. 1300' },
  { key: 'registracija', label: 'Registracija do', type: 'text', formPage: 1, placeholder: 'npr. 06/2026' },
  { key: 'duzinaM', label: 'Dužina (m)', type: 'number', formPage: 1, placeholder: 'npr. 4.5' },
  { key: 'sirinaM', label: 'Širina (m)', type: 'number', formPage: 1, placeholder: 'npr. 2.0' },
  { key: 'kocnice', label: 'Kočnice', type: 'select', formPage: 1, options: ['S kočnicama', 'Bez kočnica'] },
  { key: 'materijal', label: 'Materijal', type: 'select', formPage: 1, options: ['Čelik', 'Aluminij', 'Galvanizirani čelik', 'Ostalo'] },
];

// ── Ostala Vozila Fields ─────────────────────────────────

const OSTALA_VOZILA_FIELDS: CategoryField[] = [
  { key: 'godiste', label: 'Godište', type: 'number', formPage: 1, placeholder: 'npr. 2020' },
  { key: 'stanje', label: 'Stanje', type: 'select', formPage: 1, options: ['Novo', 'Korišteno', 'Za dijelove'] },
  { key: 'satiRada', label: 'Sati rada', type: 'number', formPage: 1, placeholder: 'npr. 1500' },
  { key: 'registracija', label: 'Registracija do', type: 'text', formPage: 1, placeholder: 'npr. 06/2026' },
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

// ── Nekretnine Feature Checkboxes per Sub-Type ───────────
const NEKRETNINE_FEATURES: Record<string, { key: string; label: string }[]> = {
  stanovi: [
    { key: 'lift', label: 'Lift' },
    { key: 'balkon', label: 'Balkon' },
    { key: 'terasa', label: 'Terasa' },
    { key: 'garaza', label: 'Garaža' },
    { key: 'parking', label: 'Parking' },
    { key: 'klima', label: 'Klima' },
    { key: 'internet', label: 'Internet' },
    { key: 'podrum', label: 'Podrum' },
    { key: 'alarm', label: 'Alarm' },
    { key: 'blindiranaVrata', label: 'Blindirana vrata' },
    { key: 'videoNadzor', label: 'Video nadzor' },
    { key: 'uknjizeno', label: 'Uknjiženo / ZK' },
    { key: 'kucniLjubimci', label: 'Kućni ljubimci' },
  ],
  kuce: [
    { key: 'garaza', label: 'Garaža' },
    { key: 'dvoriste', label: 'Dvorište / Vrt' },
    { key: 'balkon', label: 'Balkon' },
    { key: 'bazen', label: 'Bazen' },
    { key: 'klima', label: 'Klima' },
    { key: 'internet', label: 'Internet' },
    { key: 'podrum', label: 'Podrum' },
    { key: 'alarm', label: 'Alarm' },
    { key: 'kamin', label: 'Kamin' },
    { key: 'uknjizeno', label: 'Uknjiženo / ZK' },
  ],
  poslovni: [
    { key: 'lift', label: 'Lift' },
    { key: 'klima', label: 'Klima' },
    { key: 'internet', label: 'Internet' },
    { key: 'parking', label: 'Parking' },
    { key: 'alarm', label: 'Alarm' },
    { key: 'videoNadzor', label: 'Video nadzor' },
    { key: 'pristupInvalidi', label: 'Pristup za invalide' },
    { key: 'uknjizeno', label: 'Uknjiženo / ZK' },
  ],
  zemljista: [
    { key: 'pristupniPut', label: 'Pristupni put' },
    { key: 'ogradeno', label: 'Ograđeno' },
    { key: 'uknjizeno', label: 'Uknjiženo / ZK' },
  ],
  garaze: [
    { key: 'struja', label: 'Struja' },
    { key: 'ventilacija', label: 'Ventilacija' },
    { key: 'videoNadzor', label: 'Video nadzor' },
    { key: 'pristup24h', label: 'Pristup 24/7' },
  ],
  vikendice: [
    { key: 'dvoriste', label: 'Dvorište' },
    { key: 'bazen', label: 'Bazen' },
    { key: 'klima', label: 'Klima' },
    { key: 'kamin', label: 'Kamin' },
    { key: 'internet', label: 'Internet' },
    { key: 'uknjizeno', label: 'Uknjiženo / ZK' },
  ],
  sobe: [
    { key: 'internet', label: 'Internet' },
    { key: 'klima', label: 'Klima' },
    { key: 'kucniLjubimci', label: 'Kućni ljubimci' },
    { key: 'ukljuceniTroskovi', label: 'Uključeni troškovi' },
  ],
  montazni: [
    { key: 'garaza', label: 'Garaža' },
    { key: 'dvoriste', label: 'Dvorište' },
    { key: 'klima', label: 'Klima' },
    { key: 'internet', label: 'Internet' },
    { key: 'uknjizeno', label: 'Uknjiženo / ZK' },
  ],
  skladista: [
    { key: 'struja', label: 'Struja' },
    { key: 'voda', label: 'Voda' },
    { key: 'rampaUtovar', label: 'Rampa za utovar' },
    { key: 'parkingKamioni', label: 'Parking za kamione' },
    { key: 'alarm', label: 'Alarm' },
    { key: 'uknjizeno', label: 'Uknjiženo / ZK' },
  ],
  stan_na_dan: [
    { key: 'klima', label: 'Klima' },
    { key: 'internet', label: 'Internet' },
    { key: 'parking', label: 'Parking' },
    { key: 'balkon', label: 'Balkon' },
    { key: 'lift', label: 'Lift' },
  ],
};

// ── Nekretnine per-Type Fields ───────────────────────────

export function getNekretnineFields(subType: string): CategoryField[] {
  const s = subType.toLowerCase();
  const fields: CategoryField[] = [];

  // === Page 1: Hauptfelder ===

  // Kvadratura m² (alle Typen)
  fields.push({
    key: 'kvadraturaM2', label: 'Kvadratura (m²)', type: 'number',
    formPage: 1, placeholder: 'Unesite tačnu kvadraturu',
  });

  // Površina zemljišta (Kuće, Vikendice, Montažni)
  if (['kuć', 'vikendic', 'montažn', 'montazn'].some(t => s.includes(t))) {
    fields.push({
      key: 'povrsinaZemljistaM2', label: 'Površina zemljišta (m²)', type: 'number',
      formPage: 1, placeholder: 'Unesite površinu okućnice',
    });
  }

  // Godina izgradnje (nicht für Zemljišta, Sobe)
  if (!s.includes('zemljišt') && !s.includes('zemljist') && !s.includes('sob')) {
    fields.push({
      key: 'godinaIzgradnje', label: 'Godina izgradnje', type: 'number',
      formPage: 1, placeholder: 'npr. 2005',
    });
  }

  // Grijanje (Stanovi, Kuće, Vikendice, Montažni, Stan na dan)
  if (['stanovi', 'apartman', 'kuć', 'vikendic', 'montažn', 'montazn', 'stan na dan'].some(t => s.includes(t))) {
    fields.push({
      key: 'grijanje', label: 'Grijanje', type: 'select',
      formPage: 1, options: ['Centralno', 'Etažno plin', 'Etažno struja', 'Na drva/pelete', 'Klima', 'Podno grijanje', 'Bez grijanja', 'Ostalo'],
    });
  }

  // Ukupno katova u zgradi (nur Stanovi)
  if (s.includes('stanovi') || s.includes('apartman')) {
    fields.push({
      key: 'ukupnoKatova', label: 'Ukupno katova u zgradi', type: 'number', formPage: 1,
    });
  }

  // === Page 2: Dodatne pogodnosti (Checkboxen) ===

  // Finde passende Feature-Liste
  let featureKey = 'stanovi';
  if (s.includes('stanovi') || s.includes('apartman')) featureKey = 'stanovi';
  else if (s.includes('kuć')) featureKey = 'kuce';
  else if (s.includes('poslovni')) featureKey = 'poslovni';
  else if (s.includes('zemljišt') || s.includes('zemljist')) featureKey = 'zemljista';
  else if (s.includes('garaž') || s.includes('garaz')) featureKey = 'garaze';
  else if (s.includes('vikendic')) featureKey = 'vikendice';
  else if (s.includes('sob')) featureKey = 'sobe';
  else if (s.includes('montažn') || s.includes('montazn')) featureKey = 'montazni';
  else if (s.includes('skladišt') || s.includes('skladist') || s.includes('hal')) featureKey = 'skladista';
  else if (s.includes('stan na dan')) featureKey = 'stan_na_dan';

  const features = NEKRETNINE_FEATURES[featureKey] || [];
  features.forEach(f => {
    fields.push({ key: f.key, label: f.label, type: 'boolean', formPage: 2 });
  });

  return fields;
}

// ── Računala i IT Feature Checkboxes per Sub-Type ────────
const RACUNALA_FEATURES: Record<string, { key: string; label: string }[]> = {
  laptopi: [
    { key: 'touchscreen', label: 'Touchscreen' },
    { key: 'webcam', label: 'Webcam' },
    { key: 'tastaturaNasaSlova', label: 'Tastatura naša slova' },
    { key: 'torba', label: 'Torba uključena' },
    { key: 'fingerprint', label: 'Fingerprint' },
  ],
  desktop: [
    { key: 'monitor', label: 'Monitor uključen' },
    { key: 'tastatura', label: 'Tastatura uključena' },
    { key: 'mis', label: 'Miš uključen' },
    { key: 'zvucnici', label: 'Zvučnici uključeni' },
    { key: 'wifi', label: 'WiFi' },
    { key: 'bluetooth', label: 'Bluetooth' },
  ],
  monitori: [
    { key: 'hdr', label: 'HDR' },
    { key: 'freesync', label: 'FreeSync / G-Sync' },
    { key: 'zvucnici', label: 'Ugrađeni zvučnici' },
    { key: 'podesivVisina', label: 'Podesiva visina' },
  ],
  konzole: [
    { key: 'kompletPaket', label: 'Komplet (kutija + kablovi)' },
    { key: 'originalniKontroler', label: 'Originalni kontroler' },
  ],
};

// ── Računala i IT per-Type Fields ────────────────────────

export function getRacunalaFields(subType: string): CategoryField[] {
  const s = subType.toLowerCase();
  const fields: CategoryField[] = [];

  if (s.includes('laptop') || s.includes('macbook')) {
    fields.push(
      { key: 'garancija',          label: 'Garancija',           type: 'select', formPage: 1, options: ['Nema', '6 mjeseci', '12 mjeseci', '24 mjeseca', '36 mjeseci', '3+ godine'] },
      { key: 'godinaProizvodnje',  label: 'Godina proizvodnje',  type: 'select', formPage: 1, options: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', 'Starije'] },
      { key: 'procesor',           label: 'Procesor',            type: 'select', formPage: 2, options: ['Intel i3', 'Intel i5', 'Intel i7', 'Intel i9', 'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9', 'Apple M1', 'Apple M2', 'Apple M3', 'Apple M4', 'Ostalo'] },
      { key: 'ram',                label: 'RAM',                 type: 'select', formPage: 2, options: ['4GB', '8GB', '16GB', '32GB', '64GB'] },
      { key: 'operativniSistem',   label: 'Operativni sistem',   type: 'select', formPage: 2, options: ['Windows 10', 'Windows 11', 'Linux', 'macOS', 'Chrome OS', 'Ostalo'] },
      { key: 'disk',               label: 'SSD / HDD (GB)',      type: 'number', formPage: 2, placeholder: 'npr. 512' },
    );
  } else if (s.includes('desktop') || s.includes('gaming pc') || s.includes('mini pc') || s.includes('kompjuter')) {
    fields.push(
      { key: 'garancija',          label: 'Garancija',           type: 'select', formPage: 1, options: ['Nema', '6 mjeseci', '12 mjeseci', '24 mjeseca', '36 mjeseci', '3+ godine'] },
      { key: 'godinaProizvodnje',  label: 'Godina proizvodnje',  type: 'select', formPage: 1, options: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', 'Starije'] },
      { key: 'procesor',           label: 'Procesor',            type: 'select', formPage: 2, options: ['Intel', 'AMD', 'Ostalo'] },
      { key: 'modelProcesora',     label: 'Model procesora',     type: 'text',   formPage: 2, placeholder: 'npr. i7-13700K, Ryzen 7 5800X' },
      { key: 'ram',                label: 'RAM',                 type: 'select', formPage: 2, options: ['2GB', '4GB', '8GB', '16GB', '32GB', '64GB', '128GB'] },
      { key: 'operativniSistem',   label: 'Operativni sistem',   type: 'select', formPage: 2, options: ['Windows 10', 'Windows 11', 'Linux', 'macOS', 'Bez OS-a', 'Ostalo'] },
      { key: 'ssd',                label: 'SSD (GB)',             type: 'number', formPage: 2, placeholder: 'npr. 512' },
      { key: 'hdd',                label: 'HDD (GB)',             type: 'number', formPage: 2, placeholder: 'npr. 1000' },
      { key: 'graficka',           label: 'Grafička kartica',    type: 'select', formPage: 2, options: ['Integrisana', 'NVIDIA', 'AMD', 'Ostalo'] },
      { key: 'memorijaGraficke',   label: 'Memorija grafičke',   type: 'select', formPage: 2, options: ['2GB', '4GB', '6GB', '8GB', '12GB', '16GB', '24GB'] },
    );
  } else if (s.includes('monitor')) {
    fields.push(
      { key: 'dijagonala',        label: 'Dijagonala',          type: 'select',        formPage: 1, options: ['19"', '21"', '24"', '27"', '32"', '34"', '38"', '42"', '49"', 'Ostalo'] },
      { key: 'rezolucija',        label: 'Rezolucija',          type: 'button-select', formPage: 1, options: ['FHD (1080p)', 'QHD (1440p)', '4K (2160p)', 'Ostalo'] },
      { key: 'tipPanela',         label: 'Tip panela',          type: 'button-select', formPage: 1, options: ['IPS', 'VA', 'TN', 'OLED', 'Mini-LED'] },
      { key: 'refreshRate',       label: 'Refresh rate',        type: 'select',        formPage: 1, options: ['60Hz', '75Hz', '100Hz', '120Hz', '144Hz', '165Hz', '240Hz', '360Hz'] },
      { key: 'garancija',         label: 'Garancija',           type: 'select',        formPage: 1, options: ['Bez garancije', '6 mjeseci', '12 mjeseci', '24 mjeseca'] },
    );
  } else if (s.includes('komponent') || s.includes('grafičk') || s.includes('grafick') || s.includes('procesor') || s.includes('cpu') || s.includes('gpu') || s.includes('ram') || s.includes('ssd') || s.includes('hdd') || s.includes('matičn') || s.includes('maticn') || s.includes('napajanj') || s.includes('kućišt') || s.includes('kucist')) {
    fields.push(
      { key: 'tip',               label: 'Tip komponente',      type: 'text',          formPage: 1, placeholder: 'npr. GPU, CPU, RAM, SSD' },
      { key: 'brand',             label: 'Brand',               type: 'text',          formPage: 1, placeholder: 'npr. NVIDIA, AMD, Intel, Corsair' },
      { key: 'model',             label: 'Model',               type: 'text',          formPage: 1, placeholder: 'npr. RTX 4070, Ryzen 7 5800X' },
      { key: 'garancija',         label: 'Garancija',           type: 'select',        formPage: 1, options: ['Bez garancije', '6 mjeseci', '12 mjeseci', '24 mjeseca', '36 mjeseci'] },
    );
  } else if (s.includes('konzol') || s.includes('playstation') || s.includes('xbox') || s.includes('nintendo') || s.includes('gaming')) {
    fields.push(
      { key: 'brojKontrolera',    label: 'Broj kontrolera',     type: 'select',        formPage: 1, options: ['0', '1', '2', '3+'] },
      { key: 'garancija',         label: 'Garancija',           type: 'select',        formPage: 1, options: ['Bez garancije', '3 mjeseca', '6 mjeseci', '12 mjeseci'] },
    );
  } else if (s.includes('dron')) {
    fields.push(
      { key: 'brand',             label: 'Brand',               type: 'text',          formPage: 1, placeholder: 'npr. DJI, FPV' },
      { key: 'vrijemeLeta',       label: 'Vrijeme leta (min)',  type: 'number',        formPage: 1, placeholder: 'npr. 30' },
      { key: 'kamera',            label: 'Kamera',              type: 'select',        formPage: 1, options: ['Bez kamere', '720p', '1080p', '2.7K', '4K', '5.4K+'] },
      { key: 'dolet',             label: 'Dolet (km)',          type: 'number',        formPage: 1, placeholder: 'npr. 10' },
      { key: 'garancija',         label: 'Garancija',           type: 'select',        formPage: 1, options: ['Bez garancije', '6 mjeseci', '12 mjeseci', '24 mjeseca'] },
    );
  } else if (s.includes('printer') || s.includes('skener') || s.includes('3d printer')) {
    fields.push(
      { key: 'tip',               label: 'Tip',                 type: 'button-select', formPage: 1, options: ['Inkjet', 'Laser', '3D printer', 'Multifunkcijski', 'Skener'] },
      { key: 'boja',              label: 'Ispis',               type: 'button-select', formPage: 1, options: ['Crno-bijeli', 'U boji'] },
      { key: 'garancija',         label: 'Garancija',           type: 'select',        formPage: 1, options: ['Bez garancije', '6 mjeseci', '12 mjeseci', '24 mjeseca'] },
    );
  } else if (s.includes('mrežn') || s.includes('mrezn') || s.includes('router') || s.includes('switch') || s.includes('wifi') || s.includes('nas') || s.includes('server')) {
    fields.push(
      { key: 'brand',             label: 'Brand',               type: 'text',          formPage: 1, placeholder: 'npr. TP-Link, Ubiquiti, Synology' },
      { key: 'model',             label: 'Model',               type: 'text',          formPage: 1, placeholder: 'Naziv modela' },
      { key: 'garancija',         label: 'Garancija',           type: 'select',        formPage: 1, options: ['Bez garancije', '6 mjeseci', '12 mjeseci', '24 mjeseca'] },
    );
  } else {
    // Softver, Ostala IT oprema, Kablovi, Docking stanice, etc.
    fields.push(
      { key: 'garancija',         label: 'Garancija',           type: 'select',        formPage: 1, options: ['Bez garancije', '3 mjeseca', '6 mjeseci', '12 mjeseci', '24 mjeseca'] },
      { key: 'godinaProizvodnje', label: 'Godina',              type: 'number',        formPage: 1, placeholder: 'npr. 2023' },
    );
  }

  // === Page 2: Feature Checkboxes ===
  let featureKey = '';
  if (s.includes('laptop') || s.includes('macbook')) featureKey = 'laptopi';
  else if (s.includes('desktop') || s.includes('gaming pc') || s.includes('kompjuter')) featureKey = 'desktop';
  else if (s.includes('monitor')) featureKey = 'monitori';
  else if (s.includes('konzol') || s.includes('playstation') || s.includes('xbox') || s.includes('nintendo')) featureKey = 'konzole';

  const features = RACUNALA_FEATURES[featureKey] || [];
  features.forEach(f => {
    fields.push({ key: f.key, label: f.label, type: 'boolean', formPage: 2 });
  });

  return fields;
}

// ── Tehnika i elektronika per-Type Fields ────────────────

export function getTehnikaFields(subType: string): CategoryField[] {
  const s = subType.toLowerCase();
  const fields: CategoryField[] = [];

  const isTV         = ['televizor', 'tv', 'projektor'].some(t => s.includes(t));
  const isAudio      = ['audio', 'zvučni', 'zvucni', 'soundbar', 'gramofon', 'pojačal', 'pojacal', 'hi-fi', 'kazetofon'].some(t => s.includes(t));
  const isFotoVideo  = ['foto', 'video', 'kamer', 'fotoaparat', 'objektiv', 'stativ', 'gimbal', 'bljeskalic', 'action'].some(t => s.includes(t));
  const isBijela     = ['bijela tehnik', 'perilica', 'hladnjak', 'zamrzivač', 'zamrzivac', 'pećnic', 'pecnic', 'štednjak', 'stednjak', 'sušilica', 'susilica', 'klima'].some(t => s.includes(t));
  const isMaliAparati = ['mali kućansk', 'mali kucansk', 'blender', 'mikser', 'usisavač', 'usisavac', 'glačal', 'glacal', 'toster', 'aparati za kavu', 'aparati za kosu', 'robotski', 'parni'].some(t => s.includes(t));
  const isSmartHome  = ['smart home', 'iot', 'pametna žarulj', 'pametna zarulja', 'pametni termostat', 'pametna brav', 'pametni prekidač', 'pametni prekidac', 'sigurnosne kamer'].some(t => s.includes(t));
  const isSolarna    = ['solarn', 'alternativn', 'vjetroturbina', 'inverter'].some(t => s.includes(t));
  const isMedicinska = ['medicins', 'inhalator', 'invalidsk', 'termometar', 'krvn', 'šećer', 'secer'].some(t => s.includes(t));

  if (isTV) {
    fields.push(
      { key: 'dijagonala',        label: 'Dijagonala',          type: 'select',        formPage: 1, options: ['32"', '40"', '43"', '50"', '55"', '58"', '65"', '70"', '75"', '85"', 'Ostalo'] },
      { key: 'rezolucija',        label: 'Rezolucija',          type: 'button-select', formPage: 1, options: ['HD', 'Full HD', '4K UHD', '8K', 'Ostalo'] },
      { key: 'tipPanela',         label: 'Tip panela',          type: 'button-select', formPage: 1, options: ['OLED', 'QLED', 'LED', 'LCD', 'Ostalo'] },
      { key: 'smartTv',           label: 'Smart TV',            type: 'boolean',       formPage: 1 },
      { key: 'garancija',         label: 'Garancija',           type: 'select',        formPage: 1, options: ['Bez garancije', '6 mjeseci', '12 mjeseci', '24 mjeseca'] },
      { key: 'godinaProizvodnje', label: 'Godina proizvodnje',  type: 'select',        formPage: 1, options: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', 'Starije'] },
    );
  } else if (isAudio) {
    fields.push(
      { key: 'tip',               label: 'Tip',                 type: 'button-select', formPage: 1, options: ['Zvučnik', 'Pojačalo', 'Soundbar', 'Gramofon', 'Receiver', 'Ostalo'] },
      { key: 'snaga',             label: 'Snaga (W)',           type: 'number',        formPage: 1, placeholder: 'npr. 100' },
      { key: 'bezicni',           label: 'Bežični (Bluetooth/WiFi)', type: 'boolean',  formPage: 1 },
      { key: 'garancija',         label: 'Garancija',           type: 'select',        formPage: 1, options: ['Bez garancije', '6 mjeseci', '12 mjeseci', '24 mjeseca'] },
    );
  } else if (isFotoVideo) {
    fields.push(
      { key: 'tip',               label: 'Tip',                 type: 'button-select', formPage: 1, options: ['DSLR', 'Mirrorless', 'Kompaktni', 'Action kamera', 'Video kamera', 'Objektiv', 'Ostalo'] },
      { key: 'megapikseli',       label: 'Megapikseli',         type: 'number',        formPage: 1, placeholder: 'npr. 24' },
      { key: 'brand',             label: 'Brand',               type: 'text',          formPage: 1, placeholder: 'npr. Canon, Sony, Nikon' },
      { key: 'garancija',         label: 'Garancija',           type: 'select',        formPage: 1, options: ['Bez garancije', '6 mjeseci', '12 mjeseci', '24 mjeseca'] },
    );
  } else if (isBijela) {
    fields.push(
      { key: 'energetskaKlasa',   label: 'Energetska klasa',    type: 'select',        formPage: 1, options: ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'Ne znam'] },
      { key: 'brand',             label: 'Brand',               type: 'text',          formPage: 1, placeholder: 'npr. Bosch, Samsung, Gorenje' },
      { key: 'garancija',         label: 'Garancija',           type: 'select',        formPage: 1, options: ['Bez garancije', '6 mjeseci', '12 mjeseci', '24 mjeseca', '36 mjeseci'] },
      { key: 'godinaProizvodnje', label: 'Godina proizvodnje',  type: 'select',        formPage: 1, options: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', 'Starije'] },
    );
  } else if (isMaliAparati) {
    fields.push(
      { key: 'brand',             label: 'Brand',               type: 'text',          formPage: 1, placeholder: 'npr. Philips, Dyson, Bosch' },
      { key: 'snaga',             label: 'Snaga (W)',           type: 'number',        formPage: 1, placeholder: 'npr. 2000' },
      { key: 'garancija',         label: 'Garancija',           type: 'select',        formPage: 1, options: ['Bez garancije', '6 mjeseci', '12 mjeseci', '24 mjeseca'] },
    );
  } else if (isSmartHome) {
    fields.push(
      { key: 'kompatibilnost',    label: 'Kompatibilnost',      type: 'select',        formPage: 1, options: ['Alexa', 'Google Home', 'Apple HomeKit', 'Sve', 'Ostalo'] },
      { key: 'protokol',          label: 'Protokol',            type: 'select',        formPage: 1, options: ['WiFi', 'Zigbee', 'Z-Wave', 'Bluetooth', 'Matter', 'Ostalo'] },
      { key: 'garancija',         label: 'Garancija',           type: 'select',        formPage: 1, options: ['Bez garancije', '6 mjeseci', '12 mjeseci', '24 mjeseca'] },
    );
  } else if (isSolarna) {
    fields.push(
      { key: 'snaga',             label: 'Snaga (W/kW)',        type: 'text',          formPage: 1, placeholder: 'npr. 400W, 5kW' },
      { key: 'tip',               label: 'Tip',                 type: 'button-select', formPage: 1, options: ['Monokristalni', 'Polikristalni', 'Inverter', 'Baterija', 'Ostalo'] },
      { key: 'garancija',         label: 'Garancija',           type: 'select',        formPage: 1, options: ['Bez garancije', '12 mjeseci', '24 mjeseca', '5+ godina', '10+ godina'] },
    );
  } else if (isMedicinska) {
    fields.push(
      { key: 'brand',             label: 'Brand',               type: 'text',          formPage: 1, placeholder: 'npr. Omron, Beurer' },
      { key: 'garancija',         label: 'Garancija',           type: 'select',        formPage: 1, options: ['Bez garancije', '6 mjeseci', '12 mjeseci', '24 mjeseca'] },
    );
  } else {
    // Ostala tehnika: baterije, vapori, walkie talkie, etc.
    fields.push(
      { key: 'garancija',         label: 'Garancija',           type: 'select',        formPage: 1, options: ['Bez garancije', '3 mjeseca', '6 mjeseci', '12 mjeseci', '24 mjeseca'] },
      { key: 'godinaProizvodnje', label: 'Godina',              type: 'number',        formPage: 1, placeholder: 'npr. 2023' },
    );
  }

  return fields;
}

// ── Dom i vrt Feature Checkboxes per Sub-Type ──────────
const DOM_FEATURES: Record<string, { key: string; label: string }[]> = {
  namjestaj: [
    { key: 'rastavljivo', label: 'Rastavljivo' },
    { key: 'dostavaMoguca', label: 'Dostava moguća' },
    { key: 'garancija', label: 'Garancija' },
  ],
  rasvjeta: [
    { key: 'dimabilna', label: 'Dimabilna' },
    { key: 'daljinski', label: 'Daljinski upravljač' },
  ],
  vrt: [
    { key: 'novoUPakovanju', label: 'Novo u pakovanju' },
    { key: 'dostavaMoguca', label: 'Dostava moguća' },
    { key: 'otpornoNaKisu', label: 'Otporno na kišu' },
  ],
  grijanje: [
    { key: 'garancija', label: 'Garancija' },
    { key: 'sMontazom', label: 'S montažom' },
    { key: 'daljinski', label: 'Daljinski upravljač' },
  ],
  bazeni: [
    { key: 'sPumpom', label: 'S pumpom' },
    { key: 'sFilterom', label: 'S filterom' },
    { key: 'grijani', label: 'Grijani' },
  ],
  alati: [
    { key: 'garancija', label: 'Garancija' },
    { key: 'kompletSet', label: 'Komplet set' },
    { key: 'koferUkljucen', label: 'Kofer uključen' },
  ],
  sigurnost: [
    { key: 'garancija', label: 'Garancija' },
    { key: 'appKontrola', label: 'App kontrola' },
  ],
  vodoinstalacije: [
    { key: 'garancija', label: 'Garancija' },
    { key: 'sMontazom', label: 'S montažom' },
  ],
  ostalo: [
    { key: 'garancija', label: 'Garancija' },
  ],
};

// ── Dom i vrt per-Type Fields ──────────────────────────

export function getDomFields(subType: string): CategoryField[] {
  const s = subType.toLowerCase();
  const fields: CategoryField[] = [];

  // === Page 1: Basis-Felder für ALLE Dom-Artikel ===
  fields.push(
    { key: 'stanje', label: 'Stanje', type: 'select', formPage: 1, options: ['Novo', 'Kao novo', 'Korišteno', 'Oštećeno'] },
    { key: 'materijal', label: 'Materijal', type: 'select', formPage: 1, options: ['Drvo', 'Metal', 'Plastika', 'Staklo', 'Tkanina', 'Koža', 'Keramika', 'MDF / Iverica', 'Ratan', 'Ostalo'] },
    { key: 'boja', label: 'Boja', type: 'select', formPage: 1, options: ['Bijela', 'Crna', 'Smeđa', 'Siva', 'Bež', 'Crvena', 'Plava', 'Zelena', 'Ostalo'] },
    { key: 'brand', label: 'Brend', type: 'text', formPage: 1, placeholder: 'npr. IKEA, Lesnina' },
  );

  // === Page 2: Extra-Felder je nach Subtyp ===

  // Namještaj (alle Räume)
  if (s.includes('namještaj') || s.includes('namjestaj') || s.includes('sofe') || s.includes('krevet') || s.includes('stol') || s.includes('ormar') || s.includes('police') || s.includes('fotelj') || s.includes('vitrin') || s.includes('komod') || s.includes('madra')) {
    fields.push(
      { key: 'sirinaCm', label: 'Širina (cm)', type: 'number', formPage: 2, placeholder: 'npr. 200' },
      { key: 'visinaCm', label: 'Visina (cm)', type: 'number', formPage: 2, placeholder: 'npr. 85' },
      { key: 'dubinaCm', label: 'Dubina (cm)', type: 'number', formPage: 2, placeholder: 'npr. 90' },
    );
    // Broj sjedala nur für Sitzmöbel
    if (s.includes('sofe') || s.includes('garnit') || s.includes('fotelj') || s.includes('stolic') || s.includes('barski')) {
      fields.push(
        { key: 'brojSjedala', label: 'Broj sjedala', type: 'select', formPage: 2, options: ['1', '2', '3', '4', '5+'] },
      );
    }
  }

  // Rasvjeta
  if (s.includes('rasvjet') || s.includes('lamp') || s.includes('luster') || s.includes('žarulj') || s.includes('zarulj') || s.includes('led')) {
    fields.push(
      { key: 'tipRasvjete', label: 'Tip rasvjete', type: 'select', formPage: 2, options: ['LED', 'Halogen', 'Fluorescentna', 'Obična žarulja'] },
      { key: 'bojaSvjetla', label: 'Boja svjetla', type: 'select', formPage: 2, options: ['Topla bijela', 'Hladna bijela', 'Dnevna', 'RGB'] },
    );
  }

  // Tepisi, zavjese i tekstil
  if (s.includes('tepis') || s.includes('zavjes') || s.includes('tekstil') || s.includes('posteljin') || s.includes('dek') || s.includes('jastuk') || s.includes('ručnik') || s.includes('rucnik')) {
    fields.push(
      { key: 'dimenzije', label: 'Dimenzije', type: 'text', formPage: 2, placeholder: 'npr. 200x300 cm' },
      { key: 'materijalTekstila', label: 'Materijal', type: 'select', formPage: 2, options: ['Pamuk', 'Poliester', 'Vuna', 'Svila', 'Mikrovlakno', 'Lan', 'Ostalo'] },
    );
  }

  // Grijanje i hlađenje
  if (s.includes('grijanj') || s.includes('hlađenj') || s.includes('hladenj') || s.includes('klima') || s.includes('radijator') || s.includes('ventilator') || s.includes('peć') || s.includes('pec') || s.includes('bojler') || s.includes('kotl')) {
    fields.push(
      { key: 'snaga', label: 'Snaga', type: 'text', formPage: 2, placeholder: 'npr. 3.5 kW / 12000 BTU' },
      { key: 'energetskiRazred', label: 'Energetski razred', type: 'select', formPage: 2, options: ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D'] },
    );
  }

  // Bazeni, jacuzzi i saune
  if (s.includes('bazen') || s.includes('jacuzzi') || s.includes('saun') || s.includes('whirlpool')) {
    fields.push(
      { key: 'dimenzije', label: 'Dimenzije', type: 'text', formPage: 2, placeholder: 'npr. 3x2m / Ø 3.5m' },
      { key: 'zapreminaLitara', label: 'Zapremina (litara)', type: 'number', formPage: 2, placeholder: 'npr. 5000' },
    );
  }

  // Alati i pribor za dom
  if (s.includes('alat') || s.includes('bušilic') || s.includes('busilic') || s.includes('brusilica') || s.includes('pil') || s.includes('steg')) {
    fields.push(
      { key: 'tipAlata', label: 'Tip alata', type: 'select', formPage: 2, options: ['Ručni', 'Električni', 'Baterijski', 'Pneumatski'] },
      { key: 'napon', label: 'Napon', type: 'select', formPage: 2, options: ['12V', '18V', '20V', '230V', 'Ostalo'] },
    );
  }

  // Dekoracije i ukrasi
  if (s.includes('dekoracij') || s.includes('ukras') || s.includes('slik') || s.includes('plat') || s.includes('svjećnjak') || s.includes('svjecnjak') || s.includes('vaz') || s.includes('zidni sat') || s.includes('božićn') || s.includes('bozicn')) {
    fields.push(
      { key: 'tip',       label: 'Tip',       type: 'button-select', formPage: 2, options: ['Slika/Platno', 'Skulptura/Figura', 'Svjećnjak', 'Sat', 'Vaza', 'Ostalo'] },
      { key: 'dimenzije', label: 'Dimenzije', type: 'text',          formPage: 2, placeholder: 'npr. 60x40 cm' },
    );
  }

  // Vrt i balkon
  if (s.includes('vrt') || s.includes('balkon') || s.includes('roštilj') || s.includes('rostilj') || s.includes('biljk') || s.includes('sjemen') || s.includes('saksij') || s.includes('ljuljačk') || s.includes('ljuljack') || s.includes('hamak') || s.includes('prskalic') || s.includes('tend')) {
    fields.push(
      { key: 'tip',       label: 'Tip',       type: 'button-select', formPage: 2, options: ['Namještaj', 'Alat', 'Biljke/Sjemenke', 'Roštilj', 'Dekoracija', 'Ostalo'] },
      { key: 'dimenzije', label: 'Dimenzije', type: 'text',          formPage: 2, placeholder: 'npr. 150x90 cm' },
    );
  }

  // Sigurnosni sustavi
  if (s.includes('sigurnosn') || s.includes('alarm') || s.includes('nadzorn') || s.includes('vatrodojav') || s.includes('senzor dima')) {
    fields.push(
      { key: 'tip',     label: 'Tip',     type: 'button-select', formPage: 2, options: ['Alarm', 'Kamera', 'Brava', 'Vatrodojava', 'Ostalo'] },
      { key: 'bezicni', label: 'Bežični', type: 'boolean',       formPage: 2 },
    );
  }

  // Vodoinstalacije i sanitarije
  if (s.includes('vodoinstalacij') || s.includes('sanitarij') || s.includes('slavin') || s.includes('kad') || s.includes('sudoper') || s.includes('wc') || s.includes('bide') || s.includes('tuš kabin') || s.includes('tus kabin') || s.includes('armatur')) {
    fields.push(
      { key: 'materijalSanitarija', label: 'Materijal',  type: 'select', formPage: 2, options: ['Keramika', 'Čelik', 'Plastika', 'Messing', 'Krom', 'Ostalo'] },
      { key: 'dimenzije',           label: 'Dimenzije', type: 'text',   formPage: 2, placeholder: 'npr. 80x60 cm' },
    );
  }

  // === Page 2: Checkboxen ===
  let featureKey = 'ostalo';
  if (s.includes('namještaj') || s.includes('namjestaj') || s.includes('sofe') || s.includes('krevet') || s.includes('stol') || s.includes('ormar')) featureKey = 'namjestaj';
  else if (s.includes('rasvjet') || s.includes('lamp') || s.includes('luster')) featureKey = 'rasvjeta';
  else if (s.includes('vrt') || s.includes('balkon')) featureKey = 'vrt';
  else if (s.includes('grijanj') || s.includes('hlađenj') || s.includes('hladenj') || s.includes('klima')) featureKey = 'grijanje';
  else if (s.includes('bazen') || s.includes('jacuzzi') || s.includes('saun')) featureKey = 'bazeni';
  else if (s.includes('alat') || s.includes('bušilic') || s.includes('busilic')) featureKey = 'alati';
  else if (s.includes('sigurnosn') || s.includes('alarm') || s.includes('nadzorn')) featureKey = 'sigurnost';
  else if (s.includes('vodoinstalacij') || s.includes('sanitarij') || s.includes('slavin')) featureKey = 'vodoinstalacije';

  const features = DOM_FEATURES[featureKey] || [];
  features.forEach(f => {
    fields.push({ key: f.key, label: f.label, type: 'boolean', formPage: 2 });
  });

  return fields;
}

// ── Djeca i bebe Feature Checkboxes per Sub-Type ────────
const DJECA_FEATURES: Record<string, { key: string; label: string }[]> = {
  kolica: [
    { key: 'sklopivo', label: 'Sklopivo' },
    { key: 'podesivRucka', label: 'Podesiva ručka' },
    { key: 'kosaraZaKupovinu', label: 'Košara za kupovinu' },
    { key: 'adapterSjedalica', label: 'Adapter za autosjedalicu' },
    { key: 'originalnoPakovanje', label: 'Originalno pakovanje' },
  ],
  autosjedalice: [
    { key: 'isofix', label: 'ISOFIX' },
    { key: 'okretna360', label: 'Okretna 360°' },
    { key: 'garancija', label: 'Garancija' },
    { key: 'originalnoPakovanje', label: 'Originalno pakovanje' },
  ],
  oprema: [
    { key: 'garancija', label: 'Garancija' },
    { key: 'sklopivo', label: 'Sklopivo' },
    { key: 'pranjeMoguce', label: 'Pranje moguće' },
    { key: 'originalnoPakovanje', label: 'Originalno pakovanje' },
  ],
  igracke: [
    { key: 'kompletSet', label: 'Komplet set' },
    { key: 'baterijeUkljucene', label: 'Baterije uključene' },
    { key: 'originalnoPakovanje', label: 'Originalno pakovanje' },
  ],
  bicikli: [
    { key: 'pomocniKotaci', label: 'Pomoćni kotači' },
    { key: 'punjacUkljucen', label: 'Punjač uključen' },
  ],
  odjeca: [
    { key: 'novoSEtiketom', label: 'Novo s etiketom' },
    { key: 'kompletSet', label: 'Komplet set' },
  ],
  knjige: [
    { key: 'kompletSet', label: 'Komplet set' },
  ],
};

// ── Djeca i bebe per-Type Fields ─────────────────────────

export function getDjecaFields(subType: string): CategoryField[] {
  const s = subType.toLowerCase();
  const fields: CategoryField[] = [];

  // === Page 1: Basis-Felder für ALLE Djeca-Artikel ===
  fields.push(
    { key: 'stanje', label: 'Stanje', type: 'select', formPage: 1, options: ['Novo', 'Kao novo', 'Korišteno', 'Oštećeno'] },
    { key: 'spol', label: 'Spol', type: 'button-select', formPage: 1, options: ['Dječak', 'Djevojčica', 'Unisex'] },
    { key: 'dobDjeteta', label: 'Dob djeteta', type: 'select', formPage: 1, options: ['0–6 mjeseci', '6–12 mjeseci', '1–2 godine', '3–5 godina', '6–8 godina', '9–12 godina', '13–14 godina'] },
    { key: 'brand', label: 'Brend', type: 'text', formPage: 1, placeholder: 'npr. Chicco, LEGO' },
  );

  // === Page 2: Extra-Felder je nach Subtyp ===

  // Kolica (Kinderwagen) — eigene Felder
  if (s.includes('kolica') || s.includes('nosiljk')) {
    fields.push(
      { key: 'tipKolica', label: 'Tip kolica', type: 'select', formPage: 2, options: ['Sportska', 'Duboka', '2u1 (sportska + duboka)', '3u1 (sportska + duboka + autosjedalica)', 'Kišobran kolica', 'Ostalo'] },
      { key: 'zaKolikoDjece', label: 'Za koliko djece', type: 'button-select', formPage: 2, options: ['Jedno dijete', 'Blizanci', 'Trojke'] },
      { key: 'brojTockova', label: 'Broj točkova', type: 'button-select', formPage: 2, options: ['3', '4'] },
      { key: 'tezina', label: 'Težina (kg)', type: 'number', formPage: 2, placeholder: 'npr. 8.5', unit: 'kg' },
    );
  }

  // Autosjedalice — eigene Felder
  else if (s.includes('sjedalic')) {
    fields.push(
      { key: 'tezinskaGrupa', label: 'Težinska grupa', type: 'select', formPage: 2, options: ['0+ (do 13 kg)', 'I (9–18 kg)', 'II (15–25 kg)', 'III (22–36 kg)', 'Kombinirana (I/II/III, 9–36 kg)', 'Ostalo'] },
      { key: 'tezina', label: 'Težina (kg)', type: 'number', formPage: 2, placeholder: 'npr. 8.5', unit: 'kg' },
    );
  }

  // Ostala oprema za bebe (krevetići, hodalice, hranilice, kupaonice)
  else if (s.includes('oprema') || s.includes('krevetić') || s.includes('krevetic') || s.includes('hodalic') || s.includes('hranilic') || s.includes('kupaonic')) {
    fields.push(
      { key: 'tezina', label: 'Težina (kg)', type: 'number', formPage: 2, placeholder: 'npr. 8.5', unit: 'kg' },
    );
  }

  // Dječje igračke
  if (s.includes('igrač') || s.includes('igrac') || s.includes('lego') || s.includes('plišan') || s.includes('plisan') || s.includes('figuric') || s.includes('slagalic') || s.includes('trampolin') || s.includes('kuhinje') || s.includes('roleplay')) {
    fields.push(
      { key: 'tipIgracke', label: 'Tip igračke', type: 'select', formPage: 2, options: ['LEGO i konstruktori', 'Plišane igračke', 'Figurice, lutke i akcijske figure', 'Na daljinski (RC)', 'Slagalice i puzzle', 'Trampoline, tobogani i ljuljačke', 'Kuhinje i roleplay igračke', 'Društvene igre', 'Ostalo'] },
    );
  }

  // Dječji bicikli, romobili, automobili
  if (s.includes('bicikl') || s.includes('romobil') || s.includes('automobil') || s.includes('quad') || s.includes('skuter') || s.includes('balans')) {
    fields.push(
      { key: 'velicinaKotaca', label: 'Veličina kotača', type: 'select', formPage: 2, options: ['10"', '12"', '14"', '16"', '20"', 'Ostalo'] },
      { key: 'boja', label: 'Boja', type: 'select', formPage: 2, options: ['Crna', 'Bijela', 'Crvena', 'Plava', 'Roza', 'Zelena', 'Žuta', 'Ostalo'] },
    );
  }

  // Dječja odjeća (0–14 god)
  if (s.includes('odjeć') || s.includes('odjec') || s.includes('odjeća')) {
    fields.push(
      { key: 'vrstaOdjece', label: 'Vrsta odjeće', type: 'select', formPage: 2, options: ['Majice i topovi', 'Hlače i traperice', 'Haljine i suknje', 'Jakne i kaputi', 'Trenirke i sportska odjeća', 'Pidžame i spavaćice', 'Body i kombinezon', 'Džemperi i veste', 'Čarape i donje rublje', 'Kupači kostimi', 'Kompletići / Setovi', 'Ostalo'] },
      { key: 'velicina', label: 'Veličina', type: 'select', formPage: 2, options: ['50', '56', '62', '68', '74', '80', '86', '92', '98', '104', '110', '116', '122', '128', '134', '140', '146', '152', '158', '164'] },
      { key: 'boja', label: 'Boja', type: 'select', formPage: 2, options: ['Crna', 'Bijela', 'Siva', 'Crvena', 'Plava', 'Roza', 'Zelena', 'Žuta', 'Narančasta', 'Ljubičasta', 'Smeđa', 'Bež', 'Ostalo'] },
      { key: 'materijal', label: 'Materijal', type: 'select', formPage: 2, options: ['Pamuk', 'Poliester', 'Vuna', 'Triko / Jersey', 'Flis', 'Denim', 'Ostalo'] },
    );
  }

  // Dječje knjige i edukacija
  if (s.includes('knjig') || s.includes('edukacij') || s.includes('slikovnic') || s.includes('bojic') || s.includes('školski') || s.includes('skolski')) {
    fields.push(
      { key: 'vrstaKnjige', label: 'Vrsta', type: 'select', formPage: 2, options: ['Slikovnice', 'Bojanka i kreativni setovi', 'Edukativne igre i ploče', 'Školski pribor', 'Ostalo'] },
      { key: 'dobPreporuka', label: 'Preporučena dob', type: 'select', formPage: 2, options: ['0–3 godine', '3–6 godina', '6–10 godina', '10–14 godina'] },
    );
  }

  // === Page 2: Checkboxen ===
  let featureKey = '';
  if (s.includes('kolica') || s.includes('nosiljk')) {
    featureKey = 'kolica';
  } else if (s.includes('sjedalic')) {
    featureKey = 'autosjedalice';
  } else if (s.includes('oprema') || s.includes('krevetić') || s.includes('krevetic') || s.includes('hodalic') || s.includes('hranilic') || s.includes('kupaonic')) {
    featureKey = 'oprema';
  } else if (s.includes('igrač') || s.includes('igrac') || s.includes('lego') || s.includes('plišan') || s.includes('plisan') || s.includes('figuric') || s.includes('slagalic') || s.includes('trampolin')) {
    featureKey = 'igracke';
  } else if (s.includes('bicikl') || s.includes('romobil') || s.includes('automobil') || s.includes('quad') || s.includes('skuter') || s.includes('balans')) {
    featureKey = 'bicikli';
  } else if (s.includes('odjeć') || s.includes('odjec') || s.includes('odjeća')) {
    featureKey = 'odjeca';
  } else if (s.includes('knjig') || s.includes('edukacij') || s.includes('slikovnic') || s.includes('bojic') || s.includes('školski') || s.includes('skolski')) {
    featureKey = 'knjige';
  }

  const features = DJECA_FEATURES[featureKey] || [];
  features.forEach(f => {
    fields.push({ key: f.key, label: f.label, type: 'boolean', formPage: 2 });
  });

  return fields;
}

// ── Videoigre Feature Checkboxes per Sub-Type ────────────
const VIDEOIGRE_FEATURES: Record<string, { key: string; label: string }[]> = {
  igre: [
    { key: 'originalnaKutija', label: 'Originalna kutija' },
    { key: 'uputstvo', label: 'Uputstvo / booklet' },
  ],
  konzole: [
    { key: 'kompletPaket', label: 'Komplet (kutija + kablovi)' },
    { key: 'originalniKontroler', label: 'Originalni kontroler' },
    { key: 'hdmiKabel', label: 'HDMI kabel' },
    { key: 'garancija', label: 'Garancija' },
  ],
  oprema: [
    { key: 'garancija', label: 'Garancija' },
    { key: 'originalnoPakovanje', label: 'Originalno pakovanje' },
  ],
};

// ── Videoigre per-Type Fields ────────────────────────────

export function getVideoigreFields(subType: string): CategoryField[] {
  const s = subType.toLowerCase();
  const fields: CategoryField[] = [];

  // === Page 1: Basis-Felder für ALLE Videoigre-Artikel ===
  fields.push(
    { key: 'stanje', label: 'Stanje', type: 'select', formPage: 1, options: ['Novo (zapakirano)', 'Kao novo', 'Korišteno', 'Oštećeno'] },
    { key: 'platforma', label: 'Platforma', type: 'select', formPage: 1, options: ['PlayStation 5', 'PlayStation 4', 'PlayStation 3 i stariji', 'Xbox Series X/S', 'Xbox One', 'Nintendo Switch', 'Nintendo DS / 3DS', 'Nintendo Wii / WiiU', 'PC', 'Retro konzole', 'Ostalo'] },
  );

  // === Page 2: Extra-Felder je nach Subtyp ===

  // Igre (Games)
  if (s.includes('igr') || s.includes('ps3') || s.includes('ps4') || s.includes('ps5') || s.includes('digitalni') || s.includes('fizičk') || s.includes('fizick') || s.includes('pc igre')) {
    fields.push(
      { key: 'tipIgre', label: 'Tip', type: 'button-select', formPage: 2, options: ['Fizički medij', 'Digitalni ključ'] },
      { key: 'zanr', label: 'Žanr', type: 'select', formPage: 2, options: ['Akcija', 'Avantura', 'FPS / Pucačina', 'RPG', 'Sport', 'Trke', 'Simulacija', 'Strategija', 'Horor', 'Porodične / Party', 'Ostalo'] },
    );
  }

  // Konzole
  else if (s.includes('konzol') || s.includes('playstation') || s.includes('xbox') || s.includes('nintendo') || s.includes('switch') || s.includes('retro')) {
    fields.push(
      { key: 'kapacitetGB', label: 'Kapacitet (GB)', type: 'select', formPage: 2, options: ['250', '500', '825', '1000', '2000', 'Ostalo'] },
      { key: 'brojKontrolera', label: 'Broj kontrolera', type: 'select', formPage: 2, options: ['0', '1', '2', '3+'] },
      { key: 'tipKontrolera', label: 'Tip kontrolera', type: 'button-select', formPage: 2, options: ['Bežični', 'Žičani'] },
      { key: 'brojIgara', label: 'Broj igara u paketu', type: 'number', formPage: 2, placeholder: 'npr. 5' },
    );
  }

  // Gaming oprema (Gamepadovi, Slušalice, Miševi, VR)
  else if (s.includes('oprema') || s.includes('gamepad') || s.includes('kontroler') || s.includes('slušalic') || s.includes('slusalic') || s.includes('miš') || s.includes('mis') || s.includes('tipkovnic') || s.includes('vr') || s.includes('volan')) {
    fields.push(
      { key: 'tipOpreme', label: 'Tip opreme', type: 'select', formPage: 2, options: ['Gamepad / kontroler', 'Gaming miš', 'Gaming tipkovnica', 'Gaming slušalice', 'Volan i pedale', 'VR naočale', 'Punjač', 'Torba / torbica', 'Ostalo'] },
      { key: 'bezicni', label: 'Bežični', type: 'button-select', formPage: 2, options: ['Da', 'Ne'] },
    );
  }

  // === Page 2: Checkboxen ===
  let featureKey = '';
  if (s.includes('igr') || s.includes('ps3') || s.includes('ps4') || s.includes('ps5') || s.includes('digitalni') || s.includes('fizičk') || s.includes('fizick') || s.includes('pc igre')) {
    featureKey = 'igre';
  } else if (s.includes('konzol') || s.includes('playstation') || s.includes('xbox') || s.includes('nintendo') || s.includes('switch') || s.includes('retro')) {
    featureKey = 'konzole';
  } else {
    featureKey = 'oprema';
  }

  const features = VIDEOIGRE_FEATURES[featureKey] || [];
  features.forEach(f => {
    fields.push({ key: f.key, label: f.label, type: 'boolean', formPage: 2 });
  });

  return fields;
}

// ── Glazba i instrumenti Feature Checkboxes per Sub-Type ─
const GLAZBA_FEATURES: Record<string, { key: string; label: string }[]> = {
  gitare: [
    { key: 'koferTorba', label: 'Kofer / torba' },
    { key: 'stalak', label: 'Stalak uključen' },
    { key: 'pojacaloUkljuceno', label: 'Pojačalo uključeno' },
    { key: 'ziceNove', label: 'Žice nove' },
    { key: 'originalnoPakovanje', label: 'Originalno pakovanje' },
  ],
  klavijature: [
    { key: 'stalak', label: 'Stalak uključen' },
    { key: 'pedala', label: 'Pedala uključena' },
    { key: 'adapter', label: 'Adapter / napajanje' },
    { key: 'originalnoPakovanje', label: 'Originalno pakovanje' },
  ],
  bubnjevi: [
    { key: 'stalciUkljuceni', label: 'Stalci uključeni' },
    { key: 'paliceUkljucene', label: 'Palice uključene' },
    { key: 'originalnoPakovanje', label: 'Originalno pakovanje' },
  ],
  puhackiGudacki: [
    { key: 'koferTorba', label: 'Kofer / torba' },
    { key: 'stalak', label: 'Stalak uključen' },
    { key: 'originalnoPakovanje', label: 'Originalno pakovanje' },
  ],
  oprema: [
    { key: 'kabloviUkljuceni', label: 'Kablovi uključeni' },
    { key: 'garancija', label: 'Garancija' },
    { key: 'originalnoPakovanje', label: 'Originalno pakovanje' },
  ],
};

// ── Glazba i instrumenti per-Type Fields ─────────────────

export function getGlazbaFields(subType: string): CategoryField[] {
  const s = subType.toLowerCase();
  const fields: CategoryField[] = [];

  // === Page 1: Basis-Felder für ALLE Glazba-Artikel ===
  fields.push(
    { key: 'stanje', label: 'Stanje', type: 'select', formPage: 1, options: ['Novo', 'Kao novo', 'Korišteno', 'Oštećeno'] },
    { key: 'brand', label: 'Brend', type: 'text', formPage: 1, placeholder: 'npr. Fender, Yamaha, Roland' },
    { key: 'boja', label: 'Boja', type: 'select', formPage: 1, options: ['Crna', 'Bijela', 'Crvena', 'Plava', 'Smeđa', 'Prirodno drvo', 'Sunburst', 'Ostalo'] },
  );

  // === Page 2: Extra-Felder je nach Subtyp ===

  // Gitare
  if (s.includes('gitar') || s.includes('bas gitar')) {
    fields.push(
      { key: 'tipGitare', label: 'Tip gitare', type: 'select', formPage: 2, options: ['Akustična', 'Klasična', 'Električna', 'Bas', 'Elektro-akustična'] },
      { key: 'brojZica', label: 'Broj žica', type: 'button-select', formPage: 2, options: ['4', '6', '7', '8', '12'] },
    );
  }

  // Klavijature i klaviri
  else if (s.includes('klavijatur') || s.includes('klavir') || s.includes('sintesajzer') || s.includes('harmonik') || s.includes('orgulj')) {
    fields.push(
      { key: 'tipKlavijature', label: 'Tip', type: 'select', formPage: 2, options: ['Digitalni klavir', 'Sintesajzer', 'Workstation', 'Harmonika', 'Akustični klavir', 'Orgulje', 'Ostalo'] },
      { key: 'brojTipki', label: 'Broj tipki', type: 'select', formPage: 2, options: ['25', '32', '49', '61', '76', '88'] },
    );
  }

  // Bubnjevi i udaraljke
  else if (s.includes('bubnj') || s.includes('udaraljk') || s.includes('cajon') || s.includes('perkusij') || s.includes('činel') || s.includes('cinel')) {
    fields.push(
      { key: 'tipBubnjeva', label: 'Tip', type: 'select', formPage: 2, options: ['Akustični set', 'Elektronički set', 'Cajon', 'Perkusije', 'Pojedinačno (činele, stalci...)', 'Ostalo'] },
      { key: 'brojKomada', label: 'Broj komada u setu', type: 'number', formPage: 2, placeholder: 'npr. 5' },
    );
  }

  // Puhački instrumenti
  else if (s.includes('puhač') || s.includes('puhac') || s.includes('flauta') || s.includes('klarinet') || s.includes('saksofon') || s.includes('trub') || s.includes('trombon') || s.includes('usne harmonik')) {
    fields.push(
      { key: 'tipPuhackog', label: 'Tip instrumenta', type: 'select', formPage: 2, options: ['Flauta', 'Klarinet', 'Saksofon', 'Truba', 'Trombon', 'Usna harmonika', 'Ostalo'] },
    );
  }

  // Gudački instrumenti
  else if (s.includes('gudač') || s.includes('gudac') || s.includes('violin') || s.includes('viola') || s.includes('violončel') || s.includes('violoncel') || s.includes('kontrabas')) {
    fields.push(
      { key: 'tipGudackog', label: 'Tip instrumenta', type: 'select', formPage: 2, options: ['Violina', 'Viola', 'Violončelo', 'Kontrabas', 'Ostalo'] },
    );
  }

  // PA sustavi i ozvučenje
  else if (s.includes('pa sustav') || s.includes('ozvučenj') || s.includes('ozvucenj') || s.includes('mikrofon') || s.includes('mixer') || s.includes('pojačal') || s.includes('pojacal') || s.includes('zvučni') || s.includes('zvucni')) {
    fields.push(
      { key: 'tipOpreme', label: 'Tip opreme', type: 'select', formPage: 2, options: ['Mikrofon', 'Mixer', 'Pojačalo', 'Zvučnik (aktivni)', 'Zvučnik (pasivni)', 'Ostalo'] },
      { key: 'snagaW', label: 'Snaga (W)', type: 'number', formPage: 2, placeholder: 'npr. 200', unit: 'W' },
    );
  }

  // Studio oprema
  else if (s.includes('studio') || s.includes('audio sučelj') || s.includes('audio sucelj') || s.includes('midi') || s.includes('snimač') || s.includes('snimac')) {
    fields.push(
      { key: 'tipStudijske', label: 'Tip opreme', type: 'select', formPage: 2, options: ['Audio sučelje', 'MIDI kontroler', 'Studio monitor', 'Snimačka kartica', 'Ostalo'] },
    );
  }

  // Scenska i DJ oprema
  else if (s.includes('dj') || s.includes('scensk') || s.includes('rasvjet') || s.includes('dim') || s.includes('mjehurić') || s.includes('mjehuric')) {
    fields.push(
      { key: 'tipDJ', label: 'Tip opreme', type: 'select', formPage: 2, options: ['DJ mixer', 'DJ kontroler', 'Gramofon', 'Scenska rasvjeta', 'Stroj za dim / mjehuriće', 'Ostalo'] },
    );
  }

  // === Page 2: Checkboxen ===
  let featureKey = '';
  if (s.includes('gitar') || s.includes('bas gitar')) {
    featureKey = 'gitare';
  } else if (s.includes('klavijatur') || s.includes('klavir') || s.includes('sintesajzer') || s.includes('harmonik') || s.includes('orgulj')) {
    featureKey = 'klavijature';
  } else if (s.includes('bubnj') || s.includes('udaraljk') || s.includes('cajon') || s.includes('perkusij') || s.includes('činel') || s.includes('cinel')) {
    featureKey = 'bubnjevi';
  } else if (s.includes('puhač') || s.includes('puhac') || s.includes('gudač') || s.includes('gudac') || s.includes('violin') || s.includes('viola') || s.includes('violončel') || s.includes('tamburi') || s.includes('folk')) {
    featureKey = 'puhackiGudacki';
  } else {
    featureKey = 'oprema';
  }

  const features = GLAZBA_FEATURES[featureKey] || [];
  features.forEach(f => {
    fields.push({ key: f.key, label: f.label, type: 'boolean', formPage: 2 });
  });

  return fields;
}

// ── Literatura i mediji (per-type) ──────────────────────

export function getLiteraturaFields(subType: string): CategoryField[] {
  const s = subType.toLowerCase();
  const fields: CategoryField[] = [];

  // Base for all
  fields.push(
    { key: 'stanje', label: 'Stanje', type: 'button-select', formPage: 1, options: ['Novo', 'Kao novo', 'Korišteno'] },
    { key: 'jezik',  label: 'Jezik',  type: 'select',        formPage: 1, options: ['Bosanski', 'Hrvatski', 'Srpski', 'Engleski', 'Njemački', 'Ostalo'] },
  );

  const isKnjiga   = ['knjig', 'beletrist', 'stručna', 'strucna', 'dječje', 'djecje', 'školsk', 'skolsk', 'antikvar', 'roman', 'udžbenik', 'udzbenik'].some(t => s.includes(t));
  const isCasopis  = ['časopis', 'casopis', 'magazin'].some(t => s.includes(t));
  const isStrip    = ['strip', 'manga'].some(t => s.includes(t));
  const isFilm     = ['film', 'serij', 'dvd', 'blu-ray', 'blu ray'].some(t => s.includes(t));
  const isGlazba   = ['glazb', 'cd', 'vinil', 'kaset', 'ploč', 'ploc'].some(t => s.includes(t));

  if (isKnjiga) {
    fields.push(
      { key: 'autor',         label: 'Autor',          type: 'text',          formPage: 1, placeholder: 'npr. Ivo Andrić' },
      { key: 'uvez',          label: 'Uvez',           type: 'button-select', formPage: 1, options: ['Tvrdi', 'Meki', 'Ostalo'] },
      { key: 'godinaIzdanja', label: 'Godina izdanja', type: 'number',        formPage: 1, placeholder: 'npr. 2020' },
      { key: 'izdavac',       label: 'Izdavač',        type: 'text',          formPage: 1, placeholder: 'npr. Buybook, Školska knjiga' },
    );
  } else if (isCasopis) {
    fields.push(
      { key: 'godiste', label: 'Godište', type: 'number', formPage: 1, placeholder: 'npr. 2024' },
      { key: 'broj',    label: 'Broj',    type: 'text',   formPage: 1, placeholder: 'npr. 45, Mart 2024' },
    );
  } else if (isStrip) {
    fields.push(
      { key: 'autor', label: 'Autor/Ilustrator', type: 'text',          formPage: 1, placeholder: 'npr. Alan Ford, Naruto' },
      { key: 'uvez',  label: 'Uvez',            type: 'button-select', formPage: 1, options: ['Tvrdi', 'Meki'] },
    );
  } else if (isFilm) {
    fields.push(
      { key: 'format', label: 'Format', type: 'button-select', formPage: 1, options: ['DVD', 'Blu-ray'] },
      { key: 'zanr',   label: 'Žanr',   type: 'select',        formPage: 1, options: ['Akcija', 'Komedija', 'Drama', 'Horror', 'Sci-fi', 'Triler', 'Dokumentarni', 'Animirani', 'Romantični', 'Ostalo'] },
      { key: 'titlovi', label: 'Titlovi (BHS)', type: 'boolean', formPage: 1 },
    );
  } else if (isGlazba) {
    fields.push(
      { key: 'format',   label: 'Format',   type: 'button-select', formPage: 1, options: ['CD', 'Vinil (LP)', 'Kaseta', 'Ostalo'] },
      { key: 'izvodjac', label: 'Izvođač',  type: 'text',          formPage: 1, placeholder: 'npr. Bijelo Dugme, Queen' },
      { key: 'zanr',     label: 'Žanr',     type: 'select',        formPage: 1, options: ['Rock', 'Pop', 'Jazz', 'Klasika', 'Heavy metal', 'Punk', 'Hip-hop/Rap', 'Elektronska', 'Folk/Etno', 'Domaće', 'Soul/RnB', 'Blues', 'Reggae', 'Ostalo'] },
      { key: 'raritet',  label: 'Raritet',  type: 'boolean',       formPage: 1 },
    );
  }

  return fields;
}

// ── Main export ───────────────────────────────────────────

export function getCategoryFields(category: string, vehicleType?: VehicleType): CategoryField[] {
  const c = category.toLowerCase();

  // Nekretnine: per-Typ Felder
  if (c.includes('nekretnine')) {
    const subType = category.includes(' - ') ? category.split(' - ')[1] : category;
    return getNekretnineFields(subType);
  }

  // Tehnika i elektronika: per-Typ Felder
  if (c.includes('tehnika i elektronika') || (c.includes('tehnika') && !c.includes('bijela tehnik'))) {
    const subType = category.includes(' - ') ? category.split(' - ').slice(1).join(' - ') : category;
    return getTehnikaFields(subType);
  }

  // Parts check first
  if (vehicleType === 'parts' || c.includes('dijelovi')) return PARTS_FIELDS;

  // Prikolice — minimal fields, no marka/karoserija
  if (c.includes('prikolice') || c.includes('prikolica')) return PRIKOLICE_FIELDS;

  // Ostala vozila — minimal fields
  if (c.includes('ostala vozila')) return OSTALA_VOZILA_FIELDS;

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
  // Mobiteli i oprema: per-Typ Felder
  if (c.includes('mobilni') || c.includes('mobiteli')) {
    const subType = category.includes(' - ') ? category.split(' - ').slice(1).join(' - ') : category;
    return getMobitelFields(subType);
  }
  // Računala i IT: per-Typ Felder
  if (c.includes('računala') || c.includes('racunala')) {
    const subType = category.includes(' - ') ? category.split(' - ').slice(1).join(' - ') : category;
    return getRacunalaFields(subType);
  }
  // Odjeća i obuća: smart routing for shoes vs clothing vs accessories
  if (c.includes('odjeća i obuća') || c.includes('odjeca i obuca') || c.includes('moda') || c.includes('odijelo') || c.includes('cipele')) {
    const parts = category.split(' - ');
    const subCat = parts.length >= 2 ? parts[1].toLowerCase() : '';

    // Pure shoe subcategories → CIPELE_FIELDS (not "Dječja odjeća i obuća" or "Sportska odjeća i obuća")
    if (c.includes('cipele') || (subCat.includes('obuća') && !subCat.includes('odjeća'))) {
      return CIPELE_FIELDS;
    }

    // Everything else → getModaFields with full sub-type for smart detection
    const fullSubType = parts.length >= 2 ? parts.slice(1).join(' - ') : category;
    return getModaFields(fullSubType);
  }
  // Sport i rekreacija: per-Typ Felder
  if (c.includes('sport') || c.includes('fitnes') || c.includes('rekreacij')) {
    const subType = category.includes(' - ') ? category.split(' - ').slice(1).join(' - ') : category;
    return getSportFields(subType);
  }

  // Literatura i mediji: per-Typ Felder
  if (c.includes('literatur') || c.includes('knjig') || c.includes('časopis') || c.includes('casopis') || c.includes('strip') || c.includes('manga') || c.includes('dvd') || c.includes('blu-ray') || (c.includes('vinil') && !c.includes('pod'))) {
    const subType = category.includes(' - ') ? category.split(' - ').slice(1).join(' - ') : category;
    return getLiteraturaFields(subType);
  }

  // Djeca i bebe: per-Typ Felder
  if (c.includes('djeca') || c.includes('bebe') || c.includes('dječj') || c.includes('djecj')) {
    const subType = category.includes(' - ') ? category.split(' - ').slice(1).join(' - ') : category;
    return getDjecaFields(subType);
  }

  // Videoigre: per-Typ Felder
  if (c.includes('videoigre') || c.includes('video igre') || (c.includes('gaming') && !c.includes('laptop') && !c.includes('pc') && !c.includes('monitor'))) {
    const subType = category.includes(' - ') ? category.split(' - ').slice(1).join(' - ') : category;
    return getVideoigreFields(subType);
  }

  // Glazba i instrumenti: per-Typ Felder
  if (c.includes('glazba') || c.includes('instrument') || c.includes('gitar') || c.includes('bubnj') || c.includes('klavijatur') || c.includes('klavir') || c.includes('harmonik')) {
    const subType = category.includes(' - ') ? category.split(' - ').slice(1).join(' - ') : category;
    return getGlazbaFields(subType);
  }

  // Dom i vrtne garniture: per-Typ Felder
  if (c.includes('dom i vrt') || c.includes('namještaj') || c.includes('namjestaj') || c.includes('rasvjet') || c.includes('tepis') || c.includes('dekoracij') || c.includes('grijanj') || c.includes('vrt i balkon') || c.includes('bazen') || c.includes('jacuzzi') || c.includes('saun') || c.includes('sigurnosni sustav') || c.includes('vodoinstalacij') || c.includes('alati i pribor za dom')) {
    const subType = category.includes(' - ') ? category.split(' - ').slice(1).join(' - ') : category;
    return getDomFields(subType);
  }

  return [];
}
