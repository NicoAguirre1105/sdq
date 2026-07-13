"use client";

import { useActionState, useState } from "react";
import {
  updatePreferencesAction,
  unsubscribeAction,
  type ManageSubscriptionState,
} from "@/lib/actions/manage-subscription";
import { TOPICS } from "@/lib/topics";
import { Toast } from "@/components/ui/Toast";
import { withOfflineGuard } from "@/lib/action-guard";
import { useEnterExit } from "@/lib/use-enter-exit";

export function ManagePreferencesForm({
  email,
  initialTopics,
}: {
  email: string;
  initialTopics: string[];
}) {
  const [prefsState, prefsAction, savingPrefs] = useActionState<
    ManageSubscriptionState,
    FormData
  >(withOfflineGuard(updatePreferencesAction), {});
  const [unsubState, unsubAction, unsubscribing] = useActionState<
    ManageSubscriptionState,
    FormData
  >(withOfflineGuard(unsubscribeAction), {});
  const [confirmingUnsub, setConfirmingUnsub] = useState(false);

  if (unsubState.success) {
    return (
      <div className="rounded-xl border border-azul-marino/12 bg-white p-6 text-center">
        <p className="font-display text-2xl text-tinta">TE DISTE DE BAJA</p>
        <p className="mt-2 font-body text-sm text-tinta/60">
          Ya no vas a recibir nuestros correos. Puedes volver a suscribirte cuando quieras
          desde la home.
        </p>
      </div>
    );
  }

  return (
    <>
      <form action={prefsAction}>
        <input type="hidden" name="email" value={email} />
        <div className="overflow-hidden rounded-xl border border-azul-marino/12 bg-white">
          <div className="border-b border-azul-marino/8 px-5.5 py-3.5 font-mono text-[11px] tracking-[0.08em] text-tinta/50 uppercase">
            Qué quieres recibir
          </div>
          {TOPICS.map((topic) => (
            <label
              key={topic.value}
              className="flex cursor-pointer items-center gap-4 border-b border-azul-marino/8 px-5.5 py-4.5 last:border-b-0"
            >
              <span className="relative h-6.5 w-11.5 flex-none rounded-full bg-azul-marino/15 transition-colors has-checked:bg-azul-marino">
                <input
                  type="checkbox"
                  name="topics"
                  value={topic.value}
                  defaultChecked={initialTopics.includes(topic.value)}
                  className="peer sr-only"
                />
                <span className="absolute top-0.5 left-0.5 h-5.5 w-5.5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
              </span>
              <span className="font-body text-sm font-semibold text-tinta">{topic.label}</span>
            </label>
          ))}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="submit"
            disabled={savingPrefs}
            className="flex-1 rounded-md bg-azul-marino py-3.5 font-body text-sm font-bold text-white transition-[background-color,transform] duration-150 ease-out-strong hover:bg-tinta active:scale-[0.97] disabled:opacity-60 sm:flex-none sm:px-8"
          >
            {savingPrefs ? "Guardando…" : prefsState.success ? "Guardado ✓" : "Guardar cambios"}
          </button>
          <button
            type="reset"
            className="rounded-md border border-azul-marino/20 px-6 py-3.5 font-body text-sm font-bold text-azul-marino transition-colors hover:border-azul-marino"
          >
            Cancelar
          </button>
        </div>
        <Toast message={prefsState.error} />
      </form>

      <div className="mt-7 border-t border-azul-marino/12 pt-6">
        <p className="mb-2.5 font-mono text-[11px] tracking-[0.06em] text-tinta/45 uppercase">
          ¿Ya no quieres saber de nosotros?
        </p>
        <div className="flex flex-col items-start justify-between gap-3.5 rounded-lg border border-rojo-bandera/20 bg-rojo-bandera/5 p-4.5 sm:flex-row sm:items-center">
          <p className="max-w-sm font-body text-sm text-tinta/65">
            Al darte de baja dejas de recibir todos nuestros correos. Puedes volver a
            suscribirte cuando quieras.
          </p>
          <button
            type="button"
            onClick={() => setConfirmingUnsub(true)}
            className="flex-none rounded-md bg-rojo-bandera px-5 py-2.5 font-body text-xs font-bold whitespace-nowrap text-white transition-[background-color,transform] duration-150 ease-out-strong hover:bg-rojo-bandera-hover active:scale-[0.97]"
          >
            Darme de baja
          </button>
        </div>
        <Toast message={unsubState.error} />
      </div>

      {confirmingUnsub && (
        <UnsubscribeConfirm
          email={email}
          action={unsubAction}
          pending={unsubscribing}
          onCancel={() => setConfirmingUnsub(false)}
        />
      )}
    </>
  );
}

function UnsubscribeConfirm({
  email,
  action,
  pending,
  onCancel,
}: {
  email: string;
  action: (formData: FormData) => void;
  pending: boolean;
  onCancel: () => void;
}) {
  const { open, close } = useEnterExit(onCancel, 160);

  return (
    <div
      className={`fixed right-4 bottom-4 z-50 flex max-w-sm flex-col gap-3 rounded-md bg-dorado-escudo px-4 py-3 text-azul-marino shadow-lg transition-[opacity,transform] duration-200 ease-out-strong ${
        open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <p className="font-body text-sm leading-snug">
        ¿Dar de baja <strong>{email}</strong>? Dejarás de recibir todos los correos.
      </p>
      <form action={action} className="flex justify-end gap-2">
        <input type="hidden" name="email" value={email} />
        <button
          type="button"
          onClick={close}
          className="rounded-md px-3 py-1.5 font-mono text-[10px] font-bold tracking-wide transition-[background-color,transform] duration-150 ease-out-strong hover:bg-azul-marino/10 active:scale-95"
        >
          CANCELAR
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-azul-marino px-3 py-1.5 font-mono text-[10px] font-bold tracking-wide text-white transition-[background-color,transform] duration-150 ease-out-strong hover:bg-azul-marino/90 active:scale-95 disabled:opacity-60"
        >
          {pending ? "..." : "DARME DE BAJA"}
        </button>
      </form>
    </div>
  );
}
