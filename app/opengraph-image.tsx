import { ImageResponse } from "next/og";

export const alt = "Drive the Market — structured trading education";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(135deg,#25331e,#78866b 65%,#d9ddda)",
        color: "white",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        padding: 72,
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 960 }}>
        <div
          style={{
            color: "#dce5d5",
            fontSize: 28,
            letterSpacing: 5,
            textTransform: "uppercase",
          }}
        >
          Drive the Market
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.08,
            marginTop: 24,
          }}
        >
          Structured learning after every live trading class.
        </div>
        <div style={{ color: "#e4e8e5", fontSize: 28, marginTop: 28 }}>
          Courses · Protected resources · Recordings · Progress
        </div>
      </div>
    </div>,
    size,
  );
}
