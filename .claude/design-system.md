# Sistema de diseño — SD Quito

Tono: **de hinchada** (trapos, tribuna, barra) — no editorial neutro ni "app deportiva" genérica. El diseño ya fue trabajado y validado en Claude Design; este documento es la referencia de tokens e intención para que la implementación en código sea fiel.

## Color

| Token | Hex | Uso |
|---|---|---|
| `--azul-marino` | `#0B2E6B` | Fondo principal (hero, secciones oscuras) |
| `--rojo-bandera` | `#C81D25` | Acento primario: CTAs, marcadores, tags, elementos que necesitan destacar |
| `--blanco-hueso` | `#F7F5F0` | Texto sobre azul, fondos claros. Blanco cálido, no clínico/puro |
| `--azul-medio` | `#1E56B0` | Hover states, acentos secundarios |
| `--tinta` | `#14171C` | Texto sobre fondo claro |
| `--dorado-escudo` | `#C9A227` | Acento puntual (detalle del borde dorado del escudo real). Solo para detalles pequeños — eyebrows, tags, bordes finos. Nunca para bloques grandes |

Regla: azul/rojo/blanco son la base obligatoria (definido por el usuario). El dorado es un cuarto acento opcional para jerarquía, a validar contra el mockup final de Claude Design — si el mockup no lo usa, no forzarlo.

## Tipografía

| Rol | Familia | Uso |
|---|---|---|
| **Display** | Condensada, gruesa, con carácter (referencia: Anton / Bebas Neue, o algo con más personalidad si se encuentra) | Titulares, nombres de sección, marcadores grandes |
| **Body** | Grotesk limpio (referencia: Inter / IBM Plex Sans) | Texto corrido, párrafos, UI |
| **Utility/data** | Monoespaciada (referencia: JetBrains Mono) | Marcadores, tabla de posiciones, fechas, timestamps — sensación de "tablero de estadio" |

Contraste deliberado entre display (crudo, pintado a brocha) y body (limpio, legible) es intencional — no unificar.

## Layout y elemento de firma

- **Borde rasgado/deshilachado (SVG):** simula el filo de un trapo de tribuna. Se usa como transición entre el hero y el contenido, y se reutiliza entre secciones de Historia y en las tarjetas de Barras.
- **Texturas sutiles:** patrones diagonales muy tenues (tipo tela/graderío) en fondos oscuros, no ruido visual dominante.
- **Jerarquía de tarjetas:** tag/categoría en la esquina superior (fondo rojo, texto blanco, mono, uppercase) + título en display + descripción en body.

## Fuente de verdad

El **mockup de Claude Design es la referencia visual final** — este documento describe la intención y los tokens
