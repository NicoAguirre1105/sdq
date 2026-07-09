import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Términos de la suscripción — Mafia Azul Grana",
  description:
    "Términos y condiciones de la suscripción al newsletter de la hinchada de Sociedad Deportivo Quito.",
};

const CONTACT_EMAIL = "nicofrancis2002@gmail.com";
const UPDATED = "9 de julio de 2026";

export default function TerminosPage() {
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
            Suscripción al newsletter
          </p>
          <h1 className="mt-3 font-display text-5xl leading-[0.9] text-blanco-hueso md:text-6xl">
            TÉRMINOS Y CONDICIONES
          </h1>
          <p className="mt-3 font-body text-sm text-blanco-hueso/70">
            Última actualización: {UPDATED}
          </p>
        </Container>
      </section>

      <Container className="px-6 py-12 md:py-16">
        <div className="max-w-2xl space-y-8 font-body text-[15px] leading-relaxed text-tinta/85">
          <p>
            Estos términos regulan la suscripción al boletín de correo (newsletter) de{" "}
            <strong>Mafia Azul Grana</strong>, el portal hecho por y para la hinchada de Sociedad
            Deportivo Quito. Este no es un sitio oficial del club: es un portal de la hinchada. Al
            suscribirte, aceptás lo descrito a continuación.
          </p>

          <div>
            <h2 className="font-display text-2xl text-tinta">1. Responsable</h2>
            <p className="mt-2">
              El responsable del tratamiento de tus datos es el colectivo de hinchas que administra
              este sitio (Mafia Azul Grana). Para cualquier consulta o solicitud podés escribir a{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-azul-marino underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-tinta">2. Qué datos recopilamos</h2>
            <p className="mt-2">Al suscribirte guardamos únicamente:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Tu dirección de correo electrónico.</li>
              <li>Los temas de interés que seleccionás (novedades del club, tienda, cánticos).</li>
              <li>
                La fecha en que te suscribís y en que aceptás estos términos, como constancia de tu
                consentimiento.
              </li>
            </ul>
            <p className="mt-2">
              No pedimos ni almacenamos nombre, teléfono, ni datos de pago para la suscripción.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-tinta">3. Para qué usamos tus datos</h2>
            <p className="mt-2">
              Usamos tu correo exclusivamente para enviarte el boletín con las novedades de los temas
              que elegiste. No vendemos, alquilamos ni cedemos tus datos a terceros con fines
              comerciales.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-tinta">4. Verificación (doble opt-in)</h2>
            <p className="mt-2">
              Después de suscribirte recibirás un correo de verificación. Tu suscripción se activa
              solo cuando confirmás desde ese correo. Si no confirmás, no te enviaremos el boletín.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-tinta">5. Proveedor de envío</h2>
            <p className="mt-2">
              El envío y la gestión de los correos se realiza a través de{" "}
              <strong>Kit</strong> (kit.com), un servicio de email marketing con sede en Estados
              Unidos. Al suscribirte, tu correo se procesa en sus servidores para poder enviarte el
              boletín. Podés consultar su política de privacidad en su sitio web.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-tinta">6. Cómo darte de baja</h2>
            <p className="mt-2">
              Cada correo que enviamos incluye un enlace para cancelar la suscripción en cualquier
              momento, sin costo ni explicación. También podés escribirnos a{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-azul-marino underline">
                {CONTACT_EMAIL}
              </a>{" "}
              para darte de baja o pedir que eliminemos tu correo de nuestros registros.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-tinta">7. Tus derechos</h2>
            <p className="mt-2">
              De acuerdo con la Ley Orgánica de Protección de Datos Personales del Ecuador (LOPDP),
              tenés derecho a acceder, rectificar, actualizar y eliminar tus datos, así como a
              retirar tu consentimiento en cualquier momento. Para ejercerlos, escribinos a{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-azul-marino underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-tinta">8. Cambios en estos términos</h2>
            <p className="mt-2">
              Podemos actualizar estos términos cuando sea necesario. La versión vigente siempre
              estará publicada en esta página, con su fecha de última actualización.
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}
