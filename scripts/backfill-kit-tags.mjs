// Único: etiqueta en Kit a los suscriptores confirmados según sus topics de Supabase.
// Correr una vez tras introducir la segmentación por tags. node scripts/backfill-kit-tags.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// Cargar .env.local a mano (sin dependencia extra).
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2].trim();
}

const KIT_API = "https://api.kit.com/v4";
const kitKey = process.env.KIT_API_KEY;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const tagIdCache = new Map();
async function getTagId(name) {
  if (tagIdCache.has(name)) return tagIdCache.get(name);
  const res = await fetch(`${KIT_API}/tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Kit-Api-Key": kitKey },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`crear tag ${name}: ${res.status}`);
  const id = (await res.json()).tag?.id;
  tagIdCache.set(name, id);
  return id;
}

async function tagSubscriber(tagId, email) {
  const res = await fetch(`${KIT_API}/tags/${tagId}/subscribers`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Kit-Api-Key": kitKey },
    body: JSON.stringify({ email_address: email }),
  });
  return res.ok; // 200 ya tenía / 201 nuevo
}

const { data, error } = await supabase
  .from("subscribers")
  .select("email, topics")
  .eq("confirmed", true);
if (error) throw error;

let tagged = 0;
for (const sub of data ?? []) {
  for (const topic of sub.topics ?? []) {
    const tagId = await getTagId(topic);
    if (!tagId) continue;
    const ok = await tagSubscriber(tagId, sub.email);
    if (ok) tagged++;
    console.log(`${ok ? "OK " : "ERR"} ${sub.email} → ${topic}`);
  }
}
console.log(`\n${data?.length ?? 0} suscriptores confirmados, ${tagged} tags aplicados.`);
