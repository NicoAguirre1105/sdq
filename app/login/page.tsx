import Image from "next/image";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { getAdminUser } from "@/lib/supabase/queries/admin";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Acceso · S.D. Quito" };

export default async function LoginPage() {
  // Si ya hay sesión de admin, saltar directo al panel.
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && (await getAdminUser(supabase, user.id))) redirect("/admin");

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      {/* Panel de marca — franja superior en móvil, columna izquierda en desktop */}
      <aside className="relative flex flex-col justify-between overflow-hidden bg-[#081f49] px-8 py-8 md:w-[44%] md:px-10 md:py-12">
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(125deg,#0a234f 0,#0a234f 40px,#0c2a5e 40px,#0c2a5e 80px)",
          }}
        />
        <div className="relative flex items-center gap-3">
          <Image
            src="/img/logoSDQ.png"
            alt="Escudo S.D. Quito"
            width={443}
            height={563}
            className="h-9 w-auto md:h-10"
            priority
          />
          <span className="font-display text-lg leading-none tracking-[0.05em] text-blanco-hueso md:text-xl">
            DEPORTIVO <span className="text-dorado-escudo">QUITO</span>
          </span>
        </div>

        <div className="relative mt-8 md:mt-0">
          <p className="font-mono text-[11px] tracking-[0.2em] text-dorado-escudo">
            PANEL DE GESTIÓN
          </p>
          <p className="mt-2.5 font-display text-4xl leading-[0.86] text-blanco-hueso md:text-[46px]">
            CONTENIDO
            <br />
            DEL CLUB
          </p>
          <p className="mt-3 max-w-[260px] font-body text-[12.5px] leading-relaxed text-blanco-hueso/60">
            Noticias, partidos, plantilla y suscriptores. Todo desde un solo
            lugar.
          </p>
        </div>

        <p className="relative mt-8 hidden font-mono text-[10px] text-blanco-hueso/35 md:block">
          acceso restringido
        </p>
      </aside>

      {/* Formulario */}
      <main className="flex flex-1 items-center bg-blanco-hueso px-8 py-12 md:px-14">
        <div className="mx-auto w-full max-w-sm">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
