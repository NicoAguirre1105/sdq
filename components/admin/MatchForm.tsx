"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  createMatch,
  updateMatch,
  deleteMatch,
  type MatchFormState,
} from "@/lib/actions/matches";
import { Toast } from "@/components/ui/Toast";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { withOfflineGuard } from "@/lib/action-guard";
import { toQuitoInput } from "@/lib/format";

type Team = { id: string; name: string };

type MatchValues = {
  id: string;
  matchday: number | null;
  round_name: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  match_date: string | null;
  score_home: number | null;
  score_away: number | null;
  status: string;
  ticket_url: string | null;
  venue: string | null;
  tie_id: string | null;
  leg: number | null;
};

const label =
  "block font-mono text-[10px] tracking-[0.1em] text-tinta/55 uppercase";
const field =
  "mt-1.5 w-full rounded-md border border-azul-marino/20 bg-white px-3.5 py-2.5 font-body text-sm text-tinta outline-none focus:border-azul-marino";

export function MatchForm({
  stageId,
  stageFormat,
  stageBracketMode,
  stageLabel,
  teams,
  idaCandidates = [],
  match,
  backHref,
}: {
  stageId: string;
  stageFormat: "liga" | "eliminacion";
  stageBracketMode?: "fijo" | "sorteo" | null;
  stageLabel: string;
  teams: Team[];
  idaCandidates?: { id: string; label: string }[];
  match?: MatchValues;
  backHref: string;
}) {
  const editing = !!match;
  const action = editing ? updateMatch : createMatch;
  const [state, formAction, isPending] = useActionState<MatchFormState, FormData>(
    withOfflineGuard(action),
    {}
  );

  // date + time nativos por separado en vez de un solo datetime-local: en iOS
  // Safari ese control combinado ("19 Jul 2026 at 11:05") no respeta el ancho de
  // su caja y empuja el layout — cada input por separado es angosto de sobra.
  // Se combinan acá para seguir mandando un solo campo match_date, así el server
  // action no cambia.
  const [initialDate, initialTime] = toQuitoInput(match?.match_date ?? null).split("T");
  const [matchDate, setMatchDate] = useState(initialDate ?? "");
  const [matchTime, setMatchTime] = useState(initialTime ?? "");
  const [legChoice, setLegChoice] = useState(match?.leg ? String(match.leg) : "");

  // Equipos "por definir" solo tienen sentido en un cuadro fijo (se conoce la
  // estructura antes de saber quién avanza). En sorteo y liga siguen obligatorios.
  const teamsRequired = !(stageFormat === "eliminacion" && stageBracketMode === "fijo");

  return (
    <>
      <form action={formAction}>
        <input type="hidden" name="stage_id" value={stageId} />
        <input type="hidden" name="stage_bracket_mode" value={stageBracketMode ?? ""} />
        {editing && <input type="hidden" name="id" value={match.id} />}

        <header className="flex items-center justify-between gap-3 border-b border-azul-marino/10 bg-white px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link
              href={backHref}
              className="font-mono text-lg text-tinta/40 hover:text-tinta"
            >
              ←
            </Link>
            <div>
              <h1 className="font-display text-2xl text-tinta">
                {editing ? "EDITAR PARTIDO" : "CARGAR PARTIDO"}
              </h1>
              <p className="font-mono text-[10px] text-tinta/45">{stageLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={backHref}
              className="rounded-md border border-azul-marino/16 px-3.5 py-2 font-body text-xs font-bold text-tinta/60"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-rojo-bandera px-4 py-2 font-body text-xs font-bold text-white transition-[background-color,transform] duration-150 ease-out-strong hover:bg-rojo-bandera-hover active:scale-[0.97] disabled:opacity-60"
            >
              {isPending ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </header>

        <Toast message={state.error} />

        <div className="mx-auto max-w-2xl px-6 py-6">
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="min-w-[180px] flex-1">
              <label htmlFor="home_team_id" className={label}>
                Local
              </label>
              <select
                id="home_team_id"
                name="home_team_id"
                defaultValue={match?.home_team_id ?? ""}
                required={teamsRequired}
                className={field}
              >
                <option value="">Elige equipo…</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[180px] flex-1">
              <label htmlFor="away_team_id" className={label}>
                Visitante
              </label>
              <select
                id="away_team_id"
                name="away_team_id"
                defaultValue={match?.away_team_id ?? ""}
                required={teamsRequired}
                className={field}
              >
                <option value="">Elige equipo…</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="sm:min-w-[240px] sm:flex-[1.4]">
              <label htmlFor="match_date" className={label}>
                Fecha y hora
              </label>
              <input
                type="hidden"
                name="match_date"
                value={matchDate && matchTime ? `${matchDate}T${matchTime}` : ""}
              />
              <div className="flex gap-2">
                <input
                  id="match_date"
                  type="date"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  className={`${field} min-w-0 flex-[1.3] font-mono`}
                />
                <input
                  type="time"
                  value={matchTime}
                  onChange={(e) => setMatchTime(e.target.value)}
                  className={`${field} min-w-0 flex-1 font-mono`}
                />
              </div>
              <p className="mt-1 font-mono text-[9px] text-tinta/40">
                Vacío = fecha sin confirmar.
              </p>
            </div>
            {stageFormat === "liga" ? (
              <div className="sm:min-w-[120px] sm:flex-1">
                <label htmlFor="matchday" className={label}>
                  Fecha (matchday)
                </label>
                <input
                  id="matchday"
                  name="matchday"
                  type="number"
                  min={1}
                  defaultValue={match?.matchday ?? ""}
                  className={`${field} font-mono`}
                />
              </div>
            ) : (
              <>
                <div className="sm:min-w-[160px] sm:flex-1">
                  <label htmlFor="round_name" className={label}>
                    Ronda
                  </label>
                  <input
                    id="round_name"
                    name="round_name"
                    type="text"
                    placeholder="Cuartos de Final"
                    defaultValue={match?.round_name ?? ""}
                    className={field}
                  />
                </div>
                <div className="sm:min-w-[110px] sm:flex-1">
                  <label htmlFor="matchday" className={label}>
                    Orden de ronda
                  </label>
                  <input
                    id="matchday"
                    name="matchday"
                    type="number"
                    min={1}
                    defaultValue={match?.matchday ?? ""}
                    className={`${field} font-mono`}
                  />
                  <p className="mt-1 font-mono text-[9px] text-tinta/40">
                    1 = primera ronda del cuadro, 2 = la siguiente…
                  </p>
                </div>
              </>
            )}
          </div>

          {stageFormat === "eliminacion" && (
            <div className="mb-4 flex flex-col gap-4 sm:flex-row">
              <div className="sm:min-w-[160px] sm:flex-1">
                <label htmlFor="leg" className={label}>
                  Ida / vuelta
                </label>
                <select
                  id="leg"
                  name="leg"
                  value={legChoice}
                  onChange={(e) => setLegChoice(e.target.value)}
                  className={field}
                >
                  <option value="">Partido único</option>
                  <option value="1">Ida</option>
                  <option value="2">Vuelta</option>
                </select>
              </div>
              {legChoice === "2" && (
                <div className="sm:min-w-[220px] sm:flex-[1.4]">
                  <label htmlFor="ida_match_id" className={label}>
                    Corresponde a la ida de…
                  </label>
                  <select
                    id="ida_match_id"
                    name="ida_match_id"
                    defaultValue=""
                    required
                    className={field}
                  >
                    <option value="">Elige el partido de ida…</option>
                    {idaCandidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  {idaCandidates.length === 0 && (
                    <p className="mt-1 font-mono text-[9px] text-rojo-bandera">
                      No hay partidos de ida sin vuelta enlazada todavía en este stage.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mb-4 flex flex-wrap gap-4">
            <div className="min-w-[100px] flex-1">
              <label htmlFor="score_home" className={label}>
                Goles local
              </label>
              <input
                id="score_home"
                name="score_home"
                type="number"
                min={0}
                defaultValue={match?.score_home ?? ""}
                className={`${field} font-mono`}
              />
            </div>
            <div className="min-w-[100px] flex-1">
              <label htmlFor="score_away" className={label}>
                Goles visitante
              </label>
              <input
                id="score_away"
                name="score_away"
                type="number"
                min={0}
                defaultValue={match?.score_away ?? ""}
                className={`${field} font-mono`}
              />
            </div>
            <div className="min-w-[140px] flex-1">
              <label htmlFor="status" className={label}>
                Estado
              </label>
              <select
                id="status"
                name="status"
                defaultValue={match?.status ?? "programado"}
                className={field}
              >
                <option value="programado">Programado</option>
                <option value="jugado">Jugado</option>
                <option value="suspendido">Suspendido</option>
              </select>
            </div>
          </div>

          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="ticket_url" className={label}>
                Link de entradas (opcional)
              </label>
              <input
                id="ticket_url"
                name="ticket_url"
                type="url"
                placeholder="https://..."
                defaultValue={match?.ticket_url ?? ""}
                className={field}
              />
              <p className="mt-1 font-mono text-[9px] text-tinta/40">
                Vacío = sin botón de &quot;Comprar entradas&quot; en Home.
              </p>
            </div>
            <div className="flex-1">
              <label htmlFor="venue" className={label}>
                Estadio (opcional)
              </label>
              <input
                id="venue"
                name="venue"
                type="text"
                placeholder="Est. Atahualpa"
                defaultValue={match?.venue ?? ""}
                className={field}
              />
              <p className="mt-1 font-mono text-[9px] text-tinta/40">
                Vacío = sin estadio confirmado.
              </p>
            </div>
          </div>
        </div>
      </form>

      {editing && (
        <div className="mx-auto max-w-2xl px-6 pb-10">
          <DeleteButton
            action={deleteMatch}
            id={match.id}
            extraFields={{ stage_id: stageId }}
            label="Eliminar partido"
            message="¿Eliminar este partido? No se puede deshacer."
            className="rounded-md border border-rojo-bandera/40 px-4 py-2 font-body text-xs font-bold text-rojo-bandera transition-colors hover:bg-rojo-bandera hover:text-white"
          />
        </div>
      )}
    </>
  );
}
