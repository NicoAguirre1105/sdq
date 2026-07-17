"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  createCantico,
  updateCantico,
  deleteCantico,
  type CanticoFormState,
} from "@/lib/actions/canticos";
import type { CanticoLine } from "@/lib/canticos";
import { slugify } from "@/lib/slug";
import { Toast } from "@/components/ui/Toast";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { withOfflineGuard } from "@/lib/action-guard";

type CanticoValues = {
  id: string;
  title: string;
  slug: string;
  classic: boolean;
  youtube_url: string | null;
  start_seconds: number;
  lines: CanticoLine[];
  published: boolean;
};

const label =
  "block font-mono text-[10px] tracking-[0.1em] text-tinta/55 uppercase";
const field =
  "mt-1.5 w-full rounded-md border border-azul-marino/20 bg-white px-3.5 py-2.5 font-body text-sm text-tinta outline-none focus:border-azul-marino";

function opposite(role: CanticoLine["role"]): CanticoLine["role"] {
  return role === "llamada" ? "coro" : "llamada";
}

export function CanticoForm({ cantico }: { cantico?: CanticoValues }) {
  const editing = !!cantico;
  const action = editing ? updateCantico : createCantico;
  const [state, formAction, isPending] = useActionState<CanticoFormState, FormData>(
    withOfflineGuard(action),
    {}
  );

  const [title, setTitle] = useState(cantico?.title ?? "");
  const [slug, setSlug] = useState(cantico?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(editing);
  const [lines, setLines] = useState<CanticoLine[]>(
    cantico?.lines ?? [{ role: "llamada", text: "" }]
  );

  // Refs de los inputs de texto de cada verso, para poder enfocar el nuevo al
  // agregarlo con Enter (focusIndexRef guarda el índice pendiente hasta que el
  // effect corre después del re-render).
  const lineRefs = useRef<(HTMLInputElement | null)[]>([]);
  const focusIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (focusIndexRef.current === null) return;
    lineRefs.current[focusIndexRef.current]?.focus();
    focusIndexRef.current = null;
  }, [lines]);

  function addLine(focusNew = false) {
    setLines((prev) => {
      const next = [
        ...prev,
        { role: prev.length ? opposite(prev[prev.length - 1].role) : "llamada", text: "" },
      ];
      if (focusNew) focusIndexRef.current = next.length - 1;
      return next;
    });
  }

  function removeLine(i: number) {
    setLines((prev) => prev.filter((_, idx) => idx !== i));
  }

  function moveLine(i: number, direction: -1 | 1) {
    setLines((prev) => {
      const target = i + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[target]] = [next[target], next[i]];
      return next;
    });
  }

  function toggleRole(i: number) {
    setLines((prev) =>
      prev.map((l, idx) => (idx === i ? { ...l, role: opposite(l.role) } : l))
    );
  }

  function setText(i: number, text: string) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, text } : l)));
  }

  return (
    <>
      <form action={formAction}>
        {editing && <input type="hidden" name="id" value={cantico.id} />}
        <input type="hidden" name="lines" value={JSON.stringify(lines)} />

        <header className="flex items-center justify-between gap-3 border-b border-azul-marino/10 bg-white px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/canticos"
              className="font-mono text-lg text-tinta/40 hover:text-tinta"
            >
              ←
            </Link>
            <h1 className="font-display text-2xl text-tinta">
              {editing ? "EDITAR CÁNTICO" : "NUEVO CÁNTICO"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/canticos"
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
          <label htmlFor="title" className={label}>
            Título
          </label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            required
            className={`${field} mb-4`}
          />

          <label htmlFor="slug" className={label}>
            Slug
          </label>
          <div className="mt-1.5 mb-4 flex items-center rounded-md border border-azul-marino/20 bg-[#eeece5] px-3.5">
            <span className="font-mono text-xs text-tinta/35">/canticos/</span>
            <input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className="w-full bg-transparent py-2.5 font-mono text-xs text-tinta/70 outline-none"
            />
          </div>

          <div className="mb-4 flex flex-wrap gap-4">
            <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-md border border-azul-marino/20 bg-white px-3.5 py-2.5">
              <input
                type="checkbox"
                name="classic"
                defaultChecked={cantico?.classic ?? false}
                className="size-4 accent-dorado-escudo"
              />
              <span className="font-body text-sm text-tinta">Clásico</span>
            </label>
            <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-md border border-azul-marino/20 bg-white px-3.5 py-2.5">
              <input
                type="checkbox"
                name="published"
                defaultChecked={cantico?.published ?? false}
                className="size-4 accent-[#1E8A5B]"
              />
              <span className="font-body text-sm text-tinta">Publicado</span>
            </label>
          </div>

          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex-[2]">
              <label htmlFor="youtube_url" className={label}>
                URL de YouTube (opcional)
              </label>
              <input
                id="youtube_url"
                name="youtube_url"
                defaultValue={cantico?.youtube_url ?? ""}
                placeholder="https://www.youtube.com/watch?v=…"
                className={field}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="start_seconds" className={label}>
                Segundo de inicio
              </label>
              <input
                id="start_seconds"
                name="start_seconds"
                type="number"
                min={0}
                defaultValue={cantico?.start_seconds ?? 0}
                className={field}
              />
            </div>
          </div>

          <div className="mb-1.5 flex items-center justify-between">
            <span className={label}>Versos</span>
            <button
              type="button"
              onClick={() => addLine(true)}
              className="font-mono text-[10px] font-semibold text-azul-marino hover:underline"
            >
              + AGREGAR VERSO
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {lines.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleRole(i)}
                  title="Cambiar color"
                  className={`flex-none rounded-md px-3 py-2.5 font-mono text-[9px] font-bold tracking-wide ${
                    line.role === "llamada"
                      ? "bg-rojo-bandera text-white"
                      : "border border-azul-marino/20 bg-white text-tinta"
                  }`}
                >
                  {line.role === "llamada" ? "ROJO" : "BLANCO"}
                </button>
                <input
                  ref={(el) => {
                    lineRefs.current[i] = el;
                  }}
                  value={line.text}
                  onChange={(e) => setText(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    addLine(true);
                  }}
                  placeholder="Texto del verso"
                  className="w-full rounded-md border border-azul-marino/20 bg-white px-3 py-2.5 font-body text-sm text-tinta outline-none focus:border-azul-marino"
                />
                <button
                  type="button"
                  onClick={() => moveLine(i, -1)}
                  disabled={i === 0}
                  className="flex-none font-mono text-sm text-tinta/40 hover:text-tinta disabled:opacity-25"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveLine(i, 1)}
                  disabled={i === lines.length - 1}
                  className="flex-none font-mono text-sm text-tinta/40 hover:text-tinta disabled:opacity-25"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeLine(i)}
                  disabled={lines.length === 1}
                  className="flex-none font-mono text-sm text-rojo-bandera/70 hover:text-rojo-bandera disabled:opacity-25"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>

      {editing && (
        <div className="mx-auto max-w-2xl px-6 pb-10">
          <DeleteButton
            action={deleteCantico}
            id={cantico.id}
            label="Eliminar cántico"
            message="¿Eliminar este cántico? No se puede deshacer."
            className="rounded-md border border-rojo-bandera/40 px-4 py-2 font-body text-xs font-bold text-rojo-bandera transition-colors hover:bg-rojo-bandera hover:text-white"
          />
        </div>
      )}
    </>
  );
}
