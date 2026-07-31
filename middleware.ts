import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request)
  } catch (e) {
    // Supabase bağlantı hatası — admin/giris dışında admin'e erişimi engelle
    if (request.nextUrl.pathname.startsWith('/admin') && 
        request.nextUrl.pathname !== '/admin/giris') {
      return NextResponse.redirect(new URL('/admin/giris', request.url))
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
