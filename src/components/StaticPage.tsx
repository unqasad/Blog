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
    <Seo title={`${title} — Affiliate Compass`} description={description} canonicalPath={path} />
    <article className="container max-w-3xl py-12 md:py-16">
      <h1 className="font-serif text-4xl md:text-5xl tracking-tight">{title}</h1>
      <div className="prose-article mt-8">{children}</div>
    </article>
  </SiteLayout>
);

export default StaticPage;
