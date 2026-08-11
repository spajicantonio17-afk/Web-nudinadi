import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Browser-side Supabase client (for Client Components)
// Uses @supabase/ssr which stores session in cookies — shared with server-side middleware
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Singleton instance for client components
let browserClient: ReturnType<typeof createClient> | null = null
let authRefreshInterval: NodeJS.Timeout | null = null

export function getSupabase() {
  if (!browserClient) {
    browserClient = createClient()

    // Auto-refresh auth token every 30 minutes (only once, on first init)
    if (typeof window !== 'undefined' && !authRefreshInterval) {
      authRefreshInterval = setInterval(async () => {
        try {
          const { data } = await browserClient!.auth.refreshSession()
          if (data?.session) {
            console.debug('✓ Auth session refreshed')
          }
        } catch (err) {
          console.error('Auth refresh failed:', err)
        }
      }, 30 * 60 * 1000) // 30 minutes
    }
  }
  return browserClient
}
