// src/app/api/cert-backend/[...path]/route.ts
//
// Proxy to the certification backend, which is not published outside the
// Docker network - this route is the internet's only door to it.
//
// Previously it was unauthenticated and forwarded ANY method to ANY path with
// ALL of the client's headers, which made it a general-purpose relay into the
// internal service. It now authenticates, rejects path traversal, forwards
// only a known set of headers, and caps the body size.

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { authErrorResponse } from "@/lib/api-auth";
import { buildSafePath } from "@/lib/proxy-path";
import {
  MAX_UPLOAD_BYTES,
  readLimitedArrayBuffer,
  payloadTooLargeResponse,
} from "@/lib/limits";

const API_BASE_URL = process.env.CERT_BACKEND_API_URL;

/**
 * Request headers forwarded upstream. Everything else (cookies, x-forwarded-*,
 * and any other client-supplied header) is dropped rather than relayed into
 * the internal network.
 *
 * `authorization` is forwarded deliberately: the backend does its own token
 * validation and every caller goes through src/services/api-client.ts, which
 * refuses to send a request without a Bearer token.
 */
const FORWARDED_REQUEST_HEADERS = [
  "authorization",
  "content-type",
  "accept",
  "accept-language",
];

/** Hop-by-hop headers that must not be copied onto our response. */
const STRIPPED_RESPONSE_HEADERS = [
  "content-encoding",
  "transfer-encoding",
  "connection",
  "keep-alive",
];

type RouteParams = { path?: string[] };
type RouteContext = { params: Promise<RouteParams> };

async function proxyRequest(req: NextRequest, params: RouteParams) {
  if (!API_BASE_URL) {
    return new Response("Missing CERT_BACKEND_API_URL", { status: 500 });
  }

  await getSessionUser(req);

  const segments = params.path ?? [];
  const safePath = buildSafePath(segments);
  if (safePath === null) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const incomingUrl = new URL(req.url);
  const baseUrl = API_BASE_URL.replace(/\/+$/, "");
  const targetUrl = `${baseUrl}${safePath ? `/${safePath}` : ""}${incomingUrl.search}`;

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await readLimitedArrayBuffer(req, MAX_UPLOAD_BYTES);
  }

  const res = await fetch(targetUrl, init);

  const resHeaders = new Headers(res.headers);
  for (const name of STRIPPED_RESPONSE_HEADERS) {
    resHeaders.delete(name);
  }

  // 204/205 responses must not include a body per Fetch spec.
  if (res.status === 204 || res.status === 205) {
    return new Response(null, { status: res.status, headers: resHeaders });
  }

  return new Response(await res.arrayBuffer(), {
    status: res.status,
    headers: resHeaders,
  });
}

/** Shared error handling so a denied request never falls through to the proxy. */
async function handle(req: NextRequest, ctx: RouteContext) {
  try {
    const params = await ctx.params;
    return await proxyRequest(req, params);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;

    const tooLarge = payloadTooLargeResponse(error);
    if (tooLarge) return tooLarge;

    console.error("cert-backend proxy error:", error);
    return NextResponse.json({ error: "Upstream request failed" }, { status: 502 });
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
