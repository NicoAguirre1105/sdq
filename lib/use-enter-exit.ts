"use client";

import { useEffect, useState } from "react";

// Coordina la transición de entrada/salida de elementos montados condicionalmente
// (`{open && <Modal onClose={...} />}`). El consumidor usa `open` para elegir sus
// clases de "entrado" vs "saliendo", y llama `close()` en vez del onClose crudo —
// eso recién dispara el onClose real después de exitDuration, dejando que la
// transición de salida termine de jugar antes de que el padre desmonte el nodo.
export function useEnterExit(onClose: () => void, exitDuration = 160) {
  const [entered, setEntered] = useState(false);
  const [closing, setClosing] = useState(false);

  // setTimeout en vez de requestAnimationFrame: alcanza para forzar el tick
  // separado que necesita la transición CSS (que el navegador pinte el estado
  // "afuera" antes de pasar a "adentro"), y a diferencia de rAF no se cuelga en
  // pestañas en background o en tabs de automatización que no componen frames.
  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 0);
    return () => clearTimeout(timer);
  }, []);

  function close() {
    setClosing(true);
    setTimeout(onClose, exitDuration);
  }

  return { open: entered && !closing, close };
}
