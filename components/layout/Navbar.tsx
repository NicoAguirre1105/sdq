"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandCrest } from "@/components/ui/BrandCrest";
import { Container } from "@/components/ui/Container";
import { SubscribeModal } from "@/components/layout/SubscribeModal";
import { NAV_LINKS } from "@/lib/nav-links";

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/8 bg-azul-marino">
        <Container className="flex items-center justify-between px-4 py-3.5 md:px-10 md:py-4">
          <Link href="/" className="flex items-center gap-2.5 md:gap-3.5">
            <BrandCrest size="sm" />
            <span className="font-display text-[15px] leading-[0.9] text-blanco-hueso tracking-[0.05em] md:hidden">
              DEPORTIVO <span className="text-dorado-escudo">QUITO</span>
            </span>
            <span className="hidden font-display text-[19px] leading-[0.9] text-blanco-hueso tracking-[0.06em] md:block">
              DEPORTIVO
              <br />
              <span className="text-dorado-escudo">QUITO</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6.5 font-body text-[13px] font-semibold text-blanco-hueso/70 md:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    active
                      ? "border-b-2 border-rojo-bandera pb-0.5 text-blanco-hueso"
                      : "transition-colors hover:text-blanco-hueso"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => setSubscribeOpen(true)}
            className="hidden rounded bg-rojo-bandera px-4.5 py-2.5 font-body text-xs font-bold text-white transition-colors hover:bg-rojo-bandera-hover md:block"
          >
            Suscríbete
          </button>

          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setMenuOpen(true)}
            className="flex flex-col gap-1 md:hidden"
          >
            <span className="h-0.5 w-5 bg-blanco-hueso" />
            <span className="h-0.5 w-5 bg-blanco-hueso" />
            <span className="h-0.5 w-5 bg-rojo-bandera" />
          </button>
        </Container>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#081938]/72 md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="ml-auto flex h-full w-4/5 max-w-xs flex-col gap-1 bg-azul-marino p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setMenuOpen(false)}
              className="mb-4 self-end font-mono text-lg text-blanco-hueso"
            >
              ✕
            </button>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-white/10 py-3 font-body text-sm font-semibold text-blanco-hueso"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setSubscribeOpen(true);
              }}
              className="mt-4 rounded bg-rojo-bandera px-4 py-3 font-body text-xs font-bold text-white"
            >
              Suscríbete
            </button>
          </div>
        </div>
      )}

      {subscribeOpen && <SubscribeModal onClose={() => setSubscribeOpen(false)} />}
    </>
  );
}
