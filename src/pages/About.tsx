import StaticPage from "@/components/StaticPage";

const About = () => (
  <StaticPage
    title="About AI Compass"
    description="AI Compass is a modern publication helping creators, freelancers, students, and remote professionals get more done with AI tools, automation, and better workflows."
    path="/about"
  >
    <p className="lead text-lg leading-relaxed text-foreground">
      AI Compass is a modern publication on AI tools, automation, and productivity. We
      help creators, freelancers, students, and digital professionals understand the
      modern AI stack and turn it into real, repeatable workflows.
    </p>
    <p>
      Our goal is clarity, not hype. We test, compare, and document what actually works —
      so you can spend less time evaluating tools and more time shipping the work that
      matters.
    </p>

    <h2>What we cover</h2>
    <ul>
      <li>Educational content, guides, tutorials, and honest reviews of AI tools, free utilities, and the best browser extensions</li>
      <li>Hands-on tutorials for ChatGPT, Claude, Gemini, and Notion AI</li>
      <li>Prompt engineering, AI workflows, and content automation</li>
      <li>No-code automation for creators, teams, and solo operators</li>
      <li>Productivity systems, focus tools, and time-management playbooks</li>
      <li>Remote work efficiency and digital workflow design</li>
    </ul>

    <h2>Our editorial standards</h2>
    <ul>
      <li>Every tool and workflow we recommend is one we've personally used in real projects, not just skimmed from a landing page.</li>
      <li>We don't publish hype, fake productivity claims, or "secret method" framing.</li>
      <li>We explain tradeoffs, limitations, and who a tool is and isn't for.</li>
      <li>We prefer evergreen, problem-solving guides over breaking-news churn.</li>
      <li>We update articles when tools change in ways that matter.</li>
    </ul>

    <p>
      Spotted something outdated or unclear?{" "}
      <a href="/contact#contact-form">Get in touch</a> and we'll review it.
    </p>
  </StaticPage>
);
export default About;
