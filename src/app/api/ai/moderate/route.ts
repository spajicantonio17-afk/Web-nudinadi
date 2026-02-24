import { NextRequest, NextResponse } from 'next/server';
import { textWithGemini, parseJsonResponse } from '@/lib/gemini';
import { createClient } from '@supabase/supabase-js';

// Auto-log AI results + auto-flag to moderation_reports if needed
async function logAiResult(action: string, inputData: Record<string, unknown>, resultData: Record<string, unknown>, startTime: number) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return;

  const supabase = createClient(supabaseUrl, serviceKey);
  const score = typeof resultData.score === 'number' ? resultData.score :
    typeof resultData.confidence === 'number' ? resultData.confidence : null;
  const isFlagged = (score !== null && score < 50) || resultData.isBlocked === true || resultData.isDuplicate === true;

  const productId = typeof inputData.productId === 'string' ? inputData.productId : null;
  const userId = typeof inputData.userId === 'string' ? inputData.userId : null;

  // Log to ai_moderation_logs
  await supabase.from('ai_moderation_logs').insert({
    product_id: productId,
    user_id: userId,
    action,
    input_data: inputData,
    result_data: resultData,
    score,
    is_flagged: isFlagged,
    processing_time_ms: Date.now() - startTime,
  });

  // Auto-create moderation report if flagged
  if (isFlagged && productId) {
    const reason = resultData.isBlocked ? 'prohibited_content' :
      resultData.isDuplicate ? 'duplicate' : 'scam';
    const description = typeof resultData.reason === 'string' ? resultData.reason :
      Array.isArray(resultData.warnings) && resultData.warnings.length > 0 ? (resultData.warnings as string[]).join('; ') :
      Array.isArray(resultData.blockedReasons) && resultData.blockedReasons.length > 0 ? (resultData.blockedReasons as string[]).join('; ') :
      'AI auto-flag';
    const priority = resultData.isBlocked ? 3 : score !== null && score < 30 ? 2 : 1;

    await supabase.from('moderation_reports').insert({
      product_id: productId,
      reported_user_id: userId,
      reporter_id: null,
      reason,
      description: `AI ${action}: ${description}`,
      ai_moderation_result: resultData,
      ai_score: score,
      status: 'pending',
      priority,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, title, description, price, category, userId, images, productId } = body;
    const startTime = Date.now();

    if (!action) {
      return NextResponse.json({ error: 'Akcija je obavezna' }, { status: 400 });
    }

    if (action === 'duplicate') {
      if (!title) return NextResponse.json({ error: 'Naslov je obavezan' }, { status: 400 });

      const prompt = `Provjeri da li je ovaj oglas duplicirani oglas koji se često objavljuje na marketplaceu.
Naslov: "${title}"
Kategorija: ${category || 'nepoznato'}
Opis: "${description || ''}"

Procijeni:
1. Da li izgleda kao oglas koji se mogao već vidjeti (generički, spam, prevara)?
2. Da li je naslov pregenericni za duplicate pretragu?

Vrati SAMO JSON:
{
  "isDuplicate": true | false,
  "confidence": broj_0_100,
  "reason": "razlog procjene na bosanskom/hrvatskom",
  "recommendation": "Objavi | Provjeri | Blokiraj"
}`;

      const raw = await textWithGemini(prompt);
      const data = parseJsonResponse(raw) as Record<string, unknown>;

      // Auto-log
      logAiResult('duplicate', { title, category, description, productId, userId }, data, startTime).catch(console.error);

      return NextResponse.json({ success: true, data });
    }

    if (action === 'moderate') {
      if (!title) return NextResponse.json({ error: 'Naslov je obavezan' }, { status: 400 });

      const prompt = `Moderiran oglas za second-hand marketplace. Provjeri da li je oglas siguran za objavu.
Naslov: "${title}"
Opis: "${description || '(nema opisa)'}"
Cijena: ${price ? price + ' KM' : '(nije navedena)'}
Kategorija: ${category || 'nepoznato'}
Broj slika: ${images || 0}

Provjeri na:
1. Prevare i lažne ponude (preniski cijena, phishing, advance-fee fraud)
2. Zabranjeni sadržaj (oružje, droge, ilegalne usluge)
3. Lični podaci u opisu (IBAN, broj kartice, lozinka)
4. Spam i reklamni sadržaj
5. Preopćeniti opis koji ne opisuje stvarni artikl
6. Neadekvatna cijena za kategoriju

Vrati SAMO JSON:
{
  "score": broj_0_100,
  "isBlocked": true | false,
  "level": "Bezbedan | Upozorenje | Opasan",
  "warnings": ["upozorenje 1", "upozorenje 2"],
  "blockedReasons": ["razlog blokade 1"],
  "recommendation": "Objavi | Provjeri | Blokiraj"
}`;

      const raw = await textWithGemini(prompt);
      const data = parseJsonResponse(raw) as Record<string, unknown>;

      // Auto-log
      logAiResult('moderate', { title, description, price, category, images, productId, userId }, data, startTime).catch(console.error);

      return NextResponse.json({ success: true, data });
    }

    if (action === 'trust') {
      const {
        totalListings = 0,
        successfulSales = 0,
        rating = 0,
        reviewCount = 0,
        accountAgeDays = 0,
        hasAvatar = false,
        hasPhone = false,
        hasEmail = false,
      } = body;

      const prompt = `Izračunaj Trust Score za korisnika second-hand marketplace platforme.
Podaci o korisniku:
- Ukupno oglasa: ${totalListings}
- Uspješnih prodaja: ${successfulSales}
- Prosječna ocjena: ${rating}/5
- Broj recenzija: ${reviewCount}
- Starost računa (dani): ${accountAgeDays}
- Ima profilnu sliku: ${hasAvatar}
- Ima verificiran telefon: ${hasPhone}
- Ima verificiran email: ${hasEmail}
${userId ? `- User ID: ${userId}` : ''}

Izračunaj Trust Score i objasni procjenu.

Vrati SAMO JSON:
{
  "score": broj_0_100,
  "level": "Novi korisnik | Početnik | Pouzdан | Provjereni prodavač | Elitni prodavač",
  "badge": "emoji_i_naziv_badgea",
  "breakdown": {
    "activity": broj_0_100,
    "reputation": broj_0_100,
    "verification": broj_0_100,
    "history": broj_0_100
  },
  "strengths": ["prednost 1", "prednost 2"],
  "improvements": ["poboljšanje 1", "poboljšanje 2"]
}`;

      const raw = await textWithGemini(prompt);
      const data = parseJsonResponse(raw) as Record<string, unknown>;

      // Auto-log
      logAiResult('trust', { totalListings, successfulSales, rating, reviewCount, accountAgeDays, hasAvatar, hasPhone, hasEmail, userId }, data, startTime).catch(console.error);

      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: 'Nepoznata akcija' }, { status: 400 });
  } catch (err) {
    console.error('[/api/ai/moderate]', err);
    return NextResponse.json(
      { error: 'Greška pri moderaciji', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
