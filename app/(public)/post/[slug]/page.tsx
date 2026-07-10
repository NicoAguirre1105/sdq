import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PhotoPlaceholder } from "@/components/ui/PhotoPlaceholder";
import { getPostBySlug } from "@/lib/supabase/queries/posts";
import { renderMarkdown } from "@/lib/markdown";

const CATEGORY = {
  cronica: { label: "CRÓNICA", text: "text-rojo-bandera", photo: "FOTO PARTIDO", tone: "azul" },
  noticia: { label: "NOTICIA", text: "text-azul-marino", photo: "FOTO JUGADOR", tone: "rojo" },
  aviso: { label: "AVISO", text: "text-dorado-escudo", photo: "ARTE AVISO", tone: "dorado" },
  cantico: { label: "CÁNTICO", text: "text-rojo-bandera", photo: "ARTE CÁNTICO", tone: "rojo" },
} as const;

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso)
    .toLocaleDateString("es-EC", { day: "2-digit", month: "long", year: "numeric" })
    .toUpperCase();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post no encontrado" };
  return {
    title: `${post.title} | Mafia Azul Grana`,
    description: post.excerpt ?? undefined,
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const meta = CATEGORY[post.category ?? "noticia"];

  return (
    <article className="bg-blanco-hueso">
      <Container className="px-4.5 py-7 md:px-10 md:py-9">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3.5 flex items-center gap-2 font-mono text-sm font-semibold text-tinta/45">
            <Link
              href="/"
              className="flex items-center gap-1 transition-colors hover:text-tinta"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 19l-7-7 7-7" />
              </svg>
              INICIO
            </Link>
            <span>/</span>
            <span className={meta.text}>{meta.label}</span>
          </div>

          <p className={`mb-1.5 font-mono text-[11px] font-semibold tracking-[0.14em] ${meta.text}`}>
            {meta.label} · {formatDate(post.published_at)}
          </p>
          <h1 className="mb-6 font-display text-[44px] leading-[0.88] text-tinta md:text-[64px]">
            {post.title}
          </h1>

          {post.cover_image ? (
            <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <PhotoPlaceholder
              label={meta.photo}
              tone={meta.tone}
              className="mb-8 aspect-video w-full rounded-lg"
            />
          )}

          {post.excerpt && (
            <p className="mb-6 font-body text-lg leading-relaxed text-tinta/70">
              {post.excerpt}
            </p>
          )}
          <div
            className="font-body text-base leading-relaxed text-tinta [&_a]:text-azul-marino [&_a]:underline [&_h1]:mt-6 [&_h1]:font-display [&_h1]:text-3xl [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-2xl [&_h3]:mt-5 [&_h3]:font-display [&_h3]:text-xl [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-3 [&_strong]:font-bold"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content_md) }}
          />
        </div>
      </Container>
    </article>
  );
}
