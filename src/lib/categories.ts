export type CategoryMeta = {
  slug: string;
  name: string;
  description: string;
  short: string;
};

export const CATEGORIES: CategoryMeta[] = [
  {
    slug: "start-here",
    name: "Start Here",
    short: "Beginner foundations",
    description:
      "Beginner guides, affiliate and CPA basics, key terminology, and setup checklists. Build a clear mental model before you spend a single dollar on traffic.",
  },
  {
    slug: "offer-selection",
    name: "Offer Selection & Networks",
    short: "Pick offers that actually convert",
    description:
      "How to choose offers, understand EPC and payout models, evaluate conversion potential, review affiliate programs and CPA networks, and spot red flags early.",
  },
  {
    slug: "tracking",
    name: "Tracking & Attribution",
    short: "See what's really happening",
    description:
      "Tracking basics, UTM parameters, postback tracking, attribution issues, and how to read campaign data without fooling yourself.",
  },
  {
    slug: "conversion",
    name: "Conversion Optimization",
    short: "Turn clicks into customers",
    description:
      "Why clicks don't convert, landing page improvements, CTA optimization, trust signals, and mobile conversion issues.",
  },
  {
    slug: "traffic-funnels",
    name: "Traffic, Funnels & Strategy",
    short: "Send the right people, the right way",
    description:
      "Traffic source comparisons, funnel basics, pre-landers, paid vs organic, and how to scale carefully without blowing up your budget.",
  },
  {
    slug: "compliance-seo",
    name: "Compliance, SEO & Monetization",
    short: "Built to last (and stay approved)",
    description:
      "Affiliate disclosures, ad-friendly content, SEO for affiliate blogs, monetization systems, and the mistakes that get sites de-indexed or banned.",
  },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
) as Record<string, CategoryMeta>;
