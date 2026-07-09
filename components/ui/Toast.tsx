"use client";

import { useState } from "react";

// ponytail: un solo toast a la vez, sin cola. Reaparece cuando cambia el texto del
// mensaje (nuevo submit con un error distinto); si dos submits seguidos dan el
// mismo texto justo después de cerrarlo, no reaparece — caso raro, no vale la
// complejidad de una cola. Si hace falta, subir a un ToastProvider con contexto.
export function Toast({
  message,
  variant = "error",
}: {
  message?: string | null;
  variant?: "error" | "warning";
}) {
  const [dismissed, setDismissed] = useState(false);
  const [lastMessage, setLastMessage] = useState(message);

  // Ajusta el estado durante el render (no en un efecto) cuando llega un mensaje
  // nuevo, para volver a mostrar el toast si se había cerrado uno anterior.
  if (message !== lastMessage) {
    setLastMessage(message);
    setDismissed(false);
  }

  if (dismissed || !message) return null;

  const tone =
    variant === "warning"
      ? "bg-dorado-escudo text-azul-marino"
      : "bg-rojo-bandera text-white";

  return (
    <div
      role="alert"
      className={`fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-3 rounded-md px-4 py-3 shadow-lg ${tone}`}
    >
      <p className="flex-1 font-body text-sm leading-snug">{message}</p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Cerrar"
        className="font-mono text-sm leading-none opacity-70 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}
