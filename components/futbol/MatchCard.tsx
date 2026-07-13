import { TeamCrest } from "@/components/ui/TeamCrest";
import { formatMatchDate } from "@/lib/format";

const PILL = {
  V: "bg-[#1a7f4b] text-white",
  E: "bg-dorado-escudo text-azul-marino",
  D: "bg-rojo-bandera text-white",
} as const;

type CardTeam = {
  name: string;
  short_name: string | null;
  logo_url: string | null;
  is_own_team: boolean;
};

export type CardMatch = {
  id: string;
  match_date: string | null;
  score_home: number | null;
  score_away: number | null;
  status: "programado" | "jugado" | "suspendido";
  ticket_url: string | null;
  venue: string | null;
  homeTeam: CardTeam | null;
  awayTeam: CardTeam | null;
};

function TeamRow({ team, score }: { team: CardTeam | null; score: number | null }) {
  const name = (team?.short_name ?? team?.name ?? "Por definir").toUpperCase();
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {/* Escudo directo: la tarjeta ya es azul marino, así que el SVG blanco
          contrasta sin necesitar un chip oscuro alrededor (ver design-system.md). */}
      <TeamCrest name={team?.name ?? "?"} logoUrl={team?.logo_url} isOwnTeam={team?.is_own_team} size="sm" />
      <span className="min-w-0 truncate font-display text-base leading-none tracking-[0.01em] text-blanco-hueso md:text-lg">
        {name}
      </span>
      {score != null && (
        <span className="ml-auto shrink-0 font-display text-lg text-blanco-hueso tabular-nums">
          {score}
        </span>
      )}
    </div>
  );
}

export function MatchCard({
  match,
  topLabel,
  highlighted = false,
}: {
  match: CardMatch;
  topLabel?: string;
  highlighted?: boolean;
}) {
  const ownIsHome = match.homeTeam?.is_own_team ?? false;
  const ownIsAway = match.awayTeam?.is_own_team ?? false;
  const ownScore = ownIsHome ? match.score_home : ownIsAway ? match.score_away : null;
  const oppScore = ownIsHome ? match.score_away : ownIsAway ? match.score_home : null;
  const played = match.status === "jugado" && ownScore != null && oppScore != null;
  const result: keyof typeof PILL | null = played
    ? ownScore! > oppScore!
      ? "V"
      : ownScore === oppScore
        ? "E"
        : "D"
    : null;

  const dt = formatMatchDate(match.match_date);

  return (
    <div
      className={`flex items-stretch gap-3 rounded-lg border bg-azul-marino px-4 py-3 ${
        highlighted ? "border-dorado-escudo/60" : "border-white/10"
      }`}
    >
      <div className="flex w-14 shrink-0 items-center justify-center text-center">
        {match.venue && (
          <span className="font-mono text-[9px] leading-tight text-blanco-hueso/50 uppercase">
            {match.venue}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <TeamRow team={match.homeTeam} score={played ? match.score_home : null} />
        <TeamRow team={match.awayTeam} score={played ? match.score_away : null} />
      </div>

      <div className="w-px shrink-0 self-stretch bg-white/15" />

      <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-1.5 text-center">
        <div>
          {topLabel && (
            <p className="font-mono text-[9px] text-blanco-hueso/45 uppercase">{topLabel}</p>
          )}
          {dt ? (
            <>
              <p className="font-mono text-[10px] tracking-[0.08em] text-dorado-escudo">{dt.day}</p>
              <p className="font-display text-xl leading-none text-blanco-hueso">{dt.time}</p>
            </>
          ) : (
            <p className="font-mono text-[10px] leading-tight text-blanco-hueso/40 uppercase">
              Sin confirmar
            </p>
          )}
        </div>

        {match.status === "jugado" && result ? (
          <span
            className={`flex h-6 w-6 items-center justify-center rounded font-mono text-[11px] font-bold ${PILL[result]}`}
          >
            {result}
          </span>
        ) : match.status === "suspendido" ? (
          <span className="font-mono text-[9px] text-blanco-hueso/40 uppercase">Suspendido</span>
        ) : match.status === "programado" && match.ticket_url ? (
          <a
            href={match.ticket_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-rojo-bandera px-2.5 py-1 font-mono text-[10px] font-bold tracking-wide text-white transition-[background-color,transform] duration-150 ease-out-strong hover:bg-rojo-bandera-hover active:scale-95"
          >
            Entradas
          </a>
        ) : null}
      </div>
    </div>
  );
}
