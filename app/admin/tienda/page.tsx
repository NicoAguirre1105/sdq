import Link from "next/link";
import { getAllProducts } from "@/lib/supabase/queries/products";

export default async function AdminTiendaPage() {
  const products = await getAllProducts();

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-azul-marino/10 bg-white px-6 py-4">
        <div>
          <h1 className="font-display text-3xl text-tinta">TIENDA</h1>
          <p className="font-mono text-[10px] text-tinta/45">{products.length} productos</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/tienda/pedidos"
            className="rounded-md border border-azul-marino/16 px-3.5 py-2.5 font-body text-xs font-bold text-tinta/60"
          >
            Pedidos
          </Link>
          <Link
            href="/admin/tienda/new"
            className="rounded-md bg-rojo-bandera px-4 py-2.5 font-body text-xs font-bold text-white transition-colors hover:bg-rojo-bandera-hover"
          >
            + Nuevo producto
          </Link>
        </div>
      </header>

      <div className="px-6 py-6">
        {products.length === 0 ? (
          <p className="font-body text-sm text-tinta/55">
            Todavía no hay productos. Creá el primero con “Nuevo producto”.
          </p>
        ) : (
          <ul className="overflow-hidden rounded-lg border border-azul-marino/12 bg-white">
            {products.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-azul-marino/8 px-4 py-3 first:border-t-0"
              >
                <Link
                  href={`/admin/tienda/${p.id}/edit`}
                  className="min-w-0 flex-1 font-body text-sm font-semibold text-tinta hover:text-azul-marino"
                >
                  <span className="line-clamp-1">{p.name}</span>
                </Link>
                <span className="font-mono text-[10px] text-tinta/45">{p.category ?? "—"}</span>
                <span className="font-mono text-[10px] font-semibold text-dorado-escudo">
                  ${p.price.toFixed(2)}
                </span>
                <span
                  className={`font-mono text-[9px] font-bold uppercase ${
                    p.published ? "text-[#1E8A5B]" : "text-tinta/35"
                  }`}
                >
                  {p.published ? "Publicado" : "Borrador"}
                </span>
                <Link
                  href={`/admin/tienda/${p.id}/edit`}
                  className="font-mono text-[10px] font-semibold text-azul-marino hover:underline"
                >
                  EDITAR
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
