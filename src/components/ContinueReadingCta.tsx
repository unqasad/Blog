import { ArrowRight } from "lucide-react";

const ADSTERRA_URL =
  "https://www.profitablecpmratenetwork.com/u3iiz1x3p?key=d95a5062d8faf9e9c6c0344032621adf";

export const ContinueReadingCta = ({
  variant = "inline",
}: {
  variant?: "inline" | "end";
}) => {
  const label =
    variant === "end"
      ? "Continue reading related insights"
      : "Continue reading";

  return (
    <aside
      className="not-prose my-10 flex flex-col items-start gap-3 rounded-lg border border-border bg-card px-5 py-5 shadow-soft sm:flex-row sm:items-center sm:justify-between"
      aria-label="Recommended reading"
    >
      <div>
        <p className="font-serif text-lg leading-snug text-foreground">
          {variant === "end"
            ? "Want more practical guides like this?"
            : "Enjoying this article?"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Explore more hand-picked resources curated for affiliate marketers.
        </p>
      </div>
      <a
        href={ADSTERRA_URL}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition hover:bg-primary-glow"
      >
        {label} <ArrowRight className="h-4 w-4" />
      </a>
    </aside>
  );
};

export default ContinueReadingCta;
