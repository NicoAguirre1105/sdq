import { TableSkeleton } from "@/components/ui/TableSkeleton";

export default function AdminSubscribersLoading() {
  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b border-azul-marino/10 bg-white px-6 py-4">
        <div>
          <h1 className="font-display text-3xl text-tinta">SUSCRIPTORES</h1>
          <div className="mt-1.5 h-2.5 w-40 animate-pulse rounded bg-azul-marino/10" />
        </div>
      </header>

      <div className="px-6 py-6">
        <TableSkeleton rows={6} />
      </div>
    </>
  );
}
