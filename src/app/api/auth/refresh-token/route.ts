import { NextRequest, NextResponse } from "next/server";

const AUTH_APP_BASE_URL =
  process.env.ONBOARDING_APP_URL;

export async function POST(req: NextRequest) {
  if (!AUTH_APP_BASE_URL) {
    return NextResponse.json(
      { error: "Missing ONBOARDING_APP_URL" },
      { status: 500 }
    );
  }

  let refreshToken: string | undefined;
  try {
    const body = (await req.json().catch(() => null)) as
      | { refreshToken?: string }
      | null;
    refreshToken = body?.refreshToken;
  } catch {
    refreshToken = undefined;
  }

  if (!refreshToken) {
    return NextResponse.json(
      { error: "Refresh token required" },
      { status: 400 }
    );
  }

  const targetUrl = `${AUTH_APP_BASE_URL.replace(/\/+$/, "")}/api/auth/refresh-token`;

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    const payload = await res.text();
    const contentType = res.headers.get("content-type") || "application/json";

    return new NextResponse(payload, {
      status: res.status,
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    console.error("[refresh-token proxy] Error:", error);
    return NextResponse.json(
      { error: "Refresh proxy failed" },
      { status: 502 }
    );
  }
}
