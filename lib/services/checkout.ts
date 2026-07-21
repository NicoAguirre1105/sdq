import { createOrder } from "@/lib/supabase/queries/orders";
import type { CartItem } from "@/lib/types/cart";

export type ContactInfo = { name: string; phone: string };
export type OrderResult = { redirectUrl: string };

// Hoy el "checkout" es armar el carrito → link de WhatsApp. Se abstrae detrás de esta
// interfaz para que el día que exista un pago real (Stripe, etc.) o donaciones, se
// escriba un nuevo CheckoutProvider sin tocar el componente de carrito.
export interface CheckoutProvider {
  submitOrder(cart: CartItem[], contact: ContactInfo): Promise<OrderResult>;
}

function buildWhatsAppMessage(cart: CartItem[], contact: ContactInfo, total: number) {
  const lines = cart.map(
    (item) =>
      `- ${item.quantity}x ${item.name}${item.size ? ` (Talla ${item.size})` : ""} - $${(
        item.unitPrice * item.quantity
      ).toFixed(2)}`
  );
  return [
    "Hola! Quiero hacer este pedido:",
    "",
    ...lines,
    "",
    `Total: $${total.toFixed(2)}`,
    "",
    `Nombre: ${contact.name}`,
    `Teléfono: ${contact.phone}`,
  ].join("\n");
}

export const whatsappCheckout: CheckoutProvider = {
  async submitOrder(cart, contact) {
    const number = process.env.WHATSAPP_ORDERS_NUMBER;
    if (!number) throw new Error("WHATSAPP_ORDERS_NUMBER no está configurada");

    const order = await createOrder(cart, contact);
    const message = buildWhatsAppMessage(cart, contact, order.total);
    return { redirectUrl: `https://wa.me/${number}?text=${encodeURIComponent(message)}` };
  },
};
