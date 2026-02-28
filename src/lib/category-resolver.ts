/**
 * Deep category resolver — resolves any category string to the deepest possible level.
 * Used by upload form (before submission) and import flow.
 *
 * Two-stage approach:
 *   Stage 1: Regex/stemming (fast, free, handles ~70% of cases)
 *   Stage 2: Gemini Flash AI (fallback, handles everything else)
 *
 * Result is ALWAYS the deepest possible level.
 */

import { CATEGORIES } from './constants';

// ── Stem-aware matching for Slavic languages ──
// Words change endings a lot: sprava/sprave/spravu, klupa/klupe/klupi
function stemMatch(text: string, word: string): boolean {
  if (text.includes(word)) return true;
  if (word.length < 4) return false;
  const stem = word.slice(0, Math.max(4, word.length - 2));
  return text.includes(stem);
}

/** Score how well an item name matches against text (title + description). */
function scoreItemMatch(
  itemName: string,
  subName: string,
  searchText: string,
): number {
  const itemLower = itemName.toLowerCase();
  const subLower = subName.toLowerCase();
  const textLower = searchText.toLowerCase();

  // Extract distinctive words (not in the subcategory name)
  const itemWords = itemLower
    .split(/[\s\/\(\),\u2013\-]+/)
    .filter(w => w.length > 2 && !subLower.includes(w));

  let score = 0;

  // Word-level matching with stemming
  for (const w of itemWords) {
    if (stemMatch(textLower, w)) score += 5;
  }

  // Phrase matching (2-3 word sequences)
  const clean = itemLower.replace(/[\(\)\/,\u2013]+/g, ' ').trim();
  const phraseWords = clean.split(/\s+/);
  for (let len = Math.min(3, phraseWords.length); len >= 2; len--) {
    for (let i = 0; i <= phraseWords.length - len; i++) {
      const phrase = phraseWords.slice(i, i + len).join(' ');
      if (phrase.length > 3 && textLower.includes(phrase)) score += len * 4;
    }
  }

  return score;
}

