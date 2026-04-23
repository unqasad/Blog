import StaticPage from "@/components/StaticPage";

const Disclaimer = () => (
  <StaticPage
    title="Disclaimer"
    description="Important disclaimers regarding the educational content on Affiliate Compass."
    path="/disclaimer"
  >
    <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>
    <p>The content on Affiliate Compass is provided for informational and educational purposes only. While we strive for accuracy, we make no representations or warranties about the completeness, reliability, or suitability of the information.</p>
    <h2>No income guarantees</h2>
    <p>Nothing on this site should be interpreted as a guarantee of income or business results. Affiliate and CPA marketing involves real costs, risk, and effort. Most beginners do not earn meaningful income in their first months. Your results depend on factors we cannot control.</p>
    <h2>Not professional advice</h2>
    <p>Content on this site is not financial, legal, tax, or business advice. Consult qualified professionals for your specific situation.</p>
    <h2>Third-party tools and offers</h2>
    <p>Mentions of tools, networks, or offers do not imply endorsement of every aspect of those services. Always evaluate independently before making decisions.</p>
    <h2>Use at your own risk</h2>
    <p>By using this site, you acknowledge that any actions you take based on its content are your own responsibility.</p>
  </StaticPage>
);
export default Disclaimer;
