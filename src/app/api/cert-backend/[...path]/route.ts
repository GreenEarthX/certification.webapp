// src/app/api/cert-backend/[...path]/route.ts
import type { NextRequest } from "next/server";

const API_BASE_URL = process.env.CERT_BACKEND_API_URL;

type RouteParams = { path?: string[] };
type RouteContext = { params: Promise<RouteParams> };

async function proxyRequest(req: Request, params: RouteParams) {
  if (!API_BASE_URL) {
    return new Response("Missing CERT_BACKEND_API_URL", { status: 500 });
  }

  const incomingUrl = new URL(req.url);
  const baseUrl = API_BASE_URL.replace(/\/+$/, "");
  const path = (params.path ?? []).join("/");
  const targetUrl = `${baseUrl}${path ? `/${path}` : ""}${incomingUrl.search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("content-length");

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  const res = await fetch(targetUrl, init);

  const resHeaders = new Headers(res.headers);
  resHeaders.delete("content-encoding");

  return new Response(await res.arrayBuffer(), {
    status: res.status,
    headers: resHeaders,
  });
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const params = await ctx.params;
  return proxyRequest(req, params);
}
export async function POST(req: NextRequest, ctx: RouteContext) {
  const params = await ctx.params;
  return proxyRequest(req, params);
}
export async function PUT(req: NextRequest, ctx: RouteContext) {
  const params = await ctx.params;
  return proxyRequest(req, params);
}
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const params = await ctx.params;
  return proxyRequest(req, params);
}
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const params = await ctx.params;
  return proxyRequest(req, params);
}
