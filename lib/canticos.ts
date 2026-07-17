// Tipos + helper de Cánticos. Los datos viven en Supabase (tabla `canticos`,
// gestionada desde /admin/canticos) — ver lib/supabase/queries/canticos.ts.

export type CanticoLine = { role: "llamada" | "coro"; text: string };

export type Cantico = {
  id: string;
  slug: string;
  title: string;
  classic: boolean;
  youtube_url: string | null;
  start_seconds: number;
  lines: CanticoLine[];
  published: boolean;
  order_index: number;
};

// Extrae el ID de video de una URL de YouTube (watch o youtu.be). El embed lo arma
// el componente cliente `YouTubeEmbed` vía la IFrame API (para poder apagar los
// subtítulos, que no se pueden desactivar solo con params de URL).
export function youtubeId(url: string): string | null {
  return url.match(/[?&]v=([^&]+)/)?.[1] ?? url.match(/youtu\.be\/([^?]+)/)?.[1] ?? null;
}
