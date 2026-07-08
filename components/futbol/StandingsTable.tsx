import type { StandingRow } from "@/lib/supabase/queries/standings";

// Columnas fijas (no scrollean). left/w en px para poder anclarlas con position: sticky.
const STICKY = [
  { key: "position", label: "#", left: 0, w: 34, align: "center" },
  { key: "name", label: "EQUIPO", left: 34, w: 104, align: "left" },
  { key: "played", label: "PJ", left: 138, w: 42, align: "center" },
  { key: "points", label: "PTS", left: 180, w: 48, align: "center" },
] as const;

// Columnas que scrollean horizontalmente en mobile.
const SCROLL = [
  { key: "won", label: "G" },
  { key: "drawn", label: "E" },
  { key: "lost", label: "P" },
  { key: "goals_for", label: "GF" },
  { key: "goals_against", label: "GC" },
  { key: "goal_diff", label: "DG" },
] as const;

const OWN_BG = "#f2ebd8"; // dorado-escudo/12 aplanado sobre blanco-hueso, opaco para el sticky
const BASE_BG = "#f7f5f0"; // blanco-hueso

export function StandingsTable({ rows }: { rows: StandingRow[] }) {
  if (!rows.length) {
    return (
      <p className="font-body text-sm text-tinta/50">
        La tabla se actualiza al jugarse la primera fecha.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[480px] border-collapse text-left">
        <thead>
          <tr className="font-mono text-[10px] tracking-[0.06em] text-tinta/50">
            {STICKY.map((c, i) => (
              <th
                key={c.key}
                className={`sticky z-10 border-b-2 border-azul-marino/15 py-2 font-normal ${
                  c.align === "left" ? "pr-2 text-left" : "text-center"
                }`}
                style={{
                  left: c.left,
                  minWidth: c.w,
                  width: c.w,
                  background: BASE_BG,
                  ...(i === STICKY.length - 1
                    ? { borderRight: "1px solid rgba(11,46,107,0.12)" }
                    : {}),
                }}
              >
                {c.label}
              </th>
            ))}
            {SCROLL.map((c) => (
              <th
                key={c.key}
                className="border-b-2 border-azul-marino/15 px-2 py-2 text-center font-normal"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="font-body text-sm">
          {rows.map((r) => {
            const rowBg = r.is_own_team ? OWN_BG : BASE_BG;
            return (
              <tr key={r.team_id}>
                {STICKY.map((c, i) => (
                  <td
                    key={c.key}
                    className={`sticky z-10 border-b border-azul-marino/8 py-2.5 ${
                      c.key === "name"
                        ? `pr-2 font-display text-base tracking-[0.02em] ${
                            r.is_own_team ? "text-azul-marino" : "text-tinta"
                          }`
                        : c.key === "points"
                          ? "text-center font-mono text-sm font-bold text-azul-marino tabular-nums"
                          : c.key === "position"
                            ? "text-center font-mono text-xs text-tinta/60"
                            : "text-center tabular-nums text-tinta/70"
                    }`}
                    style={{
                      left: c.left,
                      minWidth: c.w,
                      width: c.w,
                      background: rowBg,
                      ...(i === STICKY.length - 1
                        ? { borderRight: "1px solid rgba(11,46,107,0.12)" }
                        : {}),
                    }}
                  >
                    {c.key === "name" ? r.name.toUpperCase() : r[c.key]}
                  </td>
                ))}
                {SCROLL.map((c) => (
                  <td
                    key={c.key}
                    className="border-b border-azul-marino/8 px-2 py-2.5 text-center tabular-nums text-tinta/70"
                    style={{ background: rowBg }}
                  >
                    {r[c.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
