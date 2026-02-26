import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server';

const VALID_CATEGORIES = ['bug', 'account', 'listing', 'payment', 'suggestion', 'other'] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, name, email, subject, message, screenshotUrl } = body;

    // Validate required fields
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Odaberite kategoriju.' }, { status: 400 });
    }
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Ime mora imati najmanje 2 znaka.' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Unesite ispravan email.' }, { status: 400 });
    }
    if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
      return NextResponse.json({ error: 'Predmet mora imati najmanje 3 znaka.' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json({ error: 'Poruka mora imati najmanje 10 znakova.' }, { status: 400 });
    }

    // Try to get authenticated user (optional — guests can also submit)
    let userId: string | null = null;
    try {
      const supabase = await createServerSupabase();
      const result = await Promise.race([
        supabase.auth.getUser(),
        new Promise<null>(resolve => setTimeout(() => resolve(null), 5000)),
      ]);
      if (result && 'data' in result && result.data?.user) {
        userId = result.data.user.id;
      }
    } catch {
      // Auth check failed — continue as guest
    }

    // Insert with admin client (bypasses RLS)
    const admin = await createAdminSupabase();
    const { error } = await admin
      .from('support_requests')
      .insert({
        user_id: userId,
        category: category.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        screenshot_url: screenshotUrl || null,
      });

    if (error) {
      console.error('[support/request] DB insert error:', error);
      return NextResponse.json({ error: 'Greška pri slanju. Pokušajte ponovo.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[support/request] Unexpected error:', err);
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 });
  }
}
