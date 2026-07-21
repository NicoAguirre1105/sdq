import { Container } from "@/components/ui/Container";
import { CartView } from "@/components/tienda/CartView";

export const metadata = { title: "Carrito | Tienda Mafia Azul Grana" };

export default function CarritoPage() {
  return (
    <section className="bg-blanco-hueso">
      <Container className="px-4.5 py-8 md:px-10 md:py-10">
        <h1 className="mb-6 font-display text-4xl text-tinta">TU CARRITO</h1>
        <CartView />
      </Container>
    </section>
  );
}
