import StaticPage from "@/components/StaticPage";

const Terms = () => (
  <StaticPage
    title="Terms"
    description="The terms that apply when you use AI Compass."
    path="/terms"
  >
    <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>
    <p>By using AI Compass, you agree to these terms. If you don't, please don't use the site.</p>

    <h2>Using our content</h2>
    <p>Articles are for informational and educational use. Short excerpts with attribution and a link back are fine. Don't republish full articles without permission.</p>

    <h2>No professional advice</h2>
    <p>Our content is general information, not financial, legal, or other professional advice. For your specific situation, talk to a qualified professional.</p>

    <h2>Results aren't guaranteed</h2>
    <p>AI tools and workflows change quickly. We can't promise specific productivity, business, or income outcomes from anything you read here.</p>

    <h2>Third-party tools</h2>
    <p>Mentioning a tool isn't an endorsement of every part of it. Review the provider's own terms and privacy practices before using it.</p>

    <h2>Liability</h2>
    <p>To the maximum extent permitted by law, AI Compass isn't liable for any damages from your use of the site or its content.</p>

    <h2>Changes</h2>
    <p>We may update these terms. Continued use of the site means you accept the current version.</p>
  </StaticPage>
);
export default Terms;
