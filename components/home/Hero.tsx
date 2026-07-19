import { TeamCrest } from "@/components/ui/TeamCrest";
import { Container } from "@/components/ui/Container";
import { HeroBackground } from "@/components/ui/HeroBackground";
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
  // Sin partido próximo (o datos incompletos): la tarjeta de partido simplemente
  // no se muestra, pero el hero (foto, título, subtítulo) sigue como siempre —
  // antes esto reemplazaba TODO el hero por un cartel "SIN PARTIDO PROGRAMADO".
  // `match` (en vez de un booleano aparte) deja que TS angoste homeTeam/awayTeam
  // a no-nulos dentro del bloque condicional — el object spread es necesario
  // porque TS no propaga el angostamiento de nextMatch.homeTeam/awayTeam a una
  // variable nueva asignada desde un ternario, solo a accesos directos.
  const match =
    nextMatch && nextMatch.homeTeam && nextMatch.awayTeam
      ? { ...nextMatch, homeTeam: nextMatch.homeTeam, awayTeam: nextMatch.awayTeam }
      : null;
  const dt = match ? formatMatchDate(match.match_date) : null;
  // Eliminación: round_name ("Semifinal"). Liga: matchday ("Fecha 3"). Antes se
  // usaba matchday siempre, que en eliminación es el "orden de ronda" (1, 2…), no
  // una fecha — mostraba "Fecha 1" en vez de "Semifinal".
  const roundLabel = match
    ? (match.round_name ?? (match.matchday != null ? `Fecha ${match.matchday}` : null))
    : null;

  return (
    <div className="relative overflow-hidden bg-[#081f49]">
      <HeroBackground />
      <div className="absolute inset-0 bg-[#081f49]/75" />
      <Container className="relative flex flex-col gap-8 px-4.5 py-9 md:gap-12 md:px-10 md:py-16">
        <div>
          <p className="mb-2.5 font-mono text-[10px] tracking-[0.18em] text-dorado-escudo uppercase md:mb-3 md:text-xs">
            Próximo partido
            {roundLabel ? ` · ${roundLabel}` : ""}
          </p>
          <h1 className="font-display text-[56px] leading-[0.82] text-blanco-hueso md:text-[92px]">
            {headline}
          </h1>
          <p className="mt-4 max-w-xl font-body text-sm leading-relaxed text-blanco-hueso/75 md:mt-5 md:max-w-2xl md:text-base">
            {subtitle}
          </p>
        </div>

        {match && (
          <div className="flex flex-col items-start gap-3.5">
            <div className="flex w-full items-center justify-between gap-5 rounded-[9px] border-2 border-dorado-escudo/60 bg-[#081938]/82 px-3.5 py-4 backdrop-blur-md md:w-fit md:gap-7 md:px-5.5">
              <div className="flex flex-col items-center gap-1.5">
                <TeamCrest
                  name={match.homeTeam.name}
                  logoUrl={match.homeTeam.logo_url}
                  isOwnTeam={match.homeTeam.is_own_team}
                />
                <span className="font-display text-sm tracking-[0.05em] text-blanco-hueso md:text-[15px]">
                  {(match.homeTeam.short_name ?? match.homeTeam.name).toUpperCase()}
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
                {match.venue && (
                  <span className="mt-1 font-mono text-[9px] text-blanco-hueso/50 uppercase md:text-[10px]">
                    {match.venue}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <TeamCrest
                  name={match.awayTeam.name}
                  logoUrl={match.awayTeam.logo_url}
                  isOwnTeam={match.awayTeam.is_own_team}
                />
                <span className="font-display text-sm tracking-[0.05em] text-blanco-hueso md:text-[15px]">
                  {(match.awayTeam.short_name ?? match.awayTeam.name).toUpperCase()}
                </span>
              </div>
            </div>

            {match.ticket_url && (
              <a
                href={match.ticket_url}
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
        )}
      </Container>
    </div>
  );
}
