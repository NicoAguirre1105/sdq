# Modelo de datos — Supabase

## Principio general
Fútbol/calendario/standings comparten una sola fuente de verdad (`matches`, con todos los equipos del torneo, no solo SD Quito), para poder calcular la tabla de posiciones en vez de ingresarla a mano. Contenido estático (Historia, Cánticos) vive en MDX en el repo, no en estas tablas.

---

## Editorial

```sql
create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content_md text not null,
  category text check (category in ('noticia','cronica','aviso','cantico')),
  cover_image text,
  published_at timestamptz default now()
);
```

## Fútbol

```sql
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text,
  logo_url text,
  is_own_team boolean default false   -- true solo para SD Quito
);

create table seasons (
  id uuid primary key default gen_random_uuid(),
  label text unique not null,          -- "2026"
  is_current boolean default false
);

-- on delete cascade en toda la jerarquía Fútbol: borrar temporada → competiciones →
-- stages → partidos + stage_teams; borrar equipo → sus partidos + stage_teams. La UI
-- de admin (borrar temporada/competición/stage/equipo) confía en esto.
create table competitions (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete cascade,
  name text not null,                  -- "Serie B 2026", "Copa Ecuador 2026"
  slug text not null
);

create table stages (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid references competitions(id) on delete cascade,
  name text not null,                  -- "Fase 1", "Grupo A", "Octavos de Final"
  slug text not null,
  format text check (format in ('liga', 'eliminacion')) not null,
  order_index int default 0,
  -- solo aplica si format = 'eliminacion': 'fijo' = el cuadro completo (octavos a
  -- la final) se conoce de antemano, equipos de rondas futuras pueden quedar en
  -- null hasta saberse; 'sorteo' = los cruces de la siguiente ronda se cargan
  -- recién después del sorteo de la ronda anterior.
  bracket_mode text check (bracket_mode in ('fijo', 'sorteo')),
  -- solo aplica si bracket_mode = 'fijo': cantidad de rondas hasta la final
  -- (incluida), usado para generar los 2^total_rounds - 1 partidos placeholder.
  total_rounds int
);

-- solo aplica si stage.format = 'liga'
create table stage_teams (
  stage_id uuid references stages(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  primary key (stage_id, team_id)
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid references stages(id) on delete cascade,
  matchday int,                        -- usado si format = 'liga'
  round_name text,                     -- usado si format = 'eliminacion' (ej. "Semifinal")
  tie_id uuid,                         -- agrupa ida/vuelta de la misma llave (null si partido único)
  leg int,                             -- 1 = ida, 2 = vuelta (null si partido único)
  bracket_slot int,                    -- posición dentro de su ronda en un bracket 'fijo' generado (0-indexed)
  home_team_id uuid references teams(id) on delete cascade,
  away_team_id uuid references teams(id) on delete cascade,
  match_date timestamptz,              -- null = fecha sin confirmar
  score_home int,
  score_away int,
  status text check (status in ('programado','jugado','suspendido')) default 'programado',
  created_at timestamptz default now(), -- desempate de orden para partidos sin fecha (orden de ingreso)
  ticket_url text,                     -- null = sin venta de entradas para este partido
  venue text                           -- null = estadio sin confirmar
);

-- vista calculada, NO se edita directamente. Solo tiene sentido para stages format='liga'
create view standings as
select
  s.id as stage_id,
  t.id as team_id,
  t.name as team_name,
  count(m.id) as played,
  sum(case
    when (m.home_team_id = t.id and m.score_home > m.score_away)
      or (m.away_team_id = t.id and m.score_away > m.score_home) then 1 else 0 end) as won,
  sum(case when m.score_home = m.score_away then 1 else 0 end) as drawn,
  sum(case
    when (m.home_team_id = t.id and m.score_home < m.score_away)
      or (m.away_team_id = t.id and m.score_away < m.score_home) then 1 else 0 end) as lost,
  sum(case when m.home_team_id = t.id then m.score_home else m.score_away end) as goals_for,
  sum(case when m.home_team_id = t.id then m.score_away else m.score_home end) as goals_against
from stage_teams st
join teams t on t.id = st.team_id
join stages s on s.id = st.stage_id
left join matches m on m.stage_id = s.id
  and (m.home_team_id = t.id or m.away_team_id = t.id)
  and m.status = 'jugado'
group by s.id, t.id, t.name;
-- points/position se calculan en la capa de aplicación (o se agrega columna computada) a partir de won/drawn/lost
```

## Plantilla

```sql
create table players (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  position text,           -- "Portero", "Defensa", "Mediocampista", "Delantero", "Cuerpo técnico"
  jersey_number int,       -- null para cuerpo técnico
  staff_role text,         -- siglas del cargo (ej. "DT") si position = "Cuerpo técnico"
  photo_url text,
  bio_md text
);
```

## Tienda

**No hay checkout ni pagos en el sitio.** El carrito es solo estado del cliente (React state + `localStorage`). Al enviar el pedido, se genera un link `wa.me` con el resumen y se persiste un registro de la intención de compra (para historial y control de stock) — el pago y la coordinación real ocurren en WhatsApp, fuera del sitio.

```sql
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description_md text,
  price numeric not null,
  stock int default 0,
  images text[],
  category text
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  contact_name text,
  contact_phone text,
  status text check (status in ('enviado','confirmado','entregado','cancelado')) default 'enviado',
  created_at timestamptz default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  product_id uuid references products(id),
  quantity int not null,
  unit_price numeric not null   -- precio al momento del pedido
);
```

