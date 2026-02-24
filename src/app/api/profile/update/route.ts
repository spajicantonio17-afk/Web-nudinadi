import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, full_name, bio, location, avatar_url, phone } = body

    // 1. Authenticate — with 5s timeout so it never hangs
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
      // auth check failed — will be caught below
    }

    if (!userId) {
      return NextResponse.json({ error: 'Nisi prijavljen.' }, { status: 401 })
    }

    // 2. Use admin client for the update (bypasses RLS — no more hanging)
    const admin = await createAdminSupabase()

    // 3. Validate username if provided
    if (username !== undefined) {
      if (typeof username !== 'string' || username.length < 3) {
        return NextResponse.json({ error: 'Username mora imati min. 3 znaka.' }, { status: 400 })
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return NextResponse.json({ error: 'Samo slova, brojevi i _.' }, { status: 400 })
      }

      const { data: existing } = await admin
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', userId)
        .maybeSingle()

      if (existing) {
        return NextResponse.json({ error: 'Username je zauzet.' }, { status: 409 })
      }
    }

    // 4. Build update object
    const updates: Record<string, string | null> = {}
    if (username !== undefined) updates.username = username
    if (full_name !== undefined) updates.full_name = full_name
    if (bio !== undefined) updates.bio = bio
    if (location !== undefined) updates.location = location
    if (avatar_url !== undefined) updates.avatar_url = avatar_url
    if (phone !== undefined) updates.phone = phone

    // 5. Update with admin client (no RLS)
    const { data, error } = await admin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Profile update DB error:', error)
      return NextResponse.json({ error: error.message || 'Greška pri ažuriranju.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (err) {
    console.error('Profile update route error:', err)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
