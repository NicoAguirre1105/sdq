const KIT_API = "https://api.kit.com/v4";

// Agrega el correo al Form de Kit. Si el Form tiene doble opt-in activado, Kit
// manda el correo de verificación. Devuelve el id del subscriber en Kit (para
// guardarlo y cruzarlo con el webhook de confirmación), o null si no hay
// credenciales configuradas.
// ponytail: no-op sin credenciales — el flujo local (sin cuenta Kit) sigue
// funcionando, el subscriber queda como pendiente en Supabase. Quitar el guard
// cuando KIT_API_KEY/KIT_FORM_ID estén siempre presentes (prod).
export async function addToKit(email: string): Promise<string | null> {
  const key = process.env.KIT_API_KEY;
  const formId = process.env.KIT_FORM_ID;
  if (!key || !formId) return null;

  const res = await fetch(`${KIT_API}/forms/${formId}/subscribers`, {
    method: "POST",
    headers: { "X-Kit-Api-Key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ email_address: email }),
  });
  if (!res.ok) throw new Error(`Kit responded ${res.status}`);

  const json = (await res.json()) as { subscriber?: { id?: number } };
  return json.subscriber?.id != null ? String(json.subscriber.id) : null;
}
