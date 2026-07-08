import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

const POST_IMAGES_BUCKET = "post-images";

// Sube una imagen al bucket público y devuelve su URL pública. RLS de storage.objects
// permite escribir solo a admins (ver policies en supabase/schema.sql). El nombre se
// randomiza para evitar colisiones; no se sobreescribe (upsert:false).
export async function uploadPostImage(
  supabase: SupabaseClient<Database>,
  file: File
): Promise<string> {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(POST_IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from(POST_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Borra el objeto del bucket a partir de su URL pública. Ignora URLs que no sean de
// este bucket (por si alguna vez hubiera una portada externa) y no lanza si falla:
// un archivo huérfano no debe romper el guardado/borrado del post.
export async function deletePostImage(
  supabase: SupabaseClient<Database>,
  publicUrl: string
): Promise<void> {
  const marker = `/${POST_IMAGES_BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);
  const { error } = await supabase.storage.from(POST_IMAGES_BUCKET).remove([path]);
  // No lanzar: un archivo huérfano no debe romper el guardado/borrado del post.
  if (error) console.error("deletePostImage:", error.message);
}
