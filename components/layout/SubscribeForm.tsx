"use client";

import { useActionState } from "react";
import { subscribeAction, type SubscribeState } from "@/lib/actions/subscribe";

const TOPICS = [
  { value: "club", label: "Posts, noticias e información del club y MAG." },
  { value: "tienda", label: "Contenido exclusivo, ofertas y nuevos productos en la tienda." },
  { value: "canticos", label: "Noticias sobre cánticos nuevos." },
];

const initialState: SubscribeState = { status: "idle" };

const FEEDBACK: Record<Exclude<SubscribeState["status"], "idle">, string> = {
  success: "¡Listo! Ya estás suscrito.",
  already_subscribed: "Ya estabas suscrito con este correo.",
  error: "Algo salió mal. Probá de nuevo.",
};

export function SubscribeForm({ compact = false }: { compact?: boolean }) {
  const [state, formAction, pending] = useActionState(subscribeAction, initialState);

  if (state.status === "success" || state.status === "already_subscribed") {
    return (
      <p className="font-body text-sm font-medium text-white">{FEEDBACK[state.status]}</p>
    );
  }

  return (
    <form action={formAction}>
      <h2 className={`font-display leading-[0.9] text-white ${compact ? "text-4xl" : "text-4xl md:text-5xl"}`}>
        HAZTE HINCHA
        <br />
        DE CORAZÓN
      </h2>
      <p className="mt-2 max-w-lg font-body text-[13px] text-white/85">
        Sin spam. Gratis. Escoge la información relevante que quieres recibir en tu correo en
        todo momento.
      </p>

      <div className="mt-4 flex max-w-lg flex-col gap-0.5">
        {TOPICS.map((topic) => (
          <label
            key={topic.value}
            className="flex cursor-pointer items-center gap-3.5 border-b border-white/18 py-3 last:border-b-0"
          >
            <span className="relative h-6 w-11 flex-none rounded-full bg-white/20 ring-1 ring-white/25 transition-colors has-checked:bg-azul-marino has-checked:ring-transparent">
              <input
                type="checkbox"
                name="topics"
                value={topic.value}
                defaultChecked
                className="peer sr-only"
              />
              <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
            </span>
            <span className="font-body text-[13px] font-medium text-white">{topic.label}</span>
          </label>
        ))}
      </div>

      <div className="mt-5 flex max-w-lg gap-2">
        <input
          type="email"
          name="email"
          required
          placeholder="tu@correo.com"
          className="flex-1 rounded-[5px] border border-white/35 bg-white/12 px-4.5 py-3.5 font-body text-[13px] text-white placeholder:text-white/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-[5px] bg-azul-marino px-5.5 py-3.5 font-body text-[13px] font-bold text-white transition-colors hover:bg-tinta disabled:opacity-60"
        >
          {pending ? "Enviando…" : "Suscribirme"}
        </button>
      </div>
      {state.status === "error" && (
        <p className="mt-2 font-body text-xs text-white/85">{FEEDBACK.error}</p>
      )}
    </form>
  );
}
