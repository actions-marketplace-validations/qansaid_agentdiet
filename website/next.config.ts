import type { NextConfig } from "next";

// Two origins share this config. The container build keeps its Node server and
// its response headers; the GitHub Pages build is a static export, where Next
// ignores headers() and cannot run middleware. PAGES_EXPORT=1 selects the
// static one.
const pagesExport = process.env.PAGES_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Emits .next/standalone so the Docker image does not need node_modules.
  output: pagesExport ? "export" : "standalone",
  images: pagesExport ? { unoptimized: true } : undefined,
  // Directory-style URLs, so a static host serves /docs/ from docs/index.html
  // instead of depending on whether it maps /docs to docs.html.
  trailingSlash: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=15552000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          {
            // The site ships no third-party scripts, so the policy can stay
            // tight. 'unsafe-inline' is required by Next's hydration bootstrap.
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data:",
              "font-src 'self'",
              "connect-src 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
      {
        // HTML must not sit in the edge cache for a year: the previous
        // s-maxage=31536000 meant a deploy could take a day to appear, and
        // cached hits never reach the origin limiter. An hour at the edge with
        // stale-while-revalidate keeps it fast without hiding new content.
        source: "/:path((?!_next/).*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        // Fonts and hashed assets are immutable; the HTML is not.
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
