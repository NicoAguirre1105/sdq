import { createServerSupabaseClient } from "@/lib/supabase/client";

// Catálogo maestro de equipos, para los selectores del form de partidos.
export async function getAllTeams() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// Equipos inscritos en un stage (vía stage_teams) — solo aplica a formato 'liga',
// para no ofrecer en el form de partidos equipos que no compiten en ese torneo.
export async function getStageTeams(stageId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: links, error } = await supabase
    .from("stage_teams")
    .select("team_id")
    .eq("stage_id", stageId);
  if (error) throw error;
  if (!links?.length) return [];

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("*")
    .in(
      "id",
      links.map((l) => l.team_id)
    )
    .order("name", { ascending: true });
  if (teamsError) throw teamsError;
  return teams ?? [];
}

export async function getTeamById(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
