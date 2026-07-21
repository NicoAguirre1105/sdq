import { createServerSupabaseClient } from "@/lib/supabase/client";

export async function getPublishedProducts(page = 1, pageSize = 12, category?: string) {
  const supabase = await createServerSupabaseClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (category) query = query.eq("category", category);
  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { products: data ?? [], total: count ?? 0 };
}

// maybeSingle (no single): un slug inexistente o despublicado (filtrado por RLS)
// debe devolver null para que la página llame notFound(), no un error 500.
export async function getProductBySlug(slug: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Categorías distintas entre productos publicados, para los chips de filtro del catálogo.
// Sin enum: lee lo que ya existe en la tabla en vez de mantener una lista aparte.
export async function getProductCategories() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("category")
    .eq("published", true)
    .not("category", "is", null);
  if (error) throw error;
  return Array.from(new Set((data ?? []).map((p) => p.category as string))).sort();
}

// Admin: todos los productos, incluidos despublicados. RLS deja ver todo a los admins.
export async function getAllProducts() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProductById(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
