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
  category text check (category in ('noticia','cronica','aviso')),
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
  order_index int default 0
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
  home_team_id uuid references teams(id) on delete cascade,
  away_team_id uuid references teams(id) on delete cascade,
  match_date timestamptz,              -- null = fecha sin confirmar
  score_home int,
  score_away int,
  status text check (status in ('programado','jugado','suspendido')) default 'programado',
  created_at timestamptz default now() -- desempate de orden para partidos sin fecha (orden de ingreso)
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
  kit_subscriber_id text,          -- id del subscriber en Kit, para referencia cruzada
  confirmed boolean default false, -- lo actualiza el webhook, no el alta inicial
  subscribed_at timestamptz default now()
);
```

## Pendiente de definir
- Cálculo de `points`/`position` en standings: columna computada vs. cálculo en la app
- Número(s) de WhatsApp de destino y formato exacto del mensaje generado desde el carrito
