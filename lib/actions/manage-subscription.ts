"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/client";
import { updateSubscriberTopics } from "@/lib/supabase/queries/subscribers";
import { removeFromKit, syncKitTopics } from "@/lib/kit";

export type ManageSubscriptionState = { error?: string; success?: boolean };

// Sin requireAdmin(): ruta pública, el email del hidden field es la única
// identificación (mismo criterio que cualquier link de baja de newsletter — ver
// /suscripcion/gestionar).
export async function updatePreferencesAction(
  _prev: ManageSubscriptionState,
  formData: FormData
): Promise<ManageSubscriptionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const topics = formData.getAll("topics").map(String);
  if (!email) return { error: "Falta el correo." };

  try {
    await updateSubscriberTopics(email, topics);
  } catch {
    return { error: "No se pudieron guardar los cambios. Intenta de nuevo." };
  }
  await syncKitTopics(email, topics);

  revalidatePath("/admin/suscriptores");
  return { success: true };
}

export async function unsubscribeAction(
  _prev: ManageSubscriptionState,
  formData: FormData
): Promise<ManageSubscriptionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) return { error: "Falta el correo." };

  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("subscribers").delete().eq("email", email);
  if (error) return { error: "No se pudo procesar la baja. Intenta de nuevo." };

  await removeFromKit(email);

  revalidatePath("/admin/suscriptores");
  return { success: true };
}
