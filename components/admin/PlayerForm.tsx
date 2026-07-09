"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import {
  createPlayer,
  updatePlayer,
  deletePlayer,
  type PlayerFormState,
} from "@/lib/actions/players";
import { Toast } from "@/components/ui/Toast";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { POSITIONS, STAFF_POSITION } from "@/lib/positions";
import { withOfflineGuard } from "@/lib/action-guard";

type PlayerValues = {
  id: string;
  full_name: string;
  position: string | null;
  jersey_number: number | null;
  staff_role: string | null;
  bio_md: string | null;
  photo_url: string | null;
};

const label =
  "block font-mono text-[10px] tracking-[0.1em] text-tinta/55 uppercase";
const field =
  "mt-1.5 w-full rounded-md border border-azul-marino/20 bg-white px-3.5 py-2.5 font-body text-sm text-tinta outline-none focus:border-azul-marino";

export function PlayerForm({ player }: { player?: PlayerValues }) {
  const editing = !!player;
  const action = editing ? updatePlayer : createPlayer;
  const [state, formAction, isPending] = useActionState<PlayerFormState, FormData>(
    withOfflineGuard(action),
    {}
  );

  const [position, setPosition] = useState(player?.position ?? "");
  const isStaff = position === STAFF_POSITION;
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState(player?.photo_url ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <form action={formAction}>
        {editing && <input type="hidden" name="id" value={player.id} />}

        <header className="flex items-center justify-between gap-3 border-b border-azul-marino/10 bg-white px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/plantilla"
              className="font-mono text-lg text-tinta/40 hover:text-tinta"
            >
              ←
            </Link>
            <h1 className="font-display text-2xl text-tinta">
              {editing ? "EDITAR JUGADOR" : "NUEVO JUGADOR"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/plantilla"
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

          <label htmlFor="full_name" className={label}>
            Nombre completo
          </label>
          <input
            id="full_name"
            name="full_name"
            defaultValue={player?.full_name ?? ""}
            required
            className={`${field} mb-4`}
          />

          <div className="mb-4 flex flex-wrap gap-4">
            <div className="min-w-[180px] flex-[2]">
              <label htmlFor="position" className={label}>
                Posición
              </label>
              <select
                id="position"
                name="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className={field}
              >
                <option value="">Sin posición</option>
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[100px] flex-1">
              {isStaff ? (
                <>
                  <label htmlFor="staff_role" className={label}>
                    Cargo (siglas)
                  </label>
                  <input
                    id="staff_role"
                    name="staff_role"
                    type="text"
                    maxLength={5}
                    placeholder="DT"
                    defaultValue={player?.staff_role ?? ""}
                    className={`${field} font-mono uppercase`}
                  />
                </>
              ) : (
                <>
                  <label htmlFor="jersey_number" className={label}>
                    Dorsal
                  </label>
                  <input
                    id="jersey_number"
                    name="jersey_number"
                    type="number"
                    min={0}
                    defaultValue={player?.jersey_number ?? ""}
                    className={`${field} font-mono`}
                  />
                </>
              )}
            </div>
          </div>

          <span className={label}>Foto (opcional)</span>
          {/* Conserva la URL actual si no se sube un archivo nuevo; "" = quitar. */}
          <input type="hidden" name="photo_url" value={photoUrl} />
          <div className="mt-1.5 mb-4">
            {(photoPreview || photoUrl) && (
              <div className="relative mb-2 inline-flex rounded-md border border-azul-marino/15 bg-white p-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview || photoUrl}
                  alt="Foto del jugador"
                  className="h-32 w-24 rounded object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoUrl("");
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
              name="photo_file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setPhotoPreview(f ? URL.createObjectURL(f) : null);
              }}
              className="block w-full font-body text-xs text-tinta/70 file:mr-3 file:rounded-md file:border-0 file:bg-azul-marino file:px-3 file:py-2 file:font-body file:text-xs file:font-bold file:text-white"
            />
            <p className="mt-1 font-mono text-[9px] text-tinta/40">
              JPG, PNG o WebP, hasta 2 MB. Se sube al guardar. Sin foto queda un
              placeholder.{" "}
              {photoPreview || photoUrl ? "Subir otra reemplaza la actual." : ""}
            </p>
          </div>

          <label htmlFor="bio_md" className={label}>
            Bio · Markdown (opcional)
          </label>
          <textarea
            id="bio_md"
            name="bio_md"
            defaultValue={player?.bio_md ?? ""}
            rows={5}
            className={`${field} resize-y font-mono text-[13px] leading-relaxed`}
          />
        </div>
      </form>

      {editing && (
        <div className="mx-auto max-w-2xl px-6 pb-10">
          <DeleteButton
            action={deletePlayer}
            id={player.id}
            label="Eliminar jugador"
            message="¿Eliminar este jugador? No se puede deshacer."
            className="rounded-md border border-rojo-bandera/40 px-4 py-2 font-body text-xs font-bold text-rojo-bandera transition-colors hover:bg-rojo-bandera hover:text-white"
          />
        </div>
      )}
    </>
  );
}
