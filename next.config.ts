import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

/** Addresses on this machine, so a phone can open whatever IP the host has. */
function localOrigins(): string[] {
  const origins = new Set<string>();
  for (const entries of Object.values(networkInterfaces())) {
    for (const entry of entries ?? []) {
      if (entry.internal) continue;
      const address = entry.address.split("%")[0]?.toLowerCase();
      if (address) origins.add(address);
    }
  }
  return [...origins];
}

const nextConfig: NextConfig = {
  // Dev assets are blocked unless the host is allowed. This follows the
  // machine's current addresses instead of a fixed list.
  allowedDevOrigins: localOrigins(),
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
