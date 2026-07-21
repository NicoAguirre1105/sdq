import Link from "next/link";
import { Pagination } from "@/components/ui/Pagination";
import { getOrders } from "@/lib/supabase/queries/orders";

const ORDERS_PER_PAGE = 10;

function formatDate(iso: string) {
  return new Date(iso)
    .toLocaleString("es-EC", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    .toUpperCase();
}

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { orders, total } = await getOrders(page, ORDERS_PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(total / ORDERS_PER_PAGE));

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-azul-marino/10 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/tienda" className="font-mono text-lg text-tinta/40 hover:text-tinta">
            ←
          </Link>
          <div>
            <h1 className="font-display text-3xl text-tinta">PEDIDOS</h1>
            <p className="font-mono text-[10px] text-tinta/45">
              {total} enviados por WhatsApp — solo lectura
            </p>
          </div>
        </div>
      </header>

      <div className="px-6 py-6">
        {orders.length === 0 ? (
          <p className="font-body text-sm text-tinta/55">Todavía no se envió ningún pedido.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {orders.map((o) => (
              <li key={o.id} className="rounded-lg border border-azul-marino/12 bg-white p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-body text-sm font-semibold text-tinta">{o.contact_name}</p>
                    <p className="font-mono text-[10px] text-tinta/45">{o.contact_phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs font-bold text-dorado-escudo">
                      ${o.total.toFixed(2)}
                    </p>
                    <p className="font-mono text-[9px] text-tinta/40">{formatDate(o.created_at)}</p>
                  </div>
                </div>
                <ul className="border-t border-azul-marino/8 pt-2">
                  {o.items.map((item, i) => (
                    <li key={i} className="font-body text-xs text-tinta/70">
                      {item.quantity}x {item.product_name}
                      {item.size ? ` (Talla ${item.size})` : ""} — ${item.unit_price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
        <Pagination page={page} totalPages={totalPages} basePath="/admin/tienda/pedidos" />
      </div>
    </>
  );
}
