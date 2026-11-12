import { NextResponse, type NextRequest } from 'next/server';

// Auth is temporarily off for the public site. Sign-in and sign-up stay in the repo
// but are not reachable; every visit lands on the dashboard.
const HIDDEN_AUTH_PATHS = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  if (HIDDEN_AUTH_PATHS.includes(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
