import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/admin/giris'

    // Allow login page through
    if (request.nextUrl.pathname === '/admin/giris') {
      // If already logged in, redirect to dashboard
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type, status')
          .eq('id', user.id)
          .single()

        if (profile?.user_type && ['admin','super_admin'].includes(profile.user_type) && profile.status === 'active') {
          return NextResponse.redirect(new URL('/admin', request.url))
        }
      }
      return supabaseResponse
    }

    if (!user) return NextResponse.redirect(loginUrl)

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type, status')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin','super_admin'].includes(profile.user_type) || profile.status !== 'active') {
      return NextResponse.redirect(loginUrl)
    }
  }

  return supabaseResponse
}
