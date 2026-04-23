import { Helmet } from "react-helmet-async";

type SeoProps = {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string;
  type?: "website" | "article";
  publishedAt?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

export const Seo = ({
  title,
  description,
  canonicalPath,
  image,
  type = "website",
  publishedAt,
  jsonLd,
}: SeoProps) => {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}${canonicalPath ?? window.location.pathname}`
      : canonicalPath ?? "/";

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}
      {publishedAt && <meta property="article:published_time" content={publishedAt} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default Seo;
