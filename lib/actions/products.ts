"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { uploadProductImage, deleteProductImage } from "@/lib/supabase/queries/storage";
import { getProductById } from "@/lib/supabase/queries/products";
import type { Database } from "@/lib/types/database";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB

// Sube las imágenes nuevas (input multiple) y las agrega a las que ya venían y no se
// quitaron (campo oculto "images", JSON de URLs, editado en el cliente al tocar QUITAR).
async function resolveImages(
  formData: FormData,
  supabase: SupabaseClient<Database>,
  keep: string[]
): Promise<{ urls: string[] } | { error: string }> {
  const files = formData
    .getAll("image_files")
    .filter((f): f is File => f instanceof File && f.size > 0);

  const uploaded: string[] = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) return { error: "Las imágenes deben ser archivos de imagen." };
    if (file.size > MAX_IMAGE_BYTES) return { error: "Cada imagen no puede superar 2 MB." };
    try {
      uploaded.push(await uploadProductImage(supabase, file));
    } catch {
      return { error: "No se pudo subir una de las imágenes." };
    }
  }
  return { urls: [...keep, ...uploaded] };
}

export type ProductFormState = { error?: string };

type ParsedProduct = {
  name: string;
  slug: string;
  description_md: string | null;
  price: number;
  category: string | null;
  sizes: string[] | null;
  stock: number | null;
  lead_time_message: string | null;
  published: boolean;
};

function parse(formData: FormData): ParsedProduct | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || name);
  const description_md = String(formData.get("description_md") ?? "").trim();
  const rawPrice = String(formData.get("price") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const rawSizes = String(formData.get("sizes") ?? "").trim();
  const rawStock = String(formData.get("stock") ?? "").trim();
  const lead_time_message = String(formData.get("lead_time_message") ?? "").trim();

  if (!name) return { error: "El nombre es obligatorio." };
  if (!slug) return { error: "El slug no puede quedar vacío." };

  const price = Number(rawPrice);
  if (!rawPrice || !Number.isFinite(price) || price < 0)
    return { error: "El precio debe ser un número válido." };

  let stock: number | null = null;
  if (rawStock) {
    stock = Number(rawStock);
    if (!Number.isInteger(stock) || stock < 0)
      return { error: "El stock debe ser un número entero mayor o igual a 0." };
  }

  const sizes = rawSizes
    ? rawSizes.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return {
    name,
    slug,
    description_md: description_md || null,
    price,
    category: category || null,
    sizes: sizes.length > 0 ? sizes : null,
    stock,
    lead_time_message: lead_time_message || null,
    published: formData.get("published") === "on",
  };
}

function parseKeptImages(formData: FormData): string[] {
  try {
    const parsed = JSON.parse(String(formData.get("images") ?? "[]"));
    return Array.isArray(parsed) ? parsed.filter((u) => typeof u === "string") : [];
  } catch {
    return [];
  }
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const parsed = parse(formData);
  if ("error" in parsed) return parsed;

  const supabase = await createServerSupabaseClient();
  const images = await resolveImages(formData, supabase, parseKeptImages(formData));
  if ("error" in images) return images;

  const { error } = await supabase.from("products").insert({ ...parsed, images: images.urls });
  if (error) {
    if (error.code === "23505") return { error: "Ya existe un producto con ese slug." };
    return { error: "No se pudo guardar el producto." };
  }

  revalidatePath("/admin/tienda");
  revalidatePath("/tienda");
  redirect("/admin/tienda");
}

export async function updateProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta el identificador del producto." };

  const parsed = parse(formData);
  if ("error" in parsed) return parsed;

  const supabase = await createServerSupabaseClient();
  const existing = await getProductById(id);

  const keep = parseKeptImages(formData);
  const images = await resolveImages(formData, supabase, keep);
  if ("error" in images) return images;

  const { error } = await supabase
    .from("products")
    .update({ ...parsed, images: images.urls })
    .eq("id", id);
  if (error) {
    if (error.code === "23505") return { error: "Ya existe un producto con ese slug." };
    return { error: "No se pudo actualizar el producto." };
  }

  // Borrar de Storage las imágenes que ya no quedaron en el producto.
  const removed = (existing?.images ?? []).filter((url) => !images.urls.includes(url));
  for (const url of removed) await deleteProductImage(supabase, url);

  revalidatePath("/admin/tienda");
  revalidatePath("/tienda");
  revalidatePath(`/tienda/${parsed.slug}`);
  redirect("/admin/tienda");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createServerSupabaseClient();
  const existing = await getProductById(id);
  await supabase.from("products").delete().eq("id", id);
  for (const url of existing?.images ?? []) await deleteProductImage(supabase, url);

  revalidatePath("/admin/tienda");
  revalidatePath("/tienda");
  redirect("/admin/tienda");
}
