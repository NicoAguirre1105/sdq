"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createStage, type StageFormState } from "@/lib/actions/stages";
import { Toast } from "@/components/ui/Toast";
import { withOfflineGuard } from "@/lib/action-guard";

type Option = { id: string; label: string };
type Team = { id: string; name: string };

const label =
  "block font-mono text-[10px] tracking-[0.1em] text-tinta/55 uppercase";
const field =
  "mt-1.5 w-full rounded-md border border-azul-marino/20 bg-white px-3.5 py-2.5 font-body text-sm text-tinta outline-none focus:border-azul-marino";

export function StageForm({
  competitions,
  teams,
}: {
  competitions: Option[];
  teams: Team[];
}) {
  const [state, formAction, isPending] = useActionState<StageFormState, FormData>(
    withOfflineGuard(createStage),
    {}
  );
  const [format, setFormat] = useState<"liga" | "eliminacion">("liga");
  const [bracketMode, setBracketMode] = useState<"fijo" | "sorteo">("sorteo");

  return (
    <form action={formAction}>
      <header className="flex items-center justify-between gap-3 border-b border-azul-marino/10 bg-white px-6 py-3.5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/futbol"
            className="font-mono text-lg text-tinta/40 hover:text-tinta"
          >
            ←
          </Link>
          <h1 className="font-display text-2xl text-tinta">NUEVA TABLA / STAGE</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/futbol"
            className="rounded-md border border-azul-marino/16 px-3.5 py-2 font-body text-xs font-bold text-tinta/60"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-rojo-bandera px-4 py-2 font-body text-xs font-bold text-white transition-colors hover:bg-rojo-bandera-hover disabled:opacity-60"
          >
            {isPending ? "Creando…" : "Crear stage"}
          </button>
        </div>
      </header>

      <Toast message={state.error} />

      <div className="mx-auto max-w-2xl px-6 py-6">

        {competitions.length === 0 ? (
          <p className="rounded-md bg-azul-marino/6 px-3 py-3 font-body text-sm text-tinta/70">
            No hay competiciones cargadas.{" "}
            <Link href="/admin/futbol/competiciones" className="font-bold text-azul-marino underline">
              Crea una temporada y un torneo
            </Link>{" "}
            y vuelve a agregarle stages.
          </p>
        ) : (
          <>
            <label htmlFor="competition_id" className={label}>
              Competición
            </label>
            <select
              id="competition_id"
              name="competition_id"
              required
              className={field}
            >
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="mt-1 mb-4 font-mono text-[9px] text-tinta/40">
              ¿Falta un torneo o temporada?{" "}
              <Link href="/admin/futbol/competiciones" className="font-bold text-azul-marino underline">
                Créalo acá
              </Link>
              .
            </p>

            <div className="mb-4 flex flex-wrap gap-4">
              <div className="min-w-[200px] flex-[2]">
                <label htmlFor="name" className={label}>
                  Nombre del stage
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  placeholder="Fase 1, Grupo A, Octavos…"
                  className={field}
                />
              </div>
              <div className="min-w-[90px] flex-1">
                <label htmlFor="order_index" className={label}>
                  Orden
                </label>
                <input
                  id="order_index"
                  name="order_index"
                  type="number"
                  min={0}
                  defaultValue={1}
                  className={`${field} font-mono`}
                />
              </div>
            </div>

            <label htmlFor="format" className={label}>
              Formato
            </label>
            <select
              id="format"
              name="format"
              value={format}
              onChange={(e) => setFormat(e.target.value as "liga" | "eliminacion")}
              className={`${field} mb-4`}
            >
              <option value="liga">Liga (tabla de posiciones)</option>
              <option value="eliminacion">Eliminación (llaves)</option>
            </select>

            {format === "liga" ? (
              <>
                <span className={label}>Equipos participantes</span>
                <p className="mt-1 mb-2 font-mono text-[9px] text-tinta/40">
                  La tabla se calcula a partir de estos equipos. Elige al menos 2.
                </p>
                <div className="grid grid-cols-1 gap-1.5 rounded-md border border-azul-marino/15 bg-white p-3 sm:grid-cols-2">
                  {teams.map((t) => (
                    <label
                      key={t.id}
                      className="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 hover:bg-azul-marino/5"
                    >
                      <input
                        type="checkbox"
                        name="team_ids"
                        value={t.id}
                        className="size-4 accent-azul-marino"
                      />
                      <span className="font-body text-sm text-tinta">{t.name}</span>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <>
                <label htmlFor="bracket_mode" className={label}>
                  Cómo se arma el cuadro
                </label>
                <select
                  id="bracket_mode"
                  name="bracket_mode"
                  value={bracketMode}
                  onChange={(e) => setBracketMode(e.target.value as "fijo" | "sorteo")}
                  className={`${field} mb-2`}
                >
                  <option value="sorteo">Por sorteo (se define ronda a ronda)</option>
                  <option value="fijo">Fijo (el cuadro completo ya se conoce)</option>
                </select>
                <p className="rounded-md bg-azul-marino/6 px-3 py-3 font-mono text-[11px] leading-relaxed text-azul-marino">
                  Por sorteo: cargas los partidos de cada ronda recién cuando se
                  sabe quién juega. Fijo: podés cargar de una todas las rondas hasta
                  la final, dejando el equipo en blanco donde todavía no se sepa.
                  No genera tabla de posiciones.
                </p>

                {bracketMode === "fijo" && (
                  <div className="mt-3">
                    <label htmlFor="total_rounds" className={label}>
                      Número de rondas totales (hasta la final)
                    </label>
                    <input
                      id="total_rounds"
                      name="total_rounds"
                      type="number"
                      min={1}
                      max={6}
                      defaultValue={3}
                      className={`${field} font-mono`}
                    />
                    <p className="mt-1 font-mono text-[9px] text-tinta/40">
                      Ej. 4 = octavos, cuartos, semifinal, final. Genera esa cantidad
                      de partidos "por definir" listos para ir completando — no hace
                      falta cargarlos uno por uno.
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </form>
  );
}
