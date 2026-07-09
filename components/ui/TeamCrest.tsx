const SIZES = { sm: 32, md: 44 } as const;

export function TeamCrest({
  name,
  logoUrl = null,
  isOwnTeam = false,
  size = "md",
}: {
  name: string;
  logoUrl?: string | null;
  isOwnTeam?: boolean;
  size?: keyof typeof SIZES;
}) {
  const px = SIZES[size];

  // Escudo real: SVG blanco sin fondo (ver design-system.md). Solo se usa sobre
  // fondos oscuros para que contraste. Se sirve como <img> (SVG del bucket público).
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={name}
        width={px}
        height={px}
        className="object-contain"
        style={{ width: px, height: px }}
      />
    );
  }

  // Fallback (equipo sin logo cargado): iniciales en forma de escudo.
  const initials = name
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={`flex items-center justify-center font-display ${
        isOwnTeam ? "bg-dorado-escudo text-azul-marino" : "bg-white/15 text-blanco-hueso"
      }`}
      style={{
        width: px,
        height: px * 1.09,
        clipPath: "polygon(0 0, 100% 0, 100% 62%, 50% 100%, 0 62%)",
        fontSize: px * 0.32,
      }}
    >
      {initials}
    </div>
  );
}
