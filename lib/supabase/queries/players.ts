import { createServerSupabaseClient } from "@/lib/supabase/client";

export async function getSquad() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("jersey_number", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getPlayerById(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
