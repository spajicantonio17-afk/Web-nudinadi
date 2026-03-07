import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'
import { Resend } from 'resend'
import crypto from 'crypto'
import { rateLimit, rateLimitResponse, getIp, RATE_LIMITS } from '@/lib/rate-limit'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || '')
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(`verify:${getIp(req)}`, RATE_LIMITS.verify)
  if (!rl.success) return rateLimitResponse(rl.resetAt)

  try {
    const body = await req.json()
    const { type } = body as { type: 'email' | 'phone' }

    if (!type || !['email', 'phone'].includes(type)) {
      return NextResponse.json({ error: 'Neispravan tip verifikacije.' }, { status: 400 })
    }

    // Auth check
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 })
    }

    const admin = await createAdminSupabase()

    // Rate limit: max 3 codes per type per hour
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
    const { count: recentCount } = await admin
      .from('verification_codes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('type', type)
      .gte('created_at', oneHourAgo)

    if ((recentCount ?? 0) >= 3) {
      return NextResponse.json({ error: 'Previše pokušaja. Sačekajte malo.' }, { status: 429 })
    }

    // Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString()

    // Store in DB (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    const { error: insertError } = await admin
      .from('verification_codes')
      .insert({
        user_id: user.id,
        type,
        code,
        expires_at: expiresAt,
      })

    if (insertError) {
      console.error('[verify/send-code] DB insert error:', insertError)
      return NextResponse.json({ error: 'Greška pri slanju koda.' }, { status: 500 })
    }

    // Send the code
    if (type === 'email') {
      try {
        await getResend().emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'NudiNađi <onboarding@resend.dev>',
          to: user.email!,
          subject: 'NudiNađi - Verifikacijski kod',
          html: `
            <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:20px">
              <h2 style="margin:0 0 16px;color:#1a1a2e">Verifikacijski kod</h2>
              <p style="color:#666;font-size:14px">Tvoj verifikacijski kod za NudiNađi:</p>
              <div style="background:#f0f4ff;border-radius:12px;padding:20px;text-align:center;margin:20px 0">
                <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#2563eb">${code}</span>
              </div>
              <p style="color:#999;font-size:12px">Kod ističe za 10 minuta. Ako niste zatražili ovaj kod, ignorirajte ovu poruku.</p>
            </div>
          `,
        })
      } catch (emailErr) {
        console.error('[verify/send-code] Email send error:', emailErr)
        return NextResponse.json({ error: 'Greška pri slanju emaila.' }, { status: 500 })
      }
    } else {
      // TODO: SMS-Provider integrieren (Infobip/Twilio)
      // Fetch phone from profile
      const { data: profile } = await admin
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .single()

      // TODO: integrate SMS provider (currently not sending SMS)
    }

    return NextResponse.json({ success: true, message: 'Kod je poslan.' })
  } catch (err) {
    console.error('[verify/send-code] Unexpected error:', err)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
