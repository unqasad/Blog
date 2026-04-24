import { Link } from "react-router-dom";
import { CATEGORIES } from "@/lib/categories";

export const SiteFooter = () => {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="container py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-serif text-2xl tracking-tight">Affiliate Compass</p>
          <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
            A modern publication on monetization, traffic, content strategy, and performance
            systems for builders who want sustainable online results.
          </p>
        </div>

        <div>
          <h4 className="font-serif text-base mb-3">Categories</h4>
          <ul className="space-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to={`/category/${c.slug}`} className="text-muted-foreground hover:text-foreground transition">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-base mb-3">Site</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
            <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
            <li><Link to="/category/tools-resources" className="text-muted-foreground hover:text-foreground">Recommended Tools</Link></li>
            <li><Link to="/affiliate-disclosure" className="text-muted-foreground hover:text-foreground">Affiliate Disclosure</Link></li>
            <li><Link to="/disclaimer" className="text-muted-foreground hover:text-foreground">Disclaimer</Link></li>
            <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
            <li><Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms & Conditions</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container py-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Affiliate Compass. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