**Flujo:** usuario arma el carrito (client-side) → botón "Enviar pedido por WhatsApp" → se crea `order` + `order_items` en Supabase con status `enviado` → se abre `https://wa.me/<numero>?text=<resumen>` → la venta se coordina y paga por WhatsApp → el admin actualiza el `status` manualmente desde `/admin` a medida que avanza (`confirmado`, `entregado`, o `cancelado`).

**Stock:** no se descuenta automáticamente al enviar el pedido (no hay pago confirmado todavía) — el admin lo ajusta manualmente al confirmar la venta, para evitar descontar stock de pedidos que no se concretan.

## Auth / Admin

Permisos iguales entre los 2-3 administradores — no hay roles distintos, solo una lista blanca de quién puede entrar a `/admin`.

```sql
create table admin_users (
  id uuid primary key references auth.users(id),
  full_name text not null,
  created_at timestamptz default now()
);
```

- `auth.users` es la tabla nativa de Supabase Auth. `admin_users` es la allowlist: si el `id` autenticado no está ahí, no entra a `/admin` aunque el login sea válido.
- Se agregan personas manualmente (Supabase Auth dashboard + insert en `admin_users` desde Supabase Studio) — no requiere UI de invitación, son pocas personas y cambia muy rara vez.
- Protección de rutas: middleware de Next.js con `matcher` acotado a `/admin/:path*` (evita gastar Edge Requests en tráfico público).
- **RLS en todas las tablas gestionables:** lectura pública donde corresponda, escritura solo para filas presentes en `admin_users`. Ejemplo:

```sql
alter table posts enable row level security;

create policy "public read published posts"
  on posts for select
  using (published_at <= now());

create policy "admins manage posts"
  on posts for all
  using (exists (select 1 from admin_users where id = auth.uid()));
```

Mismo patrón se replica en `matches`, `stages`, `competitions`, `teams`, `products`, `players`. `subscribers` y `orders` nunca son de lectura pública (solo admins).

## Newsletter

```sql
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  topics text[] default '{}',      -- temas elegidos: 'club' | 'tienda' | 'canticos'
  kit_subscriber_id text,          -- id del subscriber en Kit, para cruzar con el webhook
  confirmed boolean default false, -- lo activa el webhook al confirmar, no el alta inicial
  accepted_terms_at timestamptz,   -- constancia de aceptación de términos (/terminos)
  subscribed_at timestamptz default now()
);
```

**Flujo de alta (doble opt-in):** el form (`components/layout/SubscribeForm.tsx`) es de 2 pasos. Paso 1 llama a `subscriber_status(email)` (función `security definer`, devuelve `new`/`pending`/`confirmed` sin exponer lectura pública de la tabla). Si es nuevo, el paso 2 pide aceptar términos (`/terminos`) y confirmar; al enviar, `subscribeAction` agrega el correo a **Kit** (`lib/kit.ts`, que dispara el correo de verificación) y lo guarda como `confirmed = false`. Cuando el usuario confirma desde el correo, Kit dispara un webhook (`app/api/kit/webhook/route.ts`) que marca `confirmed = true` vía service role. El webhook se protege con `KIT_WEBHOOK_SECRET` en la query (`?token=`) porque Kit no firma los webhooks.

**Gestión/baja:** `/suscripcion/gestionar?email=<correo>` (sin login, el email de la URL identifica al suscriptor) permite editar `topics` o darse de baja — borra la fila y llama a `removeFromKit`. El link va en el footer de los broadcasts (`lib/kit.ts`, merge tag `{{ subscriber.email_address }}`).

Kit también tiene su propio link de baja de cumplimiento (uno-clic, no reemplazable) en cada correo. `app/api/kit/webhook/route.ts` ya sabe manejar `?event=unsubscribe` (borra la fila sin volver a llamar a Kit) para cuando eso pase — pero **el plan free de Kit no tiene Automations**, así que no hay forma de registrar ese webhook desde el dashboard todavía; queda listo para el día que se suba de plan. Mientras tanto, `app/api/cron/sync-unsubscribes` (programado en `vercel.json`, corre 1 vez por día) sincroniza por polling: recorre los suscriptores de Supabase, consulta su `state` en Kit (`getKitSubscriberState`) y borra los que ya no estén `active` ahí.

## Configuración del sitio

Fila única (singleton, `id boolean` fijo en `true`) para textos editables desde el admin que no justifican tabla propia — hoy el headline y el subtítulo del hero de Home. Si se suman más campos editables del sitio, se agregan como columnas acá, no como tablas nuevas.

```sql
create table site_settings (
  id boolean primary key default true check (id),
  hero_headline text not null default 'la akd quiere mantener el liderato',
  hero_subtitle text not null default 'Virtualmente con cupo en la final de Copa Pichincha y clasificados como primero de grupo, la AKD busca terminar el trabajo de buena manera en el último partido de esta fase.'
);
```

RLS: lectura pública (el hero se muestra a cualquier visitante), escritura solo admins — mismo patrón que el resto.

## Pendiente de definir
- Cálculo de `points`/`position` en standings: columna computada vs. cálculo en la app
- Número(s) de WhatsApp de destino y formato exacto del mensaje generado desde el carrito
