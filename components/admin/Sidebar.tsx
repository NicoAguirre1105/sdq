"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/actions/auth";

// Dashboard, Posts y Fútbol están construidos; el resto se muestra deshabilitado
// con "pronto" para que la navegación no lleve a rutas 404. Habilitar a medida que se
// construyan (Tienda, Suscriptores, Plantilla).
const NAV = [
  { href: "/admin", label: "Dashboard", enabled: true, exact: true },
  { href: "/admin/posts", label: "Posts", enabled: true },
  { href: "/admin/futbol", label: "Fútbol", enabled: true },
  { href: "/admin/tienda", label: "Tienda", enabled: false },
  { href: "/admin/suscriptores", label: "Suscriptores", enabled: false },
  { href: "/admin/plantilla", label: "Plantilla", enabled: false },
];

export function Sidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col bg-tinta md:sticky md:top-0 md:h-dvh md:w-56 md:flex-none">
      <div className="flex items-center gap-2.5 border-b border-white/8 px-4 py-4">
        <Image
          src="/img/logoSDQ.png"
          alt="Escudo S.D. Quito"
          width={443}
          height={563}
          className="h-7 w-auto"
        />
        <span className="font-mono text-[8px] tracking-[0.2em] text-dorado-escudo">
          PANEL CMS
        </span>
      </div>

      <nav className="flex flex-1 gap-0.5 overflow-x-auto p-2.5 md:flex-col md:overflow-visible">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const inner = (
            <>
              <span className="size-1.5 flex-none rotate-45 bg-current" />
              {item.label}
              {!item.enabled && (
                <span className="ml-auto font-mono text-[8px] tracking-wide text-blanco-hueso/30">
                  pronto
                </span>
              )}
            </>
          );

          const base =
            "flex items-center gap-2.5 rounded-md px-3 py-2.5 font-body text-[12.5px] font-semibold whitespace-nowrap";

          if (!item.enabled) {
            return (
              <span
                key={item.href}
                className={`${base} cursor-not-allowed text-blanco-hueso/30`}
              >
                {inner}
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${base} transition-colors ${
                active
                  ? "bg-rojo-bandera/18 text-white shadow-[inset_3px_0_0_var(--color-dorado-escudo)]"
                  : "text-blanco-hueso/55 hover:bg-white/5 hover:text-white"
              }`}
            >
              {inner}
            </Link>
          );
        })}
      </nav>

      <div className="hidden items-center gap-2.5 border-t border-white/8 px-4 py-3 md:flex">
        <div className="flex size-8 flex-none items-center justify-center rounded-full bg-azul-marino font-display text-sm text-dorado-escudo">
          {adminName.slice(0, 1).toUpperCase()}
        </div>
        <span className="min-w-0 flex-1 truncate font-body text-[11.5px] text-blanco-hueso/80">
          {adminName}
        </span>
        <form action={signOutAction}>
          <button
            type="submit"
            className="font-mono text-[9px] tracking-wide text-blanco-hueso/45 transition-colors hover:text-rojo-bandera"
          >
            SALIR
          </button>
        </form>
      </div>
    </aside>
  );
}
