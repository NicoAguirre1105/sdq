import Link from "next/link";
import { getAllCanticos } from "@/lib/supabase/queries/canticos";
import { setCanticoPosition } from "@/lib/actions/canticos";

export default async function AdminCanticosPage() {
  const canticos = await getAllCanticos();
  const publishedCount = canticos.filter((c) => c.published).length;

  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b border-azul-marino/10 bg-white px-6 py-4">
        <div>
          <h1 className="font-display text-3xl text-tinta">CÁNTICOS</h1>
          <p className="font-mono text-[10px] text-tinta/45">
            {publishedCount} publicados · {canticos.length - publishedCount} borradores
          </p>
        </div>
        <Link
          href="/admin/canticos/new"
          className="rounded-md bg-rojo-bandera px-4 py-2.5 font-body text-xs font-bold text-white transition-colors hover:bg-rojo-bandera-hover"
        >
          + Nuevo cántico
        </Link>
      </header>

      <div className="px-6 py-6">
        {canticos.length === 0 ? (
          <p className="font-body text-sm text-tinta/55">
            Todavía no hay cánticos. Creá el primero con “Nuevo cántico”.
          </p>
        ) : (
          <ul className="overflow-hidden rounded-lg border border-azul-marino/12 bg-white">
            {canticos.map((cantico, i) => (
              <li
                key={cantico.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-azul-marino/8 px-4 py-3 first:border-t-0"
              >
                <form action={setCanticoPosition} className="flex flex-none items-center gap-1">
                  <input type="hidden" name="id" value={cantico.id} />
                  <input
                    type="number"
                    name="position"
                    defaultValue={i + 1}
                    min={1}
                    max={canticos.length}
                    className="w-12 rounded border border-azul-marino/20 px-1.5 py-1 text-center font-mono text-xs text-tinta"
                  />
                  <button
                    type="submit"
                    className="font-mono text-[10px] font-semibold text-azul-marino hover:underline"
                  >
                    IR
                  </button>
                </form>

                <Link
                  href={`/admin/canticos/${cantico.id}/edit`}
                  className="min-w-0 flex-1 font-body text-sm font-semibold text-tinta hover:text-azul-marino"
                >
                  <span className="line-clamp-1">{cantico.title}</span>
                </Link>

                {cantico.classic && (
                  <span className="rounded-sm bg-dorado-escudo/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-dorado-escudo">
                    CLÁSICO
                  </span>
                )}

                <span
                  className={`rounded px-2 py-1 font-mono text-[9px] font-bold ${
                    cantico.published
                      ? "bg-[#1E8A5B]/12 text-[#1E8A5B]"
                      : "bg-tinta/8 text-tinta/50"
                  }`}
                >
                  {cantico.published ? "● PUBLICADO" : "○ BORRADOR"}
                </span>

                <Link
                  href={`/admin/canticos/${cantico.id}/edit`}
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
