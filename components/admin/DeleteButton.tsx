"use client";

import { useId, useState } from "react";
import { useEnterExit } from "@/lib/use-enter-exit";

// Envuelve una server action de borrado con una confirmación estilo toast (warning,
// abajo a la derecha) en vez del confirm() nativo del navegador. El botón visible es
// type="button" (no dispara el submit); el botón "Eliminar" del toast referencia el
// <form> por id vía el atributo `form`, así puede vivir fuera de su árbol DOM.
export function DeleteButton({
  action,
  id,
  message,
  label = "Eliminar",
  className = "font-mono text-[10px] font-bold text-rojo-bandera hover:underline",
  extraFields,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  message: string;
  label?: string;
  className?: string;
  extraFields?: Record<string, string>;
}) {
  const formId = useId();
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <form id={formId} action={action}>
        <input type="hidden" name="id" value={id} />
        {extraFields &&
          Object.entries(extraFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
      </form>
      <button type="button" onClick={() => setConfirming(true)} className={className}>
        {label}
      </button>

      {confirming && (
        <ConfirmToast
          message={message}
          formId={formId}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}

function ConfirmToast({
  message,
  formId,
  onCancel,
}: {
  message: string;
  formId: string;
  onCancel: () => void;
}) {
  const { open, close } = useEnterExit(onCancel, 160);

  return (
    <div
      role="alertdialog"
      aria-label="Confirmar eliminación"
      className={`fixed right-4 bottom-4 z-50 flex max-w-sm flex-col gap-3 rounded-md bg-dorado-escudo px-4 py-3 text-azul-marino shadow-lg transition-[opacity,transform] duration-200 ease-out-strong ${
        open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <p className="font-body text-sm leading-snug">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={close}
          className="rounded-md px-3 py-1.5 font-mono text-[10px] font-bold tracking-wide transition-[background-color,transform] duration-150 ease-out-strong hover:bg-azul-marino/10 active:scale-95"
        >
          CANCELAR
        </button>
        <button
          type="submit"
          form={formId}
          className="rounded-md bg-azul-marino px-3 py-1.5 font-mono text-[10px] font-bold tracking-wide text-white transition-[background-color,transform] duration-150 ease-out-strong hover:bg-azul-marino/90 active:scale-95"
        >
          ELIMINAR
        </button>
      </div>
    </div>
  );
}
