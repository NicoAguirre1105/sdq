# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

Sitio web para la hinchada de Sociedad Deportivo Quito (club de fútbol ecuatoriano, Segunda Categoría). No es un sitio oficial del club — es un portal hecho por/para la hinchada: noticias, historia, seguimiento deportivo (calendario, tablas de posiciones, llaves de eliminación), contenido de las barras (cánticos, banderas) y una tienda de merchandising.

## Stack técnico

- **Framework:** Next.js 16 (App Router) + TypeScript, React 19
- **Estilos:** Tailwind CSS v4 (tokens vía `@theme inline` en `app/globals.css`, no `tailwind.config.js`)
- **Backend/DB:** Supabase (Postgres + Auth + Storage), cliente vía `@supabase/ssr`
- **Deploy:** Vercel
- **Newsletter:** tabla `subscribers` en Supabase; alta con doble opt-in vía **Kit** ya integrada (`lib/kit.ts`, **API v3** para el alta). Kit manda el correo de verificación; un webhook (`app/api/kit/webhook/route.ts`) marca `confirmed = true`

## Comandos

```bash
npm run dev      # dev server, http://localhost:3000
npm run build
npm start
npm run lint      # eslint (flat config, next/core-web-vitals + next/typescript)
npx tsc --noEmit  # type-check (no hay script dedicado en package.json)
```

No hay test runner configurado todavía.

### Flujo de desarrollo y verificación (consciente del gasto de tokens)

- **Type-check con `npx tsc --noEmit` después de cambios no triviales** — el `Match`/`Database` tipado a mano detecta la mayoría de los errores de forma (ej. al volver `match_date` nullable, `tsc` fuerza a manejar el null en todos los consumidores). Es la primera red de seguridad, barata, antes de tocar el navegador.
- **Preview solo si el cambio es observable ahí.** Cambios de tipos, lógica de servidor, integraciones (Kit, etc.), scripts — `tsc` alcanza, no abrir preview. Solo abrir preview para verificar UI/estilos/interacción real en el navegador.
- **Nunca usar `preview_screenshot`.** El usuario revisa visualmente el resultado él mismo — no hace falta capturar imágenes (son el ítem más caro en tokens de las tools de preview). Verificar con las tools de **texto**: `preview_inspect` (valores CSS puntuales), `preview_snapshot` (estructura/contenido), `preview_console_logs level:error`, `preview_network filter:failed`.
- **Errores de datos aparecen como 500** en la ruta (ej. `column ... does not exist` cuando falta correr un `ALTER`). `preview_logs level:error` muestra el error de Postgres exacto; el buffer incluye entradas viejas de compilaciones previas, así que fijarse en la más reciente.
- **`fetch(...)` dentro de `preview_eval`: pedir solo lo necesario.** Para rutas de la app (páginas, endpoints), pedir únicamente `status` (`fetch(url).then(r => r.status)`) para confirmar que una query no rompió — nunca el body/HTML completo. La única excepción es leer los mockups de diseño en `public/design/*.html` (ver abajo), donde sí hace falta el HTML completo porque es la fuente del diseño a implementar.
- **Grep/Read acotado antes que Read completo.** Para archivos grandes, usar `Grep` con el patrón puntual o `Read` con `offset`/`limit` en vez de leer el archivo entero cuando alcanza con la porción relevante.
- **`ponytail:` es el modo por defecto de este repo** — preferir la solución más simple que funcione, reutilizar helpers/patrones existentes antes de escribir nuevos, y marcar simplificaciones deliberadas con un comentario `ponytail:` (ver abajo).
- **Verificar `/admin` (protegido) en el preview:** `.env.local` tiene una cuenta de staff dedicada a verificación (`DEV_ADMIN_EMAIL` / `DEV_ADMIN_PASSWORD`, sin prefijo `NEXT_PUBLIC_` — no llega al cliente). Para revisar cualquier pantalla del panel, loguear con `preview_fill`/`preview_click` contra el form real de `/login` usando esas credenciales (leídas del `.env.local` con `Read`); la sesión queda en cookies del tab de preview. Verificar el resultado con `preview_snapshot`/`preview_inspect`, no con screenshot. Es una cuenta de prueba separada de las cuentas reales de administradores.

### Supabase

El schema no usa migraciones incrementales — es un único `supabase/schema.sql` pensado para correrse una sola vez sobre un proyecto nuevo (cubre tablas de Fútbol/Tienda/Admin aunque esas secciones no tengan UI todavía, para evitar migraciones incómodas después). No existe `supabase/migrations/`.

