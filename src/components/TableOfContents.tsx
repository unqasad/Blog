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

// Heading texts that are internal subsections and should never appear in the
// TOC for long-form list / comparison articles. Matched case-insensitively.
const TOC_EXCLUDE_PATTERNS: RegExp[] = [
  /^key\s+strengths?$/i,
  /^pros$/i,
  /^cons$/i,
  /^pros\s*(&|and|\/)\s*cons$/i,
  /^bottom\s+line$/i,
  /^features?$/i,
  /^pricing$/i,
  /^verdict$/i,
  /^summary$/i,
  /^who\s+it'?s\s+for$/i,
  /^use\s+cases?$/i,
  /^limitations?$/i,
];

const shouldExclude = (text: string, el: Element): boolean => {
  if (el.getAttribute("data-toc") === "exclude") return true;
  if (el.classList.contains("toc-exclude")) return true;
  if (el.getAttribute("data-toc") === "include") return false;
  if (el.classList.contains("toc-include")) return false;
  return TOC_EXCLUDE_PATTERNS.some((re) => re.test(text.trim()));
};

/**
 * Parses an HTML string and returns headings (h2/h3) with stable IDs.
 * Returns the rewritten HTML where each heading has an id attribute the
 * TOC links can target. Pure — safe to call during render.
 *
 * Boilerplate subsection headings (Pros, Cons, Bottom Line, …) get an id so
 * inline anchors still work, but are filtered out of the rendered TOC.
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
    if (shouldExclude(text, node)) return;
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
      {/* Desktop: narrow sticky rail that expands on hover */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 self-start">
          <div className="group/toc relative">
            {/* Collapsed rail: tick marks per section. Expands into a full panel on hover. */}
            <div
              className="w-10 group-hover/toc:w-72 transition-[width] duration-300 ease-out
                         rounded-md border border-transparent group-hover/toc:border-border
                         group-hover/toc:bg-background/95 group-hover/toc:shadow-card
                         group-hover/toc:backdrop-blur
                         overflow-hidden max-h-[calc(100vh-7rem)] group-hover/toc:overflow-auto"
            >
              <p className="hidden group-hover/toc:block px-4 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                On this page
              </p>
              <ul className="py-3 group-hover/toc:px-4 space-y-1 text-sm border-l border-border group-hover/toc:border-l-0">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className={item.level === 3 ? "group-hover/toc:pl-4" : ""}
                  >
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => handleClick(e, item.id)}
                      title={item.text}
                      className={`-ml-px flex items-center border-l-2 py-1.5 leading-snug transition
                                  group-hover/toc:border-l-2
                                  ${
                                    active === item.id
                                      ? "border-primary text-primary font-medium"
                                      : "border-transparent text-muted-foreground hover:text-foreground group-hover/toc:hover:border-border"
                                  }`}
                    >
                      {/* Rail tick (visible when collapsed) */}
                      <span
                        className={`block h-px w-4 ml-2 group-hover/toc:hidden ${
                          active === item.id ? "bg-primary" : "bg-border"
                        } ${item.level === 3 ? "w-2 ml-4" : ""}`}
                        aria-hidden
                      />
                      {/* Full label (visible on hover) */}
                      <span className="hidden group-hover/toc:block pl-3 pr-2 truncate">
                        {item.text}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
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
