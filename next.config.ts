import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["node:sqlite", "geoip-lite"],
  // Dev-only. Next already allows localhost. These patterns allow every
  // other host: any IPv4 address, and any hostname that contains a dot.
  // Restart `next dev` after changing this.
  allowedDevOrigins: ["*.*.*.*", "**.*"],
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/faq.json", destination: "/ai/faq.json" },
      { source: "/service.json", destination: "/ai/service.json" },
    ];
  },
  async redirects() {
    return [
      {
        source: "/safehouse-data-center",
        destination: "/services/datacenter",
        permanent: true,
      },
      {
        source: "/midwest-voip",
        destination: "/services/voip",
        permanent: true,
      },
      {
        source: "/4-key-guiding-values",
        destination: "/why-4eos",
        permanent: true,
      },
      {
        source: "/new-page",
        destination: "/",
        permanent: true,
      },
      {
        source: "/command",
        destination: "/analytics",
        permanent: false,
      },
      {
        source: "/command/:path*",
        destination: "/analytics/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
