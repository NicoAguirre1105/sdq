// Skeleton genérico para listas/tablas mientras carga la data.
const WIDTHS = ["w-1/3", "w-1/4", "w-1/6", "w-1/5", "w-10"];

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-azul-marino/12 bg-white">
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className={`flex items-center gap-4 px-4 py-3.5 ${r > 0 ? "border-t border-azul-marino/8" : ""}`}
        >
          {WIDTHS.map((w, c) => (
            <div
              key={c}
              className={`h-3 ${w} animate-pulse rounded bg-azul-marino/10`}
              style={{ animationDelay: `${(r * WIDTHS.length + c) * 60}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
