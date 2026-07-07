const SIZES = {
  sm: { outer: 26, inner: 21, font: 9 },
  md: { outer: 34, inner: 28, font: 12 },
} as const;

export function BrandCrest({ size = "md" }: { size?: keyof typeof SIZES }) {
  const { outer, inner, font } = SIZES[size];
  const clipPath = "polygon(0 0, 100% 0, 100% 62%, 50% 100%, 0 62%)";

  // Placeholder del escudo real. Cuando exista el asset final, reemplazar por:
  // <Image src="/brand/escudo.svg" alt="Escudo Deportivo Quito" width={outer} height={outer * 1.12} />
  return (
    <div
      className="flex items-center justify-center bg-dorado-escudo"
      style={{ width: outer, height: outer * 1.12, clipPath }}
    >
      <div
        className="flex items-center justify-center bg-azul-marino font-display text-dorado-escudo"
        style={{ width: inner, height: inner * 1.14, clipPath, fontSize: font }}
      >
        DQ
      </div>
    </div>
  );
}
