// Seed content used by the migration insert. Each post is real, helpful, no-hype.
// Markdown-ish HTML allowed: we render with dangerouslySetInnerHTML.

export type SeedPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  meta_title: string;
  meta_description: string;
  primary_keyword: string;
  secondary_keywords: string[];
  featured_image: string | null;
  category_slug: string;
  read_minutes: number;
  faq: { question: string; answer: string }[];
  key_takeaways: string[];
};
