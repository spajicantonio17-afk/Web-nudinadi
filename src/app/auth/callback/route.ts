import { NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'

function getSafeRedirect(raw: string | null): string {
  const path = raw || '/'
  try {
    const url = new URL(path, 'http://n')
    if (url.host !== 'n') return '/'
    return url.pathname + url.search
  } catch {
    return '/'
  }
}

// Handles OAuth callback (Google, Facebook) and email confirmation
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = getSafeRedirect(searchParams.get('redirect'))

  // Detect email confirmation via token_hash + type
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (tokenHash && type === 'email') {
    // Email verification link clicked
    const supabase = await createServerSupabase()
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'email' })

    if (!error) {
      // Mark profile as email_verified
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const admin = await createAdminSupabase()
        await admin
          .from('profiles')
          .update({ email_verified: true })
          .eq('id', user.id)
      }
      return NextResponse.redirect(`${origin}/profile?verified=1`)
    }

    return NextResponse.redirect(`${origin}/login?error=verification_failed`)
  }

  // Standard OAuth code exchange
  if (code) {
    const supabase = await createServerSupabase()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${redirect}`)
    }
  }

  // Auth error - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
