// AI writer: generates one SEO-optimized affiliate-niche post and saves it as a DRAFT.
// Triggered by pg_cron on a schedule, or manually from the admin panel.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CATEGORIES = [
  { slug: "start-here", name: "Start Here" },
  { slug: "offer-selection", name: "Offer Selection & Networks" },
  { slug: "tracking", name: "Tracking & Attribution" },
  { slug: "conversion", name: "Conversion Optimization" },
  { slug: "traffic-funnels", name: "Traffic, Funnels & Strategy" },
  { slug: "compliance-seo", name: "Compliance, SEO & Monetization" },
  { slug: "tools-resources", name: "Tools & Resources" },
];

const TOOL_SCHEMA = {
  type: "function",
  function: {
    name: "create_post",
    description: "Create a single SEO-optimized blog post draft for the affiliate marketing niche.",
    parameters: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Lowercase, hyphenated URL slug. No leading/trailing hyphens. 4-8 words." },
        title: { type: "string", description: "Click-worthy but credible H1 title. 50-70 chars." },
        meta_title: { type: "string", description: "SEO meta title. <=60 chars." },
        meta_description: { type: "string", description: "SEO meta description. 140-160 chars." },
        excerpt: { type: "string", description: "1-2 sentence dek/summary. ~160-220 chars." },
        category_slug: {
          type: "string",
          enum: CATEGORIES.map((c) => c.slug),
        },
        primary_keyword: { type: "string" },
        secondary_keywords: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 8,
        },
        read_minutes: { type: "integer", minimum: 5, maximum: 14 },
        key_takeaways: {
          type: "array",
          items: { type: "string" },
          minItems: 4,
          maxItems: 7,
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
        content: {
          type: "string",
          description:
            "Full article body as semantic HTML. Use <h2>, <h3>, <p>, <ul>, <ol>, <li>, <blockquote>, <strong>, <em>, <a>. No <h1> (title is rendered separately). 1200-1800 words. No fabricated stats, no income claims, no hype. Include practical examples, common mistakes, and a strong conclusion.",
        },
      },
      required: [
        "slug", "title", "meta_title", "meta_description", "excerpt",
        "category_slug", "primary_keyword", "secondary_keywords",
        "read_minutes", "key_takeaways", "faq", "content",
      ],
      additionalProperties: false,
    },
  },
};

const SYSTEM_PROMPT = `You are a senior SEO editor for "Affiliate Compass", a no-hype publication about affiliate marketing, CPA marketing, offer selection, tracking, conversion optimization, traffic quality, and compliance.

Editorial rules:
- Practical, calm, professional tone. No hype, no "get rich quick", no fake urgency, no fabricated earnings or stats.
- People-first content with strong SEO structure.
- Original, evergreen, problem-solving angle.
- Content must be ad-friendly and suitable for monetization.
- Prefer high-intent topics: troubleshooting, comparisons, frameworks, checklists, beginner mistakes.
- Use <h2> and <h3> headings, short paragraphs, bullets, and the occasional callout.
- Include affiliate disclosure guidance when relevant, but never invent product names or links.
- Never duplicate or paraphrase an existing post topic from the avoid list.

Always call the create_post tool exactly once with the full draft.`;

async function getExistingTopics(supabaseUrl: string, serviceKey: string): Promise<string[]> {
  const res = await fetch(`${supabaseUrl}/rest/v1/posts?select=title,slug&limit=200`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!res.ok) return [];
  const rows = await res.json();
  return rows.map((r: { title: string; slug: string }) => `- ${r.title} (${r.slug})`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SERVICE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const existing = await getExistingTopics(SUPABASE_URL, SERVICE_KEY);
    const avoidList = existing.length
      ? `\n\nAvoid these existing topics (pick a different angle):\n${existing.join("\n")}`
      : "";

    const userPrompt = `Generate ONE new draft post for Affiliate Compass.

Pick a fresh, high-intent topic from the niche (affiliate/CPA marketing, offer selection, tracking & attribution, conversion optimization, traffic & funnels, compliance/SEO/monetization).

Examples of strong angles (do not copy verbatim):
- Why your CPA campaign gets clicks but no leads
- How to read EPC the right way
- Postback vs pixel tracking explained for beginners
- Pre-lander frameworks that build trust without hype
- Audit checklist for an underperforming affiliate landing page
- How to spot red flags in a CPA network
- Mobile conversion fixes most beginners miss
- SEO content clusters for affiliate blogs

Then call the create_post tool with a complete, publication-ready draft.${avoidList}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [TOOL_SCHEMA],
        tool_choice: { type: "function", function: { name: "create_post" } },
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, txt);
      if (aiRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ error: "AI gateway error", detail: txt }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiJson = await aiRes.json();
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return a tool call");
    }
    const draft = JSON.parse(toolCall.function.arguments);

    // Ensure unique slug
    let finalSlug = draft.slug;
    const slugCheck = await fetch(
      `${SUPABASE_URL}/rest/v1/posts?select=slug&slug=eq.${encodeURIComponent(finalSlug)}`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
    );
    const existingSlug = await slugCheck.json();
    if (Array.isArray(existingSlug) && existingSlug.length > 0) {
      finalSlug = `${draft.slug}-${Date.now().toString(36)}`;
    }

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
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
        content: draft.content,
        published: false,
        status: "draft",
        author: "Editorial Team",
      }),
    });

    if (!insertRes.ok) {
      const txt = await insertRes.text();
      console.error("Insert error:", insertRes.status, txt);
      throw new Error(`Failed to save draft: ${txt}`);
    }

    const inserted = await insertRes.json();
    return new Response(
      JSON.stringify({ ok: true, post: inserted?.[0] ?? null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("ai-writer error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
