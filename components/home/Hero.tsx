import { TeamCrest } from "@/components/ui/TeamCrest";
import { PhotoPlaceholder } from "@/components/ui/PhotoPlaceholder";
import { Container } from "@/components/ui/Container";
import type { NextMatch } from "@/lib/supabase/queries/matches";

function formatMatchDate(iso: string) {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat("es-EC", { weekday: "short", day: "2-digit", month: "short" })
    .format(date)
    .replace(".", "")
    .toUpperCase();
  const time = new Intl.DateTimeFormat("es-EC", { hour: "2-digit", minute: "2-digit", hour12: false }).format(
    date
  );
  return { day, time };
}

export function Hero({ nextMatch }: { nextMatch: NextMatch | null }) {
  if (!nextMatch || !nextMatch.homeTeam || !nextMatch.awayTeam) {
    return (
      <div className="relative flex h-[280px] items-center justify-center bg-azul-marino md:h-[430px]">
        <p className="font-display text-3xl text-blanco-hueso/50 md:text-5xl">
          SIN PARTIDO PROGRAMADO
        </p>
      </div>
    );
  }

  const { homeTeam, awayTeam } = nextMatch;
  const opponent = homeTeam.is_own_team ? awayTeam : homeTeam;
  const opponentName = (opponent.short_name ?? opponent.name).toUpperCase();
  const headline = homeTeam.is_own_team
    ? `QUITO RECIBE A ${opponentName}`
    : `QUITO VISITA A ${opponentName}`;
  const { day, time } = formatMatchDate(nextMatch.match_date);

  return (
    <div className="relative h-[340px] overflow-hidden bg-[#081f49] md:h-[430px]">
      <PhotoPlaceholder
        label="FOTO HINCHADA / TRAPO"
        tone="azul"
        className="absolute inset-0 h-full items-center justify-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-azul-marino/20 to-azul-marino md:bg-gradient-to-r md:from-azul-marino/0 md:via-azul-marino/45 md:to-azul-marino" />

      <Container className="absolute inset-0 flex flex-col justify-between px-4.5 py-6.5 md:px-10 md:py-13">
        <div>
          <p className="mb-2 font-mono text-[10px] tracking-[0.18em] text-dorado-escudo uppercase md:mb-2.5 md:text-xs">
            Próximo partido{nextMatch.matchday ? ` · Fecha ${nextMatch.matchday}` : ""}
          </p>
          <h1 className="font-display text-[56px] leading-[0.82] text-blanco-hueso md:text-[92px]">
            {headline}
          </h1>
        </div>

        <div className="flex w-full items-center justify-between gap-4 rounded-[9px] border border-dorado-escudo/40 bg-[#081938]/82 px-3.5 py-3.5 backdrop-blur-md md:w-fit md:gap-6.5 md:px-5.5">
          <div className="flex flex-col items-center gap-1.5">
            <TeamCrest name={homeTeam.name} isOwnTeam={homeTeam.is_own_team} />
            <span className="font-display text-sm tracking-[0.05em] text-blanco-hueso md:text-[15px]">
              {(homeTeam.short_name ?? homeTeam.name).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-mono text-[9px] tracking-[0.1em] text-dorado-escudo md:text-[11px]">
              {day}
            </span>
            <span className="font-display text-[26px] leading-[0.9] text-blanco-hueso md:text-4xl">
              {time}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <TeamCrest name={awayTeam.name} isOwnTeam={awayTeam.is_own_team} />
            <span className="font-display text-sm tracking-[0.05em] text-blanco-hueso md:text-[15px]">
              {(awayTeam.short_name ?? awayTeam.name).toUpperCase()}
            </span>
          </div>
        </div>
      </Container>
    </div>
  );
}
