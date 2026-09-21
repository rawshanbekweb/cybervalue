import type { NextConfig } from "next";

const production = process.env.NODE_ENV === "production";
// Static rendering needs Next's inline bootstrap. No remote scripts or frames.
// A nonce policy would require dynamic rendering; see docs/security.md.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${production ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${production ? "" : " ws: wss:"}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const config: NextConfig = {
  poweredByHeader: false,
  trailingSlash: false,
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  // Database-backed file paths cannot be discovered by static file tracing.
  outputFileTracingIncludes: {
    "/downloads/*": ["./content/private/downloads/**/*"],
  },
  // Next.js only serves blocking (correct-status-code) HTML to a known-bot
  // allowlist by default; every other client gets a streamed 200 shell even
  // for notFound()/redirect(). Matching every user agent here makes 404s and
  // redirects return real status codes for all clients, not just crawlers.
  htmlLimitedBots: /.*/,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          ...(production
            ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }]
            : []),
        ],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};
export default config;
