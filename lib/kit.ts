import { getSiteUrl } from "@/lib/site-url";
import { TOPICS } from "@/lib/topics";

const KIT_API = "https://api.kit.com/v4";

export type PostCategory = "noticia" | "cronica" | "aviso" | "cantico" | null;

// Cada categoría de post corresponde a una preferencia (topic) de suscripción.
// Los topics son los mismos valores del form (components/layout/SubscribeForm.tsx):
// "club" | "tienda" | "canticos". Un tag de Kit con ese mismo nombre segmenta el envío.
const CATEGORY_TOPIC: Record<Exclude<PostCategory, null>, string> = {
  noticia: "club",
  cronica: "club",
  aviso: "club",
  cantico: "canticos",
};

// Resuelve (creando si no existe) el id numérico de un tag de Kit por nombre.
// POST /v4/tags es idempotente: devuelve el tag existente o lo crea. Cachea por
// proceso para no repetir la llamada.
const tagIdCache = new Map<string, number>();
async function getTagId(name: string, key: string): Promise<number | null> {
  const cached = tagIdCache.get(name);
  if (cached) return cached;
  const res = await fetch(`${KIT_API}/tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Kit-Api-Key": key },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { tag?: { id: number } };
  const id = data.tag?.id ?? null;
  if (id) tagIdCache.set(name, id);
  return id;
}

async function resolveTopicTagIds(topics: string[]): Promise<number[]> {
  const key = process.env.KIT_API_KEY;
  if (!key || topics.length === 0) return [];
  const ids = await Promise.all(topics.map((t) => getTagId(t, key)));
  return ids.filter((id): id is number => id != null);
}

// Alta con doble opt-in vía la API v3 (endpoint oficial server-side). Respeta el
// setting de doble opt-in del Form y dispara el correo de verificación. Aplica los
// tags de los topics elegidos (resueltos con la key v4) para poder segmentar envíos.
//
// Por qué v3 y no otra cosa:
//  - v4 NO sirve para opt-in: `POST /v4/forms/{id}/subscribers` da 404 y
//    `POST /v4/subscribers` crea al subscriber `active` sin mandar confirmación.
//  - El endpoint público del embed (`app.kit.com/forms/{id}/subscriptions`)
//    devuelve `status:"quarantined"` (anti-spam) para los POST server-side.
// Necesita la API Key v3 (KIT_V3_API_KEY) — es una key distinta de la v4 (kit_...).
export async function addToKit(email: string, topics: string[] = []): Promise<void> {
  const apiKey = process.env.KIT_V3_API_KEY;
  const formId = process.env.KIT_FORM_ID;
  if (!apiKey || !formId) return; // no-op sin credenciales; el alta en Supabase igual queda pendiente

  const tags = await resolveTopicTagIds(topics);

  const res = await fetch(`https://api.kit.com/v3/forms/${formId}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey, email, ...(tags.length ? { tags } : {}) }),
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
  category: PostCategory;
}): Promise<void> {
  const key = process.env.KIT_API_KEY;
  if (!key) return;
  const topic = post.category ? CATEGORY_TOPIC[post.category] : "club"; // sin categoría → novedades del club
  const url = `${getSiteUrl()}/post/${post.slug}`;
  const now = new Date().toISOString();
  // {{ subscriber.email_address }}: merge tag de Kit, lo reemplaza por el email
  // real de cada destinatario al enviar.
  const manageUrl = `${getSiteUrl()}/suscripcion/gestionar?email={{ subscriber.email_address }}`;
  const content =
    `<p>Hola, hincha dos corazones. Publicamos algo nuevo en el sitio web de Mafia Azul Grana:</p>` +
    `<h2>${escapeHtml(post.title)}</h2>` +
    (post.excerpt ? `<p>${escapeHtml(post.excerpt)}</p>` : "") +
    `<p><a href="${url}">Leer la nota completa en la web</a></p>` +
    `<p>¡Por el Deportivo Quito!</p>` +
    // Visible en el cuerpo (no footer gris chico) y a propósito antes de que la
    // idea de "unsubscribe" aparezca: si alguien no quiere ESTE tipo de correo,
    // que vea la opción de ajustar preferencias antes de ir directo a la baja
    // total (esa sigue existiendo aparte, la pone Kit — no se puede reemplazar).
    `<p>¿Este correo no es lo que buscabas? <a href="${manageUrl}">Elige qué quieres recibir</a> sin dejar de escuchar de nosotros del todo.</p>`;

  try {
    const tagId = await getTagId(topic, key);
    if (!tagId) return; // sin tag no podemos segmentar: mejor no enviar que enviar a todos
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
        // Solo a suscriptores confirmados con el tag del topic de esta categoría.
        subscriber_filter: [{ all: [{ type: "tag", ids: [tagId] }], any: null, none: null }],
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

// Sincroniza los tags de Kit con la nueva selección de topics (agrega los que
// faltan, saca los que se desmarcaron). Usado desde /suscripcion/gestionar.
// ponytail: rutas /v4/tags/{id}/subscribers (POST) y /v4/tags/{id}/subscribers/{id}
// (DELETE) inferidas de la convención REST del resto de la v4 (no verificadas
// contra el dashboard real) — best-effort como el resto de este archivo, si el
// endpoint difiere esto queda en no-op silencioso y se reconcilia a mano en Kit.
export async function syncKitTopics(email: string, topics: string[]): Promise<void> {
  const key = process.env.KIT_API_KEY;
  if (!key) return;
  try {
    const lookup = await fetch(
      `${KIT_API}/subscribers?email_address=${encodeURIComponent(email)}`,
      { headers: { "X-Kit-Api-Key": key } }
    );
    if (!lookup.ok) return;
    const data = (await lookup.json()) as { subscribers?: { id: number }[] };
    const subscriberId = data.subscribers?.[0]?.id;
    if (!subscriberId) return;

    await Promise.all(
      TOPICS.map(async ({ value }) => {
        const tagId = await getTagId(value, key);
        if (!tagId) return;
        if (topics.includes(value)) {
          await fetch(`${KIT_API}/tags/${tagId}/subscribers`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Kit-Api-Key": key },
            body: JSON.stringify({ email_address: email }),
          });
        } else {
          await fetch(`${KIT_API}/tags/${tagId}/subscribers/${subscriberId}`, {
            method: "DELETE",
            headers: { "X-Kit-Api-Key": key },
          });
        }
      })
    );
  } catch {
    // ponytail: mismo criterio que removeFromKit — no bloquear Supabase.
  }
}

// Estado del subscriber en Kit ("active"/"cancelled"/"bounced"/"complained"), o
// null si no se encuentra o falla la consulta. El plan free de Kit no tiene
// Automations (no hay forma de que Kit nos avise por webhook ni de que confirme un
// alta ni de que alguien use SU link de baja de cumplimiento) — esto lo usa el cron
// de polling en app/api/cron/sync-subscribers en su lugar.
export async function getKitSubscriberState(email: string): Promise<string | null> {
  const key = process.env.KIT_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `${KIT_API}/subscribers?email_address=${encodeURIComponent(email)}`,
      { headers: { "X-Kit-Api-Key": key } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { subscribers?: { state?: string }[] };
    return data.subscribers?.[0]?.state ?? null;
  } catch {
    return null;
  }
}
