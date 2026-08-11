import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Browser-side Supabase client (for Client Components)
// Uses @supabase/ssr which stores session in cookies — shared with server-side middleware
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Singleton instance for client components
// Note: token auto-refresh is built into supabase-js (autoRefreshToken defaults
// to true, ticking every 30s) — no manual refresh interval needed here.
let browserClient: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!browserClient) {
    browserClient = createClient()
  }
  return browserClient
}
