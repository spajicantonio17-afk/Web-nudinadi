import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'
import { sendNewMessageEmail, sendProductSoldEmail, sendNewReviewEmail } from '@/lib/email'
import { rateLimit, rateLimitResponse, getIp, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const rl = rateLimit(`email-notify:${getIp(req)}`, RATE_LIMITS.support)
  if (!rl.success) return rateLimitResponse(rl.resetAt)

  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 })
  }

  try {
    const { type, recipientId, productId, rating, comment } = await req.json()
    const admin = await createAdminSupabase()

    if (type === 'new_message') {
      const [recipientAuth, senderProfile, product] = await Promise.all([
        admin.auth.admin.getUserById(recipientId),
        admin.from('profiles').select('username, full_name').eq('id', user.id).single(),
        productId
          ? admin.from('products').select('title').eq('id', productId).single()
          : Promise.resolve(null),
      ])

      const recipientEmail = recipientAuth.data?.user?.email
      if (!recipientEmail) return NextResponse.json({ success: true })

      const senderName = senderProfile.data?.full_name || senderProfile.data?.username || 'Korisnik'
      await sendNewMessageEmail(recipientEmail, senderName, product?.data?.title)
    }

    if (type === 'product_sold') {
      const [recipientAuth, buyerProfile] = await Promise.all([
        admin.auth.admin.getUserById(recipientId),
        admin.from('profiles').select('username, full_name').eq('id', user.id).single(),
      ])
      const recipientEmail = recipientAuth.data?.user?.email
      if (!recipientEmail || !productId) return NextResponse.json({ success: true })

      const { data: product } = await admin.from('products').select('title').eq('id', productId).single()
      const buyerName = buyerProfile.data?.full_name || buyerProfile.data?.username || 'Korisnik'
      await sendProductSoldEmail(recipientEmail, product?.title || 'Artikal', buyerName)
    }

    if (type === 'new_review') {
      const [recipientAuth, reviewerProfile] = await Promise.all([
        admin.auth.admin.getUserById(recipientId),
        admin.from('profiles').select('username, full_name').eq('id', user.id).single(),
      ])
      const recipientEmail = recipientAuth.data?.user?.email
      if (!recipientEmail) return NextResponse.json({ success: true })

      const reviewerName = reviewerProfile.data?.full_name || reviewerProfile.data?.username || 'Korisnik'
      await sendNewReviewEmail(recipientEmail, reviewerName, rating || 5, comment)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[notifications/email] Error:', err)
    return NextResponse.json({ error: 'Greška pri slanju obavijesti.' }, { status: 500 })
  }
}
