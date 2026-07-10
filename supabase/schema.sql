-- SD Quito — schema inicial
-- Correr una sola vez en el SQL Editor de Supabase (o vía `supabase db push` si usas el CLI).
-- Cubre todo el modelo de data-model.md, aunque Fútbol/Tienda/Admin no tengan UI todavía
-- (evita migraciones incrementales incómodas más adelante).

-- ============ Editorial ============

create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content_md text not null,
  category text check (category in ('noticia', 'cronica', 'aviso', 'cantico')),
  cover_image text,
  published_at timestamptz default now()
);

create index posts_published_at_idx on posts (published_at desc);

-- ============ Fútbol ============

create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text,
  logo_url text,
  is_own_team boolean default false
);

create table seasons (
  id uuid primary key default gen_random_uuid(),
  label text unique not null,
  is_current boolean default false
);

create table competitions (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete cascade,
  name text not null,
  slug text not null
);

create table stages (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid references competitions(id) on delete cascade,
  name text not null,
  slug text not null,
  format text check (format in ('liga', 'eliminacion')) not null,
  order_index int default 0
);

-- on delete cascade en toda la jerarquía: borrar una temporada arrastra sus
-- competiciones → stages → partidos + stage_teams; borrar un equipo arrastra sus
-- partidos y su presencia en las tablas. La UI de admin confía en esto para el borrado.
create table stage_teams (
  stage_id uuid references stages(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  primary key (stage_id, team_id)
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid references stages(id) on delete cascade,
  matchday int,
  round_name text,
  tie_id uuid,
  leg int,
  home_team_id uuid references teams(id) on delete cascade,
  away_team_id uuid references teams(id) on delete cascade,
  match_date timestamptz,   -- null = fecha sin confirmar
  score_home int,
  score_away int,
  status text check (status in ('programado', 'jugado', 'suspendido')) default 'programado',
  created_at timestamptz default now()   -- desempate de orden para partidos sin fecha
);

create index matches_stage_id_idx on matches (stage_id);

create view standings with (security_invoker = true) as
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

-- ============ Plantilla ============

create table players (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  position text,               -- incluye 'Cuerpo técnico' (ver lib/positions.ts)
  jersey_number int,           -- null para cuerpo técnico
  staff_role text,             -- siglas del cargo (ej. 'DT') si position = 'Cuerpo técnico'
  photo_url text,
  bio_md text
);

-- ============ Tienda ============

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

create index products_category_idx on products (category);

create table orders (
  id uuid primary key default gen_random_uuid(),
  contact_name text,
  contact_phone text,
  status text check (status in ('enviado', 'confirmado', 'entregado', 'cancelado')) default 'enviado',
  created_at timestamptz default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  product_id uuid references products(id),
  quantity int not null,
  unit_price numeric not null
);

-- ============ Newsletter ============

create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  topics text[] default '{}',
  kit_subscriber_id text,          -- id del subscriber en Kit, para cruzar con el webhook
  confirmed boolean default false, -- lo activa el webhook al confirmar, no el alta inicial
  accepted_terms_at timestamptz,   -- constancia de aceptación de términos
  subscribed_at timestamptz default now()
);

