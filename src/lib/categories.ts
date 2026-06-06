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
      "Reviews, comparisons, and roundups of the AI tools, browser extensions, and free utilities worth your time.",
  },
  {
    slug: "tutorials",
    name: "Tutorials",
    short: "Step-by-step guides",
    description:
      "Practical, hands-on tutorials for getting real work done with AI — from prompts to full workflows.",
  },
  {
    slug: "automation",
    name: "Automation",
    short: "Automate the busywork",
    description:
      "Workflow blueprints and no-code automations for content, social, and operations.",
  },
  {
    slug: "productivity",
    name: "Productivity",
    short: "Work smarter, not longer",
    description:
      "Focus systems, time management, and remote-work playbooks for digital professionals.",
  },
  {
    slug: "comparisons",
    name: "Comparisons",
    short: "Side-by-side reviews",
    description:
      "Head-to-head comparisons so you can pick the right tool without the guesswork.",
  },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
) as Record<string, CategoryMeta>;
