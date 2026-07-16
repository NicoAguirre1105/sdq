import { MatchCard } from "@/components/futbol/MatchCard";
import { TeamCrest } from "@/components/ui/TeamCrest";
import type { StageMatch } from "@/lib/supabase/queries/matches";

// Agrupa por ronda (round_name) ordenando los grupos por matchday, reutilizado
// acá como "orden de ronda" (1 = primera ronda del cuadro, 2 = la siguiente…).
function groupByRound(matches: StageMatch[]) {
  const sorted = [...matches].sort((a, b) => {
    if (a.matchday == null && b.matchday == null) return 0;
    if (a.matchday == null) return 1;
    if (b.matchday == null) return -1;
    return a.matchday - b.matchday;
  });
  const order: string[] = [];
  const byRound = new Map<string, StageMatch[]>();
  for (const m of sorted) {
    const key = m.round_name ?? "Ronda";
    if (!byRound.has(key)) {
      byRound.set(key, []);
      order.push(key);
    }
    byRound.get(key)!.push(m);
  }
  return order.map((name) => ({ name, matches: byRound.get(name)! }));
}

type Cross =
  | { kind: "single"; match: StageMatch }
  | { kind: "tie"; legs: StageMatch[] };

// Dentro de una ronda, los partidos que comparten tie_id son las dos piernas de
// un mismo cruce (ida/vuelta) y se combinan en una sola tarjeta. Un tie_id sin
// una segunda pierna real (ej. quedó huérfano porque se borró la vuelta sin
// limpiar el enlace) no cuenta como cruce — se trata como partido suelto, igual
// que si nunca hubiera tenido tie_id.
function groupCrosses(matches: StageMatch[]): Cross[] {
  const seen = new Set<string>();
  const result: Cross[] = [];
  for (const m of matches) {
    if (seen.has(m.id)) continue;
    const legs = m.tie_id ? matches.filter((x) => x.tie_id === m.tie_id) : [];
    if (legs.length >= 2) {
      legs.sort((a, b) => (a.leg ?? 0) - (b.leg ?? 0));
      legs.forEach((l) => seen.add(l.id));
      result.push({ kind: "tie", legs });
    } else {
      seen.add(m.id);
      result.push({ kind: "single", match: m });
    }
  }
  return result;
}

function scoreFor(teamId: string, m: StageMatch) {
  if (m.homeTeam?.id === teamId) return m.score_home;
  if (m.awayTeam?.id === teamId) return m.score_away;
  return null;
}

// Cruce a dos piernas: marcador agregado por equipo (no por local/visitante, que
// se invierte entre ida y vuelta) + detalle de cada pierna. No resuelve reglas de
// desempate (gol de visitante, penales) — si el agregado empata, se dice y listo.
function TieCard({ legs }: { legs: StageMatch[] }) {
  const [leg1, leg2] = legs;
  if (!leg2 || !leg1.homeTeam || !leg1.awayTeam) {
    return <MatchCard match={leg1} />;
  }
  const teamA = leg1.homeTeam;
  const teamB = leg1.awayTeam;
  const aScores = [scoreFor(teamA.id, leg1), scoreFor(teamA.id, leg2)];
  const bScores = [scoreFor(teamB.id, leg1), scoreFor(teamB.id, leg2)];
  const played = [...aScores, ...bScores].every((s) => s != null);
  const aggA = played ? aScores[0]! + aScores[1]! : null;
  const aggB = played ? bScores[0]! + bScores[1]! : null;

  return (
    <div className="flex w-full flex-col gap-2.5 rounded-lg border border-white/10 bg-azul-marino px-4 py-3">
      {[
        { team: teamA, agg: aggA },
        { team: teamB, agg: aggB },
      ].map(({ team, agg }) => (
        <div key={team.id} className="flex items-center gap-2.5">
          <TeamCrest name={team.name} logoUrl={team.logo_url} isOwnTeam={team.is_own_team} size="sm" />
          <span className="min-w-0 truncate font-display text-base leading-none text-blanco-hueso md:text-lg">
            {(team.short_name ?? team.name).toUpperCase()}
          </span>
          {agg != null && (
            <span className="ml-auto shrink-0 font-display text-lg text-blanco-hueso tabular-nums">
              {agg}
            </span>
          )}
        </div>
      ))}
      {played && aggA === aggB && (
        <p className="text-center font-mono text-[9px] text-dorado-escudo uppercase">
          Empate en el global
        </p>
      )}
      <div className="space-y-0.5 border-t border-white/10 pt-2 font-mono text-[9px] text-blanco-hueso/45">
        <p>
          Ida: {leg1.homeTeam?.short_name ?? leg1.homeTeam?.name} {leg1.score_home ?? "–"}-
          {leg1.score_away ?? "–"} {leg1.awayTeam?.short_name ?? leg1.awayTeam?.name}
        </p>
        <p>
          Vuelta: {leg2.homeTeam?.short_name ?? leg2.homeTeam?.name} {leg2.score_home ?? "–"}-
          {leg2.score_away ?? "–"} {leg2.awayTeam?.short_name ?? leg2.awayTeam?.name}
        </p>
      </div>
    </div>
  );
}

