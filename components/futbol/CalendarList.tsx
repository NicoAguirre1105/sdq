"use client";

import { useState } from "react";
import { formatMatchDate } from "@/lib/format";
import type { OwnTeamMatch } from "@/lib/supabase/queries/matches";

const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "jugados", label: "Jugados" },
  { key: "proximos", label: "Próximos" },
  { key: "local", label: "Local" },
  { key: "visitante", label: "Visitante" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

const PILL = {
  V: "bg-[#1a7f4b] text-white",
  E: "bg-dorado-escudo text-azul-marino",
  D: "bg-rojo-bandera text-white",
} as const;

// Vista del partido desde la perspectiva del equipo propio.
function perspective(m: OwnTeamMatch) {
  const isLocal = m.homeTeam?.is_own_team ?? false;
  const opponent = isLocal ? m.awayTeam : m.homeTeam;
  const ownScore = isLocal ? m.score_home : m.score_away;
  const oppScore = isLocal ? m.score_away : m.score_home;
  const played = m.status === "jugado" && ownScore != null && oppScore != null;
  const result: keyof typeof PILL | null = played
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
        <ul className="divide-y divide-azul-marino/12">
          {filtered.map((m) => {
            const { isLocal, opponent, ownScore, oppScore, played, result } = perspective(m);
            const opponentName = (opponent?.short_name ?? opponent?.name ?? "Por definir").toUpperCase();
            const dt = formatMatchDate(m.match_date);
            const isNext = m.id === nextId;

            return (
              <li
                key={m.id}
                className={`flex items-center gap-3 py-3.5 md:gap-5 ${
                  isNext ? "border-l-2 border-dorado-escudo pl-3" : ""
                }`}
              >
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
                <div className="min-w-0">
                  <p className="font-display text-lg leading-none tracking-[0.02em] text-tinta md:text-xl">
                    vs {opponentName}
                  </p>
                  {m.competition && (
                    <p className="mt-1 truncate font-mono text-[10px] tracking-[0.06em] text-tinta/45 uppercase">
                      {m.competition}
                    </p>
                  )}
                </div>

                <div className="ml-auto flex items-center gap-2.5">
                  {isNext && (
                    <span className="font-mono text-[9px] tracking-[0.1em] text-dorado-escudo uppercase">
                      Próximo
                    </span>
                  )}
                  {played ? (
                    <>
                      <span className="font-display text-xl text-tinta tabular-nums md:text-2xl">
                        {ownScore}–{oppScore}
                      </span>
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded font-mono text-[11px] font-bold ${PILL[result!]}`}
                      >
                        {result}
                      </span>
                    </>
                  ) : (
                    <span className="font-mono text-[11px] text-tinta/40 uppercase">
                      {m.status === "suspendido" ? "Susp." : "Por jugar"}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
