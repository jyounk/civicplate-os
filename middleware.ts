import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_COOKIE = 'civicplate_admin_session'
const SESSION_VALUE = 'authenticated'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /admin routes except /admin/login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const cookie = request.cookies.get(ADMIN_COOKIE)
    if (!cookie || cookie.value !== SESSION_VALUE) {
      // Extract tenant slug for redirect-back
      const parts = pathname.split('/')
      const tenantSlug = parts[2] ?? 'newton'
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('tenant', tenantSlug)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Existing tenant slug logic
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}