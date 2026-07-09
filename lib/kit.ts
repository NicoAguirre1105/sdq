const KIT_API = "https://api.kit.com/v4";

// Alta con doble opt-in. Postea al endpoint público de submission del Form (el
// mismo que usa el embed de Kit): respeta el setting de doble opt-in del Form y
// dispara el correo de verificación. La API v4 NO sirve para esto — crea al
// subscriber como "active" sin mandar confirmación.
// ponytail: endpoint semi-documentado (el del embed), pero es el backbone de todo
// form de Kit. Si algún día cambia, migrar a v3 `POST /v3/forms/{id}/subscribe`
// con la API key v3 (una key distinta de la v4).
export async function addToKit(email: string): Promise<void> {
  const formId = process.env.KIT_FORM_ID;
  if (!formId) return; // no-op sin form configurado; el alta en Supabase igual queda pendiente

  const res = await fetch(`https://app.kit.com/forms/${formId}/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({ email_address: email }),
  });
  if (!res.ok) throw new Error(`Kit responded ${res.status}`);
  const json = (await res.json()) as { status?: string };
  if (json.status !== "success") throw new Error(`Kit form submission: ${json.status}`);
}

// Da de baja al subscriber en Kit (deja de recibir correos). Busca el id por correo
// vía v4 y lo desuscribe. Best-effort: no lanza, para que un fallo de Kit no impida
// borrar la fila en Supabase.
export async function removeFromKit(email: string): Promise<void> {
  const key = process.env.KIT_API_KEY;
  if (!key) return;
  try {
    const lookup = await fetch(
      `${KIT_API}/subscribers?email_address=${encodeURIComponent(email)}`,
      { headers: { "X-Kit-Api-Key": key } }
    );
    if (!lookup.ok) return;
    const data = (await lookup.json()) as { subscribers?: { id: number }[] };
    const id = data.subscribers?.[0]?.id;
    if (!id) return;
    await fetch(`${KIT_API}/subscribers/${id}/unsubscribe`, {
      method: "POST",
      headers: { "X-Kit-Api-Key": key },
    });
  } catch {
    // ponytail: un fallo de Kit no debe bloquear el borrado en Supabase; la baja
    // en Kit se puede reconciliar a mano.
  }
}
