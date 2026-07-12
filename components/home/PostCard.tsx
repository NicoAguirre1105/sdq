import Link from "next/link";
import { PhotoPlaceholder } from "@/components/ui/PhotoPlaceholder";
import { ImageWithSkeleton } from "@/components/ui/ImageWithSkeleton";

type Post = {
  slug: string;
  title: string;
  excerpt: string | null;
  category: "noticia" | "cronica" | "aviso" | "cantico" | null;
  cover_image: string | null;
  published_at: string | null;
};

const CATEGORY = {
  cronica: { label: "CRÓNICA", tone: "azul", text: "text-rojo-bandera", photo: "FOTO PARTIDO" },
  noticia: { label: "NOTICIA", tone: "rojo", text: "text-azul-marino", photo: "FOTO JUGADOR" },
  aviso: { label: "AVISO", tone: "dorado", text: "text-dorado-escudo", photo: "ARTE AVISO" },
  cantico: { label: "CÁNTICO", tone: "rojo", text: "text-rojo-bandera", photo: "ARTE CÁNTICO" },
} as const;

function relativeDays(iso: string | null) {
  if (!iso) return "";
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
  );
  if (days === 0) return "HOY";
  if (days === 1) return "HACE 1 DÍA";
  return `HACE ${days} DÍAS`;
}

export function PostCard({ post }: { post: Post }) {
  const meta = CATEGORY[post.category ?? "noticia"];

  return (
    <Link
      href={`/post/${post.slug}`}
      className="block overflow-hidden rounded-lg border border-azul-marino/12 bg-white transition-[transform,box-shadow] duration-200 ease-out-strong hover:-translate-y-0.5 hover:shadow-[0_12px_34px_-14px_rgba(11,46,107,0.45)]"
    >
      <article>
        {post.cover_image ? (
          <div className="relative aspect-video">
            <ImageWithSkeleton
              src={post.cover_image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          </div>
        ) : (
          <PhotoPlaceholder label={meta.photo} tone={meta.tone} className="aspect-video" />
        )}
        <div className="p-4.5">
          <p className={`mb-2 font-mono text-[10px] font-bold tracking-[0.1em] ${meta.text}`}>
            {meta.label} · {relativeDays(post.published_at)}
          </p>
          <h3 className="mb-2 font-display text-[27px] leading-[0.95] text-tinta">{post.title}</h3>
          {post.excerpt && (
            <p className="font-body text-xs leading-relaxed text-tinta/60">{post.excerpt}</p>
          )}
          <span className={`mt-2.5 inline-block font-body text-xs font-bold underline ${meta.text}`}>
            Ver más
          </span>
        </div>
      </article>
    </Link>
  );
}
