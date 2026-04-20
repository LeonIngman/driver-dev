import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  if (process.env.UNDER_CONSTRUCTION !== 'true') {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // Allow the under-construction page and Next.js internals through
  if (
    pathname.startsWith('/under-construction') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL('/under-construction', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
