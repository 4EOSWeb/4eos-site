import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getService, type ServiceSlug } from "./content";
import { site } from "./site";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const INK = "#0b0d11";
const BONE = "#ece7db";
const MUTED = "#a7a398";
const GOLD = "#f5b700";

export function serviceOg(slug: ServiceSlug) {
  const s = getService(slug);
  return renderOg({ kicker: s.family ?? "4EOS services", title: s.title });
}

/** One social card layout for every page group, so shares look like one brand. */
let archivo: Promise<Buffer> | null = null;

export async function renderOg({ kicker, title }: { kicker: string; title: string }) {
  archivo ??= readFile(path.join(process.cwd(), "src/assets/fonts/Archivo-ExtraBold.ttf"));
  const display = await archivo;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: INK,
          padding: 72,
          color: BONE,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 44, fontFamily: "Archivo", letterSpacing: "-0.02em" }}>4EOS</div>
          <div style={{ fontSize: 22, color: MUTED }}>{site.phone}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: GOLD,
            }}
          >
            {kicker}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: title.length > 48 ? 64 : 80,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              fontFamily: "Archivo",
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
        </div>
        <div style={{ display: "flex", borderTop: `2px solid ${GOLD}`, paddingTop: 24, fontSize: 22, color: MUTED }}>
          Managed IT, cybersecurity, and IT strategy · {site.serviceArea} · Since {site.founded}
        </div>
      </div>
    ),
    { ...ogSize, fonts: [{ name: "Archivo", data: display, weight: 800, style: "normal" }] },
  );
}
