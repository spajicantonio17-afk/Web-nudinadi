import { NextRequest, NextResponse } from 'next/server';
import { textWithGemini, parseJsonResponse, sanitizeForPrompt } from '@/lib/gemini';
import { lookupChassis } from '@/lib/vehicle-chassis-codes';
import { CATEGORIES } from '@/lib/constants';

// ── URL normalization ────────────────────────────────────
function normalizeUrl(raw: string): string {
  let url = raw.trim();
  url = url.replace(/[?&](utm_\w+|fbclid|gclid|ref|source|mc_cid|mc_eid)=[^&]*/gi, '');
  url = url.replace(/[?&]$/, '');
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  return url;
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

// ── Multiple header sets for retry ───────────────────────
const HEADER_SETS: Record<string, string>[] = [
  {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'hr,bs;q=0.9,sr;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
  },
  {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'bs-BA,bs;q=0.9,hr;q=0.8,en-US;q=0.7',
    'Cache-Control': 'no-cache',
  },
  {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  },
];

/** Extract image URLs from HTML before stripping tags */
function extractImages(html: string): string[] {
  const seen = new Set<string>();
  const images: string[] = [];

  const add = (src: string) => {
    try {
      const clean = src.split('?')[0];
      if (!seen.has(clean) && src.startsWith('http') && src.length < 500) {
        seen.add(clean);
        images.push(src);
      }
    } catch { /* skip invalid */ }
  };

  // og:image
  for (const m of html.matchAll(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi)) add(m[1]);
  for (const m of html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/gi)) add(m[1]);

  // twitter:image
  for (const m of html.matchAll(/<meta[^>]+(?:name|property)=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi)) add(m[1]);

  // img src / data-src
  for (const m of html.matchAll(/<img[^>]+(?:src|data-src|data-lazy-src)=["']([^"']+)["'][^>]*>/gi)) {
    const src = m[1];
    if (
      src.startsWith('http') &&
      /\.(jpg|jpeg|png|webp)/i.test(src) &&
      !/(?:icon|logo|pixel|tracking|banner|sprite|avatar|thumb\.(?:gif|png)$|\/assets\/|\/medals\/|\/badges\/|\/ui\/|\/static\/img)/i.test(src)
    ) add(src);
  }

  // srcset
  for (const m of html.matchAll(/srcset=["']([^"']+)["']/gi)) {
    const first = m[1].split(',')[0].trim().split(' ')[0];
    if (first.startsWith('http')) add(first);
  }

  return images.slice(0, 12);
}

/** Extract OG and other meta tags */
function extractMeta(html: string): Record<string, string> {
  const meta: Record<string, string> = {};
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) meta.title = titleMatch[1].trim();
  for (const m of html.matchAll(/<meta[^>]+property=["'](og:[^"']+|article:[^"']+)["'][^>]+content=["']([^"']+)["'][^>]*>/gi)) {
    meta[m[1]] = m[2].trim();
  }
  for (const m of html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["'](og:[^"']+|article:[^"']+)["'][^>]*>/gi)) {
    meta[m[2]] = m[1].trim();
  }
  for (const m of html.matchAll(/<meta[^>]+name=["'](description|keywords|price|product:price:amount|product:price:currency)["'][^>]+content=["']([^"']+)["'][^>]*>/gi)) {
    meta[m[1]] = m[2].trim();
  }
  return meta;
}

/** Extract location directly from HTML (structured data, meta tags, OLX patterns) */
function extractLocationFromHtml(html: string): string | null {
  // 1) JSON-LD: Product/Offer with address/location
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const obj = JSON.parse(m[1]);
      // Check availableAtOrFrom.address (OLX pattern)
      const addr = obj.availableAtOrFrom?.address || obj.address || obj.contentLocation?.address;
      if (addr) {
        const city = addr.addressLocality || addr.name;
        if (city && typeof city === 'string') return city.trim();
      }
      // Check offers.availableAtOrFrom
      const offers = Array.isArray(obj.offers) ? obj.offers[0] : obj.offers;
      if (offers?.availableAtOrFrom?.address?.addressLocality) {
        return offers.availableAtOrFrom.address.addressLocality.trim();
      }
      // Check location field directly
      if (obj.location?.name && typeof obj.location.name === 'string') return obj.location.name.trim();
      if (obj.location?.address?.addressLocality) return obj.location.address.addressLocality.trim();
    } catch { /* skip */ }
  }

  // 2) Meta tags: og:locality, geo.placename, og:region, place:location:locality
  for (const m of html.matchAll(/<meta[^>]+(?:name|property)=["'](og:locality|geo\.placename|place:location:locality|og:region|icbm)["'][^>]+content=["']([^"']+)["'][^>]*>/gi)) {
    if (m[2] && m[2].length < 50) return m[2].trim();
  }
  for (const m of html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["'](og:locality|geo\.placename|place:location:locality)["'][^>]*>/gi)) {
    if (m[1] && m[1].length < 50) return m[1].trim();
  }

  // 3) Inline JSON patterns (Nuxt __NUXT__, Next __NEXT_DATA__, generic)
  const jsonPatterns = [
    /"location"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]{2,40})"/i,
    /"city"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]{2,40})"/i,
    /"cityName"\s*:\s*"([^"]{2,40})"/i,
    /"locationName"\s*:\s*"([^"]{2,40})"/i,
    /"city_name"\s*:\s*"([^"]{2,40})"/i,
    /"place"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]{2,40})"/i,
    /data-(?:location|city|place)=["']([^"']{2,40})["']/i,
  ];
  for (const pattern of jsonPatterns) {
    const m = html.match(pattern);
    if (m && m[1]) {
      const val = m[1].trim();
      if (val && !/^(http|www|\d+$|null|true|false)/i.test(val)) return val;
    }
  }

  // 4) Njuskalo.hr / classified sites: <dt>Lokacija vozila</dt><dd>Zagrebačka, Velika Gorica...</dd>
  const dtddLoc = html.match(/<dt[^>]*>[\s\S]*?Lokacija[\s\S]*?<\/dt>[\s\S]*?<dd[^>]*>([\s\S]*?)<\/dd>/i);
  if (dtddLoc) {
    const loc = dtddLoc[1].replace(/<[^>]+>/g, '').trim();
    if (loc.length > 2 && loc.length < 100) return loc;
  }

  // 5) OLX.ba specific: cities:[{id:37,name:"Tuzla",location:{lat:...}}]
  const olxCities = html.match(/cities:\[\{[^}]*name:"([^"]{2,30})"/);
  if (olxCities && olxCities[1]) return olxCities[1].trim();

  // 5) OLX.ba inline JS: ,"Sarajevo - Stari Grad","43.859...","18.433..."
  const olxJsCity = html.match(/,"([A-Z\u0106\u010C\u017D\u0160\u0110\u0104][a-z\u0107\u010D\u017E\u0161\u0111\u0105A-Z\u0106\u010C\u017D\u0160\u0110 \-]{2,40})","[\d.]+","[\d.]+"/);
  if (olxJsCity && olxJsCity[1]) return olxJsCity[1].trim();

  // 6) OLX.ba: city in a div with whitespace (location display element)
  //    Pattern: "                    Sarajevo - Stari Grad</div> <!---->"
  const olxDivCity = html.match(/\s{4,}([A-Z\u0106\u010C\u017D\u0160\u0110][a-z\u0107\u010D\u017E\u0161\u0111A-Za-z \-]{2,40})<\/div>\s*<!---->/);
  if (olxDivCity && olxDivCity[1]) {
    const val = olxDivCity[1].trim();
    // Exclude non-location strings (condition, category names, etc.)
    if (!/\b(kori[sš]ten|novo|obnovljen|o[sš]te[cć]en|vozila|automobil|elektron)/i.test(val)) {
      return val;
    }
  }

  return null;
}

/** Extract JSON-LD structured data */
function extractJsonLd(html: string): string {
  const blocks: string[] = [];
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const obj = JSON.parse(m[1]);
      const type = obj['@type'] || '';
      if (/Product|Offer|ItemPage|BreadcrumbList/i.test(type) || obj.name || obj.price) {
        blocks.push(JSON.stringify(obj));
      }
    } catch { /* skip */ }
  }
  return blocks.slice(0, 3).join('\n');
}

/** Strip HTML to plain readable text */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\\u003[Cc]br\\u003[Ee]/g, '\n')
    .replace(/&lt;br&gt;/gi, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n[^\S\n]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Extract breadcrumb navigation from HTML (helps AI with category detection) */
function extractBreadcrumbs(html: string): string | null {
  // Try JSON-LD BreadcrumbList
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const obj = JSON.parse(m[1]);
      if (obj['@type'] === 'BreadcrumbList' && Array.isArray(obj.itemListElement)) {
        const crumbs = obj.itemListElement
          .sort((a: { position?: number }, b: { position?: number }) => (a.position || 0) - (b.position || 0))
          .map((el: { name?: string; item?: { name?: string } }) => el.name || el.item?.name)
          .filter(Boolean);
        if (crumbs.length > 0) return crumbs.join(' > ');
      }
    } catch { /* skip */ }
  }

  // Try HTML breadcrumb patterns
  const patterns = [
    /<(?:nav|ol|ul)[^>]+class="[^"]*breadcrumb[^"]*"[^>]*>([\s\S]*?)<\/(?:nav|ol|ul)>/gi,
    /<div[^>]+class="[^"]*breadcrumb[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<(?:nav|ol|ul)[^>]+aria-label="[^"]*(?:breadcrumb|navigacija|mrvice)[^"]*"[^>]*>([\s\S]*?)<\/(?:nav|ol|ul)>/gi,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const text = htmlToText(match[1]).trim().replace(/\s*[›»/]\s*/g, ' > ');
      if (text.length > 5 && text.length < 300) return text;
    }
  }

  // OLX.ba specific: <a class="breadcrumbs">Vozila</a> <a class="breadcrumbs">Automobili</a>
  const olxBreadcrumbs: string[] = [];
  for (const m of html.matchAll(/<a[^>]+class="[^"]*breadcrumbs?[^"]*"[^>]*>([^<]+)<\/a>/gi)) {
    const text = m[1].trim();
    if (text && !olxBreadcrumbs.includes(text)) olxBreadcrumbs.push(text);
  }
  if (olxBreadcrumbs.length > 0) return olxBreadcrumbs.join(' > ');

  // Njuskalo.hr: <nav class="breadcrumbs"> with <li class="breadcrumb-item"><a class="link">
  const njuskaloNav = html.match(/<nav[^>]+class="[^"]*breadcrumbs[^"]*"[^>]*>([\s\S]*?)<\/nav>/i);
  if (njuskaloNav) {
    const items: string[] = [];
    for (const m of njuskaloNav[1].matchAll(/<a[^>]*>([^<]+)<\/a>/g)) {
      const text = m[1].trim();
      if (text && text !== 'Oglasnik' && !items.includes(text)) items.push(text);
    }
    if (items.length > 0) return items.join(' > ');
  }

  // Fallback: extract category from og:description (e.g. "VW PASSAT - Automobili - 13.999 KM")
  const ogDesc = html.match(/property="og:description"[^>]+content="([^"]+)"/i)
    || html.match(/content="([^"]+)"[^>]+property="og:description"/i);
  if (ogDesc) {
    const parts = ogDesc[1].split(/\s*-\s*/);
    if (parts.length >= 2) {
      const catPart = parts[1].trim();
      if (/^(Vozila|Automobili|Dijelovi|Nekretnine|Mobiteli|Elektronika|Sport)/i.test(catPart)) {
        return catPart;
      }
    }
  }

  return null;
}

/** Normalize AI category to match upload page's internal naming */
function normalizeCategoryForApp(
  category: string,
  subcategory: string | null,
): { category: string; subcategory: string | null } {
  if (!category) return { category, subcategory };
  const c = category.toLowerCase();

  // "Dijelovi za automobile" → "Dijelovi za vozila" (upload page format)
  if (c.includes('dijelovi')) {
    return { category: 'Dijelovi za vozila', subcategory };
  }
  // "Mobiteli i oprema" → "Mobilni uređaji" (upload page format)
  if (c.includes('mobiteli') || c.includes('mobitel')) {
    return { category: 'Mobilni uređaji', subcategory };
  }
  // "Tehnika i elektronika" / "Računala i IT" → Elektronika composite
  if ((c.includes('tehnika') || c.includes('računala') || c.includes('racunala')) && subcategory) {
    return { category: `Elektronika - ${subcategory}`, subcategory };
  }
  // "Odjeća i obuća" → Moda composite
  if ((c.includes('odjeća') || c.includes('obuća')) && !c.includes('djecu') && subcategory) {
    return { category: `Moda - ${subcategory}`, subcategory };
  }
  // "Usluge" with subcategory → composite
  if (c === 'usluge' && subcategory) {
    return { category: `Usluge - ${subcategory}`, subcategory };
  }
  // "Poslovi" with subcategory → composite
  if (c === 'poslovi' && subcategory) {
    return { category: `Poslovi - ${subcategory}`, subcategory };
  }
  // "Nekretnine" with subcategory → composite
  if (c === 'nekretnine' && subcategory) {
    return { category: `Nekretnine - ${subcategory}`, subcategory };
  }

  return { category, subcategory };
}

