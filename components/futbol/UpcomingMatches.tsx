import { MatchCard } from "@/components/futbol/MatchCard";
import type { UpcomingMatch } from "@/lib/supabase/queries/matches";

export function UpcomingMatches({
  matches,
  finished = false,
}: {
  matches: UpcomingMatch[];
  finished?: boolean;
}) {
  if (!matches.length) {
    return (
      <p className="font-body text-sm text-tinta/50">
        {finished ? "Este torneo ya finalizó." : "No hay partidos programados por ahora."}
      </p>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-3">
      {matches.map((m) => (
        <MatchCard
          key={m.id}
          match={m}
          // Eliminación: round_name ("Semifinal"). Liga: matchday ("Fecha 3"). Antes
          // se usaba matchday siempre, que en eliminación es el "orden de ronda" (1,
          // 2…), no una fecha — mostraba "Fecha 1" en vez de "Semifinal".
          topLabel={m.round_name ?? (m.matchday != null ? `Fecha ${m.matchday}` : undefined)}
        />
      ))}
    </div>
  );
}
