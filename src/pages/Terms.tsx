import StaticPage from "@/components/StaticPage";

const Terms = () => (
  <StaticPage
    title="Terms and Conditions"
    description="The terms and conditions that govern your use of Affiliate Compass."
    path="/terms"
  >
    <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>
    <p>By accessing Affiliate Compass you agree to these Terms and Conditions. If you do not agree, please do not use the site.</p>
    <h2>Use of content</h2>
    <p>All content is for informational and educational purposes. You may share short excerpts with attribution and a link to the original article. You may not republish full articles without written permission.</p>
    <h2>No professional advice</h2>
    <p>Articles on this site are general information. They are not financial, legal, or professional advice. Consult a qualified professional for your specific situation.</p>
    <h2>Third-party content</h2>
    <p>We may link to third-party websites and services. We are not responsible for their content, accuracy, or practices.</p>
    <h2>Limitation of liability</h2>
    <p>To the maximum extent permitted by law, Affiliate Compass is not liable for any damages arising from your use of the site or reliance on its content.</p>
    <h2>Changes</h2>
    <p>We may update these terms at any time. Continued use of the site means you accept the updated terms.</p>
  </StaticPage>
);
export default Terms;
