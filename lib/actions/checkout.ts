"use server";

import { whatsappCheckout } from "@/lib/services/checkout";
import type { CartItem } from "@/lib/types/cart";

export type CheckoutState = { error?: string; redirectUrl?: string };

export async function checkoutAction(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const rawCart = String(formData.get("cart") ?? "");

  if (!name) return { error: "El nombre es obligatorio." };
  if (!phone) return { error: "El teléfono es obligatorio." };

  let cart: CartItem[];
  try {
    cart = JSON.parse(rawCart);
  } catch {
    return { error: "El carrito no es válido." };
  }
  if (!Array.isArray(cart) || cart.length === 0) return { error: "El carrito está vacío." };

  try {
    const { redirectUrl } = await whatsappCheckout.submitOrder(cart, { name, phone });
    return { redirectUrl };
  } catch {
    return { error: "No se pudo enviar el pedido. Intenta de nuevo." };
  }
}
