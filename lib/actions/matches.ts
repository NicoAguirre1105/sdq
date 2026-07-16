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
  home_team_id: string | null;
  away_team_id: string | null;
  match_date: string | null;
  matchday: number | null;
  round_name: string | null;
  score_home: number | null;
  score_away: number | null;
  status: (typeof STATUSES)[number];
  ticket_url: string | null;
  venue: string | null;
  leg: number | null;
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
  const home_team_id = String(formData.get("home_team_id") ?? "").trim();
  const away_team_id = String(formData.get("away_team_id") ?? "").trim();
  const rawStatus = String(formData.get("status") ?? "");
  const rawDate = String(formData.get("match_date") ?? "").trim();
  const round_name = String(formData.get("round_name") ?? "").trim();
  const ticket_url = String(formData.get("ticket_url") ?? "").trim();
  const venue = String(formData.get("venue") ?? "").trim();
  // Solo un cuadro fijo de eliminación permite equipos "por definir" — lo manda
  // el form como campo oculto (ver MatchForm) para no pegarle a la base acá.
  const stageBracketMode = String(formData.get("stage_bracket_mode") ?? "");
  const teamsOptional = stageBracketMode === "fijo";
  const rawLeg = String(formData.get("leg") ?? "");
  const leg = rawLeg === "1" || rawLeg === "2" ? Number(rawLeg) : null;

  if (!stage_id) return { error: "Falta el stage." };
  if (!teamsOptional && (!home_team_id || !away_team_id))
    return { error: "Elegí el equipo local y el visitante." };
  if (home_team_id && away_team_id && home_team_id === away_team_id)
    return { error: "El local y el visitante no pueden ser el mismo equipo." };
  if (ticket_url && !isValidUrl(ticket_url))
    return { error: "El link de entradas no es una URL válida." };

  return {
    stage_id,
    home_team_id: home_team_id || null,
    away_team_id: away_team_id || null,
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
    venue: venue || null,
    leg,
  };
}

// Vuelta enlazada a una ida: reutiliza el tie_id de la ida si ya tiene uno
// (no debería, el selector de idas solo ofrece las que no tienen vuelta todavía),
// o le genera uno nuevo y lo guarda también en la ida — así ambas filas quedan
// unidas para calcular el marcador agregado en público. La vuelta también hereda
// el bracket_slot de la ida (mismo cruce, mismo lugar del cuadro) para que el
// dibujo de líneas del bracket la reconozca como un solo cruce.
async function resolveTie(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  idaMatchId: string
): Promise<{ tie_id: string; bracket_slot: number | null } | { error: string }> {
  const { data: ida, error } = await supabase
    .from("matches")
    .select("tie_id, bracket_slot")
    .eq("id", idaMatchId)
    .maybeSingle();
  if (error || !ida) return { error: "No se encontró el partido de ida elegido." };
  if (ida.tie_id) return { tie_id: ida.tie_id, bracket_slot: ida.bracket_slot };

  const tie_id = crypto.randomUUID();
  const { error: updateError } = await supabase
    .from("matches")
    .update({ tie_id })
    .eq("id", idaMatchId);
  if (updateError) return { error: "No se pudo enlazar con el partido de ida." };
  return { tie_id, bracket_slot: ida.bracket_slot };
}

export async function createMatch(
  _prev: MatchFormState,
  formData: FormData
): Promise<MatchFormState> {
  await requireAdmin();
  const parsed = parse(formData);
  if ("error" in parsed) return parsed;

  const supabase = await createServerSupabaseClient();

  let tie_id: string | null = null;
  let bracket_slot: number | null = null;
  if (parsed.leg === 2) {
    const idaMatchId = String(formData.get("ida_match_id") ?? "");
    if (!idaMatchId) return { error: "Elegí a qué partido de ida corresponde la vuelta." };
    const resolved = await resolveTie(supabase, idaMatchId);
    if ("error" in resolved) return resolved;
    tie_id = resolved.tie_id;
    bracket_slot = resolved.bracket_slot;
  }

  const { error } = await supabase
    .from("matches")
    .insert({ ...parsed, tie_id, bracket_slot } as Database["public"]["Tables"]["matches"]["Insert"]);
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

  // tie_id no se toca salvo que esta edición esté fijando una vuelta — así no se
  // pisa el enlace de una ida que ya tiene su vuelta cargada al re-guardarla.
  const update: typeof parsed & { tie_id?: string; bracket_slot?: number | null } = { ...parsed };
  if (parsed.leg === 2) {
    const idaMatchId = String(formData.get("ida_match_id") ?? "");
    if (!idaMatchId) return { error: "Elegí a qué partido de ida corresponde la vuelta." };
    const resolved = await resolveTie(supabase, idaMatchId);
    if ("error" in resolved) return resolved;
    update.tie_id = resolved.tie_id;
    update.bracket_slot = resolved.bracket_slot;
  }

  const { error } = await supabase.from("matches").update(update).eq("id", id);
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

  // Si el partido borrado era una pierna de un cruce ida/vuelta, la otra pierna
  // no puede quedar con un tie_id que ya no enlaza a nadie — eso la deja
  // "huérfana" (Bracket.tsx la trataría mal). Sin esto, el partido restante se
  // desprende del cruce como un partido suelto normal (vuelve a mostrar
  // "Vuelta no confirmada" si era la ida).
  const { data: deleted } = await supabase.from("matches").select("tie_id").eq("id", id).maybeSingle();
  await supabase.from("matches").delete().eq("id", id);
  if (deleted?.tie_id) {
    const { data: siblings } = await supabase
      .from("matches")
      .select("id")
      .eq("tie_id", deleted.tie_id);
    if (siblings?.length === 1) {
      await supabase.from("matches").update({ tie_id: null }).eq("id", siblings[0].id);
    }
  }

  revalidatePath("/admin/futbol");
  revalidatePath("/futbol");
  revalidatePath("/futbol/calendario");
  redirect(`/admin/futbol?stage=${stageId}`);
}
