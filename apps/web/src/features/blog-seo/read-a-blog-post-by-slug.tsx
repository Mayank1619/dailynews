import React from "react";
import { ReadBlogPostBySlugService } from "../../../../api/src/features/blog-seo/read-a-blog-post-by-slug.service";
import { InMemoryBlogRepository } from "../../../../api/src/features/blog-seo/blogRepository";
import { createBlogPostAuditEvent } from "../../../../api/src/features/blog-seo/read-a-blog-post-by-slug.telemetry";
import { createBlogSeoHealthEvent } from "./telemetry";
import type { BlogPost } from "../../../../api/src/features/blog-seo/schema";

const repository = new InMemoryBlogRepository();
const service = new ReadBlogPostBySlugService(repository);

type BlogPostPageProps = Readonly<{
  post?: BlogPost | null;
  slug?: string;
}>;

export function ReadBlogPostBySlugPage({
  post,
  slug = ""
}: BlogPostPageProps): React.JSX.Element {
  const found = post != null;

  const auditEvent = createBlogPostAuditEvent(found ? "success" : "warning", {
    slug,
    found
  });

  const healthEvent = createBlogSeoHealthEvent(
    "blog-post-available",
    found ? "success" : "warning",
    { route: `/blog/${slug}`, found }
  );

  if (!found) {
    return (
      <main
        aria-label="Blog post not found"
        data-audit-event={auditEvent.eventName}
        data-health-event={healthEvent.eventName}
      >
        <h1>Post not found</h1>
        <a href="/blog">Back to blog</a>
      </main>
    );
  }

  return (
    <main
      aria-label="Blog post"
      data-audit-event={auditEvent.eventName}
      data-health-event={healthEvent.eventName}
      data-seo-canonical={post.canonicalUrl}
    >
      <article>
        <h1>{post.title}</h1>
        <p data-testid="excerpt">{post.excerpt}</p>
        <time dateTime={post.publishedAt}>{post.publishedAt}</time>
        <div data-testid="body">{post.body}</div>
        <ul aria-label="Tags">
          {post.tags.map((tag) => (
            <li key={tag}>
              <a href={`/blog?tag=${encodeURIComponent(tag)}`}>{tag}</a>
            </li>
          ))}
        </ul>
      </article>
    </main>
  );
}
