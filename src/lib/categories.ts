export type CategoryMeta = {
  slug: string;
  name: string;
  description: string;
  short: string;
};

export const CATEGORIES: CategoryMeta[] = [
  {
    slug: "ai-tools",
    name: "AI Tools",
    short: "The modern AI stack",
    description:
      "In-depth reviews, comparisons, and roundups of the best AI tools, browser extensions, and free utilities for creators, students, freelancers, and remote teams.",
  },
  {
    slug: "comparisons",
    name: "Comparisons",
    short: "Side-by-side reviews",
    description:
      "Head-to-head comparisons of the best AI tools, browser extensions, and free utilities — so you can choose the right tool for your workflow without the guesswork.",
  },
  {
    slug: "automation",
    name: "Automation",
    short: "Automate the busywork",
    description:
      "How to automate content, social media, and operations with AI and no-code tools — from workflow blueprints to integrations that save hours every week.",
  },
  {
    slug: "productivity",
    name: "Productivity",
    short: "Work smarter, not longer",
    description:
      "Productivity systems, focus tools, time management, and remote-work playbooks designed for digital professionals who want to ship more with less friction.",
  },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
) as Record<string, CategoryMeta>;
