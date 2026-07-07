# Guía de código y arquitectura — SD Quito

Este documento define cómo debe escribirse el código del proyecto: estructura, convenciones, y — lo más importante — los puntos donde hay que dejar espacio para crecer sin over-engineering hoy. La regla general es **simple ahora, extensible después**: no construir features que no existen todavía, pero sí elegir patrones que no obliguen a reescribir cuando aparezcan.

## Newsletter — Kit como fuente de verdad

El double opt-in del newsletter **no se construye a mano** (nada de tokens propios ni envío de emails de confirmación desde el servidor) — Kit (antes ConvertKit) ya lo resuelve nativamente y gratis. Supabase (`subscribers`) es un espejo de solo lectura para el admin panel, no la fuente de verdad de si alguien está confirmado.

**Dos rutas serverless necesarias:**

- **`/api/subscribe`** — recibe el alta del formulario, hace upsert en `subscribers`, y llama a `POST https://api.kit.com/v4/subscribers` con el email
- **`/api/webhooks/kit`** — recibe el evento de Kit cuando el usuario confirma (`subscriber.state === 'active'`) y actualiza `confirmed = true` en Supabase por email

**Antes de implementar `/api/webhooks/kit`:** verificar en `developers.kit.com` el mecanismo de autenticación de webhooks vigente (firma, secreto compartido, etc.) — no aceptar el payload sin validar que viene realmente de Kit, ya que esta ruta escribe en la base de datos.

No usar Resend/nodemailer ni ningún envío propio de email para la confirmación — sería duplicar algo que Kit ya cubre con mejor entregabilidad y sin costo.

## Futuro a tener en cuenta (no implementar ahora, pero diseñar sin bloquearlo)
- Más usuarios / cuentas públicas (no solo admins) — ej. perfiles de hincha, favoritos, comentarios
- Sistema de pago real integrado (hoy es WhatsApp; mañana puede ser Stripe/PayPal para tienda y/o membresías)
- Donaciones (probablemente reutiliza el mismo mecanismo de pago que la tienda, no uno aparte)
- Más secciones del equipo: categorías formativas (reserva, juveniles), quizás con sus propios planteles/partidos
- Más torneos/competencias en paralelo (ya cubierto por el modelo `competitions`/`stages`)

Ningún ítem de esta lista se construye todavía. Se listan para que las decisiones de arquitectura de abajo no los bloqueen innecesariamente.

---

## Estructura de carpetas

```
app/                        → rutas (App Router)
components/
  ui/                        → primitivos reutilizables (Button, Card, Badge, Input)
  layout/                    → Navbar, Footer, SubscribeModal
  home/, futbol/, barras/, tienda/, admin/   → componentes específicos de cada dominio
lib/
  supabase/
    client.ts                 → cliente de Supabase (browser + server, separados)
    queries/                  → una función por consulta, agrupadas por dominio (posts.ts, matches.ts, products.ts...)
  services/                  → lógica de negocio que no es solo "traer datos" (ej. armar el mensaje de WhatsApp, calcular standings en la app si aplica)
  types/                     → tipos TS derivados del schema de Supabase
  utils/                     → helpers puros, sin dependencias externas
```

## Principio clave: nunca llamar a Supabase directo desde un componente

Todo acceso a datos pasa por `lib/supabase/queries/`. Un componente de UI nunca importa el cliente de Supabase directamente ni escribe un `.from('posts').select()` inline.

```ts
// lib/supabase/queries/posts.ts
export async function getPublishedPosts(limit = 10) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
```

**Por qué importa para escalabilidad:** el día que "más usuarios" signifique cache, paginación real, o cambiar de Supabase a otra fuente para cierto dominio, el cambio se hace en un solo archivo por dominio, no rastreando cada componente que hizo su propia query.

## Componentes

- **Un componente, una responsabilidad.** Si un componente arma datos Y los muestra Y maneja un formulario, dividirlo.
- **Server Components por defecto.** Solo marcar `'use client'` cuando hay estado/interactividad real (formularios, carrito, filtros). El carrito, por ejemplo, sí es client — depende de estado local.
- **Props tipadas explícitamente**, nunca `any`. Si un componente se repite entre secciones (ej. una tarjeta de post y una tarjeta de producto comparten estructura visual), extraer a `components/ui/` con props genéricas en vez de duplicar.
- **Nombrar por lo que hace, no por dónde vive:** `MatchScoreCard`, no `Card2`.

## Capa de pagos — el punto que más importa para el futuro

Hoy el "checkout" es: armar carrito → generar link de WhatsApp → registrar `order`. Para que el día de mañana un pago real (Stripe, membresías, donaciones) no obligue a reescribir todo el flujo de tienda, la generación del pedido se abstrae detrás de una interfaz:

