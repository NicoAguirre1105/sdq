"use client";

import { useEffect, useState } from "react";

const EXIT_DURATION = 160;

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

  const shouldShow = !dismissed && !!message;

  // rendered controla si el nodo sigue en el DOM (se retrasa el unmount para que
  // la transición de salida alcance a jugar); visible controla las clases.
  const [rendered, setRendered] = useState(shouldShow);
  const [visible, setVisible] = useState(false);
  const [prevShouldShow, setPrevShouldShow] = useState(shouldShow);

  // Igual que arriba: ajuste durante el render, no en un efecto. Al aparecer,
  // monta ya mismo (queda "no visible" un frame para que la transición de
  // entrada tenga de dónde partir); al desaparecer, arranca la salida ya mismo.
  if (shouldShow !== prevShouldShow) {
    setPrevShouldShow(shouldShow);
    if (shouldShow) setRendered(true);
    else setVisible(false);
  }

  useEffect(() => {
    if (!shouldShow) {
      const timer = setTimeout(() => setRendered(false), EXIT_DURATION);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setVisible(true), 0);
    return () => clearTimeout(timer);
  }, [shouldShow]);

  if (!rendered) return null;

  const tone =
    variant === "warning"
      ? "bg-dorado-escudo text-azul-marino"
      : "bg-rojo-bandera text-white";

  return (
    <div
      role="alert"
      className={`fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-3 rounded-md px-4 py-3 shadow-lg transition-[opacity,transform] duration-200 ease-out-strong ${tone} ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <p className="flex-1 font-body text-sm leading-snug">{message}</p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Cerrar"
        className="font-mono text-sm leading-none opacity-70 transition-opacity hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}
