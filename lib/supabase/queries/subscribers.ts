import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/client";

export type SubscriberStatus = "new" | "pending" | "confirmed";

// Listado para el admin. RLS permite SELECT solo a admins (sesión en admin_users).
export async function getAllSubscribers() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false });
  if (error) throw error;
  return data;
}

// Estado del correo sin abrir lectura pública sobre `subscribers`: la función
// `subscriber_status` (security definer, ver schema.sql) devuelve solo el estado.
export async function getSubscriberStatus(email: string): Promise<SubscriberStatus> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("subscriber_status", { p_email: email });
  if (error) throw error;
  return data as SubscriberStatus;
}

export async function addSubscriber(
  email: string,
  topics: string[],
  kitSubscriberId: string | null
) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("subscribers").insert({
    email,
    topics,
    kit_subscriber_id: kitSubscriberId,
    accepted_terms_at: new Date().toISOString(),
  });
  if (error) {
    if (error.code === "23505") return { alreadySubscribed: true };
    throw error;
  }
  return { alreadySubscribed: false };
}

// Marca el correo como confirmado. Lo llama el webhook de Kit cuando el usuario
// confirma desde el correo de verificación; usa service role porque no hay sesión.
export async function confirmSubscriber(email: string) {
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("subscribers")
    .update({ confirmed: true })
    .eq("email", email.trim().toLowerCase());
  if (error) throw error;
}
