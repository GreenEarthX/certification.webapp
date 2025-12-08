// middleware.ts  

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // On ne touche que les routes API (sauf /api/auth)
  if (request.nextUrl.pathname.startsWith("/api/") && 
      !request.nextUrl.pathname.startsWith("/api/auth")) {

    const clientToken = request.headers.get("x-auth-token");

    // Converts x-auth-token → Authorization: Bearer <jwt> so our API routes can read it normally
    if (clientToken) {
      const newHeaders = new Headers(request.headers);
      newHeaders.set("Authorization", `Bearer ${clientToken}`);

      return NextResponse.next({
        request: { headers: newHeaders },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/((?!auth).*)",
};