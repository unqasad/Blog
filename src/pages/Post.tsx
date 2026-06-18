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
  updated_at: string;
  faq: { question: string; answer: string }[];
  key_takeaways: string[];
};

const WORDS_PER_MINUTE = 220;

const countWords = (html: string): number => {
  if (!html) return 0;
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return 0;
  return text.split(" ").length;
};

const sameDay = (a: string, b: string) => {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getUTCFullYear() === db.getUTCFullYear() &&
    da.getUTCMonth() === db.getUTCMonth() &&
    da.getUTCDate() === db.getUTCDate()
  );
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/**
 * Detect a "Frequently Asked Questions" / "FAQ" H2 section in the article
 * HTML and pull out subsequent H3 (question) + following text (answer) pairs
 * until the next H2 or end of document.
 */
const detectFaqFromHtml = (
  html: string,
): { question: string; answer: string }[] => {
  if (typeof window === "undefined" || !html) return [];
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const container = doc.body.firstElementChild;
  if (!container) return [];
  const nodes = Array.from(container.children);
  const startIdx = nodes.findIndex(
    (n) =>
      n.tagName === "H2" &&
      /^(frequently\s+asked\s+questions|faqs?|q\s*&\s*a)\b/i.test(
        n.textContent?.trim() ?? "",
      ),
  );
  if (startIdx === -1) return [];
  const out: { question: string; answer: string }[] = [];
  let current: { question: string; answer: string } | null = null;
  for (let i = startIdx + 1; i < nodes.length; i++) {
    const el = nodes[i];
    if (el.tagName === "H2") break;
    if (el.tagName === "H3") {
      if (current && current.answer.trim()) out.push(current);
      current = { question: el.textContent?.trim() ?? "", answer: "" };
    } else if (current) {
      const txt = el.textContent?.trim() ?? "";
      if (txt) current.answer += (current.answer ? "\n\n" : "") + txt;
    }
  }
  if (current && current.answer.trim()) out.push(current);
  return out.filter((f) => f.question && f.answer);
};

const Post = () => {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

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

  // Reading progress
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [post?.slug]);

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

  // Auto-calculated read time, overrides any stored value.
  const computedReadMinutes = useMemo(() => {
    const words = countWords(sanitizedContent);
    return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  }, [sanitizedContent]);

  // Combine structured FAQ (post.faq) with any FAQ detected inline in the body.
  const detectedFaq = useMemo(
    () => detectFaqFromHtml(sanitizedContent),
    [sanitizedContent],
  );
  const allFaq = useMemo(() => {
    const base = post?.faq?.length ? post.faq : [];
    const seen = new Set(base.map((f) => f.question.toLowerCase().trim()));
    const merged = [...base];
    for (const f of detectedFaq) {
      const k = f.question.toLowerCase().trim();
      if (!seen.has(k)) {
        seen.add(k);
        merged.push(f);
      }
    }
    return merged;
  }, [post?.faq, detectedFaq]);

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
  const authorName = post.author?.trim() || "Editorial Team";
  const dateModified = post.updated_at || post.published_at;
  const showUpdated = post.updated_at && !sameDay(post.updated_at, post.published_at);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description,
    image: [socialImage],
    datePublished: post.published_at,
    dateModified,
    author: {
      "@type": authorName === "Editorial Team" ? "Organization" : "Person",
      name: authorName,
    },
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
  const faqJsonLd = allFaq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: allFaq.map((f) => ({
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

  // Only show the standalone FAQ component if the structured array has entries
  // — avoid duplicating an inline FAQ section already in the body.
  const showStandaloneFaq = (post.faq?.length ?? 0) > 0 && detectedFaq.length === 0;

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

      {/* Reading progress bar */}
      <div
        className="fixed left-0 top-0 z-50 h-0.5 bg-primary transition-[width] duration-150"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      />

      <div className="container py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[3rem_minmax(0,1fr)]">
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
              <p className="mt-3 text-sm text-muted-foreground">
                By <span className="font-medium text-foreground/90">{authorName}</span>
              </p>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground border-y border-border py-3">
                <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" /> {authorName}</span>
                <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {computedReadMinutes} min read</span>
                <span>
                  Published <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                </span>
                {showUpdated && (
                  <span>
                    Updated <time dateTime={post.updated_at}>{formatDate(post.updated_at)}</time>
                  </span>
                )}
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

            {showStandaloneFaq && <Faq items={post.faq} />}

            <NextStepCta />
          </article>
        </div>
      </div>
    </SiteLayout>
  );
};

export default Post;
