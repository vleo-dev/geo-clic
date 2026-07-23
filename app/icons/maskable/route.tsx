import { ImageResponse } from "next/og";

export const dynamic = "force-static";

// Icône "maskable" : l'OS peut recadrer en cercle/carré arrondi/etc, donc le
// contenu doit rester dans la zone sûre centrale (~80% du canevas) et le
// fond doit couvrir le carré entier sans transparence.
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
        <div style={{ fontSize: 220, display: "flex" }}>🌍</div>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
