import { Container } from "@/components/ui/Container";
import { FutbolSubnav } from "@/components/futbol/FutbolSubnav";
import { TableSkeleton } from "@/components/ui/TableSkeleton";

// Next.js muestra esto automáticamente (Suspense de ruta) mientras el Server
// Component de page.tsx resuelve sus queries. Repite el hero estático de la
// página real para que no haya salto de layout al llegar la data.
export default function FutbolLoading() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#081f49] px-4.5 py-8 md:px-0 md:py-10">
        <div className="absolute inset-0 bg-[url('/img/hero_2.jpg')] bg-cover bg-center md:bg-[url('/img/hero.jpg')]" />
        <div className="absolute inset-0 bg-[#081f49]/80" />
        <Container className="relative px-0 md:px-10">
          <p className="mb-4 font-mono text-[10px] tracking-[0.18em] text-dorado-escudo uppercase md:text-[11px]">
            Temporada en curso
          </p>
          <h1 className="font-display text-[56px] leading-[0.82] text-blanco-hueso md:text-[78px]">
            FÚTBOL
          </h1>
          <p className="mt-2 max-w-md font-body text-sm text-blanco-hueso/70">
            Los próximos partidos y la tabla de posiciones, al día.
          </p>
        </Container>
      </section>

      <FutbolSubnav />

      <section className="bg-blanco-hueso">
        <Container className="px-4.5 py-8 md:px-10 md:py-10">
          <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_1.4fr] md:gap-14">
            <div>
              <h2 className="mb-4 font-mono text-[11px] tracking-[0.14em] text-azul-marino uppercase">
                Próximos partidos
              </h2>
              <TableSkeleton rows={3} />
            </div>
            <div className="min-w-0">
              <h2 className="mb-4 font-mono text-[11px] tracking-[0.14em] text-azul-marino uppercase">
                Tabla de posiciones
              </h2>
              <TableSkeleton rows={6} />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
