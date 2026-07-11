"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

// Muestra un placeholder animado (shimmer) hasta que la imagen real termine de
// cargar; útil para fotos servidas desde Supabase Storage donde el tiempo de
// carga es real (no assets locales). onError también apaga el shimmer para no
// dejarlo pegado si la imagen rompe.
export function ImageWithSkeleton({ className = "", ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-azul-marino/10" />}
      <Image
        {...props}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}
