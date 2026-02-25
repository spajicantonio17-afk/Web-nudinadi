import { NextRequest, NextResponse } from 'next/server';
import { textWithGemini, parseJsonResponse } from '@/lib/gemini';

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
Originalni naslov: "${title}"
Kategorija: ${category || 'nepoznato'}

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
Naslov: "${title}"
Kategorija: ${category || 'nepoznato'}
${description ? `Postojeći opis (poboljšaj ga): "${description}"` : ''}
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
Naslov: "${title}"
Opis: "${description || '(nema opisa)'}"
Kategorija: ${category || 'nepoznato'}
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
Naslov: "${title}"
Opis: "${description || ''}"
Kategorija: ${category || 'nepoznato'}

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

Tekst korisnika: "${title}${description ? ' - ' + description : ''}"

VAŽNO: Korisnik može pisati s greškama! Primjeri:
- "iphon" → iPhone → Mobilni uređaji, subcategory: "Apple"
- "golf 7 tdi" → VW Golf 7 TDI → Vozila, subcategory: "Volkswagen"
- "leptop hp" → HP Laptop → Elektronika, subcategory: "Laptopi"
- "patike nik" → Nike patike → Odjeća i obuća, subcategory: "Cipele"
- "playstejšn" → PlayStation → Elektronika, subcategory: "Konzole"
- "stan sarajevo" → Stan Sarajevo → Nekretnine, subcategory: "Stanovi i Apartmani"
- "dječja kolica" → Dječja kolica → Djeca i bebe, subcategory: "Oprema za bebe"

