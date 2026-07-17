import { Container } from "@/components/ui/Container";
import { HeroBackground } from "@/components/ui/HeroBackground";
import { FutbolSubnav } from "@/components/futbol/FutbolSubnav";
import { CalendarList } from "@/components/futbol/CalendarList";
import { getOwnTeamMatches } from "@/lib/supabase/queries/matches";

export const metadata = {
  title: "Calendario | Mafia Azul Grana",
  description: "Todos los partidos del Deportivo Quito en la temporada: resultados y próximos.",
};

export default async function CalendarioPage() {
  const matches = await getOwnTeamMatches();

  return (
    <>
      <section className="relative overflow-hidden bg-[#081f49] px-4.5 py-8 md:px-0 md:py-10">
        <HeroBackground />
        <div className="absolute inset-0 bg-[#081f49]/80" />
        <Container className="relative px-0 md:px-10">
          <p className="mb-4 font-mono text-[10px] tracking-[0.18em] text-dorado-escudo uppercase md:text-[11px]">
            Fútbol · Temporada actual
          </p>
          <h1 className="font-display text-[56px] leading-[0.82] text-blanco-hueso md:text-[78px]">
            CALENDARIO
          </h1>
          <p className="mt-2 max-w-md font-body text-sm text-blanco-hueso/70">
            Todos los partidos de la azulgrana, jugados y por jugar.
          </p>
        </Container>
      </section>

      <FutbolSubnav />

      <section className="bg-blanco-hueso">
        <Container className="px-4.5 py-8 md:px-10 md:py-10">
          <CalendarList matches={matches} />
        </Container>
      </section>
    </>
  );
}
