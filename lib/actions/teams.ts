"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { requireAdmin } from "@/lib/auth";
import { uploadTeamLogo, deleteTeamLogo } from "@/lib/supabase/queries/storage";
import { getTeamById } from "@/lib/supabase/queries/teams";
import type { Database } from "@/lib/types/database";

const MAX_LOGO_BYTES = 1024 * 1024; // 1 MB, igual que el límite del bucket team_logos

export type TeamFormState = { error?: string };

type ParsedTeam = {
  name: string;
  short_name: string | null;
  logo_url: string | null;
};

// Resuelve el logo: si se subió un SVG lo manda a Storage y devuelve su URL; si no,
// conserva la URL que ya venía (campo oculto; "" = quitar). Solo SVG, hasta 1 MB.
async function resolveLogo(
  formData: FormData,
  supabase: SupabaseClient<Database>,
  fallback: string | null
): Promise<{ url: string | null } | { error: string }> {
  const file = formData.get("logo_file");
  if (!(file instanceof File) || file.size === 0) return { url: fallback };

  if (file.type !== "image/svg+xml")
    return { error: "El escudo debe ser un archivo SVG." };
  if (file.size > MAX_LOGO_BYTES)
    return { error: "El SVG no puede superar 1 MB." };

  try {
    return { url: await uploadTeamLogo(supabase, file) };
  } catch {
    return { error: "No se pudo subir el escudo." };
  }
}

function parse(formData: FormData): ParsedTeam | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const short_name = String(formData.get("short_name") ?? "").trim();
  const logo_url = String(formData.get("logo_url") ?? "").trim();

  if (!name) return { error: "El nombre del equipo es obligatorio." };

  // is_own_team no se gestiona desde el form (siempre queda en el default false al
  // crear, e intacto al editar); se cambia a mano en Supabase si hace falta.
  return {
    name,
    short_name: short_name || null,
    logo_url: logo_url || null,
  };
}

export async function createTeam(
  _prev: TeamFormState,
  formData: FormData
): Promise<TeamFormState> {
  await requireAdmin();
  const parsed = parse(formData);
  if ("error" in parsed) return parsed;

  const supabase = await createServerSupabaseClient();

  const logo = await resolveLogo(formData, supabase, parsed.logo_url);
  if ("error" in logo) return logo;

  const { error } = await supabase
    .from("teams")
    .insert({ ...parsed, logo_url: logo.url });
  if (error) return { error: "No se pudo guardar el equipo." };

  revalidatePath("/admin/futbol/equipos");
  redirect("/admin/futbol/equipos");
}

export async function updateTeam(
  _prev: TeamFormState,
  formData: FormData
): Promise<TeamFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta el identificador del equipo." };

  const parsed = parse(formData);
  if ("error" in parsed) return parsed;

  const supabase = await createServerSupabaseClient();
  const existing = await getTeamById(id);

  const logo = await resolveLogo(formData, supabase, parsed.logo_url);
  if ("error" in logo) return logo;

  const { error } = await supabase
    .from("teams")
    .update({ ...parsed, logo_url: logo.url })
    .eq("id", id);
  if (error) return { error: "No se pudo actualizar el equipo." };

  // Si el escudo cambió (reemplazo o "quitar"), borrar el SVG anterior de Storage.
  if (existing?.logo_url && existing.logo_url !== logo.url) {
    await deleteTeamLogo(supabase, existing.logo_url);
  }

  revalidatePath("/admin/futbol/equipos");
  redirect("/admin/futbol/equipos");
}

export async function deleteTeam(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createServerSupabaseClient();
  const existing = await getTeamById(id);
  // FK con on delete cascade: se van también sus partidos y su lugar en las tablas.
  await supabase.from("teams").delete().eq("id", id);
  if (existing?.logo_url) await deleteTeamLogo(supabase, existing.logo_url);

  revalidatePath("/admin/futbol/equipos");
  revalidatePath("/admin/futbol");
  redirect("/admin/futbol/equipos");
}
