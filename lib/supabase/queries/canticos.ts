import { createServerSupabaseClient } from "@/lib/supabase/client";

export async function getPublishedCanticos() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("canticos")
    .select("*")
    .eq("published", true)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

// maybeSingle (no single): un slug inexistente o despublicado (filtrado por RLS)
// debe devolver null para que la página llame notFound(), no un error 500.
export async function getCanticoBySlugPublic(slug: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("canticos")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Admin: todos los cánticos, incluidos borradores. RLS deja ver todo a los admins.
export async function getAllCanticos() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("canticos")
    .select("*")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getCanticoById(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("canticos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
