"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import type { Database } from "@/lib/types/database";

export type StageFormState = { error?: string };

// Nombre de ronda por distancia a la final (0 = final). Cae a "Ronda N" para
// cuadros más grandes de los nombres estándar en español.
const ROUND_NAMES = ["Final", "Semifinal", "Cuartos de Final", "Octavos de Final", "Dieciseisavos de Final"];
function roundName(distanceToFinal: number, roundNumber: number) {
  return ROUND_NAMES[distanceToFinal] ?? `Ronda ${roundNumber}`;
}

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
  const rawBracketMode = String(formData.get("bracket_mode") ?? "");
  const bracket_mode =
    format === "eliminacion" && (rawBracketMode === "fijo" || rawBracketMode === "sorteo")
      ? rawBracketMode
      : null;
  const total_rounds =
    bracket_mode === "fijo" ? Math.max(1, Math.min(6, Number(formData.get("total_rounds") ?? 0) || 0)) : null;

  if (!competition_id) return { error: "Elegí una competición." };
  if (!name) return { error: "El nombre del stage es obligatorio." };
  if (format === "liga" && teamIds.length < 2)
    return { error: "Una tabla de liga necesita al menos 2 equipos." };
  if (format === "eliminacion" && !bracket_mode)
    return { error: "Elegí si el cuadro es fijo o se arma por sorteo." };

  const supabase = await createServerSupabaseClient();
  // bracket_mode/total_rounds solo se mandan si aplican: así la creación de
  // stages 'liga' sigue funcionando aunque las columnas nuevas todavía no
  // existan en la base real (falta correr el ALTER TABLE a mano — ver
  // .claude/data-model.md).
  const insertPayload: Database["public"]["Tables"]["stages"]["Insert"] = {
    competition_id,
    name,
    slug: slugify(name),
    format,
    order_index,
  };
  if (bracket_mode) insertPayload.bracket_mode = bracket_mode;
  if (total_rounds) insertPayload.total_rounds = total_rounds;
  const { data: stage, error } = await supabase
    .from("stages")
    .insert(insertPayload)
    .select("id")
    .single();
  if (error || !stage) return { error: "No se pudo crear el stage." };

  if (format === "liga") {
    const { error: stError } = await supabase
      .from("stage_teams")
      .insert(teamIds.map((team_id) => ({ stage_id: stage.id, team_id })));
    if (stError) return { error: "Se creó el stage pero fallaron los equipos." };
  }

  // Cuadro fijo con rondas totales: genera de una todos los partidos "por
  // definir" del cuadro (2^total_rounds - 1), listos para que el admin vaya
  // completando equipos/resultado ronda a ronda en vez de cargarlos uno por uno.
  if (total_rounds) {
    const placeholders: Database["public"]["Tables"]["matches"]["Insert"][] = [];
    for (let round = 1; round <= total_rounds; round++) {
      const matchesInRound = 2 ** (total_rounds - round);
      const rName = roundName(total_rounds - round, round);
      for (let slot = 0; slot < matchesInRound; slot++) {
        placeholders.push({
          stage_id: stage.id,
          matchday: round,
          round_name: rName,
          bracket_slot: slot,
          status: "programado",
          home_team_id: null,
          away_team_id: null,
          match_date: null,
        });
      }
    }
    const { error: matchesError } = await supabase.from("matches").insert(placeholders);
    if (matchesError) return { error: "Se creó el stage pero falló generar el cuadro." };
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
