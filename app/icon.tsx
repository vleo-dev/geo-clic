import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

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
          background: "linear-gradient(135deg, #6366f1 0%, #3f7ea6 100%)",
        }}
      >
        <div style={{ fontSize: 22, display: "flex" }}>🌍</div>
      </div>
    ),
    { ...size },
  );
}
