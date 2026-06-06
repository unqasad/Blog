import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import SiteLayout from "@/components/SiteLayout";
import Seo from "@/components/Seo";
import PostCard, { PostCardData } from "@/components/PostCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CATEGORY_BY_SLUG } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";

const Category = () => {
  const { slug = "" } = useParams();
  const meta = CATEGORY_BY_SLUG[slug];
  const [posts, setPosts] = useState<PostCardData[]>([]);

  useEffect(() => {
    if (!meta) return;
    supabase
      .from("posts")
      .select("slug,title,excerpt,category_slug,read_minutes,featured_image,published_at")
      .eq("category_slug", slug)
      .eq("published", true)
      .order("published_at", { ascending: false })
      .then(({ data }) => setPosts((data as PostCardData[]) ?? []));
  }, [slug, meta]);

  if (!meta) {
    return (
      <SiteLayout>
        <div className="container py-24 text-center">
          <h1 className="font-serif text-3xl">Category not found</h1>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">Back to home</Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <Seo
        title={`${meta.name} — AI Compass`}
        description={meta.description}
        canonicalPath={`/category/${meta.slug}`}
      />
      <section className="border-b border-border">
        <div className="container pt-5 pb-4">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: meta.name }]} />
          <h1 className="mt-2 font-serif text-2xl md:text-3xl tracking-tight">{meta.name}</h1>
        </div>
      </section>

      <section className="container py-8">
        {posts.length === 0 ? (
          <p className="text-muted-foreground">No articles yet in this category. New posts are added regularly.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => <PostCard key={p.slug} post={p} />)}
          </div>
        )}
      </section>
    </SiteLayout>
  );
};

export default Category;
