"use client";

import { useState } from "react";
import { MatchScroller } from "@/components/futbol/MatchScroller";
import type { OwnTeamMatch } from "@/lib/supabase/queries/matches";

const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "jugados", label: "Jugados" },
  { key: "proximos", label: "Próximos" },
  { key: "local", label: "Local" },
  { key: "visitante", label: "Visitante" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

// Vista del partido desde la perspectiva del equipo propio (para el resumen
// V/E/D y el filtro local/visitante — MatchCard ya calcula el resultado por su
// cuenta para el pill de color).
function perspective(m: OwnTeamMatch) {
  const isLocal = m.homeTeam?.is_own_team ?? false;
  const opponent = isLocal ? m.awayTeam : m.homeTeam;
  const ownScore = isLocal ? m.score_home : m.score_away;
  const oppScore = isLocal ? m.score_away : m.score_home;
  const played = m.status === "jugado" && ownScore != null && oppScore != null;
  const result: "V" | "E" | "D" | null = played
    ? ownScore! > oppScore!
      ? "V"
      : ownScore! === oppScore!
        ? "E"
        : "D"
    : null;
  return { isLocal, opponent, ownScore, oppScore, played, result };
}

export function CalendarList({ matches }: { matches: OwnTeamMatch[] }) {
  const [filter, setFilter] = useState<FilterKey>("todos");

  const record = matches.reduce(
    (acc, m) => {
      const r = perspective(m).result;
      if (r) acc[r]++;
      return acc;
    },
    { V: 0, E: 0, D: 0 }
  );

  // matches viene ordenado por fecha asc → el primer 'programado' con fecha es el
  // próximo. Los partidos sin fecha confirmada nunca se destacan como "próximo".
  const nextId = matches.find((m) => m.status === "programado" && m.match_date)?.id;

  const filtered = matches.filter((m) => {
    const { isLocal } = perspective(m);
    switch (filter) {
      case "jugados":
        return m.status === "jugado";
      case "proximos":
        return m.status === "programado";
      case "local":
        return isLocal;
      case "visitante":
        return !isLocal;
      default:
        return true;
    }
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-tinta/60">
        <span>
          <strong className="font-bold text-azul-marino">{record.V}</strong> Ganados
        </span>
        <span>
          <strong className="font-bold text-azul-marino">{record.E}</strong> Empates
        </span>
        <span>
          <strong className="font-bold text-azul-marino">{record.D}</strong> Perdidos
        </span>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={`rounded-full px-3.5 py-1.5 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors ${
              filter === f.key
                ? "bg-azul-marino text-blanco-hueso"
                : "border border-azul-marino/25 text-azul-marino hover:bg-azul-marino/8"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="font-body text-sm text-tinta/50">No hay partidos para este filtro.</p>
      ) : (
        <MatchScroller
          matches={filtered}
          nextId={nextId}
          topLabelFor={(m) => m.competition ?? undefined}
        />
      )}
    </div>
  );
}