```ts
// lib/services/checkout.ts
interface CheckoutProvider {
  submitOrder(cart: CartItem[], contact: ContactInfo): Promise<OrderResult>;
}

// implementación actual
export const whatsappCheckout: CheckoutProvider = {
  async submitOrder(cart, contact) {
    const order = await createOrder(cart, contact);   // persiste en Supabase
    const url = buildWhatsAppLink(order);              // genera wa.me/...
    return { order, redirectUrl: url };
  }
};
```

El componente de carrito llama a `checkoutProvider.submitOrder(...)`, no conoce si es WhatsApp o Stripe. Cuando se agregue un proveedor de pago real, se escribe `stripeCheckout: CheckoutProvider` y se cambia la instancia inyectada, sin tocar el componente de carrito. **Donaciones**, cuando existan, deberían reusar esta misma interfaz (`donationCheckout: CheckoutProvider` con un "carrito" de un solo ítem) en vez de construir un flujo de pago paralelo.

## Cuentas de usuario — separar admin de público desde ya

Ya existe `admin_users` (allowlist de administradores). Cuando aparezcan cuentas públicas (favoritos, comentarios, etc.), **no deben mezclarse con `admin_users`** — conviene reservar el nombre `profiles` para usuarios públicos desde el día uno, aunque la tabla no exista todavía, para que no haya colisión de modelo mental ni migración incómoda después:

```
auth.users          → nativa de Supabase, todos los que se registran (admins y público futuro)
admin_users          → allowlist de quienes pueden entrar a /admin (ya existe)
profiles             → (futuro) datos públicos de hinchas registrados — NO construir todavía
```

## TypeScript y calidad

- `strict: true` en `tsconfig.json`, sin excepciones
- Tipos de la base de datos generados con `supabase gen types typescript` (no tipos escritos a mano que se desincronizan del schema real)
- Sin `any`; `unknown` + narrowing si el tipo es genuinamente incierto
- Un archivo de tipos de dominio (`lib/types/`) separado de los tipos autogenerados de Supabase, para tipos derivados/UI (ej. `CartItem`, que no es una tabla)

## Performance / escalabilidad técnica (la de "más usuarios")

- **ISR/revalidate** en páginas de contenido que no cambia por request (Historia, Cánticos, posts ya publicados) — no todo necesita ser dinámico en cada visita
- **Paginación desde el inicio** en listados que van a crecer (posts, productos, calendario de temporada) — no cargar "todos los registros" aunque hoy sean pocos
- **Índices en Supabase** desde el schema inicial en las columnas que se filtran seguido: `matches.stage_id`, `posts.published_at`, `products.category`

## Testing

Dado que ya usás Playwright en otros proyectos: tests E2E para los flujos críticos (envío de pedido por WhatsApp, alta de newsletter, login de admin), no cobertura exhaustiva de unit tests para UI simple.

## Observabilidad y monitoreo

Tres capas distintas, cada una cubre algo que las otras no ven:

1. **Uptime** (¿responde el sitio?) — servicio externo de ping. Revisar el plan gratuito vigente del proveedor elegido al momento de implementar (este espacio cambia seguido y las condiciones de "uso no comercial" varían entre servicios).
2. **Errores de código en producción** — Sentry (`@sentry/nextjs`, plan Developer gratuito). Se integra en la capa de `lib/supabase/queries/` para capturar errores centralizadamente, no dispersos por componentes.
3. **Salud real del backend** (Supabase respondiendo correctamente, no solo "Next.js está arriba") — endpoint dedicado `/api/health`, que es el que debe monitorear el servicio de uptime (no la homepage).

### `/api/health` — reglas específicas para entorno serverless

```ts
// app/api/health/route.ts
export const dynamic = 'force-dynamic';  // nunca cachear
export const revalidate = 0;
export const runtime = 'edge';           // cold start más rápido

export async function GET() {
  try {
    const { error } = await supabase.from('posts').select('id').limit(1);
    if (error) throw error;
    return Response.json({ status: 'ok' }, { status: 200 });
  } catch (e) {
    Sentry.captureException(e);           // detalle real va a Sentry, no a la respuesta
    return Response.json({ status: 'error' }, { status: 500 });
  }
}
```

- **Solo usar `supabase-js`** (REST/PostgREST) para queries, nunca un cliente Postgres directo (`pg`, conexión directa de Prisma) en funciones serverless — evita agotar el pool de conexiones de Supabase con invocaciones frecuentes.
- **Nunca exponer detalle de error** en la respuesta pública del endpoint (mensajes de Supabase, stack traces) — es una ruta pública sin auth.
- **Configurar el timeout del monitor externo con margen** (5-10s), no ajustado al límite, para no generar falsas alarmas por cold start.
