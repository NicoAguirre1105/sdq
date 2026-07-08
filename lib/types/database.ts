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
  category: "noticia" | "cronica" | "aviso" | null;
  cover_image: string | null;
  published_at: string | null; // null = borrador (oculto para el público por RLS)
};

type Player = {
  id: string;
  full_name: string;
  position: string | null;
  jersey_number: number | null;
  photo_url: string | null;
  bio_md: string | null;
};

type Subscriber = {
  id: string;
  email: string;
  topics: string[];
  confirmed: boolean;
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
  home_team_id: string;
  away_team_id: string;
  match_date: string | null;
  score_home: number | null;
  score_away: number | null;
  status: "programado" | "jugado" | "suspendido";
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
      admin_users: {
        Row: AdminUser;
        Insert: Partial<AdminUser> & Pick<AdminUser, "id" | "full_name">;
        Update: Partial<AdminUser>;
        Relationships: [];
      };
    };
    Views: {
      standings: {
        Row: Standing;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
  };
};