// ── Smart defaults: keyword rules + fallback for each subcategory ──
const ITEM_DEFAULTS: Record<string, { rules: [RegExp, string][]; fallback?: string }> = {
  // ── VOZILA ──
  'Osobni automobili': {
    rules: [
      [/\b(oldtimer|veteran|classic|vintage|starodobni)\b/i, 'Oldtimeri'],
      [/\b(elektri[čc]n|electric|tesla|e[\-\s]?tron|id[\.\s]?\d)\b/i, 'Električni automobili'],
      [/\b(hibrid|hybrid|plug[\-\s]?in|phev)\b/i, 'Hibridni automobili'],
      [/\b(karambol|neisprav|ošte[ćc]en|havarisan|za\s+dijelov)\b/i, 'Karambolirani i neispravni automobili'],
      [/\b(0\s*km|iz\s+salon|autoku[ćc]|fabri[čc]ki?\s+nov|novo\s+vozilo)\b/i, 'Novi automobili (od autokuće)'],
      [/\bgarancij/i, 'Automobili s garancijom'],
    ],
    fallback: 'Polovni automobili',
  },
  'Motocikli i skuteri': {
    rules: [
      [/\b(skuter|moped|vespa|piaggio|beverly|burgman)\b/i, 'Skuteri i mopedi'],
      [/\b(enduro|cross|motocross|mx|ktm\s+exc|crf|yz[0-9])\b/i, 'Enduro i cross'],
      [/\b(chopper|cruiser|harley|bobber|indian|dragstar|intruder)\b/i, 'Cruiser / chopper'],
      [/\b(naked|streetfighter|z[0-9]{3}|mt[\-\s]?\d|duke|monster)\b/i, 'Naked / streetfighter'],
      [/\b(elektri[čc]n|electric|zero\s+s)\b/i, 'Električni motocikli i skuteri'],
      [/\b(sport|supersport|cbr|gsxr?|zx[\-]?\d|yzf|r[16]|panigale)\b/i, 'Sport motocikli'],
      [/\b(tricik|quadricik|trike|can[\-\s]?am)\b/i, 'Tricikli i quadricikli'],
    ],
  },
  'Teretna vozila': {
    rules: [
      [/\b(kombi|dostav|transporter|sprinter|crafter|transit|vito|caddy)\b/i, 'Kombiji i dostavna vozila (do 3.5t)'],
      [/\b(teglj|vu[čc]n|šlep|sattelzug)\b/i, 'Tegljači i vučna vozila'],
      [/\b(kiper|kipper)\b/i, 'Kiperi i kiper prikolice'],
      [/\b(cistern)\b/i, 'Cisterne'],
      [/\b(hladnja[čc]|frigo)\b/i, 'Hladnjače'],
      [/\b(kamion|lkw|truck)\b/i, 'Teški kamioni (7.5t+)'],
    ],
  },
  'Bicikli': {
    rules: [
      [/\b(mtb|mountain|brdsk|enduro\s+bi|downhill|trail\s+bi)/i, 'MTB / Mountain bike'],
      [/\b(cestovn|road[\s\-]?bike|trka[ćc]|aero[\s\-]?bi)/i, 'Cestovni (road) bicikli'],
      [/\b(elektri[čc]n|e[\-\s]?bike|ebike|pedelec)/i, 'Električni bicikli (e-bike)'],
      [/\b(gravel)/i, 'Gravel bicikli'],
      [/\b(bmx)/i, 'BMX'],
      [/\b(sklop|folding|brompton)/i, 'Sklopivi bicikli'],
      [/\b(dje[čc]j|kid|child|za\s+dijete)/i, 'Dječji bicikli'],
      [/\b(trekking|city|gradsk)/i, 'Trekking i city bicikli'],
    ],
  },
  'Nautika i plovila': {
    rules: [
      [/\b(jahta|yacht)\b/i, 'Jahte'],
      [/\b(jedrilic|sail)\b/i, 'Jedrilice'],
      [/\b(jet[\s\-]?ski|vodeni\s+skuter)\b/i, 'Jet ski i vodeni skuteri'],
      [/\b(gumenj|rib\b|inflat)\b/i, 'Gumenjaci i RIB čamci'],
      [/\b(kajak|kanu)\b/i, 'Kajaki i kanui'],
      [/\b(sup\s+dask|stand[\-\s]?up[\-\s]?paddle)/i, 'SUP daske'],
      [/\b(ribar|fishing)\b/i, 'Ribarski čamci'],
      [/\b(brod|ship)\b/i, 'Brodovi'],
    ],
    fallback: 'Čamci na motor',
  },

  // ── NEKRETNINE ──
  'Stanovi': {
    rules: [
      [/\b(najam|iznajm|rent|miete)\b/i, 'Najam stanova (dugoročni)'],
      [/\b(na\s+dan|daily|dnevn|kratkoročn)/i, 'Stan na dan (kratkoročni)'],
      [/\b(novogradnj|new[\-\s]?build|neubau)/i, 'Stanovi – novogradnja'],
      [/\b(luksuz|luxury|penthouse|premium)/i, 'Luksuzni stanovi'],
    ],
    fallback: 'Prodaja stanova',
  },
  'Kuće': {
    rules: [
      [/\b(najam|iznajm|rent|miete)\b/i, 'Najam kuća'],
      [/\b(monta[žz]n|prefab)/i, 'Montažne kuće i objekti'],
      [/\b(vikend|seosk|rural|cottage)/i, 'Vikendice i seoske kuće'],
    ],
    fallback: 'Prodaja kuća',
  },
  'Zemljišta': {
    rules: [
      [/\b(poljopriv|agrar|njiva|oranica)\b/i, 'Poljoprivredno zemljište'],
      [/\b(šumsk|šuma|forest)\b/i, 'Šumsko zemljište'],
    ],
    fallback: 'Građevinsko zemljište',
  },
  'Poslovni prostori': {
    rules: [
      [/\b(najam|iznajm|rent|miete)\b/i, 'Najam poslovnih prostora'],
      [/\b(industrijski|tvornica|fabrik)\b/i, 'Industrijski objekti'],
      [/\b(skladišt|hal[ae]|magacin|lager)\b/i, 'Skladišta i hale'],
      [/\b(ugostitelj|restoran|caf[eé]|kafi[ćc])\b/i, 'Ugostiteljski prostori'],
      [/\b(ured|kancelarij|office|büro)\b/i, 'Uredi'],
    ],
    fallback: 'Prodaja poslovnih prostora',
  },
  'Garaže i parkirna mjesta': {
    rules: [
      [/\b(najam|iznajm|rent)\b/i, 'Najam garaža'],
      [/\b(parkirn|parking)\b/i, 'Parkirna mjesta'],
    ],
    fallback: 'Prodaja garaža',
  },

  // ── MOBITELI ──
  'Mobiteli – Apple iPhone': {
    rules: [
      [/\biphone\s*16/i, 'iPhone 16 serija'],
      [/\biphone\s*15/i, 'iPhone 15 serija'],
      [/\biphone\s*14/i, 'iPhone 14 serija'],
      [/\biphone\s*13/i, 'iPhone 13 serija'],
    ],
    fallback: 'iPhone 12 i stariji',
  },
  'Mobiteli – Samsung': {
    rules: [
      [/\bgalaxy\s+[sz]\s*\d/i, 'Galaxy S serija'],
      [/\bgalaxy\s+a\s*\d/i, 'Galaxy A serija'],
      [/\bgalaxy\s+z|fold|flip/i, 'Galaxy Z Fold/Flip'],
    ],
    fallback: 'Ostali Samsung',
  },
  'Tableti': {
    rules: [
      [/\bipad\b/i, 'Apple iPad'],
      [/\bgalaxy\s+tab/i, 'Samsung Galaxy Tab'],
      [/\bmatepad/i, 'Huawei MatePad'],
    ],
    fallback: 'Ostali tableti',
  },

  // ── RAČUNALA I IT ──
  'Laptopi': {
    rules: [
      [/\b(macbook|apple\s+m[0-9])/i, 'Apple MacBook'],
      [/\b(dell|hp|hewlett|lenovo|thinkpad|elitebook|latitude|probook)/i, 'Dell / HP / Lenovo'],
      [/\b(asus|acer|msi|predator|nitro|rog)\b/i, 'Asus / Acer / MSI'],
      [/\b(gaming|gamer|rtx|gtx)\b/i, 'Gaming laptopi'],
      [/\b(dijelov|za\s+dijelove)\b/i, 'Dijelovi laptopa'],
      [/\b(ošte[ćc]en|pokvar|neisprav)\b/i, 'Oštećeni laptopi (za dijelove)'],
    ],
    fallback: 'Poslovni laptopi',
  },
  'Desktop računala': {
    rules: [
      [/\b(gaming|gamer|rtx|gtx|rx\s?\d)\b/i, 'Gaming PC-evi'],
      [/\b(mini\s*pc|nuc|beelink|minisforum)\b/i, 'Mini PC i NUC'],
    ],
    fallback: 'Kompletni desktop računala',
  },
  'Gaming i konzole': {
    rules: [
      [/\b(ps\s*5|playstation\s*5)\b/i, 'PlayStation 5'],
      [/\b(ps\s*4|playstation\s*4)\b/i, 'PlayStation 4 i stariji'],
      [/\b(xbox\s+series|xbox\s+[sx])\b/i, 'Xbox Series X/S'],
      [/\b(switch|nintendo)\b/i, 'Nintendo Switch'],
      [/\b(vr|virtual[\s\-]?reality|quest|psvr)\b/i, 'VR naočale i oprema'],
      [/\b(retro|sega|nes|snes|gameboy|n64)\b/i, 'Retro konzole'],
    ],
  },

  // ── TEHNIKA ──
  'Televizori': {
    rules: [
      [/\b(oled)\b/i, 'OLED TV'],
      [/\b(qled|neo\s*qled)\b/i, 'QLED / LED TV'],
      [/\b(smart\s*tv)\b/i, 'Smart TV'],
      [/\b(projektor|beamer)\b/i, 'Projektori'],
    ],
    fallback: 'Smart TV',
  },
  'Bijela tehnika': {
    rules: [
      [/\b(hladnjak|fridge|zamrziva[čc]|freezer)\b/i, 'Hladnjaci i zamrzivači'],
      [/\b(perilica\s+rublja|waschmaschine|washing)\b/i, 'Perilice rublja'],
      [/\b(perilica\s+posu[đd]a|dishwasher|geschirrspüler)\b/i, 'Perilice posuđa'],
      [/\b(sušilica|dryer|trockner)\b/i, 'Sušilice rublja'],
      [/\b(pe[ćc]nica|oven|backofen)\b/i, 'Pećnice'],
      [/\b(štednjak|sporet|herd|plo[čc]a\s+za\s+kuhanje)\b/i, 'Štednjaci i ploče za kuhanje'],
      [/\b(mikrovaln|microwave)\b/i, 'Mikrovalne pećnice'],
      [/\b(klima|air\s*con)/i, 'Aparati za klimu (split sustav)'],
    ],
  },

  // ── VIDEOIGRE ──
  'PlayStation': {
    rules: [
      [/\b(ps\s*5|playstation\s*5)\b/i, 'PS5 – igre i oprema'],
      [/\b(ps\s*4|playstation\s*4)\b/i, 'PS4 – igre i oprema'],
    ],
    fallback: 'PS4 – igre i oprema',
  },
  'Xbox': {
    rules: [
      [/\b(series\s*[sx]|xbox\s+s[ex])\b/i, 'Xbox Series X/S'],
    ],
    fallback: 'Xbox One',
  },
  'Nintendo': {
    rules: [
      [/\b(switch)\b/i, 'Nintendo Switch'],
      [/\b(3ds|ds\b)/i, 'DS i 3DS'],
    ],
    fallback: 'Nintendo Switch',
  },

  // ── SPORT ──
  'Fitness i teretana': {
    rules: [
      [/\b(bu[čc]ic|uteg|dumbbell|kettlebell|girja|gir[ei])\b/i, 'Bučice i utezi'],
      [/\b(traka\s+za\s+tr[čc]anje|treadmill|ergometar|stepper)\b/i, 'Trake za trčanje i bicikl ergometar'],
      [/\b(crosstrainer|vesla[čć]|rower|elipti[čc])\b/i, 'Crosstraineri i veslači'],
      [/\b(klupa|bench\s*press)\b/i, 'Klupe za vježbanje'],
      [/\b(yoga|pilates|mat[ae]?\b|fitnes\s*lopta)\b/i, 'Yoga i pilates oprema'],
      [/\b(protein|kreatin|suplement|whey|bcaa|gainer)\b/i, 'Dodaci prehrani (proteini, kreatin...)'],
      [/\b(rukavic|pojas\s+za\s+trening|lifting\s*strap)\b/i, 'Rukavice i pojas za trening'],
      [/\b(skakan|crossfit|vijalic|vijalica|rope|jump)\b/i, 'Skakanje i crossfit oprema'],
      [/\b(vratilo|razboj|sprav[aei]|multi\s*funk|power\s*tower|smith|rack|cage)\b/i, 'Višefunkcionalne sprave'],
    ],
    fallback: 'Višefunkcionalne sprave',
  },
  'Zimski sportovi': {
    rules: [
      [/\b(skij[ae]|ski\b)/i, 'Skije kompletan set'],
      [/\b(snowboard)\b/i, 'Snowboard kompletan set'],
      [/\b(klizaljk|ice[\s\-]?skat)/i, 'Klizaljke'],
      [/\b(sanjk|sled)\b/i, 'Sanjke'],
    ],
  },
  'Planinarenje i kampiranje': {
    rules: [
      [/\b(šator|tent)\b/i, 'Šatori'],
      [/\b(vre[ćc]a\s+za\s+spava|sleeping[\s\-]?bag)\b/i, 'Vreće za spavanje'],
      [/\b(ruksak|backpack)\b/i, 'Ruksaci planinarski'],
      [/\b(planinars?k[aie]\s+cipel|hiking[\s\-]?boot)\b/i, 'Planinarske cipele'],
    ],
  },

  // ── ODJEĆA ──
  'Ženska odjeća': { rules: [], fallback: 'Casual' },
  'Ženska obuća': { rules: [], fallback: 'Tenisice' },
  'Muška odjeća': { rules: [], fallback: 'Sport i slobodno vrijeme' },
  'Muška obuća': { rules: [], fallback: 'Tenisice' },

  // ── GLAZBA ──
  'Gitare': {
    rules: [
      [/\b(akusti[čc]n)\b/i, 'Akustične gitare'],
      [/\b(elektri[čc]n|fender|gibson|ibanez|jackson)\b/i, 'Električne gitare'],
      [/\b(bas\s+gitar|bass)\b/i, 'Bas gitare'],
      [/\b(klasi[čc]n|nylon)\b/i, 'Klasične gitare'],
    ],
  },
  'Klavijature i klaviri': {
    rules: [
      [/\b(digital|stage\s+piano)\b/i, 'Digitalni klaviri'],
      [/\b(harmonik|accordion)\b/i, 'Harmonike'],
      [/\b(sintesajzer|synth|workstation)\b/i, 'Sintesajzeri i workstations'],
    ],
  },

  // ── STROJEVI I ALATI ──
  'Električni alati': {
    rules: [
      [/\b(bušili|drill|aku[\s\-]?bušili|udarn[aei]\s+bušili|hilti)/i, 'Bušilice i udarne bušilice'],
      [/\b(odvija[čć]|aku[\s\-]?odvija[čć]|impact\s*wrench|stezni[\s\-]?klju[čć]|momentni)/i, 'Bušilice i udarne bušilice'],
      [/\b(brusilica?\s+za\s+drvo|šlajferic|šmirgl|brusni\s+papir)/i, 'Brusilice za drvo'],
      [/\b(cirkular|kružn[aei]\s+pil|table\s*saw|parn[aei]\s+pil)/i, 'Cirkularne pile'],
      [/\b(kutna\s+brusilica|flex\b|angle\s*grind)/i, 'Kutne brusilice'],
      [/\b(kompresor)/i, 'Kompresori'],
      [/\b(ubodna\s+pila|jigsaw|dekapir)/i, 'Ubodne pile'],
      [/\b(pneumats)/i, 'Pneumatski alati'],
    ],
    fallback: 'Bušilice i udarne bušilice',
  },
  'Ručni alati': {
    rules: [
      [/\b(čekić|hammer|bat)\b/i, 'Čekići, odvijači, kliješta'],
      [/\b(odvijač(?!.*aku)|kliješta|klješta|plier)/i, 'Čekići, odvijači, kliješta'],
      [/\b(ključ|nasadni|socket|gedora|moment|torx)/i, 'Ključevi i nasadni seti'],
      [/\b(libel|mjera[čć]|laser|nivelit|metar\b)/i, 'Mjerači i libele'],
    ],
    fallback: 'Ostali ručni alati',
  },
  'Građevinski strojevi': {
    rules: [
      [/\b(bager|excavat)/i, 'Mini bageri'],
      [/\b(utovariva[čć]|loader|bobcat)/i, 'Utovarivači'],
      [/\b(dizalic|kran|crane|platforma|lift)/i, 'Dizalice i platforme'],
      [/\b(miješalic|betonijer|mixer)/i, 'Betonske miješalice'],
      [/\b(vibracij|compactor|nabija[čć])/i, 'Vibracijske ploče'],
    ],
    fallback: 'Mini bageri',
  },
  'Poljoprivredni strojevi': {
    rules: [
      [/\b(traktor|tractor|john\s*deere|massey|fendt)/i, 'Traktori'],
      [/\b(kombajn|harvester)/i, 'Kombajni'],
      [/\b(kosilic|mower)/i, 'Kosilice traktorske'],
      [/\b(plug|tanjura[čć]|roto\s*till)/i, 'Priključci za traktor (plug, tanjurača, roto tiller...)'],
      [/\b(prskalic|špric|atomizer)/i, 'Šprice i atomizeri'],
    ],
    fallback: 'Traktori',
  },
  'Vrtni strojevi': {
    rules: [
      [/\b(kosilic|lawnmow)/i, 'Motorne kosilice'],
      [/\b(motorna\s+pila|chainsaw|lan[čć]ana)/i, 'Motorne pile'],
      [/\b(trimer|trimmer|kosa[čć]ic)/i, 'Motorni trimer'],
      [/\b(šiša[čć]|hedge)/i, 'Motorni šišači živice'],
      [/\b(usisava[čć]\s+liš|blower|puha[čć])/i, 'Lišće usisavači'],
      [/\b(ride[\s\-]?on|traktor\s+kosilic)/i, 'Ride-on kosilice'],
    ],
    fallback: 'Motorne kosilice',
  },
  'Industrijski i prerađivački strojevi': {
    rules: [
      [/\b(drvo|stolarsk|wood|cnc.*drv)/i, 'Strojevi za obradu drva'],
      [/\b(metal|čelik|tokaril|glodal|cnc\b|brusil)/i, 'Strojevi za obradu metala'],
      [/\b(kamen|granit|mramor)/i, 'Strojevi za obradu kamena'],
      [/\b(pakovan|pakiranj|vacuum.*seal)/i, 'Strojevi za pakovanje'],
      [/\b(tekstil|šiva[ćč]|sewing)/i, 'Tekstilni strojevi'],
    ],
    fallback: 'Strojevi za obradu metala',
  },

  // ── DOM I VRT ──
  'Namještaj – Dnevna soba': {
    rules: [
      [/\b(kau[čć]|sofa|garnitur)/i, 'Garniture i kauči'],
      [/\b(stol\b|stolić|komoda|coffee\s*table)/i, 'Stolovi i komode'],
      [/\b(polica|regal|vitrina)/i, 'Police i regali'],
      [/\b(tv\s*(komoda|ormar)|media\s*unit)/i, 'TV komode'],
    ],
    fallback: 'Garniture i kauči',
  },
  'Namještaj – Spavaća soba': {
    rules: [
      [/\b(krevet|madrac|dušek|bed\b)/i, 'Kreveti i madraci'],
      [/\b(ormar|garderob|wardrobe)/i, 'Ormari za spavaću sobu'],
    ],
    fallback: 'Kreveti i madraci',
  },
  'Namještaj – Kuhinja i blagovaonica': {
    rules: [
      [/\b(kuhinjsk|kitchen)/i, 'Kuhinjski elementi'],
      [/\b(stol\s+za\s+jelo|blagov|dining)/i, 'Stolovi za jelo i stolice'],
    ],
    fallback: 'Kuhinjski elementi',
  },
  'Grijanje i hlađenje': {
    rules: [
      [/\b(klima|air\s*con)/i, 'Klima uređaji'],
      [/\b(radijator|grijalic|grijač|heater)/i, 'Radijatori i grijalice'],
      [/\b(peć\b|kamin|fireplace)/i, 'Peći i kamini'],
      [/\b(ventilat|fan\b)/i, 'Ventilatori'],
    ],
    fallback: 'Klima uređaji',
  },
  'Vrt i balkon': {
    rules: [
      [/\b(vrtni\s+(namještaj|set|stol|stolic)|baštens)/i, 'Vrtni namještaj i suncobrani'],
      [/\b(suncobran|parasol|tenda)/i, 'Vrtni namještaj i suncobrani'],
      [/\b(sjeme|sadnic|plant|biljk)/i, 'Sjeme i sadnice'],
      [/\b(gnojiv|kompost|zemlja|supstrat)/i, 'Gnojiva i zaštitna sredstva'],
      [/\b(ograda|žica|panel|fenc)/i, 'Ograde i zaštite'],
      [/\b(navodnjav|crijevo|sprinkler)/i, 'Navodnjavanje i sustavi za vodu'],
    ],
    fallback: 'Vrtni namještaj i suncobrani',
  },
  'Rasvjeta': {
    rules: [
      [/\b(luster|chandelier)/i, 'Lusteri i stropne lampe'],
      [/\b(led\s*trak|strip|ambient)/i, 'LED trake i ambijentalna rasvjeta'],
      [/\b(stoln[aie]\s+lamp|desk\s*lamp)/i, 'Stolne i podne lampe'],
    ],
    fallback: 'Lusteri i stropne lampe',
  },

  // ── SPORT (ostale sub-kategorije) ──
  'Biciklizam (oprema)': {
    rules: [
      [/\b(kacig|helmet)/i, 'Kacige'],
      [/\b(odjeć|dres|jersey)/i, 'Biciklistička odjeća'],
      [/\b(košara|tašn|basket|pannier)/i, 'Košare i tašne'],
      [/\b(naoča|goggle|sunglass)/i, 'Naočale'],
      [/\b(računal|gps|garmin|wahoo|computer)/i, 'Računala i GPS'],
    ],
    fallback: 'Biciklistička odjeća',
  },
  'Nogomet': {
    rules: [
      [/\b(kopa[čć]k|boot|cleat)/i, 'Kopačke'],
      [/\b(lopta|ball)/i, 'Lopte'],
      [/\b(dres|jersey|oprema)/i, 'Dresovi i oprema'],
      [/\b(gol|mrež|goal|net)/i, 'Golovi i mreže'],
    ],
    fallback: 'Dresovi i oprema',
  },
  'Tenis i badminton': {
    rules: [
      [/\b(reket|racket|racquet)/i, 'Reketi'],
      [/\b(lopta|loptic|ball\b)/i, 'Lopte i perje'],
      [/\b(torba|bag)/i, 'Torbe'],
      [/\b(obuc|cipel|shoe)/i, 'Tenis obuća'],
    ],
    fallback: 'Reketi',
  },
  'Vodeni sportovi': {
    rules: [
      [/\b(kajak|kanu|canoe|kayak)/i, 'Kajaci i kanui'],
      [/\b(neopren|wetsuit)/i, 'Neopreni'],
      [/\b(sup\b|stand[\s-]?up[\s-]?paddle)/i, 'SUP daske'],
      [/\b(ronila[čć]|diving|scuba)/i, 'Ronilačka oprema'],
      [/\b(surf|kite)/i, 'Surfanje i kite surfing'],
    ],
    fallback: 'Kajaci i kanui',
  },
  'Ribolov': {
    rules: [
      [/\b(štap|rod\b)/i, 'Štapovi'],
      [/\b(mašinic|kolut|reel)/i, 'Mašinice i koluti'],
      [/\b(varalic|mamac|bait|lure)/i, 'Varalice i mamci'],
      [/\b(čamac|boat)/i, 'Čamci za ribolov'],
      [/\b(ehosond|sonar|fish[\s-]?find)/i, 'Ehosonde'],
    ],
    fallback: 'Štapovi',
  },
  'Borilački sportovi': {
    rules: [
      [/\b(rukavic|glove|boxing)/i, 'Vreće i rukavice'],
      [/\b(kimono|gi\b|judogi|karate)/i, 'Kimona i odjeća'],
      [/\b(ring|tatami|mat)/i, 'Ringovi i tatami'],
    ],
    fallback: 'Vreće i rukavice',
  },

  // ── DJECA I BEBE ──
  'Oprema za bebe': {
    rules: [
      [/\b(kolica|stroller|buggy)/i, 'Kolica i nosiljke'],
      [/\b(autosjedal|car\s*seat|isofix)/i, 'Autosjedalice'],
      [/\b(krevetić|kolevk|cot|bassinet)/i, 'Krevetići i ogradice'],
    ],
    fallback: 'Kolica i nosiljke',
  },
  'Dječje igračke': {
    rules: [
      [/\b(lego|kock|block)/i, 'LEGO i kocke'],
      [/\b(plišan|stuffed|teddy)/i, 'Plišane igračke'],
      [/\b(puzzl|slagalic)/i, 'Puzzle i slagalice'],
      [/\b(lutk|doll|barbi)/i, 'Lutke i figurice'],
    ],
    fallback: 'LEGO i kocke',
  },

  // ── ŽIVOTINJE ──
  'Psi': {
    rules: [
      [/\b(šten|puppy|štenc)/i, 'Štenad za prodaju/udomljavanje'],
    ],
    fallback: 'Štenad za prodaju/udomljavanje',
  },
  'Mačke': {
    rules: [
      [/\b(ma[čć]ić|kitten)/i, 'Mačići za prodaju/udomljavanje'],
    ],
    fallback: 'Mačići za prodaju/udomljavanje',
  },
  'Oprema za životinje': {
    rules: [
      [/\b(hran[ae]|food|granul)/i, 'Hrana za kućne ljubimce'],
      [/\b(kavez|krletk|cage)/i, 'Kavezi i transportne torbe'],
      [/\b(ogrlica|povodac|collar|leash)/i, 'Ogrlice, povodci i am'],
      [/\b(krevet|ležaj|bed\b)/i, 'Kreveti i ležajevi'],
    ],
    fallback: 'Hrana za kućne ljubimce',
  },

  // ── HRANA I PIĆE ──
  'Pića': {
    rules: [
      [/\b(rakij|šljivovic|lozova[čć]|travaric)/i, 'Rakije i žestoka pića'],
      [/\b(vino|wine)/i, 'Vina'],
      [/\b(pivo|beer|craft)/i, 'Piva (craft i ostala)'],
      [/\b(sok|juice|sirup)/i, 'Domaći sokovi i sirupi'],
      [/\b(med\b|honey)/i, 'Domaći sokovi i sirupi'],
    ],
    fallback: 'Rakije i žestoka pića',
  },
  'Biljni proizvodi': {
    rules: [
      [/\b(med\b|honey)/i, 'Med i pčelinji proizvodi'],
      [/\b(ulje|oil|maslin)/i, 'Ulja (maslinovo, bučino...)'],
    ],
    fallback: 'Med i pčelinji proizvodi',
  },

  // ── TEHNIKA I ELEKTRONIKA ──
  'Audio oprema': {
    rules: [
      [/\b(sluša|headphone|earbud|airpod)/i, 'Slušalice'],
      [/\b(zvu[čć]nik|speaker|bluetooth\s*speak|soundbar)/i, 'Zvučnici i soundbar'],
      [/\b(poja[čć]a|amplifier|receiver)/i, 'Pojačala i receiveri'],
      [/\b(gramofon|turntable|vinyl)/i, 'Gramofoni i vinili'],
    ],
    fallback: 'Slušalice',
  },
  'Foto i video oprema': {
    rules: [
      [/\b(dslr|mirrorless|fotoaparat|camera)/i, 'DSLR i mirrorless fotoaparati'],
      [/\b(gopro|action\s*cam)/i, 'Action kamere (GoPro...)'],
      [/\b(objektiv|lens)/i, 'Objektivi'],
      [/\b(stativ|tripod)/i, 'Stativi i nosači'],
      [/\b(dron|drone|dji|mavic)/i, 'Dronovi'],
    ],
    fallback: 'DSLR i mirrorless fotoaparati',
  },
  'Mali kućanski aparati': {
    rules: [
      [/\b(usisava[čć]|vacuum)/i, 'Usisavači'],
      [/\b(glačal|iron|pegl)/i, 'Glačala i sustavi za glačanje'],
      [/\b(mikser|blender|mix)/i, 'Blenderi i mikseri'],
      [/\b(aparat\s+za\s+kav|espresso|coffee\s*mak|kaf[ae]mat)/i, 'Aparati za kavu'],
      [/\b(toster|sandwich|grill|roštilj)/i, 'Tosteri i električni roštilji'],
    ],
    fallback: 'Usisavači',
  },

  // ── RAČUNALA I IT ──
  'Monitori': {
    rules: [
      [/\b(gaming|144\s*hz|240\s*hz|165\s*hz)/i, 'Gaming monitori'],
      [/\b(ultrawide|21:9|32:9)/i, 'Ultrawide (21:9 ili 32:9)'],
      [/\b(curved|zakrivljen)/i, 'Zakrivljeni (Curved)'],
      [/\b(oled)/i, 'OLED'],
    ],
    fallback: 'Uredski (Office/Home)',
  },
  'Komponente': {
    rules: [
      [/\b(grafi[čć]k|gpu|rtx|gtx|radeon|rx\s*\d)/i, 'Grafičke kartice (GPU)'],
      [/\b(procesor|cpu|ryzen|intel\s*i[3579]|threadripp)/i, 'Procesori (CPU)'],
      [/\b(ram\b|memorij|ddr[345])/i, 'RAM memorija'],
      [/\b(ssd|nvme|m\.2|hard\s*dis[ck]|hdd)/i, 'SSD i hard diskovi'],
      [/\b(mati[čć]n|motherboard|mainboard)/i, 'Matične ploče'],
      [/\b(napajanv|psu|power\s*supply)/i, 'Napajanja (PSU)'],
      [/\b(ku[ćč]ište|case|tower)/i, 'Kućišta'],
    ],
    fallback: 'Grafičke kartice (GPU)',
  },
  'Mrežna oprema': {
    rules: [
      [/\b(router|ruter)/i, 'Ruteri'],
      [/\b(switch|svič)/i, 'Switchevi'],
      [/\b(access\s*point|wifi\s*(adapt|exten))/i, 'WiFi adapteri i extenderi'],
    ],
    fallback: 'Ruteri',
  },
  'Dronovi i oprema': {
    rules: [
      [/\b(dji|mavic|phantom|mini\s*\d)/i, 'DJI (Mavic, Mini, Air...)'],
      [/\b(fpv|racing\s*drone)/i, 'FPV dronovi'],
    ],
    fallback: 'DJI (Mavic, Mini, Air...)',
  },

  // ── USLUGE ──
  'Građevinske usluge': {
    rules: [
      [/\b(malter|fasad|gletov|lic[ei]lačk)/i, 'Fasade i malterisanje'],
      [/\b(vodoinstal|water|pipe|plumb)/i, 'Vodoinstalaterske usluge'],
      [/\b(elektri[čć]ar|elektro\s*instal)/i, 'Elektroinstalacije'],
      [/\b(krov|roof)/i, 'Krovopokrivačke usluge'],
    ],
    fallback: 'Fasade i malterisanje',
  },

  // ── LITERATURA I MEDIJI ──
  'Knjige – Beletristika': {
    rules: [
      [/\b(roman|novel)/i, 'Romani'],
      [/\b(krimi|thriller|detektiv)/i, 'Krimići i trileri'],
      [/\b(fantaz|fantasy|sci[\s\-]?fi)/i, 'Fantastika i SF'],
      [/\b(poezi|poem|stih)/i, 'Poezija'],
    ],
    fallback: 'Romani',
  },
  'Knjige – Stručna literatura': {
    rules: [
      [/\b(udžben|textbook|školsk)/i, 'Udžbenici'],
      [/\b(medicin|farmac|zdrav)/i, 'Medicina i zdravlje'],
      [/\b(pravo|zakon|juris)/i, 'Pravo i zakonodavstvo'],
      [/\b(ekonomij|financij|business)/i, 'Ekonomija i financije'],
    ],
    fallback: 'Udžbenici',
  },

  // ── UMJETNOST I KOLEKCIONARSTVO ──
  'Slike i skulpture': {
    rules: [
      [/\b(uljana|oil\s*paint)/i, 'Uljane slike'],
      [/\b(akvarel|watercolor)/i, 'Akvareli'],
      [/\b(skulptur|statue)/i, 'Skulpture'],
    ],
    fallback: 'Uljane slike',
  },
  'Numizmatika': {
    rules: [
      [/\b(novi[čć]ić|coin|kovanica)/i, 'Kovanice'],
      [/\b(nov[čć]anic|banknot)/i, 'Novčanice'],
    ],
    fallback: 'Kovanice',
  },

  // ── ODJEĆA (ostale) ──
  'Nakit i satovi': {
    rules: [
      [/\b(sat\b|watch|rolex|casio|seiko)/i, 'Ručni satovi'],
      [/\b(ogrlica|necklace|lančić)/i, 'Ogrlice i lančići'],
      [/\b(prsten|ring)/i, 'Prstenje'],
      [/\b(naušnic|earring)/i, 'Naušnice'],
    ],
    fallback: 'Ručni satovi',
  },
  'Torbe, novčanici i ruksaci': {
    rules: [
      [/\b(ruksak|backpack)/i, 'Ruksaci'],
      [/\b(nov[čć]anik|wallet)/i, 'Novčanici'],
      [/\b(torba|bag|hand\s*bag)/i, 'Ženske torbe'],
    ],
    fallback: 'Ženske torbe',
  },

  // ── OSTALO ──
  'Kozmetika i ljepota': {
    rules: [
      [/\b(parfem|perfume|eau\s*de)/i, 'Parfemi'],
      [/\b(šmink|makeup|make[\s-]?up)/i, 'Šminka i kozmetika'],
    ],
    fallback: 'Parfemi',
  },
  'Karte i ulaznice': {
    rules: [
      [/\b(koncert|festival|event)/i, 'Koncerti i festivali'],
      [/\b(utakmic|match|sport)/i, 'Sportski događaji'],
    ],
    fallback: 'Koncerti i festivali',
  },
};

