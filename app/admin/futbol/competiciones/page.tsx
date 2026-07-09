import Link from "next/link";
import {
  getSeasons,
  getCompetitionsWithSeason,
} from "@/lib/supabase/queries/competitions";
import {
  createSeason,
  deleteSeason,
  createCompetition,
  deleteCompetition,
} from "@/lib/actions/competitions";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Toast } from "@/components/ui/Toast";

const label = "block font-mono text-[10px] tracking-[0.1em] text-tinta/55 uppercase";
const field =
  "mt-1.5 w-full rounded-md border border-azul-marino/20 bg-white px-3.5 py-2.5 font-body text-sm text-tinta outline-none focus:border-azul-marino";
const card = "rounded-lg border border-azul-marino/12 bg-white";

export default async function CompetitionsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [seasons, competitions] = await Promise.all([
    getSeasons(),
    getCompetitionsWithSeason(),
  ]);

  return (
    <>
      <header className="flex items-center gap-3 border-b border-azul-marino/10 bg-white px-6 py-4">
        <Link
          href="/admin/futbol"
          className="font-mono text-lg text-tinta/40 hover:text-tinta"
        >
          ←
        </Link>
        <div>
          <h1 className="font-display text-3xl text-tinta">COMPETICIONES</h1>
          <p className="font-mono text-[10px] text-tinta/45">
            Temporadas y torneos
          </p>
        </div>
      </header>

      <Toast
        message={
          error
            ? `No se pudo guardar ${error === "season" ? "la temporada" : "la competición"}. Revisá los datos.`
            : null
        }
      />

      <div className="grid gap-6 px-6 py-6 lg:grid-cols-2">

        {/* Temporadas */}
        <section>
          <h2 className="mb-3 font-display text-xl text-tinta">TEMPORADAS</h2>
          <form action={createSeason} className={`${card} mb-4 p-4`}>
            <label htmlFor="label" className={label}>
              Nueva temporada
            </label>
            <input
              id="label"
              name="label"
              required
              placeholder="2027"
              className={field}
            />
            <label className="mt-3 flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                name="is_current"
                className="size-4 accent-rojo-bandera"
              />
              <span className="font-body text-sm text-tinta">Es la vigente</span>
            </label>
            <button
              type="submit"
              className="mt-3 rounded-md bg-azul-marino px-4 py-2 font-body text-xs font-bold text-white transition-colors hover:bg-azul-marino/90"
            >
              + Agregar temporada
            </button>
          </form>

          {seasons.length > 0 && (
            <ul className={card}>
              {seasons.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-3 border-t border-azul-marino/8 px-4 py-3 first:border-t-0"
                >
                  <span className="flex-1 font-body text-sm font-semibold text-tinta">
                    {s.label}
                  </span>
                  {s.is_current && (
                    <span className="rounded bg-dorado-escudo/15 px-2 py-1 font-mono text-[9px] font-bold text-dorado-escudo">
                      VIGENTE
                    </span>
                  )}
                  <DeleteButton
                    action={deleteSeason}
                    id={s.id}
                    message={`¿Eliminar la temporada ${s.label}? Se borran también sus competiciones, tablas y TODOS sus partidos. No se puede deshacer.`}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Competiciones */}
        <section>
          <h2 className="mb-3 font-display text-xl text-tinta">TORNEOS</h2>
          {seasons.length === 0 ? (
            <p className="font-body text-sm text-tinta/55">
              Creá una temporada primero.
            </p>
          ) : (
            <form action={createCompetition} className={`${card} mb-4 p-4`}>
              <label htmlFor="season_id" className={label}>
                Temporada
              </label>
              <select id="season_id" name="season_id" required className={`${field} mb-3`}>
                {seasons.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                    {s.is_current ? " (vigente)" : ""}
                  </option>
                ))}
              </select>
              <label htmlFor="name" className={label}>
                Nombre del torneo
              </label>
              <input
                id="name"
                name="name"
                required
                placeholder="Serie B 2027, Copa Ecuador…"
                className={field}
              />
              <button
                type="submit"
                className="mt-3 rounded-md bg-azul-marino px-4 py-2 font-body text-xs font-bold text-white transition-colors hover:bg-azul-marino/90"
              >
                + Agregar torneo
              </button>
            </form>
          )}

          {competitions.length > 0 && (
            <ul className={card}>
              {competitions.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 border-t border-azul-marino/8 px-4 py-3 first:border-t-0"
                >
                  <div className="min-w-0 flex-1">
                    <span className="line-clamp-1 font-body text-sm font-semibold text-tinta">
                      {c.name}
                    </span>
                    <span className="font-mono text-[10px] text-tinta/45">
                      {c.seasonLabel}
                    </span>
                  </div>
                  <DeleteButton
                    action={deleteCompetition}
                    id={c.id}
                    message={`¿Eliminar ${c.name}? Se borran también sus tablas y TODOS sus partidos. No se puede deshacer.`}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
