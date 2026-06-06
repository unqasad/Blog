import StaticPage from "@/components/StaticPage";

const PrivacyPolicy = () => (
  <StaticPage
    title="Privacy Policy"
    description="How AI Compass handles your data."
    path="/privacy-policy"
  >
    <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>
    <p>This page explains what AI Compass collects when you visit the site and how we use it.</p>

    <h2>What we collect</h2>
    <ul>
      <li><strong>Usage data:</strong> pages visited, referrer, device type, and approximate location for analytics.</li>
      <li><strong>What you send us:</strong> anything you submit through the contact form or by email.</li>
    </ul>

    <h2>Cookies</h2>
    <p>We use cookies for basic analytics. You can disable them in your browser settings.</p>

    <h2>Third parties</h2>
    <p>We may use third-party analytics providers, which handle data under their own privacy policies.</p>

    <h2>Your rights</h2>
    <p>Depending on where you live, you may have rights to access, correct, or delete data we hold about you. <a href="/contact">Contact us</a> and we'll handle it.</p>
  </StaticPage>
);
export default PrivacyPolicy;
