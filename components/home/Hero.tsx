import { TeamCrest } from "@/components/ui/TeamCrest";
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
  const headline = "la akd quiere mantener el liderato";
  const { day, time } = formatMatchDate(nextMatch.match_date);

  return (
    <div className="relative h-[340px] overflow-hidden bg-[#081f49] md:h-[430px]">
      <div className="absolute inset-0 bg-[url('/img/hero_2.jpg')] bg-cover bg-center md:bg-[url('/img/hero.jpg')]" />
      <div className="absolute inset-0 bg-[#081f49]/75" />
      <Container className="absolute inset-0 flex flex-col justify-between px-4.5 py-6.5 md:px-10 md:py-13">
        <div>
          <p className="mb-2 font-mono text-[10px] tracking-[0.18em] text-dorado-escudo uppercase md:mb-2.5 md:text-xs">
            Próximo partido{nextMatch.matchday ? ` · Fecha ${nextMatch.matchday}` : ""}
          </p>
          <h1 className="font-display text-[56px] leading-[0.82] text-blanco-hueso md:text-[92px]">
            {headline}
          </h1>
        </div>

        <div className="flex w-full items-center justify-between gap-4 rounded-[9px] border-2 border-dorado-escudo/60 bg-[#081938]/82 px-3.5 py-3.5 backdrop-blur-md md:w-fit md:gap-6.5 md:px-5.5">
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
