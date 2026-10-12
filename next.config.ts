import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["node:sqlite", "geoip-lite"],
  // Dev-only. Next already allows localhost. These patterns allow every
  // other host: any IPv4 address, and any hostname that contains a dot.
  // Restart `next dev` after changing this.
  allowedDevOrigins: ["*.*.*.*", "**.*"],
  devIndicators: false,
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
