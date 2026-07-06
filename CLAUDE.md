# Proyecto: Sitio web SD Quito (hincha)

## Qué es esto
Sitio web para la hinchada de Sociedad Deportivo Quito (club de fútbol ecuatoriano, Segunda Categoría). No es un sitio oficial del club — es un portal hecho por/para la hinchada: noticias, historia, seguimiento deportivo (calendario, tablas de posiciones, llaves de eliminación), contenido de las barras (cánticos, banderas) y una tienda de merchandising.

## Stack técnico
- **Framework:** Next.js (App Router) + TypeScript
- **Estilos:** Tailwind CSS
- **Backend/DB:** Supabase (Postgres + Auth + Storage)
- **Deploy:** Vercel
- **Newsletter:** tabla `subscribers` en Supabase; envío mediente Kit

## Documentos de contexto (leer según la tarea)
- `design-system.md` — colores, tipografía, layout, elemento de firma visual
- `site-map.md` — todas las páginas/rutas y su propósito
- `data-model.md` — schema completo de Supabase con relaciones
- `admin-cms.md` — qué se gestiona en `/admin`, con qué nivel de esfuerzo, y cómo
- `coding-guidelines.md` — arquitectura de código, convenciones y puntos de extensión para escalabilidad futura (pagos reales, donaciones, más usuarios, categorías formativas)

## Decisiones clave a respetar siempre
1. **Fútbol/calendario/standings son una sola fuente de datos.** Se registran partidos de TODOS los equipos de cada torneo (no solo SD Quito), para poder calcular la tabla de posiciones automáticamente en vez de ingresarla a mano. Ver `data-model.md`.
2. **Dos formatos de stage:** `liga` (tabla de posiciones) y `eliminacion` (llaves/bracket, con soporte ida/vuelta vía `tie_id`). La UI y los formularios de admin cambian según el formato.
3. **No todo necesita CMS.** Historia y Cánticos son contenido estático (MDX en el repo). Plantilla es semi-estático (Supabase, sin UI de admin). Ver criterio completo en `admin-cms.md`.
4. **Identidad visual "de hinchada", no "app deportiva genérica".** El elemento de firma es un borde rasgado/deshilachado (SVG) que simula el filo de un trapo de tribuna, usado como transición entre secciones. Ver `design-system.md` antes de construir cualquier UI.
5. **No hay checkout ni pagos en el sitio.** El carrito es estado del cliente (no hay tabla `cart_items`). Al enviar el pedido se crea un registro en `orders`/`order_items` y se redirige a WhatsApp (`wa.me`) con el resumen — el pago y la venta se coordinan ahí, fuera del sitio. El admin actualiza el status del pedido manualmente. Esto también reduce el riesgo de tocar el límite de "uso comercial" del plan Hobby de Vercel, ya que no hay dinero moviéndose a través del sitio.
6. **Roles de admin:** 10 aprox personas con los mismos permisos (sin roles distintos). Acceso controlado por una allowlist (`admin_users`) sobre Supabase Auth, no por un sistema de roles granular. RLS en Postgres es la capa real de seguridad, no la UI.
7. **Escribir para escalar sin sobreconstruir hoy.** El proyecto va a crecer (más usuarios, pagos reales, donaciones, categorías formativas) — el código debe dejar puntos de extensión claros (capa de datos centralizada, interfaz de checkout abstracta, separación admin/público) sin implementar esas features todavía. Ver `coding-guidelines.md`.

## Estado del proyecto
- Diseño visual (mockups) ya realizado en Claude Design — este repo debe implementarlo con posibles cambios mínimos que mejores la UX, mas no reinterpretarlo.
- Pendiente de definir: número(s) de WhatsApp de destino para pedidos, copy exacto del mensaje pre-armado.
