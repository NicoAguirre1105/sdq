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

export async function addSubscriber(email: string, topics: string[]) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("subscribers").insert({
    email,
    topics,
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

// Para /suscripcion/gestionar: el link de baja/gestión identifica al suscriptor
// solo por su email (sin sesión, como cualquier link de baja de newsletter),
// mismo motivo de service role que confirmSubscriber.
export async function getSubscriberByEmail(email: string) {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("subscribers")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateSubscriberTopics(email: string, topics: string[]) {
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("subscribers")
    .update({ topics })
    .eq("email", email.trim().toLowerCase());
  if (error) throw error;
}

// Borra la fila cuando Kit avisa (webhook) que alguien se dio de baja — mismo
// efecto que la baja self-service de /suscripcion/gestionar, pero sin volver a
// llamar a Kit (la baja ya se procesó ahí, es lo que disparó el webhook).
export async function deleteSubscriberByEmail(email: string) {
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("subscribers")
    .delete()
    .eq("email", email.trim().toLowerCase());
  if (error) throw error;
}

// Para el cron de sincronización con Kit (app/api/cron/sync-subscribers) — service
// role porque corre sin sesión de admin. Trae `confirmed` además del email para que
// el cron pueda confirmar/borrar en una sola pasada por suscriptor (un solo fetch a
// Kit por email, no dos cron jobs pisándose la misma fila).
export async function getSubscribersForSync(): Promise<{ email: string; confirmed: boolean }[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase.from("subscribers").select("email, confirmed");
  if (error) throw error;
  return data ?? [];
}
