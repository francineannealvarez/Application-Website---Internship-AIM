// Middleware to protect /admin and /applicant routes
// Checks for active Supabase session; redirects to /login if not authenticated

import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Protected routes that require authentication
  const protectedPaths = ['/admin', '/applicant']
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (!isProtectedPath) {
    // Allow access to public routes (login, register, etc.)
    return NextResponse.next()
  }

  // Create a Supabase server client to check auth status
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options as CookieOptions)
          })
        },
      },
    }
  )

  // Check if user has an active session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no active session, redirect to login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // User has a valid session, allow access
  return response
}

// Configure which routes this middleware should run on
export const config = {
  matcher: ['/admin/:path*', '/applicant/:path*'],
}
