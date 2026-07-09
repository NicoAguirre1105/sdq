# SD Quito — Resumen de páginas y gestión de contenido (Admin CMS)

Criterio usado para clasificar cada dato:

- **A — Estático en código**: casi no cambia, no justifica DB. MDX/TSX/JSON en el repo.
- **B — Supabase, sin UI de admin**: cambia poco (meses). Se edita directo en Supabase Studio.
- **C — Supabase + UI de admin**: cambia seguido o el error manual es costoso. Necesita pantalla dedicada.
- **—** No es "contenido CMS": es lógica de auth, estado de sesión, o vista derivada.

---

## Páginas públicas

| Página | Nivel | Fuente de datos | Notas |
|---|---|---|---|
| **Home** | C | tabla `posts` | CRUD completo desde admin |
| **Historia** | A | MDX/TSX en el repo | Cambia años, no meses |
| **Fútbol** (tabla de posiciones) | — (calculado) | vista `standings` sobre `matches` | No se edita directamente, se calcula |
| **Fútbol** (próximos partidos) | — (derivado) | `matches WHERE status = 'programado'` | Mismo query que calendario, filtrado |
| **Calendario** | — (derivado) | todos los `matches` de la `stage` activa | Una sola fuente para calendario + próximos + standings |
| **Cánticos** | A | MDX + video de youtube embed/`/public` | Estático, confirmado |
| **Tienda** (listado productos) | C | tabla `products` | CRUD + control de stock |
| **Detalle de producto** | — (derivado) | vista de `products` por slug | No es dato a gestionar aparte |
| **Carrito de compras** | — (transaccional) | `cart_items` / `orders`, estado de sesión | Lógica de e-commerce, no CMS |
| **Gestión de suscripción** (newsletter, pública) | — | tabla `subscribers` | Formulario de alta; gestión real vive en admin |
| **Not found** | A | código | — |
| **Plantilla** | B | tabla `players` | Cambia ~2 veces/año, se edita en Supabase Studio |
| **Login** | — | Supabase Auth | No gestiona contenido |

---

## Modelo de datos: Fútbol / Calendario

Se registran **todos los partidos de todos los equipos** de cada torneo/fase que juega SD Quito (no solo los del club). Esto permite calcular standings automáticamente en lugar de ingresarlos a mano.

```
seasons
  └── competitions   (torneo, ej. "Serie B 2026", "Copa Ecuador 2026")
        └── stages       (fase/tabla, ej. "Fase 1", "Grupo A", "Octavos de Final")
              ├── format: 'liga' | 'eliminacion'
              ├── stage_teams   (solo aplica si format = 'liga')
              ├── matches       (partidos; campos varían según format)
              └── standings     (vista calculada desde matches; solo aplica si format = 'liga')
```

- Si SD Quito clasifica de una fase a otra, sus partidos nuevos simplemente apuntan a otro `stage_id` — no hay migración de datos.
- `teams` es un catálogo maestro reutilizable entre stages y temporadas (nivel B: se agrega un equipo solo cuando aparece uno nuevo, ej. ascenso).

### Dos formatos de stage

**`liga`** (tabla de posiciones):
- Requiere `stage_teams` (equipos fijos participantes)
- `matches` usa `matchday`
- `standings` se calcula automáticamente desde los `matches` jugados

**`eliminacion`** (llaves/bracket):
- No requiere lista fija de equipos (los define el resultado de la ronda anterior)
- `matches` usa `round_name` (ej. "Cuartos de Final", "Semifinal", "Final") en vez de `matchday`
- Si la llave es ida y vuelta: dos filas de `matches` comparten un `tie_id`, con `leg` = 1 o 2, para calcular el marcador agregado
- No genera `standings` — la UI muestra bracket/llaves por ronda en su lugar

---

## Qué se gestiona en el Admin Panel

### 1. Posts (Home) — nivel C
- Crear, editar, eliminar, publicar/despublicar
- Campos: título, slug, extracto, contenido (markdown), categoría (noticia/crónica/aviso), imagen de portada

### 2. Fútbol — nivel C (la sección más compleja) — **IMPLEMENTADO** (ver detalle en `CLAUDE.md` → Fase 2)
- **Teams (catálogo):** crear/editar/eliminar equipo (nombre, nombre corto, escudo SVG → bucket `team_logos`). `is_own_team` **no** se edita desde el form (queda `false` al crear; se cambia a mano en Supabase).
- **Nueva tabla/stage** (`/admin/futbol/stage/new`): elegir `competition` existente → nombrar `stage` → **elegir formato** (`liga` o `eliminación`):
  - **Liga:** seleccionar equipos participantes (`stage_teams`) vía checkboxes
  - **Eliminación:** no pide equipos fijos; se van definiendo ronda a ronda
- **Competiciones/temporadas** (`/admin/futbol/competiciones`): alta/baja de `seasons` y `competitions` (antes solo en Supabase Studio).
- **Partidos:** cargar/editar por `stage` — el formulario cambia según formato:
  - **Liga:** local, visitante, fecha, `matchday`, marcador, status
  - **Eliminación:** local, visitante, fecha, `round_name`, marcador, status. **Falta** el ida/vuelta (`tie_id`/`leg`) y la vista de bracket.
- **Standings:** solo lectura (vista calculada), únicamente visible en stages de formato `liga`
- **Borrado en cascada:** eliminar temporada/competición/stage/equipo arrastra sus partidos (FK `on delete cascade`).

Layout real: pantalla única (`/admin/futbol`) con selector de stage arriba → partidos editables + standings al costado (solo `liga`); el editor de partido se abre con `?match=new|<id>` sobre la misma ruta.

### 3. Tienda — nivel C
- CRUD de productos: nombre, descripción, precio, stock, imágenes, categoría
- Vista de pedidos (`orders`): consulta/estado, no creación manual

### 4. Suscriptores (newsletter) — nivel C, panel ligero
- Listar, exportar CSV, eliminar
- Sin editor de contenido — es operativo, no editorial

### 5. Plantilla — nivel B — **IMPLEMENTADO** (`/admin/plantilla`)
- CRUD de jugadores reusando el patrón de posts/teams: nombre, posición (select con las 4 claves de `SquadGrid`), dorsal, bio markdown.
- **Foto opcional** subida al bucket `player_photos` (jpg/png/webp, ≤2 MB); sin foto la grilla pública usa `PhotoPlaceholder`.

---

## Pendiente por definir

- Schema completo de Supabase con tipos y relaciones (`teams`, `competitions`, `stages`, `matches`, `products`, `orders`, `cart_items`, `subscribers`, `players`)