/** Resolve a default item when keyword scoring doesn't distinguish.
 *  ALWAYS validates returned item name against actual subItems list.
 *  This prevents ITEM_DEFAULTS from returning names that don't exist in CATEGORIES. */
function resolveDefaultItem(
  subName: string,
  searchText: string,
  subItems: string[],
): string | null {
  const config = ITEM_DEFAULTS[subName];
  if (config) {
    for (const [pattern, itemName] of config.rules) {
      if (pattern.test(searchText)) {
        // Validate: item must exist in actual items list
        if (subItems.includes(itemName)) return itemName;
        // Try fuzzy match against actual items
        const iLower = itemName.toLowerCase();
        const fuzzy = subItems.find(si => {
          const sLower = si.toLowerCase();
          return sLower.includes(iLower) || iLower.includes(sLower) || fuzzyContains(sLower, iLower);
        });
        if (fuzzy) return fuzzy;
        // Item from ITEM_DEFAULTS doesn't match actual tree — skip this rule
      }
    }
    if (config.fallback) {
      if (subItems.includes(config.fallback)) return config.fallback;
      const fLower = config.fallback.toLowerCase();
      const fuzzy = subItems.find(si => {
        const sLower = si.toLowerCase();
        return sLower.includes(fLower) || fLower.includes(sLower) || fuzzyContains(sLower, fLower);
      });
      if (fuzzy) return fuzzy;
    }
  }

  // Generic fallback: look for "Ostali/Ostalo/Ostala" or "Ostale" item, else first item
  const ostali = subItems.find(item => /^Ostal[oiae]/i.test(item));
  return ostali || subItems[0] || null;
}

