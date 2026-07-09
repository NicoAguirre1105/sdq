"use server";

import { addSubscriber, getSubscriberStatus } from "@/lib/supabase/queries/subscribers";
import { addToKit } from "@/lib/kit";

// Paso 1: el usuario ingresa el correo. Si es nuevo, el form avanza al paso 2
// (términos + confirmación); si ya existe se le informa el estado.
export type CheckState =
  | { status: "idle" }
  | { status: "new"; email: string }
  | { status: "pending" }
  | { status: "confirmed" }
  | { status: "error" };

export async function checkSubscriberAction(
  _prev: CheckState,
  formData: FormData
): Promise<CheckState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { status: "error" };

  try {
    const status = await getSubscriberStatus(email);
    return status === "new" ? { status: "new", email } : { status };
  } catch {
    return { status: "error" };
  }
}

// Paso 2: acepta términos y confirma. Agrega el correo a Kit (que manda el
// correo de verificación) y lo guarda como pendiente en Supabase.
export type SubscribeState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message?: string };

export async function subscribeAction(
  _prev: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const topics = formData.getAll("topics").map(String);
  const acceptedTerms = formData.get("terms") === "on";

  if (!email) return { status: "error" };
  if (!acceptedTerms) return { status: "error", message: "Debés aceptar los términos para suscribirte." };

  try {
    // Kit primero: si falla, no dejamos una fila pendiente que bloquee el reintento.
    const kitId = await addToKit(email);
    await addSubscriber(email, topics, kitId);
    return { status: "success" };
  } catch {
    return { status: "error", message: "Algo salió mal. Probá de nuevo." };
  }
}
