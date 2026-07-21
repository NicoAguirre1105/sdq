import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { HeroBackground } from "@/components/ui/HeroBackground";
import { Pagination } from "@/components/ui/Pagination";
import { ProductCard } from "@/components/tienda/ProductCard";
import { getPublishedProducts, getProductCategories } from "@/lib/supabase/queries/products";

export const metadata = {
  title: "Tienda | Mafia Azul Grana",
  description: "Merchandising de la hinchada del Deportivo Quito.",
};

const PRODUCTS_PER_PAGE = 12;

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; categoria?: string }>;
}) {
  const { page: pageParam, categoria } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const [{ products, total }, categories] = await Promise.all([
    getPublishedProducts(page, PRODUCTS_PER_PAGE, categoria),
    getProductCategories(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE));
  const basePath = categoria ? `/tienda?categoria=${categoria}` : "/tienda";

  const chip = (href: string, active: boolean, label: string) => (
    <Link
      key={href}
      href={href}
      className={`rounded-full border px-3.5 py-1.5 font-mono text-[10px] font-bold tracking-wide uppercase transition-colors ${
        active
          ? "border-rojo-bandera bg-rojo-bandera text-white"
          : "border-azul-marino/20 text-tinta/60 hover:border-azul-marino"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <section className="relative overflow-hidden bg-[#081f49] px-4.5 py-8 md:px-0 md:py-10">
        <HeroBackground />
        <div className="absolute inset-0 bg-[#081f49]/80" />
        <Container className="relative px-0 md:px-10">
          <p className="mb-4 font-mono text-[10px] tracking-[0.18em] text-dorado-escudo uppercase md:text-[11px]">
            Merchandising oficial de la hinchada
          </p>
          <h1 className="font-display text-[56px] leading-[0.82] text-blanco-hueso md:text-[78px]">
            TIENDA
          </h1>
        </Container>
      </section>

      <section className="bg-blanco-hueso">
        <Container className="px-4.5 py-8 md:px-10 md:py-10">
          {categories.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {chip("/tienda", !categoria, "Todo")}
              {categories.map((c) => chip(`/tienda?categoria=${c}`, categoria === c, c))}
            </div>
          )}

          {products.length === 0 ? (
            <p className="font-body text-sm text-tinta/55">
              Todavía no hay productos publicados.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} basePath={basePath} />
        </Container>
      </section>
    </>
  );
}
