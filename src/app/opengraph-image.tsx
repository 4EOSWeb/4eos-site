import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "#05070A",
          padding: 72,
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#F5B700",
            fontFamily: "Georgia",
          }}
        >
          Fort Wayne · Since 2002
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 88,
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            color: "#E8E4D8",
            textTransform: "uppercase",
            fontWeight: 700,
            maxWidth: 980,
          }}
        >
          IT that works for you.
        </div>
      </div>
    ),
    size,
  );
}
