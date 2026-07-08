# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

Sitio web para la hinchada de Sociedad Deportivo Quito (club de fútbol ecuatoriano, Segunda Categoría). No es un sitio oficial del club — es un portal hecho por/para la hinchada: noticias, historia, seguimiento deportivo (calendario, tablas de posiciones, llaves de eliminación), contenido de las barras (cánticos, banderas) y una tienda de merchandising.

## Stack técnico

- **Framework:** Next.js 16 (App Router) + TypeScript, React 19
- **Estilos:** Tailwind CSS v4 (tokens vía `@theme inline` en `app/globals.css`, no `tailwind.config.js`)
- **Backend/DB:** Supabase (Postgres + Auth + Storage), cliente vía `@supabase/ssr`
- **Deploy:** Vercel
- **Newsletter:** tabla `subscribers` en Supabase; el alta ya es funcional. Envío/confirmación por correo (Kit) todavía no está integrado

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

Cambios de schema aplicados a mano hasta ahora (más allá del `schema.sql` original): `matches.match_date` pasó a **nullable** (null = fecha sin confirmar) y se agregó `matches.created_at timestamptz default now()` como desempate de orden para partidos sin fecha (se listan al final, en orden de ingreso).

Los tipos de `lib/types/database.ts` están **tipados a mano**, solo las tablas/vistas que la Fase 1 consulta: `posts`, `players`, `subscribers`, `teams`, `matches`, `seasons`, `competitions`, `stages` y la vista `standings`. Reemplazar por completo con `supabase gen types typescript` en cuanto el CLI esté conectado al proyecto real — no seguir extendiendo el archivo a mano más allá de eso.

## Documentos de contexto (leer según la tarea)

- `.claude/design-system.md` — colores, tipografía, layout, elemento de firma visual
- `.claude/site-map.md` — todas las páginas/rutas y su propósito
- `.claude/data-model.md` — schema completo de Supabase con relaciones
- `.claude/admin-cms.md` — qué se gestiona en `/admin`, con qué nivel de esfuerzo, y cómo
- `.claude/coding-guidelines.md` — arquitectura de código, convenciones y puntos de extensión para escalabilidad futura (pagos reales, donaciones, más usuarios, categorías formativas)

## Estado actual del proyecto

Diseño visual (mockups) ya realizado en Claude Design — este repo lo implementa con posibles cambios mínimos que mejoren la UX, sin reinterpretarlo. Están en `public/design/*.html`.

Los mockups son bundles de Claude Design (HTML con manifest embebido en gzip+base64, no HTML plano). Para leerlos, extraer primero el `<script type="__bundler/template">` (contiene el HTML real) — no intentar parsear el `.html` directamente. Cada mockup puede tener varias iteraciones ("turns"); la de mayor número es la dirección final a implementar.

**Fase 1 en curso: solo cliente, sin CMS/admin.** Construido hasta ahora:
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

**No implementado todavía:** Tienda, Login, y todo `/admin`. Fútbol `eliminacion`/bracket (solo hay `liga`). No asumir que estas rutas o sus componentes existen — verificar antes de referenciarlas. El link "Tienda" está comentado en `lib/nav-links.ts` por la misma razón (sección sin construir aún).

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
3. **No todo necesita CMS.** Historia y Cánticos son contenido estático en el repo (Cánticos como datos tipados en `lib/canticos.ts`, no MDX — la letra es estructurada por línea con rol call/coro, no prosa). Plantilla es semi-estático (Supabase, sin UI de admin). Ver criterio completo en `admin-cms.md`.
4. **Identidad visual "de hinchada", no "app deportiva genérica".** El elemento de firma es un borde rasgado/deshilachado (SVG) que simula el filo de un trapo de tribuna, usado como transición entre secciones (todavía no implementado — pendiente para Historia/Cánticos). Ver `design-system.md` antes de construir cualquier UI.
5. **No hay checkout ni pagos en el sitio.** El carrito es estado del cliente (no hay tabla `cart_items`). Al enviar el pedido se crea un registro en `orders`/`order_items` y se redirige a WhatsApp (`wa.me`) con el resumen — el pago y la venta se coordinan ahí, fuera del sitio. El admin actualiza el status del pedido manualmente. La generación del pedido debe abstraerse detrás de una interfaz `CheckoutProvider` (ver `coding-guidelines.md`) para no reescribir el flujo de tienda cuando exista un pago real. Esto también reduce el riesgo de tocar el límite de "uso comercial" del plan Hobby de Vercel, ya que no hay dinero moviéndose a través del sitio.
6. **Roles de admin:** 10 aprox personas con los mismos permisos (sin roles distintos). Acceso controlado por una allowlist (`admin_users`) sobre Supabase Auth, no por un sistema de roles granular. RLS en Postgres es la capa real de seguridad, no la UI. La política propia de `admin_users` compara `id = auth.uid()` directo — **no** la reescribas como `exists (select ... from admin_users where id = auth.uid())`, provoca recursión infinita de RLS que rompe cualquier query de cualquier tabla que dependa de esa comprobación.
7. **Escribir para escalar sin sobreconstruir hoy.** El proyecto va a crecer (más usuarios, pagos reales, donaciones, categorías formativas) — el código debe dejar puntos de extensión claros (capa de datos centralizada, interfaz de checkout abstracta, separación admin/público) sin implementar esas features todavía. Ver `coding-guidelines.md`.
