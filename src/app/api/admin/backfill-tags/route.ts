import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { textWithGemini, parseJsonResponse, sanitizeForPrompt } from '@/lib/gemini'

const BATCH_SIZE = 10
const DELAY_MS = 500 // Delay between AI calls to respect rate limits

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase()

  // Check admin auth
  try {
    const body = await req.json().catch(() => ({}))
    const adminKey = body.adminKey

    // Simple admin key check — must match env variable
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: 'Neovlašteni pristup' }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: 'Neovlašteni pristup' }, { status: 403 })
  }

  // Get products without tags
  const { data: products, error } = await supabase
    .from('products')
    .select('id, title, description, category:categories!category_id(name)')
    .or('tags.is.null,tags.eq.{}')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(BATCH_SIZE)

  if (error) {
    return NextResponse.json({ error: 'Greška pri čitanju proizvoda', details: error.message }, { status: 500 })
  }

  if (!products || products.length === 0) {
    return NextResponse.json({ success: true, message: 'Svi proizvodi imaju tagove', processed: 0, remaining: 0 })
  }

  const results: { id: string; title: string; tags: string[]; error?: string }[] = []

  for (const product of products) {
    try {
      const categoryName = (product.category as { name?: string } | null)?.name || 'nepoznato'

      const prompt = `Generiši relevantne tagove/ključne riječi za oglas na bosanskom/hrvatskom/srpskom jeziku.
Naslov: "${sanitizeForPrompt(product.title, 200)}"
Opis: "${sanitizeForPrompt(product.description || '', 2000)}"
Kategorija: ${sanitizeForPrompt(categoryName, 100)}

Pravila:
- 10-15 tagova
- Kratke fraze (1-3 riječi), sve lowercase
- Uključi sinonime i varijante pisanja (hr/bs/sr)
- Uključi relevantne brendove, modele ako ima smisla
- Uključi stanje, veličinu, boju ako relevantno
- Uključi česte pravopisne greške korisnika
- Uključi engleski naziv ako je poznat brend

Vrati SAMO JSON: {"tags": ["tag1", "tag2", "tag3", ...]}`

      const raw = await textWithGemini(prompt)
      const data = parseJsonResponse(raw) as { tags?: string[] }

      let tags: string[] = []
      if (Array.isArray(data.tags)) {
        tags = [...new Set(
          data.tags
            .map((t: string) => String(t).toLowerCase().trim())
            .filter((t: string) => t.length > 0 && t.length <= 50)
        )].slice(0, 20)
      }

      // Update product with tags (trigger will auto-rebuild search_vector)
      const { error: updateError } = await supabase
        .from('products')
        .update({ tags })
        .eq('id', product.id)

      if (updateError) {
        results.push({ id: product.id, title: product.title, tags: [], error: updateError.message })
      } else {
        results.push({ id: product.id, title: product.title, tags })
      }
    } catch (err) {
      results.push({
        id: product.id,
        title: product.title,
        tags: [],
        error: err instanceof Error ? err.message : 'Nepoznata greška',
      })
    }

    // Rate limit delay
    await sleep(DELAY_MS)
  }

  // Count remaining products without tags
  const { count: remaining } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .or('tags.is.null,tags.eq.{}')
    .eq('status', 'active')

  return NextResponse.json({
    success: true,
    processed: results.length,
    successful: results.filter(r => !r.error).length,
    failed: results.filter(r => r.error).length,
    remaining: remaining ?? 0,
    results,
  })
}