/** Stem-aware check: does text contain a word with the same root?
 *  For Slavic languages, word endings change a lot (sprava/sprave/spravu/spravom).
 *  We use a simple prefix approach: if both share a prefix of at least 4 chars, it's a match. */
function fuzzyContains(text: string, word: string): boolean {
  if (text.includes(word)) return true;
  if (word.length < 4) return false;
  // Try shrinking the word by 1-2 chars and check if text contains the stem
  const stem4 = word.slice(0, Math.max(4, word.length - 2));
  return text.includes(stem4);
}

/** Score an item against title, breadcrumbs and search text (distinctive words only) */
function scoreItem(
  itemLower: string,
  subNameLower: string,
  titleLower: string,
  bcParts: string[],
  searchText: string,
): number {
  // Only count words DISTINCTIVE to this item (not already in subcategory name)
  const itemWords = itemLower
    .split(/[\s\/\(\),\u2013]+/)
    .filter(w => w.length > 2 && !subNameLower.includes(w));
  let bonus = 0;

  // Word matching against title (strongest signal) — stem-aware
  for (const iw of itemWords) {
    if (fuzzyContains(titleLower, iw)) bonus += 5;
  }

  // Word matching against breadcrumbs (distinctive words only) — stem-aware
  for (const part of bcParts) {
    const partWords = part.split(/[\s\/]+/).filter(w => w.length > 2);
    for (const pw of partWords) {
      if (fuzzyContains(itemLower, pw) && !subNameLower.includes(pw)) bonus += 3;
    }
  }

  // Phrase matching (2-3 word sequences) — catches "Galaxy A" vs "Galaxy S", etc.
  const itemClean = itemLower.replace(/[\(\)\/,\u2013]+/g, ' ').trim();
  const itemPhraseWords = itemClean.split(/\s+/);
  for (let len = Math.min(3, itemPhraseWords.length); len >= 2; len--) {
    for (let i = 0; i <= itemPhraseWords.length - len; i++) {
      const phrase = itemPhraseWords.slice(i, i + len).join(' ');
      if (phrase.length > 3 && titleLower.includes(phrase)) bonus += len * 4;
      else if (phrase.length > 3 && searchText.includes(phrase)) bonus += len * 2;
    }
  }

  return bonus;
}

/** Match breadcrumbs + title against the full CATEGORIES tree for deepest possible match.
 *  Uses COMBINED scoring: subcategory score + best item bonus determines winner.
 *  This ensures items break ties between subcategories with similar names
 *  (e.g. all "Za automobile – *" subcategories).
 *  Stage 2: If local scoring is uncertain, uses Gemini Flash to pick the right item. */
