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

### Supabase

El schema no usa migraciones incrementales — es un único `supabase/schema.sql` pensado para correrse una sola vez sobre un proyecto nuevo (cubre tablas de Fútbol/Tienda/Admin aunque esas secciones no tengan UI todavía, para evitar migraciones incómodas después). Al modificar el schema, editar `supabase/schema.sql` directamente y aplicar el cambio puntual (`ALTER`/`CREATE`) a mano en el SQL Editor del proyecto real — no existe `supabase/migrations/`.

```bash
# Setup de un proyecto nuevo: correr en orden en el SQL Editor de Supabase
supabase/schema.sql
supabase/seed.sql
```

Requiere `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Los tipos de `lib/types/database.ts` están **tipados a mano** (solo las tablas que la Fase 1 consulta: `posts`, `players`, `subscribers`, `teams`, `matches`). Reemplazar por completo con `supabase gen types typescript` en cuanto el CLI esté conectado al proyecto real — no seguir extendiendo el archivo a mano más allá de eso.

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

**No implementado todavía:** Historia, Cánticos, Plantilla, 404, Fútbol/Calendario, Tienda, Login, y todo `/admin`. No asumir que estas rutas o sus componentes existen — verificar antes de referenciarlas.

**Pendiente de definir:** número(s) de WhatsApp de destino para pedidos, copy exacto del mensaje pre-armado.

## Arquitectura

### Split público/admin vía route groups

`app/(public)/layout.tsx` es el único lugar donde se renderizan `Navbar` y `Footer`. El root `app/layout.tsx` solo trae fuentes y el `<html>/<body>`, sin chrome de sitio. Esto es deliberado: cuando se construya `/admin`, debe vivir en un segmento hermano (fuera de `(public)`) para no heredar ese layout — el admin no lleva navbar ni footer del sitio público.

### Capa de datos: nunca Supabase directo desde un componente

Todo acceso a datos pasa por `lib/supabase/queries/<dominio>.ts` (una función por consulta, ej. `getPublishedPosts`, `getNextMatch`, `addSubscriber`). Los componentes de servidor llaman a estas funciones, nunca a `supabase.from(...)` inline. `lib/supabase/client.ts` expone `createBrowserSupabaseClient` y `createServerSupabaseClient` por separado.

Escrituras desde el cliente (hoy solo el alta de newsletter) pasan por una Server Action en `lib/actions/` (ej. `lib/actions/subscribe.ts`, usada con `useActionState`), que a su vez llama a la query — los componentes cliente tampoco llaman a Supabase directo.

### Componentes: `ui/` genéricos vs dominio

- `components/ui/` — primitivos reutilizables entre páginas (`Container` para el max-width del sitio, `PhotoPlaceholder`, `TeamCrest`, `BrandLockup`)
- `components/layout/` — chrome de sitio (`Navbar`, `Footer`, `SubscribeForm`, `SubscribeModal`)
- `components/home/`, y futuros `components/futbol/`, `components/tienda/`, etc. — específicos de cada dominio/página

`Container` (`max-w-[1280px] mx-auto`) es el mecanismo de ancho máximo del sitio: se usa dentro de cada sección con fondo full-bleed (hero, franjas de color), nunca envolviendo la página entera, para que los fondos de color sigan yendo de borde a borde mientras el contenido queda centrado.

### Placeholders de imágenes

Todavía no hay assets reales de fotos (partidos, jugadores, hinchada). `PhotoPlaceholder` (patrón diagonal + label mono tipo `[ FOTO PARTIDO ]`) es el default hasta que existan. Donde correspondería una imagen real, dejar el uso comentado al lado en vez de inventar una ruta de archivo. Los logos reales sí existen (`public/img/logoSDQ.png`, `mag.svg`, `mag_large.svg`) y ya están integrados vía `BrandLockup`.

### Fuentes auto-hospedadas

`next/font/google` requiere descargar los archivos de Google Fonts en build/dev; en este entorno esa conexión no está disponible y next/font cae en silencio a una fuente de reemplazo sin avisar del fallo. Las 3 tipografías (Bebas Neue, IBM Plex Sans, JetBrains Mono) están auto-hospedadas en `app/fonts/*.woff2` y cargadas con `next/font/local` desde `app/layout.tsx`. No volver a `next/font/google` sin confirmar antes que el entorno tiene salida a internet.

### Comentarios `ponytail:`

Marcan simplificaciones deliberadas con un techo conocido y el camino para escalarlas (ej. tipos de Supabase a mano en `lib/types/database.ts`, manejo de error de `setAll` en `lib/supabase/client.ts`). Al toparse con uno, resolver según lo que indica el comentario en vez de "arreglarlo" introduciendo una abstracción nueva.

## Decisiones clave a respetar siempre

1. **Fútbol/calendario/standings son una sola fuente de datos.** Se registran partidos de TODOS los equipos de cada torneo (no solo SD Quito), para poder calcular la tabla de posiciones automáticamente en vez de ingresarla a mano. Ver `data-model.md`.
2. **Dos formatos de stage:** `liga` (tabla de posiciones) y `eliminacion` (llaves/bracket, con soporte ida/vuelta vía `tie_id`). La UI y los formularios de admin cambian según el formato.
3. **No todo necesita CMS.** Historia y Cánticos son contenido estático (MDX en el repo). Plantilla es semi-estático (Supabase, sin UI de admin). Ver criterio completo en `admin-cms.md`.
4. **Identidad visual "de hinchada", no "app deportiva genérica".** El elemento de firma es un borde rasgado/deshilachado (SVG) que simula el filo de un trapo de tribuna, usado como transición entre secciones (todavía no implementado — pendiente para Historia/Cánticos). Ver `design-system.md` antes de construir cualquier UI.
5. **No hay checkout ni pagos en el sitio.** El carrito es estado del cliente (no hay tabla `cart_items`). Al enviar el pedido se crea un registro en `orders`/`order_items` y se redirige a WhatsApp (`wa.me`) con el resumen — el pago y la venta se coordinan ahí, fuera del sitio. El admin actualiza el status del pedido manualmente. La generación del pedido debe abstraerse detrás de una interfaz `CheckoutProvider` (ver `coding-guidelines.md`) para no reescribir el flujo de tienda cuando exista un pago real. Esto también reduce el riesgo de tocar el límite de "uso comercial" del plan Hobby de Vercel, ya que no hay dinero moviéndose a través del sitio.
6. **Roles de admin:** 10 aprox personas con los mismos permisos (sin roles distintos). Acceso controlado por una allowlist (`admin_users`) sobre Supabase Auth, no por un sistema de roles granular. RLS en Postgres es la capa real de seguridad, no la UI. La política propia de `admin_users` compara `id = auth.uid()` directo — **no** la reescribas como `exists (select ... from admin_users where id = auth.uid())`, provoca recursión infinita de RLS que rompe cualquier query de cualquier tabla que dependa de esa comprobación.
7. **Escribir para escalar sin sobreconstruir hoy.** El proyecto va a crecer (más usuarios, pagos reales, donaciones, categorías formativas) — el código debe dejar puntos de extensión claros (capa de datos centralizada, interfaz de checkout abstracta, separación admin/público) sin implementar esas features todavía. Ver `coding-guidelines.md`.
