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
3. Izvuci filtere (kategorija, cijena, stanje, lokacija)
4. Predloži poboljšane upite za pretragu

Vrati SAMO JSON:
{
  "cleanQuery": "ispravljeni i normalizirani upit",
  "intent": "kupnja | prodaja | najam | usluga | info",
  "filters": {
    "category": "naziv kategorije ili null",
    "subcategory": "naziv potkategorije ili null",
    "priceMin": broj_ili_null,
    "priceMax": broj_ili_null,
    "condition": "Novo | Kao novo | Korišteno | null",
    "location": "naziv grada/regije ili null"
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
