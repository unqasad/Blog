import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SiteLayout from "@/components/SiteLayout";
import Seo from "@/components/Seo";
import PostCard, { PostCardData } from "@/components/PostCard";
import { CATEGORIES } from "@/lib/categories";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero.jpg";

const Index = () => {
  const [posts, setPosts] = useState<PostCardData[]>([]);

  useEffect(() => {
    supabase
      .from("posts")
      .select("slug,title,excerpt,category_slug,read_minutes,featured_image,published_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(9)
      .then(({ data }) => setPosts((data as PostCardData[]) ?? []));
  }, []);

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <SiteLayout>
      <Seo
        title="Affiliate Compass — Build a Stronger Online Income System"
        description="A modern publication on monetization, traffic, content strategy, and performance systems for builders who want sustainable online results."
        canonicalPath="/"
        image={heroImage}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Affiliate Compass",
          description:
            "A modern publication on monetization, traffic, content strategy, and performance systems.",
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero border-b border-border">
        <div className="absolute inset-0 -z-10 opacity-[0.35] [background-image:radial-gradient(hsl(var(--primary)/0.08)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="container py-20 md:py-28 lg:py-32 grid gap-14 md:gap-16 lg:grid-cols-12 items-center">
          <div className="animate-fade-up lg:col-span-7">
            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-primary font-semibold">
              <span className="h-px w-8 bg-primary/60" />
              A modern publication on online income
            </p>
            <h1 className="mt-5 font-serif text-[2.5rem] sm:text-5xl lg:text-[4.25rem] tracking-tight leading-[1.04] text-balance">
              Build a stronger{" "}
              <span className="text-primary">online income system</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
              A modern publication on monetization, traffic, content strategy, and performance
              systems for builders who want sustainable online results.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/category/start-here"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft hover:bg-primary-glow transition"
              >
                Start Here <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/category/offers-earnings"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-sm font-medium hover:border-primary/40 hover:text-primary transition"
              >
                Browse Offer Guides
              </Link>
            </div>
            <dl className="mt-12 grid grid-cols-3 gap-6 max-w-md border-t border-border pt-6">
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Focus</dt>
                <dd className="mt-1 font-serif text-base">Performance</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Tone</dt>
                <dd className="mt-1 font-serif text-base">No-hype</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Cadence</dt>
                <dd className="mt-1 font-serif text-base">Evergreen</dd>
              </div>
            </dl>
          </div>
          <div className="relative lg:col-span-5">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/10 via-transparent to-transparent blur-2xl" />
            <img
              src={heroImage}
              alt="Editorial illustration of an online income system: performance graph, content cards, and a conversion funnel"
              width={1600}
              height={1280}
              fetchPriority="high"
              className="rounded-2xl shadow-card border border-border w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight">Explore by topic</h2>
          <p className="hidden md:block text-sm text-muted-foreground max-w-md text-right">
            Six focused hubs covering everything from offer selection to compliance.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to={`/category/${c.slug}`}
              className="group rounded-xl border border-border bg-card p-6 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition"
            >
              <p className="text-xs uppercase tracking-wider text-primary font-semibold">
                {c.short}
              </p>
              <h3 className="mt-2 font-serif text-xl tracking-tight group-hover:text-primary transition-colors">
                {c.name}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {c.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Explore <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest posts */}
      <section className="container py-12 md:py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight">Latest articles</h2>
          <Link to="/category/start-here" className="text-sm font-medium text-primary hover:text-primary-glow">
            View all →
          </Link>
        </div>

        {featured && (
          <div className="mb-8">
            <PostCard post={featured} featured />
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
};

export default Index;
