import React from "react";
import { DiscoverContentByTopicAndDateService } from "../../../../api/src/features/blog-seo/discover-content-by-topic-and-date.service";
import { InMemoryBlogRepository } from "../../../../api/src/features/blog-seo/blogRepository";
import { createBlogDiscoveryAuditEvent } from "../../../../api/src/features/blog-seo/discover-content-by-topic-and-date.telemetry";
import { createBlogSeoHealthEvent } from "./telemetry";
import type { DiscoverByTopicAndDateResult } from "../../../../api/src/features/blog-seo/discover-content-by-topic-and-date.types";

const repository = new InMemoryBlogRepository();
const service = new DiscoverContentByTopicAndDateService(repository);

type DiscoverPageProps = Readonly<{
  result?: DiscoverByTopicAndDateResult;
}>;

export function DiscoverContentByTopicAndDatePage({
  result
}: DiscoverPageProps): React.JSX.Element {
  const appliedTag = result?.appliedFilters.tag;
  const appliedCategory = result?.appliedFilters.category;

  const auditEvent = createBlogDiscoveryAuditEvent("success", {
    tag: appliedTag ?? "",
    category: appliedCategory ?? "",
    resultCount: result?.entries.length ?? 0
  });

  const healthEvent = createBlogSeoHealthEvent("blog-index-available", "success", {
    route: "/blog",
    filtered: !!(appliedTag || appliedCategory)
  });

  return (
    <main
      aria-label="Discover blog content"
      data-audit-event={auditEvent.eventName}
      data-health-event={healthEvent.eventName}
    >
      <h1>Discover</h1>
      {(appliedTag || appliedCategory) && (
        <p data-testid="active-filters">
          {appliedTag && <span>Tag: {appliedTag}</span>}
          {appliedCategory && <span>Category: {appliedCategory}</span>}
        </p>
      )}
      {result && result.entries.length > 0 ? (
        <ul aria-label="Filtered blog posts">
          {result.entries.map((entry) => (
            <li key={entry.slug}>
              <a href={`/blog/${entry.slug}`}>{entry.slug}</a>
              <span data-testid="entry-category">{entry.category}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No posts match the selected filters.</p>
      )}
    </main>
  );
}
