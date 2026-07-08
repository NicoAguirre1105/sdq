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
/login                     → Autenticación (Supabase Auth)
/admin                     → Panel de administración (protegido)
  /admin/posts
  /admin/futbol             → gestión de teams, stages, matches
  /admin/tienda             → gestión de productos + vista de orders
  /admin/suscriptores
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
| **Login** | Acceso de administrador | Supabase Auth |
| **Admin** | Gestión de todo el contenido dinámico | Ver `admin-cms.md` |
| **Not found** | 404 (implementado) | Estático |

Ver `data-model.md` para el detalle de tablas y `admin-cms.md` para el flujo de cada panel.
