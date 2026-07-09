import Image from "next/image";
import { PhotoPlaceholder } from "@/components/ui/PhotoPlaceholder";
import { STAFF_POSITION } from "@/lib/positions";

type Player = {
  id: string;
  full_name: string;
  position: string | null;
  jersey_number: number | null;
  staff_role: string | null;
  photo_url: string | null;
};

// Orden de secciones + etiqueta plural del encabezado. Cuerpo técnico al final.
const GROUPS: { key: string; label: string }[] = [
  { key: "Portero", label: "Porteros" },
  { key: "Defensa", label: "Defensas" },
  { key: "Mediocampista", label: "Mediocampistas" },
  { key: "Delantero", label: "Delanteros" },
  { key: STAFF_POSITION, label: "Cuerpo técnico" },
];

export function SquadGrid({ players }: { players: Player[] }) {
  if (!players.length) {
    return <p className="font-body text-sm text-tinta/50">La plantilla se publicará pronto.</p>;
  }

  // Agrupa preservando el orden recibido (por dorsal). Posiciones fuera de la
  // lista conocida caen en "Otros" al final.
  const known = new Set(GROUPS.map((g) => g.key));
  const groups = [
    ...GROUPS,
    ...(players.some((p) => !p.position || !known.has(p.position))
      ? [{ key: "__otros", label: "Otros" }]
      : []),
  ]
    .map((g) => ({
      ...g,
      players: players.filter((p) =>
        g.key === "__otros" ? !p.position || !known.has(p.position) : p.position === g.key
      ),
    }))
    .filter((g) => g.players.length);

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.key}>
          <h2 className="mb-4 font-mono text-[11px] tracking-[0.14em] text-azul-marino uppercase">
            {group.label}
          </h2>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {group.players.map((p) => (
              <article
                key={p.id}
                className="overflow-hidden rounded-lg border border-azul-marino/12 bg-white"
              >
                <div className="relative">
                  {p.photo_url ? (
                    <div className="relative h-60 md:h-70">
                      <Image
                        src={p.photo_url}
                        alt={p.full_name}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <PhotoPlaceholder label="FOTO JUGADOR" tone="azul" className="h-40 md:h-44" />
                  )}
                  {(p.staff_role ?? p.jersey_number) != null && (
                    <span className="absolute top-2 right-2.5 font-display text-4xl leading-none text-dorado-escudo md:text-5xl">
                      {p.staff_role ?? p.jersey_number}
                    </span>
                  )}
                </div>
                <div className="p-3.5">
                  <p className="mb-1 font-mono text-[10px] tracking-[0.08em] text-tinta/45 uppercase">
                    {p.position ?? "—"}
                  </p>
                  <h3 className="font-display text-xl leading-[0.95] tracking-[0.02em] text-tinta">
                    {p.full_name.toUpperCase()}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
