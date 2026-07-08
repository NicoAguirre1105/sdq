// Devuelve null si el partido no tiene fecha confirmada.
export function formatMatchDate(iso: string | null | undefined) {
  if (!iso) return null;
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat("es-EC", { weekday: "short", day: "2-digit", month: "short" })
    .format(date)
    .replace(/\./g, "")
    .toUpperCase();
  const time = new Intl.DateTimeFormat("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return { day, time };
}
