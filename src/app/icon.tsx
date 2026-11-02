import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// Monogram in the brand palette (deep emerald + mustard).
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f2e1c",
          color: "#e8b923",
          fontSize: 320,
          fontFamily: "serif",
          borderRadius: 96,
        }}
      >
        G
      </div>
    ),
    size,
  );
}
