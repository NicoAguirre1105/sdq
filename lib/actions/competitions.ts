"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";

// Borrar temporadas/competiciones cascadea a stages → partidos + stage_teams
// (FK on delete cascade en el schema). Por eso el confirm en la UI es enfático.

const back = "/admin/futbol/competiciones";

export async function createSeason(formData: FormData) {
  await requireAdmin();
  const label = String(formData.get("label") ?? "").trim();
  if (!label) redirect(`${back}?error=season`);

  const is_current = formData.get("is_current") === "on";
  const supabase = await createServerSupabaseClient();
  // Solo una temporada vigente a la vez (getLeagueStages usa is_current).
  if (is_current)
    await supabase.from("seasons").update({ is_current: false }).eq("is_current", true);

  const { error } = await supabase.from("seasons").insert({ label, is_current });
  if (error) redirect(`${back}?error=season`);

  revalidatePath(back);
  redirect(back);
}

export async function deleteSeason(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase.from("seasons").delete().eq("id", id);
  revalidatePath(back);
  revalidatePath("/admin/futbol");
  redirect(back);
}

export async function createCompetition(formData: FormData) {
  await requireAdmin();
  const season_id = String(formData.get("season_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!season_id || !name) redirect(`${back}?error=competition`);

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("competitions")
    .insert({ season_id, name, slug: slugify(name) });
  if (error) redirect(`${back}?error=competition`);

  revalidatePath(back);
  revalidatePath("/admin/futbol");
  redirect(back);
}

export async function deleteCompetition(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase.from("competitions").delete().eq("id", id);
  revalidatePath(back);
  revalidatePath("/admin/futbol");
  redirect(back);
}
