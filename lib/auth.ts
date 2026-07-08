import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { getAdminUser } from "@/lib/supabase/queries/admin";

// Gate de /admin en la capa de app: exige sesión Y estar en la allowlist admin_users.
// RLS en Postgres es la seguridad real; esto evita renderizar el panel a quien no debe.
export async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = await getAdminUser(supabase, user.id);
  if (!admin) redirect("/login");

  return admin;
}
