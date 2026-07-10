import { createServerSupabaseClient } from "@/lib/supabase/client";

export async function getPublishedPosts(page = 1, pageSize = 9) {
  const supabase = await createServerSupabaseClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await supabase
    .from("posts")
    .select("*", { count: "exact" })
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .range(from, to);
  if (error) throw error;
  return { posts: data ?? [], total: count ?? 0 };
}

// maybeSingle (no single): un slug inexistente o despublicado (filtrado por RLS)
// debe devolver null para que la página llame notFound(), no un error 500.
export async function getPostBySlug(slug: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Admin: todos los posts, incluidos borradores (published_at null) y programados
// (published_at futuro). RLS deja ver todo a los admins. Borradores primero.
export async function getAllPosts() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: true });
  if (error) throw error;
  return data;
}

export async function getPostById(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
