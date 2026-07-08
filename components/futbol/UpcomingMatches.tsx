import { formatMatchDate } from "@/lib/format";
import type { UpcomingMatch } from "@/lib/supabase/queries/matches";

export function UpcomingMatches({ matches }: { matches: UpcomingMatch[] }) {
  if (!matches.length) {
    return (
      <p className="font-body text-sm text-tinta/50">No hay partidos programados por ahora.</p>
    );
  }

  return (
    <ul className="divide-y divide-azul-marino/12">
      {matches.map((m) => {
        const isLocal = m.homeTeam?.is_own_team ?? false;
        const opponent = isLocal ? m.awayTeam : m.homeTeam;
        const opponentName = (opponent?.short_name ?? opponent?.name ?? "Por definir").toUpperCase();
        const dt = formatMatchDate(m.match_date);

        return (
          <li key={m.id} className="flex items-center gap-3 py-3.5 md:gap-5">
            <div className="w-24 shrink-0 md:w-28">
              {dt ? (
                <>
                  <p className="font-mono text-[10px] tracking-[0.08em] text-dorado-escudo md:text-[11px]">
                    {dt.day}
                  </p>
                  <p className="font-display text-xl leading-none text-tinta md:text-2xl">
                    {dt.time}
                  </p>
                </>
              ) : (
                <p className="font-mono text-[11px] leading-tight text-tinta/40 uppercase">
                  Sin confirmar
                </p>
              )}
            </div>
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-[11px] font-bold ${
                isLocal ? "bg-azul-marino text-blanco-hueso" : "bg-azul-marino/10 text-azul-marino"
              }`}
              title={isLocal ? "Local" : "Visitante"}
            >
              {isLocal ? "L" : "V"}
            </span>
            <p className="font-display text-lg leading-none tracking-[0.02em] text-tinta md:text-xl">
              vs {opponentName}
            </p>
            {m.matchday != null && (
              <span className="ml-auto font-mono text-[10px] text-tinta/40">FECHA {m.matchday}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
