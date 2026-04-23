import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; to?: string };

export const Breadcrumbs = ({ items }: { items: Crumb[] }) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item:
        typeof window !== "undefined" && c.to
          ? `${window.location.origin}${c.to}`
          : undefined,
    })),
  };
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          {items.map((c, i) => (
            <li key={i} className="flex items-center gap-1">
              {c.to ? (
                <Link to={c.to} className="hover:text-foreground transition">
                  {c.label}
                </Link>
              ) : (
                <span className="text-foreground">{c.label}</span>
              )}
              {i < items.length - 1 && <ChevronRight className="h-3 w-3 opacity-60" />}
            </li>
          ))}
        </ol>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
};

export default Breadcrumbs;
