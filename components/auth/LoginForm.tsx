"use client";

import { useActionState, useState } from "react";
import { signInAction, type SignInState } from "@/lib/actions/auth";
import { Toast } from "@/components/ui/Toast";
import { withOfflineGuard } from "@/lib/action-guard";

const initial: SignInState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    withOfflineGuard(signInAction),
    initial
  );
  const [showPassword, setShowPassword] = useState(false);

  const labelClass =
    "block mt-1.5 font-mono text-[10px] tracking-[0.1em] text-tinta/55 uppercase";
  // text-base (16px), no text-sm: en iOS Safari un input con font-size <16px
  // dispara auto-zoom al enfocarlo, y ese zoom queda pegado tras el redirect a
  // /admin, dejando el dashboard chico dentro del viewport.
  const inputClass =
    "w-full rounded-md border border-azul-marino/20 bg-white px-4 py-3 font-body text-base text-tinta outline-none focus:border-azul-marino";

  return (
    <form action={formAction} className="flex flex-col">
      <p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-rojo-bandera">
        INICIAR SESIÓN
      </p>
      <h1 className="mt-2 font-display text-[44px] leading-[0.9] text-tinta md:text-5xl">
        BIENVENIDO
        <br />
        DE VUELTA
      </h1>
      <p className="mt-2 mb-7 font-body text-[13px] text-tinta/55">
        Ingresa con tu cuenta de staff para gestionar el sitio.
      </p>

      <label htmlFor="email" className={labelClass}>
        Correo
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        className={`${inputClass} mb-4`}
        placeholder="tu@correo.com"
      />

      <label htmlFor="password" className={labelClass}>
        Contraseña
      </label>
      <div className="relative mb-6">
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute top-1/2 right-4 -translate-y-1/2 font-mono text-[10px] font-semibold text-tinta/40"
        >
          {showPassword ? "OCULTAR" : "VER"}
        </button>
      </div>

      <Toast message={state.error} />

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-rojo-bandera py-3.5 font-body text-sm font-bold text-white transition-[background-color,transform] duration-150 ease-out-strong hover:bg-rojo-bandera-hover active:scale-[0.97] disabled:opacity-60"
      >
        {isPending ? "Entrando…" : "Entrar al panel"}
      </button>

      <p className="mt-5 font-body text-[11px] text-tinta/45">
        El registro es solo por invitación. Contacta al administrador del club.
      </p>
    </form>
  );
}
