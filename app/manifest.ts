import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mafia Azul Grana | SD Quito",
    short_name: "Mafia Azul Grana",
    description: "Portal de la hinchada de Sociedad Deportivo Quito",
    // Sin start_url fijo: así "Agregar a inicio" en iOS apunta a la página desde
    // la que se agrega (ej. /admin), no siempre al home del sitio.
    display: "browser",
    lang: "es-EC",
    background_color: "#0B2E6B",
    theme_color: "#0B2E6B",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
