import { createServerSupabaseClient } from "@/lib/supabase/client";

// Stages en formato liga de la temporada vigente. Alimenta el selector de torneo
// y resuelve qué stage mostrar. Los stages 'eliminacion' se sumarán cuando exista
// la UI de bracket (hoy no hay datos ni vista para ese formato).
export async function getLeagueStages() {
  const supabase = await createServerSupabaseClient();

  const { data: season } = await supabase
    .from("seasons")
    .select("id")
    .eq("is_current", true)
    .maybeSingle();

  let competitions = supabase.from("competitions").select("*");
  if (season) competitions = competitions.eq("season_id", season.id);
  const { data: comps, error } = await competitions;
  if (error) throw error;
  if (!comps?.length) return [];

  const { data: stages, error: stagesError } = await supabase
    .from("stages")
    .select("*")
    .eq("format", "liga")
    .in(
      "competition_id",
      comps.map((c) => c.id)
    )
    .order("order_index", { ascending: true });
  if (stagesError) throw stagesError;

  const compById = new Map(comps.map((c) => [c.id, c]));
  return (stages ?? [])
    .map((s) => {
      const comp = compById.get(s.competition_id)!;
      return {
        stageId: s.id,
        stageName: s.name,
        competitionSlug: comp.slug,
        competitionName: comp.name,
      };
    })
    // ponytail: competitions no tiene campo de prioridad; orden alfabético estable.
    // Agregar order_index a competitions si se necesita un default/orden específico.
    .sort((a, b) => a.competitionName.localeCompare(b.competitionName));
}

export type LeagueStage = Awaited<ReturnType<typeof getLeagueStages>>[number];
