import { createServerSupabase } from '@/lib/supabase-server'

/**
 * Resolves the authenticated user's id for an API route, or null.
 * Same pattern as /api/messages/send: 5s timeout race so a slow auth
 * backend can never hang the route; any failure resolves to null (fail closed).
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const supabase = await createServerSupabase()
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<null>(resolve => setTimeout(() => resolve(null), 5000)),
    ])
    if (result && 'data' in result && result.data?.user) {
      return result.data.user.id
    }
  } catch {
    // auth check failed → treat as unauthenticated
  }
  return null
}
