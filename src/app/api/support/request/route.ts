import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || '');
}

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

    // Send email notification to team
    const categoryLabels: Record<string, string> = {
      bug: 'Prijava greške',
      account: 'Problem s računom',
      listing: 'Problem s oglasom',
      payment: 'Plaćanje / Transakcije',
      suggestion: 'Prijedlog / Feedback',
      other: 'Ostalo',
    };

    try {
      await getResend().emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'NudiNađi Kontakt <onboarding@resend.dev>',
        to: process.env.SUPPORT_EMAIL || 'info@nudinadi.com',
        replyTo: email.trim().toLowerCase(),
        subject: `[${categoryLabels[category] || category}] ${subject.trim()}`,
        html: `
          <h2 style="margin:0 0 16px">Nova poruka sa kontakt forme</h2>
          <table style="border-collapse:collapse;width:100%;max-width:600px;font-family:sans-serif;font-size:14px">
            <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:bold;width:140px">Kategorija</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${categoryLabels[category] || category}</td></tr>
            <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:bold">Ime</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${name.trim()}</td></tr>
            <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:bold">Email</td><td style="padding:8px 12px;border:1px solid #e5e7eb"><a href="mailto:${email.trim()}">${email.trim()}</a></td></tr>
            <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:bold">Predmet</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${subject.trim()}</td></tr>
            <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:bold;vertical-align:top">Poruka</td><td style="padding:8px 12px;border:1px solid #e5e7eb;white-space:pre-wrap">${message.trim()}</td></tr>
            ${userId ? `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:bold">User ID</td><td style="padding:8px 12px;border:1px solid #e5e7eb;font-family:monospace;font-size:12px">${userId}</td></tr>` : '<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:bold">User</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#999">Gast (nicht eingeloggt)</td></tr>'}
          </table>
          <p style="margin-top:16px;font-size:12px;color:#888">Gesendet über NudiNađi Kontaktformular</p>
        `,
      });
    } catch (emailErr) {
      // Email failed but DB insert succeeded — log but don't fail the request
      console.error('[support/request] Email send error:', emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[support/request] Unexpected error:', err);
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 });
  }
}
