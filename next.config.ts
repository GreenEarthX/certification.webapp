import type { NextConfig } from "next";

/**
 * Security headers set at the application level.
 *
 * nginx already sets HSTS, X-Frame-Options, X-Content-Type-Options,
 * Referrer-Policy and Permissions-Policy for app.greenearthx.io. These are
 * repeated here so the app is not dependent on the proxy being configured
 * correctly, and so they still apply if it is ever served from elsewhere.
 *
 * NOTE: no script-src/style-src CSP yet. Next.js needs either 'unsafe-inline'
 * (which would make the policy largely decorative) or per-request nonces via
 * middleware, and rolling that out needs a pass through every page to confirm
 * nothing breaks. `frame-ancestors` is included because it is the clickjacking
 * control and cannot affect rendering.
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'self'",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "geolocation=(), microphone=(), camera=()",
  },
];

const nextConfig: NextConfig = {
  output: 'standalone',

  // Drop the `X-Powered-By: Next.js` header - free version fingerprinting for
  // anyone scanning for known framework CVEs.
  poweredByHeader: false,

  eslint: {
    // TODO: lint is not enforced at build time, so type/lint regressions can
    // ship. Enable once the existing violations are cleared.
    ignoreDuringBuilds: true,
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
