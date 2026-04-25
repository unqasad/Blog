// Autonomous editorial writer for Affiliate Compass.
// Runs on a schedule (every 12 hours) via pg_cron + pg_net, or can be invoked
// manually by an admin from the dashboard.
//
// Pipeline:
//   1. Load existing post titles + affiliate-link inventory + recent log
//   2. Stage A — research: ask the AI to propose 5 fresh topic candidates
//      scored on relevance / intent / monetization, then pick the best one
//      (skipping tool/comparison/review topics if the involved tool has no
//      stored affiliate link)
//   3. Stage B — draft: generate a full publication-ready article
//   4. Insert as draft (never published) and write to generation_log
//
// Authentication:
//   - Cron calls with the project anon JWT (verify_jwt = true)
//   - Manual admin invocations from the dashboard also pass through; the
//     edge function additionally enforces an admin role check when the
//     caller is a real user (source: 'manual')

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GENERIC_ERROR = "Something went wrong. Please try again.";

const CATEGORIES = [
  { slug: "start-here", name: "Start Here" },
  { slug: "offers-earnings", name: "Offers & Earnings" },
  { slug: "tracking", name: "Tracking & Attribution" },
  { slug: "funnels-conversion", name: "Funnels & Conversion" },
  { slug: "seo-compliance", name: "Trust, SEO & Compliance" },
  { slug: "tools-resources", name: "Tools & Resources" },
] as const;

// ---------- AI tool schemas ----------

const RESEARCH_TOOL = {
  type: "function",
  function: {
    name: "propose_topics",
    description:
      "Propose 5 fresh blog topic candidates for Affiliate Compass and pick the best one.",
    parameters: {
      type: "object",
      properties: {
        candidates: {
          type: "array",
          minItems: 5,
          maxItems: 5,
          items: {
            type: "object",
            properties: {
              category_slug: { type: "string", enum: CATEGORIES.map((c) => c.slug) },
              working_title: { type: "string" },
              primary_keyword: { type: "string" },
              search_intent: {
                type: "string",
                enum: ["informational", "commercial", "transactional", "navigational"],
              },
              article_angle: { type: "string", description: "1–2 sentences on the unique angle." },
              mentions_tools: {
                type: "boolean",
                description: "True if this article centrally reviews, compares, or recommends specific named tools/software.",
              },
              required_tools: {
                type: "array",
                items: { type: "string" },
                description: "Lowercase slugs of the specific tools the article must cover (e.g. 'voluum', 'clickfunnels'). Empty if mentions_tools is false.",
              },
              relevance_score: { type: "integer", minimum: 1, maximum: 10 },
              trend_score: { type: "integer", minimum: 1, maximum: 10 },
              usefulness_score: { type: "integer", minimum: 1, maximum: 10 },
              monetization_score: { type: "integer", minimum: 1, maximum: 10 },
              total_score: { type: "integer", minimum: 4, maximum: 40 },
              reasoning: { type: "string" },
            },
            required: [
              "category_slug",
              "working_title",
              "primary_keyword",
              "search_intent",
              "article_angle",
              "mentions_tools",
              "required_tools",
              "relevance_score",
              "trend_score",
              "usefulness_score",
              "monetization_score",
              "total_score",
              "reasoning",
            ],
            additionalProperties: false,
          },
        },
        recommended_index: {
          type: "integer",
          minimum: 0,
          maximum: 4,
          description: "Index (0-4) of the candidate that best fits the brief.",
        },
      },
      required: ["candidates", "recommended_index"],
      additionalProperties: false,
    },
  },
} as const;

