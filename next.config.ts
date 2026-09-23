import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
