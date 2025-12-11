// Minimal JWT helper for client-side decoding

export type JwtPayload = Record<string, unknown>;

export function decodeJwtPayload<T extends JwtPayload = JwtPayload>(
  token: string
): T | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded =
      base64 + "=".repeat((4 - (base64.length % 4 || 4)) % 4);
    const json = atob(padded);

    return JSON.parse(json) as T;
  } catch (err) {
    console.error("[jwt] Failed to decode token payload:", err);
    return null;
  }
}
