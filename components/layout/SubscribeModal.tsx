"use client";

import { SubscribeForm } from "@/components/layout/SubscribeForm";

export function SubscribeModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#081938]/72 backdrop-blur-[2px] md:items-center"
      onClick={onClose}
    >
      <div
        className="relative w-full rounded-t-[20px] bg-rojo-bandera p-4.5 pb-5.5 md:w-[560px] md:rounded-[14px] md:p-9 md:pt-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3.5 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-white/15 font-mono text-sm text-white transition-colors hover:bg-white/28 md:top-4 md:right-4.5 md:h-8 md:w-8"
        >
          ✕
        </button>
        <SubscribeForm compact />
      </div>
    </div>
  );
}
