// Skeleton para listas de partidos del admin (fila: fecha · L/V · rival · dato a
// la derecha) — no una tabla.
export function MatchListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-azul-marino/12">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 py-3.5 md:gap-5">
          <div className="w-24 shrink-0 md:w-28">
            <div
              className="h-2.5 w-10 animate-pulse rounded bg-azul-marino/10"
              style={{ animationDelay: `${i * 80}ms` }}
            />
            <div
              className="mt-1.5 h-5 w-14 animate-pulse rounded bg-azul-marino/10"
              style={{ animationDelay: `${i * 80 + 40}ms` }}
            />
          </div>
          <div
            className="h-6 w-6 shrink-0 animate-pulse rounded bg-azul-marino/10"
            style={{ animationDelay: `${i * 80}ms` }}
          />
          <div
            className="h-5 max-w-[160px] flex-1 animate-pulse rounded bg-azul-marino/10"
            style={{ animationDelay: `${i * 80 + 40}ms` }}
          />
          <div
            className="ml-auto h-5 w-12 animate-pulse rounded bg-azul-marino/10"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        </li>
      ))}
    </ul>
  );
}
