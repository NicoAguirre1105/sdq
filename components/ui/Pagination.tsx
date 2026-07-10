"use client";

import Link from "next/link";

// Reutilizable en dos modos según el padre:
//  - basePath (string): modo link, para páginas server-rendered → navega a `${basePath}?page=N`.
//  - onChange (fn): modo botón, para componentes client con estado local.
// Solo se pasa uno de los dos.
export function Pagination({
  page,
  totalPages,
  basePath,
  onChange,
}: {
  page: number;
  totalPages: number;
  basePath?: string;
  onChange?: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const base =
    "flex items-center gap-1 rounded-md border px-3.5 py-2 font-body text-xs font-bold transition-colors";
  const enabled = "border-azul-marino/20 text-azul-marino hover:border-azul-marino";
  const disabled = "border-azul-marino/10 text-tinta/30 cursor-not-allowed";

  const control = (target: number, label: string, isDisabled: boolean) => {
    if (isDisabled) return <span className={`${base} ${disabled}`}>{label}</span>;
    if (basePath) {
      const href = target <= 1 ? basePath : `${basePath}?page=${target}`;
      return (
        <Link href={href} scroll={false} className={`${base} ${enabled}`}>
          {label}
        </Link>
      );
    }
    return (
      <button type="button" onClick={() => onChange?.(target)} className={`${base} ${enabled}`}>
        {label}
      </button>
    );
  };

  return (
    <nav className="mt-6 flex items-center justify-center gap-3">
      {control(page - 1, "← Anterior", page <= 1)}
      <span className="font-mono text-[11px] text-tinta/55">
        Página {page} de {totalPages}
      </span>
      {control(page + 1, "Siguiente →", page >= totalPages)}
    </nav>
  );
}
