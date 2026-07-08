// Slug URL-safe desde texto libre: minúsculas, sin acentos, separadores a "-".
// Compartido por el editor (autogenera al tipear el título) y las actions (normaliza).
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
