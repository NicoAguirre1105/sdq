import Link from "next/link";
import { getPublishedPosts } from "@/lib/supabase/queries/posts";
import { getAllSubscribers } from "@/lib/supabase/queries/subscribers";
import { getNextMatch } from "@/lib/supabase/queries/matches";
import { getSiteSettings } from "@/lib/supabase/queries/settings";
import { getOrders } from "@/lib/supabase/queries/orders";
import { HeroContentForm } from "@/components/admin/HeroContentForm";
import { formatMatchDate } from "@/lib/format";
import { DEFAULT_HERO_HEADLINE, DEFAULT_HERO_SUBTITLE } from "@/lib/hero-defaults";

function todayLabel() {
  return new Date()
    .toLocaleDateString("es-EC", { weekday: "short", day: "2-digit", month: "short" })
    .replace(/\./g, "")
    .toUpperCase();
}

export default async function AdminDashboard() {
  const [{ total: postsTotal }, subscribers, nextMatch, settings, { total: ordersTotal }] =
    await Promise.all([
      getPublishedPosts(1, 1),
      getAllSubscribers(),
      getNextMatch(),
      getSiteSettings(),
      getOrders(1, 1),
    ]);
  const confirmedCount = subscribers.filter((s) => s.confirmed).length;
  const dt = nextMatch ? formatMatchDate(nextMatch.match_date) : null;
  const hasNextMatch = nextMatch?.homeTeam && nextMatch?.awayTeam;

  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b border-azul-marino/10 bg-white px-6 py-4">
        <div>
          <h1 className="font-display text-3xl text-tinta">DASHBOARD</h1>
          <p className="font-mono text-[10px] text-tinta/45">{todayLabel()}</p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-md bg-azul-marino px-4 py-2.5 font-body text-xs font-bold text-white transition-colors hover:bg-azul-marino/90"
        >
          Ver sitio
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 17 17 7M7 7h10v10" />
          </svg>
        </a>
      </header>

      <div className="flex flex-col gap-5 px-6 py-6">
        <div className="grid grid-cols-3 gap-3.5 md:max-w-2xl">
          <div className="rounded-lg border border-azul-marino/12 bg-white p-4">
            <p className="font-mono text-[10px] tracking-[0.08em] text-tinta/50 uppercase">
              Posts publicados
            </p>
            <p className="mt-1.5 font-display text-4xl text-azul-marino">{postsTotal}</p>
          </div>
          <div className="rounded-lg border border-azul-marino/12 bg-white p-4">
            <p className="font-mono text-[10px] tracking-[0.08em] text-tinta/50 uppercase">
              Suscriptores
            </p>
            <p className="mt-1.5 font-display text-4xl text-azul-marino">{subscribers.length}</p>
            <p className="mt-0.5 font-mono text-[10px] text-[#1E8A5B]">
              {confirmedCount} confirmados
            </p>
          </div>
          <div className="rounded-lg border border-azul-marino/12 bg-white p-4">
            <p className="font-mono text-[10px] tracking-[0.08em] text-tinta/50 uppercase">
              Pedidos
            </p>
            <p className="mt-1.5 font-display text-4xl text-azul-marino">{ordersTotal}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          {hasNextMatch && (
            <div className="rounded-lg bg-azul-marino p-5">
              <p className="font-mono text-[10px] tracking-[0.1em] text-dorado-escudo">
                PRÓXIMO PARTIDO
              </p>
              <p className="mt-1 font-display text-3xl text-blanco-hueso">
                {(nextMatch!.homeTeam!.short_name ?? nextMatch!.homeTeam!.name).toUpperCase()} vs{" "}
                {(nextMatch!.awayTeam!.short_name ?? nextMatch!.awayTeam!.name).toUpperCase()}
              </p>
              <p className="mt-1.5 font-mono text-[11px] text-blanco-hueso/70">
                {dt ? `${dt.day} · ${dt.time}` : "Sin confirmar"}
              </p>
              <Link
                href={`/admin/futbol?stage=${nextMatch!.stage_id}&match=${nextMatch!.id}`}
                className="mt-3.5 inline-block rounded-md bg-rojo-bandera px-4 py-2 font-body text-xs font-bold text-white transition-colors hover:bg-rojo-bandera-hover"
              >
                Editar partido
              </Link>
            </div>
          )}

          <div className="rounded-lg border border-azul-marino/12 bg-white p-4.5">
            <p className="mb-2.5 font-display text-xl text-tinta">ACCIONES RÁPIDAS</p>
            <div className="flex flex-col gap-2">
              <Link
                href="/admin/posts/new"
                className="font-body text-xs font-bold text-azul-marino transition-colors hover:text-rojo-bandera"
              >
                + Nuevo post
              </Link>
              <Link
                href="/admin/futbol"
                className="font-body text-xs font-bold text-azul-marino transition-colors hover:text-rojo-bandera"
              >
                + Cargar partido
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-azul-marino/12 bg-white p-4.5 md:max-w-2xl">
          <p className="mb-2.5 font-display text-xl text-tinta">HERO DE HOME</p>
          <HeroContentForm
            headline={settings?.hero_headline ?? DEFAULT_HERO_HEADLINE}
            subtitle={settings?.hero_subtitle ?? DEFAULT_HERO_SUBTITLE}
          />
        </div>
      </div>
    </>
  );
}
