import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { signOutAction } from "@/lib/actions/auth";

export const metadata = { title: "Panel · S.D. Quito" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-dvh bg-blanco-hueso">
      <header className="flex items-center justify-between border-b border-azul-marino/10 bg-[#081f49] px-6 py-3.5">
        <div className="flex items-center gap-3">
          <Image
            src="/img/logoSDQ.png"
            alt="Escudo S.D. Quito"
            width={443}
            height={563}
            className="h-8 w-auto"
          />
          <span className="font-mono text-[11px] tracking-[0.18em] text-dorado-escudo">
            PANEL
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-body text-[13px] text-blanco-hueso/70">
            {admin.full_name}
          </span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded border border-blanco-hueso/30 px-3 py-1.5 font-body text-xs font-semibold text-blanco-hueso transition-colors hover:border-rojo-bandera"
            >
              Salir
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-6 py-8">{children}</main>
    </div>
  );
}
