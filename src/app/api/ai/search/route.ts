import { NextRequest, NextResponse } from 'next/server';
import { textWithGemini, parseJsonResponse, sanitizeForPrompt } from '@/lib/gemini';
import { rateLimit, rateLimitResponse, getIp, RATE_LIMITS } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const rl = rateLimit(`ai:${getIp(req)}`, RATE_LIMITS.ai);
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Upit za pretragu je obavezan' }, { status: 400 });
    }

    const prompt = `Analiziraj ovaj upit za pretragu second-hand marketplace oglasa i izvuci strukturirane informacije.
Upit: "${sanitizeForPrompt(query, 500)}"

Tržište: Bosna i Hercegovina / Hrvatska / Srbija region
Jezik upita može biti: bosanski, hrvatski, srpski, engleski — sa tipfelima ili slengom

Kategorije i potkategorije (koristi TAČNO ova imena za subcategory):
- Vozila: Osobni automobili, Motocikli i skuteri, Teretna vozila, Autobusi i minibusi, Bicikli, Kamper i kamp prikolice, Prikolice, Nautika i plovila
- Dijelovi za automobile: Za automobile – Motor i mjenjač, Za automobile – Karoserija, Za automobile – Unutrašnjost i sjedala, Za automobile – Felge i gume, Za automobile – Tuning i oprema, Za automobile – Navigacija i auto akustika
- Nekretnine: Stanovi, Kuće, Zemljišta, Poslovni prostori, Garaže i parkirna mjesta, Turistički smještaj, Luksuzne nekretnine
- Mobiteli i oprema: Mobiteli – Apple iPhone, Mobiteli – Samsung, Mobiteli – Xiaomi / Redmi / POCO, Mobiteli – Huawei / Honor, Tableti
- Računala i IT: Laptopi, Desktop računala, Monitori, Komponente, Mrežna oprema, Printeri i skeneri
- Tehnika i elektronika: Televizori, Audio oprema, Foto i video oprema, Bijela tehnika, Mali kućanski aparati, Smart home i IoT
- Dom i vrtne garniture: Namještaj – Dnevna soba, Namještaj – Spavaća soba, Namještaj – Kuhinja i blagovaonica, Rasvjeta, Tepisi zavjese i tekstil
- Odjeća i obuća: Ženska odjeća, Ženska obuća, Muška odjeća, Muška obuća, Dječja odjeća i obuća, Nakit i satovi, Torbe novčanici i ruksaci
- Sport i rekreacija: Fitness i teretana, Biciklizam (oprema), Nogomet, Tenis i badminton, Zimski sportovi, Vodeni sportovi, Planinarenje i kampiranje
- Videoigre: PlayStation, Xbox, Nintendo, PC igre, Gaming oprema
- Životinje: Psi, Mačke, Ptice i papige, Ribe i akvaristika
- Strojevi i alati: Ručni alati, Električni alati, Građevinski strojevi, Poljoprivredni strojevi, Vrtni strojevi

LISTING TYPE (samo za Nekretnine):
- Ako korisnik traži "prodaja", "kupiti", "kupovina" → listing_type: "prodaja"
- Ako korisnik traži "najam", "iznajmiti", "zakup", "kirija" → listing_type: "najam"
- Ako korisnik traži "stan na dan", "kratkoročni najam", "dnevni najam" → listing_type: "najam_kratkorocni"
- Ako NE pominje prodaju/najam → listing_type: null (ne pogađaj!)

Zadaci:
1. Ispravi tipfelere i normaliziraj upit
2. Prepoznaj namjeru (kupnja, najam, usluga itd.)
3. Izvuci filtere — PAŽLJIVO razdvoji cijenu, lokaciju i radius!
4. Predloži poboljšane upite za pretragu
5. Izvuci ključne riječi za pretragu (bez filtera, samo termini za product matching)

VAŽNA PRAVILA za razdvajanje cijena vs. radius vs. lokacija:

CIJENA — brojevi uz novčane indikatore:
- "do 5000e", "5000€", "5000 eur", "ispod 5000" → priceMax: 5000, radius: null
- "od 1000 do 5000", "1000-5000" → priceMin: 1000, priceMax: 5000
- "10k", "10.000 KM" → cijena, NE radius
- Ako nema "km" (kilometar) iza broja, onda je to CIJENA!
- VAŽNO: "do X" BEZ "od" ispred = SAMO priceMax! "laptop do 800" → priceMin: null, priceMax: 800
- "under X", "up to X" → SAMO priceMax (NE postavljaj priceMin!)
- "od X do Y" / "from X to Y" = raspon → priceMin: X, priceMax: Y

RADIUS — SAMO kada korisnik EKSPLICITNO pomene udaljenost:
- "30km", "30 km", "u krugu 30km" → radius: 30
- "u blizini" (bez broja) → radius: 20 (default)
- "okolina Sarajeva" → radius: 30 (default)
- NIKADA ne postavljaj radius ako korisnik nije spomenuo km, blizinu ili okolinu!
- Radius MORA biti između 5 i 200. Sve ostalo = null.

LOKACIJA — ime grada/regije:
- "sarajevo", "u sarajevu", "mostar" → location: "Sarajevo"
- Lokacija MOŽE biti bez radiusa (samo grad, bez km)

LOKACIJA — gradovi BiH, HR, Srbija:
- BiH: Sarajevo, Mostar, Banja Luka, Tuzla, Zenica, Brčko, Bihać, Trebinje, Prijedor, Doboj, Bijeljina, Livno, Goražde, Travnik, Visoko, Cazin, Bugojno, Konjic, Stolac, Široki Brijeg, Čapljina, Neum
- HR: Zagreb, Split, Rijeka, Osijek, Zadar, Dubrovnik, Pula, Slavonski Brod, Karlovac, Varaždin, Šibenik, Sisak, Vinkovci, Velika Gorica, Samobor, Koprivnica
- Srbija: Beograd, Novi Sad, Niš, Kragujevac, Subotica, Novi Pazar, Čačak, Zrenjanin, Šabac, Leskovac, Užice, Smederevo, Valjevo, Vranje, Kruševac

Primjeri (KOMPLETNI — category + subcategory + location + attributes + price):
- "stan sarajevo 80m²" → category: "Nekretnine", subcategory: "Stanovi", location: "Sarajevo", attributes: { kvadraturaM2: 80 }
- "BMW 320 dizel automatik do 15000" → category: "Vozila", subcategory: "Osobni automobili", priceMax: 15000, attributes: { marka: "BMW", model: "320", gorivo: "Dizel", mjenjac: "Automatik" }
- "iPhone 15 Pro 256GB" → category: "Mobiteli i oprema", subcategory: "Mobiteli – Apple iPhone", attributes: { memorija: "256GB" }
- "laptop do 800" → category: "Računala i IT", subcategory: "Laptopi", priceMin: null, priceMax: 800
- "stan 3 sobe mostar do 100000" → category: "Nekretnine", subcategory: "Stanovi", location: "Mostar", priceMax: 100000, attributes: { brojSoba: "3" }
- "PS5 igre" → category: "Videoigre", subcategory: "PlayStation"
- "kuća zenica" → category: "Nekretnine", subcategory: "Kuće", location: "Zenica"
- "auto do 5000e" → category: "Vozila", subcategory: "Osobni automobili", priceMax: 5000
- "auto sarajevo 30km" → category: "Vozila", subcategory: "Osobni automobili", radius: 30, location: "Sarajevo"
- "laptop ispod 800 mostar" → category: "Računala i IT", subcategory: "Laptopi", priceMax: 800, location: "Mostar"
- "stan u blizini tuzle do 50000" → category: "Nekretnine", subcategory: "Stanovi", priceMax: 50000, radius: 20, location: "Tuzla"
- "Samsung Galaxy S24" → category: "Mobiteli i oprema", subcategory: "Mobiteli – Samsung"
- "gaming pc" → category: "Računala i IT", subcategory: "Desktop računala"
- "traktor" → category: "Strojevi i alati", subcategory: "Poljoprivredni strojevi"
- "gitara" → category: "Glazba i glazbeni instrumenti", subcategory: "Gitare"
- "stan za najam sarajevo" → category: "Nekretnine", subcategory: "Stanovi", location: "Sarajevo", listing_type: "najam"
- "stan na dan mostar" → category: "Nekretnine", subcategory: "Stanovi", location: "Mostar", listing_type: "najam_kratkorocni"

6. Izvuci kategorie-specifične atribute iz upita (ako su prepoznatljivi)

KATEGORIE-SPECIFIČNI ATRIBUTI — izvuci SAMO one koje si siguran da korisnik traži:

Za Vozila:
- marka (string): BMW, Audi, Mercedes, VW, Toyota, itd.
- model (string): Serija 3, A4, Golf, Corolla, itd.
- gorivo (string): Dizel, Benzin, Benzin + LPG, Hibrid, Plug-in hibrid, Električni, CNG
- mjenjac (string): Ručni, Automatik, Poluautomatik, DSG / DCT
- karoserija (string): Sedan, Karavan, Hatchback, Coupe, Kabriolet, SUV, Crossover, Pickup, Van, Minivan, Limuzina
- boja (string): Crna, Bijela, Siva, Srebrna, Crvena, Plava, Zelena, Narančasta, Zlatna, Smeđa, Bež
- pogon (string): Prednji, Zadnji, 4x4 (stalni), 4x4 (povremeni)
- godiste (number): godina proizvodnje
- km (number): kilometraža

Za Nekretnine:
- brojSoba (string): 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5+
- kvadraturaM2 (number): površina u m²
- grijanje (string): Centralno, Etažno plin, Etažno struja, Na drva, Klima, Podno, Bez
- namjestenost (string): Namješten, Polunamješten, Nenamješten
- kat (string): Prizemlje, 1, 2, 3, 4, 5+

Za Mobitele:
- memorija (string): 16GB, 32GB, 64GB, 128GB, 256GB, 512GB, 1TB

Za Računala:
- ram (string): 4GB, 8GB, 16GB, 32GB, 64GB
- ssd (string): 128GB, 256GB, 512GB, 1TB, 2TB

VAŽNO: Postavi SAMO atribute koje si siguran da su u upitu. Ne pogađaj!
Primjeri:
- "BMW 320 dizel automatik" → attributes: { marka: "BMW", model: "320", gorivo: "Dizel", mjenjac: "Automatik" }
- "BMW" → attributes: { marka: "BMW" } (NE postavljaj model, gorivo itd.)
- "stan 3 sobe" → attributes: { brojSoba: "3" }
- "iPhone 256GB" → attributes: { memorija: "256GB" }

7. Generiraj "searchVariants" — sinonime, alternativne nazive, varijante modela, prijevode.
Ovo je KLJUČNO za pronalaženje proizvoda! Korisnici pretražuju različito od toga kako su oglasi napisani.

PRAVILA za searchVariants:
- Za vozila: dodaj varijante modela (320→3er, serija 3, serie 3, 3 series), tip karoserije na više jezika (Limousine→sedan, limuzina, berlina)
- OBAVEZNO za karoseriju: uvijek dodaj SVE sinonime! Limuzina=Sedan=Limousine=Berlina, Karavan=Kombi=Touring=Estate=Avant, SUV=Crossover=Geländewagen, Hatchback=Kompaktwagen
- Za marke: dodaj alternativne nazive (VW→Volkswagen, Merc→Mercedes, MB→Mercedes-Benz)
- Za kategorije: dodaj sinonime (mobitel→telefon→smartphone→handy, stan→apartman→wohnung)
- Za stanje: dodaj varijante (novo→new→neu, korišteno→used→gebraucht→polovno→rabljeno)
- Za tehničke pojmove: dodaj skraćenice i pune nazive (SSD→solid state drive, RAM→memorija)
- Dodaj i bosanski/hrvatski/srpski i njemačke i engleske varijante ako su relevantne
- Maksimalno 15 varijanti, samo relevantne riječi

Primjeri:
- "BMW 320 Limousine" → searchVariants: ["3er", "serija 3", "serie 3", "sedan", "limuzina", "berlina", "e90", "f30", "g20"]
- "iPhone 15 Pro" → searchVariants: ["apple", "iphone15", "pro max", "smartphone"]
- "stan Sarajevo" → searchVariants: ["apartman", "wohnung", "nekretnina", "stambeni"]
- "Golf 7" → searchVariants: ["volkswagen", "vw", "golf VII", "mk7", "hatchback"]
- "patike Nike" → searchVariants: ["tenisice", "cipele", "sneakers", "sportske", "turnschuhe"]

Vrati SAMO JSON:
{
  "cleanQuery": "ispravljeni upit BEZ filtera (samo ključne riječi za pretragu proizvoda)",
  "intent": "kupnja | prodaja | najam | usluga | info",
  "filters": {
    "category": "naziv kategorije ili null",
    "subcategory": "naziv potkategorije ili null",
    "priceMin": broj_ili_null,
    "priceMax": broj_ili_null,
    "condition": "Novo | Kao novo | Korišteno | null",
    "listing_type": "prodaja | najam | najam_kratkorocni | null (SAMO za Nekretnine!)",
    "location": "naziv grada/regije ili null",
    "radius": broj_km_ili_null_SAMO_AKO_EKSPLICITNO_POMENUTO
  },
  "attributes": {
    "ključ": "vrijednost — SAMO prepoznati atributi, prazan objekt {} ako ništa nije prepoznato"
  },
  "suggestions": ["alternativni upit 1", "alternativni upit 2", "alternativni upit 3"],
  "keywords": ["ključna_riječ_1", "ključna_riječ_2", "ključna_riječ_3"],
  "searchVariants": ["sinonim_1", "varijanta_2", "alternativni_naziv_3"]
}`;

    const raw = await textWithGemini(prompt);
    const data = parseJsonResponse(raw);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    logger.error('[/api/ai/search]', err);
    return NextResponse.json(
      { error: 'Greška pri pretrazi', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
