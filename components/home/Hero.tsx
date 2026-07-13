import { TeamCrest } from "@/components/ui/TeamCrest";
import { Container } from "@/components/ui/Container";
import { formatMatchDate } from "@/lib/format";
import type { NextMatch } from "@/lib/supabase/queries/matches";

export function Hero({
  nextMatch,
  headline,
  subtitle,
}: {
  nextMatch: NextMatch | null;
  headline: string;
  subtitle: string;
}) {
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
  const dt = formatMatchDate(nextMatch.match_date);

  return (
    <div className="relative overflow-hidden bg-[#081f49]">
      <div className="absolute inset-0 bg-[url('/img/hero_2.jpg')] bg-cover bg-center md:bg-[url('/img/hero.jpg')]" />
      <div className="absolute inset-0 bg-[#081f49]/75" />
      <Container className="relative flex flex-col gap-8 px-4.5 py-9 md:gap-12 md:px-10 md:py-16">
        <div>
          <p className="mb-2.5 font-mono text-[10px] tracking-[0.18em] text-dorado-escudo uppercase md:mb-3 md:text-xs">
            Próximo partido
            {nextMatch.matchday ? ` · Fecha ${nextMatch.matchday}` : ""}
            {nextMatch.venue ? ` · ${nextMatch.venue}` : ""}
          </p>
          <h1 className="font-display text-[56px] leading-[0.82] text-blanco-hueso md:text-[92px]">
            {headline}
          </h1>
          <p className="mt-4 max-w-xl font-body text-sm leading-relaxed text-blanco-hueso/75 md:mt-5 md:max-w-2xl md:text-base">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-col items-start gap-3.5">
          <div className="flex w-full items-center justify-between gap-5 rounded-[9px] border-2 border-dorado-escudo/60 bg-[#081938]/82 px-3.5 py-4 backdrop-blur-md md:w-fit md:gap-7 md:px-5.5">
            <div className="flex flex-col items-center gap-1.5">
              <TeamCrest
                name={homeTeam.name}
                logoUrl={homeTeam.logo_url}
                isOwnTeam={homeTeam.is_own_team}
              />
              <span className="font-display text-sm tracking-[0.05em] text-blanco-hueso md:text-[15px]">
                {(homeTeam.short_name ?? homeTeam.name).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col items-center">
              {dt ? (
                <>
                  <span className="font-mono text-[9px] tracking-[0.1em] text-dorado-escudo md:text-[11px]">
                    {dt.day}
                  </span>
                  <span className="font-display text-[26px] leading-[0.9] text-blanco-hueso md:text-4xl">
                    {dt.time}
                  </span>
                </>
              ) : (
                <span className="font-display text-lg leading-[0.9] text-blanco-hueso md:text-2xl">
                  POR CONFIRMAR
                </span>
              )}
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <TeamCrest
                name={awayTeam.name}
                logoUrl={awayTeam.logo_url}
                isOwnTeam={awayTeam.is_own_team}
              />
              <span className="font-display text-sm tracking-[0.05em] text-blanco-hueso md:text-[15px]">
                {(awayTeam.short_name ?? awayTeam.name).toUpperCase()}
              </span>
            </div>
          </div>

          {nextMatch.ticket_url && (
            <a
              href={nextMatch.ticket_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md bg-rojo-bandera px-4 py-2.5 font-body text-xs font-bold text-white transition-colors hover:bg-rojo-bandera-hover"
            >
              Comprar entradas
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>
          )}
        </div>
      </Container>
    </div>
  );
}
