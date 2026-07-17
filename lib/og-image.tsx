import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Compartido por app/opengraph-image.tsx y app/twitter-image.tsx: mismo arte,
// dos rutas porque Next las sirve como convenciones de archivo separadas.
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const OG_IMAGE_CONTENT_TYPE = "image/png";

// Logo blanco centrado sobre el azul de marca: mismo tratamiento que
// favicon/apple-icon/android-chrome (ver .tmp/gen-icons.mjs), solo cambia el
// tamaño del lienzo.
const LOGO_HEIGHT = 340;
const LOGO_WIDTH = Math.round((LOGO_HEIGHT * 589) / 687);

export async function renderOgImage() {
  const logo = await readFile(join(process.cwd(), "public/logo_mag.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0B2E6B",
        }}
      >
        <img src={logoSrc} alt="" width={LOGO_WIDTH} height={LOGO_HEIGHT} style={{ objectFit: "contain" }} />
      </div>
    ),
    OG_IMAGE_SIZE,
  );
}
