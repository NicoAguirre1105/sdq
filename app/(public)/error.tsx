"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { BrandLockup } from "@/components/ui/BrandLockup";

// Boundary de error para todo /(public): sin esto, un fallo transitorio de Supabase
// (ej. un 5xx de Cloudflare delante de la API) tumbaba el sitio entero con la
// pantalla genérica de Next en vez de degradar acá, con opción de reintentar.
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <section className="relative flex min-h-[78vh] flex-col items-center justify-center overflow-hidden bg-azul-marino px-6 py-16 text-center">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "repeating-linear-gradient(125deg,#0a234f 0,#0a234f 44px,#0c2a5e 44px,#0c2a5e 88px)",
        }}
      />

      <div className="relative flex flex-col items-center">
        <BrandLockup
          magSrc="/img/mag_large.svg"
          magWidth={584}
          magHeight={310}
          logoClassName="h-16 md:h-20"
          magClassName="h-10 md:h-12"
          className="mb-7"
        />

        <p className="font-mono text-[11px] tracking-[0.2em] text-dorado-escudo uppercase md:text-xs">
          Algo salió mal
        </p>
        <p className="mt-3.5 max-w-[440px] font-body text-sm leading-relaxed text-blanco-hueso/70 md:text-[15px]">
          Hubo un problema cargando esta página. Puede ser algo momentáneo — intenta
          de nuevo en unos segundos.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-rojo-bandera px-6 py-3 font-body text-sm font-bold text-blanco-hueso transition-colors hover:bg-rojo-bandera-hover"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="rounded-md border border-blanco-hueso/40 px-6 py-3 font-body text-sm font-bold text-blanco-hueso transition-colors hover:border-dorado-escudo"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}