-- Estado de un correo sin exponer lectura pública de la tabla: security definer
-- corre como owner (salta RLS) y devuelve solo 'new' | 'pending' | 'confirmed'.
-- Lo usa el paso 1 del form de suscripción vía rpc.
create or replace function subscriber_status(p_email text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_confirmed boolean;
begin
  select confirmed into v_confirmed
  from subscribers where email = lower(trim(p_email));
  if not found then return 'new';
  elsif v_confirmed then return 'confirmed';
  else return 'pending';
  end if;
end;
$$;

grant execute on function subscriber_status(text) to anon, authenticated;

-- ============ Auth / Admin ============

create table admin_users (
  id uuid primary key references auth.users(id),
  full_name text not null,
  created_at timestamptz default now()
);

-- ============ RLS ============

alter table posts enable row level security;
alter table teams enable row level security;
alter table seasons enable row level security;
alter table competitions enable row level security;
alter table stages enable row level security;
alter table stage_teams enable row level security;
alter table matches enable row level security;
alter table players enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table subscribers enable row level security;
alter table admin_users enable row level security;

-- lectura pública donde corresponde
create policy "public read published posts" on posts for select using (published_at <= now());
create policy "public read teams" on teams for select using (true);
create policy "public read seasons" on seasons for select using (true);
create policy "public read competitions" on competitions for select using (true);
create policy "public read stages" on stages for select using (true);
create policy "public read stage_teams" on stage_teams for select using (true);
create policy "public read matches" on matches for select using (true);
create policy "public read players" on players for select using (true);
create policy "public read products" on products for select using (true);

-- alta pública de newsletter: cualquiera puede insertar, nadie lee desde el cliente
create policy "anyone can subscribe" on subscribers for insert with check (true);

-- escritura solo para admins (allowlist)
create policy "admins manage posts" on posts for all using (exists (select 1 from admin_users where id = auth.uid()));
create policy "admins manage teams" on teams for all using (exists (select 1 from admin_users where id = auth.uid()));
create policy "admins manage seasons" on seasons for all using (exists (select 1 from admin_users where id = auth.uid()));
create policy "admins manage competitions" on competitions for all using (exists (select 1 from admin_users where id = auth.uid()));
create policy "admins manage stages" on stages for all using (exists (select 1 from admin_users where id = auth.uid()));
create policy "admins manage stage_teams" on stage_teams for all using (exists (select 1 from admin_users where id = auth.uid()));
create policy "admins manage matches" on matches for all using (exists (select 1 from admin_users where id = auth.uid()));
create policy "admins manage players" on players for all using (exists (select 1 from admin_users where id = auth.uid()));
create policy "admins manage products" on products for all using (exists (select 1 from admin_users where id = auth.uid()));
create policy "admins manage orders" on orders for all using (exists (select 1 from admin_users where id = auth.uid()));
create policy "admins manage order_items" on order_items for all using (exists (select 1 from admin_users where id = auth.uid()));
create policy "admins manage subscribers" on subscribers for select using (exists (select 1 from admin_users where id = auth.uid()));
create policy "admins update subscribers" on subscribers for update using (exists (select 1 from admin_users where id = auth.uid()));
create policy "admins delete subscribers" on subscribers for delete using (exists (select 1 from admin_users where id = auth.uid()));
-- comparación directa, sin subconsulta contra admin_users: evita la recursión infinita
-- que se dispara si esta política intentara comprobarse contra sí misma
create policy "admins manage own row" on admin_users for all using (id = auth.uid());

-- ============ Storage ============
-- Bucket público para portadas de posts. La lectura es pública por el flag `public`
-- del bucket (se sirve vía getPublicUrl); solo la escritura pasa por RLS de admins.
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create policy "admins upload post-images" on storage.objects for insert
  with check (bucket_id = 'post-images' and exists (select 1 from admin_users where id = auth.uid()));
create policy "admins update post-images" on storage.objects for update
  using (bucket_id = 'post-images' and exists (select 1 from admin_users where id = auth.uid()));
create policy "admins delete post-images" on storage.objects for delete
  using (bucket_id = 'post-images' and exists (select 1 from admin_users where id = auth.uid()));
-- SELECT necesario para que el admin pueda borrar objetos (storage.remove filtra por RLS
-- de forma silenciosa: sin este policy, remove() no borra nada y no lanza error). La
-- lectura pública sigue viniendo del flag `public` del bucket vía CDN, no de acá.
create policy "admins read post-images" on storage.objects for select
  using (bucket_id = 'post-images' and exists (select 1 from admin_users where id = auth.uid()));

-- Bucket público para escudos de equipos. Solo SVG (image/svg+xml), hasta 1 MB —
-- el límite y el mime los aplica el bucket; acá van las policies de escritura (admins).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('team_logos', 'team_logos', true, 1048576, array['image/svg+xml'])
on conflict (id) do nothing;

create policy "admins upload team_logos" on storage.objects for insert
  with check (bucket_id = 'team_logos' and exists (select 1 from admin_users where id = auth.uid()));
create policy "admins update team_logos" on storage.objects for update
  using (bucket_id = 'team_logos' and exists (select 1 from admin_users where id = auth.uid()));
create policy "admins delete team_logos" on storage.objects for delete
  using (bucket_id = 'team_logos' and exists (select 1 from admin_users where id = auth.uid()));
create policy "admins read team_logos" on storage.objects for select
  using (bucket_id = 'team_logos' and exists (select 1 from admin_users where id = auth.uid()));

-- Bucket público para fotos de jugadores. Imagen rasterizada (jpg/png/webp), hasta 2 MB.
-- La foto es opcional: sin foto, la grilla usa un placeholder. Mismas 4 policies de admin.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('player_photos', 'player_photos', true, 2097152,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "admins upload player_photos" on storage.objects for insert
  with check (bucket_id = 'player_photos' and exists (select 1 from admin_users where id = auth.uid()));
create policy "admins update player_photos" on storage.objects for update
  using (bucket_id = 'player_photos' and exists (select 1 from admin_users where id = auth.uid()));
create policy "admins delete player_photos" on storage.objects for delete
  using (bucket_id = 'player_photos' and exists (select 1 from admin_users where id = auth.uid()));
create policy "admins read player_photos" on storage.objects for select
  using (bucket_id = 'player_photos' and exists (select 1 from admin_users where id = auth.uid()));
