import { useEffect, useMemo, useState } from "react";
import { ChevronDown, List } from "lucide-react";

export type TocItem = { id: string; text: string; level: 2 | 3 };

const slugify = (raw: string) =>
  raw
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);

/**
 * Parses an HTML string and returns headings (h2/h3) with stable IDs.
 * Also returns the rewritten HTML where each heading has an id attribute
 * the TOC links can target. Pure — safe to call during render.
 */
export const buildToc = (html: string): { items: TocItem[]; html: string } => {
  if (typeof window === "undefined" || !html) return { items: [], html };
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const container = doc.body.firstElementChild as HTMLElement | null;
  if (!container) return { items: [], html };
  const items: TocItem[] = [];
  const used = new Set<string>();
  container.querySelectorAll("h2, h3").forEach((node) => {
    const tag = node.tagName.toLowerCase();
    const level: 2 | 3 = tag === "h2" ? 2 : 3;
    const text = node.textContent?.trim() ?? "";
    if (!text) return;
    let id = node.id || slugify(text);
    if (!id) return;
    let suffix = 2;
    const base = id;
    while (used.has(id)) {
      id = `${base}-${suffix++}`;
    }
    used.add(id);
    node.setAttribute("id", id);
    items.push({ id, text, level });
  });
  return { items, html: container.innerHTML };
};

const useActiveHeading = (ids: string[]) => {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  useEffect(() => {
    if (!ids.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: [0, 1] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids.join("|")]);
  return active;
};

const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
  e.preventDefault();
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top, behavior: "smooth" });
  history.replaceState(null, "", `#${id}`);
};

export const TableOfContents = ({ items }: { items: TocItem[] }) => {
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const active = useActiveHeading(ids);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (items.length < 2) return null;

  return (
    <>
      {/* Desktop sticky sidebar */}
      <aside className="hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-auto pr-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          On this page
        </p>
        <ul className="space-y-1.5 text-sm border-l border-border">
          {items.map((item) => (
            <li
              key={item.id}
              className={item.level === 3 ? "pl-6" : "pl-4"}
            >
              <a
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                className={`-ml-px block border-l-2 py-1 leading-snug transition ${
                  active === item.id
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </aside>

      {/* Mobile collapsible TOC */}
      <div className="lg:hidden mb-6 rounded-lg border border-border bg-card">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium"
        >
          <span className="inline-flex items-center gap-2">
            <List className="h-4 w-4 text-primary" /> Table of contents
          </span>
          <ChevronDown
            className={`h-4 w-4 transition ${mobileOpen ? "rotate-180" : ""}`}
          />
        </button>
        {mobileOpen && (
          <ul className="border-t border-border px-4 py-3 space-y-1.5 text-sm">
            {items.map((item) => (
              <li
                key={item.id}
                className={item.level === 3 ? "pl-4" : ""}
              >
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    setMobileOpen(false);
                    handleClick(e, item.id);
                  }}
                  className={`block py-1 ${
                    active === item.id ? "text-primary font-medium" : "text-foreground/80"
                  }`}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default TableOfContents;
