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
