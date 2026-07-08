import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

// La política RLS de admin_users es `using (id = auth.uid())`: cada usuario solo
// puede leer su propia fila. Si no está en la allowlist, la fila no existe y devuelve null.
export async function getAdminUser(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, full_name")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