const DRAFT_TOOL = {
  type: "function",
  function: {
    name: "create_post",
    description: "Create a publication-ready blog draft for Affiliate Compass.",
    parameters: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Lowercase, hyphenated URL slug. 4-8 words." },
        title: { type: "string", description: "Click-worthy but credible H1 title. 50-70 chars." },
        meta_title: { type: "string", description: "SEO meta title. <=60 chars." },
        meta_description: { type: "string", description: "SEO meta description. 140-160 chars." },
        excerpt: { type: "string", description: "1-2 sentence summary. 160-220 chars." },
        category_slug: { type: "string", enum: CATEGORIES.map((c) => c.slug) },
        primary_keyword: { type: "string" },
        secondary_keywords: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 8,
        },
        read_minutes: { type: "integer", minimum: 6, maximum: 14 },
        key_takeaways: {
          type: "array",
          items: { type: "string" },
          minItems: 4,
          maxItems: 6,
        },
        faq: {
          type: "array",
          minItems: 3,
          maxItems: 5,
          items: {
            type: "object",
            properties: {
              q: { type: "string" },
              a: { type: "string" },
            },
            required: ["q", "a"],
            additionalProperties: false,
          },
        },
        cta: {
          type: "string",
          description: "1-2 sentence call to action that fits the article's stage of awareness.",
        },
        image_suggestions: {
          type: "array",
          minItems: 1,
          maxItems: 3,
          items: {
            type: "object",
            properties: {
              placement: { type: "string", description: "e.g. 'hero', 'section: tracking setup'" },
              prompt: { type: "string", description: "Concrete description for image generation." },
              alt_text: { type: "string" },
            },
            required: ["placement", "prompt", "alt_text"],
            additionalProperties: false,
          },
        },
        internal_link_suggestions: {
          type: "array",
          maxItems: 5,
          items: {
            type: "object",
            properties: {
              anchor_text: { type: "string" },
              target_slug: { type: "string", description: "Slug of an existing post on Affiliate Compass." },
            },
            required: ["anchor_text", "target_slug"],
            additionalProperties: false,
          },
        },
        schema_suggestions: {
          type: "array",
          maxItems: 3,
          items: { type: "string", enum: ["Article", "FAQPage", "HowTo", "BreadcrumbList", "Review"] },
        },
        content: {
          type: "string",
          description:
            "Full article body as semantic HTML. Use <h2>, <h3>, <p>, <ul>, <ol>, <li>, <blockquote>, <strong>, <em>, <a>. No <h1>. 1400-2000 words. Include a strong intro, multiple H2 sections, practical examples, common mistakes, and a closing CTA paragraph. No fabricated stats, quotes, screenshots, testimonials, or income claims.",
        },
      },
      required: [
        "slug", "title", "meta_title", "meta_description", "excerpt",
        "category_slug", "primary_keyword", "secondary_keywords",
        "read_minutes", "key_takeaways", "faq", "cta",
        "image_suggestions", "internal_link_suggestions",
        "schema_suggestions", "content",
      ],
      additionalProperties: false,
    },
  },
} as const;

// ---------- Prompts ----------

const RESEARCH_SYSTEM = `You are the senior SEO strategist for "Affiliate Compass", a no-hype publication on affiliate marketing, CPA marketing, offer selection, tracking & attribution, funnels & conversion, trust/SEO/compliance, and the tools that power these systems.

Your job in this step: propose 5 fresh blog topic candidates that fit the brief and pick the best one.

Selection rules:
- Topics must be practical, evergreen-leaning, problem-solving, and ad-friendly.
- Reflect real demand on Google (autosuggest, People Also Ask, related searches, common forum/community questions). Use what you know about how affiliate/CPA marketers actually search.
- Strong long-tail or middle-tail keywords beat vague broad ones.
- Avoid hype, fake urgency, fabricated numbers, or "get rich quick" framing.
- Avoid duplicating or paraphrasing any topic from the avoid list.
- Prefer topic diversity across categories over time — if the most recent drafts are all from one category, lean toward another.
- A "tool/comparison/review" topic is only allowed when EVERY required tool already exists in the affiliate-link inventory provided. If even one required tool is missing, mark mentions_tools=true with the missing tools but DO NOT recommend that candidate.

Score each candidate 1–10 on:
- relevance_score: fit with Affiliate Compass's niche
- trend_score: ongoing search interest / freshness
- usefulness_score: how clearly it solves a real problem
- monetization_score: ad/affiliate friendliness

Then pick recommended_index = the strongest candidate that complies with the rules.

Always call the propose_topics tool exactly once.`;

const DRAFT_SYSTEM = `You are the senior editor for Affiliate Compass.

Editorial rules:
- Practical, calm, professional tone. No hype, no fake urgency, no fabricated stats, quotes, screenshots, testimonials, or income claims.
- People-first content with strong on-page SEO structure.
- Useful for beginners, credible for intermediate readers.
- Use <h2> for main sections, <h3> for subsections, short paragraphs, bullets, and an occasional callout.
- Include practical examples, common mistakes, and a closing CTA paragraph.
- 1400–2000 words.
- Never invent product names, links, or numbers.
- For internal_link_suggestions, only reference target_slug values from the provided existing-posts list.
- For tool/software mentions in non-tools articles, only use the official homepage URL via <a href="..."> unless an affiliate URL is explicitly provided in the affiliate inventory.
- For tool/comparison/review articles, only mention tools that appear in the affiliate inventory provided, and use their affiliate_url for links.

Always call the create_post tool exactly once with a complete, publication-ready draft.`;

