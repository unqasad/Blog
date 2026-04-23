import StaticPage from "@/components/StaticPage";

const Contact = () => (
  <StaticPage
    title="Contact"
    description="Get in touch with the Affiliate Compass team for editorial questions, corrections, or partnership inquiries."
    path="/contact"
  >
    <p>The fastest way to reach the editorial team is by email:</p>
    <p><strong>hello@affiliatecompass.example</strong></p>
    <p>We read every message but cannot reply to all of them. We prioritize:</p>
    <ul>
      <li>Corrections or factual errors in published articles</li>
      <li>Reader questions that may become future articles</li>
      <li>Partnership and editorial inquiries from reputable brands</li>
    </ul>
    <p>We do not accept paid guest posts, link insertions, or sponsored reviews that bypass our editorial standards.</p>
  </StaticPage>
);
export default Contact;
