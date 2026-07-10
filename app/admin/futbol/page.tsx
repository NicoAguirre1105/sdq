import Link from "next/link";
import { getAdminStages } from "@/lib/supabase/queries/competitions";
import { getStageMatches, getMatchById } from "@/lib/supabase/queries/matches";
import { getStandings } from "@/lib/supabase/queries/standings";
import { getAllTeams, getStageTeams } from "@/lib/supabase/queries/teams";
import { formatMatchDate } from "@/lib/format";
import { MatchForm } from "@/components/admin/MatchForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteStage } from "@/lib/actions/stages";

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
    return (
      <MatchForm
        stageId={selected.stageId}
        stageFormat={selected.format}
        stageLabel={stageLabel(selected)}
        teams={teams}
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
        {/* Selector de stage */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[9px] tracking-[0.14em] text-tinta/45 uppercase">
            Stage
          </span>
          {stages.map((s) => {
            const active = s.stageId === selected.stageId;
            return (
              <Link
                key={s.stageId}
                href={`/admin/futbol?stage=${s.stageId}`}
                className={`flex items-center gap-2 rounded-md border px-3 py-1.5 font-body text-xs font-semibold transition-colors ${
                  active
                    ? "border-azul-marino bg-azul-marino text-white"
                    : "border-azul-marino/16 text-tinta/70 hover:border-azul-marino/40"
                }`}
              >
                {stageLabel(s)}
                <span
                  className={`font-mono text-[7px] font-bold tracking-wide ${
                    active ? "text-dorado-escudo" : "text-tinta/35"
                  }`}
                >
                  {s.format === "liga" ? "LIGA" : "ELIM"}
                </span>
              </Link>
            );
          })}
          <DeleteButton
            action={deleteStage}
            id={selected.stageId}
            label="Eliminar este stage"
            message={`¿Eliminar "${stageLabel(selected)}"? Se borran también sus partidos y su tabla. No se puede deshacer.`}
            className="ml-auto font-mono text-[10px] font-bold text-rojo-bandera hover:underline"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Partidos */}
          <div className="min-w-0">
            <div className="mb-3 font-display text-xl text-tinta">PARTIDOS</div>
            {matches.length === 0 ? (
              <p className="font-body text-sm text-tinta/55">
                Sin partidos cargados en este stage.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-azul-marino/12 bg-white">
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
      </div>
    </>
  );
}
