import { NextResponse, type NextRequest } from 'next/server';

const COOKIE_NAME = 'access_token';

const AUTH_PATHS = ['/login', '/signup'];

const ROLE_ROUTES: Record<string, 'PASSENGER' | 'DRIVER'> = {
  '/passenger': 'PASSENGER',
  '/driver': 'DRIVER',
};

const HOME_FOR_ROLE: Record<string, string> = {
  PASSENGER: '/passenger/rides/new',
  DRIVER: '/driver',
};

function decodeJwtPayload(token: string): { role?: string } | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + '/');
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  const isAuthRoute = AUTH_PATHS.some((p) => matchesPrefix(pathname, p));

  const payload = token ? decodeJwtPayload(token) : null;
  const role = payload?.role ?? null;
  const isAuthenticated = !!token && !!role;

  // 1. Logged-in users shouldn't see /login or /signup
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL(HOME_FOR_ROLE[role!] ?? '/', request.url));
  }

  // 2. Logged-out users can't access protected routes
  if (!isAuthenticated && !isAuthRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Role-based access — passenger can't hit /driver and vice versa
  if (isAuthenticated && !isAuthRoute) {
    for (const [prefix, requiredRole] of Object.entries(ROLE_ROUTES)) {
      if (matchesPrefix(pathname, prefix) && role !== requiredRole) {
        return NextResponse.redirect(new URL(HOME_FOR_ROLE[role!] ?? '/', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/passenger/:path*',
    '/driver/:path*',
    '/login',
    '/signup',
  ],
};