// Posiciones de jugador. Deben coincidir con las claves de agrupación de
// components/futbol/SquadGrid.tsx (GROUPS) para que el plantel público agrupe bien.
// Vive en un módulo plano (no "use server") para poder importarse desde el form cliente.
export const POSITIONS = [
  "Portero",
  "Defensa",
  "Mediocampista",
  "Delantero",
  "Cuerpo técnico",
] as const;

// El cuerpo técnico no lleva dorsal numérico: usa `staff_role` (siglas del cargo, ej.
// "DT", "PF", "AC"). El form y la action ramifican según esta constante.
export const STAFF_POSITION = "Cuerpo técnico";
