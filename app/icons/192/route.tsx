import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export async function GET() {
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
        <div style={{ fontSize: 108, display: "flex" }}>🌍</div>
      </div>
    ),
    { width: 192, height: 192 },
  );
}
