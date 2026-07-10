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

### Flujo de desarrollo y verificación

- **Type-check con `npx tsc --noEmit` después de cambios no triviales** — el `Match`/`Database` tipado a mano detecta la mayoría de los errores de forma (ej. al volver `match_date` nullable, `tsc` fuerza a manejar el null en todos los consumidores). Es la primera red de seguridad, antes de mirar el navegador.
- **Hay un dev server de preview corriendo** (`.claude/launch.json`). Verificar los cambios observables directamente contra él con las tools `preview_*` (leer estado con `preview_eval`/`preview_snapshot`, inspeccionar estilos con `preview_inspect`, capturar con `preview_screenshot`) en vez de pedirle al usuario que revise a mano. Para páginas con datos de Supabase, `fetch(...)` dentro de `preview_eval` sobre la ruta y revisar el HTML/`status` es la forma rápida de confirmar que la query no rompió.
- **Errores de datos aparecen como 500** en la ruta (ej. `column ... does not exist` cuando falta correr un `ALTER`). `preview_logs level:error` muestra el error de Postgres exacto; el buffer incluye entradas viejas de compilaciones previas, así que fijarse en la más reciente.
- **`ponytail:` es el modo por defecto de este repo** — preferir la solución más simple que funcione, reutilizar helpers/patrones existentes antes de escribir nuevos, y marcar simplificaciones deliberadas con un comentario `ponytail:` (ver abajo).
- **Verificar `/admin` (protegido) en el preview:** `.env.local` tiene una cuenta de staff dedicada a verificación (`DEV_ADMIN_EMAIL` / `DEV_ADMIN_PASSWORD`, sin prefijo `NEXT_PUBLIC_` — no llega al cliente). Para revisar cualquier pantalla del panel, loguear con `preview_fill`/`preview_click` contra el form real de `/login` usando esas credenciales (leídas del `.env.local` con `Read`); la sesión queda en cookies del tab de preview. Es una cuenta de prueba separada de las cuentas reales de administradores.

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

- `.claude/design-system.md` — colores, tipografía, layout, elemento de firma visual
- `.claude/site-map.md` — todas las páginas/rutas y su propósito
- `.claude/data-model.md` — schema completo de Supabase con relaciones
- `.claude/admin-cms.md` — qué se gestiona en `/admin`, con qué nivel de esfuerzo, y cómo
- `.claude/coding-guidelines.md` — arquitectura de código, convenciones y puntos de extensión para escalabilidad futura (pagos reales, donaciones, más usuarios, categorías formativas)

## Estado actual del proyecto

Diseño visual (mockups) ya realizado en Claude Design — este repo lo implementa con posibles cambios mínimos que mejoren la UX, sin reinterpretarlo. Están en `public/design/*.html`.

Los mockups son bundles de Claude Design (HTML con manifest embebido en gzip+base64, no HTML plano). Para leerlos, extraer primero el `<script type="__bundler/template">` (contiene el HTML real) — no intentar parsear el `.html` directamente. Cada mockup puede tener varias iteraciones ("turns"); la de mayor número es la dirección final a implementar.

**Fase 1 (cliente, sin CMS/admin): cerrada.** Construido:
- Fundaciones: tokens de diseño, fuentes auto-hospedadas, schema + seed de Supabase, capa de datos (`lib/supabase/queries/`)
- Layout global (`app/(public)/layout.tsx`): Navbar + Footer
- Página Home (`app/(public)/page.tsx`): hero de próximo partido, grilla de crónicas, newsletter (alta funcional)
- Página Cánticos (`app/(public)/canticos/`): lista con filtro clásicos/todos + detalle por cántico (letra call/coro, embed de YouTube con minuto de inicio). Contenido en `lib/canticos.ts`, con letras y video de ejemplo — reemplazar por los reales
- Página Historia (`app/(public)/historia/`): un solo componente cliente (`components/historia/HistoriaContent.tsx`) con tabs "El club" / "Las barras" por estado, no rutas separadas. Contenido en `lib/historia.ts` (vitrina de títulos, línea de tiempo, presidentes — historial real; barras con datos de ejemplo). El tab "Las barras" está comentado en el subnav (no accesible todavía, falta contenido real de cada barra) — no reactivarlo sin confirmar que hay contenido para mostrar.
- Sección Fútbol (`components/futbol/`, formato `liga`; `eliminacion`/bracket aún no):
  - `/futbol` — selector de torneo (`?torneo=<slug>`, server-side vía `searchParams`, sin estado cliente), próximos partidos y tabla de posiciones del stage seleccionado. El selector solo aparece con más de una competición.
  - `/futbol/calendario` — todos los partidos de SD Quito en la temporada (Quito-céntrico), con resultado + pill V/E/D desde su perspectiva, filtros client-side (Todos/Jugados/Próximos/Local/Visitante), record G/E/P y torneo por partido. Partidos sin fecha (`match_date` null) se listan al final ("Sin confirmar") y nunca se marcan como "próximo".
  - `/plantilla` — jugadores agrupados por posición (dorsal, nombre; foto placeholder). Ruta top-level, no bajo `/futbol`.
  - `FutbolSubnav` (client, `usePathname`) enlaza Tabla / Calendario / Plantilla en las tres páginas. "Salón de Fama" queda fuera hasta que exista su ruta/datos.