// ---------- Helpers ----------

interface AffiliateLink {
  tool_slug: string;
  tool_name: string;
  affiliate_url: string;
  homepage_url: string | null;
  category: string | null;
}

interface RecentPost { title: string; slug: string; category_slug: string; created_at: string }

interface RecentLog {
  category_slug: string | null;
  primary_keyword: string | null;
  chosen_title: string | null;
  status: string;
  created_at: string;
}

interface Candidate {
  category_slug: string;
  working_title: string;
  primary_keyword: string;
  search_intent: string;
  article_angle: string;
  mentions_tools: boolean;
  required_tools: string[];
  relevance_score: number;
  trend_score: number;
  usefulness_score: number;
  monetization_score: number;
  total_score: number;
  reasoning: string;
}

async function callAI(model: string, body: Record<string, unknown>): Promise<Response> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
  return fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, ...body }),
  });
}

function pickBestEligibleCandidate(
  candidates: Candidate[],
  recommendedIndex: number,
  affiliateSlugs: Set<string>,
): { chosen: Candidate | null; reason: string } {
  const isEligible = (c: Candidate) => {
    if (!c.mentions_tools) return true;
    if (!c.required_tools || c.required_tools.length === 0) return true;
    return c.required_tools.every((slug) => affiliateSlugs.has(slug.toLowerCase().trim()));
  };

  const recommended = candidates[recommendedIndex];
  if (recommended && isEligible(recommended)) {
    return { chosen: recommended, reason: "recommended-eligible" };
  }

  const sorted = [...candidates]
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => isEligible(c))
    .sort((a, b) => b.c.total_score - a.c.total_score);

  if (sorted.length === 0) {
    return {
      chosen: null,
      reason: "All candidates required tools without affiliate links on file.",
    };
  }
  return { chosen: sorted[0].c, reason: "fallback-best-eligible" };
}

