import { createServerSupabaseClient } from "@/lib/supabase/client";
import type { CartItem } from "@/lib/types/cart";

// orders es un log inmutable: un insert por pedido enviado, sin estado ni edición
// posterior. Los ítems se guardan como snapshot jsonb en la misma fila.
export async function createOrder(cart: CartItem[], contact: { name: string; phone: string }) {
  const items = cart.map((item) => ({
    product_name: item.name,
    size: item.size,
    quantity: item.quantity,
    unit_price: item.unitPrice,
  }));
  const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .insert({ contact_name: contact.name, contact_phone: contact.phone, items, total })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Admin: listado de solo lectura, paginado, más reciente primero.
export async function getOrders(page = 1, pageSize = 10) {
  const supabase = await createServerSupabaseClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await supabase
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw error;
  return { orders: data ?? [], total: count ?? 0 };
}
