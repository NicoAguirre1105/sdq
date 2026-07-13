import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ManagePreferencesForm } from "@/components/subscription/ManagePreferencesForm";
import { getSubscriberByEmail } from "@/lib/supabase/queries/subscribers";

export const metadata: Metadata = {
  title: "Gestionar suscripción — Mafia Azul Grana",
  description: "Edita qué correos quieres recibir o date de baja del newsletter.",
};

export default async function GestionarSuscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const subscriber = email ? await getSubscriberByEmail(email) : null;

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
        <Container className="relative">
          <p className="font-mono text-[11px] tracking-[0.2em] text-dorado-escudo uppercase">
            Tu suscripción
          </p>
          <h1 className="mt-3 font-display text-5xl leading-[0.9] text-blanco-hueso md:text-6xl">
            GESTIONA TUS CORREOS
          </h1>
          {subscriber && (
            <p className="mt-3 flex flex-wrap items-center gap-2 font-body text-sm text-blanco-hueso/70">
              Suscrito como
              <span className="rounded bg-white/10 px-2.5 py-1 font-mono text-xs font-semibold text-blanco-hueso">
                {subscriber.email}
              </span>
            </p>
          )}
        </Container>
      </section>

      <Container className="px-6 py-12 md:py-16">
        <div className="max-w-2xl">
          {subscriber ? (
            <ManagePreferencesForm email={subscriber.email} initialTopics={subscriber.topics} />
          ) : (
            <div className="rounded-xl border border-azul-marino/12 bg-white p-6 text-center">
              <p className="font-display text-2xl text-tinta">NO ENCONTRAMOS ESA SUSCRIPCIÓN</p>
              <p className="mt-2 font-body text-sm text-tinta/60">
                Revisa que estés usando el link tal cual llegó en el correo. Si el problema
                sigue, escríbenos.
              </p>
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
