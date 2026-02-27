import { NextRequest, NextResponse } from 'next/server';
import { textWithGemini, parseJsonResponse, sanitizeForPrompt } from '@/lib/gemini';
import { sanitizeTags } from '@/lib/ai-utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, title, description, category, subcategory, price, images } = body;

    if (!action) {
      return NextResponse.json({ error: 'Akcija je obavezna' }, { status: 400 });
    }

    if (action === 'title') {
      if (!title) return NextResponse.json({ error: 'Naslov je obavezan' }, { status: 400 });

      const prompt = `Poboljšaj ovaj naslov oglasa za second-hand marketplace na bosanskom/hrvatskom jeziku.
Originalni naslov: "${sanitizeForPrompt(title, 200)}"
Kategorija: ${sanitizeForPrompt(category || 'nepoznato', 100)}

Pravila:
- Maksimalno 60 znakova
- Sadrži ključne informacije (marka, model, stanje, veličina ako relevantno)
- Prirodan bosanski/hrvatski jezik, bez pravopisnih grešaka
- Ne dodaj emoji
- Budi konkretan i informativan

Vrati SAMO JSON: {"improvedTitle": "poboljšani naslov", "explanation": "kratko objašnjenje izmjena"}`;

      const raw = await textWithGemini(prompt);
      const data = parseJsonResponse(raw);
      return NextResponse.json({ success: true, data });
    }

    if (action === 'description') {
      if (!title) return NextResponse.json({ error: 'Naslov je obavezan' }, { status: 400 });

      const prompt = `Napiši profesionalan opis oglasa za second-hand marketplace na bosanskom/hrvatskom jeziku.
Naslov: "${sanitizeForPrompt(title, 200)}"
Kategorija: ${sanitizeForPrompt(category || 'nepoznato', 100)}
${description ? `Postojeći opis (poboljšaj ga): "${sanitizeForPrompt(description, 2000)}"` : ''}
${price ? `Cijena: ${price} KM` : ''}

Struktura opisa:
1. Kratki uvod o predmetu (1-2 rečenice)
2. Ključne karakteristike (bullet lista, 3-5 stavki)
3. Stanje predmeta
4. Info o preuzimanju/dostavi (ako relevantno)

Ton: profesionalan ali prijateljski, bosanski/hrvatski jezik bez grešaka.
Dužina: 80-150 riječi.

Vrati SAMO JSON: {"description": "cijeli opis", "bulletPoints": ["točka 1", "točka 2", "točka 3"]}`;

      const raw = await textWithGemini(prompt);
      const data = parseJsonResponse(raw);
      return NextResponse.json({ success: true, data });
    }

    if (action === 'quality') {
      if (!title) return NextResponse.json({ error: 'Naslov je obavezan' }, { status: 400 });

      const prompt = `Procijeni kvalitetu ovog oglasa za second-hand marketplace i daj ocjenu.
Naslov: "${sanitizeForPrompt(title, 200)}"
Opis: "${sanitizeForPrompt(description || '(nema opisa)', 2000)}"
Kategorija: ${sanitizeForPrompt(category || 'nepoznato', 100)}
Broj slika: ${images || 0}
Cijena: ${price ? price + ' KM' : '(nije postavljena)'}

Ocijeni oglas od 0-100 i daj konkretne savjete za poboljšanje.

Vrati SAMO JSON:
{
  "score": broj_0_100,
  "level": "Loš | Prosječan | Dobar | Odličan",
  "warnings": ["upozorenje 1", "upozorenje 2"],
  "suggestions": ["savjet 1", "savjet 2"],
  "priceEstimate": { "min": broj_ili_null, "max": broj_ili_null, "currency": "KM" },
  "missingInfo": ["što nedostaje 1", "što nedostaje 2"]
}`;

      const raw = await textWithGemini(prompt);
      const data = parseJsonResponse(raw);
      return NextResponse.json({ success: true, data });
    }

    if (action === 'tags') {
      if (!title) return NextResponse.json({ error: 'Naslov je obavezan' }, { status: 400 });

      const prompt = `Generiši relevantne tagove/ključne riječi za oglas na bosanskom/hrvatskom/srpskom jeziku.
Naslov: "${sanitizeForPrompt(title, 200)}"
Opis: "${sanitizeForPrompt(description || '', 2000)}"
Kategorija: ${sanitizeForPrompt(category || 'nepoznato', 100)}

Pravila:
- 8-12 tagova
- Kratke fraze (1-3 riječi)
- Uključi sinonime i varijante pisanja (hr/bs/sr)
- Uključi relevantne brendove, modele ako ima smisla
- Uključi stanje, veličinu, boju ako relevantno

Vrati SAMO JSON: {"tags": ["tag1", "tag2", "tag3", ...]}`;

      const raw = await textWithGemini(prompt);
      const data = parseJsonResponse(raw) as Record<string, unknown>;
      if (data) data.tags = sanitizeTags(data.tags);
      return NextResponse.json({ success: true, data });
    }

    if (action === 'categorize') {
      if (!title) return NextResponse.json({ error: 'Naslov ili opis je obavezan' }, { status: 400 });

      const prompt = `Kategoriziraj ovaj oglas za second-hand marketplace. Korisnik može pisati s pravopisnim greškama, prekucama ili skraćenicama — ispravi ih i prepoznaj šta korisnik zapravo misli.

Tekst korisnika: "${sanitizeForPrompt(title, 200)}${description ? ' - ' + sanitizeForPrompt(description, 2000) : ''}"

VAŽNO: Korisnik može pisati s greškama! Primjeri:
- "iphon" → iPhone → Mobilni uređaji, subcategory: "Apple"
- "golf 7 tdi" → VW Golf 7 TDI → Vozila, subcategory: "Volkswagen"
- "leptop hp" → HP Laptop → Elektronika, subcategory: "Laptopi"
- "patike nik" → Nike patike → Odjeća i obuća, subcategory: "Cipele"
- "playstejšn" → PlayStation → Elektronika, subcategory: "Konzole"
- "stan sarajevo" → Stan Sarajevo → Nekretnine, subcategory: "Stanovi i Apartmani"
- "dječja kolica" → Dječja kolica → Odjeća za djecu, subcategory: "Oprema za bebe"

Kategorije (koristi TAČNO ove nazive) i primjeri subcategory:
1. Vozila — subcategory = MARKA vozila (npr. "BMW", "Volkswagen", "Audi", "Mercedes-Benz", "Toyota", "Fiat", "Renault", "Škoda", "Opel")
2. Dijelovi za vozila — subcategory = tip dijela (npr. "Felge i gume", "Motor", "Karoserija")
3. Nekretnine — subcategory jedan od: "Stanovi i Apartmani", "Stan na dan", "Kuće", "Poslovni prostori", "Vikendice", "Skladišta i hale", "Sobe", "Zemljišta", "Garaže", "Ostalo"
4. Mobilni uređaji — subcategory = BREND (npr. "Apple", "Samsung", "Huawei", "Xiaomi", "Google", "Sony", "Nokia")
5. Elektronika — subcategory jedan od: "Kompjuteri (Desktop)", "Laptopi", "Monitori / TV", "PC Oprema", "Konzole", "Video Igre", "Gaming Oprema", "Zvučnici / Audio", "Kamere", "Foto Oprema", "Gadgets"
6. Odjeća i obuća — subcategory jedan od: "Ženska moda", "Muška moda", "Dječja odjeća i obuća", "Cipele", "Nakit (Schmuck)", "Accessoires"
7. Dom i vrt — subcategory npr. "Namještaj", "Vrt", "Rasvjeta", "Alati"
8. Sport i rekreacija — subcategory npr. "Fitness", "Biciklizam", "Zimski sportovi", "Planinarenje"
9. Odjeća za djecu — subcategory npr. "Oprema za bebe", "Dječje igračke", "Dječja odjeća"
10. Glazba i instrumenti — subcategory npr. "Gitare", "Bubnjevi", "Klavijature", "PA sustavi"
11. Literatura i mediji — subcategory npr. "Knjige", "Stripovi", "Filmovi"
12. Video igre — subcategory npr. "PlayStation", "Xbox", "Nintendo", "PC igre"
13. Životinje — subcategory npr. "Psi", "Mačke", "Oprema za životinje"
14. Hrana i piće — subcategory npr. "Med", "Meso", "Domaći proizvodi"
15. Strojevi i alati — subcategory npr. "Električni alati", "Građevinski strojevi", "Traktori"
16. Poslovi — subcategory npr. "IT & Digital", "Bau & Handwerk", "Gastronomie & Hotel"
17. Usluge — subcategory npr. "Građevinske usluge", "IT usluge", "Auto Servisi", "Selidbe i Transport"
18. Umjetnost i kolekcionarstvo — subcategory npr. "Slike", "Antikviteti", "Numizmatika"
19. Tehnika — subcategory npr. "Televizori", "Bijela tehnika", "Smart home"
20. Ostalo — za sve što ne pripada gore navedenim

Ako je kategorija "Vozila", OBAVEZNO dodaj polje "vehicleType" sa jednom od vrijednosti:
- "car" — osobni automobili (auti, limuzine, SUV, kombi, kabriolet, oldtajmer)
- "motorcycle" — motocikli, skuteri, mopedi, vespe, tricikli
- "bicycle" — bicikli, e-bicikli, romobili
- "truck" — kamioni, teretna vozila, autobusi, kombiji, dostavna vozila
- "camper" — kamperi, kamp prikolice, autodomovi
- "boat" — čamci, brodovi, jedrilice, jet ski, gumenjaci, kajaci
- "atv" — ATV, quad, UTV, side-by-side, buggy

Ako je kategorija "Dijelovi za vozila", postavi vehicleType na "parts".

Primjeri:
- "Golf 7 TDI 2018" → category: "Vozila", subcategory: "Volkswagen", vehicleType: "car"
- "Yamaha R1 2020" → category: "Vozila", subcategory: "Yamaha", vehicleType: "motorcycle"
- "Trek Marlin 7 2022" → category: "Vozila", subcategory: "Trek", vehicleType: "bicycle"
- "MAN TGX 18.440" → category: "Vozila", subcategory: "MAN", vehicleType: "truck"
- "Hymer B-MC 580" → category: "Vozila", subcategory: "Hymer", vehicleType: "camper"
- "Bayliner VR5" → category: "Vozila", subcategory: "Bayliner", vehicleType: "boat"
- "Polaris Sportsman 570" → category: "Vozila", subcategory: "Polaris", vehicleType: "atv"
- "Turbina za Golf 5" → category: "Dijelovi za vozila", subcategory: "Volkswagen", vehicleType: "parts"

Dodatno: Generiši 10-15 skrivenih tagova za pretragu.
Tag pravila:
- Sinonimi na bs/hr/sr (mobitel = telefon = handy, auto = automobil = kola)
- Marka, model, tip proizvoda
- Boja, veličina, stanje (ako se može zaključiti)
- Razgovorni i regionalni izrazi (laptop = leptop = prijenosnik = računar)
- Uključi česte pravopisne greške korisnika (iphon, samsng, volksvaen)
- Max 3 riječi po tagu, sve lowercase
- Uključi i engleski naziv ako je poznat brend (npr. "shoes" za cipele)

Vrati SAMO JSON:
{
  "category": "Tačan naziv kategorije iz liste iznad",
  "subcategory": "Što preciznija potkategorija (za Vozila/Dijelove = marka vozila, za Mobilne = brend, za ostale = tip)",
  "correctedTitle": "Ispravljeni naslov bez pravopisnih grešaka",
  "confidence": broj_0_100,
  "vehicleType": "car|motorcycle|bicycle|truck|camper|boat|atv|parts",
  "tags": ["tag1", "tag2", "tag3", "...do 15 tagova"]
}`;

      const raw = await textWithGemini(prompt);
      const data = parseJsonResponse(raw) as Record<string, unknown>;
      data.tags = sanitizeTags(data.tags);
      return NextResponse.json({ success: true, data });
    }

    if (action === 'vin') {
      const { vin } = body;
      if (!vin || vin.length !== 17) return NextResponse.json({ error: 'VIN mora imati 17 znakova' }, { status: 400 });

      // ── WMI Lookup (first 3 chars → manufacturer) ──
      const WMI_MAP: Record<string, string> = {
        // Germany
        WDB: 'Mercedes-Benz', WDC: 'Mercedes-Benz', WDD: 'Mercedes-Benz', WMX: 'Mercedes-Benz',
        WBA: 'BMW', WBS: 'BMW', WBY: 'BMW',
        WAU: 'Audi', WUA: 'Audi',
        WVW: 'Volkswagen', WV1: 'Volkswagen', WV2: 'Volkswagen', WV3: 'Volkswagen',
        WF0: 'Ford', W0L: 'Opel', WP0: 'Porsche', WP1: 'Porsche',
        // Czech
        TMB: 'Škoda', TMP: 'Škoda',
        // France
        VF1: 'Renault', VF3: 'Peugeot', VF7: 'Citroën', VR1: 'Dacia',
        // Italy
        ZFA: 'Fiat', ZAR: 'Alfa Romeo', ZLA: 'Lancia', ZFF: 'Ferrari', ZHW: 'Lamborghini',
        // UK
        SAJ: 'Jaguar', SAL: 'Land Rover', SCC: 'Lotus', SCF: 'Aston Martin',
        // Sweden
        YV1: 'Volvo', YS2: 'Scania',
        // Japan
        JTD: 'Toyota', JTE: 'Toyota', JHM: 'Honda', JN1: 'Nissan', JMZ: 'Mazda',
        JS1: 'Suzuki', JYA: 'Yamaha',
        // Korea
        KMH: 'Hyundai', KNA: 'Kia', KNM: 'Renault Samsung',
        // US (common)
        '1G1': 'Chevrolet', '1G6': 'Cadillac', '1FA': 'Ford', '1FM': 'Ford',
        '1FT': 'Ford', '2FA': 'Ford', '3FA': 'Ford', '1HD': 'Harley-Davidson',
        '1GC': 'Chevrolet', '1GT': 'GMC', '2T1': 'Toyota', '5YJ': 'Tesla',
        '5TD': 'Hyundai', '5NP': 'Hyundai', '5XY': 'Kia',
        // Spain
        VSS: 'SEAT',
        // Romania
        UU1: 'Dacia',
      };

      // Mercedes model codes (positions 4-6 of VIN)
      const MERCEDES_MODELS: Record<string, string> = {
        '168': 'A-Klasse (W168)', '169': 'A-Klasse (W169)', '176': 'A-Klasse (W176)', '177': 'A-Klasse (W177)',
        '245': 'B-Klasse (W245)', '246': 'B-Klasse (W246)', '247': 'B-Klasse/GLB (W247)',
        '202': 'C-Klasse (W202)', '203': 'C-Klasse (W203)', '204': 'C-Klasse (W204)', '205': 'C-Klasse (W205)', '206': 'C-Klasse (W206)',
        '210': 'E-Klasse (W210)', '211': 'E-Klasse (W211)', '212': 'E-Klasse (W212)', '213': 'E-Klasse (W213)', '214': 'E-Klasse (W214)',
        '220': 'S-Klasse (W220)', '221': 'S-Klasse (W221)', '222': 'S-Klasse (W222)', '223': 'S-Klasse (W223)',
        '163': 'ML (W163)', '164': 'ML/GL (W164)', '166': 'GLE (W166)', '167': 'GLE/GLS (W167)',
        '253': 'GLC (X253)', '254': 'GLC (X254)',
        '156': 'GLA (X156)',
        '171': 'SLK (R171)', '172': 'SLK/SLC (R172)',
        '209': 'CLK (W209)', '207': 'E-Klasse Coupé (C207)',
        '117': 'CLA (C117)', '118': 'CLA (C118)',
        '292': 'GLE Coupé (C292)',
        '447': 'V-Klasse', '639': 'Vito/Viano',
        '906': 'Sprinter', '907': 'Sprinter',
        '461': 'G-Klasse', '463': 'G-Klasse', '464': 'G-Klasse',
      };

      const wmi = vin.substring(0, 3).toUpperCase();
      const wmiMake = WMI_MAP[wmi] || null;
      const vds = vin.substring(3, 6); // Vehicle Descriptor Section — model code for Mercedes, BMW, etc.

      // For Mercedes, decode model from positions 4-6
      let wmiModel: string | null = null;
      if (wmiMake === 'Mercedes-Benz' && MERCEDES_MODELS[vds]) {
        wmiModel = MERCEDES_MODELS[vds];
      }

      // ── Step 1: NHTSA vPIC API for real vehicle data ──
      let nhtsaData: Record<string, string> = {};
      try {
        const nhtsaRes = await fetch(
          `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${encodeURIComponent(vin)}?format=json`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (nhtsaRes.ok) {
          const nhtsaJson = await nhtsaRes.json();
          const results = nhtsaJson?.Results as { Variable: string; Value: string | null }[] | undefined;
          if (results) {
            for (const r of results) {
              if (r.Value && r.Value.trim() && r.Value !== 'Not Applicable') {
                nhtsaData[r.Variable] = r.Value.trim();
              }
            }
          }
        }
      } catch {
        // NHTSA unavailable — continue with WMI + Gemini
      }

      // Is this a North American VIN? (1-5 = US/Canada/Mexico)
      const firstChar = vin.charAt(0);
      const isNorthAmerican = '12345'.includes(firstChar);

      // Merge all sources for best data
      const brand = nhtsaData['Make'] || wmiMake || nhtsaData['Manufacturer Name']?.replace(/ CARS$/i, '').replace(/ AUTOMOBIL.*$/i, '') || '';
      const model = nhtsaData['Model'] || wmiModel || '';
      // NHTSA year is only reliable for North American VINs — EU VINs don't encode year at position 10
      const nhtsaYear = parseInt(nhtsaData['Model Year'] || '0') || null;
      const year = isNorthAmerican ? nhtsaYear : null;
      const engineParts = [
        nhtsaData['Displacement (L)'] ? nhtsaData['Displacement (L)'] + 'L' : '',
        nhtsaData['Fuel Type - Primary'] || '',
        nhtsaData['Engine Number of Cylinders'] ? nhtsaData['Engine Number of Cylinders'] + ' cyl' : '',
      ].filter(Boolean);
      const engine = engineParts.length > 0 ? engineParts.join(' ') : null;
      const bodyType = nhtsaData['Body Class'] || null;
      const drivetrain = nhtsaData['Drive Type'] || null;
      const vehicleType = nhtsaData['Vehicle Type'] || null;
      const plantCountry = nhtsaData['Plant Country'] || null;
      const plantCity = nhtsaData['Plant City'] || null;
      const transmission = nhtsaData['Transmission Style'] || null;
      const trim = nhtsaData['Trim'] || nhtsaData['Series'] || null;
      const doors = nhtsaData['Doors'] || null;

      const hasUsefulData = !!(brand || model);

      // ── Step 2: Gemini — with ALL available context ──
      const contextLines: string[] = [];
      if (brand) contextLines.push(`- Proizvođač: ${brand}`);
      if (model) contextLines.push(`- Model: ${model}`);
      if (year) contextLines.push(`- Godina: ${year}`);
      if (!isNorthAmerican && nhtsaYear) contextLines.push(`- NHTSA predlaže godinu ${nhtsaYear} (NEPOUZDANO — europski VIN ne kodira godinu na poziciji 10)`);
      if (engine) contextLines.push(`- Motor: ${engine}`);
      if (bodyType) contextLines.push(`- Karoserija (eng): ${bodyType}`);
      if (drivetrain) contextLines.push(`- Pogon (eng): ${drivetrain}`);
      if (transmission) contextLines.push(`- Mjenjač: ${transmission}`);
      if (trim) contextLines.push(`- Trim/Serija: ${trim}`);
      if (doors) contextLines.push(`- Vrata: ${doors}`);
      if (vehicleType) contextLines.push(`- Tip vozila: ${vehicleType}`);
      if (plantCountry) contextLines.push(`- Zemlja proizvodnje: ${plantCountry}`);
      if (plantCity) contextLines.push(`- Grad proizvodnje: ${plantCity}`);

      const prompt = `Dekodiraj VIN: "${sanitizeForPrompt(vin, 17)}"

${contextLines.length > 0 ? `Poznati podaci iz baze:\n${contextLines.join('\n')}\n` : 'Nema podataka iz baze — dekodiraj potpuno iz VIN strukture.\n'}
WMI (prve 3 cifre): ${wmi}
VDS (pozicije 4-6): ${vds}

Na osnovu VIN broja i gore navedenih podataka, odredi SVE informacije o vozilu.

VAŽNO ZA GODINU PROIZVODNJE:
- Sjevernoamerički VIN-ovi (počinju sa 1-5): pozicija 10 = godina (pouzdano).
- Europski VIN-ovi (počinju sa S-Z): pozicija 10 NE KODIRA godinu! Ne koristi poziciju 10 za godinu kod europskih vozila.
- Za europska vozila, godinu odredi na osnovu model koda i proizvodnog raspona:
  Mercedes W203 (C-Klasse): 2000-2007, W204: 2007-2014, W211 (E): 2002-2009, itd.
  Ako ne možeš pouzdano odrediti tačnu godinu, vrati null (NE pogađaj!).

Za europske VIN-ove, koristi WMI tablicu i specifičnu strukturu proizvođača.
Mercedes-Benz: pozicije 4-6 = model kod (npr. 203=C-Klasse, 211=E-Klasse, 164=ML).
BMW: pozicije 4-5 = model serija.

Prevedi na bosanski:
- "Sedan" → "Limuzina", "Hatchback" → "Hatchback", "SUV"/"Sport Utility" → "SUV"
- "Wagon"/"Estate" → "Karavan", "Coupe" → "Coupe", "Convertible" → "Kabriolet"
- "All-Wheel Drive" → "4x4", "Front-Wheel Drive" → "Prednji pogon", "Rear-Wheel Drive" → "Zadnji pogon"

Vrati SAMO JSON:
{
  "brand": "Proizvođač (npr. Mercedes-Benz, BMW, Volkswagen)",
  "model": "Model (npr. C-Klasse, Golf, 3 Series)",
  "year": godina_broj_ili_null,
  "engine": "Motor (npr. 2.0 TDI, 1.8 Benzin, 220 CDI) ili null",
  "bodyType": "Karoserija na bosanskom",
  "drivetrain": "Pogon na bosanskom ili null",
  "title": "Naslov oglasa na bosanskom (npr. Mercedes-Benz C-Klasse (W203) 2001)",
  "description": "Opis vozila na bosanskom (2-3 rečenice o vozilu)",
  "confidence": broj_0_100
}

VAŽNO: Koristi podatke iz baze kao istinu. Ako baza kaže proizvođač=Mercedes-Benz i model=C-Klasse, NE MIJENJAJ to.
Dopuni samo nedostajuće podatke (motor, karoserija, pogon) koristeći VIN strukturu i svoje znanje.
Ako nešto ne možeš pouzdano odrediti, stavi null.`;

      const raw = await textWithGemini(prompt);
      const gemini = parseJsonResponse(raw) as Record<string, unknown> | null;
      const g = gemini || {};

      // ── Step 3: Merge — known data overrides Gemini guesses ──
      const geminiYear = typeof g.year === 'number' ? g.year : null;
      const result = {
        brand: brand || (g.brand as string) || 'Nepoznato',
        model: model || (g.model as string) || 'Nepoznato',
        year: isNorthAmerican ? (year || geminiYear) : (geminiYear || null),
        engine: (g.engine as string) || engine || null,
        bodyType: (g.bodyType as string) || bodyType || null,
        drivetrain: (g.drivetrain as string) || drivetrain || null,
        title: (g.title as string) || `${brand || 'Vozilo'} ${model || ''}${year ? ' ' + year : ''}`.trim(),
        description: (g.description as string) || '',
        confidence: hasUsefulData ? Math.max(Number(g.confidence) || 70, 70) : (Number(g.confidence) || 30),
        source: hasUsefulData ? 'nhtsa+wmi+gemini' : (wmiMake ? 'wmi+gemini' : 'gemini'),
      };

      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ error: 'Nepoznata akcija' }, { status: 400 });
  } catch (err) {
    console.error('[/api/ai/enhance]', err);
    return NextResponse.json(
      { error: 'Greška pri AI obradi', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
