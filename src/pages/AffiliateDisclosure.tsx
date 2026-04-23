import StaticPage from "@/components/StaticPage";

const AffiliateDisclosure = () => (
  <StaticPage
    title="Affiliate Disclosure"
    description="How Affiliate Compass uses affiliate links and how we maintain editorial independence."
    path="/affiliate-disclosure"
  >
    <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>
    <p>Affiliate Compass participates in affiliate programs. Some links on this site are affiliate links, which means that if you click them and make a purchase or sign up, we may earn a commission at no extra cost to you.</p>
    <h2>Why we use affiliate links</h2>
    <p>Affiliate commissions help us keep the site free, ad-light, and editorially independent. They allow us to spend time researching and writing in-depth guides instead of chasing sponsorships.</p>
    <h2>Our editorial standards</h2>
    <ul>
      <li>We only recommend products and networks we believe are useful for the audience of the article.</li>
      <li>Our recommendations are not influenced by commission rates.</li>
      <li>We disclose affiliate relationships clearly above the first affiliate link in each article.</li>
      <li>We will say when a product is <em>not</em> a fit, even if it pays us.</li>
    </ul>
    <h2>FTC and global compliance</h2>
    <p>This disclosure is intended to comply with the U.S. Federal Trade Commission's guidelines and similar regulations in other jurisdictions regarding endorsements and material connections.</p>
    <h2>Questions</h2>
    <p>If you have questions about our affiliate practices, contact us via the <a href="/contact">Contact page</a>.</p>
  </StaticPage>
);
export default AffiliateDisclosure;
