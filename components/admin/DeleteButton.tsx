"use client";

import { useId, useState } from "react";

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
        <div
          role="alertdialog"
          aria-label="Confirmar eliminación"
          className="fixed right-4 bottom-4 z-50 flex max-w-sm flex-col gap-3 rounded-md bg-dorado-escudo px-4 py-3 text-azul-marino shadow-lg"
        >
          <p className="font-body text-sm leading-snug">{message}</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-md px-3 py-1.5 font-mono text-[10px] font-bold tracking-wide hover:bg-azul-marino/10"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              form={formId}
              className="rounded-md bg-azul-marino px-3 py-1.5 font-mono text-[10px] font-bold tracking-wide text-white hover:bg-azul-marino/90"
            >
              ELIMINAR
            </button>
          </div>
        </div>
      )}
    </>
  );
}
