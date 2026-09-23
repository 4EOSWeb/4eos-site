import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Office LAN address of the machine running `npm run dev`. Without this,
  // Next.js returns 403 for /_next assets when the site is opened at that IP.
  allowedDevOrigins: ["192.168.153.31"],
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
    ];
  },
};

export default nextConfig;
