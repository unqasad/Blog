import { Link } from "react-router-dom";
import { CATEGORIES } from "@/lib/categories";

export const SiteFooter = () => {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/40">
      <div className="container py-8 grid gap-6 md:grid-cols-12 md:items-start">
        <div className="md:col-span-5">
          <p className="font-serif text-lg tracking-tight">AI Compass</p>
          <p className="mt-1.5 max-w-md text-sm text-muted-foreground leading-relaxed">
            A modern publication on AI tools, automation, and productivity.
          </p>
        </div>

        <nav aria-label="Categories" className="md:col-span-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Categories</h4>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to={`/category/${c.slug}`} className="text-muted-foreground hover:text-foreground transition">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Site" className="md:col-span-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Site</h4>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
            <li><Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
            <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
            <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground">Privacy</Link></li>
            <li><Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="container py-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} AI Compass. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
