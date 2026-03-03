import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, code } = body as { type: 'email' | 'phone'; code: string }

    if (!type || !['email', 'phone'].includes(type)) {
      return NextResponse.json({ error: 'Neispravan tip verifikacije.' }, { status: 400 })
    }

    if (!code || typeof code !== 'string' || code.length !== 6) {
      return NextResponse.json({ error: 'Kod mora biti 6 cifara.' }, { status: 400 })
    }

    // Auth check
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 })
    }

    const admin = await createAdminSupabase()

    // Find the latest unused code for this user + type
    const { data: verificationCode, error: fetchError } = await admin
      .from('verification_codes')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', type)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fetchError || !verificationCode) {
      return NextResponse.json({ error: 'Nema aktivnog koda. Pošaljite novi.' }, { status: 400 })
    }

    // Check if expired
    if (new Date(verificationCode.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Kod je istekao. Pošaljite novi.' }, { status: 400 })
    }

    // Check attempts
    if (verificationCode.attempts >= 5) {
      // Invalidate the code
      await admin
        .from('verification_codes')
        .update({ used: true })
        .eq('id', verificationCode.id)

      return NextResponse.json({ error: 'Previše pokušaja. Pošaljite novi kod.' }, { status: 400 })
    }

    // Check code
    if (verificationCode.code !== code) {
      // Increment attempts
      await admin
        .from('verification_codes')
        .update({ attempts: verificationCode.attempts + 1 })
        .eq('id', verificationCode.id)

      return NextResponse.json({
        error: 'Pogrešan kod. Pokušajte ponovo.',
        attemptsLeft: 4 - verificationCode.attempts,
      }, { status: 400 })
    }

    // Code is correct — mark as used
    await admin
      .from('verification_codes')
      .update({ used: true })
      .eq('id', verificationCode.id)

    // Update profile
    const updateField = type === 'email' ? 'email_verified' : 'phone_verified'
    const { error: updateError } = await admin
      .from('profiles')
      .update({ [updateField]: true })
      .eq('id', user.id)

    if (updateError) {
      console.error('[verify/confirm] Profile update error:', updateError)
      return NextResponse.json({ error: 'Greška pri ažuriranju profila.' }, { status: 500 })
    }

    // Award XP (500 XP one-time for verification)
    // Check if both email and phone are now verified
    const { data: profile } = await admin
      .from('profiles')
      .select('email_verified, phone_verified')
      .eq('id', user.id)
      .single()

    if (profile?.email_verified || profile?.phone_verified) {
      // Log verification activity for XP (levelService handles one-time check)
      try {
        const { logVerificationXp } = await import('@/services/levelService')
        await logVerificationXp(user.id)
      } catch {
        // Non-critical — XP will be awarded on next check
      }
    }

    return NextResponse.json({ success: true, message: 'Uspješno verificirano!' })
  } catch (err) {
    console.error('[verify/confirm] Unexpected error:', err)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
