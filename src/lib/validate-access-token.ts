import { jwtVerify, importJWK } from 'jose';

const rawIssuer = process.env.AUTH0_ISSUER_BASE_URL!;
const AUTH0_ISSUER = rawIssuer.endsWith('/') ? rawIssuer : `${rawIssuer}/`;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE!;
const JWKS_URL = `${AUTH0_ISSUER}.well-known/jwks.json`;

let jwks: any;

export async function validateAccessToken(token: string) {
  if (!jwks) {
    const response = await fetch(JWKS_URL);
    if (!response.ok) throw new Error('Failed to fetch JWKS');
    jwks = await response.json();
  }

  const getKey = async (protectedHeader: any) => {
    const key = jwks.keys.find((k: any) => k.kid === protectedHeader.kid);
    if (!key) throw new Error('Signing key not found');
    return await importJWK(key);
  };

  const { payload } = await jwtVerify(token, getKey as any, {
    issuer: AUTH0_ISSUER,
    audience: AUTH0_AUDIENCE,
  });

  return payload;
}
