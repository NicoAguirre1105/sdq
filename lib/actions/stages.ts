"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export type StageFormState = { error?: string };

// ponytail: crea el stage (y sus stage_teams si es liga). No hay edición/borrado de
// stages acá — es raro y el borrado cascadearía partidos; se hace en Supabase Studio.
export async function createStage(
  _prev: StageFormState,
  formData: FormData
): Promise<StageFormState> {
  await requireAdmin();

  const competition_id = String(formData.get("competition_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const rawFormat = String(formData.get("format") ?? "");
  const format = rawFormat === "eliminacion" ? "eliminacion" : "liga";
  const order_index = Number(formData.get("order_index") ?? 0) || 0;
  const teamIds = formData.getAll("team_ids").map(String).filter(Boolean);

  if (!competition_id) return { error: "Elegí una competición." };
  if (!name) return { error: "El nombre del stage es obligatorio." };
  if (format === "liga" && teamIds.length < 2)
    return { error: "Una tabla de liga necesita al menos 2 equipos." };

  const supabase = await createServerSupabaseClient();
  const { data: stage, error } = await supabase
    .from("stages")
    .insert({ competition_id, name, slug: slugify(name), format, order_index })
    .select("id")
    .single();
  if (error || !stage) return { error: "No se pudo crear el stage." };

  if (format === "liga") {
    const { error: stError } = await supabase
      .from("stage_teams")
      .insert(teamIds.map((team_id) => ({ stage_id: stage.id, team_id })));
    if (stError) return { error: "Se creó el stage pero fallaron los equipos." };
  }

  revalidatePath("/admin/futbol");
  revalidatePath("/futbol");
  redirect(`/admin/futbol?stage=${stage.id}`);
}

export async function deleteStage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  // on delete cascade: se van sus partidos y stage_teams.
  await supabase.from("stages").delete().eq("id", id);
  revalidatePath("/admin/futbol");
  revalidatePath("/futbol");
  redirect("/admin/futbol");
}