- Página 404 (`app/(public)/not-found.tsx`): hero azul con textura diagonal, `BrandLockup` (logo Quito + división + MAG, igual que la Navbar), "404" y accesos rápidos. Vive dentro de `(public)` para heredar Navbar/Footer; un catch-all `app/(public)/[...not-found]/page.tsx` enruta las URLs inexistentes al grupo (un `not-found.tsx` suelto solo cubre `notFound()` lanzado dentro del grupo, no las rutas no encontradas). Al construir `/admin`, darle su propio catch-all para que sus rutas inexistentes no caigan en este 404 público.

**Fase 2 en curso: login + admin CMS.** Orden: login → admin base (posts/fútbol/plantilla) → QR→PDF → suscriptores/Kit → resto. Construido hasta ahora:
- **Login** (`app/login/page.tsx` + `components/auth/LoginForm.tsx`): split-panel fiel al mockup (marca a la izquierda/arriba, formulario a la derecha/abajo), email+contraseña vía `signInAction` (`lib/actions/auth.ts`). Sin registro público — cuentas creadas a mano en Supabase + fila en `admin_users`.
- **Protección de `/admin`**: `proxy.ts` (convención de Next 16, antes `middleware.ts`) + `lib/supabase/middleware.ts` (`updateSession`) refresca la sesión y redirige `/admin/*` → `/login` sin sesión. `lib/auth.ts` (`requireAdmin`) es el gate de la capa de app: exige sesión **y** estar en la allowlist `admin_users` (vía `lib/supabase/queries/admin.ts`); RLS (`id = auth.uid()`) es la seguridad real, esto solo evita renderizar el panel de más.
- **Shell del admin**: `app/admin/layout.tsx` (protegido) + `components/admin/Sidebar.tsx` (client, `usePathname` para estado activo). El sidebar lista las 6 áreas; **Dashboard, Posts, Fútbol y Plantilla** están habilitados, el resto (Tienda, Suscriptores) se muestra deshabilitado con "pronto" (no enlazan a rutas 404 — habilitar a medida que se construyan). Logout en el footer del sidebar.
- **Posts CRUD** (`/admin/posts`): listado (`getAllPosts` incluye borradores), editor compartido `components/admin/PostForm.tsx` (client) para `/admin/posts/new` y `/admin/posts/[id]/edit`, actions en `lib/actions/posts.ts` (`createPost`/`updatePost`/`deletePost`, cada una llama `requireAdmin()`; RLS es el gate real). Verificado end-to-end contra el preview (crear→borrador, publicar, aparece en Home, eliminar con confirm).
  - **Borrador vs publicado** = `published_at` null vs `<= now()`. El toggle "Publicado" setea `published_at` a `now()` (o conserva la fecha original al republicar) o null. Por eso `posts.published_at` pasó a nullable en `lib/types/database.ts` (el schema ya lo permitía). No hay UI de programación a futuro.
  - **`lib/slug.ts`** (`slugify`): autogenera el slug desde el título en el editor y lo normaliza en las actions. **`lib/markdown.ts`** (`renderMarkdown`): renderer de un subconjunto seguro de Markdown, usado tanto en la vista previa del editor como en `/post/[slug]` (mismo renderer, mismo look); `ponytail:` marca el techo (sin tablas/imágenes/code blocks) — cambiar por `marked`+sanitizado cuando el contenido real de un post lo necesite.
  - **Imagen de portada — subida a Supabase Storage.** Input de archivo en el editor (preview instantáneo con `URL.createObjectURL`, botón "Quitar", "Subir otra reemplaza"). El archivo viaja en el `FormData` de la action; `resolveCoverImage` (en `lib/actions/posts.ts`) valida imagen + ≤5 MB y sube vía `uploadPostImage` (`lib/supabase/queries/storage.ts`) al bucket público **`post-images`**. `cover_image` guarda la URL pública; un hidden conserva la URL previa si no se sube nada, `""` = quitar. `PostCard` la muestra con `next/image` (host `*.supabase.co` habilitado en `next.config.ts`).
    - Bucket + policies en `supabase/schema.sql` §Storage — ya corridos en el Supabase real. Escritura solo admins; lectura pública por el flag del bucket. **Ojo:** hay una policy de **SELECT** para admins además de insert/update/delete — es imprescindible para borrar: `storage.remove()` filtra por RLS en silencio (devuelve `[]` sin error) si la sesión no puede "ver" el objeto.
    - **Borrado de archivos:** `deletePostImage` (en `storage.ts`) borra el objeto anterior al reemplazar/quitar portada (compara con el valor previo en DB) y al eliminar el post. No deja huérfanos. No lanza si falla (un huérfano no debe romper el guardado). `storage.ts` está generalizado: helpers privados `uploadToBucket`/`deleteFromBucket` + wrappers por bucket (`uploadPostImage`/`uploadTeamLogo`, etc.).
