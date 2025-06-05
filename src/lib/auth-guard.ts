import { getAccessToken } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { validateAccessToken } from './validate-access-token';

const ROLE_NAMESPACE = 'https://your-app.com/roles';

export async function requireRole(req: NextRequest, allowedRoles: string[]) {
  const { accessToken } = await getAccessToken(req, NextResponse.next());

  if (!accessToken) {
    console.warn('⚠️ No access token found in request');
    throw new Response(JSON.stringify({ message: 'Access token missing' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  console.log('🔐 Access Token:', accessToken);

  // Log token header to inspect kid and alg
  try {
    const header = JSON.parse(
      Buffer.from(accessToken.split('.')[0], 'base64').toString()
    );
    console.log('📦 Token header:', header);
  } catch (e) {
    console.warn('Failed to decode token header');
  }

  let payload;
  try {
    payload = await validateAccessToken(accessToken);
    console.log('✅ Token payload:', payload);
  } catch (err) {
    console.error('❌ Token validation failed:', err);
    throw new Response(JSON.stringify({ message: 'Invalid or expired token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const roles = Array.isArray(payload[ROLE_NAMESPACE])
    ? payload[ROLE_NAMESPACE]
    : [];

  const hasAccess = allowedRoles.some(role => roles.includes(role));

  if (!hasAccess) {
    console.warn('⛔ Access denied: missing required role');
    throw new Response(JSON.stringify({ message: 'Forbidden: Missing required role' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return {roles, payload};
}
