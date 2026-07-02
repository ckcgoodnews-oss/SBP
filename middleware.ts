import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPrefixes = ['/admin', '/customer', '/technician'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/logout') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isProtected = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Supabase stores auth state in browser storage by default with the current client setup.
  // This middleware is a foundation placeholder. Full cookie-based SSR auth should use
  // @supabase/ssr and secure HTTP-only cookies in a later hardening patch.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
