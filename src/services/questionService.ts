import { getSupabase } from '@/lib/supabase'

const supabase = getSupabase()

export interface QuestionWithUser {
  id: string
  product_id: string
  user_id: string
  question: string
  answer: string | null
  answered_at: string | null
  created_at: string
  user: { username: string; avatar_url: string | null }
}

export async function getProductQuestions(productId: string): Promise<QuestionWithUser[]> {
  const { data, error } = await supabase
    .from('product_questions')
    .select('*, user:profiles!user_id(username, avatar_url)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as unknown as QuestionWithUser[]
}

export async function askQuestion(productId: string, userId: string, question: string) {
  const { data, error } = await supabase
    .from('product_questions')
    .insert({ product_id: productId, user_id: userId, question })
    .select('*, user:profiles!user_id(username, avatar_url)')
    .single()

  if (error) throw error
  return data as unknown as QuestionWithUser
}

export async function answerQuestion(questionId: string, answer: string, answeredBy: string) {
  const { error } = await supabase
    .from('product_questions')
    .update({ answer, answered_by: answeredBy, answered_at: new Date().toISOString() })
    .eq('id', questionId)

  if (error) throw error
}
