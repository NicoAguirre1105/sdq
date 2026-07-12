"use client";

import { SubscribeForm } from "@/components/layout/SubscribeForm";
import { useEnterExit } from "@/lib/use-enter-exit";

export function SubscribeModal({ onClose }: { onClose: () => void }) {
  const { open, close } = useEnterExit(onClose, 160);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div
        className={`absolute inset-0 bg-[#081938]/72 backdrop-blur-[2px] transition-opacity duration-200 ease-out-strong ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={close}
      />
      {/* Móvil: bottom sheet, entra deslizando desde abajo. Desktop: dialog
          centrado, entra con scale — los modales mantienen origen center. */}
      <div
        className={`relative w-full rounded-t-[20px] bg-rojo-bandera p-4.5 pb-5.5 transition-[opacity,transform] duration-200 ease-out-strong md:w-[560px] md:rounded-[14px] md:p-9 md:pt-8 ${
          open
            ? "translate-y-0 opacity-100 md:scale-100"
            : "translate-y-3 opacity-0 md:translate-y-0 md:scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar"
          className="absolute top-3.5 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-white/15 font-mono text-sm text-white transition-[background-color,transform] duration-150 ease-out-strong hover:bg-white/28 active:scale-90 md:top-4 md:right-4.5 md:h-8 md:w-8"
        >
          ✕
        </button>
        <SubscribeForm compact />
      </div>
    </div>
  );
}
