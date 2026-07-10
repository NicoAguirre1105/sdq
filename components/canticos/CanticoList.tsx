"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { Cantico } from "@/lib/canticos";
import { Pagination } from "@/components/ui/Pagination";

const PER_PAGE = 10;

// Sin acentos ni mayúsculas, para que "cancion"/"canción" matcheen igual.
function normalize(s: string) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function matchesQuery(c: Cantico, query: string) {
  if (!query) return true;
  const q = normalize(query);
  if (normalize(c.title).includes(q)) return true;
  return c.lines.some((l) => normalize(l.text).includes(q));
}

function Chevron() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-none"
    >
      <path d="M8 4l7 7-7 7" />
    </svg>
  );
}

export function CanticoList({ canticos }: { canticos: Cantico[] }) {
  const [onlyClassic, setOnlyClassic] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  const classicFiltered = onlyClassic ? canticos.filter((c) => c.classic) : canticos;
  const visible = classicFiltered.filter((c) => matchesQuery(c, query));
  const totalPages = Math.max(1, Math.ceil(visible.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * PER_PAGE;
  const pageItems = visible.slice(offset, offset + PER_PAGE);

  // Cambiar de filtro o buscar vuelve a la primera página.
  function filter(classic: boolean) {
    setOnlyClassic(classic);
    setPage(1);
  }

  function search(q: string) {
    setQuery(q);
    setPage(1);
  }

  function goTo(p: number) {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div ref={topRef} className="scroll-mt-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-[30px] text-tinta">
          TODOS LOS CÁNTICOS{" "}
          <span className="font-mono text-xs text-tinta/40">· {visible.length}</span>
        </h2>
        <div className="flex gap-1.5 font-mono text-[10px] font-semibold">
          <button
            type="button"
            onClick={() => filter(false)}
            className={`rounded px-3 py-1.5 transition-colors ${
              onlyClassic
                ? "border border-azul-marino/15 bg-white hover:border-azul-marino"
                : "bg-azul-marino text-white"
            }`}
          >
            TODOS
          </button>
          <button
            type="button"
            onClick={() => filter(true)}
            className={`rounded px-3 py-1.5 transition-colors ${
              onlyClassic
                ? "bg-azul-marino text-white"
                : "border border-azul-marino/15 bg-white hover:border-azul-marino"
            }`}
          >
            CLÁSICOS
          </button>
        </div>
      </div>

      <div className="relative mb-4">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-tinta/35"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="Busca por título o letra…"
          className="w-full rounded-lg border border-azul-marino/15 bg-white py-2.5 pr-3.5 pl-10 font-body text-sm text-tinta outline-none focus:border-azul-marino"
        />
      </div>

      {visible.length === 0 && (
        <p className="py-6 text-center font-body text-sm text-tinta/50">
          No encontramos ningún cántico con “{query}”.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {pageItems.map((c, i) => (
          <Link
            key={c.slug}
            href={`/canticos/${c.slug}`}
            className="group grid grid-cols-[36px_1fr_28px] items-center gap-3 rounded-lg border border-azul-marino/10 bg-white p-3.5 transition-all hover:border-azul-marino/25 hover:shadow-[0_8px_24px_-12px_rgba(11,46,107,0.4)] md:grid-cols-[44px_1fr_40px] md:gap-4 md:px-4.5"
          >
            <span className="text-center font-display text-2xl text-azul-marino/40 md:text-3xl">
              {String(offset + i + 1).padStart(2, "0")}
            </span>
            <span className="flex min-w-0 items-baseline gap-2.5">
              <span className="truncate font-display text-2xl leading-[1.2] text-tinta md:text-3xl">
                {c.title}
              </span>
              {c.classic && (
                <span className="hidden flex-none rounded-sm bg-dorado-escudo/15 px-1.5 py-0.5 font-mono text-[8px] font-semibold tracking-[0.1em] text-dorado-escudo sm:inline">
                  CLÁSICO
                </span>
              )}
            </span>
            <span className="justify-self-end text-azul-marino transition-colors group-hover:text-rojo-bandera">
              <Chevron />
            </span>
          </Link>
        ))}
      </div>

      <Pagination page={safePage} totalPages={totalPages} onChange={goTo} />
    </div>
  );
}
