import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import SiteLayout from "@/components/SiteLayout";
import Seo from "@/components/Seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import Faq from "@/components/Faq";
import KeyTakeaways from "@/components/KeyTakeaways";
import NextStepCta from "@/components/NextStepCta";
import { CATEGORY_BY_SLUG } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { resolveImage } from "@/lib/image-map";
import { Clock, User } from "lucide-react";
import DOMPurify from "dompurify";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  meta_title: string;
  meta_description: string;
  featured_image: string | null;
  category_slug: string;
  author: string;
  read_minutes: number;
  published_at: string;
  faq: { question: string; answer: string }[];
  key_takeaways: string[];
};

const Post = () => {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle()
      .then(({ data }) => {
        setPost(data as unknown as Post);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="container py-24"><p className="text-muted-foreground">Loading…</p></div>
      </SiteLayout>
    );
  }

  if (!post) {
    return (
      <SiteLayout>
        <div className="container py-24 text-center">
          <h1 className="font-serif text-3xl">Article not found</h1>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">Back to home</Link>
        </div>
      </SiteLayout>
    );
  }

  const category = CATEGORY_BY_SLUG[post.category_slug];
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description,
    image: post.featured_image ? [post.featured_image] : undefined,
    datePublished: post.published_at,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "Affiliate Compass" },
  };
  const faqJsonLd = post.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faq.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : undefined;

  return (
    <SiteLayout>
      <Seo
        title={post.meta_title}
        description={post.meta_description}
        canonicalPath={`/blog/${post.slug}`}
        image={post.featured_image ?? undefined}
        type="article"
        publishedAt={post.published_at}
        jsonLd={faqJsonLd ? [articleJsonLd, faqJsonLd] : articleJsonLd}
      />

      <article className="container max-w-3xl py-10 md:py-14">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            ...(category ? [{ label: category.name, to: `/category/${category.slug}` }] : []),
            { label: post.title },
          ]}
        />

        <header className="mt-6">
          {category && (
            <Link
              to={`/category/${category.slug}`}
              className="text-xs font-semibold uppercase tracking-wider text-primary"
            >
              {category.name}
            </Link>
          )}
          <h1 className="mt-3 font-serif text-3xl md:text-5xl tracking-tight leading-[1.1]">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            {post.excerpt}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-y border-border py-3">
            <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" /> {post.author}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {post.read_minutes} min read</span>
            <time dateTime={post.published_at}>
              {new Date(post.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            </time>
          </div>
        </header>

        {post.featured_image && (
          <img
            src={resolveImage(post.featured_image)}
            alt={post.title}
            width={1600}
            height={900}
            className="mt-8 rounded-xl border border-border shadow-soft w-full"
          />
        )}

        <KeyTakeaways items={post.key_takeaways ?? []} />

        <div
          className="prose-article mt-8"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(post.content, {
              USE_PROFILES: { html: true },
              FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form"],
              FORBID_ATTR: ["style", "onerror", "onload", "onclick"],
            }),
          }}
        />

        <Faq items={post.faq ?? []} />

        <NextStepCta />

        <aside className="mt-10 rounded-lg border border-dashed border-border bg-muted/40 p-4 text-xs text-muted-foreground">
          <strong className="text-foreground">Disclosure:</strong> Articles on Affiliate Compass may contain
          affiliate links. If you click and make a purchase, we may earn a commission at no extra cost to
          you. We only recommend resources we believe are genuinely useful.
        </aside>
      </article>
    </SiteLayout>
  );
};

export default Post;
