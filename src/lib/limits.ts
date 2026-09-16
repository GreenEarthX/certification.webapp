// src/lib/limits.ts
//
// Request body size caps. Route Handlers in the App Router have NO body size
// limit by default (unlike Server Actions, which default to 1MB), and several
// routes buffer the whole request into memory with req.arrayBuffer() /
// req.formData(). Without a cap, a single large POST can exhaust the
// container's memory - the frontend container is limited to 512MB.

/** Default cap for file uploads and proxied bodies. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

/** Cap for small JSON payloads. */
export const MAX_JSON_BYTES = 1 * 1024 * 1024; // 1 MB

export const PAYLOAD_TOO_LARGE = "Payload too large";

/**
 * Reads the request body, refusing anything over `limit`.
 *
 * Checks Content-Length first as a cheap early reject, then re-checks the
 * actual byte length because Content-Length may be absent (chunked encoding)
 * or simply wrong. This still buffers up to `limit` bytes per request; nginx
 * enforces a lower ceiling at the edge as the first line of defence.
 *
 * Throws `PAYLOAD_TOO_LARGE`, which routes should map to HTTP 413.
 */
export async function readLimitedArrayBuffer(
  req: Request,
  limit: number = MAX_UPLOAD_BYTES
): Promise<ArrayBuffer> {
  const declared = req.headers.get("content-length");
  if (declared && Number(declared) > limit) {
    throw new Error(PAYLOAD_TOO_LARGE);
  }

  const body = await req.arrayBuffer();
  if (body.byteLength > limit) {
    throw new Error(PAYLOAD_TOO_LARGE);
  }

  return body;
}

/** Maps `PAYLOAD_TOO_LARGE` onto a 413, otherwise returns null. */
export function payloadTooLargeResponse(error: unknown) {
  if (error instanceof Error && error.message === PAYLOAD_TOO_LARGE) {
    return Response.json({ error: PAYLOAD_TOO_LARGE }, { status: 413 });
  }
  return null;
}
