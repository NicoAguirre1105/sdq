// Ecuador continental: zona fija UTC-5, sin horario de verano. Los partidos se
// guardan como instante UTC (timestamptz) y SIEMPRE se muestran/editan en hora de
// Quito, sin importar la zona del server (Vercel corre en UTC) ni del navegador.
const QUITO_TZ = "America/Guayaquil";

// Devuelve null si el partido no tiene fecha confirmada.
export function formatMatchDate(iso: string | null | undefined) {
  if (!iso) return null;
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat("es-EC", {
    timeZone: QUITO_TZ,
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
    .format(date)
    .replace(/\./g, "")
    .toUpperCase();
  const time = new Intl.DateTimeFormat("es-EC", {
    timeZone: QUITO_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
  return { day, time };
}

// timestamptz ISO → valor para <input type="datetime-local"> en hora de Quito.
export function toQuitoInput(iso: string | null) {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: QUITO_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

// datetime-local (hora de Quito, sin zona) → ISO UTC. Ecuador es fijo UTC-5.
export function quitoInputToISO(naive: string) {
  return new Date(`${naive}:00-05:00`).toISOString();
}
