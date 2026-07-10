"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import {
  createPost,
  updatePost,
  deletePost,
  type PostFormState,
} from "@/lib/actions/posts";
import { renderMarkdown } from "@/lib/markdown";
import { slugify } from "@/lib/slug";
import { Toast } from "@/components/ui/Toast";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { withOfflineGuard } from "@/lib/action-guard";

type PostValues = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_md: string;
  category: "noticia" | "cronica" | "aviso" | "cantico" | null;
  cover_image: string | null;
  published_at: string | null;
};

const label =
  "block font-mono text-[10px] tracking-[0.1em] text-tinta/55 uppercase";
const field =
  "mt-1.5 w-full rounded-md border border-azul-marino/20 bg-white px-3.5 py-2.5 font-body text-sm text-tinta outline-none focus:border-azul-marino";

export function PostForm({ post }: { post?: PostValues }) {
  const editing = !!post;
  const action = editing ? updatePost : createPost;
  const [state, formAction, isPending] = useActionState<PostFormState, FormData>(
    withOfflineGuard(action),
    {}
  );

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(editing);
  const [content, setContent] = useState(post?.content_md ?? "");
  const [showPreview, setShowPreview] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState(post?.cover_image ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <form action={formAction}>
        {editing && <input type="hidden" name="id" value={post.id} />}
        {editing && (
          <input
            type="hidden"
            name="current_published_at"
            value={post.published_at ?? ""}
          />
        )}

        <header className="flex items-center justify-between gap-3 border-b border-azul-marino/10 bg-white px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/posts"
              className="font-mono text-lg text-tinta/40 hover:text-tinta"
            >
              ←
            </Link>
            <h1 className="font-display text-2xl text-tinta">
              {editing ? "EDITAR POST" : "NUEVO POST"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/posts"
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
            <span className="font-mono text-xs text-tinta/35">/posts/</span>
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
            <div className="flex-1">
              <label htmlFor="category" className={label}>
                Categoría
              </label>
              <select
                id="category"
                name="category"
                defaultValue={post?.category ?? ""}
                className={field}
              >
                <option value="">Sin categoría</option>
                <option value="noticia">Noticia</option>
                <option value="cronica">Crónica</option>
                <option value="aviso">Aviso</option>
                <option value="cantico">Cántico</option>
              </select>
            </div>
            <div className="flex-1">
              <span className={label}>Estado</span>
              <label className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-md border border-azul-marino/20 bg-white px-3.5 py-2.5">
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={!!post?.published_at}
                  className="size-4 accent-[#1E8A5B]"
                />
                <span className="font-body text-sm text-tinta">Publicado</span>
              </label>
            </div>
          </div>

          <span className={label}>Imagen de portada</span>
          {/* Conserva la URL actual si no se sube un archivo nuevo; "" = quitar portada. */}
          <input type="hidden" name="cover_image" value={coverUrl} />
          <div className="mt-1.5 mb-4">
            {(coverPreview || coverUrl) && (
              <div className="relative mb-2 aspect-video w-full overflow-hidden rounded-md border border-azul-marino/15">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverPreview || coverUrl}
                  alt="Portada"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverPreview(null);
                    setCoverUrl("");
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 rounded-md bg-tinta/70 px-2.5 py-1 font-mono text-[9px] font-bold text-white hover:bg-rojo-bandera"
                >
                  QUITAR
                </button>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              name="cover_image_file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setCoverPreview(f ? URL.createObjectURL(f) : null);
              }}
              className="block w-full font-body text-xs text-tinta/70 file:mr-3 file:rounded-md file:border-0 file:bg-azul-marino file:px-3 file:py-2 file:font-body file:text-xs file:font-bold file:text-white"
            />
            <p className="mt-1 font-mono text-[9px] text-tinta/40">
              JPG o PNG, hasta 5 MB. Relación recomendada 16:9 (ej. 1600×900 px). Se sube al guardar.{" "}
              {coverPreview || coverUrl
                ? "Subir otra reemplaza la actual."
                : ""}
            </p>
          </div>

          <label htmlFor="excerpt" className={label}>
            Extracto
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            defaultValue={post?.excerpt ?? ""}
            rows={2}
            className={`${field} mb-4 resize-y`}
          />

          <div className="mb-1.5 flex items-center justify-between">
            <span className={label}>Contenido · Markdown</span>
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="font-mono text-[10px] font-semibold text-azul-marino hover:underline"
            >
              {showPreview ? "EDITAR" : "VISTA PREVIA"}
            </button>
          </div>

          {showPreview ? (
            <div
              className="min-h-[240px] rounded-md border border-azul-marino/20 bg-white px-4 py-3 font-body text-sm leading-relaxed text-tinta [&_a]:text-azul-marino [&_a]:underline [&_h1]:mt-3 [&_h1]:font-display [&_h1]:text-3xl [&_h2]:mt-3 [&_h2]:font-display [&_h2]:text-2xl [&_h3]:mt-3 [&_h3]:font-display [&_h3]:text-xl [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-2 [&_strong]:font-bold"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          ) : (
            <textarea
              id="content_md"
              name="content_md"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={12}
              className={`${field} resize-y font-mono text-[13px] leading-relaxed`}
            />
          )}
          {/* El textarea mantiene name aunque esté oculto en preview: mantener el valor */}
          {showPreview && (
            <input type="hidden" name="content_md" value={content} />
          )}
        </div>
      </form>

      {editing && (
        <div className="mx-auto max-w-2xl px-6 pb-10">
          <DeleteButton
            action={deletePost}
            id={post.id}
            label="Eliminar post"
            message="¿Eliminar este post? No se puede deshacer."
            className="rounded-md border border-rojo-bandera/40 px-4 py-2 font-body text-xs font-bold text-rojo-bandera transition-colors hover:bg-rojo-bandera hover:text-white"
          />
        </div>
      )}
    </>
  );
}
