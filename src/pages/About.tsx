import StaticPage from "@/components/StaticPage";

const About = () => (
  <StaticPage
    title="About Affiliate Compass"
    description="Affiliate Compass is a no-hype publication that helps beginners and struggling marketers understand affiliate and CPA marketing."
    path="/about"
  >
    <p>Affiliate Compass exists because most "make money online" content is either hype or too vague to act on. We write practical, calm, fact-based guides for people who want to understand affiliate and CPA marketing — not be sold a dream.</p>
    <h2>What we cover</h2>
    <ul>
      <li>Affiliate and CPA fundamentals for beginners</li>
      <li>Offer selection, networks, and red flags</li>
      <li>Tracking and attribution that actually works</li>
      <li>Conversion optimization for landing pages and funnels</li>
      <li>Traffic strategy, paid and organic</li>
      <li>Compliance, SEO, and long-term monetization</li>
    </ul>
    <h2>Our editorial principles</h2>
    <ul>
      <li>No fabricated income claims, screenshots, or testimonials.</li>
      <li>No fake urgency or "secret method" framing.</li>
      <li>Honest tradeoffs over one-winner-fits-all recommendations.</li>
      <li>Clear affiliate disclosures wherever they apply.</li>
    </ul>
    <p>If you ever spot a claim on this site that you think is misleading, please <a href="/contact">tell us</a>. We will investigate and correct.</p>
  </StaticPage>
);
export default About;
