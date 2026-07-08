import { createServerSupabaseClient } from "@/lib/supabase/client";

export async function getNextMatch() {
  const supabase = await createServerSupabaseClient();
  const { data: match, error } = await supabase
    .from("matches")
    .select("*")
    .eq("status", "programado")
    .order("match_date", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!match) return null;

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("*")
    .in("id", [match.home_team_id, match.away_team_id]);
  if (teamsError) throw teamsError;

  const homeTeam = teams?.find((t) => t.id === match.home_team_id) ?? null;
  const awayTeam = teams?.find((t) => t.id === match.away_team_id) ?? null;

  return { ...match, homeTeam, awayTeam };
}

export type NextMatch = NonNullable<Awaited<ReturnType<typeof getNextMatch>>>;

export async function getUpcomingMatches(stageId: string, limit = 3) {
  const supabase = await createServerSupabaseClient();
  const { data: matches, error } = await supabase
    .from("matches")
    .select("*")
    .eq("stage_id", stageId)
    .eq("status", "programado")
    .order("match_date", { ascending: true })
    .limit(limit);
  if (error) throw error;
  if (!matches?.length) return [];

  const ids = [...new Set(matches.flatMap((m) => [m.home_team_id, m.away_team_id]))];
  const { data: teams, error: teamsError } = await supabase.from("teams").select("*").in("id", ids);
  if (teamsError) throw teamsError;
  const byId = new Map(teams?.map((t) => [t.id, t]));

  return matches.map((m) => ({
    ...m,
    homeTeam: byId.get(m.home_team_id) ?? null,
    awayTeam: byId.get(m.away_team_id) ?? null,
  }));
}

export type UpcomingMatch = Awaited<ReturnType<typeof getUpcomingMatches>>[number];
