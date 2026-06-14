import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import SiteLayout from "@/components/SiteLayout";
import Seo from "@/components/Seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import Faq from "@/components/Faq";
import KeyTakeaways from "@/components/KeyTakeaways";
import NextStepCta from "@/components/NextStepCta";
import TableOfContents, { buildToc } from "@/components/TableOfContents";
import { CATEGORY_BY_SLUG } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { resolveImage } from "@/lib/image-map";
import { FALLBACK_FEATURED_IMAGE } from "@/lib/fallback-image";
import { Clock, User } from "lucide-react";
import DOMPurify from "dompurify";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  meta_title: string;
  meta_description: string;
  seo_title: string | null;
  canonical_url: string | null;
  og_image: string | null;
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

  const sanitizedContent = useMemo(() => {
    if (!post) return "";
    return DOMPurify.sanitize(post.content, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form"],
      FORBID_ATTR: ["style", "onerror", "onload", "onclick"],
    });
  }, [post]);

  const { items: tocItems, html: contentWithAnchors } = useMemo(
    () => buildToc(sanitizedContent),
    [sanitizedContent],
  );

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
  const heroImage = post.featured_image || FALLBACK_FEATURED_IMAGE;
  const socialImage = post.og_image || post.featured_image || FALLBACK_FEATURED_IMAGE;
  const origin = typeof window !== "undefined" ? window.location.origin : "https://affiliatecompass.lovable.app";
  const canonicalPath = post.canonical_url || `/blog/${post.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description,
    image: [socialImage],
    datePublished: post.published_at,
    dateModified: post.published_at,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "AI Compass",
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${origin}/blog/${post.slug}` },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
      ...(category
        ? [{ "@type": "ListItem", position: 2, name: category.name, item: `${origin}/category/${category.slug}` }]
        : []),
      { "@type": "ListItem", position: category ? 3 : 2, name: post.title, item: `${origin}/blog/${post.slug}` },
    ],
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

  const jsonLd = faqJsonLd
    ? [articleJsonLd, breadcrumbJsonLd, faqJsonLd]
    : [articleJsonLd, breadcrumbJsonLd];

  // Split content roughly in half at a closing </p> so we can interleave
  // KeyTakeaways/NextStep without breaking markup.
  const splitContent = (html: string) => {
    const mid = Math.floor(html.length / 2);
    const idx = html.indexOf("</p>", mid);
    if (idx === -1) return [html, ""];
    const cut = idx + 4;
    return [html.slice(0, cut), html.slice(cut)];
  };
  const [firstHalf, secondHalf] = splitContent(contentWithAnchors);

  return (
    <SiteLayout>
      <Seo
        title={post.seo_title || post.meta_title}
        description={post.meta_description}
        canonicalPath={canonicalPath}
        image={socialImage}
        type="article"
        publishedAt={post.published_at}
        jsonLd={jsonLd}
      />

      <div className="container py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)]">
          <TableOfContents items={tocItems} />

          <article className="mx-auto w-full max-w-[760px]">
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

            <img
              src={resolveImage(heroImage)}
              alt={post.title}
              width={1600}
              height={900}
              className="mt-8 rounded-xl border border-border shadow-soft w-full"
            />

            <KeyTakeaways items={post.key_takeaways ?? []} />

            {secondHalf ? (
              <>
                <div
                  className="prose-article mt-8"
                  dangerouslySetInnerHTML={{ __html: firstHalf }}
                />
                <div
                  className="prose-article"
                  dangerouslySetInnerHTML={{ __html: secondHalf }}
                />
              </>
            ) : (
              <div
                className="prose-article mt-8"
                dangerouslySetInnerHTML={{ __html: firstHalf }}
              />
            )}

            <Faq items={post.faq ?? []} />

            <NextStepCta />
          </article>
        </div>
      </div>
    </SiteLayout>
  );
};

export default Post;
