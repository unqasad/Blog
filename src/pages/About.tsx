import StaticPage from "@/components/StaticPage";

const About = () => (
  <StaticPage
    title="About Affiliate Compass"
    description="Affiliate Compass is a practical, no-hype publication helping readers understand affiliate marketing, CPA, traffic, tracking, funnels, and conversion strategy with greater clarity."
    path="/about"
  >
    <p className="lead text-lg leading-relaxed text-foreground">
      Affiliate Compass exists to bring clarity to online monetization. In a space crowded
      with hype, recycled advice, and unrealistic promises, we publish practical,
      well-structured guidance for readers who want to understand affiliate marketing,
      CPA marketing, traffic, tracking, funnels, and conversion strategy with greater
      confidence.
    </p>
    <p>
      We focus on decision-making, not hype. Our goal is to help beginners and developing
      marketers evaluate opportunities more carefully, build stronger systems, and improve
      performance over time.
    </p>

    <h2>What we cover</h2>
    <ul>
      <li>Foundational guides for affiliate and CPA beginners</li>
      <li>Offer evaluation, payout models, networks, and red flags</li>
      <li>Tracking, attribution, and campaign measurement</li>
      <li>Landing pages, funnels, and conversion optimization</li>
      <li>Traffic strategy across paid and organic channels</li>
      <li>SEO, trust, compliance, and sustainable monetization</li>
      <li>Tools and resources that support online growth</li>
    </ul>

    <h2>Our editorial standards</h2>
    <ul>
      <li>We do not publish fabricated income claims, screenshots, or testimonials.</li>
      <li>We do not use “secret method” or shortcut-based framing.</li>
      <li>We explain tradeoffs, limitations, and context as clearly as possible.</li>
      <li>
        We use affiliate disclosures where relevant and separate monetization from
        editorial judgment.
      </li>
      <li>
        When a recommendation includes a tool or service, we aim to explain who it is for,
        where it fits, and what its limitations are.
      </li>
      <li>
        When a factual claim needs verification, we prefer reputable sources and update
        content when needed.
      </li>
    </ul>

    <p>
      We welcome corrections. If you believe something on this site is unclear, outdated,
      or misleading, <a href="/contact">contact us</a> and we will review it promptly.
    </p>
  </StaticPage>
);
export default About;