- **Página pública de detalle de post** (`app/(public)/post/[slug]/page.tsx`, verificada end-to-end): breadcrumb a Inicio, categoría, fecha, título, portada (real o `PhotoPlaceholder`), extracto, y `content_md` vía `renderMarkdown`. `getPostBySlug` usa `maybeSingle()` (no `.single()`) para poder devolver `null` → `notFound()` en vez de un 500 cuando el slug no existe o el post no está publicado (RLS lo filtra). `PostCard` (Home) envuelve la card en un `Link` a `/post/[slug]`.
  - **Gotcha de datos ya corregido:** los 8 posts del seed original guardaban `content_md` con `'##...\n\n...'` (comilla simple), donde Postgres no interpreta `\n` — quedaba como texto literal en vez de salto de línea, rompiendo el renderer. `supabase/seed.sql` pasó a usar `E'...'` (string con escapes) para instalaciones nuevas; en la DB real se corrigió con `update posts set content_md = replace(content_md, '\n', chr(10));`. Contenido creado/editado desde el admin (textarea) nunca tuvo este problema — solo afectaba al seed.
- **Fútbol CRUD** (`/admin/futbol`, verificado end-to-end contra el preview): pantalla única con selector de stage (server-side, `?stage=<id>` vía `searchParams`, sin estado cliente), lista de partidos editables y tabla de posiciones de solo lectura (solo formato `liga`, reusa `getStandings`). Queries admin en `lib/supabase/queries/`: `getAdminStages` (todos los stages, toda temporada, con etiqueta), `getStageMatches`/`getMatchById`, `getAllTeams`/`getTeamById`, `getCompetitionsForSelect`/`getSeasons`/`getCompetitionsWithSeason`.
  - **Partidos:** editor `components/admin/MatchForm.tsx` (client) vía `?match=new|<id>` sobre la misma ruta; actions en `lib/actions/matches.ts` (`createMatch`/`updateMatch`/`deleteMatch`). El form cambia según el formato del stage: `matchday` (liga) vs `round_name` (eliminación). `ponytail:` no hay emparejamiento ida/vuelta (`tie_id`/`leg`) todavía.
  - **Equipos (catálogo)** (`/admin/futbol/equipos` + `new` + `[id]/edit`): `components/admin/TeamForm.tsx` + `lib/actions/teams.ts`. **Escudo = SVG subido al bucket `team_logos`** (mismo patrón que la portada de posts: `resolveLogo` valida `image/svg+xml` + ≤1 MB, `uploadTeamLogo`/`deleteTeamLogo`; borra el anterior al reemplazar/quitar/eliminar). **`is_own_team` NO se gestiona desde el form** — queda en el default `false` al crear y el form no lo toca al editar; se cambia a mano en Supabase.
  - **Competiciones/temporadas** (`/admin/futbol/competiciones`): alta de temporada (con "vigente" única, misma lógica de desmarcar el resto) y de torneo, más borrado de ambos; actions en `lib/actions/competitions.ts`. Crear **stages** en `/admin/futbol/stage/new` (`StageForm` client): elegir competición existente, nombre (slug auto), formato; en `liga` aparecen checkboxes de equipos → `stage_teams` (la vista `standings` se calcula desde ahí). `lib/actions/stages.ts` (`createStage`/`deleteStage`).
  - **Borrado:** `components/admin/DeleteButton.tsx` (client) envuelve una server action con `confirm()`; se usa para stage/temporada/competición. El borrado se apoya en el `on delete cascade` del schema (ver arriba) — sin esos ALTER, borrar algo con partidos da error de FK.
