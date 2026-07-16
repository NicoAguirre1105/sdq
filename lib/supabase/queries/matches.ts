import { createServerSupabaseClient } from "@/lib/supabase/client";

type ServerClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

// id del equipo propio (SD Quito). null si no hay ninguno marcado.
async function getOwnTeamId(supabase: ServerClient): Promise<string | null> {
  const { data } = await supabase
    .from("teams")
    .select("id")
    .eq("is_own_team", true)
    .maybeSingle();
  return data?.id ?? null;
}

// Adjunta homeTeam/awayTeam a una lista de partidos con una sola consulta a teams.
// Tolera equipos null (partidos "por definir" de brackets en modo fijo).
async function withTeams<
  T extends { home_team_id: string | null; away_team_id: string | null },
>(supabase: ServerClient, matches: T[]) {
  const ids = [...new Set(matches.flatMap((m) => [m.home_team_id, m.away_team_id]))].filter(
    (id): id is string => id != null
  );
  // "" nunca matchea un uuid real — evita mandar .in() vacío cuando todos los
  // equipos son null (bracket en modo fijo sin definir todavía) sin perder el
  // tipo inferido de la fila de teams.
  const { data: teams, error } = await supabase.from("teams").select("*").in("id", ids.length ? ids : [""]);
  if (error) throw error;
  const byId = new Map(teams?.map((t) => [t.id, t]));
  return matches.map((m) => ({
    ...m,
    homeTeam: m.home_team_id ? (byId.get(m.home_team_id) ?? null) : null,
    awayTeam: m.away_team_id ? (byId.get(m.away_team_id) ?? null) : null,
  }));
}

// Próximo partido programado de SD Quito (cualquier torneo). Solo del equipo propio.
export async function getNextMatch() {
  const supabase = await createServerSupabaseClient();
  const ownId = await getOwnTeamId(supabase);
  if (!ownId) return null;

  const { data: match, error } = await supabase
    .from("matches")
    .select("*")
    .eq("status", "programado")
    .or(`home_team_id.eq.${ownId},away_team_id.eq.${ownId}`)
    .order("match_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!match) return null;
  return (await withTeams(supabase, [match]))[0];
}

export type NextMatch = NonNullable<Awaited<ReturnType<typeof getNextMatch>>>;

// Próximos partidos programados de SD Quito dentro de un stage. Solo del equipo propio.
export async function getUpcomingMatches(stageId: string, limit = 3) {
  const supabase = await createServerSupabaseClient();
  const ownId = await getOwnTeamId(supabase);
  if (!ownId) return [];

  const { data: matches, error } = await supabase
    .from("matches")
    .select("*")
    .eq("stage_id", stageId)
    .eq("status", "programado")
    .or(`home_team_id.eq.${ownId},away_team_id.eq.${ownId}`)
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
  const ownId = await getOwnTeamId(supabase);
  if (!ownId) return [];

  const { data: matches, error } = await supabase
    .from("matches")
    .select("*")
    .or(`home_team_id.eq.${ownId},away_team_id.eq.${ownId}`)
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

// Todos los partidos de un stage (de todos los equipos). Usada en el admin para
// gestión, y en público para armar el bracket de stages 'eliminacion'.
export async function getStageMatches(stageId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: matches, error } = await supabase
    .from("matches")
    .select("*")
    .eq("stage_id", stageId)
    .order("match_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  if (!matches?.length) return [];
  return withTeams(supabase, matches);
}

export type StageMatch = Awaited<ReturnType<typeof getStageMatches>>[number];

export async function getMatchById(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
