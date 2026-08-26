import { type NextRequest, NextResponse } from 'next/server'

const PROTECTED_USER_ROUTES = [
  '/hesabim',
  '/favorilerim',
  '/siparislerim',
  '/odeme',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdmin = pathname.startsWith('/admin')
  const isUserProtected = PROTECTED_USER_ROUTES.some((r) => pathname.startsWith(r))

  if (!isAdmin && !isUserProtected) return NextResponse.next()

  try {
    const { createServerClient } = await import('@supabase/ssr')
    let response = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const loginUrl = isAdmin ? '/giris' : '/uye-giris'
      const url = new URL(loginUrl, request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    return response
  } catch {
    const loginUrl = isAdmin ? '/giris' : '/uye-giris'
    return NextResponse.redirect(new URL(loginUrl, request.url))
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/hesabim/:path*',
    '/favorilerim/:path*',
    '/siparislerim/:path*',
    '/odeme/:path*',
  ],
}
