import { getAllSubscribers } from "@/lib/supabase/queries/subscribers";
import { deleteSubscriber } from "@/lib/actions/subscribers";
import { DeleteButton } from "@/components/admin/DeleteButton";

const TOPIC_LABEL: Record<string, string> = {
  club: "Club",
  tienda: "Tienda",
  canticos: "Cánticos",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminSubscribersPage() {
  const subscribers = await getAllSubscribers();
  const confirmedCount = subscribers.filter((s) => s.confirmed).length;
  const pendingCount = subscribers.length - confirmedCount;

  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b border-azul-marino/10 bg-white px-6 py-4">
        <div>
          <h1 className="font-display text-3xl text-tinta">SUSCRIPTORES</h1>
          <p className="font-mono text-[10px] text-tinta/45">
            {confirmedCount} confirmados · {pendingCount} pendientes
          </p>
        </div>
      </header>

      <div className="px-6 py-6">
        {subscribers.length === 0 ? (
          <p className="font-body text-sm text-tinta/55">Todavía no hay suscriptores.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-azul-marino/12 bg-white">
            {/* 768px = suma real de columnas (240+160+116+92+64) + gaps (4×16) + padding (2×16) */}
            <div className="min-w-[768px]">
              <div className="flex items-center gap-4 border-b border-azul-marino/10 bg-azul-marino/[0.03] px-4 py-2.5 font-mono text-[9px] font-bold tracking-[0.1em] text-tinta/45 uppercase">
                <span className="w-[240px] flex-none">Correo</span>
                <span className="min-w-[160px] flex-1">Temas</span>
                <span className="w-[116px] flex-none">Estado</span>
                <span className="w-[92px] flex-none text-right">Fecha</span>
                <span className="w-[64px] flex-none" />
              </div>

              <ul>
                {subscribers.map((sub) => (
                  <li
                    key={sub.id}
                    className="flex items-center gap-4 border-t border-azul-marino/8 px-4 py-3"
                  >
                    <span className="w-[240px] flex-none truncate font-body text-sm font-semibold text-tinta">
                      {sub.email}
                    </span>

                    <span className="min-w-[160px] flex-1 truncate font-mono text-[10px] text-tinta/50">
                      {sub.topics.map((t) => TOPIC_LABEL[t] ?? t).join(" · ") || "—"}
                    </span>

                    <span className="w-[116px] flex-none">
                      <span
                        className={`inline-block rounded px-2 py-1 font-mono text-[9px] font-bold whitespace-nowrap ${
                          sub.confirmed
                            ? "bg-[#1E8A5B]/12 text-[#1E8A5B]"
                            : "bg-dorado-escudo/15 text-[#9a7b1a]"
                        }`}
                      >
                        {sub.confirmed ? "● CONFIRMADO" : "○ PENDIENTE"}
                      </span>
                    </span>

                    <span className="w-[92px] flex-none text-right font-mono text-[10px] text-tinta/50">
                      {formatDate(sub.subscribed_at)}
                    </span>

                    <span className="w-[64px] flex-none text-right">
                      <DeleteButton
                        action={deleteSubscriber}
                        id={sub.id}
                        message={`¿Eliminar a ${sub.email}? También se da de baja en Kit.`}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
