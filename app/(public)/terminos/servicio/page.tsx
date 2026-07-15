import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Términos del servicio — Mafia Azul Grana",
  description:
    "Términos y condiciones de uso del portal Mafia Azul Grana, hecho por y para la hinchada de Sociedad Deportivo Quito.",
};

const CONTACT_EMAIL = "support@mafiaazulgrana.org";
const UPDATED = "15 de julio de 2026";

export default function TerminosServicioPage() {
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
            Uso del sitio
          </p>
          <h1 className="mt-3 font-display text-5xl leading-[0.9] text-blanco-hueso md:text-6xl">
            TÉRMINOS DEL SERVICIO
          </h1>
          <p className="mt-3 font-body text-sm text-blanco-hueso/70">
            Última actualización: {UPDATED}
          </p>
        </Container>
      </section>

      <Container className="px-6 py-12 md:py-16">
        <div className="max-w-2xl space-y-8 font-body text-[15px] leading-relaxed text-tinta/85">
          <p>
            Estos términos regulan el uso del portal <strong>Mafia Azul Grana</strong>. Este{" "}
            <strong>no es un sitio oficial</strong> de Sociedad Deportivo Quito: es un portal hecho
            por y para la hinchada, con noticias, seguimiento deportivo y contenido de las barras. Al
            navegar el sitio, aceptas lo descrito a continuación.
          </p>

          <div>
            <h2 className="font-display text-2xl text-tinta">1. Naturaleza del sitio</h2>
            <p className="mt-2">
              Mafia Azul Grana es un proyecto independiente de la hinchada, sin afiliación oficial
              con el club Sociedad Deportivo Quito. Los resultados, calendarios y tablas de
              posiciones se publican con fines informativos y pueden contener errores o retrasos
              respecto a fuentes oficiales.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-tinta">2. Uso aceptable</h2>
            <p className="mt-2">
              Puedes usar el sitio libremente para consultar contenido, participar de la comunidad y,
              si lo deseás, comprar merchandising coordinando por WhatsApp. No está permitido intentar
              vulnerar la seguridad del sitio ni usar su contenido con fines comerciales sin permiso.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-tinta">3. Cookies y analítica</h2>
            <p className="mt-2">Usamos dos herramientas de terceros que pueden guardar cookies en tu navegador:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Microsoft Clarity</strong>, para entender cómo se usa el sitio (analítica y
                grabación de sesiones con campos sensibles enmascarados).
              </li>
              <li>
                <strong>Sentry</strong>, para detectar errores técnicos del sitio (datos de
                navegador, sin fines de seguimiento publicitario).
              </li>
            </ul>
            <p className="mt-2">
              Ninguna de las dos se usa con fines publicitarios ni se comparte con terceros para ese
              propósito.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-tinta">4. Tienda y compras</h2>
            <p className="mt-2">
              El sitio no procesa pagos. Al armar un pedido, se coordina la compra y el pago
              directamente por WhatsApp con la organización de la hinchada.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-tinta">5. Suscripción al newsletter</h2>
            <p className="mt-2">
              Si te suscribes al boletín de novedades, aplican además los{" "}
              <a href="/terminos" className="text-azul-marino underline">
                términos de la suscripción
              </a>
              , que detallan qué datos guardamos y cómo darte de baja.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-tinta">6. Responsabilidad</h2>
            <p className="mt-2">
              El contenido se ofrece "tal cual", sin garantías de disponibilidad continua ni
              exactitud absoluta. No nos hacemos responsables por decisiones tomadas en base a la
              información publicada.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-tinta">7. Cambios en estos términos</h2>
            <p className="mt-2">
              Podemos actualizar estos términos cuando sea necesario. La versión vigente siempre
              estará publicada en esta página, con su fecha de última actualización. Para consultas,
              escribinos a{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-azul-marino underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}
