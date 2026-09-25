import geoip from "geoip-lite";

export type Place = {
  country: string;
  region: string;
  city: string;
  lat: number | null;
  lon: number | null;
};

/** Resolves a place and returns nothing that could be stored as an address. */
export function placeFromAddress(address: string | null): Place | null {
  if (!address) return null;
  const ip = address.split("%")[0]?.trim() ?? "";
  if (!ip || isPrivate(ip)) return null;
  const hit = geoip.lookup(ip);
  if (!hit?.country) return null;
  const [lat, lon] = hit.ll ?? [];
  return {
    country: hit.country,
    region: hit.region || "",
    city: hit.city || "",
    lat: Number.isFinite(lat) ? lat : null,
    lon: Number.isFinite(lon) ? lon : null,
  };
}

function isPrivate(ip: string) {
  return (
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("169.254.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
    ip.startsWith("fc") ||
    ip.startsWith("fd") ||
    ip.startsWith("fe80")
  );
}
