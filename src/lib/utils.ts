import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Price Formatting ──────────────────────────────────────────────

const EUR_FORMATTER = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const KM_RATE = 1.95583; // Fixed EUR → BAM (KM) conversion rate

/**
 * Format price in EUR: "€55.000" / "€900"
 */
export function formatPrice(price: number): string {
  return EUR_FORMATTER.format(price);
}

/**
 * Convert EUR to BAM (KM) and format: "KM 107.500"
 */
export function formatPriceKM(priceEur: number): string {
  const km = Math.round(priceEur * KM_RATE);
  return `KM ${new Intl.NumberFormat('de-DE').format(km)}`;
}

/**
 * Format both currencies: { eur: "€900", km: "KM 1.760" }
 */
export function formatDualPrice(priceEur: number): { eur: string; km: string } {
  return {
    eur: formatPrice(priceEur),
    km: formatPriceKM(priceEur),
  };
}

// ── Relative Time ──────────────────────────────────────────────────

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Format date as relative time in Bosnian/Croatian:
 * "Upravo sada", "Prije 5 min", "Prije 2 sata", "Jučer", "Prije 3 dana", "15.01.2025."
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < MINUTE) return 'Upravo sada';
  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE);
    return `Prije ${mins} min`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `Prije ${hours} ${hours === 1 ? 'sat' : hours < 5 ? 'sata' : 'sati'}`;
  }
  if (diff < 2 * DAY) return 'Jučer';
  if (diff < 7 * DAY) {
    const days = Math.floor(diff / DAY);
    return `Prije ${days} dana`;
  }

  // Older than a week: full date
  return d.toLocaleDateString('hr-HR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ── Text Utilities ──────────────────────────────────────────────────

/**
 * Truncate text with ellipsis: "Sony PlayStation 5 Di..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

/**
 * Generate URL-friendly slug: "Porsche Panamera 4S" → "porsche-panamera-4s"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/[šŠ]/g, 's')
    .replace(/[žŽ]/g, 'z')
    .replace(/[đĐ]/g, 'dj')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── Search Helpers ──────────────────────────────────────────────────

/**
 * Normalize text for search: removes diacritics, lowercases
 * "Čevapčići" → "cevapcici"
 */
export function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/[šŠ]/g, 's')
    .replace(/[žŽ]/g, 'z')
    .replace(/[đĐ]/g, 'dj')
    .replace(/[ñ]/g, 'n');
}

/**
 * Check if a product matches a search query (diacritics-insensitive)
 */
export function matchesSearch(text: string, query: string): boolean {
  return normalizeSearch(text).includes(normalizeSearch(query));
}

// ── Condition Labels ──────────────────────────────────────────────

const CONDITION_MAP: Record<string, string> = {
  'New': 'Novo',
  'Like New': 'Kao novo',
  'Used': 'Korišteno',
};

/**
 * Translate condition label to Bosnian: "Like New" → "Kao novo"
 */
export function formatCondition(condition: string): string {
  return CONDITION_MAP[condition] || condition;
}

// ── AI Query Parser ───────────────────────────────────────────────

export interface AiQueryResult {
  /** The cleaned text query (price/modifier tokens removed) */
  cleanQuery: string;
  priceMin?: number;
  priceMax?: number;
  /** Detected category name (e.g. "Vozila") or null */
  detectedCategory: string | null;
}

/** Parse a number token that may contain dots/commas as thousands separators */
function parseNum(raw: string): number {
  return parseFloat(raw.replace(/\./g, '').replace(',', '.'));
}

