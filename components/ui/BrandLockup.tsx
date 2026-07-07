import Image from "next/image";

export function BrandLockup({
  magSrc,
  magWidth,
  magHeight,
  logoClassName = "h-7 md:h-9",
  magClassName = "h-5 md:h-6",
  className = "",
}: {
  magSrc: string;
  magWidth: number;
  magHeight: number;
  logoClassName?: string;
  magClassName?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/img/logoSDQ.png"
        alt="Escudo S.D. Quito"
        width={443}
        height={563}
        className={`w-auto ${logoClassName}`}
      />
      <span className="w-px self-stretch bg-white/25" />
      <Image
        src={magSrc}
        alt="MAG"
        width={magWidth}
        height={magHeight}
        className={`w-auto ${magClassName}`}
      />
    </div>
  );
}
