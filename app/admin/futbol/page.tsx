import Link from "next/link";
import { getAdminStages } from "@/lib/supabase/queries/competitions";
import { getStageMatches, getMatchById } from "@/lib/supabase/queries/matches";
import { getStandings } from "@/lib/supabase/queries/standings";
import { getAllTeams, getStageTeams } from "@/lib/supabase/queries/teams";
import { formatMatchDate } from "@/lib/format";
import { MatchForm } from "@/components/admin/MatchForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteStage, toggleStageFinished } from "@/lib/actions/stages";
import { TabbedContent } from "@/components/ui/TabbedContent";
import { MatchListSkeleton } from "@/components/ui/MatchListSkeleton";
import { TableSkeleton } from "@/components/ui/TableSkeleton";

const STATUS_STYLE: Record<string, string> = {
  jugado: "bg-[#1E8A5B]/12 text-[#1E8A5B]",
  programado: "bg-azul-marino/10 text-azul-marino",
  suspendido: "bg-tinta/8 text-tinta/50",
};

function stageLabel(s: {
  seasonLabel: string;
  competitionName: string;
  stageName: string;
}) {
  return [s.seasonLabel, s.competitionName, s.stageName].filter(Boolean).join(" · ");
}

// ponytail: sin loading.tsx / <Suspense> de Server Components acá — dejaban el
// fallback pegado para siempre (bug reproducido con Next 16.2.10 + Turbopack, ver
// progreso.md). El loading state del selector de stage es 100% client-side vía
// TabbedContent (useTransition), que no usa streaming de RSC.
export default async function AdminFutbolPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; match?: string }>;
}) {
  const { stage, match } = await searchParams;
  const stages = await getAdminStages();

  if (stages.length === 0) {
    return (
      <div className="px-6 py-8">
        <h1 className="font-display text-3xl text-tinta">FÚTBOL</h1>
        <p className="mt-3 font-body text-sm text-tinta/55">
          Todavía no hay tablas ni llaves cargadas. Cargá los equipos y creá el primer
          stage; las competiciones se crean en Supabase.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/admin/futbol/equipos"
            className="rounded-md border border-azul-marino/16 px-3.5 py-2.5 font-body text-xs font-bold text-azul-marino transition-colors hover:border-azul-marino"
          >
            Equipos (catálogo)
          </Link>
          <Link
            href="/admin/futbol/stage/new"
            className="rounded-md bg-rojo-bandera px-4 py-2.5 font-body text-xs font-bold text-white transition-colors hover:bg-rojo-bandera-hover"
          >
            + Nueva tabla / stage
          </Link>
        </div>
      </div>
    );
  }

  const selected = stages.find((s) => s.stageId === stage) ?? stages[0];
  const backHref = `/admin/futbol?stage=${selected.stageId}`;

  // Formulario de crear/editar partido.
  if (match) {
    // Liga: solo los equipos inscritos en este stage. Eliminación no tiene lista
    // fija (se define ronda a ronda) y usa el catálogo completo. Si un stage liga
    // quedó sin stage_teams cargados (dato viejo/manual), cae al catálogo completo
    // en vez de bloquear la carga de partidos.
    const stageTeams =
      selected.format === "liga" ? await getStageTeams(selected.stageId) : [];
    const teams = stageTeams.length ? stageTeams : await getAllTeams();
    const existing = match !== "new" ? await getMatchById(match) : null;
    // Candidatos de "ida" para vincular una vuelta: partidos del mismo stage con
    // leg=1 sin una vuelta real ya enlazada. No alcanza con "tie_id nulo": un
    // tie_id puede quedar huérfano (ver deleteMatch) sin que exista ninguna otra
    // fila con ese mismo tie_id — en ese caso sigue siendo candidata válida.
    const idaCandidates = await (async () => {
      if (selected.format !== "eliminacion") return [];
      const stageMatches = await getStageMatches(selected.stageId);
      const tieIdCounts = new Map<string, number>();
      stageMatches.forEach((m) => {
        if (m.tie_id) tieIdCounts.set(m.tie_id, (tieIdCounts.get(m.tie_id) ?? 0) + 1);
      });
      return stageMatches
        .filter(
          (m) =>
            m.leg === 1 &&
            m.id !== existing?.id &&
            (!m.tie_id || (tieIdCounts.get(m.tie_id) ?? 0) < 2)
        )
        .map((m) => ({
          id: m.id,
          label: `${m.round_name ?? "—"} · ${(m.homeTeam?.name ?? "?")} vs ${(m.awayTeam?.name ?? "?")}`,
        }));
    })();
    return (
      <MatchForm
        stageId={selected.stageId}
        stageFormat={selected.format}
        stageBracketMode={selected.bracketMode}
        stageLabel={stageLabel(selected)}
        teams={teams}
        idaCandidates={idaCandidates}
        backHref={backHref}
        match={existing ?? undefined}
      />
    );
  }

  const [matches, standings] = await Promise.all([
    getStageMatches(selected.stageId),
    selected.format === "liga" ? getStandings(selected.stageId) : Promise.resolve([]),
  ]);

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-azul-marino/10 bg-white px-6 py-4">
        <div>
          <h1 className="font-display text-3xl text-tinta">FÚTBOL</h1>
          <p className="font-mono text-[10px] text-tinta/45">
            Gestión de torneos y partidos
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/futbol/competiciones"
            className="rounded-md border border-azul-marino/16 px-3.5 py-2.5 font-body text-xs font-bold text-azul-marino transition-colors hover:border-azul-marino"
          >
            Competiciones
          </Link>
          <Link
            href="/admin/futbol/equipos"
            className="rounded-md border border-azul-marino/16 px-3.5 py-2.5 font-body text-xs font-bold text-azul-marino transition-colors hover:border-azul-marino"
          >
            Equipos (catálogo)
          </Link>
          <Link
            href="/admin/futbol/stage/new"
            className="rounded-md border border-azul-marino/16 px-3.5 py-2.5 font-body text-xs font-bold text-azul-marino transition-colors hover:border-azul-marino"
          >
            + Nueva tabla / stage
          </Link>
          <Link
            href={`/admin/futbol?stage=${selected.stageId}&match=new`}
            className="rounded-md bg-rojo-bandera px-4 py-2.5 font-body text-xs font-bold text-white transition-colors hover:bg-rojo-bandera-hover"
          >
            + Cargar partido
          </Link>
        </div>
      </header>

      <div className="px-6 py-6">
        <TabbedContent
          navClassName="mb-6 flex flex-wrap items-center gap-2"
          prefix={
            <span className="font-mono text-[9px] tracking-[0.14em] text-tinta/45 uppercase">
              Stage
            </span>
          }
          suffix={
            <div className="ml-auto flex items-center gap-3">
              <form action={toggleStageFinished}>
                <input type="hidden" name="id" value={selected.stageId} />
                <input type="hidden" name="next" value={String(!selected.isFinished)} />
                <button
                  type="submit"
                  className={`rounded-md border px-3 py-1.5 font-mono text-[10px] font-bold uppercase transition-colors ${
                    selected.isFinished
                      ? "border-[#1E8A5B]/40 bg-[#1E8A5B]/10 text-[#1E8A5B]"
                      : "border-azul-marino/16 text-tinta/60 hover:border-azul-marino/40"
                  }`}
                >
                  {selected.isFinished ? "✓ Finalizado" : "Marcar como finalizado"}
                </button>
              </form>
              <DeleteButton
                action={deleteStage}
                id={selected.stageId}
                label="Eliminar este stage"
                message={`¿Eliminar "${stageLabel(selected)}"? Se borran también sus partidos y su tabla. No se puede deshacer.`}
                className="font-mono text-[10px] font-bold text-rojo-bandera hover:underline"
              />
            </div>
          }
          fallback={<AdminFutbolFallback />}
          tabs={stages.map((s) => {
            const active = s.stageId === selected.stageId;
            return {
              key: s.stageId,
              href: `/admin/futbol?stage=${s.stageId}`,
              active,
              className: `flex items-center gap-2 rounded-md border px-3 py-1.5 font-body text-xs font-semibold transition-colors ${
                active
                  ? "border-azul-marino bg-azul-marino text-white"
                  : "border-azul-marino/16 text-tinta/70 hover:border-azul-marino/40"
              }`,
              label: (
                <>
                  {stageLabel(s)}
                  <span
                    className={`font-mono text-[7px] font-bold tracking-wide ${
                      active ? "text-dorado-escudo" : "text-tinta/35"
                    }`}
                  >
                    {s.format === "liga" ? "LIGA" : "ELIM"}
                  </span>
                </>
              ),
            };
          })}
        >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Partidos */}
          <div className="min-w-0">
            <div className="mb-3 font-display text-xl text-tinta">PARTIDOS</div>
            {matches.length === 0 ? (
              <p className="font-body text-sm text-tinta/55">
                Sin partidos cargados en este stage.
              </p>
            ) : (
              <div className="no-scrollbar overflow-x-auto rounded-lg border border-azul-marino/12 bg-white">
                <ul className="min-w-[620px]">
                  {matches.map((m) => {
                    const when = formatMatchDate(m.match_date);
                    const played = m.score_home != null && m.score_away != null;
                    return (
                      <li
                        key={m.id}
                        className="flex items-center gap-4 border-t border-azul-marino/8 px-4 py-3 first:border-t-0"
                      >
                        <span className="w-12 flex-none font-mono text-[10px] text-tinta/50">
                          {selected.format === "liga"
                            ? m.matchday != null
                              ? `F${m.matchday}`
                              : "—"
                            : m.round_name ?? "—"}
                        </span>
                        <Link
                          href={`/admin/futbol?stage=${selected.stageId}&match=${m.id}`}
                          className="min-w-[190px] flex-1 font-body text-sm font-semibold text-tinta hover:text-azul-marino"
                        >
                          <span className="line-clamp-1">
                            {m.homeTeam?.name ?? "?"}{" "}
                            <span className="font-mono text-tinta/40">
                              {played ? `${m.score_home}-${m.score_away}` : "vs"}
                            </span>{" "}
                            {m.awayTeam?.name ?? "?"}
                          </span>
                        </Link>
                        <span className="w-28 flex-none text-right font-mono text-[10px] text-tinta/50">
                          {when ? `${when.day} ${when.time}` : "Sin confirmar"}
                        </span>
                        <span
                          className={`w-24 flex-none text-center rounded px-2 py-1 font-mono text-[9px] font-bold uppercase ${
                            STATUS_STYLE[m.status] ?? "bg-tinta/8 text-tinta/50"
                          }`}
                        >
                          {m.status}
                        </span>
                        <Link
                          href={`/admin/futbol?stage=${selected.stageId}&match=${m.id}`}
                          className="w-14 flex-none text-right font-mono text-[10px] font-semibold text-azul-marino hover:underline"
                        >
                          EDITAR
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Standings (solo lectura, solo liga) */}
          {selected.format === "liga" && (
            <div>
              <div className="mb-3 font-display text-xl text-tinta">TABLA</div>
              <div className="overflow-hidden rounded-lg border border-azul-marino/12 bg-white">
                <div className="grid grid-cols-[26px_1fr_30px_34px] bg-azul-marino font-mono text-[9px] font-bold text-white/75">
                  <div className="py-2 text-center">#</div>
                  <div className="py-2 pl-2.5">EQUIPO</div>
                  <div className="py-2 text-center">PJ</div>
                  <div className="py-2 text-center text-dorado-escudo">PTS</div>
                </div>
                {standings.length === 0 ? (
                  <p className="px-3 py-3 font-body text-xs text-tinta/50">
                    Se llena sola con los partidos jugados.
                  </p>
                ) : (
                  standings.map((row) => (
                    <div
                      key={row.team_id}
                      className={`grid grid-cols-[26px_1fr_30px_34px] border-t border-azul-marino/8 font-mono text-[11px] ${
                        row.is_own_team ? "bg-rojo-bandera/5 font-bold" : ""
                      }`}
                    >
                      <div className="py-2 text-center text-tinta/50">
                        {row.position}
                      </div>
                      <div className="truncate py-2 pl-2.5 font-body text-tinta">
                        {row.name}
                      </div>
                      <div className="py-2 text-center text-tinta/60">
                        {row.played}
                      </div>
                      <div className="py-2 text-center font-bold text-azul-marino">
                        {row.points}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <p className="mt-2.5 font-mono text-[9px] leading-relaxed text-tinta/40">
                Refleja la tabla pública. No se edita a mano — sale de los partidos
                jugados.
              </p>
            </div>
          )}
        </div>
        </TabbedContent>
      </div>
    </>
  );
}

function AdminFutbolFallback() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="overflow-hidden rounded-lg border border-azul-marino/12 bg-white px-4">
        <MatchListSkeleton rows={6} />
      </div>
      <TableSkeleton rows={5} />
    </div>
  );
}
