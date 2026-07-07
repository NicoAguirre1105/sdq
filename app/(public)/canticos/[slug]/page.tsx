import Link from "next/link";
import { notFound } from "next/navigation";
import { CANTICOS, getCantico, youtubeEmbedUrl } from "@/lib/canticos";

export function generateStaticParams() {
  return CANTICOS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cantico = getCantico(slug);
  return { title: cantico ? `${cantico.title} — Cánticos` : "Cántico no encontrado" };
}

export default async function CanticoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cantico = getCantico(slug);
  if (!cantico) notFound();

  const others = CANTICOS.filter((c) => c.slug !== cantico.slug).slice(0, 4);
  const embedUrl = cantico.youtubeUrl && youtubeEmbedUrl(cantico.youtubeUrl, cantico.startSeconds);
  const watchUrl =
    cantico.youtubeUrl &&
    `${cantico.youtubeUrl}${cantico.startSeconds ? `&t=${cantico.startSeconds}s` : ""}`;

  return (
    <div className="bg-azul-marino">
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 md:grid-cols-[1fr_320px] mb-10">
        {/* Letra */}
        <div className="min-h-[90vh] px-4.5 py-7 md:px-10 md:py-9">
          <div className="mb-3.5 flex items-center gap-2 font-mono text-[11px] font-semibold text-blanco-hueso/50">
            <Link href="/canticos" className="transition-colors hover:text-dorado-escudo">
              ← CÁNTICOS
            </Link>
            <span>/</span>
            <span className="text-dorado-escudo">{cantico.title.toUpperCase()}</span>
          </div>
          <p className="mb-1.5 font-mono text-[11px] font-semibold tracking-[0.14em] text-dorado-escudo">
            {cantico.classic ? "CÁNTICO CLÁSICO" : "CÁNTICO"}
          </p>
          <h1 className="mb-6 font-display text-[52px] leading-[0.84] text-blanco-hueso md:text-[68px]">
            {cantico.title}
          </h1>

          <div className="font-display text-2xl leading-[1.5] tracking-[0.02em] md:text-[26px]">
            {cantico.lines.map((line, i) => (
              <p
                key={i}
                className={line.role === "llamada" ? "text-rojo-bandera" : "text-blanco-hueso"}
              >
                {line.text}
              </p>
            ))}
          </div>
        </div>

        {/* Sidebar: video + más cánticos */}
        <aside className="border-t border-white/8 bg-[#081f49] px-4.5 py-6 md:border-t-0 md:border-l md:px-6 md:py-7">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${cantico.title} — YouTube`}
              className="mb-4 aspect-video w-full rounded-lg border-0"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="mb-4 flex aspect-video items-center justify-center rounded-lg bg-[repeating-linear-gradient(125deg,#0B2E6B,#0B2E6B_14px,#12408c_14px,#12408c_28px)]">
              <p className="px-4 text-center font-mono text-[10px] font-semibold text-blanco-hueso/40">
                [ REEMPLAZAR POR EL VIDEO OFICIAL DEL CÁNTICO ]
              </p>
            </div>
          )}

          {watchUrl && (
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-md bg-rojo-bandera px-4 py-3 font-body text-xs font-bold text-white transition-colors hover:bg-rojo-bandera-hover"
            >
              ▶ Ver en YouTube
            </a>
          )}

          {others.length > 0 && (
            <>
              <p className="mt-6 mb-1 font-mono text-[10px] font-semibold text-blanco-hueso/50">
                MÁS CÁNTICOS
              </p>
              {others.map((c) => (
                <Link
                  key={c.slug}
                  href={`/canticos/${c.slug}`}
                  className="block border-t border-white/8 py-2 font-display text-xl leading-none text-blanco-hueso transition-colors hover:text-dorado-escudo"
                >
                  {c.title.toUpperCase()}
                </Link>
              ))}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