// ---------- Main handler ----------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_KEY || !LOVABLE_API_KEY) {
    console.error("auto-writer: missing required env vars");
    return new Response(JSON.stringify({ error: GENERIC_ERROR }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  let source: "cron" | "manual" = "cron";
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.source === "manual") source = "manual";
  } catch (_) { /* ignore */ }

  // If a manual call, require admin role
  if (source === "manual") {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser(token);
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const logRun = async (entry: Record<string, unknown>) => {
    try {
      await admin.from("generation_log").insert({ source, ...entry });
    } catch (e) {
      console.error("auto-writer: failed to write log", e);
    }
  };

  try {
    // --- Gather context ---
    const [postsRes, affRes, logRes] = await Promise.all([
      admin
        .from("posts")
        .select("title,slug,category_slug,created_at")
        .order("created_at", { ascending: false })
        .limit(60),
      admin
        .from("affiliate_links")
        .select("tool_slug,tool_name,affiliate_url,homepage_url,category")
        .eq("active", true),
      admin
        .from("generation_log")
        .select("category_slug,primary_keyword,chosen_title,status,created_at")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const recentPosts = (postsRes.data ?? []) as RecentPost[];
    const affiliateLinks = (affRes.data ?? []) as AffiliateLink[];
    const recentLog = (logRes.data ?? []) as RecentLog[];

    const affiliateSlugSet = new Set(
      affiliateLinks.map((a) => a.tool_slug.toLowerCase().trim()),
    );

    // Category distribution from last 14 entries (posts + logs)
    const categoryCounts: Record<string, number> = {};
    for (const p of recentPosts.slice(0, 14)) {
      categoryCounts[p.category_slug] = (categoryCounts[p.category_slug] ?? 0) + 1;
    }

    // --- Stage A: research / topic selection ---
    const researchUserPrompt = `Today: ${new Date().toISOString().slice(0, 10)}

Categories (slug → name):
${CATEGORIES.map((c) => `- ${c.slug}: ${c.name}`).join("\n")}

Recent post category distribution (last 14 posts):
${Object.entries(categoryCounts).map(([k, v]) => `- ${k}: ${v}`).join("\n") || "- (none yet)"}

Existing posts (title — slug — category):
${recentPosts.length === 0 ? "(none yet)" : recentPosts.map((p) => `- ${p.title} — ${p.slug} — ${p.category_slug}`).join("\n")}

Recent autonomous runs (avoid duplicating these):
${recentLog.length === 0 ? "(none yet)" : recentLog.map((l) => `- [${l.status}] ${l.category_slug ?? "?"}: ${l.chosen_title ?? "(skipped)"} — kw: ${l.primary_keyword ?? "n/a"}`).join("\n")}

Affiliate-link inventory (only these tools may be the SUBJECT of comparison/review/recommendation posts):
${affiliateLinks.length === 0
  ? "(empty — do NOT recommend any tool/comparison/review topic)"
  : affiliateLinks.map((a) => `- slug: ${a.tool_slug} | name: ${a.tool_name} | category: ${a.category ?? "n/a"}`).join("\n")}

Now produce 5 candidates and pick the best per the rules. Lean away from over-represented categories.`;

    const researchRes = await callAI("google/gemini-2.5-pro", {
      messages: [
        { role: "system", content: RESEARCH_SYSTEM },
        { role: "user", content: researchUserPrompt },
      ],
      tools: [RESEARCH_TOOL],
      tool_choice: { type: "function", function: { name: "propose_topics" } },
    });

    if (!researchRes.ok) {
      const txt = await researchRes.text();
      console.error("research stage error", researchRes.status, txt);
      await logRun({
        status: "error",
        error_message: `research ${researchRes.status}`,
      });
      return new Response(JSON.stringify({ error: GENERIC_ERROR }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const researchJson = await researchRes.json();
    const researchCall = researchJson?.choices?.[0]?.message?.tool_calls?.[0];
    if (!researchCall?.function?.arguments) {
      console.error("research: no tool call");
      await logRun({ status: "error", error_message: "research returned no tool call" });
      return new Response(JSON.stringify({ error: GENERIC_ERROR }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const researchArgs = JSON.parse(researchCall.function.arguments) as {
      candidates: Candidate[];
      recommended_index: number;
    };

    const { chosen, reason } = pickBestEligibleCandidate(
      researchArgs.candidates,
      researchArgs.recommended_index,
      affiliateSlugSet,
    );

    if (!chosen) {
      await logRun({
        status: "skipped",
        candidates: researchArgs.candidates,
        skip_reason: reason,
      });
      return new Response(
        JSON.stringify({ ok: true, skipped: true, reason }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Quality guardrail: the chosen topic must score reasonably well overall.
    if (chosen.total_score < 24) {
      await logRun({
        status: "skipped",
        category_slug: chosen.category_slug,
        primary_keyword: chosen.primary_keyword,
        chosen_title: chosen.working_title,
        article_angle: chosen.article_angle,
        candidates: researchArgs.candidates,
        skip_reason: `Best candidate scored ${chosen.total_score}/40 — below quality threshold.`,
      });
      return new Response(
        JSON.stringify({ ok: true, skipped: true, reason: "below_quality_threshold" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // --- Stage B: full draft ---
    // Restrict affiliate inventory passed to drafter to tools the article needs
    const draftAffiliateInventory = chosen.mentions_tools
      ? affiliateLinks.filter((a) =>
          chosen.required_tools
            .map((t) => t.toLowerCase().trim())
            .includes(a.tool_slug.toLowerCase().trim()))
      : [];

    const draftUserPrompt = `Write the full draft for this approved topic.

Category: ${chosen.category_slug}
Working title: ${chosen.working_title}
Primary keyword: ${chosen.primary_keyword}
Search intent: ${chosen.search_intent}
Article angle: ${chosen.article_angle}

Existing posts (use these slugs for internal_link_suggestions; do not invent slugs):
${recentPosts.length === 0 ? "(none yet)" : recentPosts.slice(0, 30).map((p) => `- ${p.slug} — ${p.title}`).join("\n")}

Affiliate inventory available for THIS article (use these affiliate_urls for any link to these tools):
${draftAffiliateInventory.length === 0
  ? "(none — if you mention any tool, link to its official homepage only)"
  : draftAffiliateInventory.map((a) => `- ${a.tool_name} (${a.tool_slug}) → ${a.affiliate_url}`).join("\n")}

Now call create_post once.`;

    const draftRes = await callAI("google/gemini-2.5-pro", {
      messages: [
        { role: "system", content: DRAFT_SYSTEM },
        { role: "user", content: draftUserPrompt },
      ],
      tools: [DRAFT_TOOL],
      tool_choice: { type: "function", function: { name: "create_post" } },
    });

    if (!draftRes.ok) {
      const txt = await draftRes.text();
      console.error("draft stage error", draftRes.status, txt);
      await logRun({
        status: "error",
        category_slug: chosen.category_slug,
        primary_keyword: chosen.primary_keyword,
        chosen_title: chosen.working_title,
        article_angle: chosen.article_angle,
        candidates: researchArgs.candidates,
        error_message: `draft ${draftRes.status}`,
      });
      const status = draftRes.status === 429 || draftRes.status === 402 ? draftRes.status : 500;
      return new Response(
        JSON.stringify({
          error: status === 429
            ? "Rate limited. Try again shortly."
            : status === 402
            ? "AI credits exhausted."
            : GENERIC_ERROR,
        }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const draftJson = await draftRes.json();
    const draftCall = draftJson?.choices?.[0]?.message?.tool_calls?.[0];
    if (!draftCall?.function?.arguments) {
      await logRun({
        status: "error",
        category_slug: chosen.category_slug,
        primary_keyword: chosen.primary_keyword,
        chosen_title: chosen.working_title,
        article_angle: chosen.article_angle,
        candidates: researchArgs.candidates,
        error_message: "draft returned no tool call",
      });
      return new Response(JSON.stringify({ error: GENERIC_ERROR }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const draft = JSON.parse(draftCall.function.arguments);

    // Ensure unique slug
    let finalSlug = draft.slug;
    const slugCheck = await admin
      .from("posts")
      .select("slug")
      .eq("slug", finalSlug)
      .maybeSingle();
    if (slugCheck.data) {
      finalSlug = `${draft.slug}-${Date.now().toString(36)}`;
    }

    const editorialMeta = {
      cta: draft.cta,
      image_suggestions: draft.image_suggestions,
      internal_link_suggestions: draft.internal_link_suggestions,
      schema_suggestions: draft.schema_suggestions,
      generated_by: "auto-writer",
      generated_at: new Date().toISOString(),
    };

    const contentWithMeta =
      `<!-- editorial-meta:${JSON.stringify(editorialMeta)} -->\n` + draft.content;

    const { data: inserted, error: insertErr } = await admin
      .from("posts")
      .insert({
        slug: finalSlug,
        title: draft.title,
        meta_title: draft.meta_title,
        meta_description: draft.meta_description,
        excerpt: draft.excerpt,
        category_slug: draft.category_slug,
        primary_keyword: draft.primary_keyword,
        secondary_keywords: draft.secondary_keywords,
        read_minutes: draft.read_minutes,
        key_takeaways: draft.key_takeaways,
        faq: draft.faq,
        content: contentWithMeta,
        published: false,
        status: "draft",
        author: "Editorial Team",
      })
      .select("id,slug")
      .single();

    if (insertErr || !inserted) {
      console.error("auto-writer insert error", insertErr);
      await logRun({
        status: "error",
        category_slug: chosen.category_slug,
        primary_keyword: chosen.primary_keyword,
        chosen_title: draft.title,
        article_angle: chosen.article_angle,
        candidates: researchArgs.candidates,
        error_message: insertErr?.message ?? "insert failed",
      });
      return new Response(JSON.stringify({ error: GENERIC_ERROR }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await logRun({
      status: "drafted",
      category_slug: draft.category_slug,
      primary_keyword: draft.primary_keyword,
      chosen_title: draft.title,
      article_angle: chosen.article_angle,
      candidates: researchArgs.candidates,
      post_id: inserted.id,
      post_slug: inserted.slug,
      skip_reason: reason === "fallback-best-eligible"
        ? "Recommended candidate ineligible (missing affiliate links); used best eligible fallback."
        : null,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        post: { id: inserted.id, slug: inserted.slug, title: draft.title },
        category: draft.category_slug,
        primary_keyword: draft.primary_keyword,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("auto-writer fatal", e);
    await logRun({
      status: "error",
      error_message: e instanceof Error ? e.message : "unknown",
    });
    return new Response(JSON.stringify({ error: GENERIC_ERROR }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
