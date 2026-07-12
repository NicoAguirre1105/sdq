import { Hero } from "@/components/home/Hero";
import { PostCard } from "@/components/home/PostCard";
import { SubscribeForm } from "@/components/layout/SubscribeForm";
import { Container } from "@/components/ui/Container";
import { Pagination } from "@/components/ui/Pagination";
import { getPublishedPosts } from "@/lib/supabase/queries/posts";
import { getNextMatch } from "@/lib/supabase/queries/matches";
import { getSiteSettings } from "@/lib/supabase/queries/settings";
import { DEFAULT_HERO_HEADLINE, DEFAULT_HERO_SUBTITLE } from "@/lib/hero-defaults";

const POSTS_PER_PAGE = 9;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const [{ posts, total }, nextMatch, settings] = await Promise.all([
    getPublishedPosts(page, POSTS_PER_PAGE),
    getNextMatch(),
    getSiteSettings(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  return (
    <>
      <Hero
        nextMatch={nextMatch}
        headline={settings?.hero_headline ?? DEFAULT_HERO_HEADLINE}
        subtitle={settings?.hero_subtitle ?? DEFAULT_HERO_SUBTITLE}
      />

      <section className="bg-blanco-hueso">
        <Container className="px-4.5 py-8 md:px-10 md:py-8">
          <h2 className="mb-5 font-display text-[30px] text-tinta md:text-4xl">
            CRÓNICAS &amp; NOTICIAS
          </h2>
          <div className="grid grid-cols-1 gap-4.5 md:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} basePath="/" />
        </Container>
      </section>

      <section className="bg-rojo-bandera">
        <Container className="px-4.5 py-6.5 md:px-10 md:py-10">
          <SubscribeForm />
        </Container>
      </section>
    </>
  );
}
