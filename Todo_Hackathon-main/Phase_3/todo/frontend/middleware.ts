import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard'];

// Public routes that should redirect to dashboard if authenticated
const publicRoutes = ['/signin', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Get token from localStorage (client-side check will be done by AuthGuard)
  // Middleware runs on server, so we can't access localStorage here
  // This is a basic implementation - in production, use httpOnly cookies

  if (isProtectedRoute) {
    // Let AuthGuard component handle the authentication check on client side
    return NextResponse.next();
  }

  if (isPublicRoute) {
    // Let the page render - client-side will handle redirect if already authenticated
    return NextResponse.next();
  }

  return NextResponse.next();
}

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
};
