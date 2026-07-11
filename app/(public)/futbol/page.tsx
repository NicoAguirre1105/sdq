import { Container } from "@/components/ui/Container";
import { FutbolSubnav } from "@/components/futbol/FutbolSubnav";
import { UpcomingMatches } from "@/components/futbol/UpcomingMatches";
import { StandingsTable } from "@/components/futbol/StandingsTable";
import { TabbedContent } from "@/components/ui/TabbedContent";
import { MatchListSkeleton } from "@/components/ui/MatchListSkeleton";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { getUpcomingMatches } from "@/lib/supabase/queries/matches";
import { getStandings } from "@/lib/supabase/queries/standings";
import { getLeagueStages } from "@/lib/supabase/queries/competitions";

export const metadata = {
  title: "Fútbol | Mafia Azul Grana",
  description: "Próximos partidos y tabla de posiciones del Deportivo Quito.",
};

// ponytail: sin loading.tsx / <Suspense> de Server Components acá — dejaban el
// fallback pegado para siempre (bug reproducido con Next 16.2.10 + Turbopack, ver
// progreso.md). El loading state del selector de torneo es 100% client-side vía
// TabbedContent (useTransition), que no usa streaming de RSC.
export default async function FutbolPage({
  searchParams,
}: {
  searchParams: Promise<{ torneo?: string }>;
}) {
  const { torneo } = await searchParams;
  const leagues = await getLeagueStages();
  // Selecciona por stageId, no por competitionSlug: una competición puede tener
  // varias fases (stages) en formato liga, y el slug de competición se repite
  // entre ellas — buscar por slug siempre devolvía la primera fase.
  const selected = leagues.find((l) => l.stageId === torneo) ?? leagues[0] ?? null;

  // Si más de una fase comparte competición, la etiqueta suma el nombre de la fase
  // para no mostrar el mismo texto dos veces en el selector de torneo.
  function stageLabel(l: (typeof leagues)[number]) {
    const siblings = leagues.filter((x) => x.competitionSlug === l.competitionSlug);
    return siblings.length > 1 ? `${l.competitionName} · ${l.stageName}` : l.competitionName;
  }

  const [matches, standings] = selected
    ? await Promise.all([getUpcomingMatches(selected.stageId, 3), getStandings(selected.stageId)])
    : [[], []];

  const content = selected ? (
    <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_1.4fr] md:gap-14">
      <div>
        <h2 className="mb-4 font-mono text-[11px] tracking-[0.14em] text-azul-marino uppercase">
          Próximos partidos
        </h2>
        <UpcomingMatches matches={matches} />
      </div>
      <div className="min-w-0">
        <h2 className="mb-4 font-mono text-[11px] tracking-[0.14em] text-azul-marino uppercase">
          Tabla de posiciones
        </h2>
        <StandingsTable rows={standings} />
      </div>
    </div>
  ) : (
    <p className="font-body text-sm text-tinta/50">No hay torneos activos por el momento.</p>
  );

  const fallback = (
    <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_1.4fr] md:gap-14">
      <div>
        <h2 className="mb-4 font-mono text-[11px] tracking-[0.14em] text-azul-marino uppercase">
          Próximos partidos
        </h2>
        <MatchListSkeleton rows={3} />
      </div>
      <div className="min-w-0">
        <h2 className="mb-4 font-mono text-[11px] tracking-[0.14em] text-azul-marino uppercase">
          Tabla de posiciones
        </h2>
        <TableSkeleton rows={6} />
      </div>
    </div>
  );

  return (
    <>
      <section className="relative overflow-hidden bg-[#081f49] px-4.5 py-8 md:px-0 md:py-10">
        <div className="absolute inset-0 bg-[url('/img/hero_2.jpg')] bg-cover bg-center md:bg-[url('/img/hero.jpg')]" />
        <div className="absolute inset-0 bg-[#081f49]/80" />
        <Container className="relative px-0 md:px-10">
          <p className="mb-4 font-mono text-[10px] tracking-[0.18em] text-dorado-escudo uppercase md:text-[11px]">
            {selected ? stageLabel(selected) : "Temporada en curso"}
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
          {leagues.length > 1 ? (
            <TabbedContent
              navClassName="mb-8 flex flex-wrap gap-2"
              ariaLabel="Torneos"
              fallback={fallback}
              tabs={leagues.map((l) => {
                const active = l.stageId === selected?.stageId;
                return {
                  key: l.stageId,
                  label: stageLabel(l),
                  href: `/futbol?torneo=${l.stageId}`,
                  active,
                  className: `rounded-full px-3.5 py-1.5 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors ${
                    active
                      ? "bg-azul-marino text-blanco-hueso"
                      : "border border-azul-marino/25 text-azul-marino hover:bg-azul-marino/8"
                  }`,
                };
              })}
            >
              {content}
            </TabbedContent>
          ) : (
            content
          )}
        </Container>
      </section>
    </>
  );
}