```bash
# Setup de un proyecto nuevo: correr en orden en el SQL Editor de Supabase
supabase/schema.sql
supabase/seed.sql
```

Requiere `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

**Cómo se cambia el schema (proceso real, seguido hasta ahora):** al modificar el schema hay que tocar **tres lugares** y aplicar el cambio a mano — no hay automatización:
1. Editar `supabase/schema.sql` (fuente de verdad para instalaciones nuevas).
2. Editar `.claude/data-model.md` (el doc de schema, para que no quede desincronizado).
3. Actualizar a mano `lib/types/database.ts` (tipos manuales, ver abajo).
4. **El dueño del proyecto corre el `ALTER`/`CREATE` puntual en el SQL Editor del Supabase real** — Claude no tiene acceso de escritura a la DB (el `anon key` de `.env.local` está bloqueado por RLS). Entregar siempre el snippet SQL exacto para que lo corra, y del mismo modo entregar los `INSERT` de datos de ejemplo (no se pueden insertar desde el código). El seed en vivo puede divergir del `seed.sql` porque el dueño edita filas a mano (ej. poner fechas en null); no asumir que la DB en vivo coincide con `seed.sql`.

Cambios de schema aplicados a mano hasta ahora (más allá del `schema.sql` original):
- `matches.match_date` pasó a **nullable** (null = fecha sin confirmar) y se agregó `matches.created_at timestamptz default now()` como desempate de orden para partidos sin fecha (se listan al final, en orden de ingreso).
- **`on delete cascade` en toda la jerarquía Fútbol**: `competitions.season_id`, `stages.competition_id`, `stage_teams.stage_id/team_id`, `matches.stage_id/home_team_id/away_team_id`. Borrar una temporada arrastra competiciones → stages → partidos + stage_teams; borrar un equipo arrastra sus partidos y su lugar en las tablas. La UI de admin (borrar temporada/competición/stage/equipo) **confía** en esto. Se aplicó con `ALTER TABLE ... DROP CONSTRAINT ... ADD CONSTRAINT ... ON DELETE CASCADE`.
- **Bucket `team_logos`** (público, solo `image/svg+xml`, ≤1 MB) para escudos de equipos, con las mismas 4 policies de admin que `post-images` (insert/update/delete + **select**, esta última imprescindible para que `storage.remove()` borre). El bucket lo creó el dueño; las policies se corrieron a mano.
- **Bucket `player_photos`** (público, `image/jpeg`/`png`/`webp`, ≤2 MB) para fotos de jugadores (opcional; sin foto la grilla usa placeholder), con las mismas 4 policies de admin. Corrido a mano.

Los tipos de `lib/types/database.ts` están **tipados a mano**, solo las tablas/vistas que Fase 1 y Fase 2 consultan hasta ahora: `posts`, `players`, `subscribers`, `teams`, `matches`, `seasons`, `competitions`, `stages`, `admin_users` y la vista `standings`. Reemplazar por completo con `supabase gen types typescript` en cuanto el CLI esté conectado al proyecto real — no seguir extendiendo el archivo a mano más allá de eso.

## Documentos de contexto (leer según la tarea)

- `.claude/progreso.md` — changelog de lo construido fase por fase (qué existe, dónde vive, decisiones puntuales de cada feature). Leer solo si la tarea requiere saber si algo ya está hecho o retomar una fase — no es contexto de cada sesión.
- `.claude/design-system.md` — colores, tipografía, layout, elemento de firma visual
- `.claude/site-map.md` — todas las páginas/rutas y su propósito
- `.claude/data-model.md` — schema completo de Supabase con relaciones
- `.claude/admin-cms.md` — qué se gestiona en `/admin`, con qué nivel de esfuerzo, y cómo
- `.claude/coding-guidelines.md` — arquitectura de código, convenciones y puntos de extensión para escalabilidad futura (pagos reales, donaciones, más usuarios, categorías formativas)

Los mockups de diseño (Claude Design, ya usados para Fase 1/2) están en `public/design/*.html` — son bundles gzip+base64, no HTML plano; ver `.claude/progreso.md` para cómo extraerlos.

## Arquitectura

### Split público/admin vía route groups

`app/(public)/layout.tsx` es el único lugar donde se renderizan `Navbar` y `Footer`. El root `app/layout.tsx` solo trae fuentes y el `<html>/<body>`, sin chrome de sitio. Esto es deliberado: cuando se construya `/admin`, debe vivir en un segmento hermano (fuera de `(public)`) para no heredar ese layout — el admin no lleva navbar ni footer del sitio público.

### Capa de datos: nunca Supabase directo desde un componente

Todo acceso a datos pasa por `lib/supabase/queries/<dominio>.ts` (una función por consulta, ej. `getPublishedPosts`, `getNextMatch`, `getStandings`, `getLeagueStages`, `getOwnTeamMatches`, `addSubscriber`). Los componentes de servidor llaman a estas funciones, nunca a `supabase.from(...)` inline. `lib/supabase/client.ts` expone `createBrowserSupabaseClient` y `createServerSupabaseClient` por separado.

Escrituras desde el cliente (hoy solo el alta de newsletter) pasan por una Server Action en `lib/actions/` (ej. `lib/actions/subscribe.ts`, usada con `useActionState`), que a su vez llama a la query — los componentes cliente tampoco llaman a Supabase directo.

Patrones dentro de la capa de datos:
- **Partidos filtrados por `stage_id`.** `getStandings(stageId)` y `getUpcomingMatches(stageId)` reciben el stage; `/futbol` lo resuelve con `getLeagueStages()` (stages `liga` de la temporada vigente → selector de torneo). `getNextMatch()` (Home) no filtra: toma el próximo programado de cualquier torneo.
- **`withTeams(supabase, matches)`** (helper privado en `queries/matches.ts`) adjunta `homeTeam`/`awayTeam` a una lista de partidos con una sola consulta a `teams`. Usarlo en vez de repetir el lookup.
- **Orden con partidos sin fecha:** ordenar por `match_date` con `{ ascending: true, nullsFirst: false }` y desempatar con `.order("created_at", { ascending: true })` para que los sin fecha queden al final en orden de ingreso.
- **`lib/format.ts` → `formatMatchDate(iso)`** devuelve `{ day, time }` o `null` si no hay fecha. Un único formateador para Home/Fútbol/Calendario; los consumidores renderizan "Sin confirmar" cuando devuelve null.
- **Timezone de partidos: se guardan en UTC, se muestran/editan SIEMPRE en hora de Quito** (`America/Guayaquil`, fijo UTC-5 sin DST). El server corre en UTC (Vercel), así que formatear sin `timeZone` mostraba mal la hora. `formatMatchDate` fija `timeZone: "America/Guayaquil"`. El admin (`MatchForm`) usa `toQuitoInput` (UTC→wall-clock Quito para el `datetime-local`) y la action `quitoInputToISO` (input naive de Quito → instante UTC vía offset `-05:00`). Nunca formatear una hora de partido sin la TZ de Quito.

### Componentes: `ui/` genéricos vs dominio

- `components/ui/` — primitivos reutilizables entre páginas (`Container` para el max-width del sitio, `PhotoPlaceholder`, `TeamCrest`, `BrandLockup`)
- `components/layout/` — chrome de sitio (`Navbar`, `Footer`, `SubscribeForm`, `SubscribeModal`)
- `components/home/`, `components/futbol/` (ya existe: `UpcomingMatches`, `StandingsTable`, `CalendarList`, `SquadGrid`, `FutbolSubnav`), y futuros `components/tienda/`, etc. — específicos de cada dominio/página

`Container` (`max-w-[1280px] mx-auto`) es el mecanismo de ancho máximo del sitio: se usa dentro de cada sección con fondo full-bleed (hero, franjas de color), nunca envolviendo la página entera, para que los fondos de color sigan yendo de borde a borde mientras el contenido queda centrado.

### Placeholders de imágenes

Para fotos de contenido (partidos, jugadores, tienda) todavía no hay assets reales. `PhotoPlaceholder` (patrón diagonal + label mono tipo `[ FOTO PARTIDO ]`) es el default hasta que existan. Donde correspondería una imagen real, dejar el uso comentado al lado en vez de inventar una ruta de archivo. Los logos reales sí existen (`public/img/logoSDQ.png`, `mag.svg`, `mag_large.svg`) y ya están integrados vía `BrandLockup`.

### Patrón de hero con foto

Los hero de sección (Home, Cánticos) sí tienen foto real: `public/img/hero.jpg` (desktop) y `public/img/hero_2.jpg` (mobile), como background-image responsive vía Tailwind (`bg-[url('/img/hero_2.jpg')] ... md:bg-[url('/img/hero.jpg')]`), con una capa sólida encima para oscurecer (`bg-[#081f49]/80`) y legibilidad del texto. Aplicar el mismo patrón a los heroes que falten (Historia, Fútbol, Tienda, etc.) en vez de volver a `PhotoPlaceholder` ahí — son las únicas dos imágenes de foto real que existen hoy en el repo.

### Fuentes auto-hospedadas

`next/font/google` requiere descargar los archivos de Google Fonts en build/dev; en este entorno esa conexión no está disponible y next/font cae en silencio a una fuente de reemplazo sin avisar del fallo. Las 3 tipografías (Bebas Neue, IBM Plex Sans, JetBrains Mono) están auto-hospedadas en `app/fonts/*.woff2` y cargadas con `next/font/local` desde `app/layout.tsx`. No volver a `next/font/google` sin confirmar antes que el entorno tiene salida a internet.

### Comentarios `ponytail:`

Marcan simplificaciones deliberadas con un techo conocido y el camino para escalarlas (ej. tipos de Supabase a mano en `lib/types/database.ts`, manejo de error de `setAll` en `lib/supabase/client.ts`). Al toparse con uno, resolver según lo que indica el comentario en vez de "arreglarlo" introduciendo una abstracción nueva.

## Decisiones clave a respetar siempre

1. **Fútbol/calendario/standings son una sola fuente de datos.** Se registran partidos de TODOS los equipos de cada torneo (no solo SD Quito), para poder calcular la tabla de posiciones automáticamente (vista `standings`, por `stage_id`) en vez de ingresarla a mano. Ver `data-model.md`. Puede haber **varias competiciones a la vez** (ej. Serie B + una copa): `/futbol` las muestra con un selector de torneo. El **calendario sí es Quito-céntrico** (solo partidos donde juega SD Quito, con resultado desde su perspectiva) — es la excepción a "todos los equipos", que aplica al registro de datos y al cálculo de la tabla, no a esta vista.
2. **Dos formatos de stage:** `liga` (tabla de posiciones) y `eliminacion` (llaves/bracket, con soporte ida/vuelta vía `tie_id`). La UI y los formularios de admin cambian según el formato.
3. **No todo necesita CMS.** Historia y Cánticos son contenido estático en el repo (Cánticos como datos tipados en `lib/canticos.ts`, no MDX — la letra es estructurada por línea con rol call/coro, no prosa). Plantilla vive en Supabase (`players`) y **ya tiene UI de admin** (`/admin/plantilla`). Ver criterio completo en `admin-cms.md`.
4. **Identidad visual "de hinchada", no "app deportiva genérica".** El elemento de firma es un borde rasgado/deshilachado (SVG) que simula el filo de un trapo de tribuna, usado como transición entre secciones (todavía no implementado — pendiente para Historia/Cánticos). Ver `design-system.md` antes de construir cualquier UI.
5. **No hay checkout ni pagos en el sitio.** El carrito es estado del cliente (no hay tabla `cart_items`). Al enviar el pedido se crea un registro en `orders`/`order_items` y se redirige a WhatsApp (`wa.me`) con el resumen — el pago y la venta se coordinan ahí, fuera del sitio. El admin actualiza el status del pedido manualmente. La generación del pedido debe abstraerse detrás de una interfaz `CheckoutProvider` (ver `coding-guidelines.md`) para no reescribir el flujo de tienda cuando exista un pago real. Esto también reduce el riesgo de tocar el límite de "uso comercial" del plan Hobby de Vercel, ya que no hay dinero moviéndose a través del sitio.
6. **Roles de admin:** 10 aprox personas con los mismos permisos (sin roles distintos). Acceso controlado por una allowlist (`admin_users`) sobre Supabase Auth, no por un sistema de roles granular. RLS en Postgres es la capa real de seguridad, no la UI. La política propia de `admin_users` compara `id = auth.uid()` directo — **no** la reescribas como `exists (select ... from admin_users where id = auth.uid())`, provoca recursión infinita de RLS que rompe cualquier query de cualquier tabla que dependa de esa comprobación.
7. **Escribir para escalar sin sobreconstruir hoy.** El proyecto va a crecer (más usuarios, pagos reales, donaciones, categorías formativas) — el código debe dejar puntos de extensión claros (capa de datos centralizada, interfaz de checkout abstracta, separación admin/público) sin implementar esas features todavía. Ver `coding-guidelines.md`.
8. **Todo el copy es español ECUATORIANO, nunca argentino — sin voseo.** El público es la hinchada de Quito. Usar tuteo (tú): "confirma", "revisa", "puedes", "tienes", "aceptas", "escríbenos", "intenta de nuevo" — NUNCA voseo ("confirmá", "revisá", "podés", "tenés", "aceptás", "escribinos", "probá"). Aplica a UI, mensajes de error, T&C y cualquier texto generado. (El código sí va en inglés.)