function Cross({ cross }: { cross: Cross }) {
  if (cross.kind === "tie") return <TieCard legs={cross.legs} />;
  // Ida sin pareja confirmada (llegar acá como "single" ya lo garantiza, tenga o
  // no un tie_id huérfano): sin este aviso se ve como un partido programado
  // cualquiera, o como si el cruce hubiera terminado ahí de estar ya jugado.
  const pendingVuelta = cross.match.leg === 1;
  return <MatchCard match={cross.match} note={pendingVuelta ? "Vuelta no confirmada" : undefined} />;
}

function crossSlot(cross: Cross): number | null {
  const raw = cross.kind === "tie" ? cross.legs[0].bracket_slot : cross.match.bracket_slot;
  return raw ?? null;
}

function crossKey(cross: Cross): string {
  return cross.kind === "tie" ? cross.legs[0].id : cross.match.id;
}

// ponytail: alto de tarjeta fijo (medido en preview con MatchCard a 340px de
// ancho de columna) en vez de medir el DOM en el cliente — permite calcular las
// posiciones y las líneas del bracket como matemática pura en el server
// component. Si cambia el diseño de MatchCard (padding, tamaño de fuente), hay
// que volver a medir. TieCard es más alta que esto — un cruce ida/vuelta dentro
// de un bracket con líneas puede quedar un poco desalineado, no se resuelve acá.
const CARD_H = 104;
const GAP = 12;
const COL_W = 340;
const COL_GAP = 16;

// Centro Y de cada cruce, por ronda, alineado a bracket_slot (índice del array =
// slot). Ronda 0: distribuidos parejo. Ronda r>0: promedio de sus dos "padres"
// (slots 2j y 2j+1 de la ronda anterior) — así cada cruce queda centrado entre
// los dos que lo alimentan, sin necesitar medir nada.
function computeCenters(roundCrosses: Cross[][]): number[][] {
  const centers: number[][] = [];
  roundCrosses.forEach((crosses, ri) => {
    if (ri === 0) {
      centers.push(crosses.map((_, i) => i * (CARD_H + GAP) + CARD_H / 2));
    } else {
      const prev = centers[ri - 1];
      centers.push(
        crosses.map((_, j) => {
          const a = prev[j * 2];
          const b = prev[j * 2 + 1];
          return b != null ? (a + b) / 2 : a;
        })
      );
    }
  });
  return centers;
}

// Cuatro segmentos por cruce (ronda > 0): stub horizontal de cada padre hasta el
// punto medio entre columnas, la unión vertical entre ambos, y el stub final
// hasta el propio cruce — el codo clásico de un cuadro de eliminación.
function ConnectorLines({ roundCrosses, centers }: { roundCrosses: Cross[][]; centers: number[][] }) {
  const lines: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
  for (let ri = 1; ri < roundCrosses.length; ri++) {
    const prevRight = (ri - 1) * (COL_W + COL_GAP) + COL_W;
    const midX = prevRight + COL_GAP / 2;
    const targetLeft = ri * (COL_W + COL_GAP);
    roundCrosses[ri].forEach((cross, j) => {
      const yA = centers[ri - 1][j * 2];
      const yB = centers[ri - 1][j * 2 + 1];
      const yTarget = centers[ri][j];
      const key = crossKey(cross);
      if (yA == null || yB == null) return;
      lines.push({ x1: prevRight, y1: yA, x2: midX, y2: yA, key: `${key}-a` });
      lines.push({ x1: prevRight, y1: yB, x2: midX, y2: yB, key: `${key}-b` });
      lines.push({ x1: midX, y1: yA, x2: midX, y2: yB, key: `${key}-v` });
      lines.push({ x1: midX, y1: yTarget, x2: targetLeft, y2: yTarget, key: `${key}-t` });
    });
  }
  return (
    <>
      {lines.map((l) => (
        <line
          key={l.key}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke="currentColor"
          strokeWidth={2}
        />
      ))}
    </>
  );
}

