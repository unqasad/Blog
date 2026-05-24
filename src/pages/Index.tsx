import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SiteLayout from "@/components/SiteLayout";
import Seo from "@/components/Seo";
import PostCard, { PostCardData } from "@/components/PostCard";
import { CATEGORIES } from "@/lib/categories";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero.jpg";

const TRENDING_TOOLS = [
  { name: "ChatGPT", tag: "Assistant" },
  { name: "Claude", tag: "Long-form" },
  { name: "Gemini", tag: "Multimodal" },
  { name: "Notion AI", tag: "Workspace" },
  { name: "Perplexity", tag: "Research" },
];

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
  const tutorials = bySlug("tutorials");
  const automation = bySlug("automation");
  const productivity = bySlug("productivity");

  return (
    <SiteLayout>
      <Seo
        title="AI Compass — AI Tools, Automation & Productivity for Modern Creators"
        description="A modern publication on AI tools, tutorials, automation, and productivity workflows for creators, freelancers, students, and digital professionals."
        canonicalPath="/"
        image={heroImage}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "AI Compass",
          description:
            "AI tools, tutorials, automation, and productivity workflows for modern digital professionals.",
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero border-b border-border">
        <div className="absolute inset-0 -z-10 opacity-[0.35] [background-image:radial-gradient(hsl(var(--primary)/0.08)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="container py-20 md:py-28 lg:py-32 grid gap-14 md:gap-16 lg:grid-cols-12 items-center">
          <div className="animate-fade-up lg:col-span-7">
            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-primary font-semibold">
              <span className="h-px w-8 bg-primary/60" />
              AI · Automation · Productivity
            </p>
            <h1 className="mt-5 font-serif text-[2.5rem] sm:text-5xl lg:text-[4.25rem] tracking-tight leading-[1.04] text-balance">
              Work smarter with{" "}
              <span className="text-primary">AI and modern workflows</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
              Practical tutorials, honest tool reviews, and automation playbooks for creators,
              freelancers, students, and remote teams who want to ship more in less time.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/category/ai-tools"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft hover:bg-primary-glow transition"
              >
                Explore AI Tools <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/category/tutorials"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-sm font-medium hover:border-primary/40 hover:text-primary transition"
              >
                Browse Tutorials
              </Link>
            </div>
            <dl className="mt-12 grid grid-cols-3 gap-6 max-w-md border-t border-border pt-6">
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Focus</dt>
                <dd className="mt-1 font-serif text-base">Workflows</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Tone</dt>
                <dd className="mt-1 font-serif text-base">Practical</dd>
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
              alt="Editorial illustration of an AI productivity workspace: assistant chat, automation flows, and a focus dashboard"
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
            Four focused hubs covering AI tools, hands-on tutorials, automation, and productivity.
          </p>
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

      {/* Featured / Latest */}
      <section className="container py-12 md:py-16">
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

      {/* Trending AI Tools */}
      <section className="container py-12 md:py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight">Trending AI tools</h2>
          <Link to="/category/ai-tools" className="text-sm font-medium text-primary hover:text-primary-glow">
            All tools →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TRENDING_TOOLS.map((t) => (
            <div
              key={t.name}
              className="rounded-xl border border-border bg-card p-5 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition"
            >
              <Sparkles className="h-5 w-5 text-primary" />
              <p className="mt-3 font-serif text-lg tracking-tight">{t.name}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{t.tag}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Per-category strips */}
      {[
        { slug: "tutorials", title: "Latest tutorials", items: tutorials },
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

      {/* Newsletter CTA */}
      <section className="container py-16">
        <div className="rounded-2xl border border-border bg-gradient-hero p-8 md:p-12 shadow-soft text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-primary font-semibold">Newsletter</p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl tracking-tight">
            New AI workflows in your inbox
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
            One short email with the best new tools, tutorials, and automation playbooks. No spam.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-6 flex max-w-md mx-auto gap-2"
          >
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="flex-1 rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-glow transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Index;
