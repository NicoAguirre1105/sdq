// ponytail: tipado a mano solo de las tablas que Fase 1 consulta (posts, players,
// subscribers, teams, matches). Reemplazar por completo con:
//   npx supabase gen types typescript --project-id <ref> --schema public > lib/types/database.ts
// en cuanto el proyecto de Supabase exista y el CLI esté logueado — no mantener este
// archivo a mano una vez que el generador esté disponible.

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_md: string;
  category: "noticia" | "cronica" | "aviso" | "cantico" | null;
  cover_image: string | null;
  published_at: string | null; // null = borrador (oculto para el público por RLS)
};

type CanticoLine = { role: "llamada" | "coro"; text: string };

type Cantico = {
  id: string;
  title: string;
  slug: string;
  classic: boolean;
  youtube_url: string | null;
  start_seconds: number;
  lines: CanticoLine[];
  published: boolean;
  order_index: number;
};

type Player = {
  id: string;
  full_name: string;
  position: string | null;
  jersey_number: number | null;
  staff_role: string | null; // siglas del cargo si position = 'Cuerpo técnico'
  photo_url: string | null;
  bio_md: string | null;
};

type Subscriber = {
  id: string;
  email: string;
  topics: string[];
  kit_subscriber_id: string | null; // id del subscriber en Kit, para cruzar con el webhook
  confirmed: boolean; // lo activa el webhook al confirmar; el alta lo deja en false
  accepted_terms_at: string | null; // constancia de aceptación de términos
  subscribed_at: string;
};

type Team = {
  id: string;
  name: string;
  short_name: string | null;
  logo_url: string | null;
  is_own_team: boolean;
};

type Season = {
  id: string;
  label: string;
  is_current: boolean;
};

type Competition = {
  id: string;
  season_id: string;
  name: string;
  slug: string;
};

type Stage = {
  id: string;
  competition_id: string;
  name: string;
  slug: string;
  format: "liga" | "eliminacion";
  order_index: number;
  bracket_mode: "fijo" | "sorteo" | null;
  total_rounds: number | null;
  is_finished: boolean;
};

// Fila de la vista calculada `standings` (ver supabase/schema.sql). Los conteos
// llegan como number; points/position se derivan en la capa de aplicación.
type Standing = {
  stage_id: string;
  team_id: string;
  team_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
};

type AdminUser = {
  id: string;
  full_name: string;
  created_at: string;
};

type Match = {
  id: string;
  stage_id: string;
  matchday: number | null;
  round_name: string | null;
  tie_id: string | null;
  leg: number | null;
  bracket_slot: number | null;
  // Nullable a nivel de Postgres desde siempre (no hacía falta ALTER): un cuadro
  // de eliminación "fijo" puede cargar rondas futuras sin saber los equipos todavía.
  home_team_id: string | null;
  away_team_id: string | null;
  match_date: string | null;
  score_home: number | null;
  score_away: number | null;
  status: "programado" | "jugado" | "suspendido";
  created_at: string;
  ticket_url: string | null;
  venue: string | null;
};

// Fila única (id siempre true) con textos editables desde el admin.
type SiteSettings = {
  id: true;
  hero_headline: string;
  hero_subtitle: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description_md: string | null;
  price: number;
  images: string[];
  category: string | null;
  sizes: string[] | null; // null/[] = sin talla (talla única u objeto)
  stock: number | null; // null = bajo pedido (sin límite); número = stock trackeado
  lead_time_message: string | null; // texto libre, visible solo en el detalle
  published: boolean;
  created_at: string;
};

type OrderItem = { product_name: string; size: string | null; quantity: number; unit_price: number };

// Log inmutable de pedidos enviados por WhatsApp — sin estado, no se edita.
type Order = {
  id: string;
  contact_name: string;
  contact_phone: string;
  items: OrderItem[];
  total: number;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      posts: {
        Row: Post;
        Insert: Partial<Post> & Pick<Post, "title" | "slug" | "content_md">;
        Update: Partial<Post>;
        Relationships: [];
      };
      canticos: {
        Row: Cantico;
        Insert: Partial<Cantico> & Pick<Cantico, "title" | "slug">;
        Update: Partial<Cantico>;
        Relationships: [];
      };
      players: {
        Row: Player;
        Insert: Partial<Player> & Pick<Player, "full_name">;
        Update: Partial<Player>;
        Relationships: [];
      };
      subscribers: {
        Row: Subscriber;
        Insert: Partial<Subscriber> & Pick<Subscriber, "email">;
        Update: Partial<Subscriber>;
        Relationships: [];
      };
      teams: {
        Row: Team;
        Insert: Partial<Team> & Pick<Team, "name">;
        Update: Partial<Team>;
        Relationships: [];
      };
      matches: {
        Row: Match;
        Insert: Partial<Match> &
          Pick<Match, "stage_id" | "home_team_id" | "away_team_id" | "match_date">;
        Update: Partial<Match>;
        Relationships: [];
      };
      seasons: {
        Row: Season;
        Insert: Partial<Season> & Pick<Season, "label">;
        Update: Partial<Season>;
        Relationships: [];
      };
      competitions: {
        Row: Competition;
        Insert: Partial<Competition> & Pick<Competition, "season_id" | "name" | "slug">;
        Update: Partial<Competition>;
        Relationships: [];
      };
      stages: {
        Row: Stage;
        Insert: Partial<Stage> & Pick<Stage, "competition_id" | "name" | "slug" | "format">;
        Update: Partial<Stage>;
        Relationships: [];
      };
      stage_teams: {
        Row: { stage_id: string; team_id: string };
        Insert: { stage_id: string; team_id: string };
        Update: Partial<{ stage_id: string; team_id: string }>;
        Relationships: [];
      };
      admin_users: {
        Row: AdminUser;
        Insert: Partial<AdminUser> & Pick<AdminUser, "id" | "full_name">;
        Update: Partial<AdminUser>;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSettings;
        Insert: Partial<SiteSettings>;
        Update: Partial<SiteSettings>;
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: Partial<Product> & Pick<Product, "name" | "slug" | "price">;
        Update: Partial<Product>;
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: Partial<Order> & Pick<Order, "contact_name" | "contact_phone" | "items" | "total">;
        Update: Partial<Order>;
        Relationships: [];
      };
    };
    Views: {
      standings: {
        Row: Standing;
        Relationships: [];
      };
    };
    Functions: {
      subscriber_status: {
        Args: { p_email: string };
        Returns: string; // 'new' | 'pending' | 'confirmed'
      };
    };
  };
};
