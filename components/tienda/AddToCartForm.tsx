"use client";

import { useState } from "react";
import { useCart } from "@/components/tienda/CartProvider";

type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  images: string[];
  sizes: string[] | null;
  stock: number | null;
  lead_time_message: string | null;
};

export function AddToCartForm({ product }: { product: Product }) {
  const { addItem } = useCart();
  const hasSizes = !!product.sizes && product.sizes.length > 0;
  const [size, setSize] = useState<string | null>(hasSizes ? product.sizes![0] : null);
  const trackedStock = product.stock; // null = bajo pedido, sin límite
  const outOfStock = trackedStock === 0;
  const [quantity, setQuantity] = useState(outOfStock ? 0 : 1);
  const [added, setAdded] = useState(false);

  if (outOfStock) {
    return (
      <div>
        <p className="mb-4 inline-block rounded-md bg-tinta/8 px-3.5 py-2 font-mono text-xs font-bold text-tinta/60 uppercase">
          Agotado
        </p>
        {product.lead_time_message && (
          <p className="rounded-md border border-azul-marino/15 bg-[#eeece5] px-3.5 py-2.5 font-body text-xs leading-relaxed text-tinta/70">
            {product.lead_time_message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      {hasSizes && (
        <div className="mb-4">
          <span className="mb-1.5 block font-mono text-[10px] tracking-[0.1em] text-tinta/55 uppercase">
            Talla
          </span>
          <div className="flex flex-wrap gap-2">
            {product.sizes!.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`rounded-md border px-3.5 py-2 font-mono text-xs font-bold transition-colors ${
                  size === s
                    ? "border-rojo-bandera bg-rojo-bandera text-white"
                    : "border-azul-marino/20 text-tinta/70 hover:border-azul-marino"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-5 flex items-center gap-3">
        <span className="font-mono text-[10px] tracking-[0.1em] text-tinta/55 uppercase">
          Cantidad
        </span>
        <div className="flex items-center rounded-md border border-azul-marino/20">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 font-mono text-sm font-bold text-tinta/70 hover:text-tinta"
          >
            −
          </button>
          <span className="w-8 text-center font-mono text-sm text-tinta">{quantity}</span>
          <button
            type="button"
            onClick={() =>
              setQuantity((q) => (trackedStock != null ? Math.min(trackedStock, q + 1) : q + 1))
            }
            className="px-3 py-2 font-mono text-sm font-bold text-tinta/70 hover:text-tinta"
          >
            +
          </button>
        </div>
        {trackedStock != null && (
          <span className="font-mono text-[10px] text-tinta/45">Quedan {trackedStock}</span>
        )}
      </div>

      {product.lead_time_message && (
        <p className="mb-5 rounded-md border border-azul-marino/15 bg-[#eeece5] px-3.5 py-2.5 font-body text-xs leading-relaxed text-tinta/70">
          {product.lead_time_message}
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          addItem({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            size,
            unitPrice: product.price,
            image: product.images[0] ?? null,
            quantity,
          });
          setAdded(true);
          setTimeout(() => setAdded(false), 1800);
        }}
        className="rounded-md bg-rojo-bandera px-5 py-3 font-body text-sm font-bold text-white transition-colors hover:bg-rojo-bandera-hover"
      >
        {added ? "¡Agregado!" : "Agregar al carrito"}
      </button>
    </div>
  );
}
