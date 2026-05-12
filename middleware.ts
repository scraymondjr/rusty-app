import { NextRequest, NextResponse } from 'next/server'

// Routes that don't require a session cookie
const PUBLIC_PATHS = new Set(['/', '/access-denied'])
const PUBLIC_PREFIXES = ['/api/auth/', '/_next/', '/icons/', '/manifest.json', '/favicon.ico']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic =
    PUBLIC_PATHS.has(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))

  if (isPublic) return NextResponse.next()

  const session = request.cookies.get('__session')

  if (!session?.value) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Skip static assets and Next.js internals; run on everything else
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
