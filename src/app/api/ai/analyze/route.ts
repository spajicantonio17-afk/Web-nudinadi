import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageWithGemini, parseJsonResponse } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'full', image, mimeType = 'image/jpeg' } = body;

    if (!image) {
      return NextResponse.json({ error: 'Slika je obavezna' }, { status: 400 });
    }

    if (action === 'full') {
      // Full photo analysis: detect category, brand, model, generate title/description
      const prompt = `Analiziraj ovu sliku i vrati SAMO JSON objekt (bez markdown, bez objašnjenja) u ovom formatu:
{
  "category": "naziv kategorije na hrvatskom/bosanskom",
  "subcategory": "naziv potkategorije",
  "brand": "marka/brend (ili null ako nije vidljivo)",
  "model": "model (ili null ako nije vidljivo)",
  "title": "kratki oglas naslov (max 60 znakova) na bosanskom/hrvatskom",
  "description": "detaljan opis za oglas (2-4 rečenice) na bosanskom/hrvatskom",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "priceEstimate": { "min": broj, "max": broj, "currency": "KM" },
  "condition": "Novo | Kao novo | Korišteno",
  "confidence": broj_od_0_do_100
}

Kategorije: Vozila, Dijelovi za vozila, Nekretnine, Mobiteli i telekomunikacija, Računala i oprema, Tehnika i elektronika, Dom i vrt, Odjeća i obuća, Sport i rekreacija, Dječji kutak, Glazbeni instrumenti, Literatura i edukacija, Video igre i konzole, Životinje, Hrana i piće, Strojevi i alati, Poslovi i zapošljavanje, Usluge, Umjetnost i antikviteti, Ostalo

Odgovori SAMO JSON, ništa drugo.`;

      const raw = await analyzeImageWithGemini(image, mimeType, prompt);
      const data = parseJsonResponse(raw);
      return NextResponse.json({ success: true, data });
    }

    if (action === 'ocr') {
      // OCR for auto parts: read part number, find compatible vehicles
      const prompt = `Pogledaj ovu sliku auto dijela ili naljepnice s brojem dijela. Vrati SAMO JSON objekt:
{
  "partNumber": "broj dijela koji vidiš (ili null)",
  "partName": "naziv dijela na bosanskom/hrvatskom",
  "manufacturer": "proizvođač (ili null)",
  "compatibleVehicles": ["Vozilo 1 (npr. VW Golf 4 1.9 TDI 1998-2004)", "Vozilo 2"],
  "description": "kratki opis dijela i čemu služi",
  "confidence": broj_od_0_do_100
}

Ako ne možeš pročitati broj dijela, pokušaj identificirati vrstu dijela i kompatibilnost po izgledu.
Odgovori SAMO JSON.`;

      const raw = await analyzeImageWithGemini(image, mimeType, prompt);
      const data = parseJsonResponse(raw);
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: 'Nepoznata akcija' }, { status: 400 });
  } catch (err) {
    console.error('[/api/ai/analyze]', err);
    return NextResponse.json(
      { error: 'Greška pri analizi slike', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
