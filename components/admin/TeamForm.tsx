"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import {
  createTeam,
  updateTeam,
  deleteTeam,
  type TeamFormState,
} from "@/lib/actions/teams";
import { Toast } from "@/components/ui/Toast";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { withOfflineGuard } from "@/lib/action-guard";

type TeamValues = {
  id: string;
  name: string;
  short_name: string | null;
  logo_url: string | null;
};

const label =
  "block font-mono text-[10px] tracking-[0.1em] text-tinta/55 uppercase";
const field =
  "mt-1.5 w-full rounded-md border border-azul-marino/20 bg-white px-3.5 py-2.5 font-body text-sm text-tinta outline-none focus:border-azul-marino";

export function TeamForm({ team }: { team?: TeamValues }) {
  const editing = !!team;
  const action = editing ? updateTeam : createTeam;
  const [state, formAction, isPending] = useActionState<TeamFormState, FormData>(
    withOfflineGuard(action),
    {}
  );

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState(team?.logo_url ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <form action={formAction}>
        {editing && <input type="hidden" name="id" value={team.id} />}

        <header className="flex items-center justify-between gap-3 border-b border-azul-marino/10 bg-white px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/futbol/equipos"
              className="font-mono text-lg text-tinta/40 hover:text-tinta"
            >
              ←
            </Link>
            <h1 className="font-display text-2xl text-tinta">
              {editing ? "EDITAR EQUIPO" : "NUEVO EQUIPO"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/futbol/equipos"
              className="rounded-md border border-azul-marino/16 px-3.5 py-2 font-body text-xs font-bold text-tinta/60"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-rojo-bandera px-4 py-2 font-body text-xs font-bold text-white transition-colors hover:bg-rojo-bandera-hover disabled:opacity-60"
            >
              {isPending ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </header>

        <Toast message={state.error} />

        <div className="mx-auto max-w-2xl px-6 py-6">

          <label htmlFor="name" className={label}>
            Nombre
          </label>
          <input
            id="name"
            name="name"
            defaultValue={team?.name ?? ""}
            required
            className={`${field} mb-4`}
          />

          <label htmlFor="short_name" className={label}>
            Nombre corto
          </label>
          <input
            id="short_name"
            name="short_name"
            defaultValue={team?.short_name ?? ""}
            placeholder="Para la tabla de posiciones, ej. “Quito”"
            className={`${field} mb-4`}
          />

          <span className={label}>Escudo · SVG</span>
          {/* Conserva la URL actual si no se sube un archivo nuevo; "" = quitar. */}
          <input type="hidden" name="logo_url" value={logoUrl} />
          <div className="mt-1.5 mb-4">
            {(logoPreview || logoUrl) && (
              // Fondo oscuro: los escudos son SVG blancos sin fondo (ver design-system.md).
              <div className="relative mb-2 inline-flex rounded-md border border-azul-marino/15 bg-azul-marino p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoPreview || logoUrl}
                  alt="Escudo"
                  className="size-16 object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setLogoPreview(null);
                    setLogoUrl("");
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="absolute -top-2 -right-2 rounded-md bg-tinta/70 px-2 py-0.5 font-mono text-[9px] font-bold text-white hover:bg-rojo-bandera"
                >
                  QUITAR
                </button>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              name="logo_file"
              accept="image/svg+xml,.svg"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setLogoPreview(f ? URL.createObjectURL(f) : null);
              }}
              className="block w-full font-body text-xs text-tinta/70 file:mr-3 file:rounded-md file:border-0 file:bg-azul-marino file:px-3 file:py-2 file:font-body file:text-xs file:font-bold file:text-white"
            />
            <p className="mt-1 font-mono text-[9px] text-tinta/40">
              Solo SVG, hasta 1 MB. Se sube al guardar.{" "}
              {logoPreview || logoUrl ? "Subir otro reemplaza el actual." : ""}
            </p>
          </div>
        </div>
      </form>

      {editing && (
        <div className="mx-auto max-w-2xl px-6 pb-10">
          <DeleteButton
            action={deleteTeam}
            id={team.id}
            label="Eliminar equipo"
            message="¿Eliminar este equipo? No se puede deshacer."
            className="rounded-md border border-rojo-bandera/40 px-4 py-2 font-body text-xs font-bold text-rojo-bandera transition-colors hover:bg-rojo-bandera hover:text-white"
          />
        </div>
      )}
    </>
  );
}
