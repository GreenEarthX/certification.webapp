import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log('AUTH0_SECRET:', process.env.AUTH0_SECRET);
  console.log('AUTH0_CLIENT_SECRET:', process.env.AUTH0_CLIENT_SECRET);
  console.log('AUTH0_CLIENT_ID:', process.env.AUTH0_CLIENT_ID);
  console.log('AUTH0_ISSUER_BASE_URL:', process.env.AUTH0_ISSUER_BASE_URL);
  console.log('AUTH0_BASE_URL:', process.env.AUTH0_BASE_URL);

  return NextResponse.json({ message: 'Test' });
}