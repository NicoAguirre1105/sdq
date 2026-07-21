"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLockup } from "@/components/ui/BrandLockup";
import { Container } from "@/components/ui/Container";
import { SubscribeModal } from "@/components/layout/SubscribeModal";
import { NAV_LINKS } from "@/lib/nav-links";
import { useEnterExit } from "@/lib/use-enter-exit";
import { useCart } from "@/components/tienda/CartProvider";

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const { count } = useCart();

  // Auto-abre la ventana de suscripción a los 30s de navegación, una sola vez
  // (no vuelve a aparecer sola en visitas futuras). Navbar solo vive en
  // app/(public)/layout.tsx, así que esto nunca corre en /admin ni /login.
  useEffect(() => {
    if (localStorage.getItem("sdq_subscribe_prompted")) return;
    const timer = setTimeout(() => {
      setSubscribeOpen(true);
      localStorage.setItem("sdq_subscribe_prompted", "1");
    }, 30_000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/8 bg-azul-marino">
        <Container className="flex items-center justify-between px-4 py-3.5 md:px-10 md:py-4">
          <Link href="/" className="flex items-center">
            <BrandLockup magSrc="/logo_mag.svg" magWidth={589} magHeight={687} />
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

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/tienda/carrito"
              aria-label="Carrito"
              className="relative flex items-center text-blanco-hueso/70 transition-colors hover:text-blanco-hueso"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-rojo-bandera font-mono text-[9px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setSubscribeOpen(true)}
              className="rounded bg-rojo-bandera px-4.5 py-2.5 font-body text-xs font-bold text-white transition-[background-color,transform] duration-150 ease-out-strong hover:bg-rojo-bandera-hover active:scale-[0.97]"
            >
              Suscríbete
            </button>
          </div>

          <div className="flex items-center gap-4 md:hidden">
            <Link href="/tienda/carrito" aria-label="Carrito" className="relative flex items-center text-blanco-hueso">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-rojo-bandera font-mono text-[9px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
            <button
              type="button"
              aria-label="Abrir menú"
              onClick={() => setMenuOpen(true)}
              className="flex flex-col gap-1 transition-transform active:scale-90"
            >
              <span className="h-0.5 w-5 bg-blanco-hueso" />
              <span className="h-0.5 w-5 bg-blanco-hueso" />
              <span className="h-0.5 w-5 bg-rojo-bandera" />
            </button>
          </div>
        </Container>
      </header>

      {menuOpen && (
        <MobileMenu
          onClose={() => setMenuOpen(false)}
          onSubscribe={() => {
            setMenuOpen(false);
            setSubscribeOpen(true);
          }}
        />
      )}

      {subscribeOpen && <SubscribeModal onClose={() => setSubscribeOpen(false)} />}
    </>
  );
}

function MobileMenu({
  onClose,
  onSubscribe,
}: {
  onClose: () => void;
  onSubscribe: () => void;
}) {
  const { open, close } = useEnterExit(onClose, 200);

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#081938]/72 transition-opacity duration-200 ease-out-strong md:hidden ${
        open ? "opacity-100" : "opacity-0"
      }`}
      onClick={close}
    >
      {/* Desliza desde el borde derecho — curva tipo drawer de iOS, no la de UI genérica. */}
      <div
        className={`ml-auto flex h-full w-4/5 max-w-xs flex-col gap-1 bg-azul-marino p-6 transition-transform duration-200 ease-drawer ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={close}
          className="mb-4 self-end font-mono text-lg text-blanco-hueso transition-transform active:scale-90"
        >
          ✕
        </button>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={close}
            className="border-b border-white/10 py-3 font-body text-sm font-semibold text-blanco-hueso"
          >
            {link.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={onSubscribe}
          className="mt-4 rounded bg-rojo-bandera px-4 py-3 font-body text-xs font-bold text-white transition-transform active:scale-95"
        >
          Suscríbete
        </button>
      </div>
    </div>
  );
}
