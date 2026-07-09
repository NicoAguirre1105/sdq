import Link from "next/link";
import { getSquad } from "@/lib/supabase/queries/players";

export default async function AdminPlantillaPage() {
  const players = await getSquad();

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-azul-marino/10 bg-white px-6 py-4">
        <div>
          <h1 className="font-display text-3xl text-tinta">PLANTILLA</h1>
          <p className="font-mono text-[10px] text-tinta/45">
            {players.length} jugadores
          </p>
        </div>
        <Link
          href="/admin/plantilla/new"
          className="rounded-md bg-rojo-bandera px-4 py-2.5 font-body text-xs font-bold text-white transition-colors hover:bg-rojo-bandera-hover"
        >
          + Nuevo jugador
        </Link>
      </header>

      <div className="px-6 py-6">
        {players.length === 0 ? (
          <p className="font-body text-sm text-tinta/55">
            Todavía no hay jugadores. Creá el primero con “Nuevo jugador”.
          </p>
        ) : (
          <ul className="overflow-hidden rounded-lg border border-azul-marino/12 bg-white">
            {players.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-azul-marino/8 px-4 py-3 first:border-t-0"
              >
                <span className="w-8 flex-none text-right font-display text-xl text-dorado-escudo">
                  {p.jersey_number ?? "—"}
                </span>
                <Link
                  href={`/admin/plantilla/${p.id}/edit`}
                  className="min-w-0 flex-1 font-body text-sm font-semibold text-tinta hover:text-azul-marino"
                >
                  <span className="line-clamp-1">{p.full_name}</span>
                </Link>
                <span className="font-mono text-[10px] text-tinta/45">
                  {p.position ?? "—"}
                </span>
                <Link
                  href={`/admin/plantilla/${p.id}/edit`}
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
