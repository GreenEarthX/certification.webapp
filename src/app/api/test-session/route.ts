import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const res = new NextResponse(); 
  const session = await getSession(req, res); 
  
  return new Response(JSON.stringify({ session }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}
