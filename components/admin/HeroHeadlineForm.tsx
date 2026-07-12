"use client";

import { useActionState } from "react";
import { updateHeroHeadline, type SettingsFormState } from "@/lib/actions/settings";
import { Toast } from "@/components/ui/Toast";
import { withOfflineGuard } from "@/lib/action-guard";

export function HeroHeadlineForm({ headline }: { headline: string }) {
  const [state, formAction, isPending] = useActionState<SettingsFormState, FormData>(
    withOfflineGuard(updateHeroHeadline),
    {}
  );

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label
          htmlFor="hero_headline"
          className="block font-mono text-[10px] tracking-[0.1em] text-tinta/55 uppercase"
        >
          Título del hero (Home)
        </label>
        <input
          id="hero_headline"
          name="hero_headline"
          type="text"
          defaultValue={headline}
          required
          className="mt-1.5 w-full rounded-md border border-azul-marino/20 bg-white px-3.5 py-2.5 font-body text-sm text-tinta outline-none focus:border-azul-marino"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-azul-marino px-4 py-2.5 font-body text-xs font-bold text-white transition-colors hover:bg-azul-marino/90 disabled:opacity-60"
      >
        {isPending ? "Guardando…" : state.success ? "Guardado ✓" : "Guardar"}
      </button>
      <Toast message={state.error} />
    </form>
  );
}
