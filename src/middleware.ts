import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getSession(req, res);
  const user = session?.user;

  // ✅ If no token/session → redirect to login
  if (!user) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/api/auth/login';
    loginUrl.searchParams.set('returnTo', req.nextUrl.pathname); // preserve path
    return NextResponse.redirect(loginUrl);
  }

  const roles = user['https://your-app.com/roles'] || [];

  // 🔒 Admin-only access
  if (req.nextUrl.pathname.startsWith('/admin') && !roles.includes('Admin')) {
    const url = req.nextUrl.clone();
    url.pathname = '/unauthorized';
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)',
  ],
};
