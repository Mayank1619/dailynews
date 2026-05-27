import React from "react";
import { SearchEngineFriendlyBlogSurfaceService } from "../../../../api/src/features/blog-seo/search-engine-friendly-blog-surface.service";
import { InMemoryBlogRepository } from "../../../../api/src/features/blog-seo/blogRepository";
import { createSeoAuditEvent } from "../../../../api/src/features/blog-seo/search-engine-friendly-blog-surface.telemetry";
import { createBlogSeoHealthEvent } from "./telemetry";
import type { SeoMetadata } from "../../../../api/src/features/blog-seo/schema";

const repository = new InMemoryBlogRepository();
const service = new SearchEngineFriendlyBlogSurfaceService(repository);

type SeoHeadProps = Readonly<{
  seo: SeoMetadata;
}>;

export function BlogSeoHead({ seo }: SeoHeadProps): React.JSX.Element {
  const auditEvent = createSeoAuditEvent("seo-metadata-generated", "success", {
    route: seo.route,
    canonicalUrl: seo.canonicalUrl
  });

  const healthEvent = createBlogSeoHealthEvent(
    "seo-metadata-generated",
    "success",
    { route: seo.route }
  );

  return (
    <head
      data-audit-event={auditEvent.eventName}
      data-health-event={healthEvent.eventName}
    >
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={seo.canonicalUrl} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={seo.canonicalUrl} />
      <meta property="og:image" content={seo.ogImage} />
      <meta name="robots" content={seo.robots} />
    </head>
  );
}
