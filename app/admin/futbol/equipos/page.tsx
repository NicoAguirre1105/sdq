import Link from "next/link";
import { getAllTeams } from "@/lib/supabase/queries/teams";
import { Toast } from "@/components/ui/Toast";

export default async function AdminTeamsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const teams = await getAllTeams();

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-azul-marino/10 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/futbol"
            className="font-mono text-lg text-tinta/40 hover:text-tinta"
          >
            ←
          </Link>
          <div>
            <h1 className="font-display text-3xl text-tinta">EQUIPOS</h1>
            <p className="font-mono text-[10px] text-tinta/45">
              Catálogo maestro · {teams.length} equipos
            </p>
          </div>
        </div>
        <Link
          href="/admin/futbol/equipos/new"
          className="rounded-md bg-rojo-bandera px-4 py-2.5 font-body text-xs font-bold text-white transition-colors hover:bg-rojo-bandera-hover"
        >
          + Nuevo equipo
        </Link>
      </header>

      <Toast
        message={
          error === "en-uso"
            ? "No se puede eliminar: el equipo tiene partidos o está en una tabla."
            : null
        }
      />

      <div className="px-6 py-6">

        {teams.length === 0 ? (
          <p className="font-body text-sm text-tinta/55">
            Todavía no hay equipos. Creá el primero con “Nuevo equipo”.
          </p>
        ) : (
          <ul className="overflow-hidden rounded-lg border border-azul-marino/12 bg-white">
            {teams.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-azul-marino/8 px-4 py-3 first:border-t-0"
              >
                <Link
                  href={`/admin/futbol/equipos/${t.id}/edit`}
                  className="min-w-0 flex-1 font-body text-sm font-semibold text-tinta hover:text-azul-marino"
                >
                  <span className="line-clamp-1">{t.name}</span>
                </Link>
                {t.short_name && (
                  <span className="font-mono text-[10px] text-tinta/45">
                    {t.short_name}
                  </span>
                )}
                {t.is_own_team && (
                  <span className="rounded bg-rojo-bandera/12 px-2 py-1 font-mono text-[9px] font-bold text-rojo-bandera">
                    PROPIO
                  </span>
                )}
                <Link
                  href={`/admin/futbol/equipos/${t.id}/edit`}
                  className="font-mono text-[10px] font-semibold text-azul-marino hover:underline"
                >
                  EDITAR
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
