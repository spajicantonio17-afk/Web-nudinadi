import { NextRequest, NextResponse } from 'next/server';
import { textWithGemini, parseJsonResponse, sanitizeForPrompt } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Upit za pretragu je obavezan' }, { status: 400 });
    }

    const prompt = `Analiziraj ovaj upit za pretragu second-hand marketplace oglasa i izvuci strukturirane informacije.
Upit: "${sanitizeForPrompt(query, 500)}"

Tržište: Bosna i Hercegovina / Hrvatska / Srbija region
Jezik upita može biti: bosanski, hrvatski, srpski, sa tipfelima ili slengom

Kategorije: Vozila, Dijelovi za vozila, Nekretnine, Mobiteli i telekomunikacija, Računala i oprema, Tehnika i elektronika, Dom i vrt, Odjeća i obuća, Sport i rekreacija, Dječji kutak, Glazbeni instrumenti, Literatura i edukacija, Video igre i konzole, Životinje, Hrana i piće, Strojevi i alati, Poslovi i zapošljavanje, Usluge, Umjetnost i antikviteti, Ostalo

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

RADIUS — SAMO kada korisnik EKSPLICITNO pomene udaljenost:
- "30km", "30 km", "u krugu 30km" → radius: 30
- "u blizini" (bez broja) → radius: 20 (default)
- "okolina Sarajeva" → radius: 30 (default)
- NIKADA ne postavljaj radius ako korisnik nije spomenuo km, blizinu ili okolinu!
- Radius MORA biti između 5 i 200. Sve ostalo = null.

LOKACIJA — ime grada/regije:
- "sarajevo", "u sarajevu", "mostar" → location: "Sarajevo"
- Lokacija MOŽE biti bez radiusa (samo grad, bez km)

Primjeri:
- "auto do 5000e" → priceMax: 5000, radius: null, location: null
- "auto sarajevo" → priceMax: null, radius: null, location: "Sarajevo"
- "auto sarajevo 30km" → priceMax: null, radius: 30, location: "Sarajevo"
- "auto do 5000e sarajevo 30km" → priceMax: 5000, radius: 30, location: "Sarajevo"
- "laptop ispod 800 mostar" → priceMax: 800, radius: null, location: "Mostar"
- "stan u blizini tuzle do 50000" → priceMax: 50000, radius: 20, location: "Tuzla"

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
    "location": "naziv grada/regije ili null",
    "radius": broj_km_ili_null_SAMO_AKO_EKSPLICITNO_POMENUTO
  },
  "attributes": {
    "ključ": "vrijednost — SAMO prepoznati atributi, prazan objekt {} ako ništa nije prepoznato"
  },
  "suggestions": ["alternativni upit 1", "alternativni upit 2", "alternativni upit 3"],
  "keywords": ["ključna_riječ_1", "ključna_riječ_2", "ključna_riječ_3"]
}`;

    const raw = await textWithGemini(prompt);
    const data = parseJsonResponse(raw);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[/api/ai/search]', err);
    return NextResponse.json(
      { error: 'Greška pri pretrazi', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