// ── Keyword rules for common subcategories ──
// Only for cases where word matching isn't reliable enough
const KEYWORD_RULES: Record<string, { rules: [RegExp, string][]; fallback?: string }> = {
  // VOZILA
  'Osobni automobili': {
    rules: [
      [/\b(oldtimer|veteran|classic\s*car|kolekcion)/i, 'Oldtimer vozila'],
      [/\b(elektri[čc]|tesla|ev\b|hybrid|plug[\s-]?in)/i, 'Električna i hibridna vozila'],
      [/\b(ošte[čć]en|havarisan|za\s+dijel|u\s+dijelov|karamboli)/i, 'Oštećena vozila (havarirana)'],
      [/\b(novo\b|0\s*km|iz\s*salon|sa\s*garancij)/i, 'Nova vozila (iz salona)'],
      [/\b(garancij|warranty)/i, 'Vozila s garancijom (rabljena)'],
    ],
    fallback: 'Polovni automobili',
  },
  'Motocikli i skuteri': {
    rules: [
      [/\b(skuter|scooter|vespa)/i, 'Skuteri'],
      [/\b(chopper|cruiser|harley)/i, 'Chopperi i cruiseri'],
      [/\b(enduro|cross|motocross|supermoto)/i, 'Enduro i motocross'],
      [/\b(atv|quad|četverotočkaš)/i, 'ATV / Quad'],
      [/\b(oprema|kacig|rukavic|čizm)/i, 'Oprema za motocikliste'],
    ],
    fallback: 'Cestovni motocikli (naked, sport, touring)',
  },
  // FITNESS
  'Fitness i teretana': {
    rules: [
      [/\b(bu[čc]ic|uteg|dumbbell|kettlebell|girja)/i, 'Bučice i utezi'],
      [/\b(traka\s+za\s+tr[čc]anje|treadmill|ergometar|stepper)/i, 'Trake za trčanje i bicikl ergometar'],
      [/\b(crosstrainer|vesla[čć]|rower|elipti[čc])/i, 'Crosstraineri i veslači'],
      [/\b(klupa|bench)/i, 'Klupe za vježbanje'],
      [/\b(yoga|pilates|mat[ae]?\b)/i, 'Yoga i pilates oprema'],
      [/\b(protein|kreatin|suplement|whey|bcaa)/i, 'Dodaci prehrani (proteini, kreatin...)'],
      [/\b(rukavic|pojas\s+za\s+trening)/i, 'Rukavice i pojas za trening'],
      [/\b(skakan|crossfit|vijalic)/i, 'Skakanje i crossfit oprema'],
      [/\b(vratilo|razboj|sprav[aei]|multi\s*funk|power\s*tower|smith|rack|cage)/i, 'Višefunkcionalne sprave'],
    ],
    fallback: 'Višefunkcionalne sprave',
  },
  // NEKRETNINE
  'Stanovi': {
    rules: [
      [/\b(iznajm|najam|rent|kirij)/i, 'Iznajmljivanje stanova'],
      [/\b(zamjen)/i, 'Zamjena stanova'],
    ],
    fallback: 'Prodaja stanova',
  },
  'Kuće': {
    rules: [[/\b(iznajm|najam|rent|kirij)/i, 'Iznajmljivanje kuća']],
    fallback: 'Prodaja kuća',
  },
  'Zemljišta': {
    rules: [[/\b(poljopriv|njiva|oranica)/i, 'Poljoprivredno zemljište']],
    fallback: 'Građevinsko zemljište',
  },
  // TELEVIZORI
  'Televizori': {
    rules: [
      [/\b(oled)/i, 'OLED televizori'],
      [/\b(qled|neo\s*qled)/i, 'QLED televizori'],
      [/\b(4k|uhd)/i, '4K UHD televizori'],
    ],
    fallback: 'Smart TV',
  },
  // BIJELA TEHNIKA
  'Bijela tehnika': {
    rules: [
      [/\b(perilica\s+za\s+su[đd]|sudomašin|dishwash)/i, 'Perilice za suđe'],
      [/\b(perilica|veš\s*mašin|washing)/i, 'Perilice rublja'],
      [/\b(sušili|dryer)/i, 'Sušilice rublja'],
      [/\b(fri[žz]id|hladnjak|fridge|zamrziv)/i, 'Hladnjaci i zamrzivači'],
      [/\b(šted|peć|rer[nm]a|oven)/i, 'Štednjaci i pećnice'],
      [/\b(klima|air\s*con)/i, 'Klima uređaji'],
      [/\b(bojler|grijali)/i, 'Bojleri i grijači vode'],
    ],
    fallback: 'Perilice rublja',
  },
  // LAPTOPI
  'Laptopi': {
    rules: [
      [/\b(gaming|igra[čć]k|rog\b|legion|predator|omen)/i, 'Gaming laptopi'],
      [/\b(macbook|apple)/i, 'MacBook (Apple)'],
      [/\b(ultrabook|thin|light|zenbook|swift)/i, 'Ultrabook i tanki laptopi'],
      [/\b(2[\s-]?u[\s-]?1|tablet\s*laptop|convertible|surface\s*pro)/i, '2-u-1 (tablet/laptop)'],
      [/\b(chromebook)/i, 'Chromebook'],
    ],
    fallback: 'Poslovni laptopi',
  },
  // STROJEVI I ALATI
  'Električni alati': {
    rules: [
      [/\b(bušili|drill|aku[\s\-]?bušili|udarn[aei]\s+bušili|hilti)/i, 'Bušilice i udarne bušilice'],
      [/\b(odvija[čć]|aku[\s\-]?odvija[čć]|impact\s*wrench|momentni)/i, 'Bušilice i udarne bušilice'],
      [/\b(brusilica?\s+za\s+drvo|šlajferic)/i, 'Brusilice za drvo'],
      [/\b(cirkular|kružn[aei]\s+pil)/i, 'Cirkularne pile'],
      [/\b(kutna\s+brusilica|flex\b|angle\s*grind)/i, 'Kutne brusilice'],
      [/\b(kompresor)/i, 'Kompresori'],
      [/\b(ubodna\s+pila|jigsaw)/i, 'Ubodne pile'],
    ],
    fallback: 'Bušilice i udarne bušilice',
  },
  'Ručni alati': {
    rules: [
      [/\b(ključ|nasadni|socket|gedora)/i, 'Ključevi i nasadni seti'],
      [/\b(libel|mjera[čć]|laser|metar\b)/i, 'Mjerači i libele'],
    ],
    fallback: 'Ostali ručni alati',
  },
  'Poljoprivredni strojevi': {
    rules: [
      [/\b(traktor|john\s*deere|massey|fendt)/i, 'Traktori'],
      [/\b(kombajn)/i, 'Kombajni'],
      [/\b(kosilic)/i, 'Kosilice traktorske'],
    ],
    fallback: 'Traktori',
  },
  'Vrtni strojevi': {
    rules: [
      [/\b(kosilic|lawnmow)/i, 'Motorne kosilice'],
      [/\b(motorna\s+pila|chainsaw)/i, 'Motorne pile'],
      [/\b(trimer|trimmer)/i, 'Motorni trimer'],
    ],
    fallback: 'Motorne kosilice',
  },
  // DOM I VRT
  'Namještaj – Dnevna soba': {
    rules: [
      [/\b(kau[čć]|sofa|garnitur)/i, 'Garniture i kauči'],
      [/\b(polica|regal|vitrina)/i, 'Police i regali'],
    ],
    fallback: 'Garniture i kauči',
  },
  'Namještaj – Spavaća soba': {
    rules: [
      [/\b(krevet|madrac|dušek)/i, 'Kreveti i madraci'],
      [/\b(ormar|garderob)/i, 'Ormari za spavaću sobu'],
    ],
    fallback: 'Kreveti i madraci',
  },
  'Grijanje i hlađenje': {
    rules: [
      [/\b(klima|air\s*con)/i, 'Klima uređaji'],
      [/\b(radijator|grijalic)/i, 'Radijatori i grijalice'],
    ],
    fallback: 'Klima uređaji',
  },
  // AUDIO / FOTO
  'Audio oprema': {
    rules: [
      [/\b(sluša|headphone|earbud)/i, 'Slušalice'],
      [/\b(zvu[čć]nik|speaker|soundbar)/i, 'Zvučnici i soundbar'],
    ],
    fallback: 'Slušalice',
  },
  'Foto i video oprema': {
    rules: [
      [/\b(dslr|mirrorless|fotoaparat|camera)/i, 'DSLR i mirrorless fotoaparati'],
      [/\b(gopro|action\s*cam)/i, 'Action kamere (GoPro...)'],
      [/\b(objektiv|lens)/i, 'Objektivi'],
      [/\b(dron|drone|dji)/i, 'Dronovi'],
    ],
    fallback: 'DSLR i mirrorless fotoaparati',
  },
  // KOMPONENTE
  'Komponente': {
    rules: [
      [/\b(grafi[čć]k|gpu|rtx|gtx|radeon)/i, 'Grafičke kartice (GPU)'],
      [/\b(procesor|cpu|ryzen|intel\s*i[3579])/i, 'Procesori (CPU)'],
      [/\b(ram\b|ddr[345])/i, 'RAM memorija'],
      [/\b(ssd|nvme|hdd)/i, 'SSD i hard diskovi'],
      [/\b(mati[čć]n|motherboard)/i, 'Matične ploče'],
    ],
    fallback: 'Grafičke kartice (GPU)',
  },
  // NAKIT
  'Nakit i satovi': {
    rules: [
      [/\b(sat\b|watch|rolex|casio)/i, 'Ručni satovi'],
      [/\b(ogrlica|lančić)/i, 'Ogrlice i lančići'],
      [/\b(prsten|ring)/i, 'Prstenje'],
    ],
    fallback: 'Ručni satovi',
  },
};

