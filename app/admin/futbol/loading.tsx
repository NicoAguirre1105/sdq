import { TableSkeleton } from "@/components/ui/TableSkeleton";

export default function AdminFutbolLoading() {
  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-azul-marino/10 bg-white px-6 py-4">
        <div>
          <h1 className="font-display text-3xl text-tinta">FÚTBOL</h1>
          <p className="font-mono text-[10px] text-tinta/45">Gestión de torneos y partidos</p>
        </div>
      </header>

      <div className="px-6 py-6">
        <div className="mb-6 h-8 w-64 animate-pulse rounded bg-azul-marino/10" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <TableSkeleton rows={6} />
          <TableSkeleton rows={5} />
        </div>
      </div>
    </>
  );
}
