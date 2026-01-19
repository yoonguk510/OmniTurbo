import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that do not require authentication
const PUBLIC_ROUTES = [
    '/login', 
    '/register', 
    '/forgot-password', 
    '/reset-password',
    '/' // Landing page might be public
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route));
  
  // Get access_token from cookies
  const accessToken = request.cookies.get('access_token')?.value;

  // 1. If trying to access a protected route without a token -> Redirect to Login
  if (!isPublicRoute && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname); // Remember where they came from
    return NextResponse.redirect(loginUrl);
  }

  // 2. If trying to access Auth pages (login/register) WITH a token -> Redirect to Dashboard
  // This prevents logged-in users from seeing the login page again
  if (['/login', '/register'].includes(pathname) && accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
