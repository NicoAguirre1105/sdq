import { MatchCard } from "@/components/futbol/MatchCard";
import type { UpcomingMatch } from "@/lib/supabase/queries/matches";

export function UpcomingMatches({ matches }: { matches: UpcomingMatch[] }) {
  if (!matches.length) {
    return (
      <p className="font-body text-sm text-tinta/50">No hay partidos programados por ahora.</p>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-3">
      {matches.map((m) => (
        <MatchCard
          key={m.id}
          match={m}
          topLabel={m.matchday != null ? `Fecha ${m.matchday}` : undefined}
        />
      ))}
    </div>
  );
}
