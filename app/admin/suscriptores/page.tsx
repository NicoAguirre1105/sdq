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
          <ul className="overflow-hidden rounded-lg border border-azul-marino/12 bg-white">
            {subscribers.map((sub) => (
              <li
                key={sub.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-azul-marino/8 px-4 py-3 first:border-t-0"
              >
                <span className="min-w-0 flex-1 font-body text-sm font-semibold text-tinta">
                  <span className="line-clamp-1">{sub.email}</span>
                </span>

                <span className="font-mono text-[9px] text-tinta/45">
                  {sub.topics.map((t) => TOPIC_LABEL[t] ?? t).join(" · ") || "—"}
                </span>

                <span
                  className={`rounded px-2 py-1 font-mono text-[9px] font-bold ${
                    sub.confirmed
                      ? "bg-[#1E8A5B]/12 text-[#1E8A5B]"
                      : "bg-dorado-escudo/15 text-[#9a7b1a]"
                  }`}
                >
                  {sub.confirmed ? "● CONFIRMADO" : "○ PENDIENTE"}
                </span>

                <span className="w-24 text-right font-mono text-[10px] text-tinta/50">
                  {formatDate(sub.subscribed_at)}
                </span>

                <DeleteButton
                  action={deleteSubscriber}
                  id={sub.id}
                  message={`¿Eliminar a ${sub.email}? También se da de baja en Kit.`}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
