import StaticPage from "@/components/StaticPage";

const Disclaimer = () => (
  <StaticPage
    title="Disclaimer"
    description="Important disclaimers regarding the educational content on AI Compass."
    path="/disclaimer"
  >
    <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>
    <p>The content on AI Compass is provided for informational and educational purposes only. While we strive for accuracy, we make no representations or warranties about the completeness, reliability, or suitability of the information.</p>
    <h2>No guarantees of results</h2>
    <p>Nothing on this site should be interpreted as a guarantee of productivity gains, business outcomes, or income. AI tools and workflows are evolving rapidly and your results will depend on your context, inputs, and execution.</p>
    <h2>Not professional advice</h2>
    <p>Content on this site is not financial, legal, tax, or business advice. Consult qualified professionals for your specific situation.</p>
    <h2>Third-party tools</h2>
    <p>Mentions of AI tools, platforms, or services do not imply endorsement of every aspect of those services. Always review the provider's own terms, privacy policy, and data-handling practices before use.</p>
    <h2>Use at your own risk</h2>
    <p>By using this site, you acknowledge that any actions you take based on its content are your own responsibility.</p>
  </StaticPage>
);
export default Disclaimer;
