// src/lib/proxy-path.ts
//
// Path sanitisation for the catch-all backend proxy.

/**
 * Joins catch-all route segments into a URL path, or returns null if any
 * segment looks like a traversal attempt.
 *
 * Next.js decodes each segment before handing it over, so `%2e%2e` arrives as
 * `..` and a separator smuggled as `%2f` arrives as `/`. Both must be rejected
 * post-decode. Surviving segments are re-encoded so they cannot introduce new
 * path structure or query parameters upstream.
 */
export function buildSafePath(segments: string[]): string | null {
  for (const segment of segments) {
    if (
      segment === "." ||
      segment === ".." ||
      segment.includes("/") ||
      segment.includes("\\") ||
      segment.includes("\0")
    ) {
      return null;
    }
  }

  return segments.map(encodeURIComponent).join("/");
}
