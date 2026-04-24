// One-shot ingestion endpoint: accepts an article JSON and upserts into public.posts.
// Protected by a shared secret header (LOVABLE_API_KEY reused since it's already set
// and not user-facing). Service role bypasses RLS.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-ingest-key",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SHARED_KEY = Deno.env.get("LOVABLE_API_KEY")!;

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  content_html: string;
  meta_title: string;
  meta_description: string;
  primary_keyword: string;
  secondary_keywords: string[];
  featured_image: string;
  category_slug: string;
  read_minutes: number;
  faq: { question: string; answer: string }[];
  key_takeaways: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (req.headers.get("x-ingest-key") !== SHARED_KEY) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: Article;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "bad json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const required: (keyof Article)[] = [
    "slug", "title", "excerpt", "content_html", "meta_title",
    "meta_description", "primary_keyword", "secondary_keywords",
    "featured_image", "category_slug", "read_minutes", "faq", "key_takeaways",
  ];
  for (const k of required) {
    if (body[k] === undefined || body[k] === null) {
      return new Response(JSON.stringify({ error: `missing ${k}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE);

  const row = {
    slug: body.slug,
    title: body.title,
    excerpt: body.excerpt,
    content: body.content_html,
    meta_title: body.meta_title,
    meta_description: body.meta_description,
    primary_keyword: body.primary_keyword,
    secondary_keywords: body.secondary_keywords,
    featured_image: body.featured_image,
    category_slug: body.category_slug,
    read_minutes: body.read_minutes,
    faq: body.faq,
    key_takeaways: body.key_takeaways.slice(0, 6),
    status: "published",
    published: true,
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await sb
    .from("posts")
    .upsert(row, { onConflict: "slug" });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, slug: body.slug }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
