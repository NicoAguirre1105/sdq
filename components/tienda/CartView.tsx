"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/tienda/CartProvider";
import { checkoutAction, type CheckoutState } from "@/lib/actions/checkout";
import { Toast } from "@/components/ui/Toast";
import { withOfflineGuard } from "@/lib/action-guard";

export function CartView() {
  const { items, updateQuantity, removeItem, clear, total } = useCart();
  const [state, formAction, isPending] = useActionState<CheckoutState, FormData>(
    withOfflineGuard(checkoutAction),
    {}
  );

  // Al confirmar el pedido, la action ya insertó el log en Supabase — acá solo
  // limpiamos el carrito local y abrimos WhatsApp con el link que devolvió.
  useEffect(() => {
    if (!state.redirectUrl) return;
    clear();
    window.location.href = state.redirectUrl;
  }, [state.redirectUrl, clear]);

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 font-body text-sm text-tinta/55">Tu carrito está vacío.</p>
        <Link
          href="/tienda"
          className="rounded-md bg-rojo-bandera px-5 py-2.5 font-body text-xs font-bold text-white hover:bg-rojo-bandera-hover"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_320px]">
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li
            key={`${item.productId}-${item.size ?? ""}`}
            className="flex items-center gap-3 rounded-lg border border-azul-marino/12 bg-white p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="font-body text-sm font-semibold text-tinta">{item.name}</p>
              {item.size && (
                <p className="font-mono text-[10px] text-tinta/45">Talla {item.size}</p>
              )}
              <p className="font-mono text-xs font-bold text-dorado-escudo">
                ${item.unitPrice.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center rounded-md border border-azul-marino/20">
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                className="px-2.5 py-1.5 font-mono text-sm font-bold text-tinta/70 hover:text-tinta"
              >
                −
              </button>
              <span className="w-7 text-center font-mono text-sm text-tinta">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                className="px-2.5 py-1.5 font-mono text-sm font-bold text-tinta/70 hover:text-tinta"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => removeItem(item.productId, item.size)}
              className="font-mono text-[10px] font-bold text-rojo-bandera hover:underline"
            >
              QUITAR
            </button>
          </li>
        ))}
      </ul>

      <form
        action={formAction}
        className="h-fit rounded-lg border border-azul-marino/12 bg-white p-4"
      >
        <input type="hidden" name="cart" value={JSON.stringify(items)} />
        <p className="mb-3 flex items-center justify-between font-body text-sm font-semibold text-tinta">
          <span>Total</span>
          <span className="font-mono text-lg text-dorado-escudo">${total.toFixed(2)}</span>
        </p>

        <label
          htmlFor="name"
          className="block font-mono text-[10px] tracking-[0.1em] text-tinta/55 uppercase"
        >
          Nombre
        </label>
        <input
          id="name"
          name="name"
          required
          className="mt-1.5 mb-3 w-full rounded-md border border-azul-marino/20 bg-white px-3.5 py-2.5 font-body text-sm text-tinta outline-none focus:border-azul-marino"
        />

        <label
          htmlFor="phone"
          className="block font-mono text-[10px] tracking-[0.1em] text-tinta/55 uppercase"
        >
          Teléfono
        </label>
        <input
          id="phone"
          name="phone"
          required
          className="mt-1.5 mb-4 w-full rounded-md border border-azul-marino/20 bg-white px-3.5 py-2.5 font-body text-sm text-tinta outline-none focus:border-azul-marino"
        />

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-[#25D366] px-4 py-3 font-body text-sm font-bold text-white transition-colors hover:brightness-95 disabled:opacity-60"
        >
          {isPending ? "Enviando…" : "Enviar pedido por WhatsApp"}
        </button>
      </form>

      <Toast message={state.error} />
    </div>
  );
}
