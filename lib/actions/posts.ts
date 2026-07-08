"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { uploadPostImage, deletePostImage } from "@/lib/supabase/queries/storage";
import { getPostById } from "@/lib/supabase/queries/posts";
import type { Database } from "@/lib/types/database";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Resuelve la portada: si se subió un archivo nuevo lo manda a Storage y devuelve su URL;
// si no, conserva la URL que ya venía (campo oculto). Valida tipo y tamaño.
async function resolveCoverImage(
  formData: FormData,
  supabase: SupabaseClient<Database>,
  fallback: string | null
): Promise<{ url: string | null } | { error: string }> {
  const file = formData.get("cover_image_file");
  if (!(file instanceof File) || file.size === 0) return { url: fallback };

  if (!file.type.startsWith("image/"))
    return { error: "El archivo de portada debe ser una imagen." };
  if (file.size > MAX_IMAGE_BYTES)
    return { error: "La imagen no puede superar los 5 MB." };

  try {
    return { url: await uploadPostImage(supabase, file) };
  } catch {
    return { error: "No se pudo subir la imagen." };
  }
}

export type PostFormState = { error?: string };

type ParsedPost = {
  title: string;
  slug: string;
  excerpt: string | null;
  content_md: string;
  category: "noticia" | "cronica" | "aviso" | null;
  cover_image: string | null;
  published: boolean;
};

const CATEGORIES = ["noticia", "cronica", "aviso"] as const;

function parse(formData: FormData): ParsedPost | { error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || title);
  const content_md = String(formData.get("content_md") ?? "").trim();
  const rawCategory = String(formData.get("category") ?? "");
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const cover_image = String(formData.get("cover_image") ?? "").trim();

  if (!title) return { error: "El título es obligatorio." };
  if (!slug) return { error: "El slug no puede quedar vacío." };
  if (!content_md) return { error: "El contenido no puede quedar vacío." };

  return {
    title,
    slug,
    content_md,
    category: (CATEGORIES as readonly string[]).includes(rawCategory)
      ? (rawCategory as ParsedPost["category"])
      : null,
    excerpt: excerpt || null,
    cover_image: cover_image || null,
    published: formData.get("published") === "on",
  };
}

export async function createPost(
  _prev: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  await requireAdmin();
  const parsed = parse(formData);
  if ("error" in parsed) return parsed;

  const { published, ...post } = parsed;
  const supabase = await createServerSupabaseClient();

  const cover = await resolveCoverImage(formData, supabase, post.cover_image);
  if ("error" in cover) return cover;

  const { error } = await supabase.from("posts").insert({
    ...post,
    cover_image: cover.url,
    published_at: published ? new Date().toISOString() : null,
  });

  if (error) {
    if (error.code === "23505") return { error: "Ya existe un post con ese slug." };
    return { error: "No se pudo guardar el post." };
  }

  revalidatePath("/admin/posts");
  revalidatePath("/");
  redirect("/admin/posts");
}

export async function updatePost(
  _prev: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta el identificador del post." };

  const parsed = parse(formData);
  if ("error" in parsed) return parsed;

  const { published, ...post } = parsed;
  // Al republicar conservar la fecha original si existía; si es la primera vez, ahora.
  const currentPublishedAt = String(formData.get("current_published_at") ?? "");
  const published_at = published
    ? currentPublishedAt || new Date().toISOString()
    : null;

  const supabase = await createServerSupabaseClient();
  const existing = await getPostById(id);

  const cover = await resolveCoverImage(formData, supabase, post.cover_image);
  if ("error" in cover) return cover;

  const { error } = await supabase
    .from("posts")
    .update({ ...post, cover_image: cover.url, published_at })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "Ya existe un post con ese slug." };
    return { error: "No se pudo actualizar el post." };
  }

  // Si la portada cambió (reemplazo o "quitar"), borrar el archivo anterior de Storage.
  if (existing?.cover_image && existing.cover_image !== cover.url) {
    await deletePostImage(supabase, existing.cover_image);
  }

  revalidatePath("/admin/posts");
  revalidatePath("/");
  redirect("/admin/posts");
}

export async function deletePost(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createServerSupabaseClient();
  const existing = await getPostById(id);
  await supabase.from("posts").delete().eq("id", id);
  if (existing?.cover_image) await deletePostImage(supabase, existing.cover_image);

  revalidatePath("/admin/posts");
  revalidatePath("/");
  redirect("/admin/posts");
}
