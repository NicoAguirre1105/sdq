"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { requireAdmin } from "@/lib/auth";
import { quitoInputToISO } from "@/lib/format";
import type { Database } from "@/lib/types/database";

export type MatchFormState = { error?: string };

const STATUSES = ["programado", "jugado", "suspendido"] as const;

type ParsedMatch = {
  stage_id: string;
  home_team_id: string;
  away_team_id: string;
  match_date: string | null;
  matchday: number | null;
  round_name: string | null;
  score_home: number | null;
  score_away: number | null;
  status: (typeof STATUSES)[number];
  ticket_url: string | null;
};

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function optInt(raw: FormDataEntryValue | null): number | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isInteger(n) ? n : null;
}

function parse(formData: FormData): ParsedMatch | { error: string } {
  const stage_id = String(formData.get("stage_id") ?? "");
  const home_team_id = String(formData.get("home_team_id") ?? "");
  const away_team_id = String(formData.get("away_team_id") ?? "");
  const rawStatus = String(formData.get("status") ?? "");
  const rawDate = String(formData.get("match_date") ?? "").trim();
  const round_name = String(formData.get("round_name") ?? "").trim();
  const ticket_url = String(formData.get("ticket_url") ?? "").trim();

  if (!stage_id) return { error: "Falta el stage." };
  if (!home_team_id || !away_team_id)
    return { error: "Elegí el equipo local y el visitante." };
  if (home_team_id === away_team_id)
    return { error: "El local y el visitante no pueden ser el mismo equipo." };
  if (ticket_url && !isValidUrl(ticket_url))
    return { error: "El link de entradas no es una URL válida." };

  return {
    stage_id,
    home_team_id,
    away_team_id,
    // datetime-local se interpreta como hora de Quito (UTC-5) → instante UTC.
    match_date: rawDate ? quitoInputToISO(rawDate) : null,
    matchday: optInt(formData.get("matchday")),
    round_name: round_name || null,
    score_home: optInt(formData.get("score_home")),
    score_away: optInt(formData.get("score_away")),
    status: (STATUSES as readonly string[]).includes(rawStatus)
      ? (rawStatus as ParsedMatch["status"])
      : "programado",
    ticket_url: ticket_url || null,
  };
}

// ponytail: sin emparejamiento ida/vuelta (tie_id/leg). Cada partido de eliminación
// se carga suelto; agregar el par con tie_id cuando exista la vista de bracket.
export async function createMatch(
  _prev: MatchFormState,
  formData: FormData
): Promise<MatchFormState> {
  await requireAdmin();
  const parsed = parse(formData);
  if ("error" in parsed) return parsed;

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("matches")
    .insert(parsed as Database["public"]["Tables"]["matches"]["Insert"]);
  if (error) return { error: "No se pudo guardar el partido." };

  revalidatePath("/admin/futbol");
  revalidatePath("/futbol");
  revalidatePath("/futbol/calendario");
  redirect(`/admin/futbol?stage=${parsed.stage_id}`);
}

export async function updateMatch(
  _prev: MatchFormState,
  formData: FormData
): Promise<MatchFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta el identificador del partido." };

  const parsed = parse(formData);
  if ("error" in parsed) return parsed;

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("matches").update(parsed).eq("id", id);
  if (error) return { error: "No se pudo actualizar el partido." };

  revalidatePath("/admin/futbol");
  revalidatePath("/futbol");
  revalidatePath("/futbol/calendario");
  redirect(`/admin/futbol?stage=${parsed.stage_id}`);
}

export async function deleteMatch(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const stageId = String(formData.get("stage_id") ?? "");
  if (!id) return;

  const supabase = await createServerSupabaseClient();
  await supabase.from("matches").delete().eq("id", id);

  revalidatePath("/admin/futbol");
  revalidatePath("/futbol");
  revalidatePath("/futbol/calendario");
  redirect(`/admin/futbol?stage=${stageId}`);
}
