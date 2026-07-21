import Link from "next/link";
import { PhotoPlaceholder } from "@/components/ui/PhotoPlaceholder";
import { ImageWithSkeleton } from "@/components/ui/ImageWithSkeleton";

type Product = {
  slug: string;
  name: string;
  price: number;
  images: string[];
  category: string | null;
};

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];

  return (
    <Link
      href={`/tienda/${product.slug}`}
      className="block overflow-hidden rounded-lg border border-azul-marino/12 bg-white transition-[transform,box-shadow] duration-200 ease-out-strong hover:-translate-y-0.5 hover:shadow-[0_12px_34px_-14px_rgba(11,46,107,0.45)]"
    >
      <article>
        {image ? (
          <div className="relative aspect-square">
            <ImageWithSkeleton
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
        ) : (
          <PhotoPlaceholder label="FOTO PRODUCTO" tone="azul" className="aspect-square" />
        )}
        <div className="p-4">
          {product.category && (
            <p className="mb-1 font-mono text-[10px] font-bold tracking-[0.1em] text-azul-marino">
              {product.category.toUpperCase()}
            </p>
          )}
          <h3 className="mb-1 font-display text-xl leading-tight text-tinta">{product.name}</h3>
          <p className="font-mono text-sm font-bold text-dorado-escudo">
            ${product.price.toFixed(2)}
          </p>
        </div>
      </article>
    </Link>
  );
}
