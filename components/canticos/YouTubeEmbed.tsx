"use client";

import { useEffect, useRef } from "react";

// Embed de YouTube con los subtítulos DESHABILITADOS de forma fiable.
//
// Por qué no alcanza `cc_load_policy=0` en la URL: YouTube solo respeta
// `cc_load_policy=1` (forzar CC ON). Sin ese flag, los subtítulos siguen la
// preferencia de la cuenta del espectador, así que a quien los tenga activados le
// aparecen igual. La única vía fiable es la IFrame Player API: en `onReady`
// llamamos `unloadModule("captions")` para quitar el módulo de subtítulos.

type YTPlayer = { destroy?: () => void; unloadModule?: (m: string) => void };

declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: unknown) => YTPlayer };
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Carga la IFrame API una sola vez (idempotente entre instancias).
let apiReady: Promise<void> | null = null;
function loadApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (apiReady) return apiReady;
  apiReady = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
  return apiReady;
}

export function YouTubeEmbed({
  videoId,
  start,
  title,
  className,
}: {
  videoId: string;
  start: number;
  title: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let player: YTPlayer | undefined;
    let cancelled = false;

    // YT.Player REEMPLAZA el nodo que recibe por un <iframe>. Si ese nodo lo
    // maneja React, al desmontar React falla al hacer removeChild. Por eso creamos
    // el host a mano dentro del contenedor React y le pasamos ese host.
    const host = document.createElement("div");
    host.className = "h-full w-full";
    containerRef.current?.appendChild(host);

    loadApi().then(() => {
      if (cancelled || !window.YT) return;
      player = new window.YT.Player(host, {
        width: "100%",
        height: "100%",
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          cc_load_policy: 0,
          start,
        },
        events: {
          onReady: (e: { target: YTPlayer }) => {
            // "captions" (nuevo) y "cc" (viejo): apagar ambos por compatibilidad.
            try {
              e.target.unloadModule?.("captions");
              e.target.unloadModule?.("cc");
            } catch {
              // si la API cambia el nombre del módulo, no romper el player
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      try {
        player?.destroy?.();
      } catch {
        // player ya destruido
      }
      host.remove();
    };
  }, [videoId, start]);

  // React solo maneja el contenedor; el host interno (y el iframe que lo reemplaza)
  // se crean/eliminan a mano en el effect. El wrapper mantiene aspect-ratio y bordes.
  return <div ref={containerRef} title={title} className={className} />;
}
