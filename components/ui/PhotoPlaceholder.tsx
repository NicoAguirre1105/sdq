const TONES = {
  azul: { a: "#0B2E6B", b: "#12408c", label: "text-blanco-hueso/40" },
  rojo: { a: "#C81D25", b: "#e02730", label: "text-blanco-hueso/50" },
  dorado: { a: "#C9A227", b: "#d8b23e", label: "text-azul-marino/40" },
} as const;

export function PhotoPlaceholder({
  label,
  tone = "azul",
  className = "",
}: {
  label: string;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  const { a, b, label: labelClass } = TONES[tone];

  // Placeholder de foto. Cuando exista el asset real, reemplazar por:
  // <Image src={coverImage} alt={label} fill className="object-cover" />
  return (
    <div
      className={`flex items-end p-3 ${className}`}
      style={{
        backgroundImage: `repeating-linear-gradient(125deg, ${a}, ${a} 18px, ${b} 18px, ${b} 36px)`,
      }}
    >
      <span className={`font-mono text-[9px] uppercase tracking-wider ${labelClass}`}>
        [ {label} ]
      </span>
    </div>
  );
}
