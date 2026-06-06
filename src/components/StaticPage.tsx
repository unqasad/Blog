import SiteLayout from "@/components/SiteLayout";
import Seo from "@/components/Seo";
import { ReactNode } from "react";

export const StaticPage = ({
  title,
  description,
  path,
  children,
}: {
  title: string;
  description: string;
  path: string;
  children: ReactNode;
}) => (
  <SiteLayout>
    <Seo title={`${title} — AI Compass`} description={description} canonicalPath={path} />
    <article className="container max-w-3xl py-10 md:py-14">
      <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight">{title}</h1>
      <div className="prose-article mt-6">{children}</div>
    </article>
  </SiteLayout>
);

export default StaticPage;
