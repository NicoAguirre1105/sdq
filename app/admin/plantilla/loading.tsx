import Link from "next/link";
import { TableSkeleton } from "@/components/ui/TableSkeleton";

export default function AdminPlantillaLoading() {
  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-azul-marino/10 bg-white px-6 py-4">
        <div>
          <h1 className="font-display text-3xl text-tinta">PLANTILLA</h1>
          <div className="mt-1.5 h-2.5 w-24 animate-pulse rounded bg-azul-marino/10" />
        </div>
        <Link
          href="/admin/plantilla/new"
          className="rounded-md bg-rojo-bandera px-4 py-2.5 font-body text-xs font-bold text-white transition-colors hover:bg-rojo-bandera-hover"
        >
          + Nuevo jugador
        </Link>
      </header>

      <div className="px-6 py-6">
        <TableSkeleton rows={8} />
      </div>
    </>
  );
}
