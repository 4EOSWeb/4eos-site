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
      { source: "/services/completecare", destination: "/managed-it", permanent: true },
      { source: "/services/cybersecurity", destination: "/cybersecurity", permanent: true },
      { source: "/services/cloud", destination: "/cloud-microsoft-365", permanent: true },
      { source: "/services/voip", destination: "/voip", permanent: true },
      { source: "/services/datacenter", destination: "/data-center", permanent: true },
      { source: "/services/hardware", destination: "/hardware", permanent: true },
      { source: "/why-4eos", destination: "/about", permanent: true },
      { source: "/safehouse-data-center", destination: "/data-center", permanent: true },
      { source: "/midwest-voip", destination: "/voip", permanent: true },
      { source: "/4-key-guiding-values", destination: "/about", permanent: true },
      { source: "/new-page", destination: "/", permanent: true },
      { source: "/command", destination: "/analytics", permanent: false },
      { source: "/command/:path*", destination: "/analytics/:path*", permanent: false },
    ];
  },
};

export default nextConfig;