- **Plantilla CRUD** (`/admin/plantilla` + `new` + `[id]/edit`, verificado end-to-end): `components/admin/PlayerForm.tsx` + `lib/actions/players.ts` (`createPlayer`/`updatePlayer`/`deletePlayer`). Campos: nombre, posición (**select** con las 4 de `lib/positions.ts` — `Portero/Defensa/Mediocampista/Delantero`, deben coincidir con `GROUPS` de `components/futbol/SquadGrid.tsx` para que el plantel público agrupe bien), dorsal, bio markdown, y **foto opcional** subida al bucket `player_photos` (mismo patrón que la portada de posts: `resolvePhoto` valida imagen + ≤2 MB; borra la anterior al reemplazar/quitar/eliminar). `SquadGrid` renderiza la foto con `next/image` si existe `photo_url`, si no `PhotoPlaceholder`. **Ojo:** `lib/positions.ts` vive fuera del `"use server"` a propósito — exportar un array desde un módulo de server actions lo vuelve proxy y rompe `.map()` en el cliente.
- **Newsletter con Kit (doble opt-in)** — flujo completo, verificado en local (falta prueba end-to-end del correo real de Kit + webhook, que necesitan deploy):
  - **Form de 2 pasos** (`components/layout/SubscribeForm.tsx`): paso 1 pide correo → `checkSubscriberAction` llama a la función `subscriber_status(email)` (`security definer`, devuelve `new`/`pending`/`confirmed` sin exponer lectura pública de `subscribers`). Si es nuevo, paso 2 muestra temas + checkbox de términos (link a `/terminos`) + confirmar; `subscribeAction` agrega a Kit (`addToKit`, dispara el correo de verificación) y guarda `confirmed = false` + `accepted_terms_at`. Actions en `lib/actions/subscribe.ts`.
  - **Kit** (`lib/kit.ts`): `addToKit` usa la **API v3 autenticada** (`POST /v3/forms/{KIT_FORM_ID}/subscribe` con `KIT_V3_API_KEY` — key distinta de la v4). Respeta el doble opt-in del Form y dispara el correo de verificación. **Callejones sin salida ya descartados (no reintentar):** (a) v4 `POST /v4/forms/{id}/subscribers` → 404; (b) v4 `POST /v4/subscribers` crea al subscriber `active` sin confirmación (el `state:"inactive"` está deshabilitado); (c) el endpoint público del embed (`app.kit.com/forms/{id}/subscriptions`) devuelve `status:"quarantined"` (anti-spam) para POST server-side con correos reales. `addToKit` es no-op sin `KIT_V3_API_KEY`/`KIT_FORM_ID`. `removeFromKit` (baja al eliminar) sí usa v4 (`KIT_API_KEY`): busca el id por correo y lo desuscribe.
  - **Env vars de Kit:** `KIT_V3_API_KEY` (v3, para el alta), `KIT_API_KEY` (v4, `kit_...`, para la baja), `KIT_FORM_ID`, `KIT_WEBHOOK_SECRET`. El webhook además necesita `SUPABASE_SERVICE_ROLE_KEY`.
  - **Webhook** (`app/api/kit/webhook/route.ts`): recibe `subscriber.subscriber_activate` de Kit → `confirmSubscriber(email)` marca `confirmed = true` vía **service role** (`createServiceRoleSupabaseClient` en `client.ts`, necesita `SUPABASE_SERVICE_ROLE_KEY`). Se protege con `KIT_WEBHOOK_SECRET` en la query (`?token=`) porque Kit no firma. Registrar por API apuntando a la URL de prod; no funciona contra localhost.
  - **Página `/terminos`** (`app/(public)/terminos/page.tsx`): T&C estáticos de la suscripción (LOPDP, Kit como procesador, baja, contacto). Linkeada desde el `Footer`.
  - **Admin** (`/admin/suscriptores`): listado con estado confirmado/pendiente, temas y fecha; borrado (`lib/actions/subscribers.ts` → `deleteSubscriber`, también da de baja en Kit). Envío/segmentación de correos se hace desde el panel de Kit; los `topics` todavía **no** se mapean a tags de Kit.
  - **Schema:** `subscribers` sumó `kit_subscriber_id`, `accepted_terms_at` y la función `subscriber_status` (ya corridos en la DB en vivo).

**No implementado todavía:** Tienda; QR→PDF; mapear `topics` a tags de Kit para segmentar envíos. Fútbol `eliminacion`/bracket: los stages de ese formato se crean y sus partidos se cargan (con `round_name`), pero **no hay vista de llaves/bracket** (pública ni admin) ni emparejamiento ida/vuelta. No asumir que estas rutas o sus componentes existen — verificar antes de referenciarlas. El link "Tienda" está comentado en `lib/nav-links.ts` por la misma razón (sección sin construir aún).

**Pendiente de definir:** número(s) de WhatsApp de destino para pedidos, copy exacto del mensaje pre-armado.

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
