// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Do absolutely nothing → let everything through
  return NextResponse.next();
}

// Optional: limit matcher so it doesn't run on static files (faster)
export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};