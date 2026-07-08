import { createServerSupabaseClient } from "@/lib/supabase/client";

type ServerClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

// Adjunta homeTeam/awayTeam a una lista de partidos con una sola consulta a teams.
async function withTeams<T extends { home_team_id: string; away_team_id: string }>(
  supabase: ServerClient,
  matches: T[]
) {
  const ids = [...new Set(matches.flatMap((m) => [m.home_team_id, m.away_team_id]))];
  const { data: teams, error } = await supabase.from("teams").select("*").in("id", ids);
  if (error) throw error;
  const byId = new Map(teams?.map((t) => [t.id, t]));
  return matches.map((m) => ({
    ...m,
    homeTeam: byId.get(m.home_team_id) ?? null,
    awayTeam: byId.get(m.away_team_id) ?? null,
  }));
}

export async function getNextMatch() {
  const supabase = await createServerSupabaseClient();
  const { data: match, error } = await supabase
    .from("matches")
    .select("*")
    .eq("status", "programado")
    .order("match_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!match) return null;
  return (await withTeams(supabase, [match]))[0];
}

export type NextMatch = NonNullable<Awaited<ReturnType<typeof getNextMatch>>>;

export async function getUpcomingMatches(stageId: string, limit = 3) {
  const supabase = await createServerSupabaseClient();
  const { data: matches, error } = await supabase
    .from("matches")
    .select("*")
    .eq("stage_id", stageId)
    .eq("status", "programado")
    .order("match_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  if (!matches?.length) return [];
  return withTeams(supabase, matches);
}

export type UpcomingMatch = Awaited<ReturnType<typeof getUpcomingMatches>>[number];

// Todos los partidos del equipo propio (SD Quito) en la temporada, para el
// calendario. Cubre todas las competiciones/stages.
export async function getOwnTeamMatches() {
  const supabase = await createServerSupabaseClient();
  const { data: own } = await supabase
    .from("teams")
    .select("id")
    .eq("is_own_team", true)
    .maybeSingle();
  if (!own) return [];

  const { data: matches, error } = await supabase
    .from("matches")
    .select("*")
    .or(`home_team_id.eq.${own.id},away_team_id.eq.${own.id}`)
    .order("match_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  if (!matches?.length) return [];

  // Torneo de cada partido: stage → competition.
  const stageIds = [...new Set(matches.map((m) => m.stage_id))];
  const { data: stages, error: stagesError } = await supabase
    .from("stages")
    .select("id, competition_id")
    .in("id", stageIds);
  if (stagesError) throw stagesError;
  const { data: comps, error: compsError } = await supabase
    .from("competitions")
    .select("id, name")
    .in("id", [...new Set((stages ?? []).map((s) => s.competition_id))]);
  if (compsError) throw compsError;
  const compByStage = new Map(
    (stages ?? []).map((s) => [s.id, comps?.find((c) => c.id === s.competition_id)?.name ?? null])
  );

  const withCompetition = (await withTeams(supabase, matches)).map((m) => ({
    ...m,
    competition: compByStage.get(m.stage_id) ?? null,
  }));
  return withCompetition;
}

export type OwnTeamMatch = Awaited<ReturnType<typeof getOwnTeamMatches>>[number];
