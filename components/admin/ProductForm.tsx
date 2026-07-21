"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductFormState,
} from "@/lib/actions/products";
import { slugify } from "@/lib/slug";
import { Toast } from "@/components/ui/Toast";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { withOfflineGuard } from "@/lib/action-guard";

type ProductValues = {
  id: string;
  name: string;
  slug: string;
  description_md: string | null;
  price: number;
  images: string[];
  category: string | null;
  sizes: string[] | null;
  published: boolean;
};

const label = "block font-mono text-[10px] tracking-[0.1em] text-tinta/55 uppercase";
const field =
  "mt-1.5 w-full rounded-md border border-azul-marino/20 bg-white px-3.5 py-2.5 font-body text-sm text-tinta outline-none focus:border-azul-marino";

export function ProductForm({ product }: { product?: ProductValues }) {
  const editing = !!product;
  const action = editing ? updateProduct : createProduct;
  const [state, formAction, isPending] = useActionState<ProductFormState, FormData>(
    withOfflineGuard(action),
    {}
  );

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(editing);
  const [images, setImages] = useState<string[]>(product?.images ?? []);

  return (
    <>
      <form action={formAction}>
        {editing && <input type="hidden" name="id" value={product.id} />}

        <header className="flex items-center justify-between gap-3 border-b border-azul-marino/10 bg-white px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link href="/admin/tienda" className="font-mono text-lg text-tinta/40 hover:text-tinta">
              ←
            </Link>
            <h1 className="font-display text-2xl text-tinta">
              {editing ? "EDITAR PRODUCTO" : "NUEVO PRODUCTO"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/tienda"
              className="rounded-md border border-azul-marino/16 px-3.5 py-2 font-body text-xs font-bold text-tinta/60"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-rojo-bandera px-4 py-2 font-body text-xs font-bold text-white transition-colors hover:bg-rojo-bandera-hover disabled:opacity-60"
            >
              {isPending ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </header>

        <Toast message={state.error} />

        <div className="mx-auto max-w-2xl px-6 py-6">
          <label htmlFor="name" className={label}>
            Nombre
          </label>
          <input
            id="name"
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            required
            className={`${field} mb-4`}
          />

          <label htmlFor="slug" className={label}>
            Slug
          </label>
          <div className="mt-1.5 mb-4 flex items-center rounded-md border border-azul-marino/20 bg-[#eeece5] px-3.5">
            <span className="font-mono text-xs text-tinta/35">/tienda/</span>
            <input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className="w-full bg-transparent py-2.5 font-mono text-xs text-tinta/70 outline-none"
            />
          </div>

          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex-1">
              <label htmlFor="price" className={label}>
                Precio (USD)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min={0}
                step="0.01"
                defaultValue={product?.price ?? ""}
                required
                className={`${field} font-mono`}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="category" className={label}>
                Categoría
              </label>
              <input
                id="category"
                name="category"
                placeholder="Ropa, Accesorios, Objetos..."
                defaultValue={product?.category ?? ""}
                className={field}
              />
            </div>
          </div>

          <label htmlFor="sizes" className={label}>
            Tallas (opcional, separadas por coma)
          </label>
          <input
            id="sizes"
            name="sizes"
            placeholder="S, M, L, XL"
            defaultValue={product?.sizes?.join(", ") ?? ""}
            className={`${field} mb-1.5 font-mono`}
          />
          <p className="mb-4 font-mono text-[9px] text-tinta/40">
            Dejar vacío para productos de talla única u objetos sin talla.
          </p>

          <span className={label}>Estado</span>
          <label className="mt-1.5 mb-4 flex cursor-pointer items-center gap-3 rounded-md border border-azul-marino/20 bg-white px-3.5 py-2.5">
            <input
              type="checkbox"
              name="published"
              defaultChecked={product?.published ?? true}
              className="size-4 accent-[#1E8A5B]"
            />
            <span className="font-body text-sm text-tinta">Publicado</span>
          </label>

          <span className={label}>Imágenes</span>
          <input type="hidden" name="images" value={JSON.stringify(images)} />
          <div className="mt-1.5 mb-4">
            {images.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {images.map((url) => (
                  <div
                    key={url}
                    className="relative overflow-hidden rounded-md border border-azul-marino/15 bg-white"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-20 w-20 object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages((imgs) => imgs.filter((u) => u !== url))}
                      className="absolute top-0.5 right-0.5 rounded bg-tinta/70 px-1.5 py-0.5 font-mono text-[8px] font-bold text-white hover:bg-rojo-bandera"
                    >
                      QUITAR
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="file"
              name="image_files"
              accept="image/*"
              multiple
              className="block w-full font-body text-xs text-tinta/70 file:mr-3 file:rounded-md file:border-0 file:bg-azul-marino file:px-3 file:py-2 file:font-body file:text-xs file:font-bold file:text-white"
            />
            <p className="mt-1 font-mono text-[9px] text-tinta/40">
              JPG, PNG o WebP, hasta 2 MB cada una. Se suben al guardar.
            </p>
          </div>

          <label htmlFor="description_md" className={label}>
            Descripción · Markdown (opcional)
          </label>
          <textarea
            id="description_md"
            name="description_md"
            defaultValue={product?.description_md ?? ""}
            rows={6}
            className={`${field} resize-y font-mono text-[13px] leading-relaxed`}
          />
        </div>
      </form>

      {editing && (
        <div className="mx-auto max-w-2xl px-6 pb-10">
          <DeleteButton
            action={deleteProduct}
            id={product.id}
            label="Eliminar producto"
            message="¿Eliminar este producto? No se puede deshacer."
            className="rounded-md border border-rojo-bandera/40 px-4 py-2 font-body text-xs font-bold text-rojo-bandera transition-colors hover:bg-rojo-bandera hover:text-white"
          />
        </div>
      )}
    </>
  );
}
