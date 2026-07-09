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
