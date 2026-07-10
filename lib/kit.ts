const KIT_API = "https://api.kit.com/v4";

// Alta con doble opt-in vía la API v3 (endpoint oficial server-side). Respeta el
// setting de doble opt-in del Form y dispara el correo de verificación.
//
// Por qué v3 y no otra cosa:
//  - v4 NO sirve para opt-in: `POST /v4/forms/{id}/subscribers` da 404 y
//    `POST /v4/subscribers` crea al subscriber `active` sin mandar confirmación.
//  - El endpoint público del embed (`app.kit.com/forms/{id}/subscriptions`)
//    devuelve `status:"quarantined"` (anti-spam) para los POST server-side.
// Necesita la API Key v3 (KIT_V3_API_KEY) — es una key distinta de la v4 (kit_...).
export async function addToKit(email: string): Promise<void> {
  const apiKey = process.env.KIT_V3_API_KEY;
  const formId = process.env.KIT_FORM_ID;
  if (!apiKey || !formId) return; // no-op sin credenciales; el alta en Supabase igual queda pendiente

  const res = await fetch(`https://api.kit.com/v3/forms/${formId}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey, email }),
  });
  if (!res.ok) throw new Error(`Kit responded ${res.status}`);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Notifica un post nuevo a los suscriptores vía un broadcast de Kit (API v4).
// Kit solo envía broadcasts a suscriptores confirmados (los pendientes del doble
// opt-in quedan excluidos), así que esto cubre "solo verificados" sin filtrar a mano.
// Best-effort: no lanza, para que un fallo de Kit no impida guardar el post.
export async function broadcastNewPost(post: {
  title: string;
  slug: string;
  excerpt: string | null;
}): Promise<void> {
  const key = process.env.KIT_API_KEY;
  if (!key) return;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sdq-cyan.vercel.app";
  const url = `${base}/post/${post.slug}`;
  const now = new Date().toISOString();
  const content =
    `<p>${escapeHtml(post.title)}</p>` +
    (post.excerpt ? `<p>${escapeHtml(post.excerpt)}</p>` : "") +
    `<p><a href="${url}">Leer en la web</a></p>`;

  try {
    await fetch(`${KIT_API}/broadcasts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Kit-Api-Key": key },
      body: JSON.stringify({
        subject: post.title,
        preview_text: post.excerpt ?? post.title,
        description: `Post: ${post.title}`,
        content,
        public: false,
        published_at: now,
        send_at: now, // ISO now = envío inmediato; null sería borrador
        subscriber_filter: null, // null = todos los suscriptores (confirmados)
      }),
    });
  } catch {
    // ponytail: un fallo de Kit no debe bloquear el guardado del post; el envío
    // se puede reintentar a mano desde el panel de Kit.
  }
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
