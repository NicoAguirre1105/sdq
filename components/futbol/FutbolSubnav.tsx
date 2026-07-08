"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";

// Salón de Fama se sumará cuando exista la ruta/datos.
const TABS = [
  { href: "/futbol", label: "Tabla" },
  { href: "/futbol/calendario", label: "Calendario" },
  { href: "/plantilla", label: "Plantilla" },
];

export function FutbolSubnav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-azul-marino/12 bg-blanco-hueso">
      <Container className="flex gap-6 px-4.5 md:px-10">
        {TABS.map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={`-mb-px border-b-2 py-3.5 font-mono text-[11px] tracking-[0.1em] uppercase transition-colors ${
                active
                  ? "border-dorado-escudo text-azul-marino"
                  : "border-transparent text-tinta/50 hover:text-azul-marino"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </Container>
    </div>
  );
}
