import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-soft transition group-hover:bg-primary-glow">
            <Compass className="h-5 w-5" />
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight">
            Affiliate Compass
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/category/start-here" className="text-muted-foreground hover:text-foreground transition">Start Here</Link>
          <Link to="/category/offer-selection" className="text-muted-foreground hover:text-foreground transition">Offers</Link>
          <Link to="/category/tracking" className="text-muted-foreground hover:text-foreground transition">Tracking</Link>
          <Link to="/category/conversion" className="text-muted-foreground hover:text-foreground transition">Conversions</Link>
          <Link to="/category/traffic-funnels" className="text-muted-foreground hover:text-foreground transition">Traffic</Link>
          <Link to="/category/compliance-seo" className="text-muted-foreground hover:text-foreground transition">Compliance & SEO</Link>
        </nav>

        <Link
          to="/about"
          className="hidden md:inline-flex items-center text-sm font-medium text-primary hover:text-primary-glow transition"
        >
          About
        </Link>
      </div>
    </header>
  );
};

export default SiteHeader;
