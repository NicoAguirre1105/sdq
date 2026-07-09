"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  checkSubscriberAction,
  subscribeAction,
  type CheckState,
  type SubscribeState,
} from "@/lib/actions/subscribe";

const TOPICS = [
  { value: "club", label: "Posts, noticias e información del club y MAG." },
  { value: "tienda", label: "Contenido exclusivo, ofertas y nuevos productos en la tienda." },
  { value: "canticos", label: "Noticias sobre cánticos nuevos." },
];

const checkInitial: CheckState = { status: "idle" };
const subscribeInitial: SubscribeState = { status: "idle" };

export function SubscribeForm({ compact = false }: { compact?: boolean }) {
  const [checkState, checkAction, checking] = useActionState(checkSubscriberAction, checkInitial);
  const [subState, subAction, subscribing] = useActionState(subscribeAction, subscribeInitial);

  // Suscripción completada.
  if (subState.status === "success") {
    return (
      <div>
        <h2 className={`font-display leading-[0.9] text-white ${compact ? "text-4xl" : "text-4xl md:text-5xl"}`}>
          ¡CASI LISTO!
        </h2>
        <p className="mt-3 max-w-lg font-body text-sm text-white/90">
          Te enviamos un correo de verificación. Abrilo y confirmá tu suscripción para
          empezar a recibir novedades. Si no lo ves, revisá spam.
        </p>
      </div>
    );
  }

  // Paso 2: correo nuevo → términos y confirmación.
  if (checkState.status === "new") {
    return (
      <form action={subAction}>
        <input type="hidden" name="email" value={checkState.email} />
        <h2 className={`font-display leading-[0.9] text-white ${compact ? "text-4xl" : "text-4xl md:text-5xl"}`}>
          CONFIRMÁ
          <br />
          TU SUSCRIPCIÓN
        </h2>
        <p className="mt-2 max-w-lg font-body text-[13px] text-white/85">
          Vamos a enviar un correo de verificación a{" "}
          <strong className="font-semibold text-white">{checkState.email}</strong>. Confirmá ahí
          para activar tu suscripción.
        </p>

        <div className="mt-4 flex max-w-lg flex-col gap-0.5">
          {TOPICS.map((topic) => (
            <label
              key={topic.value}
              className="flex cursor-pointer items-center gap-3.5 border-b border-white/18 py-3 last:border-b-0"
            >
              <span className="relative h-6 w-11 flex-none rounded-full bg-white/20 ring-1 ring-white/25 transition-colors has-checked:bg-azul-marino has-checked:ring-transparent">
                <input type="checkbox" name="topics" value={topic.value} defaultChecked className="peer sr-only" />
                <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
              </span>
              <span className="font-body text-[13px] font-medium text-white">{topic.label}</span>
            </label>
          ))}
        </div>

        <label className="mt-4 flex max-w-lg cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            name="terms"
            required
            className="mt-0.5 h-4 w-4 flex-none accent-azul-marino"
          />
          <span className="font-body text-[13px] text-white/90">
            Acepto los{" "}
            <Link href="/terminos" target="_blank" className="font-semibold text-white underline">
              términos y condiciones
            </Link>{" "}
            de la suscripción y el envío de un correo de verificación.
          </span>
        </label>

        <button
          type="submit"
          disabled={subscribing}
          className="mt-5 rounded-[5px] bg-azul-marino px-5.5 py-3.5 font-body text-[13px] font-bold text-white transition-colors hover:bg-tinta disabled:opacity-60"
        >
          {subscribing ? "Enviando…" : "Quiero suscribirme"}
        </button>
        {subState.status === "error" && (
          <p className="mt-2 font-body text-xs text-white/85">
            {subState.message ?? "Algo salió mal. Probá de nuevo."}
          </p>
        )}
      </form>
    );
  }

  // Paso 1: ingresar correo.
  return (
    <form action={checkAction}>
      <h2 className={`font-display leading-[0.9] text-white ${compact ? "text-4xl" : "text-4xl md:text-5xl"}`}>
        HAZTE HINCHA
        <br />
        DE CORAZÓN
      </h2>
      <p className="mt-2 max-w-lg font-body text-[13px] text-white/85">
        Sin spam. Gratis. Escoge la información relevante que quieres recibir en tu correo en
        todo momento.
      </p>

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
          disabled={checking}
          className="rounded-[5px] bg-azul-marino px-5.5 py-3.5 font-body text-[13px] font-bold text-white transition-colors hover:bg-tinta disabled:opacity-60"
        >
          {checking ? "…" : "Continuar"}
        </button>
      </div>

      {checkState.status === "confirmed" && (
        <p className="mt-2 font-body text-xs text-white/85">Ya estás suscrito con este correo.</p>
      )}
      {checkState.status === "pending" && (
        <p className="mt-2 font-body text-xs text-white/85">
          Ya te registraste. Revisá tu correo para confirmar la suscripción.
        </p>
      )}
      {checkState.status === "error" && (
        <p className="mt-2 font-body text-xs text-white/85">Algo salió mal. Probá de nuevo.</p>
      )}
    </form>
  );
}