async function matchCategoryPath(
  breadcrumbs: string | null,
  title: string,
  aiCategory: string,
  aiSubcategory: string | null,
): Promise<{ subcategory: string | null; item: string | null }> {
  // Find main category in our tree
  const catLower = aiCategory.toLowerCase();
  const mainCat = CATEGORIES.find(c => {
    const cn = c.name.toLowerCase();
    return cn === catLower || catLower.includes(cn) || cn.includes(catLower);
  });

  if (!mainCat?.subCategories?.length) {
    return { subcategory: aiSubcategory, item: null };
  }

  const titleLower = title.toLowerCase();
  const searchText = [breadcrumbs, title, aiSubcategory].filter(Boolean).join(' ').toLowerCase();
  const bcParts = breadcrumbs
    ? breadcrumbs.split(/\s*>\s*/).map(p => p.trim().toLowerCase())
    : [];

  // ═══ Combined scoring: sub + best item in that sub ═══
  let bestSub: string | null = null;
  let bestItem: string | null = null;
  let bestCombinedScore = -1;
  let bestItemBonus = 0;

  for (const sub of mainCat.subCategories) {
    const subLower = sub.name.toLowerCase();
    let subScore = 0;

    // Match subcategory against breadcrumb parts (stem-aware)
    for (const part of bcParts) {
      if (subLower.includes(part)) { subScore += 10; continue; }
      if (fuzzyContains(subLower, part)) { subScore += 7; continue; }
      const subPrefix = subLower.split(' \u2013 ')[0]?.trim();
      if (subPrefix && part.includes(subPrefix)) { subScore += 7; continue; }
      const partWords = part.split(/[\s\/]+/).filter(w => w.length > 2);
      for (const pw of partWords) {
        if (fuzzyContains(subLower, pw)) subScore += 2;
      }
    }

    // Match against AI subcategory hint
    if (aiSubcategory) {
      const aiSubLower = aiSubcategory.toLowerCase();
      if (subLower === aiSubLower) subScore += 10;
      else if (subLower.includes(aiSubLower) || aiSubLower.includes(subLower)) subScore += 5;
      else {
        const aiWords = aiSubLower.split(/[\s\u2013\-]+/).filter(w => w.length > 2);
        for (const aw of aiWords) {
          // Use fuzzyContains for Slavic word endings (poljoprivreda → poljoprivredni)
          if (fuzzyContains(subLower, aw)) subScore += 3;
        }
      }
    }

    // Title keyword overlap with subcategory name — STRONGEST SIGNAL
    // If the title literally says "monitor", "laptop", "traktor", that's decisive
    const subWords = subLower.split(/[\s\u2013\-\/\(\)]+/).filter(w => w.length > 2);
    for (const sw of subWords) {
      if (titleLower.includes(sw)) subScore += 10;
      else if (fuzzyContains(titleLower, sw)) subScore += 8;
    }

    // Leaf subcategory (no items) — combined score is just subScore
    if (!sub.items?.length) {
      if (subScore > bestCombinedScore) {
        bestCombinedScore = subScore;
        bestSub = sub.name;
        bestItem = null;
        bestItemBonus = 0;
      }
      continue;
    }

    // Find best item within this subcategory
    let topItemInSub: string | null = null;
    let topItemBonus = 0;

    for (const item of sub.items) {
      const bonus = scoreItem(item.toLowerCase(), subLower, titleLower, bcParts, searchText);
      if (bonus > topItemBonus) {
        topItemBonus = bonus;
        topItemInSub = item;
      }
    }

    // Combined score: subcategory relevance + item match strength
    const combined = subScore + topItemBonus;
    if (combined > bestCombinedScore) {
      bestCombinedScore = combined;
      bestSub = sub.name;
      bestItem = topItemInSub;
      bestItemBonus = topItemBonus;
    }
  }

  // ═══ Low confidence: don't give up — try harder ═══
  if (bestCombinedScore < 2) {
    // If AI gave a subcategory hint, try to find closest match in tree
    if (aiSubcategory && !bestSub) {
      const aiSubLower = aiSubcategory.toLowerCase();
      const closestSub = mainCat.subCategories.find(s => {
        const sLower = s.name.toLowerCase();
        return sLower.includes(aiSubLower) || aiSubLower.includes(sLower) || fuzzyContains(sLower, aiSubLower);
      });
      if (closestSub) {
        bestSub = closestSub.name;
        bestItemBonus = 0;
      }
    }
    // Still nothing? Use first subcategory as absolute minimum
    if (!bestSub && mainCat.subCategories.length > 0) {
      bestSub = mainCat.subCategories[0].name;
      bestItemBonus = 0;
    }
  }

  // ═══ Smart defaults when item scoring doesn't find a clear winner ═══
  if (bestSub && bestItemBonus < 3) {
    const matchedSub = mainCat.subCategories.find(s => s.name === bestSub);
    if (matchedSub?.items?.length) {
      // Stage 2: Try Gemini Flash for uncertain cases
      try {
        const itemsList = matchedSub.items.map((it, i) => `${i + 1}. ${it}`).join('\n');
        const prompt = `Ti si sistem za kategorizaciju proizvoda.\n\nNaslov: ${sanitizeForPrompt(title, 300)}\nPodkategorija: ${matchedSub.name}\n\nMoguće stavke:\n${itemsList}\n\nKoji broj (1-${matchedSub.items.length}) najbolje odgovara? Odgovori SAMO JSON: {"item_index": BROJ}`;
        const raw = await textWithGemini(prompt);
        const parsed = parseJsonResponse(raw) as { item_index?: number } | null;
        if (parsed?.item_index && parsed.item_index >= 1 && parsed.item_index <= matchedSub.items.length) {
          bestItem = matchedSub.items[parsed.item_index - 1];
        } else {
          // Fallback: extract number from raw
          const numMatch = raw.match(/(\d+)/);
          if (numMatch) {
            const idx = parseInt(numMatch[1], 10);
            if (idx >= 1 && idx <= matchedSub.items.length) bestItem = matchedSub.items[idx - 1];
          }
        }
      } catch {
        // AI failed — use local fallback
      }

      // Final local fallback if AI also failed
      if (!bestItem) {
        bestItem = resolveDefaultItem(matchedSub.name, searchText, matchedSub.items);
      }
    }
  }

  // ═══ VALIDATE: ensure bestItem exists in actual CATEGORIES items list ═══
  if (bestSub && bestItem) {
    const validSub = mainCat.subCategories.find(s => s.name === bestSub);
    if (validSub?.items?.length && !validSub.items.includes(bestItem)) {
      // Item name doesn't match actual CATEGORIES tree — try fuzzy match
      const bLower = bestItem.toLowerCase();
      const fuzzy = validSub.items.find(it => {
        const iLower = it.toLowerCase();
        return iLower.includes(bLower) || bLower.includes(iLower) || fuzzyContains(iLower, bLower);
      });
      bestItem = fuzzy || resolveDefaultItem(validSub.name, searchText, validSub.items) || validSub.items[0];
    }
  }

  // ═══ ENSURE: always fill item when subcategory has items ═══
  if (bestSub && !bestItem) {
    const fillSub = mainCat.subCategories.find(s => s.name === bestSub);
    if (fillSub?.items?.length) {
      bestItem = resolveDefaultItem(fillSub.name, searchText, fillSub.items) || fillSub.items[0];
    }
  }

  return { subcategory: bestSub, item: bestItem };
}

/** Detect category from keywords in text. Used for BOTH sanity check AND fallback.
 *  Returns null if no confident match. Order matters — specific before generic! */
function detectCategoryFromKeywords(text: string): string | null {
  if (!text) return null;
  const t = text.toLowerCase();

  // ── Dijelovi za vozila (car parts) — BEFORE Vozila! ──
  if (/\b(felg[ae]|gum[ae]\s+\d|branik|far\b|farovi|sjedal|mjenja[čć]|amortiz|disk\s+za\s+ko[čć]|ko[čć]nic|karoserij|haub[ae]|blatobran|retrovizor|auspuh|alternator|servo|turbin[ae]|radijator\s+za|filte?r\s+(za\s+)?(ulje|zrak)|svje[čć]ic|akumulator|remen|kvačil|dizna|ecu\b|abs\b|airbag|navigacij|auto\s*radio|ksenon|bi[\s-]?xenon|led\s+far)\b/i.test(t)
      || /\b(za\s+(vw|audi|bmw|mercedes|opel|ford|toyota|fiat|renault|peugeot|škod|seat|volvo|hyundai|kia|honda|mazda|nissan|citroen))\b/i.test(t)
      || /\b(dijelov[ie]|auto[\s-]?dijel|spare\s*part)/i.test(t)) {
    return 'Dijelovi za automobile';
  }

  // ── Strojevi i alati — BEFORE Vozila (traktori etc) ──
  if (/\b(traktor|kombajn|kosilica|motorna\s+pila|trimer|bušilica|brusilica|kompresor|cirkular|viljuškar|bager|dizalica)\b/i.test(t)
      || /\b(aku[\s-]?odvija[čć]|aku[\s-]?bušili|set\s+alat|garnitur[ae]?\s+alat|kofer\s+alat)\b/i.test(t)
      || /\b(hilti|makita|bosch\s+(pro|gsr|gbh)|dewalt|parkside|einhell|metabo|milwaukee|festool|knipex|wera|wiha|hazet|gedore|stahlwille|würth|unior|tona|bahco|stanley|irwin)\b/i.test(t)
      || /\b(alat[aei]?\b|alatk|elektri[čc]n[aei]?\s+alat|ru[čc]n[aei]?\s+alat|elektroinstalat)\b/i.test(t)) {
    return 'Strojevi i alati';
  }

  // ── Vozila (complete vehicles) ──
  if (/\b(automobil|vozil[oa]|auto\b|limuzin|suv\b|kombi|kabriolet|karavan)\b/i.test(t)
      || /\b(golf|passat|polo|a[3-8]\b|e[\s-]?class|c[\s-]?class|3[\s-]?er|5[\s-]?er|x[1-7]\b|q[3578]\b|octavia|fabia|focus|fiesta|corsa|astra|clio|megane|punto|panda|yaris|corolla|civic|i[23]0|tucson|sportage)\b/i.test(t)
      || /\b(bmw|mercedes|audi|volkswagen|vw\b|opel|ford|toyota|fiat|renault|peugeot|citroen|hyundai|kia|honda|mazda|nissan|volvo|škoda|seat|dacia|suzuki|mitsubishi|subaru|lexus|porsche|jaguar|land\s*rover|jeep|chrysler|dodge|chevrolet)\b/i.test(t)
      || /\b(motocik|skuter|vespa|harley|yamaha\s+r|kawasaki|ducati|ktm)\b/i.test(t)
      || /\b(bicikl|e[\s-]?bike|mountain\s*bike|trek\b|specialized|giant\b|scott\b|cube\b)\b/i.test(t)) {
    return 'Vozila';
  }

  // ── Nekretnine ──
  if (/\b(stan\b|ku[čć][ae]\b|apartman|nekretnin|zemljišt|garsonier|poslovni\s+prostor|gara[žz][ae])\b/i.test(t)) return 'Nekretnine';

  // ── Mobiteli ──
  if (/\b(iphone|samsung\s+galaxy|xiaomi|redmi|poco|huawei|honor|oneplus|pixel|mobitel|telefon|tablet|ipad)\b/i.test(t)) return 'Mobiteli i oprema';

  // ── Računala i IT ──
  if (/\b(laptop|notebook|desktop|monitor|grafičk[ae]|gpu\b|cpu\b|ram\b|ssd\b|matičn[ae]|printer|skener|server)\b/i.test(t)) return 'Računala i IT';

  // ── Tehnika ──
  if (/\b(televizor|tv\b.*(?:inch|col|samsung|lg|sony)|soundbar|sluša|zvučnik|fotoaparat|kamera|gopro|bijel[ae]\s+tehnik|perilica|hladnjak|fri[žz]ider|klima\s+ure[đd]|mikrovalna)\b/i.test(t)) return 'Tehnika i elektronika';

  // ── Dom i vrt ──
  if (/\b(namještaj|kau[čć]|sofa|krevet|madrac|ormar|sto[l]?\b|stolic|polica|tepih|zavjes|lusteri?|rasvjet|vrt\s|bazen|jacuzzi|saun[ae])\b/i.test(t)) return 'Dom i vrt';

  // ── Odjeća ──
  if (/\b(haljin|jakn[ae]|kaput|košulj|majic[ae]|hlač[ae]|farmerice|suknja|cipel[ae]|patik[ae]|tenisic|čizm[ae]|sandal|nike\b|adidas|zara\b|h&m|gucci|prada|louis\s+vuitton)\b/i.test(t)) return 'Odjeća i obuća';

  // ── Sport ──
  if (/\b(fitness|teretana|bučic|uteg|traka\s+za\s+tr[čc]anje|bicikl.*oprema|skij[ae]|snowboard|planinar|ribolov|lopta|reket|kajak)\b/i.test(t)) return 'Sport i rekreacija';

  // ── Videoigre ──
  if (/\b(playstation|ps[45]\b|xbox|nintendo|switch|gaming\s+(konzol|oprema|stolica)|pc\s+igr)\b/i.test(t)) return 'Videoigre';

  // ── Glazba ──
  if (/\b(gitar[ae]|bubnj|klavijatur|klavir|harmonik|sintesajzer|bubanj|udaraljk|saksofon|truba|violina|fender|gibson|yamaha\s+(p|c|psr))\b/i.test(t)) return 'Glazba i glazbeni instrumenti';

  // ── Odjeća za djecu ──
  if (/\b(dje[čć]j|beb[ae]|kolica\s+(za\s+)?beb|autosjedal|igra[čc]k|lego|plišan|pelene|krevetić|ogradica|dje[čc]j[aei]\s+(odje[ćc]|obuc|cipel|jakn))\b/i.test(t)) return 'Odjeća za djecu';

  // ── Literatura i mediji ──
  if (/\b(knjig[ae]|roman|udžben|strip|časo?pis|dvd|blu[\s-]?ray|vinyl|ploč[ae]|enciklopedij|lektir)\b/i.test(t)) return 'Literatura i mediji';

  // ── Životinje ──
  if (/\b(šten|ma[čc]ić|pas\b|psić|mačk[ae]|ptic[ae]|papagaj|akvari|rib[aei]c|terarij|kavez|hrana\s+za\s+(ps|ma[čc]k|živ)|udomljav|štenc)\b/i.test(t)) return 'Životinje';

  // ── Hrana i piće ──
  if (/\b(rakij[ae]|šljiv|lozova[čc]|vino\b|med\b|doma[ćč]i?\s+proizvod|čaj\b|kava\b|sok\b|meso\b|sir\b|maslin|ulje\b|pčel|pivo\b|džem|pekmez)\b/i.test(t)) return 'Hrana i piće';

  // ── Poslovi ──
  if (/\b(posao|zapošlj|oglas\s+za\s+posao|radnik|zaposlen|radno\s+mjesto|konkurs|natje[čc]aj)\b/i.test(t)) return 'Poslovi';

  // ── Usluge ──
  if (/\b(servis\b|popravak|uslug[ae]|prijevoz|transport|selidba|čišćenje|keramičar|vodoinstalater|elektri[čc]ar|edukacij|instrukcij)\b/i.test(t)) return 'Usluge';

  // ── Umjetnost i kolekcionarstvo ──
  if (/\b(antikvitet|numizmat|filatel|kolekcion|starin[ae]|skulptur|militarij|kovanica|nov[čc]anic|markic|antik)\b/i.test(t)) return 'Umjetnost i kolekcionarstvo';

  return null;
}

