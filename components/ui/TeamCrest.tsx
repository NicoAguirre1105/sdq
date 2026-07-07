const SIZES = { sm: 32, md: 44 } as const;

export function TeamCrest({
  name,
  isOwnTeam = false,
  size = "md",
}: {
  name: string;
  isOwnTeam?: boolean;
  size?: keyof typeof SIZES;
}) {
  const px = SIZES[size];
  const initials = name
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  // Placeholder de escudo por equipo. Cuando haya logos reales (teams.logo_url),
  // renderizar <Image src={logoUrl} alt={name} width={px} height={px} /> en su lugar.
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
