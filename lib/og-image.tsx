import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Compartido por app/opengraph-image.tsx y app/twitter-image.tsx: mismo arte,
// dos rutas porque Next las sirve como convenciones de archivo separadas.
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const OG_IMAGE_CONTENT_TYPE = "image/png";

export async function renderOgImage() {
  const logo = await readFile(join(process.cwd(), "public/img/logoSDQ_color.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0B2E6B",
        }}
      >
        <img src={logoSrc} alt="" width={220} height={280} style={{ objectFit: "contain" }} />
        <div style={{ fontSize: 60, fontWeight: 700, color: "#F7F5F0", marginTop: 32 }}>
          MAFIA AZUL GRANA
        </div>
        <div style={{ fontSize: 28, color: "#C81D25", marginTop: 12 }}>
          HINCHADA DE SOCIEDAD DEPORTIVO QUITO
        </div>
      </div>
    ),
    OG_IMAGE_SIZE,
  );
}
