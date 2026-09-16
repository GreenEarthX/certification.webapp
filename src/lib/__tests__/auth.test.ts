// Regression tests for the 2026-08 authentication bypass.
//
// The previous implementation base64-decoded the JWT payload and trusted it
// without verifying the signature, so any caller could forge any identity.
// These tests pin the fixed behaviour.

import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";
import {
  getSessionUser,
  getSessionFullUser,
  requireRole,
  requireAdmin,
  requirePermission,
  type SessionUser,
} from "../auth";

const SECRET = "test-secret-do-not-use-in-production";
const ISSUER = "onboarding-app";
const AUDIENCE = "geomap-app";

/** Minimal NextRequest stand-in: the module only reads headers. */
function reqWith(headers: Record<string, string>): NextRequest {
  const lower = Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
  );
  return {
    headers: { get: (name: string) => lower[name.toLowerCase()] ?? null },
  } as unknown as NextRequest;
}

function bearer(token: string) {
  return reqWith({ authorization: `Bearer ${token}` });
}

function signValid(payload: Record<string, unknown> = {}, secret = SECRET) {
  return jwt.sign(
    { userId: "user-123", email: "a@b.co", role: "PLANT_OPERATOR", type: "access", ...payload },
    secret,
    { issuer: ISSUER, audience: AUDIENCE, expiresIn: "1h" }
  );
}

beforeEach(() => {
  process.env.GEOMAP_JWT_SECRET = SECRET;
});

describe("getSessionUser", () => {
  it("accepts a correctly signed access token", async () => {
    await expect(getSessionUser(bearer(signValid()))).resolves.toBe("user-123");
  });

  it("accepts the x-auth-token header the client sends", async () => {
    const req = reqWith({ "x-auth-token": signValid() });
    await expect(getSessionUser(req)).resolves.toBe("user-123");
  });

  // The actual vulnerability: an unsigned, self-declared payload.
  it("rejects a forged token with no valid signature", async () => {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const body = Buffer.from(
      JSON.stringify({ userId: "attacker", role: "ADMIN", permissions: ["admin"] })
    ).toString("base64url");
    const forged = `${header}.${body}.not-a-real-signature`;

    await expect(getSessionUser(bearer(forged))).rejects.toThrow("Unauthorized");
  });

  it("rejects an alg:none token", async () => {
    const unsigned = jwt.sign({ userId: "attacker", role: "ADMIN" }, "", {
      algorithm: "none",
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    await expect(getSessionUser(bearer(unsigned))).rejects.toThrow("Unauthorized");
  });

  it("rejects a token signed with the wrong secret", async () => {
    await expect(
      getSessionUser(bearer(signValid({}, "some-other-secret")))
    ).rejects.toThrow("Unauthorized");
  });

  it("rejects an expired token", async () => {
    const expired = jwt.sign({ userId: "user-123", type: "access" }, SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE,
      expiresIn: "-1s",
    });
    await expect(getSessionUser(bearer(expired))).rejects.toThrow("Unauthorized");
  });

  it("rejects a token from the wrong issuer or audience", async () => {
    const wrongIss = jwt.sign({ userId: "u", type: "access" }, SECRET, {
      issuer: "evil",
      audience: AUDIENCE,
      expiresIn: "1h",
    });
    const wrongAud = jwt.sign({ userId: "u", type: "access" }, SECRET, {
      issuer: ISSUER,
      audience: "evil",
      expiresIn: "1h",
    });
    await expect(getSessionUser(bearer(wrongIss))).rejects.toThrow("Unauthorized");
    await expect(getSessionUser(bearer(wrongAud))).rejects.toThrow("Unauthorized");
  });

  // A refresh token lives 7 days; it must not be usable as an access token.
  it("rejects a refresh token used as an access token", async () => {
    await expect(
      getSessionUser(bearer(signValid({ type: "refresh" })))
    ).rejects.toThrow("Unauthorized");
  });

  it("rejects a token with no userId claim", async () => {
    const noSub = jwt.sign({ email: "a@b.co", type: "access" }, SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE,
      expiresIn: "1h",
    });
    await expect(getSessionUser(bearer(noSub))).rejects.toThrow("Unauthorized");
  });

  it("rejects a request with no token at all", async () => {
    await expect(getSessionUser(reqWith({}))).rejects.toThrow("Unauthorized");
  });

  // Fail closed: a missing secret must not mean "skip verification".
  it("rejects everything when GEOMAP_JWT_SECRET is unset", async () => {
    const token = signValid();
    delete process.env.GEOMAP_JWT_SECRET;
    await expect(getSessionUser(bearer(token))).rejects.toThrow("Unauthorized");
  });
});

describe("getSessionFullUser", () => {
  it("returns claims from the verified token", async () => {
    const token = signValid({ role: "ADMIN", permissions: ["read", "edit"], verified: true });
    await expect(getSessionFullUser(bearer(token))).resolves.toMatchObject({
      userId: "user-123",
      sub: "user-123",
      email: "a@b.co",
      role: "ADMIN",
      permissions: ["read", "edit"],
      verified: true,
    });
  });

  it("defaults role and permissions when the claims are absent", async () => {
    const token = jwt.sign({ userId: "u", type: "access" }, SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE,
      expiresIn: "1h",
    });
    const user = await getSessionFullUser(bearer(token));
    expect(user.role).toBe("PLANT_OPERATOR");
    expect(user.permissions).toEqual([]);
    expect(user.verified).toBe(false);
  });
});

describe("role and permission guards", () => {
  const user = (over: Partial<SessionUser> = {}): SessionUser => ({
    userId: "u",
    sub: "u",
    role: "PLANT_OPERATOR",
    permissions: ["read"],
    verified: true,
    ...over,
  });

  it("allows a matching role, case-insensitively", () => {
    expect(() => requireRole(user({ role: "ADMIN" }), ["admin"])).not.toThrow();
  });

  it("forbids a non-matching role", () => {
    expect(() => requireRole(user(), ["ADMIN"])).toThrow("Forbidden");
  });

  it("does not treat a permission as a role", () => {
    // Guards against regressing to the old behaviour, where requireRole read
    // the `permissions` array and an ADMIN check could never match.
    expect(() => requireAdmin(user({ permissions: ["admin"] }))).toThrow("Forbidden");
    expect(() => requireAdmin(user({ role: "ADMIN" }))).not.toThrow();
  });

  it("checks capabilities separately from roles", () => {
    expect(() => requirePermission(user({ permissions: ["read"] }), "read")).not.toThrow();
    expect(() => requirePermission(user({ permissions: ["read"] }), "edit")).toThrow("Forbidden");
  });
});
