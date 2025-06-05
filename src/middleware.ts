import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getSession(req, res);
  const user = session?.user;

  // 🔐 Redirect to login if not authenticated
  if (!user) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/api/auth/login';
    loginUrl.searchParams.set('returnTo', '/post-login');
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Get user roles from custom claim
  const roles = (user['https://your-app.com/roles'] as string[]) || [];
  const path = req.nextUrl.pathname;

  
  // 📜 Define access rules
  const accessRules = [
    { pathPrefix: '/admin', allowedRoles: ['Admin'] },
    { pathPrefix: '/dashboards', allowedRoles: ['PlantOperator'] }
  ];

  // 🔍 Check if user has permission to access the path
  for (const rule of accessRules) {
    if (
      path.startsWith(rule.pathPrefix) &&
      !rule.allowedRoles.some(role => roles.includes(role))
    ) {
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
    '/((?!api/auth|api/test-session|login|post-login|unauthorized|_next/static|_next/image|favicon.ico).*)',
  ],
};

