import { Resend } from 'resend'

let resendInstance: Resend | null = null

function getResend(): Resend {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY || '')
  }
  return resendInstance
}

const FROM = process.env.RESEND_FROM_EMAIL || 'NudiNađi <onboarding@resend.dev>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nudinadi.com'

function wrapTemplate(content: string): string {
  return `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:12px">
      <div style="text-align:center;margin-bottom:20px">
        <h1 style="font-size:20px;color:#1a1a2e;margin:0">NudiNađi</h1>
      </div>
      ${content}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 12px"/>
      <p style="color:#999;font-size:11px;text-align:center">
        Ovo je automatska poruka sa NudiNađi. Ne odgovarajte na ovaj email.
      </p>
    </div>
  `
}

export async function sendNewMessageEmail(to: string, senderName: string, productTitle?: string): Promise<void> {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Nova poruka od ${senderName}`,
    html: wrapTemplate(`
      <h2 style="margin:0 0 12px;color:#1a1a2e">Nova poruka</h2>
      <p style="color:#444;font-size:14px">${senderName} vam je poslao/la poruku${productTitle ? ` u vezi oglasa <strong>${productTitle}</strong>` : ''}.</p>
      <a href="${APP_URL}/messages" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:14px;margin-top:12px">Pogledaj poruku</a>
    `),
  })
}

export async function sendProductSoldEmail(to: string, productTitle: string, buyerName: string): Promise<void> {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Artikal prodan: ${productTitle}`,
    html: wrapTemplate(`
      <h2 style="margin:0 0 12px;color:#1a1a2e">Artikal prodan!</h2>
      <p style="color:#444;font-size:14px">Vaš artikal <strong>${productTitle}</strong> je uspješno prodan korisniku <strong>${buyerName}</strong>.</p>
      <p style="color:#666;font-size:13px">Čestitamo na prodaji!</p>
    `),
  })
}

export async function sendNewReviewEmail(to: string, reviewerName: string, rating: number, comment?: string): Promise<void> {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Nova recenzija od ${reviewerName}`,
    html: wrapTemplate(`
      <h2 style="margin:0 0 12px;color:#1a1a2e">Nova recenzija</h2>
      <p style="color:#444;font-size:14px">${reviewerName} vam je ostavio/la recenziju:</p>
      <div style="background:#f0f4ff;border-radius:8px;padding:16px;margin:12px 0;text-align:center">
        <span style="font-size:24px;color:#f59e0b">${stars}</span>
        ${comment ? `<p style="color:#555;font-size:13px;margin:8px 0 0">"${comment}"</p>` : ''}
      </div>
    `),
  })
}

export async function sendPromotionSuccessEmail(to: string, productTitle: string, until: string): Promise<void> {
  const date = new Date(until).toLocaleDateString('bs-BA', { day: 'numeric', month: 'long', year: 'numeric' })
  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Oglas promoviran: ${productTitle}`,
    html: wrapTemplate(`
      <h2 style="margin:0 0 12px;color:#1a1a2e">Oglas promoviran!</h2>
      <p style="color:#444;font-size:14px">Vaš oglas <strong>${productTitle}</strong> je uspješno promoviran do <strong>${date}</strong>.</p>
      <p style="color:#666;font-size:13px">Vaš oglas će se sada prikazivati na vrhu rezultata pretrage.</p>
    `),
  })
}

export async function sendAccountWarningEmail(to: string, reason: string): Promise<void> {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: 'Upozorenje za vaš račun - NudiNađi',
    html: wrapTemplate(`
      <h2 style="margin:0 0 12px;color:#dc2626">Upozorenje</h2>
      <p style="color:#444;font-size:14px">Vaš račun je dobio upozorenje:</p>
      <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px;margin:12px 0;border-radius:4px">
        <p style="color:#7f1d1d;font-size:14px;margin:0">${reason}</p>
      </div>
      <p style="color:#666;font-size:13px">Molimo pridržavajte se pravila korištenja platforme.</p>
    `),
  })
}

export async function sendAccountBanEmail(to: string, reason: string, expiresAt?: string): Promise<void> {
  const expiry = expiresAt
    ? `do ${new Date(expiresAt).toLocaleDateString('bs-BA', { day: 'numeric', month: 'long', year: 'numeric' })}`
    : 'trajno'
  await getResend().emails.send({
    from: FROM,
    to,
    subject: 'Vaš račun je suspendiran - NudiNađi',
    html: wrapTemplate(`
      <h2 style="margin:0 0 12px;color:#dc2626">Račun suspendiran</h2>
      <p style="color:#444;font-size:14px">Vaš račun na NudiNađi je suspendiran <strong>${expiry}</strong>.</p>
      <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px;margin:12px 0;border-radius:4px">
        <p style="color:#7f1d1d;font-size:14px;margin:0">Razlog: ${reason}</p>
      </div>
      <p style="color:#666;font-size:13px">Ako smatrate da je ovo greška, kontaktirajte nas na info@nudinadi.com.</p>
    `),
  })
}
