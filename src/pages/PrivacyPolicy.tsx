import StaticPage from "@/components/StaticPage";

const PrivacyPolicy = () => (
  <StaticPage
    title="Privacy Policy"
    description="How Affiliate Compass collects, uses, and protects your data."
    path="/privacy-policy"
  >
    <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>
    <p>This Privacy Policy describes how Affiliate Compass ("we", "us") collects, uses, and protects information when you visit our website.</p>
    <h2>Information we collect</h2>
    <ul>
      <li><strong>Usage data:</strong> pages visited, referrer, device type, approximate location, and similar non-identifying analytics.</li>
      <li><strong>Voluntary data:</strong> any information you submit via contact forms or email.</li>
    </ul>
    <h2>Cookies and tracking</h2>
    <p>We may use cookies and similar technologies for analytics and to understand how readers use the site. You can disable cookies in your browser settings.</p>
    <h2>Third-party services</h2>
    <p>We may use third-party analytics, advertising, or affiliate networks. These services may collect data subject to their own privacy policies.</p>
    <h2>Affiliate links</h2>
    <p>Some links on this site are affiliate links. When you click them, the destination merchant may set cookies to attribute a potential purchase to us. See our <a href="/affiliate-disclosure">Affiliate Disclosure</a>.</p>
    <h2>Your rights</h2>
    <p>Depending on your jurisdiction, you may have rights to access, correct, or delete personal data we hold about you. Contact us to exercise these rights.</p>
    <h2>Contact</h2>
    <p>For privacy questions, reach us via the <a href="/contact">Contact page</a>.</p>
  </StaticPage>
);
export default PrivacyPolicy;
