// middleware.ts
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge'

export default withMiddlewareAuthRequired()

// Protect all routes except public ones
export const config = {
  matcher: [
    // Protect everything except:
    // - Public routes
    // - API auth routes
    // - Next.js system routes
    '/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)',
  ],
};