/** Category keyword map: keyword → category name displayed in the app */
const CATEGORY_KEYWORDS: Array<{ keywords: string[]; category: string }> = [
  { keywords: ['auto', 'automobil', 'bmw', 'mercedes', 'volkswagen', 'vw', 'audi', 'golf', 'opel', 'toyota', 'honda', 'ford', 'renault', 'peugeot', 'fiat', 'škoda', 'skoda', 'limuzina', 'karavan', 'suv', 'hatchback', 'kombiju', 'kombi'], category: 'Vozila' },
  { keywords: ['motor', 'motocikl', 'motorka', 'skutar', 'moped', 'yamaha', 'honda motor', 'kawasaki', 'suzuki moto', 'harley'], category: 'Vozila' },
  { keywords: ['bicikl', 'e-bike', 'ebike', 'mtb', 'brdski bicikl', 'šoser', 'soser'], category: 'Vozila' },
  { keywords: ['stan', 'stanovi', 'apartman', 'kuca', 'kuća', 'nekretnina', 'nekretnine', 'zemljiste', 'zemljište', 'poslovni prostor', 'garsonjera', 'soba', 'vikendica', 'garaža'], category: 'Nekretnine' },
  { keywords: ['iphone', 'samsung', 'xiaomi', 'huawei', 'mobitel', 'telefon', 'pametni telefon', 'smartphone', 'redmi', 'pixel', 'oneplus', 'motorola mob'], category: 'Mobilni uređaji' },
  { keywords: ['laptop', 'prijenosnik', 'racunar', 'računar', 'pc', 'kompjuter', 'monitor', 'macbook', 'mac', 'imac', 'desktop', 'graficka', 'grafička', 'cpu', 'gpu', 'ram'], category: 'Kompjuteri' },
  { keywords: ['televizor', 'tv', 'frižider', 'frizider', 'veš mašina', 'ves masina', 'bijela tehnika', 'klima', 'perilica', 'usisavač', 'usisavac'], category: 'Elektronika' },
  { keywords: ['namještaj', 'namjestaj', 'krevet', 'sofa', 'fotelja', 'stol', 'ormar', 'stolica', 'tepih', 'lampa', 'garnitura'], category: 'Moj dom' },
  { keywords: ['odjeća', 'odjeca', 'jakna', 'traperice', 'patike', 'tenisice', 'cipele', 'haljina', 'majica', 'kaput', 'džemper', 'dzemper', 'moda'], category: 'Odjeća i obuća' },
  { keywords: ['bicikl sport', 'fitness', 'teretana', 'utezi', 'treadmill', 'skije', 'snowboard', 'tenis', 'fudbal', 'kosarka', 'ribolov', 'sportska'], category: 'Sportska oprema' },
  { keywords: ['ps5', 'playstation', 'xbox', 'nintendo', 'switch', 'igra', 'gaming', 'konzola', 'gamepad', 'steam', 'pc igra'], category: 'Video igre' },
  { keywords: ['gitara', 'klavir', 'bubnjevi', 'instrument', 'studio', 'mikrofon', 'zvucnik', 'zvučnik', 'amplifier', 'pojacalo', 'pojačalo'], category: 'Muzička oprema' },
  { keywords: ['knjiga', 'knjige', 'udzbenik', 'udžbenik', 'roman', 'strip', 'casopis', 'časopis'], category: 'Literatura' },
  { keywords: ['nakit', 'prsten', 'ogrlica', 'narukvica', 'nausnica', 'naušnica', 'sat', 'zlatni', 'srebrni'], category: 'Nakit i satovi' },
  { keywords: ['pas', 'pasa', 'macka', 'mačka', 'zivotinja', 'životinja', 'kuce', 'ljubimac', 'akvarij', 'papagaj'], category: 'Životinje' },
  { keywords: ['kolica', 'beba', 'djecija', 'dječija', 'igracka', 'igračka', 'lego', 'bebe'], category: 'Bebe i djeca' },
  { keywords: ['kamera', 'fotoaparat', 'objektiv', 'dslr', 'mirrorless', 'gopro', 'dron', 'drone'], category: 'Audio video foto' },
  { keywords: ['dijelovi', 'autoteile', 'gume', 'felge', 'motor dijelovi', 'kocnice', 'kočnice', 'amortizer', 'akumulator'], category: 'Dijelovi za vozila' },
  { keywords: ['posao', 'radim', 'trazim posao', 'tražim posao', 'zaposlenje', 'oglas za posao'], category: 'Poslovi' },
  { keywords: ['usluga', 'servis', 'popravak', 'majstor', 'instalater', 'automehaničar', 'frizer'], category: 'Servisi i usluge' },
];

/**
 * Parse a natural language query and extract:
 * - price range (e.g. "10.000 do 20.000", "ispod 5000", "od 1000")
 * - detected category from keywords
 * - clean text query for product matching
 */
export function parseAiQuery(input: string): AiQueryResult {
  let text = input.trim();
  let priceMin: number | undefined;
  let priceMax: number | undefined;

  // Normalize: remove currency labels and standardize separators
  const normalized = text
    .replace(/eura?|€|eur|km\b|konvertibilnih/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const numPat = '(\\d{1,3}(?:[.,]?\\d{3})*(?:[.,]\\d+)?)';

  // "od X do Y" / "X do Y" / "između X i Y"
  const rangeMatch = normalized.match(
    new RegExp(`(?:od\\s+)?${numPat}\\s*(?:do|-)\\s*${numPat}`, 'i')
  );
  if (rangeMatch) {
    priceMin = parseNum(rangeMatch[1]);
    priceMax = parseNum(rangeMatch[2]);
    text = text.replace(rangeMatch[0], '').trim();
  } else {
    // "ispod X" / "do X" / "manje od X"
    const maxMatch = normalized.match(
      new RegExp(`(?:ispod|do|manje od|max\\.?)\\s+${numPat}`, 'i')
    );
    if (maxMatch) {
      priceMax = parseNum(maxMatch[1]);
      text = text.replace(maxMatch[0], '').trim();
    }

    // "od X" / "preko X" / "više od X" / "minimum X"
    const minMatch = normalized.match(
      new RegExp(`(?:od|preko|više od|min\\.?|minimum)\\s+${numPat}`, 'i')
    );
    if (minMatch) {
      priceMin = parseNum(minMatch[1]);
      text = text.replace(minMatch[0], '').trim();
    }

    // standalone "Xk" shorthand (e.g. "10k")
    const kMatch = normalized.match(/(\d+(?:[.,]\d+)?)k\b/gi);
    if (kMatch && !rangeMatch) {
      const vals = kMatch.map(m => parseNum(m.replace(/k$/i, '')) * 1000);
      if (vals.length >= 2) { priceMin = vals[0]; priceMax = vals[1]; }
      else if (vals.length === 1) { priceMax = vals[0]; }
      text = text.replace(/\d+(?:[.,]\d+)?k\b/gi, '').trim();
    }
  }

  // Detect category from keywords (first match wins)
  const lowerText = normalizeSearch(input);
  let detectedCategory: string | null = null;
  for (const { keywords, category } of CATEGORY_KEYWORDS) {
    if (keywords.some(kw => lowerText.includes(normalizeSearch(kw)))) {
      detectedCategory = category;
      break;
    }
  }

  // Clean up stray punctuation and double spaces
  const cleanQuery = text.replace(/\s{2,}/g, ' ').trim();

  return { cleanQuery, priceMin, priceMax, detectedCategory };
}
