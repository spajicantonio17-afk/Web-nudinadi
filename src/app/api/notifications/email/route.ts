import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'
import { sendNewMessageEmail, sendProductSoldEmail, sendNewReviewEmail, sendNewFavoriteEmail, sendNewFollowerEmail } from '@/lib/email'
import { rateLimit, rateLimitResponse, getIp, RATE_LIMITS } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

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

    const getRecipientProfile = async (id: string) => {
      const { data } = await admin
        .from('profiles')
        .select('email_notif_messages, email_notif_sold, email_notif_follower, email_notif_favorite, account_type, username, full_name')
        .eq('id', id)
        .single()
      return data
    }

    if (type === 'new_message') {
      const [recipientAuth, recipientProfile, senderProfile, product] = await Promise.all([
        admin.auth.admin.getUserById(recipientId),
        getRecipientProfile(recipientId),
        admin.from('profiles').select('username, full_name').eq('id', user.id).single(),
        productId
          ? admin.from('products').select('title').eq('id', productId).single()
          : Promise.resolve(null),
      ])
      if (recipientProfile?.email_notif_messages === false) return NextResponse.json({ success: true })
      const recipientEmail = recipientAuth.data?.user?.email
      if (!recipientEmail) return NextResponse.json({ success: true })
      const senderName = senderProfile.data?.full_name || senderProfile.data?.username || 'Korisnik'
      await sendNewMessageEmail(recipientEmail, senderName, product?.data?.title)
    }

    if (type === 'product_sold') {
      const [recipientAuth, recipientProfile, buyerProfile] = await Promise.all([
        admin.auth.admin.getUserById(recipientId),
        getRecipientProfile(recipientId),
        admin.from('profiles').select('username, full_name').eq('id', user.id).single(),
      ])
      if (recipientProfile?.email_notif_sold === false) return NextResponse.json({ success: true })
      const recipientEmail = recipientAuth.data?.user?.email
      if (!recipientEmail || !productId) return NextResponse.json({ success: true })
      const { data: product } = await admin.from('products').select('title').eq('id', productId).single()
      const buyerName = buyerProfile.data?.full_name || buyerProfile.data?.username || 'Korisnik'
      await sendProductSoldEmail(recipientEmail, product?.title || 'Artikal', buyerName)
    }

    if (type === 'new_review') {
      const [recipientAuth, recipientProfile, reviewerProfile] = await Promise.all([
        admin.auth.admin.getUserById(recipientId),
        getRecipientProfile(recipientId),
        admin.from('profiles').select('username, full_name').eq('id', user.id).single(),
      ])
      if (recipientProfile?.email_notif_messages === false) return NextResponse.json({ success: true })
      const recipientEmail = recipientAuth.data?.user?.email
      if (!recipientEmail) return NextResponse.json({ success: true })
      const reviewerName = reviewerProfile.data?.full_name || reviewerProfile.data?.username || 'Korisnik'
      await sendNewReviewEmail(recipientEmail, reviewerName, rating || 5, comment)
    }

    if (type === 'new_favorite') {
      const [recipientAuth, recipientProfile, likerProfile, product] = await Promise.all([
        admin.auth.admin.getUserById(recipientId),
        getRecipientProfile(recipientId),
        admin.from('profiles').select('username, full_name').eq('id', user.id).single(),
        productId
          ? admin.from('products').select('title').eq('id', productId).single()
          : Promise.resolve(null),
      ])
      if (recipientProfile?.email_notif_favorite === false) return NextResponse.json({ success: true })
      const recipientEmail = recipientAuth.data?.user?.email
      if (!recipientEmail || !product?.data?.title) return NextResponse.json({ success: true })
      const likerName = likerProfile.data?.full_name || likerProfile.data?.username || 'Korisnik'
      await sendNewFavoriteEmail(recipientEmail, likerName, product.data.title)
    }

    if (type === 'new_follower') {
      const [recipientAuth, recipientProfile, followerProfile] = await Promise.all([
        admin.auth.admin.getUserById(recipientId),
        getRecipientProfile(recipientId),
        admin.from('profiles').select('username, full_name').eq('id', user.id).single(),
      ])
      if (recipientProfile?.account_type !== 'business') return NextResponse.json({ success: true })
      if (recipientProfile?.email_notif_follower === false) return NextResponse.json({ success: true })
      const recipientEmail = recipientAuth.data?.user?.email
      if (!recipientEmail) return NextResponse.json({ success: true })
      const followerName = followerProfile.data?.full_name || followerProfile.data?.username || 'Korisnik'
      await sendNewFollowerEmail(recipientEmail, followerName)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error('[notifications/email] Error:', err)
    return NextResponse.json({ error: 'Greška pri slanju obavijesti.' }, { status: 500 })
  }
}