export function Bracket({
  matches,
  mode,
}: {
  matches: StageMatch[];
  mode: "fijo" | "sorteo" | null;
}) {
  if (!matches.length) {
    return (
      <p className="font-body text-sm text-tinta/50">
        Todavía no hay partidos cargados para este cuadro.
      </p>
    );
  }

  const rounds = groupByRound(matches);

  if (mode === "fijo") {
    const roundCrosses = rounds.map((r) =>
      groupCrosses(r.matches).sort((a, b) => (crossSlot(a) ?? 0) - (crossSlot(b) ?? 0))
    );
    // Solo se dibujan líneas si TODOS los cruces de TODAS las rondas tienen slot
    // asignado (vienen del generador de cuadro) — sin eso no hay forma de saber
    // qué alimenta a qué, y se cae al layout simple en columnas sin conectores.
    const hasSlots = roundCrosses.every((rc) => rc.every((c) => crossSlot(c) != null));

    if (!hasSlots) {
      return (
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
          {rounds.map((r, ri) => (
            <div key={r.name} className="flex w-[340px] shrink-0 flex-col gap-3">
              <h3 className="font-mono text-[11px] tracking-[0.1em] text-azul-marino uppercase">
                {r.name}
              </h3>
              <div className="flex flex-col gap-3">
                {roundCrosses[ri].map((c) => (
                  <Cross key={crossKey(c)} cross={c} />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    const centers = computeCenters(roundCrosses);
    const totalHeight = Math.max(...centers[0]) + CARD_H / 2;
    const totalWidth = rounds.length * COL_W + (rounds.length - 1) * COL_GAP;

    return (
      <div className="no-scrollbar overflow-x-auto pb-2">
        <div className="relative" style={{ width: totalWidth, height: totalHeight + 28 }}>
          {rounds.map((r, ri) => (
            <h3
              key={r.name}
              className="absolute font-mono text-[11px] tracking-[0.1em] text-azul-marino uppercase"
              style={{ left: ri * (COL_W + COL_GAP), top: 0, width: COL_W }}
            >
              {r.name}
            </h3>
          ))}
          <svg
            className="absolute text-azul-marino/25"
            style={{ top: 28, left: 0 }}
            width={totalWidth}
            height={totalHeight}
          >
            <ConnectorLines roundCrosses={roundCrosses} centers={centers} />
          </svg>
          {roundCrosses.map((crosses, ri) =>
            crosses.map((c, j) => (
              <div
                key={crossKey(c)}
                className="absolute"
                style={{
                  left: ri * (COL_W + COL_GAP),
                  top: 28 + centers[ri][j] - CARD_H / 2,
                  width: COL_W,
                }}
              >
                <Cross cross={c} />
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Modo sorteo: rondas apiladas, solo las que ya tienen partidos cargados. Se
  // asume que la última ronda es la final cuando su nombre lo dice (heurística de
  // texto simple, no 100% robusta ante nombres de ronda no estándar) para no
  // seguir mostrando "próxima ronda por sortear" después de jugada la final.
  const lastRoundName = rounds[rounds.length - 1]?.name ?? "";
  const showPending = !lastRoundName.toLowerCase().includes("final");

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-8">
      {rounds.map((r) => (
        <div key={r.name} className="flex flex-col gap-3">
          <h3 className="font-mono text-[11px] tracking-[0.1em] text-azul-marino uppercase">
            {r.name}
          </h3>
          <div className="flex flex-col gap-3">
            {groupCrosses(r.matches).map((c) => (
              <Cross key={c.kind === "tie" ? c.legs[0].id : c.match.id} cross={c} />
            ))}
          </div>
        </div>
      ))}
      {showPending && (
        <p className="rounded-lg border border-dashed border-azul-marino/25 px-4 py-6 text-center font-mono text-[11px] text-azul-marino/60 uppercase">
          Los cruces de la siguiente ronda se definen por sorteo
        </p>
      )}
    </div>
  );
}