/** Try to extract the ad description text directly from common HTML patterns */
function extractDescriptionFromHtml(html: string): string | null {
  // Common patterns for ad description sections
  const patterns = [
    // OLX-style: <div class="css-1o924a9">description text</div>
    /<div[^>]+class="[^"]*(?:description|opis|oglas-tekst|detail-desc|content-text|ad-description)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    // <section> with description
    /<section[^>]+class="[^"]*(?:description|opis)[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
    // <p> inside description container
    /<div[^>]+(?:id|data-cy)="[^"]*(?:description|opis|ad-text)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const text = htmlToText(match[1]).trim();
      if (text.length > 30) return text;
    }
  }

  // OLX.ba: description is in __NUXT__ data as description:"text with \u003Cbr\u003E"
  const nuxtDesc = html.match(/description\s*:\s*"((?:[^"\\]|\\.){30,})"/);
  if (nuxtDesc) {
    const raw = nuxtDesc[1]
      .replace(/\\u003[Cc]br\\s*\\?\/?\\u003[Ee]/g, '\n')
      .replace(/\\u003[Cc][^>]*?\\u003[Ee]/g, ' ')
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .replace(/[^\S\n]+/g, ' ')
      .replace(/\n[^\S\n]*/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    if (raw.length > 30) return raw;
  }

  return null;
}

// ── Hetzner Puppeteer scraper config ─────────────────────
const SCRAPER_URL = process.env.SCRAPER_URL; // e.g. http://46.225.17.73:3000
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

