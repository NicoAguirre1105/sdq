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

// Admin: todos los stages (cualquier formato, cualquier temporada) con sus
// etiquetas de competición/temporada, para el selector de gestión de partidos.
// La temporada vigente va primero; dentro, por competición y order_index.
export async function getAdminStages() {
  const supabase = await createServerSupabaseClient();

  const { data: seasons, error: seasonsError } = await supabase
    .from("seasons")
    .select("*");
  if (seasonsError) throw seasonsError;
  if (!seasons?.length) return [];

  const { data: comps, error: compsError } = await supabase
    .from("competitions")
    .select("*");
  if (compsError) throw compsError;
  if (!comps?.length) return [];

  const { data: stages, error: stagesError } = await supabase
    .from("stages")
    .select("*")
    .order("order_index", { ascending: true });
  if (stagesError) throw stagesError;
  if (!stages?.length) return [];

  const seasonById = new Map(seasons.map((s) => [s.id, s]));
  const compById = new Map(comps.map((c) => [c.id, c]));

  return stages
    .map((s) => {
      const comp = compById.get(s.competition_id)!;
      const season = seasonById.get(comp.season_id);
      return {
        stageId: s.id,
        stageName: s.name,
        format: s.format,
        orderIndex: s.order_index,
        competitionName: comp.name,
        seasonLabel: season?.label ?? "",
        seasonCurrent: season?.is_current ?? false,
      };
    })
    .sort(
      (a, b) =>
        Number(b.seasonCurrent) - Number(a.seasonCurrent) ||
        a.seasonLabel.localeCompare(b.seasonLabel) ||
        a.competitionName.localeCompare(b.competitionName) ||
        a.orderIndex - b.orderIndex
    );
}

export type AdminStage = Awaited<ReturnType<typeof getAdminStages>>[number];

export async function getSeasons() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .order("label", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Competiciones con etiqueta de temporada, para la pantalla de gestión.
export async function getCompetitionsWithSeason() {
  const supabase = await createServerSupabaseClient();
  const [{ data: comps, error }, { data: seasons, error: sErr }] = await Promise.all([
    supabase.from("competitions").select("*"),
    supabase.from("seasons").select("*"),
  ]);
  if (error) throw error;
  if (sErr) throw sErr;
  const seasonById = new Map((seasons ?? []).map((s) => [s.id, s]));
  return (comps ?? [])
    .map((c) => ({
      id: c.id,
      name: c.name,
      seasonLabel: seasonById.get(c.season_id)?.label ?? "",
      seasonCurrent: seasonById.get(c.season_id)?.is_current ?? false,
    }))
    .sort(
      (a, b) =>
        Number(b.seasonCurrent) - Number(a.seasonCurrent) ||
        b.seasonLabel.localeCompare(a.seasonLabel) ||
        a.name.localeCompare(b.name)
    );
}

// Admin: competiciones con etiqueta de temporada, para el selector al crear un stage.
// La temporada vigente primero. Crear competiciones/temporadas nuevas sigue siendo
// tarea de Supabase Studio (una vez por torneo/año) — acá solo se eligen las existentes.
export async function getCompetitionsForSelect() {
  const supabase = await createServerSupabaseClient();
  const [{ data: comps, error }, { data: seasons, error: seasonsError }] =
    await Promise.all([
      supabase.from("competitions").select("*"),
      supabase.from("seasons").select("*"),
    ]);
  if (error) throw error;
  if (seasonsError) throw seasonsError;
  if (!comps?.length) return [];

  const seasonById = new Map((seasons ?? []).map((s) => [s.id, s]));
  return comps
    .map((c) => {
      const season = seasonById.get(c.season_id);
      return {
        id: c.id,
        label: [season?.label, c.name].filter(Boolean).join(" · "),
        seasonCurrent: season?.is_current ?? false,
      };
    })
    .sort(
      (a, b) =>
        Number(b.seasonCurrent) - Number(a.seasonCurrent) ||
        a.label.localeCompare(b.label)
    );
}
