import { Container } from "@/components/ui/Container";
import { CanticoList } from "@/components/canticos/CanticoList";
import { CANTICOS } from "@/lib/canticos";

export const metadata = {
  title: "Cánticos | Mafia Azul Grana",
  description: "Los cantos que hacen temblar el Atahualpa. Aprende la letra y cántalos con la barra.",
};

export default function CanticosPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#081f49] px-4.5 py-8 md:px-0 md:py-10">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(125deg,#0a234f_0,#0a234f_40px,#0c2a5e_40px,#0c2a5e_80px)]" />
        <Container className="relative px-0 md:px-10">
          <p className="mb-4 font-mono text-[10px] tracking-[0.18em] text-dorado-escudo uppercase md:text-[11px]">
            La voz de la hinchada
          </p>
          <h1 className="font-display text-[56px] leading-[0.82] text-blanco-hueso md:text-[78px]">
            CÁNTICOS
          </h1>
          <p className="mt-2 max-w-md font-body text-sm text-blanco-hueso/70">
            Los cantos que hacen temblar el Atahualpa. Aprende la letra y cántalos con la barra.
          </p>
        </Container>
      </section>

      <section className="bg-blanco-hueso">
        <Container className="px-4.5 py-6 md:px-10 md:py-8">
          <CanticoList canticos={CANTICOS} />
        </Container>
      </section>
    </>
  );
}
