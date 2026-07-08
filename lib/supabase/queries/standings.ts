import { createServerSupabaseClient } from "@/lib/supabase/client";

// ponytail: sin filtro de stage — Fase 1 tiene un solo stage liga activo. Pasar
// stageId (o derivar el stage vigente) cuando exista más de una competición.
export async function getStandings() {
  const supabase = await createServerSupabaseClient();
  const { data: rows, error } = await supabase.from("standings").select("*");
  if (error) throw error;
  if (!rows?.length) return [];

  // La vista no expone short_name/is_own_team; se traen de teams para resaltar
  // al Deportivo Quito y usar el nombre corto.
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id, short_name, is_own_team")
    .in(
      "id",
      rows.map((r) => r.team_id)
    );
  if (teamsError) throw teamsError;
  const byId = new Map(teams?.map((t) => [t.id, t]));

  return rows
    .map((r) => {
      const team = byId.get(r.team_id);
      return {
        team_id: r.team_id,
        name: team?.short_name ?? r.team_name,
        is_own_team: team?.is_own_team ?? false,
        played: r.played,
        won: r.won,
        drawn: r.drawn,
        lost: r.lost,
        goals_for: r.goals_for,
        goals_against: r.goals_against,
        goal_diff: r.goals_for - r.goals_against,
        points: r.won * 3 + r.drawn,
      };
    })
    .sort(
      (a, b) =>
        b.points - a.points || b.goal_diff - a.goal_diff || b.goals_for - a.goals_for
    )
    .map((row, i) => ({ ...row, position: i + 1 }));
}

export type StandingRow = Awaited<ReturnType<typeof getStandings>>[number];

// Etiqueta de la competición vigente para el encabezado (ej. "Serie B 2026").
export async function getActiveCompetitionName() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("competitions").select("name").limit(1).maybeSingle();
  if (error) throw error;
  return data?.name ?? null;
}
