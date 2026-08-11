import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Middleware helper: refreshes auth session on every request
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Guest fast path: with no auth cookie there is no session to refresh, so
  // skip the Supabase Auth round-trip entirely. This removes a network hop
  // from the critical path of every navigation for logged-out visitors.
  // (Chunked cookies are named `sb-<ref>-auth-token.0`, `.1`, … — the
  // substring check covers those too.)
  const hasAuthCookie = request.cookies
    .getAll()
    .some(c => c.name.startsWith('sb-') && c.name.includes('-auth-token'))
  if (!hasAuthCookie) return supabaseResponse

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session (important for keeping auth alive)
  // This ensures cookies are refreshed on every request so the client-side
  // auth context always has a valid session.
  // NOTE: Auth redirects are handled CLIENT-SIDE by each page's useAuth() guard.
  // Server-side redirects were removed because they race with session refresh
  // and cause false redirects to /login on valid sessions.
  await supabase.auth.getUser()

  return supabaseResponse
}
