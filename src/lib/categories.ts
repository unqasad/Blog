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
    slug: "offers-earnings",
    name: "Offers & Earnings",
    short: "Pick offers that actually pay",
    description:
      "How to evaluate offers, understand EPC and payout models, choose networks, and judge real earning potential without falling for hype.",
  },
  {
    slug: "tracking",
    name: "Tracking & Attribution",
    short: "See what's really happening",
    description:
      "Tracking basics, UTM parameters, postback tracking, attribution issues, and how to read campaign data without fooling yourself.",
  },
  {
    slug: "funnels-conversion",
    name: "Funnels & Conversion",
    short: "Turn clicks into customers",
    description:
      "Landing pages, funnels, traffic alignment, trust signals, and the conversion mechanics that turn clicks into customers.",
  },
  {
    slug: "seo-compliance",
    name: "Trust, SEO & Compliance",
    short: "Built to last and stay approved",
    description:
      "Editorial trust, SEO for monetized sites, affiliate disclosures, ad-friendly content, and the standards that keep a site approved and indexed long term.",
  },
  {
    slug: "tools-resources",
    name: "Tools & Resources",
    short: "The stack behind the system",
    description:
      "Honest tool reviews, comparison guides, and recommended stacks across tracking, SEO, landing pages, email, analytics, and content workflow — chosen for builders who care about sustainable results.",
  },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
) as Record<string, CategoryMeta>;
