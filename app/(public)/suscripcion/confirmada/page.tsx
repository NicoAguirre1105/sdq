import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "¡Suscripción confirmada! — Mafia Azul Grana",
  description: "Tu suscripción al newsletter de Mafia Azul Grana quedó confirmada.",
};

export default function SuscripcionConfirmadaPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-azul-marino px-6 py-14 md:py-20">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "repeating-linear-gradient(125deg,#0a234f 0,#0a234f 44px,#0c2a5e 44px,#0c2a5e 88px)",
          }}
        />
        <Container className="relative text-center">
          <p className="font-mono text-[11px] tracking-[0.2em] text-dorado-escudo uppercase">
            Suscripción confirmada
          </p>
          <h1 className="mt-3 font-display text-5xl leading-[0.9] text-blanco-hueso md:text-6xl">
            ¡YA ERES PARTE DE LA MAFIA!
          </h1>
          <p className="mx-auto mt-4 max-w-lg font-body text-sm text-blanco-hueso/70">
            Confirmamos tu correo. Desde ahora te llegan las novedades del club que elegiste
            directo a tu bandeja.
          </p>
        </Container>
      </section>

      <Container className="px-6 py-12 md:py-16">
        <div className="mx-auto max-w-xl space-y-6 text-center">
          <p className="font-body text-[15px] leading-relaxed text-tinta/85">
            Mientras tanto, síguenos en redes para no perderte nada de la barra:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-sm text-azul-marino">
            <a href="https://www.instagram.com/mafia_azul_grana/" className="underline">
              Instagram
            </a>
            <a href="https://www.facebook.com/MafiaAzulGranaQficial" className="underline">
              Facebook
            </a>
            <a href="https://www.tiktok.com/@mafiaazulgranaoficial?_r=1" className="underline">
              TikTok
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 font-body text-sm text-tinta/60">
            <Link href="/" className="text-azul-marino underline">
              Volver al inicio
            </Link>
            <Link href="/suscripcion/gestionar" className="text-azul-marino underline">
              Elegir qué correos quiero recibir
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
