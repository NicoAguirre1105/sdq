import { createServerSupabaseClient } from "@/lib/supabase/client";

// Fila única de configuración del sitio. maybeSingle (no single): no debe explotar
// si todavía no se corrió el insert inicial en la DB real.
export async function getSiteSettings() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("site_settings").select("*").maybeSingle();
  if (error) throw error;
  return data;
}
