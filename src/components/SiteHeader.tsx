import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Left: logo */}
        <Link to="/" className="flex items-center gap-2 group justify-self-start" aria-label="AI Compass — home">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-soft transition group-hover:bg-primary-glow">
            <Compass className="h-5 w-5" />
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight">
            AI Compass
          </span>
        </Link>

        {/* Center: primary nav */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-7 text-sm justify-self-center">
          <Link to="/category/ai-tools" className="text-muted-foreground hover:text-foreground transition">AI Tools</Link>
          <Link to="/category/automation" className="text-muted-foreground hover:text-foreground transition">Automation</Link>
          <Link to="/category/productivity" className="text-muted-foreground hover:text-foreground transition">Productivity</Link>
          <Link to="/category/comparisons" className="text-muted-foreground hover:text-foreground transition">Comparisons</Link>
        </nav>

        {/* Right: About */}
        <div className="hidden md:flex justify-self-end">
          <Link
            to="/about"
            className="text-sm font-medium text-foreground hover:text-primary transition"
          >
            About
          </Link>
        </div>

        <div className="md:hidden col-start-3" />
      </div>
    </header>
  );
};

export default SiteHeader;
