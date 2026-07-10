import Link from "next/link";
import { getAllPosts } from "@/lib/supabase/queries/posts";

const CATEGORY_LABEL: Record<string, { label: string; className: string }> = {
  noticia: { label: "NOTICIA", className: "text-azul-marino" },
  cronica: { label: "CRÓNICA", className: "text-rojo-bandera" },
  aviso: { label: "AVISO", className: "text-dorado-escudo" },
  cantico: { label: "CÁNTICO", className: "text-rojo-bandera" },
};

function isPublished(publishedAt: string | null) {
  return !!publishedAt && new Date(publishedAt) <= new Date();
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
  });
}

export default async function AdminPostsPage() {
  const posts = await getAllPosts();
  const publishedCount = posts.filter((p) => isPublished(p.published_at)).length;
  const draftCount = posts.length - publishedCount;

  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b border-azul-marino/10 bg-white px-6 py-4">
        <div>
          <h1 className="font-display text-3xl text-tinta">POSTS</h1>
          <p className="font-mono text-[10px] text-tinta/45">
            {publishedCount} publicados · {draftCount} borradores
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-rojo-bandera px-4 py-2.5 font-body text-xs font-bold text-white transition-colors hover:bg-rojo-bandera-hover"
        >
          + Nuevo post
        </Link>
      </header>

      <div className="px-6 py-6">
        {posts.length === 0 ? (
          <p className="font-body text-sm text-tinta/55">
            Todavía no hay posts. Creá el primero con “Nuevo post”.
          </p>
        ) : (
          <ul className="overflow-hidden rounded-lg border border-azul-marino/12 bg-white">
            {posts.map((post) => {
              const published = isPublished(post.published_at);
              const cat = post.category ? CATEGORY_LABEL[post.category] : null;
              return (
                <li
                  key={post.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-azul-marino/8 px-4 py-3 first:border-t-0"
                >
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="min-w-0 flex-1 font-body text-sm font-semibold text-tinta hover:text-azul-marino"
                  >
                    <span className="line-clamp-1">{post.title}</span>
                  </Link>

                  {cat && (
                    <span className={`font-mono text-[9px] font-bold ${cat.className}`}>
                      {cat.label}
                    </span>
                  )}

                  <span
                    className={`rounded px-2 py-1 font-mono text-[9px] font-bold ${
                      published
                        ? "bg-[#1E8A5B]/12 text-[#1E8A5B]"
                        : "bg-tinta/8 text-tinta/50"
                    }`}
                  >
                    {published ? "● PUBLICADO" : "○ BORRADOR"}
                  </span>

                  <span className="w-14 text-right font-mono text-[10px] text-tinta/50">
                    {formatDate(post.published_at)}
                  </span>

                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="font-mono text-[10px] font-semibold text-azul-marino hover:underline"
                  >
                    EDITAR
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