// ── Item validation helper ──
/** Validate that an item name exists in the actual items list.
 *  If not found, try fuzzy match (Slavic word endings). Returns valid item or null. */
function validateItem(itemName: string, actualItems: string[]): string | null {
  if (actualItems.includes(itemName)) return itemName;
  // Fuzzy match: stem-aware
  const iLower = itemName.toLowerCase();
  const fuzzy = actualItems.find(si => {
    const sLower = si.toLowerCase();
    return sLower.includes(iLower) || iLower.includes(sLower) || stemMatch(sLower, iLower);
  });
  return fuzzy || null;
}

// ── Stage 1: Local resolution (regex + stemming) ──

/** Find the best item for a subcategory using keyword rules, scoring, then fallback.
 *  ALL returned items are VALIDATED against the actual items list. */
function resolveBestItemLocal(subName: string, items: string[], searchText: string): { item: string | null; confident: boolean } {
  // 1) Check keyword rules
  const config = KEYWORD_RULES[subName];
  if (config) {
    for (const [regex, itemName] of config.rules) {
      if (regex.test(searchText)) {
        // Validate: KEYWORD_RULES might have wrong item names
        const valid = validateItem(itemName, items);
        if (valid) return { item: valid, confident: true };
        // Rule matched but item doesn't exist — skip
      }
    }
  }

  // 2) Score items by word matching (items come from actual CATEGORIES, always valid)
  let bestItem: string | null = null;
  let bestScore = 0;
  for (const item of items) {
    const score = scoreItemMatch(item, subName, searchText);
    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }
  if (bestScore >= 5) return { item: bestItem, confident: true };
  if (bestScore >= 3) return { item: bestItem, confident: false }; // weak match — AI should verify

  // 3) Fallback from keyword rules (validate against actual items)
  if (config?.fallback) {
    const valid = validateItem(config.fallback, items);
    if (valid) return { item: valid, confident: false };
  }

  // 4) Generic fallback: "Ostali/Ostalo" or first item — NOT confident
  const ostali = items.find(item => /^Ostal[oiae]/i.test(item));
  return { item: ostali || items[0] || null, confident: false };
}

