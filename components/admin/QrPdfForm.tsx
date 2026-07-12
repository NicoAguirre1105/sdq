"use client";

import { useState } from "react";

type CanticoOption = { slug: string; title: string };
type Target = "home" | "canticos" | "cantico";

export function QrPdfForm({
  canticos,
  siteUrl,
}: {
  canticos: CanticoOption[];
  siteUrl: string;
}) {
  const [target, setTarget] = useState<Target>("home");
  const [slug, setSlug] = useState(canticos[0]?.slug ?? "");

  const path = target === "home" ? "" : target === "canticos" ? "/canticos" : `/canticos/${slug}`;
  const href =
    target === "cantico"
      ? `/api/admin/qr-pdf?target=cantico&slug=${encodeURIComponent(slug)}`
      : `/api/admin/qr-pdf?target=${target}`;

  return (
    <div className="max-w-md rounded-lg border border-azul-marino/12 bg-white p-5">
      <fieldset className="mb-4 flex flex-col gap-2.5">
        <legend className="mb-1 font-mono text-[10px] tracking-[0.1em] text-tinta/55 uppercase">
          Destino del QR
        </legend>
        <label className="flex cursor-pointer items-center gap-2.5 font-body text-sm text-tinta">
          <input
            type="radio"
            name="target"
            checked={target === "home"}
            onChange={() => setTarget("home")}
            className="accent-azul-marino"
          />
          Sitio web (todas las secciones)
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 font-body text-sm text-tinta">
          <input
            type="radio"
            name="target"
            checked={target === "canticos"}
            onChange={() => setTarget("canticos")}
            className="accent-azul-marino"
          />
          Página principal de Cánticos
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 font-body text-sm text-tinta">
          <input
            type="radio"
            name="target"
            checked={target === "cantico"}
            onChange={() => setTarget("cantico")}
            className="accent-azul-marino"
            disabled={canticos.length === 0}
          />
          Cántico específico
        </label>
      </fieldset>

      {target === "cantico" && (
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mb-4 w-full rounded-md border border-azul-marino/20 bg-white px-3.5 py-2.5 font-body text-sm text-tinta outline-none focus:border-azul-marino"
        >
          {canticos.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.title}
            </option>
          ))}
        </select>
      )}

      <p className="mb-4 font-mono text-[10px] text-tinta/45">
        El QR va a apuntar a:
        <br />
        <span className="text-tinta/70">
          {siteUrl}
          {path}
        </span>
      </p>

      <a
        href={href}
        className="inline-block rounded-md bg-rojo-bandera px-4 py-2.5 font-body text-xs font-bold text-white transition-[background-color,transform] duration-150 ease-out-strong hover:bg-rojo-bandera-hover active:scale-[0.97]"
      >
        Descargar PDF con QR
      </a>
    </div>
  );
}
