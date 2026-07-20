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
          <div className="flex items-center justify-center gap-6 text-azul-marino">
            <a
              href="https://www.instagram.com/mafia_azul_grana/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="transition-opacity hover:opacity-70"
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/MafiaAzulGranaQficial"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="transition-opacity hover:opacity-70"
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@mafiaazulgranaoficial?_r=1"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="transition-opacity hover:opacity-70"
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 7.917v4.034a9.948 9.948 0 0 1 -5 -1.951v6.5a6.5 6.5 0 1 1 -8 -6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917z" />
              </svg>
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
