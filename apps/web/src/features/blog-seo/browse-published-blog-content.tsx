import React from "react";
import { BrowsePublishedBlogContentService } from "../../../../api/src/features/blog-seo/browse-published-blog-content.service";
import { InMemoryBlogRepository } from "../../../../api/src/features/blog-seo/blogRepository";
import { createBlogBrowseAuditEvent } from "../../../../api/src/features/blog-seo/browse-published-blog-content.telemetry";
import { createBlogSeoHealthEvent } from "./telemetry";
import type { BrowsePublishedBlogContentResult } from "../../../../api/src/features/blog-seo/browse-published-blog-content.types";

const repository = new InMemoryBlogRepository();
const service = new BrowsePublishedBlogContentService(repository);

type BlogIndexPageProps = Readonly<{
  result?: BrowsePublishedBlogContentResult;
}>;

export function BrowsePublishedBlogContentPage({
  result
}: BlogIndexPageProps): React.JSX.Element {
  const auditEvent = createBlogBrowseAuditEvent("success", {
    route: "/blog",
    total: result?.total ?? 0
  });

  const healthEvent = createBlogSeoHealthEvent("blog-index-available", "success", {
    route: "/blog",
    hasEntries: (result?.entries.length ?? 0) > 0
  });

  return (
    <main
      aria-label="Blog index"
      data-audit-event={auditEvent.eventName}
      data-health-event={healthEvent.eventName}
    >
      <h1>Blog</h1>
      {result && result.entries.length > 0 ? (
        <>
          <ul aria-label="Published blog posts">
            {result.entries.map((entry) => (
              <li key={entry.slug}>
                <a href={`/blog/${entry.slug}`}>
                  <span data-testid="entry-slug">{entry.slug}</span>
                </a>
                <time dateTime={entry.publishedAt}>{entry.publishedAt}</time>
                <span data-testid="entry-category">{entry.category}</span>
              </li>
            ))}
          </ul>
          {result.hasMore && (
            <nav aria-label="Pagination">
              <a href={`/blog?page=${result.currentPage + 1}`}>Next page</a>
            </nav>
          )}
        </>
      ) : (
        <p>No published posts yet.</p>
      )}
    </main>
  );
}
