import DOMPurify from "dompurify";
import { Clock, User } from "lucide-react";
import { CATEGORY_BY_SLUG } from "@/lib/categories";
import { resolveImage } from "@/lib/image-map";
import { FALLBACK_FEATURED_IMAGE } from "@/lib/fallback-image";

export type PreviewPost = {
  title: string;
  excerpt: string;
  content: string;
  meta_title: string;
  meta_description: string;
  seo_title?: string | null;
  canonical_url?: string | null;
  featured_image?: string | null;
  og_image?: string | null;
  category_slug: string;
  author?: string;
  read_minutes?: number;
};

export const PostPreview = ({ post }: { post: PreviewPost }) => {
  const category = CATEGORY_BY_SLUG[post.category_slug];
  const heroImage = post.featured_image || FALLBACK_FEATURED_IMAGE;
  const sanitized = DOMPurify.sanitize(post.content || "", {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["style", "onerror", "onload", "onclick"],
  });

  return (
    <div className="space-y-8">
      {/* SEO Preview chip */}
      <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Search & social preview
        </p>
        <p className="mt-2 text-primary truncate">
          {post.seo_title || post.meta_title || post.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {post.canonical_url || `https://affiliatecompass.lovable.app/blog/…`}
        </p>
        <p className="text-foreground/80 mt-1.5 line-clamp-2">
          {post.meta_description}
        </p>
      </div>

      <article className="mx-auto max-w-3xl">
        {category && (
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {category.name}
          </p>
        )}
        <h1 className="mt-3 font-serif text-3xl md:text-5xl tracking-tight leading-[1.1]">
          {post.title || "Untitled post"}
        </h1>
        {post.excerpt && (
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            {post.excerpt}
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-y border-border py-3">
          <span className="inline-flex items-center gap-1.5">
            <User className="h-4 w-4" /> {post.author || "Editorial Team"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {post.read_minutes ?? 6} min read
          </span>
          <span>Draft preview</span>
        </div>
        <img
          src={resolveImage(heroImage)}
          alt={post.title}
          className="mt-8 rounded-xl border border-border w-full"
        />
        <div
          className="prose-article mt-8"
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />
      </article>
    </div>
  );
};

export default PostPreview;
