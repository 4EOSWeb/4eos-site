import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js only serves dev assets to localhost unless the host is listed.
  // Opening the site at a LAN address was returning 403 for /_next, so the
  // field never started. Private ranges cover a laptop whose address changes.
  allowedDevOrigins: [
    "192.168.153.31",
    "192.168.*.*",
    "10.*.*.*",
    "172.16.*.*",
    "172.17.*.*",
    "172.18.*.*",
    "172.19.*.*",
    "172.20.*.*",
    "172.21.*.*",
    "172.22.*.*",
    "172.23.*.*",
    "172.24.*.*",
    "172.25.*.*",
    "172.26.*.*",
    "172.27.*.*",
    "172.28.*.*",
    "172.29.*.*",
    "172.30.*.*",
    "172.31.*.*",
  ],
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
