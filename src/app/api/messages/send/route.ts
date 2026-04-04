import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'
import { rateLimit, rateLimitResponse, getIp } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function POST(req: NextRequest) {
  const rl = rateLimit(`msg:${getIp(req)}`, { limit: 60, windowSeconds: 60 })
  if (!rl.success) return rateLimitResponse(rl.resetAt)

  try {
    // 1. Authenticate
    let userId: string | null = null
    try {
      const supabase = await createServerSupabase()
      const result = await Promise.race([
        supabase.auth.getUser(),
        new Promise<null>(resolve => setTimeout(() => resolve(null), 5000)),
      ])
      if (result && 'data' in result && result.data?.user) {
        userId = result.data.user.id
      }
    } catch {
      // auth check failed
    }

    if (!userId) {
      return NextResponse.json({ error: 'Nisi prijavljen.' }, { status: 401 })
    }

    // 2. Parse body
    const { conversation_id, content, image_url } = await req.json()

    if (!conversation_id) {
      return NextResponse.json({ error: 'Nedostaje conversation_id.' }, { status: 400 })
    }
    if (!content && !image_url) {
      return NextResponse.json({ error: 'Poruka je prazna.' }, { status: 400 })
    }

    // 3. Verify user is a participant in this conversation
    const admin = await createAdminSupabase()
    const { data: conv, error: convError } = await admin
      .from('conversations')
      .select('id, user1_id, user2_id')
      .eq('id', conversation_id)
      .single()

    if (convError || !conv) {
      return NextResponse.json({ error: 'Razgovor nije pronađen.' }, { status: 404 })
    }

    if (conv.user1_id !== userId && conv.user2_id !== userId) {
      return NextResponse.json({ error: 'Nemate pristup ovom razgovoru.' }, { status: 403 })
    }

    // 4. Insert message via admin client (bypasses RLS)
    const { data: message, error: insertError } = await admin
      .from('messages')
      .insert({
        conversation_id,
        sender_id: userId,
        content: content || null,
        image_url: image_url || null,
      })
      .select()
      .single()

    if (insertError) {
      logger.error('Failed to insert message:', insertError)
      return NextResponse.json({ error: 'Greška pri slanju poruke.' }, { status: 500 })
    }

    // 5. Update conversation last_message_at
    await admin
      .from('conversations')
      .update({ last_message_at: message.created_at })
      .eq('id', conversation_id)

    return NextResponse.json(message)
  } catch (err) {
    logger.error('Unexpected error in messages/send:', err)
    return NextResponse.json({ error: 'Greška servera.' }, { status: 500 })
  }
}
