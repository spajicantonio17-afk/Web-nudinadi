import { NextRequest, NextResponse } from 'next/server';
import { textWithGemini, parseJsonResponse, sanitizeForPrompt } from '@/lib/gemini';

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
      const data = parseJsonResponse(raw);
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

Vrati SAMO JSON:
{
  "category": "Tačan naziv kategorije iz liste iznad",
  "subcategory": "Što preciznija potkategorija (za Vozila/Dijelove = marka vozila, za Mobilne = brend, za ostale = tip)",
  "correctedTitle": "Ispravljeni naslov bez pravopisnih grešaka",
  "confidence": broj_0_100,
  "vehicleType": "car|motorcycle|bicycle|truck|camper|boat|atv|parts"
}`;

      const raw = await textWithGemini(prompt);
      const data = parseJsonResponse(raw);
      return NextResponse.json({ success: true, data });
    }

    if (action === 'vin') {
      const { vin } = body;
      if (!vin || vin.length !== 17) return NextResponse.json({ error: 'VIN mora imati 17 znakova' }, { status: 400 });

      const prompt = `Dekodiraj ovaj VIN (Vehicle Identification Number): "${sanitizeForPrompt(vin, 17)}"

Na osnovu VIN broja odredi informacije o vozilu. Koristi standardne WMI (World Manufacturer Identifier) kodove.

Vrati SAMO JSON:
{
  "brand": "Proizvođač (npr. Volkswagen, BMW, Audi...)",
  "model": "Model vozila (npr. Golf, Passat, 3 Series...)",
  "year": godina_proizvodnje_broj,
  "engine": "Tip motora ako se može odrediti (npr. 2.0 TDI, 1.6 benzin...)",
  "bodyType": "Tip karoserije (Limuzina, Hatchback, SUV, Karavan, Coupe...)",
  "drivetrain": "Pogon (Prednji, Stražnji, 4x4, Quattro...)",
  "title": "Predloženi naslov oglasa na bosanskom/hrvatskom (npr. Volkswagen Golf 8 2.0 TDI 2022)",
  "description": "Kratki opis vozila na bosanskom/hrvatskom (2-3 rečenice o vozilu, opremi, karakteristikama)",
  "confidence": broj_0_100
}

Ako VIN izgleda nevalidan ili ne možeš dekodirati, vrati confidence: 0 i popuni polja sa "Nepoznato".`;

      const raw = await textWithGemini(prompt);
      const data = parseJsonResponse(raw);
      return NextResponse.json({ success: true, data });
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
