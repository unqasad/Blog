import { Link } from "react-router-dom";
import { ArrowUpRight, Clock } from "lucide-react";
import { CATEGORY_BY_SLUG } from "@/lib/categories";
import { resolveImage } from "@/lib/image-map";

export type PostCardData = {
  slug: string;
  title: string;
  excerpt: string;
  category_slug: string;
  read_minutes: number;
  featured_image?: string | null;
  published_at: string;
};

export const PostCard = ({ post, featured = false }: { post: PostCardData; featured?: boolean }) => {
  const category = CATEGORY_BY_SLUG[post.category_slug];
  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition hover:shadow-card hover:-translate-y-0.5 ${
        featured ? "md:flex-row" : ""
      }`}
    >
      {post.featured_image && (
        <Link
          to={`/blog/${post.slug}`}
          className={`block overflow-hidden bg-muted ${featured ? "md:w-1/2" : "aspect-[16/9]"}`}
          aria-label={post.title}
        >
          <img
            src={resolveImage(post.featured_image)}
            alt={post.title}
            loading="lazy"
            width={1600}
            height={900}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </Link>
      )}
      <div className={`flex flex-1 flex-col p-6 ${featured ? "md:p-8" : ""}`}>
        {category && (
          <Link
            to={`/category/${category.slug}`}
            className="text-xs font-semibold uppercase tracking-wider text-primary hover:text-primary-glow"
          >
            {category.name}
          </Link>
        )}
        <h3
          className={`mt-2 font-serif tracking-tight text-foreground ${
            featured ? "text-2xl md:text-3xl" : "text-xl"
          }`}
        >
          <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
            {post.title}
          </Link>
        </h3>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
        <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {post.read_minutes} min read
          </span>
          <Link
            to={`/blog/${post.slug}`}
            className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary-glow"
          >
            Read <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
