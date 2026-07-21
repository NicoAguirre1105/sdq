import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PhotoPlaceholder } from "@/components/ui/PhotoPlaceholder";
import { ImageWithSkeleton } from "@/components/ui/ImageWithSkeleton";
import { AddToCartForm } from "@/components/tienda/AddToCartForm";
import { getProductBySlug } from "@/lib/supabase/queries/products";
import { renderMarkdown } from "@/lib/markdown";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: `${product.name} | Tienda Mafia Azul Grana`,
    description: product.description_md?.slice(0, 160),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const image = product.images[0];

  return (
    <article className="bg-blanco-hueso">
      <Container className="px-4.5 py-7 md:px-10 md:py-9">
        <div className="mb-3.5 flex items-center gap-2 font-mono text-sm font-semibold text-tinta/45">
          <Link href="/tienda" className="flex items-center gap-1 transition-colors hover:text-tinta">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
            TIENDA
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            {image ? (
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <ImageWithSkeleton
                  src={image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <PhotoPlaceholder label="FOTO PRODUCTO" tone="azul" className="aspect-square rounded-lg" />
            )}
            {product.images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {product.images.slice(1).map((url) => (
                  <div key={url} className="relative aspect-square overflow-hidden rounded-md">
                    <ImageWithSkeleton
                      src={url}
                      alt={product.name}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            {product.category && (
              <p className="mb-1.5 font-mono text-[11px] font-semibold tracking-[0.14em] text-azul-marino">
                {product.category.toUpperCase()}
              </p>
            )}
            <h1 className="mb-2 font-display text-[40px] leading-[0.9] text-tinta md:text-[48px]">
              {product.name}
            </h1>
            <p className="mb-6 font-mono text-2xl font-bold text-dorado-escudo">
              ${product.price.toFixed(2)}
            </p>

            <AddToCartForm product={product} />

            {product.description_md && (
              <div
                className="mt-8 border-t border-azul-marino/10 pt-6 font-body text-sm leading-relaxed text-tinta/75 [&_a]:text-azul-marino [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-2 [&_strong]:font-bold"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(product.description_md) }}
              />
            )}
          </div>
        </div>
      </Container>
    </article>
  );
}
