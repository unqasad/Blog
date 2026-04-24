import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const NextStepCta = ({
  title = "Get the next practical guide",
  description = "Browse our beginner-friendly Start Here hub or jump straight into offer evaluation.",
  primary = { label: "Start Here", to: "/category/start-here" },
  secondary = { label: "Offers & Earnings", to: "/category/offers-earnings" },
}: {
  title?: string;
  description?: string;
  primary?: { label: string; to: string };
  secondary?: { label: string; to: string };
}) => (
  <aside className="not-prose mt-12 rounded-xl border border-border bg-gradient-hero p-6 md:p-8 shadow-soft">
    <p className="font-serif text-2xl tracking-tight">{title}</p>
    <p className="mt-2 text-muted-foreground">{description}</p>
    <div className="mt-5 flex flex-wrap gap-3">
      <Link
        to={primary.to}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:bg-primary-glow transition"
      >
        {primary.label} <ArrowRight className="h-4 w-4" />
      </Link>
      <Link
        to={secondary.to}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-primary/40 transition"
      >
        {secondary.label}
      </Link>
    </div>
  </aside>
);

export default NextStepCta;
