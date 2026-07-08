import Link from "next/link";
import { BrandLockup } from "@/components/ui/BrandLockup";

export default function NotFound() {
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

        <p className="font-display text-[110px] leading-[0.8] text-blanco-hueso md:text-[150px]">
          4<span className="text-rojo-bandera">0</span>4
        </p>
        <p className="mt-1.5 font-mono text-[11px] tracking-[0.2em] text-dorado-escudo uppercase md:text-xs">
          Página no encontrada
        </p>
        <p className="mt-3.5 max-w-[440px] font-body text-sm leading-relaxed text-blanco-hueso/70 md:text-[15px]">
          Esta jugada se fue afuera. La página que buscás no existe o cambió de
          lugar. Volvamos a la cancha.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-md bg-rojo-bandera px-6 py-3 font-body text-sm font-bold text-blanco-hueso transition-colors hover:bg-rojo-bandera-hover"
          >
            Volver al inicio
          </Link>
          <Link
            href="/canticos"
            className="rounded-md border border-blanco-hueso/40 px-6 py-3 font-body text-sm font-bold text-blanco-hueso transition-colors hover:border-dorado-escudo"
          >
            Ver cánticos
          </Link>
        </div>

        <nav className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 font-mono text-[11px] text-blanco-hueso/50">
          <Link href="/historia" className="transition-colors hover:text-dorado-escudo">
            HISTORIA
          </Link>
          <Link href="/futbol" className="transition-colors hover:text-dorado-escudo">
            FÚTBOL
          </Link>
          <Link href="/canticos" className="transition-colors hover:text-dorado-escudo">
            CÁNTICOS
          </Link>
          <Link href="/futbol/calendario" className="transition-colors hover:text-dorado-escudo">
            CALENDARIO
          </Link>
        </nav>
      </div>
    </section>
  );
}
