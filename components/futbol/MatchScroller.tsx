"use client";

import { useLayoutEffect, useRef } from "react";
import { MatchCard, type CardMatch } from "@/components/futbol/MatchCard";

// Contenedor de altura fija (4 tarjetas) con scroll libre. Al montar, se
// posiciona centrado en `nextId`: deja medio partido anterior arriba, 2
// completos, medio siguiente abajo. Si no hay más partidos en un extremo, el
// clamp nativo del scroll deja la última/primera tarjeta completamente visible
// — no hace falta lógica extra para ese caso.
export function MatchScroller<T extends CardMatch>({
  matches,
  nextId,
  topLabelFor,
}: {
  matches: T[];
  nextId?: string;
  topLabelFor?: (match: T) => string | undefined;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const first = itemRefs.current[0];
    const second = itemRefs.current[1];
    if (!container || !first || !second) return;

    const cardHeight = second.offsetTop - first.offsetTop;
    container.style.height = `${cardHeight * 4}px`;

    const targetIndex = nextId ? matches.findIndex((m) => m.id === nextId) : -1;
    // Sin próximo partido en este listado (ej. filtro "Jugados"): scroll al final.
    container.scrollTop =
      targetIndex >= 0 ? (targetIndex - 1.5) * cardHeight : container.scrollHeight;
  }, [matches, nextId]);

  return (
    <div
      ref={containerRef}
      className="no-scrollbar mx-auto flex w-full max-w-[560px] flex-col gap-3 overflow-y-auto"
      style={{ scrollSnapType: "y proximity" }}
    >
      {matches.map((m, i) => (
        <div
          key={m.id}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          style={{ scrollSnapAlign: "start" }}
        >
          <MatchCard match={m} topLabel={topLabelFor?.(m)} highlighted={m.id === nextId} />
        </div>
      ))}
    </div>
  );
}