Kategorije (koristi TAČNO ove nazive) i primjeri subcategory:
1. Vozila — subcategory = MARKA vozila (npr. "BMW", "Volkswagen", "Audi", "Mercedes-Benz", "Toyota", "Fiat", "Renault", "Škoda", "Opel")
2. Dijelovi za vozila — subcategory = tip dijela (npr. "Felge i gume", "Motor", "Karoserija")
3. Nekretnine — subcategory jedan od: "Stanovi i Apartmani", "Stan na dan", "Kuće", "Poslovni prostori", "Vikendice", "Skladišta i hale", "Sobe", "Zemljišta", "Garaže", "Ostalo"
4. Mobilni uređaji — subcategory = BREND (npr. "Apple", "Samsung", "Huawei", "Xiaomi", "Google", "Sony", "Nokia")
5. Elektronika — subcategory jedan od: "Kompjuteri (Desktop)", "Laptopi", "Monitori / TV", "PC Oprema", "Konzole", "Video Igre", "Gaming Oprema", "Zvučnici / Audio", "Kamere", "Foto Oprema", "Gadgets"
6. Odjeća i obuća — subcategory jedan od: "Ženska moda", "Muška moda", "Dječja odjeća i obuća", "Cipele", "Nakit (Schmuck)", "Accessoires"
7. Dom i vrt — subcategory npr. "Namještaj", "Vrt", "Rasvjeta", "Alati"
8. Sport i rekreacija — subcategory npr. "Fitness", "Biciklizam", "Zimski sportovi", "Planinarenje"
9. Djeca i bebe — subcategory npr. "Oprema za bebe", "Dječje igračke", "Dječja odjeća"
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

    if (action === 'vehicle-series') {
      const { brand, year, fuel, vehicleType: vType } = body;
      if (!brand) return NextResponse.json({ error: 'Marka je obavezna' }, { status: 400 });

      const typeLabels: Record<string, string> = {
        car: 'osobni automobil', motorcycle: 'motocikl', truck: 'kamion/teretno vozilo',
        camper: 'kamper', boat: 'plovilo/čamac', atv: 'ATV/Quad', bicycle: 'bicikl',
      };
      const typeLabel = typeLabels[vType || 'car'] || 'vozilo';

      const prompt = `Napravi listu SVIH modela/baureiha/serija za:
Marka: ${brand}
Tip: ${typeLabel}
Godina: ${year || 'sve godine'}
Gorivo: ${fuel || 'sva goriva'}

Pravila:
- Samo modeli koji su STVARNO proizvedeni za tu godinu i gorivo
- Za automobile: npr. "Serija 1", "Serija 3", "X3", "Golf", "Polo", "A4", "A6"
- Za motocikle: navedi KONKRETNE modele — npr. za Kawasaki: "Z400", "Z650", "Z900", "Z H2", "Ninja 400", "Ninja 650", "Ninja ZX-6R", "Ninja ZX-10R", "Versys 650", "Versys 1000", "Vulcan S", "KLR 650", "KLX 300"
  Za Yamaha: "MT-07", "MT-09", "MT-10", "YZF-R1", "YZF-R6", "YZF-R3", "Tracer 9", "Ténéré 700", "XSR 700"
  Za Honda: "CBR600RR", "CBR1000RR", "CB650R", "CB500F", "Africa Twin", "Gold Wing", "Rebel 500"
  Za BMW: "S 1000 RR", "R 1250 GS", "F 900 R", "G 310 R"
- Za ATV/Quad: navedi KONKRETNE modele — npr. za Polaris: "Sportsman 570", "Sportsman 850", "Scrambler XP 1000", "RZR XP 1000", "Ranger 1000"
  Za Can-Am: "Outlander 650", "Outlander 1000R", "Renegade 850", "Maverick X3"
  Za Yamaha: "Grizzly 700", "Raptor 700", "YFZ450R", "Wolverine RMAX"
  Za CF Moto: "CForce 600", "CForce 1000", "ZForce 950"
- Za kamione: npr. "TGX", "Actros", "FH16"
- Za bicikle: npr. "Marlin 7", "Tarmac SL7", "Fuel EX"
- Sortiraj po popularnosti (najprodavaniji prvi)
- Maksimalno 30 rezultata

Vrati SAMO JSON:
{ "series": [{ "name": "naziv modela/serije", "years": "2018-2024" }] }`;

      const raw = await textWithGemini(prompt);
      const data = parseJsonResponse(raw);
      return NextResponse.json({ success: true, data });
    }

    if (action === 'vehicle-engines') {
      const { brand, series, year, fuel, vehicleType: vType } = body;
      if (!brand || !series) return NextResponse.json({ error: 'Marka i model su obavezni' }, { status: 400 });

      const typeLabels: Record<string, string> = {
        car: 'osobni automobil', motorcycle: 'motocikl', truck: 'kamion/teretno vozilo',
        camper: 'kamper', boat: 'plovilo/čamac', atv: 'ATV/Quad', bicycle: 'bicikl',
      };
      const typeLabel = typeLabels[vType || 'car'] || 'vozilo';

      const prompt = `Napravi listu SVIH motora za:
Marka: ${brand}
Model/Serija: ${series}
Tip: ${typeLabel}
Godina: ${year || 'sve'}
Gorivo: ${fuel || 'sva goriva'}

Pravila:
- Samo motori koji su STVARNO ugrađivani u ovaj model te godine
- Format: naziv motora, snaga u KS, kubikaža
- Za automobile: npr. "2.0 TDI 150 KS", "320d 190 KS", "1.6 HDi 110 KS"
- Za motocikle: navedi KUBIKAŽE i VARIJANTE motora
  Primjeri: za Kawasaki Z900 → "948cc 125 KS", za Z650 → "649cc 68 KS"
  Za Yamaha MT-07 → "689cc 74 KS", za MT-09 → "890cc 119 KS"
  Za Honda CBR600RR → "599cc 120 KS", za CBR1000RR → "999cc 189 KS"
  Ako model ima samo JEDNU varijantu motora, vrati samo tu jednu
- Za ATV/Quad: navedi KUBIKAŽE i VARIJANTE
  Primjeri: za Polaris Sportsman 570 → "567cc 44 KS"
  Za Can-Am Outlander 1000R → "976cc 91 KS"
  Za Yamaha Grizzly 700 → "686cc 48 KS"
- Za kamione: npr. "12.8L D13 460 KS"
- Za bicikle: npr. "Shimano Deore 12-speed", "SRAM GX Eagle" (pogonski sklop umjesto motora)
- Sortiraj po snazi (najslabiji prvi)

Vrati SAMO JSON:
{ "engines": [{ "name": "naziv motora", "power": "XXX KS", "displacement": "X.X L" }] }`;

      const raw = await textWithGemini(prompt);
      const data = parseJsonResponse(raw);
      return NextResponse.json({ success: true, data });
    }

    if (action === 'validate-engine') {
      const { brand, series, year, fuel, engine, vehicleType: vType } = body;

      const prompt = `Provjeri da li ovaj motor postoji za ovo vozilo:
Marka: ${brand}
Model: ${series}
Godina: ${year}
Gorivo: ${fuel}
Motor koji korisnik tvrdi: "${engine}"
Tip: ${vType || 'car'}

Da li je ovo STVARAN motor koji je bio ugrađivan u ovaj model te godine?
Ako nije, predloži najbliži stvarni motor.

Vrati SAMO JSON:
{ "valid": true, "suggestion": "najbliži stvarni motor ako nije validan", "message": "kratko objašnjenje na bosanskom" }`;

      const raw = await textWithGemini(prompt);
      const data = parseJsonResponse(raw);
      return NextResponse.json({ success: true, data });
    }

    if (action === 'vin') {
      const { vin } = body;
      if (!vin || vin.length !== 17) return NextResponse.json({ error: 'VIN mora imati 17 znakova' }, { status: 400 });

      const prompt = `Dekodiraj ovaj VIN (Vehicle Identification Number): "${vin}"

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

    if (action === 'model-details') {
      const { brand, model, vehicleType: vType } = body;
      if (!brand || !model) return NextResponse.json({ error: 'Marka i model su obavezni' }, { status: 400 });

      const prompt = `Za marku "${brand}", model "${model}": Napravi listu SPECIFIČNIH VARIJANTI/OZNAKA ovog modela.

Primjeri:
- BMW "Serija 3" → ["316", "318", "320", "325", "328", "330", "335", "340", "M3"]
- BMW "Serija 5" → ["520", "525", "528", "530", "535", "540", "545", "550", "M5"]
- Mercedes "C-Klasa" → ["C180", "C200", "C220", "C250", "C300", "C350", "C400", "C43 AMG", "C63 AMG"]
- VW "Golf" → ["Golf 1", "Golf 2", "Golf 3", "Golf 4", "Golf 5", "Golf 6", "Golf 7", "Golf 8"]
- Audi "A4" → ["A4 1.4 TFSI", "A4 2.0 TFSI", "A4 2.0 TDI", "A4 3.0 TDI", "S4", "RS4"]
- Kawasaki "Z" → ["Z400", "Z650", "Z900", "Z H2"]
- Honda "CBR" → ["CBR300R", "CBR500R", "CBR600RR", "CBR650R", "CBR1000RR"]

Tip vozila: ${vType || 'car'}

Pravila:
- Samo STVARNE varijante/oznake
- Sortiraj od najmanjeg prema najvećem
- Uključi sve popularne varijante
- Maksimalno 20 rezultata

Vrati SAMO JSON:
{ "details": ["oznaka1", "oznaka2", "oznaka3"] }`;

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
