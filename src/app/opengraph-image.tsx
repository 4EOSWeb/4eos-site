import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "4EOS: modern IT leadership for growing businesses in Fort Wayne";

export default function OpenGraphImage() {
  return renderOg({ kicker: "Fort Wayne, Indiana", title: "Modern IT leadership for growing businesses" });
}
