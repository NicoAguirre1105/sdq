"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { requireAdmin } from "@/lib/auth";
import { POSITIONS } from "@/lib/positions";
import { uploadPlayerPhoto, deletePlayerPhoto } from "@/lib/supabase/queries/storage";
import { getPlayerById } from "@/lib/supabase/queries/players";
import type { Database } from "@/lib/types/database";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2 MB

export type PlayerFormState = { error?: string };

type ParsedPlayer = {
  full_name: string;
  position: string | null;
  jersey_number: number | null;
  bio_md: string | null;
  photo_url: string | null;
};

// Resuelve la foto: si se subió una imagen la manda a Storage y devuelve su URL; si no,
// conserva la URL que ya venía (campo oculto; "" = quitar). Imagen, hasta 2 MB.
async function resolvePhoto(
  formData: FormData,
  supabase: SupabaseClient<Database>,
  fallback: string | null
): Promise<{ url: string | null } | { error: string }> {
  const file = formData.get("photo_file");
  if (!(file instanceof File) || file.size === 0) return { url: fallback };

  if (!file.type.startsWith("image/"))
    return { error: "La foto debe ser una imagen." };
  if (file.size > MAX_PHOTO_BYTES)
    return { error: "La foto no puede superar 2 MB." };

  try {
    return { url: await uploadPlayerPhoto(supabase, file) };
  } catch {
    return { error: "No se pudo subir la foto." };
  }
}

function parse(formData: FormData): ParsedPlayer | { error: string } {
  const full_name = String(formData.get("full_name") ?? "").trim();
  const rawPosition = String(formData.get("position") ?? "");
  const rawNumber = String(formData.get("jersey_number") ?? "").trim();
  const bio_md = String(formData.get("bio_md") ?? "").trim();
  const photo_url = String(formData.get("photo_url") ?? "").trim();

  if (!full_name) return { error: "El nombre del jugador es obligatorio." };

  const n = Number(rawNumber);
  return {
    full_name,
    position: (POSITIONS as readonly string[]).includes(rawPosition) ? rawPosition : null,
    jersey_number: rawNumber && Number.isInteger(n) && n >= 0 ? n : null,
    bio_md: bio_md || null,
    photo_url: photo_url || null,
  };
}

export async function createPlayer(
  _prev: PlayerFormState,
  formData: FormData
): Promise<PlayerFormState> {
  await requireAdmin();
  const parsed = parse(formData);
  if ("error" in parsed) return parsed;

  const supabase = await createServerSupabaseClient();
  const photo = await resolvePhoto(formData, supabase, parsed.photo_url);
  if ("error" in photo) return photo;

  const { error } = await supabase
    .from("players")
    .insert({ ...parsed, photo_url: photo.url });
  if (error) return { error: "No se pudo guardar el jugador." };

  revalidatePath("/admin/plantilla");
  revalidatePath("/plantilla");
  redirect("/admin/plantilla");
}

export async function updatePlayer(
  _prev: PlayerFormState,
  formData: FormData
): Promise<PlayerFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta el identificador del jugador." };

  const parsed = parse(formData);
  if ("error" in parsed) return parsed;

  const supabase = await createServerSupabaseClient();
  const existing = await getPlayerById(id);

  const photo = await resolvePhoto(formData, supabase, parsed.photo_url);
  if ("error" in photo) return photo;

  const { error } = await supabase
    .from("players")
    .update({ ...parsed, photo_url: photo.url })
    .eq("id", id);
  if (error) return { error: "No se pudo actualizar el jugador." };

  // Si la foto cambió (reemplazo o "quitar"), borrar la anterior de Storage.
  if (existing?.photo_url && existing.photo_url !== photo.url) {
    await deletePlayerPhoto(supabase, existing.photo_url);
  }

  revalidatePath("/admin/plantilla");
  revalidatePath("/plantilla");
  redirect("/admin/plantilla");
}

export async function deletePlayer(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createServerSupabaseClient();
  const existing = await getPlayerById(id);
  await supabase.from("players").delete().eq("id", id);
  if (existing?.photo_url) await deletePlayerPhoto(supabase, existing.photo_url);

  revalidatePath("/admin/plantilla");
  revalidatePath("/plantilla");
  redirect("/admin/plantilla");
}
