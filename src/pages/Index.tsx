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

  const bySlug = (slug: string) => posts.filter((p) => p.category_slug === slug).slice(0, 3);
  const comparisons = bySlug("comparisons");
  const automation = bySlug("automation");
  const productivity = bySlug("productivity");

  const coreAreas = ["AI Tools", "Automation", "Productivity", "Comparisons"];

  return (
    <SiteLayout>
      <Seo
        title="AI Compass — AI Tools, Automation & Productivity"
        description="An independent publication covering the AI tools, automation, and workflows that actually move work forward."
        canonicalPath="/"
        image={heroImage}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "AI Compass",
          description:
            "AI tools, automation, productivity, and comparisons for modern professionals.",
        }}
      />

      {/* Hero — compact, fits within first viewport on 1366x768+ */}
      <section className="relative overflow-hidden bg-gradient-hero border-b border-border">
        <div className="absolute inset-0 -z-10 opacity-[0.3] [background-image:radial-gradient(hsl(var(--primary)/0.08)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="container py-10 md:py-12 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12 items-start">
            <div className="animate-fade-up lg:col-span-7">
              <p className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-primary font-semibold">
                <span className="h-px w-8 bg-primary/60" />
                Independent · Editorial · Practical
              </p>
              <h1 className="mt-4 font-serif text-[2.25rem] sm:text-5xl lg:text-[3.75rem] font-semibold tracking-tight leading-[1.05] text-balance">
                Clear thinking on{" "}
                <span className="text-primary">AI that earns its place in your week.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed text-pretty">
                We read the release notes, run the tools, and write what we'd tell a colleague.
                No hype, no hot takes — just the workflows worth your time.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to="/category/ai-tools"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft hover:bg-primary-glow transition"
                >
                  Explore AI Tools <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/category/automation"
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium hover:border-primary/40 hover:text-primary transition"
                >
                  Explore Automation
                </Link>
              </div>

              <div className="mt-7 border-t border-border pt-4">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">What we cover</p>
                <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-foreground/80">
                  {coreAreas.map((area) => (
                    <li key={area} className="inline-flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relative animate-fade-up lg:col-span-5 lg:mt-10">
              <div className="absolute -inset-6 -z-10 rounded-3xl bg-primary/5 blur-2xl" />
              <img
                src={heroImage}
                alt="AI workflows and productivity dashboards illustration"
                className="w-full h-auto max-h-[420px] object-cover rounded-2xl shadow-card"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured / Latest */}
      <section className="container py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight">Featured articles</h2>
          <Link to="/category/ai-tools" className="text-sm font-medium text-primary hover:text-primary-glow">
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

      {/* Categories */}
      <section className="container py-12 md:py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight">Explore by topic</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-2">
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
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {c.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Explore <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Per-category strips */}
      {[
        { slug: "comparisons", title: "Latest comparisons", items: comparisons },
        { slug: "automation", title: "Automation guides", items: automation },
        { slug: "productivity", title: "Productivity tips", items: productivity },
      ].map(
        (block) =>
          block.items.length > 0 && (
            <section key={block.slug} className="container py-10 md:py-14">
              <div className="flex items-end justify-between mb-6">
                <h2 className="font-serif text-2xl md:text-3xl tracking-tight">{block.title}</h2>
                <Link
                  to={`/category/${block.slug}`}
                  className="text-sm font-medium text-primary hover:text-primary-glow"
                >
                  More →
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {block.items.map((p) => (
                  <PostCard key={p.slug} post={p} />
                ))}
              </div>
            </section>
          ),
      )}
    </SiteLayout>
  );
};

export default Index;
