import geoip from "geoip-lite";

export type Place = {
  country: string;
  region: string;
  city: string;
  lat: number | null;
  lon: number | null;
  isp: string;
};

const STATES: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA", Colorado: "CO",
  Connecticut: "CT", Delaware: "DE", "District of Columbia": "DC", Florida: "FL", Georgia: "GA",
  Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS", Kentucky: "KY",
  Louisiana: "LA", Maine: "ME", Maryland: "MD", Massachusetts: "MA", Michigan: "MI", Minnesota: "MN",
  Mississippi: "MS", Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV", "New Hampshire": "NH",
  "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND",
  Ohio: "OH", Oklahoma: "OK", Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT", Virginia: "VA",
  Washington: "WA", "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY",
};

/** Resolves a place. The address is not returned and is not stored. */
export async function placeFromAddress(address: string | null): Promise<Place | null> {
  const ip = normalize(address);
  if (!ip) return null;
  const remote = await fromIpinfo(ip);
  const local = fromLocal(ip);
  const place = remote ?? local;
  if (!place) return null;
  return {
    country: place.country || local?.country || "",
    region: place.region || local?.region || "",
    city: place.city || local?.city || "",
    lat: place.lat ?? local?.lat ?? null,
    lon: place.lon ?? local?.lon ?? null,
    isp: place.isp || "",
  };
}

function normalize(address: string | null) {
  const ip = address?.split("%")[0]?.trim() ?? "";
  if (!ip || isPrivate(ip)) return null;
  return ip;
}

async function fromIpinfo(ip: string): Promise<Place | null> {
  const token = process.env["IPINFO_TOKEN"]?.trim();
  if (!token) return null;
  try {
    const response = await fetch(`https://ipinfo.io/${encodeURIComponent(ip)}/json`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as {
      country?: string;
      region?: string;
      city?: string;
      loc?: string;
      org?: string;
      bogon?: boolean;
    };
    if (body.bogon || !body.country) return null;
    const [lat, lon] = (body.loc ?? "").split(",").map(Number);
    const region = body.country === "US" ? STATES[body.region ?? ""] ?? body.region ?? "" : body.region ?? "";
    return {
      country: body.country,
      region,
      city: body.city ?? "",
      lat: Number.isFinite(lat) ? lat : null,
      lon: Number.isFinite(lon) ? lon : null,
      isp: (body.org ?? "").replace(/^AS\d+\s+/, ""),
    };
  } catch {
    return null;
  }
}

function fromLocal(ip: string): Place | null {
  const hit = geoip.lookup(ip);
  if (!hit?.country) return null;
  const [lat, lon] = hit.ll ?? [];
  return {
    country: hit.country,
    region: hit.region || "",
    city: hit.city || "",
    lat: Number.isFinite(lat) ? lat : null,
    lon: Number.isFinite(lon) ? lon : null,
    isp: "",
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
