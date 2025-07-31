import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getSession(req, res);
  const user = session?.user;

  // 🧠 Read the request path
  const path = req.nextUrl.pathname;

  // 👤 Not authenticated
  if (!user) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/api/auth/login';

    // 👇 Use hint from the path or cookie/query to detect signup intent
    if (path.startsWith('/register')) {
      loginUrl.searchParams.set('screen_hint', 'signup');      // show signup form
      loginUrl.searchParams.set('returnTo', '/post-signup');   // go here after signup
    } else {
      loginUrl.searchParams.set('returnTo', '/post-login');    // default for login
    }

    return NextResponse.redirect(loginUrl);
  }

    // ✅ Get roles
  const roles = (user['https://your-app.com/roles'] as string[]) || [];

  // 📜 Define protected routes
  const accessRules = [
    { pathPrefix: '/admin', allowedRoles: ['Admin'] },
    { pathPrefix: '/plant-operator', allowedRoles: ['PlantOperator', 'Default'] },
  ];


  // 🔒 Check role-based access
  for (const rule of accessRules) {
    if (path.startsWith(rule.pathPrefix) && !rule.allowedRoles.some(role => roles.includes(role))) {
      return redirectUnauthorized(req);
    }
  }

  return res;
}

// 🚫 Unauthorized redirect
function redirectUnauthorized(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = '/unauthorized';
  return NextResponse.redirect(url);
}

// ⚙️ Middleware config
export const config = {
  matcher: [
    '/((?!api/auth|api/test-session|login|post-login|post-signup|unauthorized|_next/static|_next/image|favicon.ico).*)',
  ],
};
