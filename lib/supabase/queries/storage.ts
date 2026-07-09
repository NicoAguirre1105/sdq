import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

// Sube un archivo a un bucket público y devuelve su URL pública. RLS de storage.objects
// permite escribir solo a admins (ver policies en supabase/schema.sql). El nombre se
// randomiza para evitar colisiones; no se sobreescribe (upsert:false).
async function uploadToBucket(
  supabase: SupabaseClient<Database>,
  bucket: string,
  file: File
): Promise<string> {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// Borra el objeto del bucket a partir de su URL pública. Ignora URLs que no sean de
// este bucket y no lanza si falla: un archivo huérfano no debe romper el guardado/borrado.
async function deleteFromBucket(
  supabase: SupabaseClient<Database>,
  bucket: string,
  publicUrl: string
): Promise<void> {
  const marker = `/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) console.error(`deleteFromBucket(${bucket}):`, error.message);
}

const POST_IMAGES_BUCKET = "post-images";
const TEAM_LOGOS_BUCKET = "team_logos";

export const uploadPostImage = (supabase: SupabaseClient<Database>, file: File) =>
  uploadToBucket(supabase, POST_IMAGES_BUCKET, file);

export const deletePostImage = (supabase: SupabaseClient<Database>, url: string) =>
  deleteFromBucket(supabase, POST_IMAGES_BUCKET, url);

export const uploadTeamLogo = (supabase: SupabaseClient<Database>, file: File) =>
  uploadToBucket(supabase, TEAM_LOGOS_BUCKET, file);

export const deleteTeamLogo = (supabase: SupabaseClient<Database>, url: string) =>
  deleteFromBucket(supabase, TEAM_LOGOS_BUCKET, url);
