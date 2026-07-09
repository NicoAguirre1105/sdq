# Site map — SD Quito

## Rutas (Next.js App Router)

```
/                          → Home (feed de posts)
/historia                  → Historia del club (estático)
/futbol                    → Landing de sección deportiva
  /futbol/tabla             → Tabla de posiciones (o bracket con scroll horizontal, según formato del stage activo)
  /futbol/calendario        → Todos los partidos de la temporada
/canticos                  → Cánticos y banderas de las barras (estático)
/tienda                    → Listado de productos
  /tienda/[slug]             → Detalle de producto
  /tienda/carrito            → Carrito de compras
/plantilla                 → Plantilla de jugadores
/suscripcion               → Alta/gestión de newsletter (pública)
/login                     → Autenticación (implementado: email+contraseña, Supabase Auth)
/admin                     → Panel de administración (implementado: protegido por middleware + requireAdmin; dashboard placeholder)
  /admin/posts               → implementado (CRUD: listado + /new + /[id]/edit, editor markdown con preview)
  /admin/futbol             → implementado (pantalla única: selector de stage + partidos editables + tabla read-only; `?match=new|<id>` abre el editor)
    /admin/futbol/equipos      → implementado (catálogo de teams: listado + /new + /[id]/edit; escudo SVG → bucket team_logos)
    /admin/futbol/competiciones → implementado (alta/baja de temporadas y torneos)
    /admin/futbol/stage/new    → implementado (crear stage; en liga elige equipos → stage_teams)
  /admin/plantilla          → implementado (CRUD de jugadores: listado + /new + /[id]/edit; foto opcional → bucket player_photos)
  /admin/tienda             → gestión de productos + vista de orders — no implementado
  /admin/suscriptores        → no implementado
/not-found                 → 404 (implementado: app/(public)/not-found.tsx + catch-all [...not-found] para heredar Navbar/Footer)
```

## Descripción por página

| Página | Propósito | Gestión de contenido |
|---|---|---|
| **Home** | Feed de noticias/crónicas/avisos a la hinchada | CMS (posts) |
| **Historia** | Historia del club: fundación, títulos, hitos | Estático |
| **Fútbol** | Tabla de posiciones o llaves de eliminación, próximos partidos | Calculado/derivado desde `matches` |
| **Calendario** | Todos los partidos de la temporada (todas las competitions/stages) | Derivado desde `matches` |
| **Cánticos** | Letras y audio de cánticos, historia de banderas por barra | Estático (MDX) |
| **Tienda** | Catálogo de merchandising | CMS (products) |
| **Detalle de producto** | Vista individual de un producto | Derivado de `products` |
| **Carrito** | Armar pedido y enviarlo por WhatsApp (sin pago en el sitio) | Estado de cliente + registro en `orders`/`order_items` al enviar |
| **Plantilla** | Jugadores del plantel actual | Semi-estático (Supabase, sin UI) |
| **Suscripción** | Alta de email a newsletter | CMS ligero (`subscribers`) |
| **Login** | Acceso de administrador (implementado) | Supabase Auth |
| **Admin** | Gestión de todo el contenido dinámico (implementados: Posts, Fútbol y Plantilla; pendientes: Tienda, Suscriptores) | Ver `admin-cms.md` |
| **Not found** | 404 (implementado) | Estático |

Ver `data-model.md` para el detalle de tablas y `admin-cms.md` para el flujo de cada panel.
