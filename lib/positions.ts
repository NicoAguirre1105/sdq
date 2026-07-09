// Posiciones de jugador. Deben coincidir con las claves de agrupación de
// components/futbol/SquadGrid.tsx (GROUPS) para que el plantel público agrupe bien.
// Vive en un módulo plano (no "use server") para poder importarse desde el form cliente.
export const POSITIONS = ["Portero", "Defensa", "Mediocampista", "Delantero"] as const;
