import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import type { CartItem } from "@/lib/types/cart";
import type { Database } from "@/lib/types/database";

// Baja el stock de los productos con stock trackeado (no null) según lo pedido, sin
// bajar de 0. Los productos "bajo pedido" (stock null) no se tocan: no tienen límite.
// No bloquea el pedido si algo falla acá — el log de la orden ya quedó guardado, y el
// admin puede ajustar el stock a mano si algo no cuadra.
async function decrementStock(supabase: SupabaseClient<Database>, cart: CartItem[]) {
  const ids = cart.map((item) => item.productId);
  const { data: products, error } = await supabase
    .from("products")
    .select("id, stock")
    .in("id", ids);
  if (error || !products) return;

  const stockById = new Map(products.map((p) => [p.id, p.stock]));
  await Promise.all(
    cart.map((item) => {
      const stock = stockById.get(item.productId);
      if (stock == null) return null;
      return supabase
        .from("products")
        .update({ stock: Math.max(0, stock - item.quantity) })
        .eq("id", item.productId);
    })
  );
}

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

  await decrementStock(supabase, cart);

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