/** Fetch via Hetzner Puppeteer scraper (renders JavaScript) */
async function fetchViaScraper(url: string): Promise<{ html: string; finalUrl: string }> {
  if (!SCRAPER_URL || !SCRAPER_API_KEY) throw new Error('Scraper not configured');

  const response = await fetch(`${SCRAPER_URL}/render`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': SCRAPER_API_KEY,
    },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(45000),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(err.error || `Scraper HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!data.success || !data.html) throw new Error(data.error || 'Empty response from scraper');
  return { html: data.html, finalUrl: data.finalUrl || url };
}

/** Direct fetch with retry (no JS rendering) */
async function fetchDirect(url: string): Promise<{ html: string; finalUrl: string }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < HEADER_SETS.length; attempt++) {
    try {
      const response = await fetch(url, {
        headers: HEADER_SETS[attempt],
        signal: AbortSignal.timeout(20000),
        redirect: 'follow',
      });

      if (response.ok) {
        const html = await response.text();
        return { html, finalUrl: response.url || url };
      }

      if (response.status === 403 || response.status === 429) {
        lastError = new Error(`HTTP ${response.status}`);
        continue;
      }

      throw new Error(`HTTP_${response.status}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isTimeout = msg.includes('timeout') || msg.includes('AbortError');
      const isRetryable = msg.includes('403') || msg.includes('429') || isTimeout;

      lastError = err instanceof Error ? err : new Error(msg);

      if (!isRetryable || attempt === HEADER_SETS.length - 1) {
        throw lastError;
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  throw lastError || new Error('Fetch failed');
}

// ── Smart fetch: Puppeteer first, then direct fallback ───
async function fetchWithRetry(url: string): Promise<{ html: string; finalUrl: string }> {
  // Try Hetzner Puppeteer scraper first (renders JS-heavy sites)
  if (SCRAPER_URL && SCRAPER_API_KEY) {
    try {
      return await fetchViaScraper(url);
    } catch (scraperErr) {
      console.warn('[import] Scraper failed, falling back to direct fetch:', scraperErr instanceof Error ? scraperErr.message : scraperErr);
    }
  }

  // Fallback: direct fetch (works for SSR sites)
  return fetchDirect(url);
}

// ── Vehicle data enrichment via lookupChassis ────────────
function enrichWithChassis(title: string, attributes: Record<string, string>): {
  vehicleData: Record<string, string> | null;
  enrichedAttributes: Record<string, string>;
} {
  const results = lookupChassis(title);
  if (results.length === 0) return { vehicleData: null, enrichedAttributes: attributes };

  const best = results[0];
  const vehicleData: Record<string, string> = {};
  const enriched = { ...attributes };

  if (best.brand) {
    vehicleData.brand = best.brand;
    if (!enriched.marka) enriched.marka = best.brand;
  }
  if (best.model) {
    vehicleData.model = best.model;
    if (!enriched.model) enriched.model = best.model;
  }
  if (best.variant) {
    vehicleData.variant = best.variant;
    if (!enriched.motor) enriched.motor = best.variant;
  }
  if (best.fuel) {
    vehicleData.fuel = best.fuel;
    if (!enriched.gorivo) {
      // Map fuel codes to form values
      const fuelMap: Record<string, string> = {
        'D (Diesel)': 'Dizel', 'D': 'Dizel', 'Diesel': 'Dizel',
        'B (Benzin)': 'Benzin', 'B': 'Benzin', 'Benzin': 'Benzin',
        'E (Električni)': 'Električni', 'E': 'Električni',
        'H (Hibrid)': 'Hibrid', 'H': 'Hibrid',
      };
      enriched.gorivo = fuelMap[best.fuel] || best.fuel;
    }
  }
  if (best.generation) {
    vehicleData.generation = best.generation;
  }
  if (best.years) {
    vehicleData.years = best.years;
  }

  return { vehicleData, enrichedAttributes: enriched };
}

// ── Post-process: fill missing fields from meta/text ─────
function postProcessData(
  data: Record<string, unknown>,
  meta: Record<string, string>,
  pageText: string,
  jsonLd: string,
  htmlLocation?: string | null,
): void {
  // ── PRICE TYPE (Na upit / Po dogovoru) ──
  if (!data.priceType) {
    const textLower = pageText.toLowerCase();
    if (/\b(na\s+upit|po\s+dogovoru|cijena\s+na\s+(upit|zahtjev)|auf\s+anfrage|price\s+on\s+request)\b/.test(textLower)) {
      data.priceType = 'negotiable';
    }
  }

  // ── PRICE ──
  // Skip price extraction if "Na upit" / "Po dogovoru" detected
  if (data.priceType === 'negotiable') {
    data.price = 0;
  } else if (data.price == null || data.price === 0) {
    // Try meta tags first
    const metaPrice = meta['product:price:amount'] || meta['price'];
    if (metaPrice) {
      // Handle European format: "8.500" = 8500, "8,50" = 8.50
      const cleaned = metaPrice.replace(/[^0-9.,]/g, '');
      let num: number;
      if (/^\d{1,3}\.\d{3}/.test(cleaned)) {
        // European thousands: "8.500" → 8500
        num = parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
      } else {
        num = parseFloat(cleaned.replace(',', '.'));
      }
      if (!isNaN(num) && num > 0) data.price = num;
    }

    // Try JSON-LD
    if (data.price == null && jsonLd) {
      const priceMatch = jsonLd.match(/"price"\s*:\s*"?([0-9.,]+)"?/i);
      if (priceMatch) {
        const cleaned = priceMatch[1].replace(/[^0-9.,]/g, '');
        const num = parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
        if (!isNaN(num) && num > 0) data.price = num;
      }
    }

    // Try page text with regex patterns
    if (data.price == null) {
      const pricePatterns = [
        // "Cijena: 8.500 KM" / "Cena: 15000 EUR"
        /(?:cijena|cena|price|preis)[:\s]+([0-9]{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?)\s*(KM|€|EUR|BAM|HRK|USD)?/i,
        // "8.500 KM" / "15.000 €" / "5000 EUR"
        /\b([0-9]{1,3}(?:\.\d{3})+)\s*(KM|€|EUR|BAM|HRK)\b/,
        // "5000 KM" (no thousands separator)
        /\b([0-9]{3,7})\s*(KM|€|EUR|BAM|HRK)\b/,
        // "€ 5.000" / "€5000"
        /(€)\s*([0-9]{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?)/,
      ];

      for (const pattern of pricePatterns) {
        const match = pageText.match(pattern);
        if (match) {
          let numStr: string, curr: string;
          if (match[1] === '€') {
            numStr = match[2]; curr = 'EUR';
          } else {
            numStr = match[1]; curr = match[2] || '';
          }
          // Parse European number format
          let num: number;
          if (/^\d{1,3}\.\d{3}/.test(numStr)) {
            num = parseFloat(numStr.replace(/\./g, '').replace(',', '.'));
          } else {
            num = parseFloat(numStr.replace(',', '.'));
          }
          if (!isNaN(num) && num > 0) {
            data.price = num;
            if (!data.currency && curr) {
              data.currency = curr === '€' ? 'EUR' : curr === 'BAM' ? 'KM' : curr.toUpperCase();
            }
            break;
          }
        }
      }
    }
  }

  // ── CURRENCY (if price found but no currency) ──
  if (data.price != null && !data.currency) {
    const metaCurrency = meta['product:price:currency'];
    if (metaCurrency) {
      data.currency = metaCurrency.toUpperCase() === 'BAM' ? 'KM' : metaCurrency.toUpperCase();
    } else if (jsonLd) {
      const currMatch = jsonLd.match(/"priceCurrency"\s*:\s*"([A-Z]{3})"/i);
      if (currMatch) data.currency = currMatch[1].toUpperCase() === 'BAM' ? 'KM' : currMatch[1].toUpperCase();
    }
  }

  // ── YEAR / GODIŠTE ──
  const attrs = (data.attributes as Record<string, unknown>) || {};
  if (!attrs.godiste) {
    // Try JSON-LD
    if (jsonLd) {
      const yearMatch = jsonLd.match(/"(?:model_year|productionDate|year|dateVehicleFirstRegistered)"\s*:\s*"?(\d{4})"?/i);
      if (yearMatch) {
        const y = parseInt(yearMatch[1]);
        if (y >= 1950 && y <= 2030) attrs.godiste = y;
      }
    }
    // Try page text: "Godište: 2008" / "Godina: 2015" / "Baujahr: 2008" / "Year: 2020"
    if (!attrs.godiste) {
      const yearPatterns = [
        /(?:godišt|godin|baujahr|year|modelljahr|erstzulassung)[ea]?\s*[:.]?\s*(\d{4})/i,
        /\b(19[5-9]\d|20[0-2]\d)\s*\.?\s*(?:god|g\.)/i, // "2008 god." or "2008 g."
      ];
      for (const pattern of yearPatterns) {
        const match = pageText.match(pattern);
        if (match) {
          const y = parseInt(match[1]);
          if (y >= 1950 && y <= 2030) { attrs.godiste = y; break; }
        }
      }
    }
  }

  // ── MILEAGE / KM ──
  if (!attrs.km) {
    const kmPatterns = [
      /(?:kilometr|km\.?\s*stand|mileage|pređen|prijeđen)\w*\s*[:.]?\s*([0-9]{1,3}(?:[.,]\d{3})*)\s*(?:km)?/i,
      /\b([0-9]{1,3}(?:\.\d{3})+)\s*km\b/i, // "250.000 km"
      /\b([0-9]{4,7})\s*km\b/i, // "250000 km"
    ];
    for (const pattern of kmPatterns) {
      const match = pageText.match(pattern);
      if (match) {
        const num = parseInt(match[1].replace(/[.,]/g, ''));
        if (num > 100 && num < 2000000) { attrs.km = num; break; }
      }
    }
  }

  // ── CONDITION ──
  if (!data.condition) {
    const text = pageText.toLowerCase();
    if (/\b(novo|nekorišten|new|fabričk|fabrick)\b/i.test(text) && !/\b(kao novo|like new)\b/i.test(text)) {
      data.condition = 'Novo';
    } else if (/\b(kao novo|like new|sehr gut|neuwertig)\b/i.test(text)) {
      data.condition = 'Kao novo';
    } else if (/\b(korišten|polovn|rablj|used|gebraucht)\b/i.test(text)) {
      data.condition = 'Korišteno';
    } else if (/\b(dijelov|neispravn|defekt|parts)\b/i.test(text)) {
      data.condition = 'Za dijelove';
    }
  }

  // ── LOCATION — HTML structured data is ALWAYS most reliable ──
  if (htmlLocation) {
    // Structured data from the page (JSON-LD, meta tags) — trust this 100%
    data.location = htmlLocation;
  } else if (data.location) {
    // AI returned something — clean it up
    let loc = (data.location as string).trim();
    if (loc.includes(',')) loc = loc.split(',')[0].trim();
    data.location = loc || null;
  } else {
    // Last resort: regex on page text
    const locMatch = pageText.match(/(?:lokacija|grad|mjesto|location|ort)\s*[:.]?\s*([A-ZĆČŽŠĐa-zćčžšđ\s]{3,25})/i);
    if (locMatch) data.location = locMatch[1].trim();
  }

  data.attributes = attrs;
}

// ── Build the enhanced Gemini prompt ─────────────────────
function buildPrompt(
  finalUrl: string,
  meta: Record<string, string>,
  jsonLd: string,
  images: string[],
  pageText: string,
  htmlDescription: string | null,
  breadcrumbs: string | null,
): string {
  return `Izvuci podatke oglasa sa sljedeće stranice. Koristi SVE dostupne izvore podataka.

URL: ${finalUrl}

OG META TAGOVI (pouzdani):
${Object.entries(meta).map(([k, v]) => `${k}: ${sanitizeForPrompt(v, 500)}`).join('\n') || '(nema)'}

JSON-LD STRUKTURIRANI PODACI (veoma pouzdan):
${jsonLd || '(nema)'}

${breadcrumbs ? `BREADCRUMB NAVIGACIJA (VEOMA POUZDANO za kategoriju):\n${breadcrumbs}` : ''}

SLIKE IZVUČENE IZ HTML-A:
${images.length > 0 ? images.join('\n') : '(nema)'}

${htmlDescription ? `OPIS OGLASA IZVUČEN IZ HTML-A:\n"""\n${sanitizeForPrompt(htmlDescription, 5000)}\n"""` : ''}

TEKST STRANICE:
"""
${sanitizeForPrompt(pageText, 8000)}
"""

ZADATAK: Izvuci podatke za second-hand oglas. Prioritet izvora: JSON-LD > OG meta > breadcrumb > tekst stranice.
Odgovori ISKLJUČIVO na bosanskom/hrvatskom jeziku.

KRITIČNO — OPIS OGLASA:
Za polje "description" — pronađi ORIGINALNI opis/tekst oglasa i KOPIRAJ ga TAČNO kako je napisan na stranici.
NE skraćuj, NE parafraziraj, NE sumariziraj, NE prevodi. Kopiraj KOMPLETAN originalni tekst opisa, riječ za riječ.
SAČUVAJ ORIGINALNE REDOVE I NOVI RED (\\n) — ne spajaj sve u jedan red!
Ako je opis duži od 5000 znakova, kopiraj prvih 5000 znakova.
${htmlDescription ? 'Opis oglasa je već izvučen gore — koristi taj tekst TAČNO kako je.' : ''}

KRITIČNO — KATEGORIJA:
Odaberi TAČNO jednu od ovih 20 kategorija. Koristi TAČNO ovaj naziv — NE MIJENJAJ ime kategorije:

 1. Vozila — automobili, motocikli, bicikli, kamperi, plovila, ATV, prikolice
 2. Dijelovi za automobile — auto dijelovi, felge, gume, motor, karoserija, branici, farovi, sjedala, ovjes, kočnice
 3. Nekretnine — stanovi, kuće, zemljišta, poslovni prostori, garaže
 4. Mobiteli i oprema — telefoni, tableti, slušalice, punjači, maske, pametni satovi
 5. Računala i IT — laptopi, desktop, monitori, komponente, printeri, dronovi, gaming konzole
 6. Tehnika i elektronika — televizori, audio, foto/video, bijela tehnika, mali aparati, smart home
 7. Dom i vrtne garniture — namještaj, rasvjeta, tepisi, dekoracije, vrt, bazeni, alati za dom
 8. Odjeća i obuća — ženska/muška odjeća i obuća, nakit, satovi, torbe, naočale
 9. Sport i rekreacija — fitness, biciklizam, skijanje, planinarenje, ribolov, nogomet
10. Odjeća za djecu — oprema za bebe, igračke, dječji bicikli, dječja odjeća
11. Glazba i glazbeni instrumenti — gitare, bubnjevi, klavijature, PA oprema, studio
12. Literatura i mediji — knjige, stripovi, časopisi, filmovi DVD/Blu-ray, vinyl
13. Videoigre — PlayStation, Xbox, Nintendo, PC igre, gaming oprema
14. Životinje — psi, mačke, ptice, ribe, oprema za životinje, udomljavanje
15. Hrana i piće — domaći proizvodi, med, rakija, čajevi, meso, mliječni
16. Strojevi i alati — ručni/električni alati, građevinski strojevi, TRAKTORI i poljoprivredni strojevi, vrtni alati, motorne pile
17. Poslovi — oglasi za posao (IT, građevina, turizam, zdravstvo, financije...)
18. Usluge — servis vozila, građevinske usluge, IT usluge, transport, čišćenje, edukacija
19. Umjetnost i kolekcionarstvo — slike, antikviteti, numizmatika, filatelija, militarija
20. Ostalo — karte/ulaznice, kozmetika, vjenčanja, medicinska pomagala

VAŽNO — "Dijelovi za automobile" i "Vozila" su RAZLIČITE kategorije!
- Ako je oglas za KOMPLETNO VOZILO (auto, motor, bicikl...) → "Vozila"
- Ako je oglas za DIO/KOMPONENTU vozila (branik, far, hauba, felge, gume, sjedalo, motor...) → "Dijelovi za automobile"
- Ako breadcrumb sadrži "Dijelovi" ili "Parts" → "Dijelovi za automobile"

VAŽNO — TRAKTORI, motorne pile, kosilice NISU "Vozila"!
- Traktori, kombajni, poljoprivredni strojevi → "Strojevi i alati"
- Motorne kosilice, trimeri, vrtni alati → "Strojevi i alati"
- Građevinski strojevi (bageri, dizalice) → "Strojevi i alati"
- Samo osobna/teretna vozila za cestovni promet → "Vozila"

KRITIČNO — POTKATEGORIJA (subcategory):
Ako stranica ima breadcrumb navigaciju, koristi DRUGU razinu breadcrumb-a kao potkategoriju.
Primjeri:
- Breadcrumb "Dijelovi za vozila > Za automobile > Vrata" → category: "Dijelovi za automobile", subcategory: "Za automobile – Karoserija i stakla"
- Breadcrumb "Vozila > Osobni automobili" → category: "Vozila", subcategory: "Osobni automobili"
- Breadcrumb "Nekretnine > Stanovi" → category: "Nekretnine", subcategory: "Stanovi"

KRITIČNO — ATRIBUTI:
Koristi TAČNO ove ključeve za atribute, ovisno o detektovanoj kategoriji:

Za VOZILA (automobili, motocikli):
  marka (npr. "BMW"), model (npr. "Serija 3"), godiste (broj, npr. 2008), km (broj kilometara, npr. 250000),
  gorivo (TAČNO: "Dizel" | "Benzin" | "Benzin + LPG" | "Hibrid" | "Plug-in hibrid" | "Električni" | "CNG"),
  mjenjac (TAČNO: "Ručni" | "Automatik" | "Poluautomatik" | "DSG / DCT"),
  karoserija (TAČNO: "Sedan" | "Karavan" | "Hatchback" | "Coupe" | "Kabriolet" | "SUV" | "Crossover" | "Pickup" | "Van"),
  boja (npr. "Crna"), konjskeSile (broj, npr. 150), registracija (npr. "06/2026"),
  kubikaza (za motocikle, ccm), motor (npr. "2.0 TDI 110 kW"),
  pogon (TAČNO: "Prednji" | "Zadnji" | "4x4 (stalni)" | "4x4 (povremeni)")

Za DIJELOVE VOZILA:
  marka (marka vozila, npr. "Seat"), model (model vozila, npr. "Ibiza"),
  godiste (godina vozila, npr. 2011), karoserija (npr. "Sedan"), boja (npr. "Siva")

Za NEKRETNINE:
  kvadraturaM2 (broj), godinaIzgradnje (broj), grijanje (npr. "Centralno"),
  brojKupatila (npr. "2"), balkon (true/false), lift (true/false), parking (npr. "Garaža")

Za MOBILNE UREĐAJE:
  model (npr. "iPhone 15 Pro"), memorija (npr. "256GB"), ram (npr. "8GB"),
  boja (npr. "Space Black"), stanjeEkrana (npr. "Savršeno")

Za ELEKTRONIKU (laptopi, PC, TV):
  brand (npr. "Apple"), model (npr. "MacBook Pro 14"), procesor (npr. "Intel i7"),
  disk (broj GB, npr. 512), godinaProizvodnje (broj), garancija (npr. "12 mjeseci")

Za ODJEĆU / OBUĆU:
  brand (npr. "Nike"), velicina (npr. "M" ili "42"), boja (npr. "Crna"), materijal (npr. "Pamuk")

Za SPORT / REKREACIJU:
  brand (npr. "Technogym"), velicina (ako primjenjivo), godinaProizvodnje (ako poznato)

Za SVE OSTALE KATEGORIJE:
  brand (ako postoji), model (ako postoji), godiste ili godinaProizvodnje (ako poznato)

VAŽNO: Koristi SAMO ključeve navedene gore. Broj upiši kao broj (bez teksta). Boolean kao true/false.
Ako podatak ne postoji na stranici, NE izmišljaj — jednostavno ga izostavi iz attributes objekta.

CIJENA:
- Ako cijena postoji kao broj → price = broj, priceType = "fixed"
- Ako piše "Po dogovoru", "Na upit", "Cijena na upit", "Na zahtjev" → price = null, priceType = "negotiable"
- Ako nema cijene uopće → price = null, priceType = null

Vrati SAMO validan JSON:
{
  "title": "naslov oglasa (max 80 znakova)",
  "description": "ORIGINALNI opis oglasa — KOPIRAJ TAČNO, ne mijenjaj ništa",
  "price": broj_ili_null,
  "priceType": "fixed | negotiable | on_request | null",
  "currency": "KM | EUR | HRK | USD | null",
  "category": "TAČNO jedna od 20 kategorija gore (npr. Dijelovi za automobile, Vozila, Nekretnine...)",
  "subcategory": "potkategorija iz breadcrumb-a ili sadržaja (npr. Za automobile – Karoserija i stakla) ili null",
  "condition": "Novo | Kao novo | Korišteno | Za dijelove | null",
  "location": "KOPIRAJ TAČNO lokaciju/grad sa stranice oglasa (npr. iz polja 'Lokacija', 'Grad', breadcrumb-a). Ako stranica piše 'Sarajevo' → stavi 'Sarajevo'. Ako nema lokacije na stranici, stavi null",
  "images": ${JSON.stringify(images.slice(0, 10))},
  "seller": "ime prodavača ili null",
  "phone": "telefon ili null",
  "attributes": {
    "ključ": "vrijednost — koristi TAČNO ključeve navedene gore za odgovarajuću kategoriju"
  },
  "originalUrl": "${finalUrl}"
}

Polje "images" je već popunjeno gore izvučenim slikama — samo ih zadrži ili dopuni ako pronađeš bolje URL-ove.
Ako podatak nije pronađen, postavi null. NE izmišljaj podatke koji ne postoje na stranici.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'URL je obavezan' }, { status: 400 });
    }

    url = normalizeUrl(url);

    if (!isValidUrl(url)) {
      return NextResponse.json({ success: false, error: 'Nevažeći URL — mora počinjati sa http:// ili https://' }, { status: 400 });
    }

    // Fetch with retry
    let html: string;
    let finalUrl: string = url;
    try {
      const result = await fetchWithRetry(url);
      html = result.html;
      finalUrl = result.finalUrl;
    } catch (fetchErr) {
      const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      const isTimeout = msg.includes('timeout') || msg.includes('AbortError');
      const isBlocked = msg.includes('403');
      const isRateLimited = msg.includes('429');

      let errorMessage: string;
      let hint: string | undefined;

      if (isTimeout) {
        errorMessage = 'Stranica se nije učitala na vrijeme (timeout).';
        hint = 'Pokušaj ponovo za minutu — stranica je možda spora.';
      } else if (isBlocked) {
        errorMessage = 'Stranica blokira automatski pristup (403 Forbidden).';
        hint = 'Neki portali blokiraju servere. Probaj kopirati tekst oglasa ručno.';
      } else if (isRateLimited) {
        errorMessage = 'Previše zahtjeva — portal ograničava pristup (429).';
        hint = 'Sačekaj 1-2 minute pa pokušaj ponovo.';
      } else {
        errorMessage = 'Nije moguće dohvatiti stranicu.';
        hint = 'Provjeri da je link ispravan i da stranica postoji.';
      }

      return NextResponse.json({ success: false, error: errorMessage, hint }, { status: 400 });
    }

    // Content validation
    if (html.length < 500) {
      return NextResponse.json(
        { success: false, error: 'Stranica je prazna ili nema dovoljno sadržaja za analizu.', hint: 'Provjeri da link vodi na konkretni oglas, a ne na naslovnu stranicu.' },
        { status: 400 }
      );
    }

    // Bot/captcha detection
    const lowerHtml = html.toLowerCase();
    if (
      (lowerHtml.includes('captcha') || lowerHtml.includes('cloudflare') || lowerHtml.includes('just a moment') || lowerHtml.includes('shieldsquare')) &&
      !lowerHtml.includes('product') && !lowerHtml.includes('oglas') && !lowerHtml.includes('cijena')
    ) {
      return NextResponse.json(
        { success: false, error: 'Stranica prikazuje CAPTCHA ili zaštitu od botova.', hint: 'Pokušaj ponovo za minutu. Ako se ponavlja, kopiraj tekst oglasa ručno.' },
        { status: 400 }
      );
    }

    // Pre-extract structured data BEFORE stripping HTML
    const images = extractImages(html);
    const meta = extractMeta(html);
    const jsonLd = extractJsonLd(html);
    const htmlDescription = extractDescriptionFromHtml(html);
    const breadcrumbs = extractBreadcrumbs(html);

    // Extract location directly from HTML (structured data — always reliable)
    const htmlLocation = extractLocationFromHtml(html);

    // ── DEBUG: log what we extracted ──
    console.log('[import] DEBUG breadcrumbs:', breadcrumbs);
    console.log('[import] DEBUG htmlLocation:', htmlLocation);
    console.log('[import] DEBUG html length:', html.length);
    // Check if __NUXT__ or location data exists in HTML
    const hasNuxt = html.includes('__NUXT__');
    const hasLocationJson = html.includes('"location"');
    const hasCityName = html.includes('"cityName"');
    const locationSnippet = html.match(/"location"\s*:\s*\{[^}]{0,200}/i);
    console.log('[import] DEBUG hasNuxt:', hasNuxt, 'hasLocationJson:', hasLocationJson, 'hasCityName:', hasCityName);
    console.log('[import] DEBUG location snippet from HTML:', locationSnippet?.[0]?.slice(0, 200));

    const metaFallback = {
      title: meta['og:title'] || meta.title || null,
      description: (htmlDescription || meta['og:description'] || meta.description || '')
        .replace(/&lt;br\s*\/?&gt;/gi, '\n').replace(/&lt;\/?p&gt;/gi, '\n').replace(/\\u003[Cc]br\\u003[Ee]/g, '\n').trim() || null,
      price: null as number | null,
      images: images.slice(0, 10),
      location: htmlLocation,
      originalUrl: finalUrl,
    };

    // Detect "Na upit" / "Po dogovoru" from OLX display_price or page text
    const isNaUpit = /display_price:"Na upit"/i.test(html) || /Na upit|Po dogovoru|Auf Anfrage|Price on request/i.test(meta['og:title'] || '');
    if (isNaUpit) {
      metaFallback.price = 0;
      (metaFallback as Record<string, unknown>).priceType = 'negotiable';
    } else {
      const priceStr = meta['product:price:amount'] || meta['price'];
      if (priceStr) {
        const parsed = parseFloat(priceStr.replace(/[^0-9.,]/g, '').replace(',', '.'));
        if (!isNaN(parsed) && parsed > 0) metaFallback.price = parsed;
      }
    }

    // Clean text for Gemini
    const bodyMatch = html.match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i);
    const bodyHtml = bodyMatch ? bodyMatch[1] : html;
    const pageText = htmlToText(bodyHtml).slice(0, 10000);

    // Build enhanced prompt
    const prompt = buildPrompt(finalUrl, meta, jsonLd, images, pageText, htmlDescription, breadcrumbs);

    // Send to Gemini
    let data: Record<string, unknown>;
    try {
      const raw = await textWithGemini(prompt);
      data = parseJsonResponse(raw) as Record<string, unknown>;
    } catch (geminiErr) {
      console.warn('[/api/ai/import] Gemini failed, using meta-tag fallback:', geminiErr);
      if (metaFallback.title) {
        data = {
          title: metaFallback.title,
          description: metaFallback.description,
          price: metaFallback.price,
          currency: null,
          category: null,
          subcategory: null,
          condition: null,
          location: metaFallback.location,
          images: metaFallback.images,
          seller: null,
          phone: null,
          attributes: {},
          originalUrl: metaFallback.originalUrl,
          _fallback: true,
        };
      } else {
        return NextResponse.json(
          { success: false, error: 'AI nije mogao analizirati stranicu.', hint: 'Probaj ponovo ili kopiraj podatke ručno.' },
          { status: 500 }
        );
      }
    }

    // Ensure images are always included
    if (!data.images || !Array.isArray(data.images) || (data.images as string[]).length === 0) {
      data.images = images.slice(0, 10);
    }

    // ── DEBUG: AI result ──
    console.log('[import] DEBUG AI category:', data.category, '| AI location:', data.location, '| AI subcategory:', data.subcategory);

    // ── Post-process: fill missing price, year, km, condition from text ──
    postProcessData(data, meta, pageText, jsonLd, htmlLocation);

    console.log('[import] DEBUG after postProcess — location:', data.location, '| category:', data.category);

    // ── BREADCRUMB OVERRIDE: source page category is ALWAYS most reliable ──
    if (breadcrumbs) {
      const bc = breadcrumbs.toLowerCase();
      // Direct breadcrumb → category mapping (source page knows best)
      if (/\b(vozila|automobil[ie]?|osobn[aei]|auto\s*moto|rabljeni\s*automobil)/i.test(bc) && !/\bdijelovi/i.test(bc)) {
        data.category = 'Vozila';
        // Map njuskalo/olx subcategory from breadcrumbs
        if (/osobn[aei]\s*automobil|rabljeni\s*automobil|auti\b/i.test(bc)) data.subcategory = 'Osobni automobili';
        else if (/motocik|skuter/i.test(bc)) data.subcategory = 'Motocikli i skuteri';
        else if (/teretn/i.test(bc)) data.subcategory = 'Teretna vozila';
        else if (/bicikl/i.test(bc)) data.subcategory = 'Bicikli';
        else if (/kamper/i.test(bc)) data.subcategory = 'Kamper i kamp prikolice';
        else if (/nautik|plovil/i.test(bc)) data.subcategory = 'Nautika i plovila';
        else if (!data.subcategory) data.subcategory = null;
      } else if (/\bdijelovi/i.test(bc)) {
        data.category = 'Dijelovi za automobile';
      } else if (/\bnekretni/i.test(bc)) {
        data.category = 'Nekretnine';
      } else if (/\bmobitel|telefon/i.test(bc)) {
        data.category = 'Mobiteli i oprema';
      } else if (/\bra[čc]unal|informatik|it\b/i.test(bc)) {
        data.category = 'Računala i IT';
      } else if (/\belektronik|tehnik/i.test(bc)) {
        data.category = 'Tehnika i elektronika';
      } else if (/\bdom\b|vrt|namještaj/i.test(bc)) {
        data.category = 'Dom i vrtne garniture';
      } else if (/\bodje[ćc]a\b|obu[ćc]a|od glave do pete/i.test(bc)) {
        data.category = 'Odjeća i obuća';
      } else if (/\bdje[čc]ji svijet|bebe|igra[čc]k/i.test(bc)) {
        data.category = 'Odjeća za djecu';
      } else if (/\bsport/i.test(bc)) {
        data.category = 'Sport i rekreacija';
      } else if (/\bvozila\b.*\b(motor|skuter|bicikl)/i.test(bc)) {
        data.category = 'Vozila';
      } else if (/\bstrojev|alat/i.test(bc)) {
        data.category = 'Strojevi i alati';
      } else if (/\bposlov/i.test(bc)) {
        data.category = 'Poslovi';
      } else if (/\buslug/i.test(bc)) {
        data.category = 'Usluge';
      }
    }

    // ── SANITY CHECK: keyword detection as backup (only when NO breadcrumb match) ──
    if (data.category && data.title) {
      // Only use title for keyword detection (NOT description — features like "felge" in car descriptions cause false matches)
      const keywordCat = detectCategoryFromKeywords(
        [data.title, breadcrumbs].filter(Boolean).join(' ')
      );
      if (keywordCat) {
        const aiCat = (data.category as string).toLowerCase();
        const kwCat = keywordCat.toLowerCase();
        if (aiCat !== kwCat && !aiCat.includes(kwCat) && !kwCat.includes(aiCat)) {
          console.warn(`[import] AI category "${data.category}" overridden by keywords → "${keywordCat}" (title: ${data.title})`);
          data.category = keywordCat;
          data.subcategory = null;
        }
      }
    }

    // ── Fallback 1: keyword matching when AI returned NO category ──
    if (!data.category && (data.title || breadcrumbs)) {
      data.category = detectCategoryFromKeywords(
        [data.title, data.description, breadcrumbs].filter(Boolean).join(' ')
      );
    }

    // ── Fallback 2: if STILL no category, use AI with title ──
    if (!data.category && data.title) {
      try {
        const catPrompt = `Kategoriziraj ovaj proizvod u JEDNU od kategorija. Naslov: "${sanitizeForPrompt(data.title as string, 200)}"

Kategorije:
1. Vozila  2. Dijelovi za automobile  3. Nekretnine  4. Mobiteli i oprema
5. Računala i IT  6. Tehnika i elektronika  7. Dom i vrt  8. Odjeća i obuća
9. Sport i rekreacija  10. Odjeća za djecu  11. Glazba i glazbeni instrumenti
12. Literatura i mediji  13. Videoigre  14. Životinje  15. Hrana i piće
16. Strojevi i alati  17. Poslovi  18. Usluge  19. Umjetnost i kolekcionarstvo  20. Ostalo

VAŽNO: Traktori, kombajni, motorne pile → "Strojevi i alati", NE "Vozila"!

Odgovori SAMO JSON: {"category": "naziv", "subcategory": "potkategorija ili null"}`;
        const catRaw = await textWithGemini(catPrompt);
        const catParsed = parseJsonResponse(catRaw) as { category?: string; subcategory?: string } | null;
        if (catParsed?.category) {
          data.category = catParsed.category;
          if (catParsed.subcategory) data.subcategory = catParsed.subcategory;
        }
      } catch { /* category fallback failed — continue without */ }
    }

    // ── Fallback 3: ABSOLUTE last resort — always have a category ──
    if (!data.category && data.title) {
      data.category = 'Ostalo';
    }

    // ── Match against full category tree for deepest possible match ──
    if (data.category) {
      const catMatch = await matchCategoryPath(
        breadcrumbs,
        (data.title as string) || '',
        data.category as string,
        (data.subcategory as string) || null,
      );
      if (catMatch.subcategory) data.subcategory = catMatch.subcategory;
      if (catMatch.item) data.categoryItem = catMatch.item;
    }

    // ── Normalize category for upload page compatibility ──
    if (data.category) {
      const normalized = normalizeCategoryForApp(
        data.category as string,
        (data.subcategory as string) || null,
      );
      data.category = normalized.category;
      data.subcategory = normalized.subcategory;
    }

    // ── Vehicle enrichment via lookupChassis ──
    const title = (data.title as string) || '';
    const category = ((data.category as string) || '').toLowerCase();
    const rawAttributes = (data.attributes as Record<string, string>) || {};

    // Run lookupChassis on title if category is vehicles or if title contains vehicle keywords
    const isVehicleCategory = category.includes('vozil') || category.includes('auto') || category.includes('motocikl');
    const hasVehicleKeywords = /\b(bmw|mercedes|audi|vw|volkswagen|opel|ford|toyota|honda|hyundai|kia|fiat|renault|peugeot|škoda|skoda|seat|volvo|golf|passat|polo|a[1-8]|e[0-9]{2}|f[0-9]{2}|w[0-9]{3}|g[0-9]{2})\b/i.test(title);

    if (isVehicleCategory || hasVehicleKeywords) {
      const { vehicleData, enrichedAttributes } = enrichWithChassis(title, rawAttributes);
      data.attributes = enrichedAttributes;
      if (vehicleData) {
        data.vehicleData = vehicleData;
      }
      // If we detected vehicle but category wasn't set, set it
      if (!data.category && vehicleData) {
        data.category = 'Vozila';
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[/api/ai/import]', err);
    return NextResponse.json(
      { success: false, error: 'Greška pri importu oglasa.', hint: 'Pokušaj ponovo. Ako se problem ponavlja, kopiraj oglas ručno.', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}