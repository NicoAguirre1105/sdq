import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { getPublishedPosts } from "@/lib/supabase/queries/posts";
import { getPublishedCanticos } from "@/lib/supabase/queries/canticos";

const STATIC_ROUTES = ["", "/historia", "/futbol", "/futbol/calendario", "/canticos", "/plantilla", "/terminos"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  // ponytail: getPublishedPosts pagina de a 9; pageSize alto trae todo en una sola
  // llamada. Subir si la hinchada supera los 1000 posts publicados.
  const { posts } = await getPublishedPosts(1, 1000);
  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/post/${post.slug}`,
    lastModified: post.published_at ?? undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const canticos = await getPublishedCanticos();
  const canticoEntries: MetadataRoute.Sitemap = canticos.map((c) => ({
    url: `${siteUrl}/canticos/${c.slug}`,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [...staticEntries, ...postEntries, ...canticoEntries];
}
