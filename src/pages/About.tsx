import StaticPage from "@/components/StaticPage";

const About = () => (
  <StaticPage
    title="About"
    description="AI Compass is an independent publication covering AI tools, tutorials, automation, and productivity for people who actually use this stuff at work."
    path="/about"
  >
    <p className="lead text-lg leading-relaxed text-foreground">
      AI Compass is an independent publication about AI tools, tutorials, automation,
      and productivity. We write for the people who actually use this software at work —
      creators, freelancers, students, and small teams.
    </p>
    <p>
      Our bias is toward clarity. We test the tools, document what works, flag what
      doesn't, and skip the marketing language. If a workflow isn't worth your time,
      we'll say so.
    </p>

    <h2>What you'll find here</h2>
    <ul>
      <li>Honest reviews and head-to-head comparisons of AI tools</li>
      <li>Automation playbooks for content, ops, and everyday busywork</li>
      <li>Productivity systems that hold up outside the screenshot</li>
      <li>Practical workflows, not toy demos</li>
    </ul>

    <p>
      Spotted something outdated or unclear?{" "}
      <a href="/contact#contact-form">Get in touch</a> and we'll review it.
    </p>
  </StaticPage>
);
export default About;
