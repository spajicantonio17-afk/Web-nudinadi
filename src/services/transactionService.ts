import { getSupabase } from '@/lib/supabase'
import type { Transaction, TransactionWithDetails, Profile } from '@/lib/database.types'

const supabase = getSupabase()

// ─── Create Transaction (seller picks buyer) ─────────────

export async function createTransaction(
  productId: string,
  sellerId: string,
  buyerId: string
): Promise<Transaction> {
  // Anti-cheat: buyer ≠ seller (also enforced by DB constraint)
  if (sellerId === buyerId) {
    throw new Error('Ne možete kupiti vlastiti artikal.')
  }

  // Anti-cheat: product must be ≥24h old
  const { data: product, error: prodErr } = await supabase
    .from('products')
    .select('created_at, status')
    .eq('id', productId)
    .single()

  if (prodErr || !product) throw new Error('Artikal nije pronađen.')
  if (product.status !== 'active') throw new Error('Artikal nije aktivan.')

  const hoursSinceCreation = (Date.now() - new Date(product.created_at).getTime()) / 3600000
  if (hoursSinceCreation < 24) {
    throw new Error('Artikal mora biti objavljen najmanje 24 sata prije prodaje.')
  }

  // Anti-cheat: must have exchanged messages about this product
  const { data: convo } = await supabase
    .from('conversations')
    .select('id')
    .eq('product_id', productId)
    .or(`and(user1_id.eq.${sellerId},user2_id.eq.${buyerId}),and(user1_id.eq.${buyerId},user2_id.eq.${sellerId})`)
    .maybeSingle()

  if (!convo) {
    throw new Error('Morate imati razgovor s kupcem o ovom artiklu.')
  }

  // Check no existing pending transaction for this product
  const { data: existing } = await supabase
    .from('transactions')
    .select('id')
    .eq('product_id', productId)
    .eq('status', 'pending')
    .maybeSingle()

  if (existing) {
    throw new Error('Već postoji otvorena transakcija za ovaj artikal.')
  }

  // Set product to pending_sale
  await supabase
    .from('products')
    .update({ status: 'pending_sale' })
    .eq('id', productId)

  // Create transaction
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      product_id: productId,
      seller_id: sellerId,
      buyer_id: buyerId,
    })
    .select()
    .single()

  if (error) {
    // Revert product status on failure
    await supabase.from('products').update({ status: 'active' }).eq('id', productId)
    throw error
  }

  return data
}

// ─── Confirm Transaction (buyer confirms) ────────────────

export async function confirmTransaction(transactionId: string, buyerId: string): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update({ status: 'confirmed' })
    .eq('id', transactionId)
    .eq('buyer_id', buyerId)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) throw new Error('Greška pri potvrdi transakcije.')
  return data
}

// ─── Deny Transaction (buyer denies) ─────────────────────

export async function denyTransaction(transactionId: string, buyerId: string): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update({ status: 'denied' })
    .eq('id', transactionId)
    .eq('buyer_id', buyerId)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) throw new Error('Greška pri odbijanju transakcije.')
  return data
}

// ─── Get Pending Transactions for Buyer ──────────────────

export async function getPendingTransactionsForBuyer(buyerId: string): Promise<TransactionWithDetails[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, product:products(*), seller:profiles!seller_id(*), buyer:profiles!buyer_id(*)')
    .eq('buyer_id', buyerId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as unknown as TransactionWithDetails[]
}

// ─── Get Active Transaction for Product ──────────────────

export async function getTransactionForProduct(productId: string): Promise<Transaction | null> {
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .eq('product_id', productId)
    .eq('status', 'pending')
    .maybeSingle()

  return data
}

// ─── Get Buyer Candidates (chat contacts for product) ────

export interface BuyerCandidate {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
}

export async function getBuyerCandidates(productId: string, sellerId: string): Promise<BuyerCandidate[]> {
  // Find all conversations about this product where seller is a participant
  const { data: convos, error } = await supabase
    .from('conversations')
    .select('user1_id, user2_id')
    .eq('product_id', productId)
    .or(`user1_id.eq.${sellerId},user2_id.eq.${sellerId}`)

  if (error || !convos?.length) return []

  // Extract unique buyer IDs (the other participant)
  const buyerIds = [...new Set(
    convos.map(c => c.user1_id === sellerId ? c.user2_id : c.user1_id)
  )]

  if (buyerIds.length === 0) return []

  // Fetch profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .in('id', buyerIds)

  return (profiles || []) as BuyerCandidate[]
}

// ─── Mark Sold Outside Platform (0 XP) ──────────────────

export async function markSoldOutsidePlatform(productId: string, sellerId: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ status: 'sold' })
    .eq('id', productId)
    .eq('seller_id', sellerId)

  if (error) throw error
  // No XP awarded — sold outside platform
}
