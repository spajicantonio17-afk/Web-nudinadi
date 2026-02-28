import { NextResponse } from 'next/server';
import { textWithGemini, parseJsonResponse, sanitizeForPrompt } from '@/lib/gemini';

/**
 * POST /api/ai/resolve-item
 *
 * Resolves the deepest category item using Gemini Flash.
 * Called as a fallback when regex/stemming scoring is uncertain.
 *
 * Body: { title: string, description?: string, subcategory: string, items: string[] }
 * Returns: { success: true, item: string } or { success: false }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, subcategory, items } = body as {
      title: string;
      description?: string;
      subcategory: string;
      items: string[];
    };

    if (!title || !subcategory || !items?.length) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const itemsList = items.map((item: string, i: number) => `${i + 1}. ${item}`).join('\n');
    const desc = description ? `\nOpis: ${sanitizeForPrompt(description, 500)}` : '';

    const prompt = `Ti si sistem za kategorizaciju proizvoda na marketplace-u.

Naslov oglasa: ${sanitizeForPrompt(title, 300)}${desc}
Podkategorija: ${subcategory}

Moguće stavke u ovoj podkategoriji:
${itemsList}

Koji broj (1-${items.length}) najbolje odgovara ovom proizvodu?
Odgovori SAMO JSON: {"item_index": BROJ}`;

    const raw = await textWithGemini(prompt);
    const parsed = parseJsonResponse(raw) as { item_index?: number } | null;

    if (parsed?.item_index && parsed.item_index >= 1 && parsed.item_index <= items.length) {
      return NextResponse.json({ success: true, item: items[parsed.item_index - 1] });
    }

    // Fallback: try to extract a number from the raw response
    const numMatch = raw.match(/(\d+)/);
    if (numMatch) {
      const idx = parseInt(numMatch[1], 10);
      if (idx >= 1 && idx <= items.length) {
        return NextResponse.json({ success: true, item: items[idx - 1] });
      }
    }

    return NextResponse.json({ success: false, error: 'AI could not determine item' });
  } catch (err) {
    console.error('[/api/ai/resolve-item] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
