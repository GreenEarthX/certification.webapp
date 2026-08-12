// Path-traversal regression tests for the cert-backend catch-all proxy.
//
// The proxy interpolates these segments into a URL pointing at the internal
// backend, which is not reachable from the internet by any other route.

import { buildSafePath } from "../proxy-path";

describe("buildSafePath", () => {
  it("joins ordinary segments", () => {
    expect(buildSafePath(["plants", "42", "details"])).toBe("plants/42/details");
  });

  it("returns an empty string for no segments", () => {
    expect(buildSafePath([])).toBe("");
  });

  it("rejects parent-directory segments", () => {
    expect(buildSafePath([".."])).toBeNull();
    expect(buildSafePath(["plants", "..", "..", "admin"])).toBeNull();
  });

  it("rejects current-directory segments", () => {
    expect(buildSafePath(["."])).toBeNull();
  });

  // Next.js percent-decodes segments before the handler sees them, so an
  // attacker sending %2e%2e or %2f arrives here already decoded.
  it("rejects separators smuggled through percent-encoding", () => {
    expect(buildSafePath(["a/b"])).toBeNull();
    expect(buildSafePath(["a\\b"])).toBeNull();
  });

  it("rejects null bytes", () => {
    expect(buildSafePath(["a\0b"])).toBeNull();
  });

  // Segments must not be able to introduce new path or query structure.
  it("re-encodes characters that would change the upstream URL", () => {
    expect(buildSafePath(["a?b=1"])).toBe("a%3Fb%3D1");
    expect(buildSafePath(["a#frag"])).toBe("a%23frag");
    expect(buildSafePath(["a b"])).toBe("a%20b");
  });

  it("leaves a legitimate dotted segment alone", () => {
    expect(buildSafePath(["report.pdf"])).toBe("report.pdf");
    expect(buildSafePath(["...weird"])).toBe("...weird");
  });
});
