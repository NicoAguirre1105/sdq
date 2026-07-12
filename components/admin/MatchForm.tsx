"use client";

import { useActionState } from "react";
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
  home_team_id: string;
  away_team_id: string;
  match_date: string | null;
  score_home: number | null;
  score_away: number | null;
  status: string;
};

const label =
  "block font-mono text-[10px] tracking-[0.1em] text-tinta/55 uppercase";
const field =
  "mt-1.5 w-full rounded-md border border-azul-marino/20 bg-white px-3.5 py-2.5 font-body text-sm text-tinta outline-none focus:border-azul-marino";

export function MatchForm({
  stageId,
  stageFormat,
  stageLabel,
  teams,
  match,
  backHref,
}: {
  stageId: string;
  stageFormat: "liga" | "eliminacion";
  stageLabel: string;
  teams: Team[];
  match?: MatchValues;
  backHref: string;
}) {
  const editing = !!match;
  const action = editing ? updateMatch : createMatch;
  const [state, formAction, isPending] = useActionState<MatchFormState, FormData>(
    withOfflineGuard(action),
    {}
  );

  return (
    <>
      <form action={formAction}>
        <input type="hidden" name="stage_id" value={stageId} />
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
              className="rounded-md bg-rojo-bandera px-4 py-2 font-body text-xs font-bold text-white transition-colors hover:bg-rojo-bandera-hover disabled:opacity-60"
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
                required
                className={field}
              >
                <option value="">Elegí equipo…</option>
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
                required
                className={field}
              >
                <option value="">Elegí equipo…</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="sm:min-w-[200px] sm:flex-[1.4]">
              <label htmlFor="match_date" className={label}>
                Fecha y hora
              </label>
              <input
                id="match_date"
                name="match_date"
                type="datetime-local"
                defaultValue={toQuitoInput(match?.match_date ?? null)}
                className={`${field} min-w-0 font-mono`}
              />
              <p className="mt-1 font-mono text-[9px] text-tinta/40">
                Vacío = fecha sin confirmar.
              </p>
            </div>
            <div className="sm:min-w-[120px] sm:flex-1">
              {stageFormat === "liga" ? (
                <>
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
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>

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
