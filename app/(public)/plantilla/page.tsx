import { Container } from "@/components/ui/Container";
import { FutbolSubnav } from "@/components/futbol/FutbolSubnav";
import { SquadGrid } from "@/components/futbol/SquadGrid";
import { getSquad } from "@/lib/supabase/queries/players";

export const metadata = {
  title: "Plantilla | Mafia Azul Grana",
  description: "Los jugadores del plantel actual del Deportivo Quito, por posición.",
};

export default async function PlantillaPage() {
  const players = await getSquad();

  return (
    <>
      <section className="relative overflow-hidden bg-[#081f49] px-4.5 py-8 md:px-0 md:py-10">
        <div className="absolute inset-0 bg-[url('/img/hero_2.jpg')] bg-cover bg-center md:bg-[url('/img/hero.jpg')]" />
        <div className="absolute inset-0 bg-[#081f49]/80" />
        <Container className="relative px-0 md:px-10">
          <p className="mb-4 font-mono text-[10px] tracking-[0.18em] text-dorado-escudo uppercase md:text-[11px]">
            Temporada actual · {players.length} jugadores
          </p>
          <h1 className="font-display text-[56px] leading-[0.82] text-blanco-hueso md:text-[78px]">
            PLANTILLA
          </h1>
          <p className="mt-2 max-w-md font-body text-sm text-blanco-hueso/70">
            El plantel que defiende la azulgrana, agrupado por posición.
          </p>
        </Container>
      </section>

      <FutbolSubnav />

      <section className="bg-blanco-hueso">
        <Container className="px-4.5 py-8 md:px-10 md:py-10">
          <SquadGrid players={players} />
        </Container>
      </section>
    </>
  );
}
