# SD Quito

Portal de la hinchada de Sociedad Deportivo Quito — noticias, historia, seguimiento deportivo, contenido de barras y tienda de merchandising.

## Stack

Next.js (App Router) + TypeScript, Tailwind CSS, Supabase (Postgres + Auth + Storage).

## Desarrollo

```bash
npm run dev    # http://localhost:3000
npm run build
npm start
```

Requiere un archivo `.env.local` (ver `.env.local.example`) con las credenciales del proyecto de Supabase, y el schema aplicado desde `supabase/schema.sql` + `supabase/seed.sql`.

Ver `CLAUDE.md` y `.claude/*.md` para el contexto completo del proyecto (modelo de datos, guía de código, mapa del sitio).