/** Resolve subcategory + item from search text when only main category is known */
function resolveSubAndItemLocal(
  subCategories: { name: string; items?: string[] }[],
  searchText: string,
): { sub: string | null; item: string | null; subItems: string[]; confident: boolean } {
  const textLower = searchText.toLowerCase();
  let bestSub: string | null = null;
  let bestItem: string | null = null;
  let bestScore = -1;
  let bestSubItems: string[] = [];

  for (const sub of subCategories) {
    let subScore = 0;
    const subLower = sub.name.toLowerCase();

    const subWords = subLower.split(/[\s\u2013\-\/\(\)]+/).filter(w => w.length > 2);
    for (const sw of subWords) {
      if (stemMatch(textLower, sw)) subScore += 3;
    }

    let topItem: string | null = null;
    let topItemScore = 0;
    if (sub.items?.length) {
      for (const item of sub.items) {
        const s = scoreItemMatch(item, sub.name, searchText);
        if (s > topItemScore) {
          topItemScore = s;
          topItem = item;
        }
      }
    }

    const combined = subScore + topItemScore;
    if (combined > bestScore) {
      bestScore = combined;
      bestSub = sub.name;
      bestItem = topItem;
      bestSubItems = sub.items || [];
    }
  }

  if (bestScore < 2) return { sub: null, item: null, subItems: [], confident: false };

  // If item score was weak, use keyword rules / fallback
  if (bestSub && (!bestItem || bestScore < 5)) {
    const matchedSub = subCategories.find(s => s.name === bestSub);
    if (matchedSub?.items?.length) {
      const resolved = resolveBestItemLocal(bestSub, matchedSub.items, searchText);
      bestItem = resolved.item;
      bestSubItems = matchedSub.items;
    }
  }

  return { sub: bestSub, item: bestItem, subItems: bestSubItems, confident: bestScore >= 5 };
}

