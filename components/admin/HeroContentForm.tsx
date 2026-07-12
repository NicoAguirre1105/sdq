"use client";

import { useActionState } from "react";
import { updateHeroContent, type SettingsFormState } from "@/lib/actions/settings";
import { Toast } from "@/components/ui/Toast";
import { withOfflineGuard } from "@/lib/action-guard";

const inputClass =
  "mt-1.5 w-full rounded-md border border-azul-marino/20 bg-white px-3.5 py-2.5 font-body text-sm text-tinta outline-none focus:border-azul-marino";
const labelClass = "block font-mono text-[10px] tracking-[0.1em] text-tinta/55 uppercase";

export function HeroContentForm({
  headline,
  subtitle,
}: {
  headline: string;
  subtitle: string;
}) {
  const [state, formAction, isPending] = useActionState<SettingsFormState, FormData>(
    withOfflineGuard(updateHeroContent),
    {}
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <label htmlFor="hero_headline" className={labelClass}>
          Título del hero (Home)
        </label>
        <input
          id="hero_headline"
          name="hero_headline"
          type="text"
          defaultValue={headline}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="hero_subtitle" className={labelClass}>
          Subtítulo del hero (Home)
        </label>
        <textarea
          id="hero_subtitle"
          name="hero_subtitle"
          rows={3}
          defaultValue={subtitle}
          required
          className={`${inputClass} resize-none`}
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-md bg-azul-marino px-4 py-2.5 font-body text-xs font-bold text-white transition-[background-color,transform] duration-150 ease-out-strong hover:bg-azul-marino/90 active:scale-[0.97] disabled:opacity-60"
      >
        {isPending ? "Guardando…" : state.success ? "Guardado ✓" : "Guardar"}
      </button>
      <Toast message={state.error} />
    </form>
  );
}
