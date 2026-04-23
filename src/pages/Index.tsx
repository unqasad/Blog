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
        title="Affiliate Compass — Practical Affiliate & CPA Marketing Guides"
        description="No-hype guides on affiliate marketing, CPA offers, tracking, conversions, traffic quality, and compliance. Build sustainable online income, the honest way."
        canonicalPath="/"
        image={heroImage}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Affiliate Compass",
          description:
            "Practical, no-hype guides on affiliate and CPA marketing.",
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero border-b border-border">
        <div className="container py-16 md:py-24 grid gap-10 md:grid-cols-2 items-center">
          <div className="animate-fade-up">
            <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">
              Practical · No-hype · Evergreen
            </p>
            <h1 className="mt-3 font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.05]">
              Affiliate marketing,<br />
              <span className="text-primary">explained honestly.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground leading-relaxed">
              A calm publication for beginners and struggling marketers. Pick better offers,
              fix tracking, lift conversions, stay compliant — and build income that lasts.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/category/start-here"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft hover:bg-primary-glow transition"
              >
                Start Here <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/category/offer-selection"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium hover:border-primary/40 transition"
              >
                Browse Offer Guides
              </Link>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroImage}
              alt="Editorial illustration of a marketing funnel and growth chart"
              width={1600}
              height={1024}
              className="rounded-2xl shadow-card border border-border"
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