// ── Stage 2: AI resolution via /api/ai/resolve-item ──

async function resolveItemWithAI(
  title: string,
  description: string | undefined,
  subcategory: string,
  items: string[],
): Promise<string | null> {
  try {
    const res = await fetch('/api/ai/resolve-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: description || '',
        subcategory,
        items,
      }),
    });
    const json = await res.json();
    if (json.success && json.item) return json.item;
  } catch {
    // AI failed — will use local fallback
  }
  return null;
}

// ── Public API ──

/**
 * Resolve a category string to the deepest possible level (async, with AI fallback).
 *
 * @param categoryStr - Current category like "Sport i rekreacija - Fitness i teretana"
 * @param title - Product title
 * @param description - Product description (optional)
 * @returns Full resolved category string like "Sport i rekreacija - Fitness i teretana - Višefunkcionalne sprave"
 */
export async function resolveDeepCategory(
  categoryStr: string,
  title: string,
  description?: string,
): Promise<string> {
  const parts = categoryStr.split(' - ').map(p => p.trim()).filter(Boolean);

  // Already at 3+ levels — nothing to resolve
  if (parts.length >= 3) return categoryStr;

  // Need at least a main category
  if (parts.length === 0) return categoryStr;

  const mainName = parts[0];
  const subName = parts[1];

  // Find main category in CATEGORIES tree
  const mainLower = mainName.toLowerCase();
  const mainCat = CATEGORIES.find(c => {
    const cn = c.name.toLowerCase();
    return cn === mainLower || mainLower.includes(cn) || cn.includes(mainLower);
  });

  if (!mainCat?.subCategories?.length) return categoryStr;

  const searchText = [title, description].filter(Boolean).join(' ');

  // ── Level 1 only: resolve sub + item ──
  if (!subName) {
    const local = resolveSubAndItemLocal(mainCat.subCategories, searchText);
    if (!local.sub) return categoryStr;

    let item = local.item;
    // Stage 2: AI if not confident and subcategory has items
    if (!local.confident && local.subItems.length > 0) {
      const aiItem = await resolveItemWithAI(title, description, local.sub, local.subItems);
      if (aiItem) {
        // Validate AI result against actual items
        const valid = validateItem(aiItem, local.subItems);
        if (valid) item = valid;
      }
    }

    // ENSURE item is always set when subcategory has items
    if (!item && local.subItems.length > 0) {
      item = local.subItems[0];
    }

    let result = `${mainName} - ${local.sub}`;
    if (item) result += ` - ${item}`;
    return result;
  }

  // ── Level 2: resolve item within known subcategory ──
  const subLower = subName.toLowerCase();
  const matchedSub = mainCat.subCategories.find(s => {
    const sn = s.name.toLowerCase();
    return sn === subLower || sn.includes(subLower) || subLower.includes(sn);
  });

  if (!matchedSub?.items?.length) return categoryStr;

  // Stage 1: local
  const local = resolveBestItemLocal(matchedSub.name, matchedSub.items, searchText);
  let item = local.item;

  // Stage 2: AI if not confident
  if (!local.confident) {
    const aiItem = await resolveItemWithAI(title, description, matchedSub.name, matchedSub.items);
    if (aiItem) {
      // Validate AI result against actual items
      const valid = validateItem(aiItem, matchedSub.items);
      if (valid) item = valid;
    }
  }

  // ENSURE item is always set
  if (!item) {
    item = matchedSub.items[0];
  }

  return `${mainName} - ${subName} - ${item}`;
}
